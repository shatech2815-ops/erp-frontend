import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import DummyProfile from "../assets/images/dummyprofile.jpeg";

const Department = () => {
  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('Weekday');

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
    setLoading(true);
    try {
      /* 
        ============================================================
        BACKEND API ROUTE - GET DEPARTMENT DATA:
        ============================================================
        Endpoint: GET /api/departments/overview
        Method: GET
        Headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {token}'
        }
        
        Expected Response Format:
        {
          departmentCharts: [
            {
              name: string,
              sections: [
                { name: string, value: number, color: string }
              ]
            }
          ],
          employeesByDepartment: [
            {
              name: string,
              color: string,
              count: number
            }
          ],
          departmentsOverview: {
            totalDepartments: number,
            monthlyPresent: number,
            departmentData: [
              { day: string, value: number }
            ]
          },
          recentActivity: [
            {
              employeeId: string,
              employeeName: string,
              department: string,
              joiningDate: string,
              currentStatus: string
            }
          ]
        }
        
        BACKEND API ROUTE - ADD DEPARTMENT:
        Endpoint: POST /api/departments
        Method: POST
        Body: { name: string, description: string }
        Headers: Authorization: Bearer {token}
      */

      // Dummy data - replace with actual API call
      const response = {
        departmentCharts: [
          {
            name: 'HR Department',
            sections: [
              { name: 'Frontend', value: 30, color: '#5D9CEC' },
              { name: 'Backend', value: 25, color: '#FC6E51' },
              { name: 'Testing', value: 20, color: '#48CFAD' },
              { name: 'Designing', value: 25, color: '#FFCE54' }
            ]
          },
          {
            name: 'Data Analytics',
            sections: [
              { name: 'Frontend', value: 25, color: '#5D9CEC' },
              { name: 'Backend', value: 30, color: '#FC6E51' },
              { name: 'Testing', value: 25, color: '#48CFAD' },
              { name: 'Designing', value: 20, color: '#FFCE54' }
            ]
          },
          {
            name: 'Developer Department',
            sections: [
              { name: 'Frontend', value: 35, color: '#5D9CEC' },
              { name: 'Backend', value: 20, color: '#FC6E51' },
              { name: 'Testing', value: 25, color: '#48CFAD' },
              { name: 'Designing', value: 20, color: '#FFCE54' }
            ]
          },
          {
            name: 'Testing Department',
            sections: [
              { name: 'Frontend', value: 20, color: '#5D9CEC' },
              { name: 'Backend', value: 30, color: '#FC6E51' },
              { name: 'Testing', value: 30, color: '#48CFAD' },
              { name: 'Designing', value: 20, color: '#FFCE54' }
            ]
          }
        ],
        employeesByDepartment: [
          { name: 'HR Department', count: 30, color: '#5D9CEC' },
          { name: 'Developers', count: 30, color: '#48CFAD' },
          { name: 'Data Analytics', count: 30, color: '#FC6E51' },
          { name: 'Testing Department', count: 30, color: '#AC92EC' }
        ],
        departmentsOverview: {
          totalDepartments: 4,
          monthlyPresent: 40,
          departmentData: [
            { day: 'HR Department', value: 30 },
            { day: 'Developers Department', value: 35 },
            { day: 'Data Analytics', value: 32 },
            { day: 'Testing Department', value: 40 }
          ]
        },
        recentActivity: [
          {
            employeeId: 'U2505',
            employeeName: 'Vignesh',
            department: 'Developer',
            joiningDate: '12 \ 05 \ 2025',
            currentStatus: 'New Joiner'
          },
          {
            employeeId: 'U2505',
            employeeName: 'Vignesh',
            department: 'Developer',
            joiningDate: '12 \ 05 \ 2025',
            currentStatus: 'New Joiner'
          }
        ]
      };

      setDepartmentData(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching department data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!departmentData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400">Failed to load department data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Department Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2.5 bg-purple-500 text-white rounded-xl hover:bg-[#3d5a72] transition-colors">
          <Plus size={20} />
          <span className="font-medium">Add Department</span>
        </button>
      </div>

      {/* Department Charts Grid */}
      <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-200">Total Departments of this month</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {departmentData.departmentCharts.map((dept, idx) => (
            <div key={idx} className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {dept.sections.map((section, sIdx) => {
                      const total = dept.sections.reduce((sum, s) => sum + s.value, 0);
                      const percentage = (section.value / total) * 100;
                      const offset = dept.sections
                        .slice(0, sIdx)
                        .reduce((sum, s) => sum + (s.value / total) * 100, 0);
                      
                      return (
                        <circle
                          key={sIdx}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={section.color}
                          strokeWidth="20"
                          strokeDasharray={`${percentage * 2.513} ${251.3 - percentage * 2.513}`}
                          strokeDashoffset={-offset * 2.513}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-300">{dept.sections.length}</div>
                      <div className="text-xs text-gray-400">Sections</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-200 text-center mb-3">{dept.name}</h4>
                <div className="space-y-2">
                  {dept.sections.map((section, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: section.color }}></div>
                        <span className="text-gray-300">{section.name}</span>
                      </div>
                      <span className="font-medium text-gray-200">{section.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employees by Department */}
        <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-200 mb-6">Employees by Department</h3>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {departmentData.employeesByDepartment.map((dept, idx) => {
                  const total = departmentData.employeesByDepartment.reduce((sum, d) => sum + d.count, 0);
                  const percentage = (dept.count / total) * 100;
                  const offset = departmentData.employeesByDepartment
                    .slice(0, idx)
                    .reduce((sum, d) => sum + (d.count / total) * 100, 0);
                  
                  return (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={dept.color}
                      strokeWidth="20"
                      strokeDasharray={`${percentage * 2.513} ${251.3 - percentage * 2.513}`}
                      strokeDashoffset={-offset * 2.513}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-200">
                    {departmentData.employeesByDepartment.reduce((sum, d) => sum + d.count, 0)}
                  </div>
                  <div className="text-xs text-gray-400">Total</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {departmentData.employeesByDepartment.map((dept, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }}></div>
                  <span className="text-sm text-gray-300">{dept.name}</span>
                </div>
                <span className="font-medium text-gray-200">{dept.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Departments Overview */}
        <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-200">Departments Overview</h3>
            <select 
              className="text-sm border border-white/10 rounded-lg px-3 py-1.5"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option>Weekday</option>
              <option>Weekend</option>
              <option>Monthly</option>
            </select>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-3 mb-2">
              <div className="text-sm text-gray-300">
                <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                30 Present
              </div>
              <div className="text-sm text-gray-300">Thu, 12 Jul</div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="space-y-1">
            <div className="flex justify-between items-end h-48 gap-2">
              {departmentData.departmentsOverview.departmentData.map((dept, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full bg-[#5D9CEC] rounded-t-lg relative group cursor-pointer"
                    style={{ height: `${(dept.value / 40) * 100}%` }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                      <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                        <div className="font-semibold">{dept.value} Employees</div>
                        <div className="text-gray-300">{dept.day}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* X-axis labels */}
            <div className="flex justify-between gap-2 mt-3">
              {departmentData.departmentsOverview.departmentData.map((dept, idx) => (
                <div key={idx} className="flex-1 text-center">
                  <span className="text-xs text-gray-400 block truncate">{dept.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-200">Recent Activity</h3>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 border border-white/10 rounded-lg hover:bg-white/10">
              <Filter size={16} />
              <span>Filter</span>
              <span className="text-xs">▼</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 border border-white/10 rounded-lg hover:bg-white/10">
              <Search size={16} />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Employee ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Employee Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Department</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Joining Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Current Status</th>
              </tr>
            </thead>
            <tbody>
              {departmentData.recentActivity.map((activity, idx) => (
                <tr key={idx} className="border-b border-white/10 hover:bg-white/10">
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-200">{activity.employeeId}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                        <img src={DummyProfile} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm text-gray-200">{activity.employeeName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-200">{activity.department}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-200">{activity.joiningDate}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-200">{activity.currentStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Department;
