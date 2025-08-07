import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  PROMPTS: 'prompts',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  FAVORITES: 'favorites'
};

// Prompts
export const createPrompt = async (promptData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.PROMPTS), {
      ...promptData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending', // pending, approved, rejected
      views: 0,
      favorites: 0,
      sales: 0,
      rating: 0,
      reviewCount: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating prompt:', error);
    throw error;
  }
};

export const getPrompt = async (promptId) => {
  try {
    const docRef = doc(db, COLLECTIONS.PROMPTS, promptId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Prompt not found');
    }
  } catch (error) {
    console.error('Error getting prompt:', error);
    throw error;
  }
};

export const getPrompts = async (filters = {}, lastDoc = null, limitCount = 12) => {
  try {
    let q = collection(db, COLLECTIONS.PROMPTS);

    // Only use the most basic query to avoid index issues
    q = query(q, where('status', '==', 'approved'));

    // For user-specific queries, add userId filter
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }

    // Simple ordering by createdAt only to avoid complex indexes
    q = query(q, orderBy('createdAt', 'desc'));

    // Apply pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    // Get more documents for client-side filtering
    const fetchLimit = limitCount * 5;
    q = query(q, limit(fetchLimit));

    const querySnapshot = await getDocs(q);
    let prompts = [];

    querySnapshot.forEach((doc) => {
      prompts.push({ id: doc.id, ...doc.data() });
    });

    // Apply ALL filters client-side
    if (filters.category) {
      prompts = prompts.filter(prompt => prompt.category === filters.category);
    }

    if (filters.aiTool) {
      prompts = prompts.filter(prompt => prompt.aiTool === filters.aiTool);
    }

    if (filters.priceRange) {
      prompts = prompts.filter(prompt => {
        const price = prompt.price || 0;
        const minPrice = filters.priceRange.min || 0;
        const maxPrice = filters.priceRange.max || 1000;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Apply client-side sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    if (sortBy !== 'createdAt') {
      prompts.sort((a, b) => {
        const aVal = a[sortBy] || 0;
        const bVal = b[sortBy] || 0;

        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    // Limit final results
    const finalPrompts = prompts.slice(0, limitCount);

    return {
      prompts: finalPrompts,
      lastDoc: querySnapshot.docs[Math.min(querySnapshot.docs.length - 1, limitCount - 1)],
      hasMore: prompts.length > limitCount
    };
  } catch (error) {
    console.error('Error getting prompts:', error);
    throw error;
  }
};

export const updatePrompt = async (promptId, updates) => {
  try {
    const docRef = doc(db, COLLECTIONS.PROMPTS, promptId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating prompt:', error);
    throw error;
  }
};

export const deletePrompt = async (promptId) => {
  try {
    const docRef = doc(db, COLLECTIONS.PROMPTS, promptId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting prompt:', error);
    throw error;
  }
};

// Increment prompt views
export const incrementPromptViews = async (promptId) => {
  try {
    const docRef = doc(db, COLLECTIONS.PROMPTS, promptId);
    await updateDoc(docRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
    throw error;
  }
};

// Favorites
export const toggleFavorite = async (userId, promptId) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const promptRef = doc(db, COLLECTIONS.PROMPTS, promptId);
    
    // Check if already favorited
    const userDoc = await getDoc(userRef);
    const favorites = userDoc.data()?.favorites || [];
    
    if (favorites.includes(promptId)) {
      // Remove from favorites
      await updateDoc(userRef, {
        favorites: arrayRemove(promptId)
      });
      await updateDoc(promptRef, {
        favorites: increment(-1)
      });
      return false;
    } else {
      // Add to favorites
      await updateDoc(userRef, {
        favorites: arrayUnion(promptId)
      });
      await updateDoc(promptRef, {
        favorites: increment(1)
      });
      return true;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

// Search prompts
export const searchPrompts = async (searchTerm, filters = {}) => {
  try {
    // Note: This is a basic implementation. For production, consider using
    // Algolia or Elasticsearch for better search capabilities
    let q = collection(db, COLLECTIONS.PROMPTS);
    
    const conditions = [
      where('status', '==', 'approved'),
      where('searchTerms', 'array-contains-any', 
        searchTerm.toLowerCase().split(' ').filter(term => term.length > 2)
      )
    ];
    
    conditions.forEach(condition => {
      q = query(q, condition);
    });
    
    q = query(q, orderBy('createdAt', 'desc'), limit(20));
    
    const querySnapshot = await getDocs(q);
    const prompts = [];
    
    querySnapshot.forEach((doc) => {
      prompts.push({ id: doc.id, ...doc.data() });
    });
    
    return prompts;
  } catch (error) {
    console.error('Error searching prompts:', error);
    throw error;
  }
};

// Categories
export const getCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    const categories = [];
    
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    
    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

// Orders
export const createOrder = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
      ...orderData,
      createdAt: serverTimestamp(),
      status: 'pending' // pending, completed, failed, refunded
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getUserOrders = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.ORDERS),
      where('buyerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToPrompts = (filters, callback) => {
  let q = collection(db, COLLECTIONS.PROMPTS);
  
  const conditions = [where('status', '==', 'approved')];
  
  if (filters.category) {
    conditions.push(where('category', '==', filters.category));
  }
  
  conditions.forEach(condition => {
    q = query(q, condition);
  });
  
  q = query(q, orderBy('createdAt', 'desc'), limit(20));
  
  return onSnapshot(q, (querySnapshot) => {
    const prompts = [];
    querySnapshot.forEach((doc) => {
      prompts.push({ id: doc.id, ...doc.data() });
    });
    callback(prompts);
  });
};
