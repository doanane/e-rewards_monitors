'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Employee = {
  employee_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  department_id: number;
  region_id: number;
  hire_date?: string | null;
  gender?: string | null;
};

type Department = {
  department_id: number;
  department_name: string;
};

type Region = {
  region_id: number;
  region_name: string;
};

export default function EmployeeManagement() {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<Employee, 'employee_id'>>({
    first_name: '',
    last_name: '',
    email: '',
    department_id: 0,
    region_id: 0,
    hire_date: null,
    gender: null
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(null);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees
        const empResponse = await fetch('https://e-reward-api.onrender.com/employees/');
        if (empResponse.ok) {
          const empData = await empResponse.json();
          setEmployees(empData);
        }

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
      [name]: name.endsWith('_id') ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let url = 'https://e-reward-api.onrender.com/employees/';
      let method = 'POST';
      
      if (isEditing && currentEmployeeId) {
        url += `${currentEmployeeId}`;
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
          setEmployees(employees.map(emp => 
            emp.employee_id === currentEmployeeId ? result : emp
          ));
        } else {
          setEmployees([...employees, result]);
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

  const handleEdit = (employee: Employee) => {
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      department_id: employee.department_id,
      region_id: employee.region_id,
      hire_date: employee.hire_date || null,
      gender: employee.gender || null
    });
    setIsEditing(true);
    setCurrentEmployeeId(employee.employee_id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await fetch(`https://e-reward-api.onrender.com/employees/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setEmployees(employees.filter(emp => emp.employee_id !== id));
          if (currentEmployeeId === id) {
            resetForm();
          }
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      department_id: 0,
      region_id: 0,
      hire_date: null,
      gender: null
    });
    setIsEditing(false);
    setCurrentEmployeeId(null);
  };

  const getDepartmentName = (id: number) => {
    const dept = departments.find(d => d.department_id === id);
    return dept ? dept.department_name : 'Unknown';
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
          Employee {isEditing ? 'updated' : 'added'} successfully!
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Employee' : 'New Employee Onboarding'}
          </h1>
          <p className="opacity-90 mt-1">
            {isEditing ? 'Update employee information' : 'Add a new employee to the system'}
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
              placeholder="employee@company.com"
            />
          </div>

          {/* Department and Region */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="0">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.department_name} (ID: {dept.department_id})
                  </option>
                ))}
              </select>
            </div>
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
          </div>

          {/* Hire Date and Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
              <input
                type="date"
                name="hire_date"
                value={formData.hire_date || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="pt-4 flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting || formData.department_id === 0 || formData.region_id === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : isEditing ? 'Update Employee' : 'Add Employee'}
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

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Employee List</h1>
          <p className="opacity-90 mt-1">View and manage all employees</p>
        </div>

        <div className="p-6">
          {employees.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No employees found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hire Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.employee_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.employee_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getDepartmentName(employee.department_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getRegionName(employee.region_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => employee.employee_id && handleDelete(employee.employee_id)}
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