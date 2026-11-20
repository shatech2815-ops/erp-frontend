import React, { useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  ToastContainer,
  toast,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { loginUser } from "../services/Login/auth.services";

const LoginPage = () => {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // =========================
  // Handle Input Change
  // =========================
  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // Handle Login
  // =========================
  const handleLogin = async () => {

  if (
    !formData.username ||
    !formData.password
  ) {

    toast.warning(
      "Please enter username and password"
    );

    return;
  }

  try {

    setLoading(true);

    const response = await loginUser({
      username: formData.username,
      password: formData.password,
    });

    console.log(response);

    // =========================
    // LOGIN SUCCESS
    // =========================
    if (response.success) {

      // SAVE LOGIN STATUS
      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      // SAVE TOKEN
      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      // SAVE USER DATA
      localStorage.setItem(
        "user",
        JSON.stringify(response)
      );

      toast.success("Login Successful");

      // NAVIGATE TO DASHBOARD
      navigate("/dashboard");

    } else {

      toast.error(
        response.message ||
        "Login Failed"
      );
    }

  } catch (error) {

    console.error(error);

    toast.error(
      error?.response?.data?.message ||
      "Invalid Username or Password"
    );

  } finally {

    setLoading(false);
  }
};

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden px-4 py-10">
      <div className="ambient-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 glass-panel rounded-[36px] shadow-glass-lg overflow-hidden border border-white/60 relative z-10 animate-fade-in-up">

        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-center px-16 py-20 bg-brand-gradient-dark text-white relative overflow-hidden">
          <div className="absolute top-[-100px] right-[-100px] w-[280px] h-[280px] bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-[-120px] left-[-120px] w-[300px] h-[300px] bg-accent-500/20 rounded-full blur-2xl" />

          <div className="flex items-center gap-4 mb-10 z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-lg flex items-center justify-center border border-white/20 shadow-glow">
              <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 27L20 12L28 27" stroke="#F5B93A" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.2 21H24.8" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Aminoid Ai</h2>
              <p className="text-sm text-brand-200">ERP Management System</p>
            </div>
          </div>

          <div className="z-10">
            <h1 className="text-5xl font-bold leading-tight">
              Welcome Back <span className="inline-block">👋</span>
            </h1>
            <p className="mt-6 text-lg text-brand-200 leading-8">
              Manage operations, invoices, vendors and business workflows
              securely with your engineering ERP dashboard.
            </p>
          </div>

          <div className="mt-12 bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur-lg z-10 hover:bg-white/[0.14] transition-colors duration-300">
            <p className="text-sm text-brand-100">
              Smart business management dashboard with real-time
              operations, analytics and client management.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-white/95 px-8 sm:px-14 py-16 flex flex-col justify-center">

          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-3xl bg-brand-gradient flex items-center justify-center shadow-glow-lg">
              <svg width="38" height="38" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 27L20 12L28 27" stroke="#F5B93A" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.2 21H24.8" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-brand-900 mt-5">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Login to continue</p>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:block mb-10">
            <h1 className="text-4xl font-bold text-brand-900">Login Account</h1>
            <p className="text-gray-500 mt-3 text-lg">Access your dashboard securely</p>
          </div>

          {/* Username */}
          <div className="mb-7">
            <label className="block text-brand-900 font-semibold mb-3">Username</label>
            <div className="h-16 border border-gray-200 rounded-2xl flex items-center overflow-hidden focus-within:border-brand-500 focus-within:shadow-glow transition-all duration-200">
              <div className="w-16 h-full bg-brand-50 border-r border-gray-100 flex items-center justify-center">
                <User className="text-brand-600" size={22} />
              </div>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                className="w-full h-full px-5 outline-none text-lg bg-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-10">
            <label className="block text-brand-900 font-semibold mb-3">Password</label>
            <div className="h-16 border border-gray-200 rounded-2xl flex items-center overflow-hidden focus-within:border-brand-500 focus-within:shadow-glow transition-all duration-200">
              <div className="w-16 h-full bg-brand-50 border-r border-gray-100 flex items-center justify-center">
                <Lock className="text-brand-600" size={22} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full h-full px-5 outline-none text-lg bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-5 text-gray-400 hover:text-brand-600"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="h-16 rounded-2xl bg-brand-gradient text-white text-xl font-semibold shadow-glow-lg hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-gray-400 mt-8 text-sm">
            © 2026 Aminoid Ai ERP
          </p>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  );

};

export default LoginPage;