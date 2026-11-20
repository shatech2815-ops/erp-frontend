import React, { useState, useEffect } from 'react';
import { Plus, Eye, DollarSign, TrendingUp } from 'lucide-react';

const Payroll = () => {
  const [loading, setLoading] = useState(true);
  const [payrollData, setPayrollData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('Previous Month');

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      /* 
        ============================================================
        BACKEND API ROUTE - GET PAYROLL DATA:
        ============================================================
        Endpoint: GET /api/payroll/overview
        Method: GET
        Headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {token}'
        }
        
        Expected Response Format:
        {
          processPayRun: {
            employeesNetPay: string,
            paymentDetails: string,
            numberOfEmployees: number,
            runDate: string
          },
          paymentDetails: {
            amount: string,
            date: string
          },
          todoTasks: [
            {
              title: string,
              description: string,
              status: 'Approved' | 'Pending approval' | 'Pending approval'
            }
          ],
          deductionSummary: {
            epf: { label: string, amount: string },
            esi: { label: string, amount: string },
            tdsDeduction: { label: string, amount: string }
          },
          employeeSummary: {
            activeEmployee: { count: number, label: string },
            resignedEmployee: { count: number, label: string }
          },
          recentPayrollHistory: [
            {
              employee: string,
              hours: number,
              department: string,
              grossPay: string,
              deductions: string,
              netPay: string
            }
          ]
        }
        
        BACKEND API ROUTE - CREATE PAY SLIP:
        Endpoint: POST /api/payroll/pay-slip
        Method: POST
        Body: { employeeId: string, month: string, year: number }
        Headers: Authorization: Bearer {token}
      */

      // Dummy data - replace with actual API call
      const response = {
        processPayRun: {
          employeesNetPay: '₹47,35,23,654.03',
          paymentDetails: '31 May 2025',
          numberOfEmployees: 1308,
          runDate: '31 May 2025. Record if time and way you make the payment'
        },
        paymentDetails: {
          amount: '₹47,35,23,654.03',
          date: '31 May 2025'
        },
        todoTasks: [
          {
            title: '138 Reimbursement Claims',
            description: 'Pending approval',
            status: 'Approved'
          },
          {
            title: '56 proof of Investments',
            description: 'Pending approval',
            status: 'Approved'
          },
          {
            title: '55 Salary Revisions',
            description: 'Pending approval',
            status: 'Approved'
          }
        ],
        deductionSummary: {
          epf: { label: 'EPF', amount: '€118,89,912.00' },
          esi: { label: 'ESI', amount: '€9,010.00' },
          tdsDeduction: { label: 'TDS Deduction', amount: '€118,89,089.00' }
        },
        employeeSummary: {
          activeEmployee: { count: 1308, label: 'Active Employee' },
          resignedEmployee: { count: 55, label: 'Resigned Employee' }
        },
        recentPayrollHistory: [
          {
            employee: 'Vignesh',
            hours: 30,
            department: 'Developer',
            grossPay: '₹4,50,000',
            deductions: '₹ 2500',
            netPay: '₹37,000'
          },
          {
            employee: 'Vignesh',
            hours: 30,
            department: 'Developer',
            grossPay: '₹4,50,000',
            deductions: '₹ 2500',
            netPay: '₹37,000'
          },
          {
            employee: 'Vignesh',
            hours: 30,
            department: 'Developer',
            grossPay: '₹4,50,000',
            deductions: '₹ 2500',
            netPay: '₹37,000'
          },
          {
            employee: 'Vignesh',
            hours: 30,
            department: 'Developer',
            grossPay: '₹4,50,000',
            deductions: '₹ 2500',
            netPay: '₹37,000'
          }
        ]
      };

      setPayrollData(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      setLoading(false);
    }
  };

  const handleCreatePaySlip = () => {
    // Handle pay slip creation
    console.log('Creating pay slip...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!payrollData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400">Failed to load payroll data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Pay Slip Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleCreatePaySlip}
          className="flex items-center gap-2 px-6 py-2.5 bg-purple-500 text-white rounded-xl hover:bg-[#3d5a72] transition-colors"
        >
          <Plus size={20} />
          <span className="font-medium">Create Pay slip</span>
        </button>
      </div>

      {/* Top Section - Process Pay Run */}
      <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-200 mb-6">Process pay run for May 2025</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Employees Net Pay */}
          <div className="space-y-2">
            <p className="text-sm text-gray-300">Employees Net Pay</p>
            <p className="text-2xl font-bold text-gray-200">{payrollData.processPayRun.employeesNetPay}</p>
          </div>

          {/* Payment Details */}
          <div className="space-y-2">
            <p className="text-sm text-gray-300">Payment Details</p>
            <p className="text-lg text-gray-200">{payrollData.processPayRun.paymentDetails}</p>
          </div>

          {/* No of Employees */}
          <div className="space-y-2">
            <p className="text-sm text-gray-300">No of Employees</p>
            <p className="text-2xl font-bold text-gray-200">{payrollData.processPayRun.numberOfEmployees}</p>
            <button className="mt-2 px-4 py-2 text-sm text-white bg-purple-500 rounded-lg hover:bg-[#3d5a72]">
              View Details
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-300 mt-4">{payrollData.processPayRun.runDate}</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - To-do Tasks & Deduction Summary */}
        <div className="space-y-6">
          {/* To-do Tasks */}
          <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-200 mb-4">To do Tasks</h3>
            <div className="space-y-3">
              {payrollData.todoTasks.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-200">{task.title}</p>
                    <p className="text-xs text-gray-300">{task.description}</p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-green-800 text-white rounded-full ml-2">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Deduction summary */}
          <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-200">Deduction summary</h3>
              <select 
                className="text-xs border border-white/10 rounded-lg px-2 py-1"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option>Previous Month</option>
                <option>This Month</option>
              </select>
            </div>
            
            <div className="space-y-4">
              {/* EPF */}
              <div className="p-4 bg-amber-500/10 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <DollarSign size={24} className="text-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{payrollData.deductionSummary.epf.label}</p>
                    <p className="text-lg font-bold text-gray-200">{payrollData.deductionSummary.epf.amount}</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-500/10 text-gray-200 rounded-lg text-xs hover:bg-[#B8D1E5]">
                  View Details
                </button>
              </div>

              {/* ESI */}
              <div className="p-4 bg-amber-500/10 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <DollarSign size={24} className="text-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{payrollData.deductionSummary.esi.label}</p>
                    <p className="text-lg font-bold text-gray-200">{payrollData.deductionSummary.esi.amount}</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-500/10 text-gray-200 rounded-lg text-xs hover:bg-[#B8D1E5]">
                  View Details
                </button>
              </div>

              {/* TDS Deduction */}
              <div className="p-4 bg-blue-500/10 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#140f2d]/80 rounded-lg flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-300">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">{payrollData.deductionSummary.tdsDeduction.label}</p>
                      <p className="text-lg font-bold text-gray-200">{payrollData.deductionSummary.tdsDeduction.amount}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-[#140f2d]/80 text-gray-200 rounded-lg text-xs hover:bg-white/10">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Summary */}
          <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-200 mb-4">Employee Summary</h3>
            
            <div className="space-y-4">
              {/* Active Employee */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-400">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-200">{payrollData.employeeSummary.activeEmployee.count}</p>
                    <p className="text-sm text-gray-300">{payrollData.employeeSummary.activeEmployee.label}</p>
                  </div>
                </div>
                <button className="text-gray-300 hover:text-white">
                  <Eye size={20} />
                </button>
              </div>

              {/* Resigned Employee */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-400">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-200">{payrollData.employeeSummary.resignedEmployee.count}</p>
                    <p className="text-sm text-gray-300">{payrollData.employeeSummary.resignedEmployee.label}</p>
                  </div>
                </div>
                <button className="text-gray-300 hover:text-white">
                  <Eye size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Payroll History */}
        <div className="lg:col-span-2 bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-200">Recent Payroll History</h3>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 border border-white/10 rounded-lg hover:bg-white/10">
                <span>Filter</span>
                <span className="text-xs">▼</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Employee</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Hours</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Gross Pay</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Deductions</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.recentPayrollHistory.map((record, idx) => (
                  <tr key={idx} className="border-b border-white/10 hover:bg-white/10">
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-200">{record.employee}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-200">{record.hours}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-200">{record.department}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-200">{record.grossPay}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-200">{record.deductions}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-200">{record.netPay}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
