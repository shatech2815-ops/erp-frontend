import React, { useState } from 'react';
import { Send } from 'lucide-react';

const Help = () => {
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    message: ''
  });

  const [faqs] = useState([
    {
      question: "How do i downloads my payslip?",
      expanded: false
    },
    {
      question: "How do i downloads my payslip?",
      expanded: false
    },
    {
      question: "How do i downloads my payslip?",
      expanded: false
    },
    {
      question: "How do i downloads my payslip?",
      expanded: false
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      /* 
        ============================================================
        BACKEND API ROUTE - SUBMIT HELP QUERY:
        ============================================================
        Endpoint: POST /api/help/query
        Method: POST
        Headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {token}'
        }
        Body: {
          name: string,
          employeeId: string,
          message: string
        }
        
        Expected Response:
        {
          success: boolean,
          message: string,
          ticketId: string
        }
      */

      const response = await fetch('/api/help/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Your query has been submitted successfully!');
        setFormData({ name: '', employeeId: '', message: '' });
      }
    } catch (error) {
      console.error('Error submitting query:', error);
      alert('Failed to submit query. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#140f2d]/80 rounded-2xl p-8 shadow-sm text-center">
        <h1 className="text-3xl font-bold text-gray-200 mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-300">
          Save time and find instant solution without the hassle. From detailed guidance to quick tips, 
          everything you need is just a click away. Reach out to us directly, and we'll be happy to assist.
        </p>
      </div>

      {/* FAQ Section */}
      <div className="bg-[#140f2d]/80 rounded-2xl p-6 shadow-sm">
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="p-4 bg-blue-500/10 rounded-lg hover:bg-[#B8D1E5] transition-colors cursor-pointer"
            >
              <p className="text-gray-200 text-sm">{faq.question}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-[#140f2d]/80 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-200 mb-2 text-center">Any question for us?</h2>
        <p className="text-gray-300 mb-8 text-center">Reach out to us anytime!</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your Name"
              className="w-full px-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
              required
            />
          </div>

          {/* Employee ID Input */}
          <div>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              placeholder="Employee ID"
              className="w-full px-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
              required
            />
          </div>

          {/* Message Textarea */}
          <div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Enter your message"
              rows="6"
              className="w-full px-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-8 py-3 bg-purple-500 text-white rounded-xl hover:bg-[#3d5a72] transition-colors flex items-center gap-2 font-medium"
            >
              Submit
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Help;
