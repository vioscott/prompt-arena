import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

// Sample prompt data for development
const samplePrompts = [
  {
    title: "Professional Email Writer",
    description: "Generate professional emails for any business situation. Perfect for customer service, sales outreach, and internal communications.",
    prompt: "Write a professional email for [SITUATION] with the following details: [DETAILS]. Make it concise, polite, and action-oriented.",
    category: "business",
    aiTool: "chatgpt",
    price: 4.99,
    imageUrl: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=300&fit=crop",
    userId: "demo-user-1",
    authorName: "Sarah Johnson",
    status: "approved",
    views: 1250,
    sales: 89,
    rating: 4.8,
    favorites: 156,
    tags: ["email", "business", "professional", "communication"],
    searchTerms: ["email", "professional", "business", "communication", "writing"]
  },
  {
    title: "Creative Story Generator",
    description: "Generate engaging short stories with compelling characters and plot twists. Great for writers looking for inspiration.",
    prompt: "Create a short story about [THEME] featuring [CHARACTER TYPE] in [SETTING]. Include a surprising plot twist and emotional depth.",
    category: "creative",
    aiTool: "chatgpt",
    price: 6.99,
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    userId: "demo-user-2",
    authorName: "Michael Chen",
    status: "approved",
    views: 2100,
    sales: 145,
    rating: 4.9,
    favorites: 203,
    tags: ["creative", "story", "writing", "fiction"],
    searchTerms: ["story", "creative", "writing", "fiction", "narrative"]
  },
  {
    title: "Cyberpunk Character Portrait",
    description: "Create stunning cyberpunk character portraits with neon lighting and futuristic aesthetics. Perfect for game design and digital art.",
    prompt: "cyberpunk character portrait, neon lighting, futuristic clothing, detailed face, glowing eyes, urban background, high tech, digital art style, 4k resolution",
    category: "image",
    aiTool: "midjourney",
    price: 8.99,
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    userId: "demo-user-3",
    authorName: "Alex Rivera",
    status: "approved",
    views: 3200,
    sales: 234,
    rating: 4.7,
    favorites: 445,
    tags: ["cyberpunk", "character", "portrait", "neon", "futuristic"],
    searchTerms: ["cyberpunk", "character", "portrait", "neon", "futuristic", "digital", "art"]
  },
  {
    title: "Python Code Optimizer",
    description: "Optimize Python code for better performance and readability. Includes best practices and efficient algorithms.",
    prompt: "Optimize this Python code for better performance and readability: [CODE]. Explain the improvements made and why they're beneficial.",
    category: "code",
    aiTool: "chatgpt",
    price: 12.99,
    imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop",
    userId: "demo-user-4",
    authorName: "David Kim",
    status: "approved",
    views: 1800,
    sales: 167,
    rating: 4.9,
    favorites: 289,
    tags: ["python", "code", "optimization", "programming"],
    searchTerms: ["python", "code", "optimization", "programming", "performance"]
  },
  {
    title: "Social Media Marketing Copy",
    description: "Create engaging social media posts that drive engagement and conversions. Works for all major platforms.",
    prompt: "Create a social media post for [PLATFORM] about [PRODUCT/SERVICE]. Include relevant hashtags, call-to-action, and engaging copy that drives [GOAL].",
    category: "marketing",
    aiTool: "chatgpt",
    price: 5.99,
    imageUrl: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400&h=300&fit=crop",
    userId: "demo-user-5",
    authorName: "Emma Thompson",
    status: "approved",
    views: 2800,
    sales: 198,
    rating: 4.6,
    favorites: 312,
    tags: ["social media", "marketing", "copy", "engagement"],
    searchTerms: ["social", "media", "marketing", "copy", "engagement", "posts"]
  },
  {
    title: "Fantasy Landscape Generator",
    description: "Generate breathtaking fantasy landscapes with magical elements. Perfect for book covers and game environments.",
    prompt: "fantasy landscape, magical forest, floating islands, mystical creatures, ethereal lighting, detailed environment, concept art style, high resolution",
    category: "image",
    aiTool: "dalle",
    price: 7.99,
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    userId: "demo-user-6",
    authorName: "Luna Martinez",
    status: "approved",
    views: 4100,
    sales: 301,
    rating: 4.8,
    favorites: 567,
    tags: ["fantasy", "landscape", "magical", "environment"],
    searchTerms: ["fantasy", "landscape", "magical", "environment", "mystical"]
  },
  {
    title: "Educational Quiz Creator",
    description: "Generate comprehensive quizzes for any subject with multiple choice, true/false, and short answer questions.",
    prompt: "Create a quiz about [SUBJECT] with [NUMBER] questions. Include multiple choice, true/false, and short answer questions with correct answers and explanations.",
    category: "education",
    aiTool: "chatgpt",
    price: 3.99,
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
    userId: "demo-user-7",
    authorName: "Professor Williams",
    status: "approved",
    views: 1600,
    sales: 123,
    rating: 4.7,
    favorites: 178,
    tags: ["education", "quiz", "learning", "assessment"],
    searchTerms: ["education", "quiz", "learning", "assessment", "questions"]
  },
  {
    title: "Minimalist Logo Design",
    description: "Create clean, minimalist logos perfect for modern brands. Focuses on simplicity and memorable design.",
    prompt: "minimalist logo design, clean lines, simple shapes, modern typography, [BRAND NAME], [INDUSTRY], professional, scalable, vector style",
    category: "image",
    aiTool: "dalle",
    price: 9.99,
    imageUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop",
    userId: "demo-user-8",
    authorName: "Design Studio Pro",
    status: "approved",
    views: 2600,
    sales: 189,
    rating: 4.9,
    favorites: 334,
    tags: ["logo", "minimalist", "design", "branding"],
    searchTerms: ["logo", "minimalist", "design", "branding", "clean"]
  },
  {
    title: "Recipe Meal Planner",
    description: "Generate weekly meal plans with recipes, shopping lists, and nutritional information. Customizable for dietary restrictions.",
    prompt: "Create a weekly meal plan for [NUMBER] people with [DIETARY RESTRICTIONS]. Include breakfast, lunch, dinner, recipes, and shopping list.",
    category: "other",
    aiTool: "chatgpt",
    price: 4.99,
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop",
    userId: "demo-user-9",
    authorName: "Chef Maria",
    status: "approved",
    views: 1900,
    sales: 156,
    rating: 4.5,
    favorites: 223,
    tags: ["recipe", "meal", "planning", "cooking"],
    searchTerms: ["recipe", "meal", "planning", "cooking", "food"]
  },
  {
    title: "JavaScript Bug Finder",
    description: "Identify and fix common JavaScript bugs and errors. Includes explanations and best practices.",
    prompt: "Analyze this JavaScript code for bugs and errors: [CODE]. Provide fixes, explanations, and suggest improvements for better code quality.",
    category: "code",
    aiTool: "chatgpt",
    price: 8.99,
    imageUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
    userId: "demo-user-10",
    authorName: "CodeMaster Dev",
    status: "approved",
    views: 2200,
    sales: 178,
    rating: 4.8,
    favorites: 267,
    tags: ["javascript", "debugging", "code", "programming"],
    searchTerms: ["javascript", "debugging", "code", "programming", "bugs"]
  }
];

// Function to seed the database
export const seedPrompts = async () => {
  try {
    console.log('Starting to seed prompts database...');
    
    const promptsCollection = collection(db, 'prompts');
    
    for (const promptData of samplePrompts) {
      const docData = {
        ...promptData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(promptsCollection, docData);
      console.log(`Added prompt: ${promptData.title}`);
    }
    
    console.log('✅ Successfully seeded prompts database!');
    console.log(`📊 Added ${samplePrompts.length} sample prompts`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Function to seed categories
export const seedCategories = async () => {
  const categories = [
    {
      id: 'text',
      name: 'Text Generation',
      description: 'ChatGPT, Claude, and other text AI prompts',
      icon: 'MessageSquare',
      color: 'text-accent-400',
      promptCount: 0
    },
    {
      id: 'image',
      name: 'Image Generation',
      description: 'Midjourney, DALL-E, Stable Diffusion prompts',
      icon: 'Image',
      color: 'text-secondary-400',
      promptCount: 0
    },
    {
      id: 'code',
      name: 'Code Generation',
      description: 'Programming and development prompts',
      icon: 'Code',
      color: 'text-accent-300',
      promptCount: 0
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Sales, advertising, and marketing prompts',
      icon: 'Megaphone',
      color: 'text-secondary-300',
      promptCount: 0
    },
    {
      id: 'creative',
      name: 'Creative Writing',
      description: 'Stories, poems, and creative content',
      icon: 'PenTool',
      color: 'text-secondary-500',
      promptCount: 0
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Professional and business prompts',
      icon: 'Briefcase',
      color: 'text-accent-500',
      promptCount: 0
    },
    {
      id: 'education',
      name: 'Education',
      description: 'Learning and educational prompts',
      icon: 'GraduationCap',
      color: 'text-accent-600',
      promptCount: 0
    },
    {
      id: 'other',
      name: 'Other',
      description: 'Miscellaneous and specialized prompts',
      icon: 'MoreHorizontal',
      color: 'text-primary-400',
      promptCount: 0
    }
  ];

  try {
    console.log('Starting to seed categories database...');
    
    const categoriesCollection = collection(db, 'categories');
    
    for (const categoryData of categories) {
      const docData = {
        ...categoryData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(categoriesCollection, docData);
      console.log(`Added category: ${categoryData.name}`);
    }
    
    console.log('✅ Successfully seeded categories database!');
    console.log(`📊 Added ${categories.length} categories`);
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
};
