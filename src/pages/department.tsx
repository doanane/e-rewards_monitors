'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Department = {
  department_id?: number;
  department_name: string;
  region_id: number;
};

type Region = {
  region_id: number;
  region_name: string;
};

export default function DepartmentManagement() {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<Department, 'department_id'>>({
    department_name: '',
    region_id: 0
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDepartmentId, setCurrentDepartmentId] = useState<number | null>(null);

  // Fetch all departments and regions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const deptResponse = await fetch('https://e-reward-api.onrender.com/departments/');
        if (deptResponse.ok) {
          const deptData = await deptResponse.json();
          setDepartments(deptData);
        }

        // Fetch regions
        const regionResponse = await fetch('https://e-reward-api.onrender.com/regions/');
        if (regionResponse.ok) {
          const regionData = await regionResponse.json();
          setRegions(regionData);
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
      let url = 'https://e-reward-api.onrender.com/departments/';
      let method = 'POST';
      
      if (isEditing && currentDepartmentId) {
        url += `${currentDepartmentId}`;
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
          setDepartments(departments.map(dept => 
            dept.department_id === currentDepartmentId ? result : dept
          ));
        } else {
          setDepartments([...departments, result]);
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

  const handleEdit = (department: Department) => {
    setFormData({
      department_name: department.department_name,
      region_id: department.region_id
    });
    setIsEditing(true);
    setCurrentDepartmentId(department.department_id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        const response = await fetch(`https://e-reward-api.onrender.com/departments/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setDepartments(departments.filter(dept => dept.department_id !== id));
          if (currentDepartmentId === id) {
            resetForm();
          }
        }
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      department_name: '',
      region_id: 0
    });
    setIsEditing(false);
    setCurrentDepartmentId(null);
  };

  const getRegionName = (id: number) => {
    const region = regions.find(r => r.region_id === id);
    return region ? region.region_name : 'Unknown Region';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
          Department {isEditing ? 'updated' : 'created'} successfully!
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-purple-600 p-6 text-white">
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Department' : 'New Department Setup'}
          </h1>
          <p className="opacity-90 mt-1">
            {isEditing ? 'Update department information' : 'Add a new department to the organization'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Department Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
            <input
              type="text"
              name="department_name"
              value={formData.department_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., Marketing, Engineering"
            />
          </div>

          {/* Region Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
            <select
              name="region_id"
              value={formData.region_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </span>
              ) : isEditing ? 'Update Department' : 'Create Department'}
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

      {/* Departments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-purple-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Departments List</h1>
          <p className="opacity-90 mt-1">View and manage all departments</p>
        </div>

        <div className="p-6">
          {departments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No departments found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departments.map((department) => (
                    <tr key={department.department_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {department.department_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {department.department_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getRegionName(department.region_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(department)}
                          className="text-purple-600 hover:text-purple-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => department.department_id && handleDelete(department.department_id)}
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