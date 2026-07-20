import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, DollarSign, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import { getGigById, clearSelectedGig, clearGigError } from '../../store/slices/gigSlice';

import {
  createProposal,
  clearProposalError,
  clearProposalSuccess,
} from '../../store/slices/proposalSlice';

const STATUS_STYLES = {
  open: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  'in-progress': 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  completed: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  cancelled: 'bg-red-500/10 text-red-300 border-red-500/20',
};

export default function GigDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { selectedGig: gig, loading, error } = useSelector((state) => state.gig);

  const { user } = useSelector((state) => state.auth);

  const {
    loading: proposalLoading,
    success: proposalSuccess,
    error: proposalError,
  } = useSelector((state) => state.proposal);

  const [proposalForm, setProposalForm] = useState({
    coverLetter: '',
    proposedBudget: '',
    deliveryTime: '',
  });

  useEffect(() => {
    if (id) {
      dispatch(getGigById(id));
    }

    return () => {
      dispatch(clearSelectedGig());
      dispatch(clearGigError());
      dispatch(clearProposalError());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (proposalSuccess) {
      toast.success('Proposal submitted successfully!');

      setProposalForm({
        coverLetter: '',
        proposedBudget: '',
        deliveryTime: '',
      });

      dispatch(clearProposalSuccess());
    }
  }, [proposalSuccess, dispatch]);

  const handleChange = (e) => {
    setProposalForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(
      createProposal({
        gigId: gig._id,
        proposalData: {
          coverLetter: proposalForm.coverLetter,
          proposedBudget: Number(proposalForm.proposedBudget),
          deliveryTime: Number(proposalForm.deliveryTime),
        },
      })
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!gig) return null;

  const clientName = gig.client?.fullName || gig.client?.email || 'Client';

  const clientInitial = clientName.charAt(0).toUpperCase();

  const statusClass =
    STATUS_STYLES[gig.status] || 'bg-slate-500/10 text-slate-300 border-slate-500/20';

  return (
    <div className="min-h-screen bg-[#020617] text-white py-12">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[150px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <ArrowLeft size={18} />
          Back to Services
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="lg:col-span-2 rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-10"
          >
            <span className={`px-4 py-2 rounded-2xl border text-sm font-semibold ${statusClass}`}>
              {gig.status}
            </span>

            <h1 className="text-5xl font-bold mt-6 leading-tight">{gig.title}</h1>

            <div className="mt-8 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-2xl font-bold">
                {clientInitial}
              </div>

              <div>
                <h3 className="font-semibold text-lg">{clientName}</h3>

                <p className="text-slate-400">Verified Client</p>
              </div>
            </div>

            <div className="h-px bg-white/10 my-10" />

            <h2 className="text-2xl font-bold mb-5">Project Description</h2>

            <p className="text-slate-300 leading-8 whitespace-pre-line">{gig.description}</p>

            {gig.skills?.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mt-10 mb-5">Required Skills</h2>

                <div className="flex flex-wrap gap-3">
                  {gig.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}

            {user?.role === 'freelancer' && gig.status === 'open' && (
              <div className="mt-14 border-t border-white/10 pt-10">
                <h2 className="text-3xl font-bold mb-8">Submit Proposal</h2>

                {proposalError && (
                  <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 p-4">
                    {proposalError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-7">
                  <textarea
                    rows={6}
                    name="coverLetter"
                    value={proposalForm.coverLetter}
                    onChange={handleChange}
                    required
                    placeholder="Explain why you're the best fit..."
                    className="w-full rounded-[36px] bg-white/5 border border-white/10 p-5 text-white outline-none focus:border-blue-500"
                  />

                  <div className="grid md:grid-cols-2 gap-5">
                    <input
                      type="number"
                      name="proposedBudget"
                      value={proposalForm.proposedBudget}
                      onChange={handleChange}
                      required
                      placeholder="Your Budget"
                      className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-blue-500"
                    />

                    <input
                      type="number"
                      name="deliveryTime"
                      value={proposalForm.deliveryTime}
                      onChange={handleChange}
                      required
                      placeholder="Delivery Days"
                      className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    disabled={proposalLoading}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold hover:scale-105 transition"
                  >
                    {proposalLoading ? 'Submitting...' : 'Submit Proposal'}
                  </button>
                </form>
              </div>
            )}
          </motion.div>

          {/* RIGHT SIDEBAR */}

          <motion.div
            initial={{
              opacity: 0,
              x: 40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="space-y-6"
          >
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-8">
              <h3 className="text-2xl font-bold mb-8">Overview</h3>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <DollarSign className="text-cyan-400" />
                  <div>
                    <p className="text-slate-300 text-sm">Budget</p>
                    <h4 className="text-2xl font-bold">${gig.budget}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Calendar className="text-cyan-400" />
                  <div>
                    <p className="text-slate-300 text-sm">Delivery</p>
                    <h4>{gig.deliveryTime} Days</h4>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <User className="text-cyan-400" />
                  <div>
                    <p className="text-slate-300 text-sm">Proposals</p>
                    <h4>12+</h4>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Sparkles className="text-cyan-400" />
                  <div>
                    <p className="text-slate-300 text-sm">AI Match</p>
                    <h4 className="text-cyan-300">94%</h4>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
