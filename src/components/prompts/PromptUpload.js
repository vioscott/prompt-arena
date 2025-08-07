import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createPrompt } from '../../firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';
import { X, Image as ImageIcon } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

const PromptUpload = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prompt: '',
    category: '',
    aiTool: '',
    price: '',
    tags: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'text', label: 'Text Generation' },
    { value: 'image', label: 'Image Generation' },
    { value: 'code', label: 'Code Generation' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'creative', label: 'Creative Writing' },
    { value: 'business', label: 'Business' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' }
  ];

  const aiTools = [
    { value: 'chatgpt', label: 'ChatGPT' },
    { value: 'midjourney', label: 'Midjourney' },
    { value: 'dalle', label: 'DALL-E' },
    { value: 'stable-diffusion', label: 'Stable Diffusion' },
    { value: 'claude', label: 'Claude' },
    { value: 'gemini', label: 'Gemini' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.prompt.trim()) {
      newErrors.prompt = 'Prompt content is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.aiTool) {
      newErrors.aiTool = 'AI Tool is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || Number(formData.price) < 0) {
      newErrors.price = 'Price must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const imageRef = ref(storage, `prompts/${user.uid}/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(imageRef, imageFile);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const promptData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        prompt: formData.prompt.trim(),
        category: formData.category,
        aiTool: formData.aiTool,
        price: Number(formData.price),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        imageUrl,
        userId: user.uid,
        authorName: user.displayName || 'Anonymous',
        searchTerms: [
          ...formData.title.toLowerCase().split(' '),
          ...formData.description.toLowerCase().split(' '),
          ...formData.tags.toLowerCase().split(',').map(tag => tag.trim())
        ].filter(term => term.length > 2)
      };

      await createPrompt(promptData);
      
      toast.success('Prompt uploaded successfully! It will be reviewed before going live.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        prompt: '',
        category: '',
        aiTool: '',
        price: '',
        tags: ''
      });
      setImageFile(null);
      setImagePreview(null);
      
      if (onSuccess) onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error uploading prompt:', error);
      toast.error('Failed to upload prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload New Prompt"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Enter a catchy title for your prompt"
          disabled={loading}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-primary-200 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`input resize-none ${errors.description ? 'border-red-500' : ''}`}
            placeholder="Describe what your prompt does and what makes it special"
            disabled={loading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Prompt Content */}
        <div>
          <label className="block text-sm font-medium text-primary-200 mb-2">
            Prompt Content
          </label>
          <textarea
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
            rows={5}
            className={`input resize-none ${errors.prompt ? 'border-red-500' : ''}`}
            placeholder="Enter your actual prompt here..."
            disabled={loading}
          />
          {errors.prompt && (
            <p className="mt-1 text-sm text-red-500">{errors.prompt}</p>
          )}
        </div>

        {/* Category and AI Tool */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-200 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`input ${errors.category ? 'border-red-500' : ''}`}
              disabled={loading}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-200 mb-2">
              AI Tool
            </label>
            <select
              name="aiTool"
              value={formData.aiTool}
              onChange={handleChange}
              className={`input ${errors.aiTool ? 'border-red-500' : ''}`}
              disabled={loading}
            >
              <option value="">Select AI Tool</option>
              {aiTools.map(tool => (
                <option key={tool.value} value={tool.value}>{tool.label}</option>
              ))}
            </select>
            {errors.aiTool && (
              <p className="mt-1 text-sm text-red-500">{errors.aiTool}</p>
            )}
          </div>
        </div>

        {/* Price and Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Price ($)"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            error={errors.price}
            placeholder="0.00"
            disabled={loading}
            helperText="Set to 0 for free prompts"
          />

          <Input
            label="Tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="ai, creative, marketing"
            disabled={loading}
            helperText="Comma-separated tags"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-primary-200 mb-2">
            Preview Image (Optional)
          </label>
          
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-primary-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                disabled={loading}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <ImageIcon size={32} className="text-primary-400 mb-2" />
                <span className="text-primary-300">Click to upload image</span>
                <span className="text-primary-500 text-sm">Max 5MB</span>
              </label>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            Upload Prompt
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PromptUpload;
