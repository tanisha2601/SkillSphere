import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

import { FcGoogle } from 'react-icons/fc';
import { registerUser } from '../../services/authService';
import AuthLayout from '../../components/layout/AuthLayout';

export default function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'freelancer',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const passwordStrength =
  useMemo(() => {
    const p =
      formData.password;

    if (p.length < 6)
      return {
        text: "Weak",
        width: "33%",
      };

    const hasUpper =
      /[A-Z]/.test(p);

    const hasNumber =
      /[0-9]/.test(p);

    const hasSpecial =
      /[^A-Za-z0-9]/.test(p);

    if (
      hasUpper &&
      hasNumber &&
      hasSpecial
    ) {
      return {
        text: "Strong",
        width: "100%",
      };
    }

    return {
      text: "Medium",
      width: "66%",
    };
  }, [
    formData.password,
  ]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');

      return;
    }

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser(formData);

      toast.success(response.message || 'Registration Successful');

      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Registration Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join SkillSphere today."
      heroTitle={"Build Your\nFreelance\nFuture."}
      heroDescription="Join thousands of freelancers and clients building amazing projects together."
      showFeatures={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* NAME */}
        <div>
          <label className="text-sm text-slate-400">Full Name</label>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <User size={18} className="text-slate-300" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="flex-1 bg-transparent outline-none placeholder:text-slate-300"
            />
          </div>
        </div>

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
              placeholder="john@example.com"
              className="flex-1 bg-transparent outline-none placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* ROLE */}
        <div>
          <label className="text-sm text-slate-400">Choose Role</label>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: 'freelancer' }))}
              className={`p-5 rounded-2xl border transition flex flex-col items-center gap-3 ${
                formData.role === 'freelancer'
                  ? 'border-cyan-400 bg-cyan-400/10 text-white'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <Briefcase size={24} />
              <span className="font-medium">Freelancer</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: 'client' }))}
              className={`p-5 rounded-2xl border transition flex flex-col items-center gap-3 ${
                formData.role === 'client'
                  ? 'border-blue-500 bg-blue-500/10 text-white'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <Users size={24} />
              <span className="font-medium">Client</span>
            </button>
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
              placeholder="Create a strong password"
              className="flex-1 bg-transparent outline-none placeholder:text-slate-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-white transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: passwordStrength.width,
                  background:
                    passwordStrength.text === 'Weak'
                      ? '#EF4444'
                      : passwordStrength.text === 'Medium'
                      ? '#EAB308'
                      : '#22C55E',
                }}
              />
            </div>
            <span
              className="text-xs"
              style={{
                color:
                  passwordStrength.text === 'Weak'
                    ? '#EF4444'
                    : passwordStrength.text === 'Medium'
                    ? '#EAB308'
                    : '#22C55E',
              }}
            >
              {passwordStrength.text}
            </span>
          </div>
        </div>

        {/* CONFIRM PASSWORD */}
        <div>
          <label className="text-sm text-slate-400">Confirm Password</label>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <Lock size={18} className="text-slate-300" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="flex-1 bg-transparent outline-none placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Create Account <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* GOOGLE OAUTH */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#060818] text-slate-400">Or sign up with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toast('Google OAuth integration is under configuration.', { icon: '⚙️' })}
          className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 text-white font-semibold flex items-center justify-center gap-3 hover:bg-white/[0.08] transition-colors"
        >
          <FcGoogle size={22} />
          Sign up with Google
        </button>

        <p className="text-center mt-8 text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 font-medium hover:text-cyan-300 transition">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
