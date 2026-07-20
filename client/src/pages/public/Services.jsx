import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Services() {
  const gigs = [
    {
      id: 1,
      title: 'Modern MERN Website Development',
      freelancer: 'Priya Sharma',
      price: 250,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      location: 'Delhi',
      level: 'Top Rated',
    },
    {
      id: 2,
      title: 'AI Powered Chatbot Development',
      freelancer: 'Aman Verma',
      price: 350,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
      location: 'Mumbai',
      level: 'Pro',
    },
    {
      id: 3,
      title: 'Premium UI UX Design',
      freelancer: 'Riya Kapoor',
      price: 180,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766',
      location: 'Bangalore',
      level: 'Top Rated',
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* HERO */}

      <section className="relative overflow-hidden py-24 border-b border-white/10">
        <div className="absolute w-[450px] h-[450px] rounded-full bg-blue-600/20 blur-[140px] -top-32 -left-32" />
        <div className="absolute w-[350px] h-[350px] rounded-full bg-cyan-500/20 blur-[120px] right-0 top-20" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <h1 className="text-5xl lg:text-6xl font-bold text-center">
            Discover Amazing
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Freelance Services
            </span>
          </h1>

          <p className="text-center text-slate-400 mt-6 max-w-2xl mx-auto">
            Hire top professionals, AI experts and local talent from one intelligent platform.
          </p>

          {/* Search */}

          <div className="mt-12 max-w-3xl mx-auto">
            <div className="rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-2xl p-3 flex items-center gap-4">
              <Search className="text-slate-400 ml-3" />

              <input
                className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-300"
                placeholder="Search services, skills or freelancers..."
              />

              <button className="px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FILTERS */}

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-wrap gap-4 mb-12">
          {['Web Development', 'AI', 'Design', 'Marketing', 'Mobile Apps'].map((item) => (
            <button
              key={item}
              className="px-5 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
            >
              {item}
            </button>
          ))}

          <button className="ml-auto flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/10 bg-white/5">
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>

        {/* CARDS */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gigs.map((gig) => (
            <motion.div
              whileHover={{
                y: -10,
              }}
              key={gig.id}
              className="rounded-[32px] overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-2xl"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={gig.image}
                  className="w-full h-full object-cover transition duration-700 hover:scale-110"
                />

                <div className="absolute top-4 left-4 px-4 py-2 rounded-xl bg-black/50 backdrop-blur-xl text-xs text-cyan-300 border border-cyan-500/20">
                  {gig.level}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />

                  <div>
                    <h4 className="font-semibold">{gig.freelancer}</h4>

                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                      <MapPin size={14} />
                      {gig.location}
                    </div>
                  </div>
                </div>

                <h3 className="mt-6 text-xl font-semibold leading-8">
                  <Link to={`/gig/${gig.id}`}>{gig.title}</Link>
                </h3>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star size={18} fill="currentColor" className="text-yellow-400" />

                    <span>{gig.rating}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-sm">Starting at</span>

                    <h4 className="text-2xl font-bold">${gig.price}</h4>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
