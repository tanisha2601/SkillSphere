import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';

import { FcGoogle } from 'react-icons/fc';

import { loginUser } from '../../services/authService';

import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import AuthLayout from '../../components/layout/AuthLayout';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    dispatch(loginStart());
    setLoading(true);

    try {
      const response = await loginUser(formData);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      dispatch(
        loginSuccess({
          user: response.user,
          token: response.token,
        })
      );

      toast.success('Login Successful');

      if (response.user.role === 'client') {
        navigate('/client/dashboard', {
          replace: true,
        });
      } else if (response.user.role === 'freelancer') {
        navigate('/freelancer/dashboard', {
          replace: true,
        });
      } else {
        navigate('/admin/dashboard', {
          replace: true,
        });
      }
    } catch (error) {
      dispatch(loginFailure(error.message));

      toast.error(error.message || 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Login to continue your journey."
      heroTitle={"Connect.\nHire.\nBuild."}
      heroDescription="AI-powered hyperlocal freelance marketplace connecting talented professionals and clients."
      showFeatures={true}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* EMAIL */}
        <div>
          <label className="text-sm text-slate-400">Email</label>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <Mail size={18} className="text-slate-300" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div>
          <label className="text-sm text-slate-400">Password</label>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <Lock size={18} className="text-slate-300" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-white transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* FORGOT PASSWORD */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-400 hover:text-cyan-300 transition"
          >
            Forgot Password?
          </Link>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* GOOGLE OAUTH */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#060818] text-slate-400">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toast('Google OAuth integration is under configuration.', { icon: '⚙️' })}
          className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 text-white font-semibold flex items-center justify-center gap-3 hover:bg-white/[0.08] transition-colors"
        >
          <FcGoogle size={22} />
          Continue with Google
        </button>

        <p className="text-center text-slate-400 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 font-medium hover:text-cyan-300 transition">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
