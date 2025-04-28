'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WorldMap from 'react-svg-worldmap';

type Region = {
  region_id?: number;
  region_name: string;
  availability_zones?: string | null;
  points?: number;
  country_code?: string;
};

export default function RegionManagement() {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<Region, 'region_id'>>({
    region_name: '',
    availability_zones: null
  });
  const [regions, setRegions] = useState<Region[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRegionId, setCurrentRegionId] = useState<number | null>(null);
  const [currentZone, setCurrentZone] = useState('');

  // Fetch all regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch('https://e-reward-api.onrender.com/regions/');
        if (response.ok) {
          const data = await response.json();
          setRegions(data);
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    };
    fetchRegions();
  }, []);

  // Prepare data for visualization
  const countryData = regions
    .filter(region => region.country_code && region.points)
    .map(region => ({
      country: region.country_code?.toLowerCase() || '',
      value: region.points || 0,
      name: region.region_name
    }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddZone = () => {
    if (currentZone) {
      const currentZones = formData.availability_zones 
        ? formData.availability_zones.split(',') 
        : [];
      
      if (!currentZones.includes(currentZone)) {
        currentZones.push(currentZone);
        setFormData(prev => ({
          ...prev,
          availability_zones: currentZones.join(',')
        }));
        setCurrentZone('');
      }
    }
  };

  const handleRemoveZone = (zone: string) => {
    const currentZones = formData.availability_zones 
      ? formData.availability_zones.split(',') 
      : [];
    
    setFormData(prev => ({
      ...prev,
      availability_zones: currentZones.filter(z => z !== zone).join(',')
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let url = 'https://e-reward-api.onrender.com/regions/';
      let method = 'POST';
      
      if (isEditing && currentRegionId) {
        url += `${currentRegionId}`;
        method = 'PUT';
      }

      const payload = {
        region_name: formData.region_name,
        availability_zones: formData.availability_zones || null,
        ...(formData.country_code && { country_code: formData.country_code }),
        ...(formData.points && { points: formData.points })
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        if (isEditing) {
          setRegions(regions.map(region => 
            region.region_id === currentRegionId ? result : region
          ));
        } else {
          setRegions([...regions, result]);
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

  const handleEdit = (region: Region) => {
    setFormData({
      region_name: region.region_name,
      availability_zones: region.availability_zones || null,
      country_code: region.country_code,
      points: region.points
    });
    setIsEditing(true);
    setCurrentRegionId(region.region_id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this region?')) {
      try {
        const response = await fetch(`https://e-reward-api.onrender.com/regions/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setRegions(regions.filter(region => region.region_id !== id));
          if (currentRegionId === id) {
            resetForm();
          }
        }
      } catch (error) {
        console.error('Error deleting region:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      region_name: '',
      availability_zones: null
    });
    setIsEditing(false);
    setCurrentRegionId(null);
    setCurrentZone('');
  };

  // Helper to get zones array
  const getZonesArray = (zones?: string | null) => {
    return zones ? zones.split(',') : [];
  };

  return (
    <div className="container mx-auto p-6">
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
          Region {isEditing ? 'updated' : 'created'} successfully!
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Region' : 'Create New Region'}
          </h1>
          <p className="opacity-90 mt-1">
            {isEditing ? 'Update region details' : 'Add a new region with availability zones'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Region Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region Name *</label>
            <input
              type="text"
              name="region_name"
              value={formData.region_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., North America, Europe"
            />
          </div>

          {/* Country Code and Points (for visualization) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country Code (ISO 2-letter)</label>
              <input
                type="text"
                name="country_code"
                value={formData.country_code || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., US, GB, DE"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points (for visualization)</label>
              <input
                type="number"
                name="points"
                value={formData.points || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 10000"
              />
            </div>
          </div>

          {/* Availability Zones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability Zones</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentZone}
                onChange={(e) => setCurrentZone(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., us-east-1a"
              />
              <button
                type="button"
                onClick={handleAddZone}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
              >
                Add Zone
              </button>
            </div>
            
            {formData.availability_zones ? (
              <ul className="border rounded-lg divide-y">
                {getZonesArray(formData.availability_zones).map(zone => (
                  <li key={zone} className="flex justify-between items-center p-3">
                    <span>{zone}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveZone(zone)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No availability zones added yet</p>
            )}
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="pt-4 flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </span>
              ) : isEditing ? 'Update Region' : 'Create Region'}
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

      {/* Regions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Regions List</h1>
          <p className="opacity-90 mt-1">View and manage all regions</p>
        </div>

        <div className="p-6">
          {regions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No regions found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zones</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {regions.map((region) => (
                    <tr key={region.region_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {region.region_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {region.region_name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {getZonesArray(region.availability_zones).map(zone => (
                            <span key={zone} className="px-2 py-1 text-xs bg-gray-100 rounded">
                              {zone}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(region)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => region.region_id && handleDelete(region.region_id)}
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

      {/* WorldMap Visualization */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Global Region Distribution</h2>
        <div className="h-96">
          {countryData.length > 0 ? (
            <WorldMap
              color="blue"
              tooltipBgColor="#333"
              value-suffix="points"
              size="responsive"
              data={countryData}
              tooltipTextFunction={({ countryName, value }) => 
                `${countryName}: ${value ? value.toLocaleString() : 0} points`
              }
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No region data available for visualization</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}