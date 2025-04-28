'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';

type Reward = {
  reward_id?: number;
  reward_name: string;
  category_id: number;
  description?: string;
  image_url?: string;
};

type RewardCategory = {
  category_id?: number;
  category_name: string;
};

export default function CombinedRewardsManagement() {
  // State for rewards
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filter, setFilter] = useState<number | 'all'>('all');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [rewardFormData, setRewardFormData] = useState<Omit<Reward, 'reward_id'>>({
    reward_name: '',
    category_id: 0,
    description: '',
    image_url: ''
  });
  const [isEditingReward, setIsEditingReward] = useState(false);
  const [showRewardForm, setShowRewardForm] = useState(false);

  // State for categories
  const [categories, setCategories] = useState<RewardCategory[]>([]);
  const [categoryFormData, setCategoryFormData] = useState<Omit<RewardCategory, 'category_id'>>({
    category_name: ''
  });
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RewardCategory | null>(null);

  // Shared state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'rewards' | 'categories'>('rewards');

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch rewards
        const rewardsResponse = await fetch('https://e-reward-api.onrender.com/rewards/');
        if (rewardsResponse.ok) {
          setRewards(await rewardsResponse.json());
        }

        // Fetch categories
        const categoriesResponse = await fetch('https://e-reward-api.onrender.com/reward-categories/');
        if (categoriesResponse.ok) {
          setCategories(await categoriesResponse.json());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Filter rewards based on selected category
  const filteredRewards = filter === 'all' 
    ? rewards 
    : rewards.filter(reward => reward.category_id === filter);

  // Reward handlers
  const handleRewardInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRewardFormData(prev => ({
      ...prev,
      [name]: name === 'category_id' ? parseInt(value) : value
    }));
  };

  const handleRewardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let url = 'https://e-reward-api.onrender.com/rewards/';
      let method = 'POST';
      
      if (isEditingReward && selectedReward?.reward_id) {
        url += `${selectedReward.reward_id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rewardFormData),
      });

      if (response.ok) {
        const result = await response.json();
        if (isEditingReward) {
          setRewards(rewards.map(reward => 
            reward.reward_id === selectedReward?.reward_id ? result : reward
          ));
        } else {
          setRewards([...rewards, result]);
        }
        resetRewardForm();
        setSuccess(`Reward ${isEditingReward ? 'updated' : 'added'} successfully!`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReward = (reward: Reward) => {
    setRewardFormData({
      reward_name: reward.reward_name,
      category_id: reward.category_id,
      description: reward.description || '',
      image_url: reward.image_url || ''
    });
    setSelectedReward(reward);
    setIsEditingReward(true);
    setShowRewardForm(true);
  };

  const handleDeleteReward = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      try {
        const response = await fetch(`https://e-reward-api.onrender.com/rewards/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setRewards(rewards.filter(reward => reward.reward_id !== id));
          if (selectedReward?.reward_id === id) {
            setSelectedReward(null);
          }
        }
      } catch (error) {
        console.error('Error deleting reward:', error);
      }
    }
  };

  const resetRewardForm = () => {
    setRewardFormData({
      reward_name: '',
      category_id: 0,
      description: '',
      image_url: ''
    });
    setSelectedReward(null);
    setIsEditingReward(false);
    setShowRewardForm(false);
  };

  // Category handlers
  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let url = 'https://e-reward-api.onrender.com/reward-categories/';
      let method = 'POST';
      
      if (isEditingCategory && selectedCategory?.category_id) {
        url += `${selectedCategory.category_id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryFormData),
      });

      if (response.ok) {
        const result = await response.json();
        if (isEditingCategory) {
          setCategories(categories.map(category => 
            category.category_id === selectedCategory?.category_id ? result : category
          ));
        } else {
          setCategories([...categories, result]);
        }
        resetCategoryForm();
        setSuccess(`Category ${isEditingCategory ? 'updated' : 'added'} successfully!`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = (category: RewardCategory) => {
    setCategoryFormData({
      category_name: category.category_name
    });
    setSelectedCategory(category);
    setIsEditingCategory(true);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? Any rewards in this category will need to be reassigned.')) {
      try {
        const response = await fetch(`https://e-reward-api.onrender.com/reward-categories/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setCategories(categories.filter(category => category.category_id !== id));
          if (selectedCategory?.category_id === id) {
            setSelectedCategory(null);
          }
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      category_name: ''
    });
    setSelectedCategory(null);
    setIsEditingCategory(false);
    setShowCategoryForm(false);
  };

  // Helper functions
  const getCategoryName = (id: number) => {
    const category = categories.find(cat => cat.category_id === id);
    return category ? category.category_name : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Rewards & Categories Management</title>
        <meta name="description" content="Manage rewards and categories" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Rewards & Categories</h1>
          <div className="flex space-x-4">
            <button 
              onClick={() => setActiveTab('rewards')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'rewards' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Rewards
            </button>
            <button 
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'categories' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Categories
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Rewards Management</h2>
              <button 
                onClick={() => setShowRewardForm(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Reward
              </button>
            </div>

            {/* Filter controls */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-full ${filter === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  All Rewards
                </button>
                {categories.map(category => (
                  <button
                    key={category.category_id}
                    onClick={() => setFilter(category.category_id || 0)}
                    className={`px-4 py-2 rounded-full capitalize ${filter === category.category_id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {category.category_name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Rewards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRewards.map(reward => (
                <div 
                  key={reward.reward_id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <img 
                      src={reward.image_url || '/images/default-reward.jpg'} 
                      alt={reward.reward_name}
                      className="object-cover h-full w-full"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold">{reward.reward_name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                        {getCategoryName(reward.category_id)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{reward.description}</p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditReward(reward)}
                        className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => reward.reward_id && handleDeleteReward(reward.reward_id)}
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredRewards.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No rewards found in this category.</p>
              </div>
            )}

            {/* Reward Form Modal */}
            {showRewardForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">
                        {isEditingReward ? 'Edit Reward' : 'Add New Reward'}
                      </h2>
                      <button 
                        onClick={resetRewardForm}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <form onSubmit={handleRewardSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="reward_name" className="block text-sm font-medium text-gray-700 mb-1">
                            Reward Name *
                          </label>
                          <input
                            type="text"
                            id="reward_name"
                            name="reward_name"
                            value={rewardFormData.reward_name}
                            onChange={handleRewardInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                          </label>
                          <select
                            id="category_id"
                            name="category_id"
                            value={rewardFormData.category_id}
                            onChange={handleRewardInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="0">Select a category</option>
                            {categories.map(category => (
                              <option key={category.category_id} value={category.category_id}>
                                {category.category_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            value={rewardFormData.description}
                            onChange={handleRewardInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                            Image URL
                          </label>
                          <input
                            type="text"
                            id="image_url"
                            name="image_url"
                            value={rewardFormData.image_url}
                            onChange={handleRewardInputChange}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-8 flex justify-end space-x-3">
                        <button 
                          type="button"
                          onClick={resetRewardForm}
                          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          disabled={isSubmitting || rewardFormData.category_id === 0}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-70"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {isEditingReward ? 'Updating...' : 'Adding...'}
                            </span>
                          ) : isEditingReward ? 'Update Reward' : 'Add Reward'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Categories Management</h2>
              <button 
                onClick={() => setShowCategoryForm(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Category
              </button>
            </div>

            {/* Categories table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map(category => (
                    <tr key={category.category_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {category.category_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => category.category_id && handleDeleteCategory(category.category_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Category Form Modal */}
            {showCategoryForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-md w-full">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">
                        {isEditingCategory ? 'Edit Category' : 'Add New Category'}
                      </h2>
                      <button 
                        onClick={resetCategoryForm}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <form onSubmit={handleCategorySubmit}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="category_name" className="block text-sm font-medium text-gray-700 mb-1">
                            Category Name *
                          </label>
                          <input
                            type="text"
                            id="category_name"
                            name="category_name"
                            value={categoryFormData.category_name}
                            onChange={handleCategoryInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mt-8 flex justify-end space-x-3">
                        <button 
                          type="button"
                          onClick={resetCategoryForm}
                          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-70"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {isEditingCategory ? 'Updating...' : 'Adding...'}
                            </span>
                          ) : isEditingCategory ? 'Update Category' : 'Add Category'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}