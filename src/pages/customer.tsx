'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Customer = {
  customer_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  region_id: number;
};

type Region = {
  region_id: number;
  region_name: string;
};

export default function CustomerManagement() {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<Customer, 'customer_id'>>({
    first_name: '',
    last_name: '',
    email: '',
    region_id: 0
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState<number | null>(null);

  // Fetch all customers and regions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customers
        const customersResponse = await fetch('https://e-reward-api.onrender.com/customers/');
        if (customersResponse.ok) {
          const customersData = await customersResponse.json();
          setCustomers(customersData);
        }

        // Fetch regions
        const regionsResponse = await fetch('https://e-reward-api.onrender.com/regions/');
        if (regionsResponse.ok) {
          const regionsData = await regionsResponse.json();
          setRegions(regionsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'region_id' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let url = 'https://e-reward-api.onrender.com/customers/';
      let method = 'POST';
      
      if (isEditing && currentCustomerId) {
        url += `${currentCustomerId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        if (isEditing) {
          setCustomers(customers.map(customer => 
            customer.customer_id === currentCustomerId ? result : customer
          ));
        } else {
          setCustomers([...customers, result]);
        }
        resetForm();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      region_id: customer.region_id
    });
    setIsEditing(true);
    setCurrentCustomerId(customer.customer_id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetch(`https://e-reward-api.onrender.com/customers/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setCustomers(customers.filter(customer => customer.customer_id !== id));
          if (currentCustomerId === id) {
            resetForm();
          }
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      region_id: 0
    });
    setIsEditing(false);
    setCurrentCustomerId(null);
  };

  const getRegionName = (id: number) => {
    const region = regions.find(r => r.region_id === id);
    return region ? region.region_name : 'Unknown';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
          Customer {isEditing ? 'updated' : 'added'} successfully!
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Customer' : 'Add New Customer'}
          </h1>
          <p className="opacity-90 mt-1">
            {isEditing ? 'Update customer information' : 'Enter new customer details'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="customer@example.com"
            />
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
            <select
              name="region_id"
              value={formData.region_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="0">Select Region</option>
              {regions.map(region => (
                <option key={region.region_id} value={region.region_id}>
                  {region.region_name} (ID: {region.region_id})
                </option>
              ))}
            </select>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="pt-4 flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting || formData.region_id === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Updating...' : 'Adding...'}
                </span>
              ) : isEditing ? 'Update Customer' : 'Add Customer'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Customer List</h1>
          <p className="opacity-90 mt-1">View and manage all customers</p>
        </div>

        <div className="p-6">
          {customers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No customers found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.customer_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.customer_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getRegionName(customer.region_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => customer.customer_id && handleDelete(customer.customer_id)}
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
          )}
        </div>
      </div>
    </div>
  );
}