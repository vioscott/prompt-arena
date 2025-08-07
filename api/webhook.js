// Stripe webhook handler for processing payment events
// This would be deployed as a serverless function

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin (you would need to set up service account)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handlePaymentSuccess(paymentIntent) {
  const { metadata } = paymentIntent;
  const { userId, itemIds } = metadata;
  
  if (!userId || !itemIds) {
    console.error('Missing metadata in payment intent');
    return;
  }

  const itemIdArray = itemIds.split(',');
  
  try {
    // Create order records
    const batch = db.batch();
    
    for (const itemId of itemIdArray) {
      // Get prompt details
      const promptDoc = await db.collection('prompts').doc(itemId).get();
      if (!promptDoc.exists) {
        console.error(`Prompt ${itemId} not found`);
        continue;
      }
      
      const promptData = promptDoc.data();
      
      // Create order
      const orderRef = db.collection('orders').doc();
      batch.set(orderRef, {
        promptId: itemId,
        promptTitle: promptData.title,
        buyerId: userId,
        sellerId: promptData.userId,
        amount: promptData.price,
        paymentIntentId: paymentIntent.id,
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update prompt sales count
      const promptRef = db.collection('prompts').doc(itemId);
      batch.update(promptRef, {
        sales: admin.firestore.FieldValue.increment(1)
      });
      
      // Update seller's total sales
      if (promptData.userId) {
        const sellerRef = db.collection('users').doc(promptData.userId);
        batch.update(sellerRef, {
          totalSales: admin.firestore.FieldValue.increment(1),
          totalEarnings: admin.firestore.FieldValue.increment(promptData.price * 0.8) // 80% to seller
        });
      }
    }
    
    await batch.commit();
    console.log('Payment processed successfully');
    
  } catch (error) {
    console.error('Error processing successful payment:', error);
  }
}

async function handlePaymentFailure(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  
  // You could implement failure handling here
  // such as sending notification emails, updating analytics, etc.
}
