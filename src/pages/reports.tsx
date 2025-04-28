import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Updated types to match your API data structure
type Nomination = {
  nomination_id: number;
  nominee_id: number;
  nominator_id: number;
  reward_id: number;
  nomination_date: string | null;
  approval_status: string | null;
};

type Reward = {
  reward_id: number;
  reward_name: string;
  category_id: number;
};

type RewardCategory = {
  category_id: number;
  category_name: string;
};

type Employee = {
  employee_id: number;
  first_name: string;
  last_name: string;
  department_id: number;
};

type AnalyticsData = {
  monthlyNominations: { month: string; nominations: number }[];
  rewardDistribution: { name: string; value: number }[];
  topRewards: { reward_id: number; reward_name: string; category_name: string; count: number }[];
  metrics: {
    totalNominations: number;
    approvedNominations: number;
    activeEmployees: number;
    uniqueRewards: number;
  };
};

const ReportsPage = () => {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B8B'];

  // Fetch all paginated data from an endpoint
  const fetchAllPaginated = async <T,>(endpoint: string): Promise<T[]> => {
    let results: T[] = [];
    let skip = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(`${endpoint}?skip=${skip}&limit=${limit}`);
      if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
      
      const data = await response.json();
      results = results.concat(data);
      skip += limit;
      hasMore = data.length === limit;
    }

    return results;
  };

  // Process raw data into analytics format
  const processAnalyticsData = (
    nominations: Nomination[],
    rewards: Reward[],
    categories: RewardCategory[],
    employees: Employee[]
  ): AnalyticsData => {
    // Filter nominations by date range
    const filteredNominations = nominations.filter(nom => {
      if (!nom.nomination_date) return false;
      const nomDate = new Date(nom.nomination_date);
      return nomDate >= startDate && nomDate <= endDate;
    });

    // Group by month for trend chart
    const monthlyData = filteredNominations.reduce((acc, nom) => {
      if (!nom.nomination_date) return acc;
      
      const month = nom.nomination_date.slice(0, 7); // YYYY-MM
      const existing = acc.find(item => item.month === month);
      
      if (existing) {
        existing.nominations++;
      } else {
        acc.push({ month, nominations: 1 });
      }
      
      return acc;
    }, [] as { month: string; nominations: number }[]).sort((a, b) => a.month.localeCompare(b.month));

    // Reward distribution by category
    const rewardMap = new Map(rewards.map(r => [r.reward_id, r]));
    const categoryMap = new Map(categories.map(c => [c.category_id, c]));
    
    const rewardDistribution = filteredNominations.reduce((acc, nom) => {
      const reward = rewardMap.get(nom.reward_id);
      if (!reward) return acc;
      
      const category = categoryMap.get(reward.category_id);
      const categoryName = category?.category_name || 'Unknown';
      
      const existing = acc.find(item => item.name === categoryName);
      if (existing) {
        existing.value++;
      } else {
        acc.push({ name: categoryName, value: 1 });
      }
      
      return acc;
    }, [] as { name: string; value: number }[]);

    // Top rewards
    const rewardCounts = filteredNominations.reduce((acc, nom) => {
      const reward = rewardMap.get(nom.reward_id);
      if (!reward) return acc;
      
      const rewardName = reward.reward_name;
      const category = categoryMap.get(reward.category_id);
      const categoryName = category?.category_name || 'Unknown';
      
      const key = `${reward.reward_id}-${rewardName}`;
      if (acc[key]) {
        acc[key].count++;
      } else {
        acc[key] = {
          reward_id: reward.reward_id,
          reward_name: rewardName,
          category_name: categoryName,
          count: 1
        };
      }
      
      return acc;
    }, {} as Record<string, { reward_id: number; reward_name: string; category_name: string; count: number }>);

    const topRewards = Object.values(rewardCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Metrics
    const uniqueEmployees = new Set(filteredNominations.map(nom => nom.nominee_id)).size;
    const approvedCount = filteredNominations.filter(nom => nom.approval_status === 'approved').length;
    const uniqueRewards = new Set(filteredNominations.map(nom => nom.reward_id)).size;

    return {
      monthlyNominations: monthlyData,
      rewardDistribution,
      topRewards,
      metrics: {
        totalNominations: filteredNominations.length,
        approvedNominations: approvedCount,
        activeEmployees: uniqueEmployees,
        uniqueRewards
      }
    };
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch all required data in parallel
      const [nominations, rewards, categories, employees] = await Promise.all([
        fetchAllPaginated<Nomination>('/nominations/'),
        fetchAllPaginated<Reward>('/rewards/'),
        fetchAllPaginated<RewardCategory>('/reward-categories/'),
        fetchAllPaginated<Employee>('/employees/')
      ]);

      // Process the data into analytics format
      const processedData = processAnalyticsData(nominations, rewards, categories, employees);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleDateApply = () => {
    fetchAnalyticsData();
  };

  const calculatePopularityPercentage = (count: number) => {
    if (!analyticsData?.topRewards.length) return 0;
    const maxCount = Math.max(...analyticsData.topRewards.map(r => r.count));
    return (count / maxCount) * 100;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Employee Rewards Analytics</h1>
      
      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Date Range</h2>
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date || new Date())}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date || new Date())}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="border p-2 rounded"
            />
          </div>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded self-end"
            onClick={handleDateApply}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Apply'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Total Nominations</h3>
          <p className="text-2xl font-bold">
            {analyticsData?.metrics.totalNominations.toLocaleString() || '0'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Approved Nominations</h3>
          <p className="text-2xl font-bold">
            {analyticsData?.metrics.approvedNominations.toLocaleString() || '0'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Active Employees</h3>
          <p className="text-2xl font-bold">
            {analyticsData?.metrics.activeEmployees.toLocaleString() || '0'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Unique Rewards</h3>
          <p className="text-2xl font-bold">
            {analyticsData?.metrics.uniqueRewards.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Nominations Trend */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Nominations Trend</h2>
          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading chart data...</p>
              </div>
            ) : analyticsData?.monthlyNominations.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.monthlyNominations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="nominations" 
                    name="Nominations"
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>No nomination data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Reward Categories Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Reward Categories Distribution</h2>
          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading chart data...</p>
              </div>
            ) : analyticsData?.rewardDistribution.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.rewardDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {analyticsData.rewardDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} nominations`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>No reward distribution data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Rewards Table */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Top Rewards</h2>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p>Loading top rewards...</p>
          </div>
        ) : analyticsData?.topRewards.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Popularity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.topRewards.map((reward) => (
                  <tr key={reward.reward_id}>
                    <td className="px-6 py-4 whitespace-nowrap">{reward.reward_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{reward.category_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{reward.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{width: `${calculatePopularityPercentage(reward.count)}%`}}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8">
            <p>No top rewards data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;

// // pages/report.js
// import { useState, useEffect } from 'react';
// import axios from 'axios';

// const ReportPage = () => {
//   const [reports, setReports] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch report data from the API
//   useEffect(() => {
//     const fetchReports = async () => {
//       try {
//         const response = await axios.get('/api/reports'); // Replace with your API endpoint
//         setReports(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchReports();
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-6">Report Page</h1>
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white border border-gray-200">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="py-3 px-4 border-b text-left">ID</th>
//               <th className="py-3 px-4 border-b text-left">Name</th>
//               <th className="py-3 px-4 border-b text-left">Date</th>
//               <th className="py-3 px-4 border-b text-left">Status</th>
//               <th className="py-3 px-4 border-b text-left">Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {reports.map((report) => (
//               <tr key={report.id} className="hover:bg-gray-50">
//                 <td className="py-3 px-4 border-b">{report.id}</td>
//                 <td className="py-3 px-4 border-b">{report.name}</td>
//                 <td className="py-3 px-4 border-b">{report.date}</td>
//                 <td className="py-3 px-4 border-b">
//                   <span
//                     className={`px-2 py-1 text-sm rounded ${
//                       report.status === 'Completed'
//                         ? 'bg-green-100 text-green-800'
//                         : report.status === 'Pending'
//                         ? 'bg-yellow-100 text-yellow-800'
//                         : 'bg-red-100 text-red-800'
//                     }`}
//                   >
//                     {report.status}
//                   </span>
//                 </td>
//                 <td className="py-3 px-4 border-b">${report.amount.toFixed(2)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ReportPage;