'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Nomination = {
  nomination_id?: number;
  nominee_id: number;
  nominator_id: number;
  nomination_type: string;
  reward_id: number;
  nomination_date?: string | null;
  approval_status?: string | null;
  employee_name?: string;
  employee_department?: string;
  nominator_name?: string;
  nominator_email?: string;
  reward_name?: string;
};

type Employee = {
  employee_id: number;
  first_name: string;
  last_name: string;
  email: string;
  department_id: number;
};

type Reward = {
  reward_id: number;
  reward_name: string;
  category_id: number;
};

export default function NominationManagement() {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<Nomination, 'nomination_id'>>({
    nominee_id: 0,
    nominator_id: 0,
    nomination_type: '',
    reward_id: 0
  });
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNominationId, setCurrentNominationId] = useState<number | null>(null);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch nominations with expanded data
        const nomResponse = await fetch('https://e-reward-api.onrender.com/nominations/');
        if (nomResponse.ok) {
          const nomData = await nomResponse.json();
          setNominations(nomData);
        }

        // Fetch employees
        const empResponse = await fetch('https://e-reward-api.onrender.com/employees/');
        if (empResponse.ok) {
          const empData = await empResponse.json();
          setEmployees(empData);
        }

        // Fetch rewards
        const rewardResponse = await fetch('https://e-reward-api.onrender.com/rewards/');
        if (rewardResponse.ok) {
          const rewardData = await rewardResponse.json();
          setRewards(rewardData);
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
      [name]: name.endsWith('_id') ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let url = 'https://e-reward-api.onrender.com/nominations/';
      let method = 'POST';
      
      if (isEditing && currentNominationId) {
        url += `${currentNominationId}`;
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
          setNominations(nominations.map(nom => 
            nom.nomination_id === currentNominationId ? result : nom
          ));
        } else {
          setNominations([...nominations, result]);
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

  const handleEdit = (nomination: Nomination) => {
    setFormData({
      nominee_id: nomination.nominee_id,
      nominator_id: nomination.nominator_id,
      nomination_type: nomination.nomination_type,
      reward_id: nomination.reward_id,
      nomination_date: nomination.nomination_date || null,
      approval_status: nomination.approval_status || null
    });
    setIsEditing(true);
    setCurrentNominationId(nomination.nomination_id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this nomination?')) {
      try {
        const response = await fetch(`https://e-reward-api.onrender.com/nominations/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setNominations(nominations.filter(nom => nom.nomination_id !== id));
          if (currentNominationId === id) {
            resetForm();
          }
        }
      } catch (error) {
        console.error('Error deleting nomination:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nominee_id: 0,
      nominator_id: 0,
      nomination_type: '',
      reward_id: 0
    });
    setIsEditing(false);
    setCurrentNominationId(null);
  };

  const getStatusBadge = (status: string | null = 'pending') => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    const statusText = status || 'pending';
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[statusText as keyof typeof statusClasses]}`}>
        {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
      </span>
    );
  };

  const getEmployeeName = (id: number) => {
    const employee = employees.find(e => e.employee_id === id);
    return employee ? `${employee.first_name} ${employee.last_name}` : `Employee ${id}`;
  };

  const getRewardName = (id: number) => {
    const reward = rewards.find(r => r.reward_id === id);
    return reward ? reward.reward_name : `Reward ${id}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
          Nomination {isEditing ? 'updated' : 'submitted'} successfully!
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="bg-indigo-700 p-6 text-white">
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Nomination' : 'Employee Recognition Nomination'}
          </h1>
          <p className="opacity-90 mt-1">
            {isEditing ? 'Update nomination details' : 'Celebrate outstanding colleagues who make a difference'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nominator Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Nominator Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nominator (Employee ID) *</label>
              <select
                name="nominator_id"
                value={formData.nominator_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="0">Select Nominator</option>
                {employees.map(employee => (
                  <option key={employee.employee_id} value={employee.employee_id}>
                    {employee.first_name} {employee.last_name} (ID: {employee.employee_id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nominee Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Nominee Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nominee (Employee ID) *</label>
              <select
                name="nominee_id"
                value={formData.nominee_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="0">Select Nominee</option>
                {employees.map(employee => (
                  <option key={employee.employee_id} value={employee.employee_id}>
                    {employee.first_name} {employee.last_name} (ID: {employee.employee_id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reward Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Recognition Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomination Type *</label>
                <input
                  type="text"
                  name="nomination_type"
                  value={formData.nomination_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Excellence, Innovation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reward *</label>
                <select
                  name="reward_id"
                  value={formData.reward_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="0">Select Reward</option>
                  {rewards.map(reward => (
                    <option key={reward.reward_id} value={reward.reward_id}>
                      {reward.reward_name} (ID: {reward.reward_id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status (only editable when editing) */}
          {isEditing && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Approval Status</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="approval_status"
                  value={formData.approval_status || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          )}

          {/* Submission */}
          <div className="pt-4 flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting || formData.nominee_id === 0 || formData.nominator_id === 0 || formData.reward_id === 0}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Updating...' : 'Submitting...'}
                </span>
              ) : isEditing ? 'Update Nomination' : 'Submit Nomination'}
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

      {/* Nominations Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-indigo-700 p-6 text-white">
          <h1 className="text-2xl font-bold">Nominations List</h1>
          <p className="opacity-90 mt-1">View and manage all employee nominations</p>
        </div>

        <div className="p-6">
          {nominations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No nominations found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {nominations.map((nomination) => (
                    <tr key={nomination.nomination_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {nomination.employee_name || getEmployeeName(nomination.nominee_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {nomination.nominator_name || getEmployeeName(nomination.nominator_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {nomination.nomination_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {nomination.reward_name || getRewardName(nomination.reward_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(nomination.approval_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {nomination.nomination_date ? new Date(nomination.nomination_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(nomination)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => nomination.nomination_id && handleDelete(nomination.nomination_id)}
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