import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Briefcase, UserPlus, CircleEllipsis } from 'lucide-react';
import DummyProfile from "../assets/images/dummyprofile.jpeg";
import { AddEmployeeModal } from '../components/Modals';

const Employees = () => {
  const [loading, setLoading] = useState(true);
  const [employeesData, setEmployeesData] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('This month');
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);

  useEffect(() => {
    fetchEmployeesData();
  }, []);

  const fetchEmployeesData = async () => {
    setLoading(true);
    try {
      /* 
        ============================================================
        BACKEND API ROUTE - GET EMPLOYEES DATA:
        ============================================================
        Endpoint: GET /api/employees/overview
        Method: GET
        Headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {token}'
        }
        
        Expected Response Format:
        {
          totalEmployees: number,
          totalEmployeesChange: number,
          fullTime: number,
          fullTimeChange: number,
          partTime: number,
          partTimeChange: number,
          internship: number,
          internshipChange: number,
          attendanceRate: number,
          attendanceData: [
            { department: string, values: [number, number, ...] }
          ],
          teamPerformance: {
            percentage: number,
            monthlyData: [
              { month: string, value: number }
            ]
          },
          calendarAlerts: [
            { type: string, message: string }
          ],
          birthdayAlerts: [
            { type: string, message: string }
          ],
          workAnniversaryAlerts: [
            { type: string, message: string }
          ],
          leaveRequests: [
            { id: number, name: string, type: string, days: number, status: string }
          ],
          jobApplicants: {
            total: number,
            compared: string,
            monthsToCompare: number
          }
        }
      */

      // Dummy data - replace with actual API call
      const response = {
        totalEmployees: { value: 105, change: 20 },
        fullTime: { value: 75, change: 15 },
        partTime: { value: 15, change: -5 },
        internship: { value: 10, change: 10 },
        attendanceRate: 82,
        attendanceData: [
          { department: 'HR Department', values: [35, 32, 35, 32, 32, 32, 35] },
          { department: 'Developers', values: [32, 35, 32, 35, 32, 32, 32] },
          { department: 'Data Analytics', values: [28, 32, 28, 32, 28, 28, 28] },
          { department: 'Testers', values: [25, 28, 25, 28, 25, 25, 25] }
        ],
        teamPerformance: {
          percentage: 88.52,
          monthlyData: [
            { month: 'Jan', value: 10 },
            { month: 'Feb', value: 20 },
            { month: 'Mar', value: 15 },
            { month: 'Apr', value: 30 },
            { month: 'May', value: 25 },
            { month: 'Jun', value: 35 },
            { month: 'Jul', value: 40 }
          ]
        },
        calendarAlerts: [
          { month: 'September 2021', days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], dates: Array.from({length: 30}, (_, i) => i + 1), highlight: 18 }
        ],
        birthdayAlerts: [
          { message: "Today Dinesh Birthday, say 'Happy Birthday'" },
          { message: "Today Dinesh Birthday, say 'Happy Birthday'" },
          { message: "Today Dinesh Birthday, say 'Happy Birthday'" }
        ],
        workAnniversaryAlerts: [
          { message: "Dinars successfully completed 2 year of journey" },
          { message: "Dinars successfully completed 2 year of journey" },
          { message: "Dinars successfully completed 2 year of journey" }
        ],
        leaveRequests: [
          { id: 1, name: 'Dinesh', type: 'Approved', days: 1, status: 'approved' },
          { id: 2, name: 'Dinesh', type: 'Request today', days: 1, status: 'pending' },
          { id: 3, name: 'Dinesh', type: 'Approved', days: 1, status: 'approved' }
        ],
        jobApplicants: {
          total: 12,
          compared: 'compared to last month',
          monthsToCompare: 3
        },
        employeeStatus: {
          totalEmployees: 100,
          fullTime: 75,
          partTime: 15,
          internship: 10
        }
      };

      setEmployeesData(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees data:', error);
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

  if (!employeesData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400">Failed to load employees data</p>
      </div>
    );
  }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      {/* Add Employee Button - Top Right */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-3 bg-[#5B7C99] text-white rounded-xl hover:bg-[#4a6579] transition-colors">
          <UserPlus size={20} />
          <span className="font-medium">Add Employee</span>
        </button>
      </div>

        <AddEmployeeModal 
        isOpen={isAddEmployeeModalOpen} 
        onClose={() => setIsAddEmployeeModalOpen(false)} 
      />

      {/* Header Stats - Matching Figma Design Exactly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-gray-400 text-sm">Total Employees</p>
            <button className="text-gray-400">
              <CircleEllipsis size={20} />
            </button>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-4xl font-bold text-white">105</h3>
            <div className="flex items-center gap-1">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-sm font-medium text-green-500">+20%</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-3">vs last month</p>
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-gray-300 font-medium mb-1">Employees</p>
            <p className="text-xs text-gray-400">You're part of growing team</p>
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-gray-400 text-sm">Attendance</p>
            <button className="text-gray-400">
              <CircleEllipsis size={20} />
            </button>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-4xl font-bold text-white">82%</h3>
            <div className="flex items-center gap-1">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-sm font-medium text-green-500">+82%</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-3">of last month</p>
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-gray-300 font-medium mb-1">Present - 1 Absent-1 Unavailable</p>
            <p className="text-xs text-gray-400">Hasn't part of passing team this</p>
          </div>
        </div>

        {/* Leave Request */}
        <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-gray-400 text-sm">Leave Request</p>
            <button className="text-gray-400">
              <CircleEllipsis size={20} />
            </button>
          </div>
          <div className="flex items-center gap-6 mb-2">
            <div>
              <h3 className="text-4xl font-bold text-white">1</h3>
              <p className="text-xs text-gray-400 mt-1">Approved</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white">1</h3>
              <p className="text-xs text-gray-400 mt-1">Request today</p>
            </div>
          </div>
          <div className="pt-3 border-t border-white/10 mt-3">
            <p className="text-xs text-gray-300 font-medium mb-1">1 employee submitted 2 leaves request</p>
            <p className="text-xs text-gray-400">3 employees are requesting this month</p>
          </div>
        </div>

        {/* Job Applicants */}
        <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="text-gray-400 text-sm">Job Applicants</p>
            <button className="text-gray-400">
              <CircleEllipsis size={20} />
            </button>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-4xl font-bold text-white">12%</h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">compared to last month</p>
          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-gray-300 font-medium">You have to review 33 new applicants</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Attendance Report & Team Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Report */}
          <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-200">Attendance Report</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <select 
                    className="text-sm border border-white/10 rounded-lg px-3 py-1.5 text-gray-300"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  >
                    <option>This month</option>
                    <option>Last month</option>
                    <option>This year</option>
                  </select>
                  <select className="text-sm border border-white/10 rounded-lg px-3 py-1.5 text-gray-300">
                    <option>Weekday</option>
                    <option>Weekend</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Attendance Chart */}
            <div className="space-y-4">
              {employeesData.attendanceData.map((dept, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 font-medium">{dept.department}</span>
                    <div className="flex gap-8 text-xs text-gray-400">
                      {daysOfWeek.map((day) => (
                        <span key={day} className="w-8 text-center">{day.substring(0, 3)}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-2 flex-1 justify-end">
                      {dept.values.map((value, valIdx) => (
                        <div key={valIdx} className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500 text-white text-xs font-medium">
                          {value}
                        </div>
                      ))}
                    </div>
                    <button className="px-4 py-1.5 bg-blue-500/10 text-gray-200 rounded-lg text-xs font-medium hover:bg-[#B8D1E5]">
                      Holiday
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Performance - Dynamic & Improved */}
          <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-200 text-lg">Team Performance</h3>
              <select className="text-sm border border-white/10 rounded-lg px-3 py-2 text-gray-300 bg-[#140f2d]/80">
                <option>This month</option>
                <option>Last month</option>
                <option>Last 3 months</option>
                <option>This year</option>
              </select>
            </div>
            
            <div className="mb-6">
              <div className="text-4xl font-bold text-white mb-2">{employeesData.teamPerformance.percentage}%</div>
              <p className="text-sm text-gray-300">Performance has increased in this month</p>
            </div>

            {/* Enhanced Dynamic Line Chart */}
            <div className="relative mt-8">
              {/* Chart Container */}
              <div className="flex gap-3">
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between text-xs text-gray-400 h-56 py-2">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
                
                {/* Chart area */}
                <div className="flex-1 relative h-56">
                  {/* Horizontal grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-full border-t border-white/10"></div>
                    ))}
                  </div>
                  
                  {/* SVG Chart */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <defs>
                      {/* Gradient for area under the line */}
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#5B7C99', stopOpacity: 0.2 }} />
                        <stop offset="100%" style={{ stopColor: '#5B7C99', stopOpacity: 0 }} />
                      </linearGradient>
                    </defs>
                    
                    {/* Area fill */}
                    <path
                      d={(() => {
                        const points = employeesData.teamPerformance.monthlyData.map((d, i) => {
                          const x = (i / (employeesData.teamPerformance.monthlyData.length - 1)) * 100;
                          const y = 100 - (d.value);
                          return `${x},${y}`;
                        });
                        return `M 0,100 L ${points.join(' L ')} L 100,100 Z`;
                      })()}
                      fill="url(#areaGradient)"
                      vectorEffect="non-scaling-stroke"
                    />
                    
                    {/* Line path */}
                    <polyline
                      points={employeesData.teamPerformance.monthlyData.map((d, i) => {
                        const x = (i / (employeesData.teamPerformance.monthlyData.length - 1)) * 100;
                        const y = 100 - (d.value);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#5B7C99"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  
                  {/* Data points with hover effect */}
                  <div className="absolute inset-0">
                    {employeesData.teamPerformance.monthlyData.map((d, i) => {
                      const x = (i / (employeesData.teamPerformance.monthlyData.length - 1)) * 100;
                      const y = 100 - d.value;
                      return (
                        <div
                          key={i}
                          className="absolute w-3 h-3 -ml-1.5 -mt-1.5 group"
                          style={{ 
                            left: `${x}%`, 
                            top: `${y}%`
                          }}
                        >
                          <div className="w-3 h-3 rounded-full bg-[#5B7C99] border-2 border-white shadow-md cursor-pointer transition-transform group-hover:scale-150"></div>
                          
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                              <div className="font-semibold">{d.value}%</div>
                              <div className="text-gray-300">{d.month}</div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                                <div className="border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* X-axis month labels */}
              <div className="flex justify-between mt-3 text-xs text-gray-400 font-medium ml-10">
                {employeesData.teamPerformance.monthlyData.map((d, i) => (
                  <span key={i}>{d.month}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Alerts & Status */}
        <div className="lg:col-span-1 space-y-6">
          {/* Calendar Alert - Dynamic */}
          <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-200 text-lg mb-6">Calendar Alert</h3>
            
            {/* Dynamic Calendar */}
            <div className="space-y-4">
              {(() => {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth(); // 0-11
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                   'July', 'August', 'September', 'October', 'November', 'December'];
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                
                // Get first day of month (0 = Sunday, 6 = Saturday)
                const firstDay = new Date(currentYear, currentMonth, 1).getDay();
                
                // Get number of days in current month
                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                
                // Get current day
                const currentDay = now.getDate();
                
                // Create array for all dates including empty cells for alignment
                const calendarDates = [];
                
                // Add empty cells for days before month starts
                for (let i = 0; i < firstDay; i++) {
                  calendarDates.push(null);
                }
                
                // Add all days of the month
                for (let day = 1; day <= daysInMonth; day++) {
                  calendarDates.push(day);
                }
                
                return (
                  <>
                    <div className="text-center mb-4">
                      <h4 className="text-base font-semibold text-gray-200">
                        {monthNames[currentMonth]} {currentYear}
                      </h4>
                    </div>
                    
                    {/* Calendar Grid */}
                    <div className="space-y-2">
                      {/* Day headers */}
                      <div className="grid grid-cols-7 gap-1">
                        {dayNames.map((day, i) => (
                          <div key={i} className="text-center text-xs font-medium text-gray-400 py-2">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      {/* Date cells */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDates.map((date, idx) => (
                          <div 
                            key={idx}
                            className={`text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                              date === null 
                                ? '' 
                                : date === currentDay 
                                  ? 'bg-red-500 text-white shadow-md' 
                                  : 'text-gray-300 hover:bg-white/10 cursor-pointer'
                            }`}
                          >
                            {date || ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Birthday Alert */}
          <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-200 text-lg mb-4">Birthday Alert</h3>
            <div className="space-y-3">
              {employeesData.birthdayAlerts.map((alert, idx) => (
                <div key={idx} className="text-sm text-gray-300 p-4 bg-blue-500/10 rounded-xl border border-blue-100">
                  {alert.message}
                </div>
              ))}
            </div>
          </div>

          {/* Work Anniversary Alert */}
          <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-200 text-lg mb-4">Work Anniversary Alert</h3>
            <div className="space-y-3">
              {employeesData.workAnniversaryAlerts.map((alert, idx) => (
                <div key={idx} className="text-sm text-gray-300 p-4 bg-blue-500/10 rounded-xl border border-blue-100">
                  {alert.message}
                </div>
              ))}
            </div>
          </div>

          {/* Employee Status */}
          <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-200 text-lg mb-6">Employee Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#5D9CEC] flex-shrink-0"></div>
                <span className="text-sm text-gray-300 font-medium">Total Employee - 100</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#48CFAD] flex-shrink-0"></div>
                <span className="text-sm text-gray-300 font-medium">Full Time - 75</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#FC6E51] flex-shrink-0"></div>
                <span className="text-sm text-gray-300 font-medium">Part Time - 15</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#FFCE54] flex-shrink-0"></div>
                <span className="text-sm text-gray-300 font-medium">Internship - 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employees;
