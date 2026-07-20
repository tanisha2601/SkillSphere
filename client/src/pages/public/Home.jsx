import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  ShieldCheck,
  Brain,
  Star,
  Users,
  Briefcase,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

const stats = [
  { value: '15K+', label: 'Freelancers' },
  { value: '8K+', label: 'Projects Completed' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '24/7', label: 'Support' },
];

const features = [
  {
    icon: Brain,
    title: 'AI Powered Matching',
    desc: 'Smart recommendations based on skills, location and reputation score.',
  },
  {
    icon: MapPin,
    title: 'Hyperlocal Search',
    desc: 'Find trusted professionals around your city within minutes.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Escrow',
    desc: 'Protected milestone payments and secure transactions.',
  },
];

const categories = [
  'Web Development',
  'UI/UX Design',
  'Mobile Apps',
  'AI & ML',
  'Marketing',
  'Content Writing',
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[140px]" />
      <div className="absolute right-0 top-40 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[140px]" />

      {/* HERO */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm">
              Intelligent Hyperlocal Freelance Ecosystem
            </span>

            <h1 className="mt-8 text-5xl lg:text-7xl font-bold leading-tight">
              Hire The
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Best Local Talent
              </span>
            </h1>

            <p className="mt-6 text-slate-400 text-lg max-w-xl leading-8">
              SkillSphere helps clients discover verified freelancers, collaborate in real-time and
              securely manage projects with AI-powered recommendations.
            </p>

            <div className="mt-10 flex flex-wrap gap-5">
              <Link
                to="/services"
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold hover:scale-105 transition"
              >
                Explore Services
              </Link>

              <Link
                to="/register"
                className="px-7 py-4 rounded-2xl border border-slate-700 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition"
              >
                Become Freelancer
              </Link>
            </div>

            <div className="mt-12 flex gap-8 flex-wrap">
              {stats.map((item) => (
                <div key={item.label}>
                  <h3 className="text-3xl font-bold">{item.value}</h3>
                  <p className="text-slate-400 text-sm mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT CARD */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="rounded-[35px] border border-white/10 bg-white/5 backdrop-blur-3xl p-8 shadow-2xl">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">React Developer</h4>
                    <p className="text-slate-400 text-sm">Remote • $45k Budget</p>
                  </div>

                  <div className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-xl">
                    AI Match 95%
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900/70 p-5 border border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />

                    <div>
                      <h3 className="font-semibold">Priya Sharma</h3>

                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star size={16} fill="currentColor" />
                        4.9
                      </div>

                      <p className="text-sm text-slate-400">MERN Developer • Delhi</p>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-between text-sm">
                    <span className="text-slate-400">Completed Projects</span>

                    <span className="font-semibold">128+</span>
                  </div>
                </div>

                <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold flex justify-center items-center gap-2">
                  Hire Now
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">Why SkillSphere?</h2>

          <p className="text-slate-400 mt-5">
            Built for modern freelancing and local collaboration.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                whileHover={{ y: -8 }}
                key={item.title}
                className="rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                  <Icon className="text-blue-400" />
                </div>

                <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>

                <p className="mt-4 text-slate-400 leading-7">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center">Popular Categories</h2>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-5 mt-14">
            {categories.map((item) => (
              <motion.div
                whileHover={{ scale: 1.05 }}
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center cursor-pointer"
              >
                <Briefcase className="mx-auto text-blue-400 mb-4" size={28} />

                <h3>{item}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="rounded-[40px] bg-gradient-to-r from-blue-600/20 to-cyan-500/10 border border-blue-500/20 p-14 text-center backdrop-blur-3xl">
          <TrendingUp className="mx-auto text-blue-400" size={50} />

          <h2 className="mt-8 text-4xl font-bold">Ready To Build Something Amazing?</h2>

          <p className="text-slate-300 mt-6 max-w-2xl mx-auto">
            Join thousands of freelancers and clients building the future of hyperlocal work.
          </p>

          <Link
            to="/register"
            className="inline-flex mt-10 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold hover:scale-105 transition"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
