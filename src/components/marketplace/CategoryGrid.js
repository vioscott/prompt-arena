import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Image, 
  Code, 
  Megaphone, 
  PenTool, 
  Briefcase, 
  GraduationCap, 
  MoreHorizontal 
} from 'lucide-react';

const CategoryGrid = () => {
  const categories = [
    {
      id: 'text',
      name: 'Text Generation',
      description: 'ChatGPT, Claude, and other text AI prompts',
      icon: <MessageSquare className="h-8 w-8" />,
      color: 'text-accent-400',
      bgColor: 'bg-accent-500/20',
      count: '12.5k'
    },
    {
      id: 'image',
      name: 'Image Generation',
      description: 'Midjourney, DALL-E, Stable Diffusion prompts',
      icon: <Image className="h-8 w-8" />,
      color: 'text-secondary-400',
      bgColor: 'bg-secondary-500/20',
      count: '8.2k'
    },
    {
      id: 'code',
      name: 'Code Generation',
      description: 'Programming and development prompts',
      icon: <Code className="h-8 w-8" />,
      color: 'text-accent-300',
      bgColor: 'bg-accent-600/20',
      count: '3.1k'
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Sales, advertising, and marketing prompts',
      icon: <Megaphone className="h-8 w-8" />,
      color: 'text-secondary-300',
      bgColor: 'bg-secondary-600/20',
      count: '5.7k'
    },
    {
      id: 'creative',
      name: 'Creative Writing',
      description: 'Stories, poems, and creative content',
      icon: <PenTool className="h-8 w-8" />,
      color: 'text-secondary-500',
      bgColor: 'bg-secondary-400/20',
      count: '4.3k'
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Professional and business prompts',
      icon: <Briefcase className="h-8 w-8" />,
      color: 'text-accent-500',
      bgColor: 'bg-accent-400/20',
      count: '2.9k'
    },
    {
      id: 'education',
      name: 'Education',
      description: 'Learning and educational prompts',
      icon: <GraduationCap className="h-8 w-8" />,
      color: 'text-accent-600',
      bgColor: 'bg-accent-300/20',
      count: '1.8k'
    },
    {
      id: 'other',
      name: 'Other',
      description: 'Miscellaneous and specialized prompts',
      icon: <MoreHorizontal className="h-8 w-8" />,
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/20',
      count: '2.1k'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/marketplace?category=${category.id}`}
          className="group"
        >
          <div className="card card-hover p-6 text-center h-full">
            <div className={`${category.bgColor} ${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
              {category.icon}
            </div>
            
            <h3 className="text-lg font-semibold text-primary-50 mb-2 group-hover:text-accent-400 transition-colors">
              {category.name}
            </h3>
            
            <p className="text-primary-300 text-sm mb-3 line-clamp-2">
              {category.description}
            </p>
            
            <div className="text-accent-400 font-medium text-sm">
              {category.count} prompts
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CategoryGrid;
