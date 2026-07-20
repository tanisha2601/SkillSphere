import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({
  title,
  subtitle,
  heroTitle,
  heroDescription,
  showFeatures = false,
  children,
}) {
  return (
    <section className="min-h-screen bg-[#020617] text-white overflow-hidden relative pt-24">
      {/* Background */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[150px] -top-40 -left-40" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/20 blur-[140px] bottom-0 right-0" />

      <div
        className="
          max-w-7xl mx-auto
          grid lg:grid-cols-[1.1fr_0.9fr]
          gap-24
          items-start
          pt-8 lg:pt-16 pb-20
          px-8 lg:px-12
          relative z-10
        "
      >
        {/* LEFT SECTION */}
        <div
          className="
            hidden lg:flex flex-col
            max-w-2xl
          "
        >
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                <Sparkles />
              </div>
              <h1 className="text-4xl font-bold">SkillSphere</h1>
            </div>

            <h2 className="text-6xl font-bold leading-tight whitespace-pre-line">
              {heroTitle}
            </h2>

            <p className="mt-8 text-slate-400 text-lg max-w-xl">
              {heroDescription}
            </p>

            {showFeatures && (
              <div className="mt-12 space-y-5 text-slate-300">
                <div>✓ AI Matching System</div>
                <div>✓ Real-Time Messaging</div>
                <div>✓ Secure Escrow Payments</div>
                <div>✓ Hyperlocal Freelancing</div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-6 mt-14">
              {[
                { value: '12K+', title: 'Freelancers' },
                { value: '25K+', title: 'Projects' },
                { value: '4.9', title: 'Rating' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="
                    rounded-[36px]
                    border border-white/10
                    bg-white/[0.04]
                    p-6
                    backdrop-blur-2xl
                  "
                >
                  <h3 className="text-3xl font-bold">{item.value}</h3>
                  <p className="text-slate-300 mt-2">{item.title}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT SECTION */}
        <div
          className="
            flex
            justify-center
            w-full
          "
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              w-full
              max-w-[560px]
              rounded-[32px]
              border border-white/10
              bg-white/[0.04]
              backdrop-blur-3xl
              p-10
              h-max
            "
          >
            <h2 className="text-4xl font-bold">{title}</h2>
            <p className="text-slate-400 mt-3">{subtitle}</p>

            <div className="mt-10">
              {children}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
