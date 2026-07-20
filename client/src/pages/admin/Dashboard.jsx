import React from 'react';

const stats = [
  {
    title: 'Active Users',
    value: '1',
    icon: '👥',
    color: 'from-indigo-500 to-purple-600',
    change: '↑ 100% since start',
  },
  {
    title: 'Total Jobs',
    value: '0',
    icon: '📁',
    color: 'from-emerald-500 to-teal-600',
    change: 'No jobs posted yet',
  },
  {
    title: 'Disputes',
    value: '0',
    icon: '🛡️',
    color: 'from-rose-500 to-red-600',
    change: 'No moderation issues',
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div
        className="
        relative
        overflow-hidden
        rounded-[36px]
        p-8
        bg-gradient-to-r
        from-slate-900
        via-indigo-900
        to-slate-900
        text-white
        shadow-2xl
        "
      >
        <div className="relative z-10">
          <h2 className="text-4xl font-bold">Admin Control Room 🚀</h2>

          <p className="mt-3 text-slate-300 max-w-2xl">
            Monitor platform activity, manage users, review disputes and track system growth from
            one place.
          </p>
        </div>

        <div
          className="
          absolute
          -right-16
          -top-16
          w-72
          h-72
          rounded-full
          bg-indigo-500/20
          blur-3xl
          "
        />
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((item) => (
          <div
            key={item.title}
            className="
            group
            relative
            overflow-hidden
            rounded-[36px]
            p-6
            bg-white
            border
            border-slate-200
            shadow-sm
            hover:shadow-2xl
            transition-all
            duration-500
            hover:-translate-y-2
            "
          >
            <div
              className={`
              w-16
              h-16
              rounded-2xl
              flex
              items-center
              justify-center
              text-3xl
              text-white
              bg-gradient-to-br
              ${item.color}
              shadow-lg
              `}
            >
              {item.icon}
            </div>

            <h3 className="mt-6 text-slate-300 font-medium">{item.title}</h3>

            <p className="mt-2 text-5xl font-bold text-slate-900">{item.value}</p>

            <p className="mt-4 text-sm text-emerald-600">{item.change}</p>

            <div
              className="
              absolute
              right-0
              top-0
              w-32
              h-32
              rounded-full
              bg-slate-100
              translate-x-10
              -translate-y-10
              group-hover:scale-125
              transition-all
              duration-700
              "
            />
          </div>
        ))}
      </div>

      {/* System Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[36px] p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800">Platform Status</h3>

          <div className="mt-6 space-y-5">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-300">Server Health</span>

                <span className="font-semibold text-emerald-600">100%</span>
              </div>

              <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full w-full bg-emerald-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-300">Database Usage</span>

                <span className="font-semibold text-indigo-600">15%</span>
              </div>

              <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full w-[15%] bg-indigo-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[36px] p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>

          <div className="mt-6 text-slate-300">
            <div className="flex items-center gap-3 py-3">
              <span>🟢</span>
              <p>System initialized.</p>
            </div>

            <div className="flex items-center gap-3 py-3">
              <span>👤</span>
              <p>1 admin account active.</p>
            </div>

            <div className="flex items-center gap-3 py-3">
              <span>🛡️</span>
              <p>No pending disputes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
