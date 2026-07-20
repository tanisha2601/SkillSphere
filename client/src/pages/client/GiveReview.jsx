import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getContractById } from '../../store/slices/contractSlice';
import { submitReview, clearReviewSuccess, clearReviewError } from '../../store/slices/reviewSlice';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, CheckCircle, MessageSquare, Sparkles } from 'lucide-react';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function GiveReview() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const dispatch     = useDispatch();

  const { selectedContract, detailLoading } = useSelector(s => s.contract);
  const { actionLoading, success, error }   = useSelector(s => s.review);

  const [rating,      setRating]      = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment,     setComment]     = useState('');
  const [submitted,   setSubmitted]   = useState(false);

  useEffect(() => {
    dispatch(getContractById(id));
    return () => { dispatch(clearReviewSuccess()); dispatch(clearReviewError()); };
  }, [dispatch, id]);

  useEffect(() => { if (success) { setSubmitted(true); dispatch(clearReviewSuccess()); } }, [success, dispatch]);
  useEffect(() => { if (error)   toast.error(error); }, [error]);
  useEffect(() => { if (success) toast.success('Review submitted successfully'); }, [success]);

  const handleSubmit = e => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating.'); return; }
    dispatch(submitReview({ contractId: id, rating, comment }));
  };

  const displayRating = hoverRating || rating;

  if (detailLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="shimmer rounded-[32px] h-48" />
        <div className="shimmer rounded-[24px] h-72" />
      </div>
    );
  }

  if (!selectedContract) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 rounded-[28px] text-center"
        style={{ background:'rgba(251,113,133,0.06)', border:'1px solid rgba(251,113,133,0.2)' }}>
        <p className="text-slate-400 font-semibold">Contract not found.</p>
      </div>
    );
  }

  const c = selectedContract;

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-white">

      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-200 transition-colors">
        <ArrowLeft size={15} /> Back to Contract
      </button>

      {/* Header card */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        className="relative overflow-hidden rounded-[32px] p-10 text-center"
        style={{ background:'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(124,58,237,0.08))', border:'1px solid rgba(251,191,36,0.2)' }}
      >
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-20" style={{ background:'radial-gradient(circle, rgba(251,191,36,0.6), transparent)', filter:'blur(50px)' }} />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background:'rgba(251,191,36,0.15)', border:'1px solid rgba(251,191,36,0.25)' }}>
            <Star size={28} className="text-amber-300" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Leave a Review</h1>
          <p className="text-slate-400 mt-3 text-sm">
            Share your experience working with{' '}
            <span className="font-bold text-slate-200">{c.freelancer?.fullName}</span>{' '}
            on <span className="font-bold text-slate-200">"{c.gig?.title}"</span>
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.5 }}
        className="rounded-[28px] overflow-hidden"
        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}
      >
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', duration:0.5 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ background:'rgba(52,211,153,0.15)', border:'2px solid rgba(52,211,153,0.3)' }}>
              <CheckCircle size={36} className="text-emerald-300" />
            </motion.div>
            <h3 className="text-2xl font-black mb-2">Review Submitted!</h3>
            <p className="text-slate-400 text-sm mb-7">Thank you for sharing your feedback. It helps the community grow.</p>
            <button onClick={() => navigate(`/client/contract/${id}`)} className="btn-primary">
              Return to Contract
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-7">
            {error && (
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background:'rgba(251,113,133,0.1)', border:'1px solid rgba(251,113,133,0.2)' }}>
                <p className="text-sm text-rose-300">{error}</p>
              </div>
            )}

            {/* Star rating */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Overall Rating</label>
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} type="button"
                      className="transition-all duration-150"
                      style={{ transform: displayRating >= star ? 'scale(1.2)' : 'scale(1)' }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star size={44}
                        className={displayRating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}
                        style={{ transition:'all 0.15s ease' }}
                      />
                    </button>
                  ))}
                </div>
                <div className="h-7 flex items-center">
                  {displayRating > 0 ? (
                    <motion.span key={displayRating} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
                      className="px-4 py-1.5 rounded-full text-sm font-bold"
                      style={{ background:'rgba(251,191,36,0.15)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.25)' }}>
                      {RATING_LABELS[displayRating]}
                    </motion.span>
                  ) : (
                    <span className="text-xs text-slate-600">Click a star to rate</span>
                  )}
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  <MessageSquare size={11} className="inline mr-1" />Written Review
                </label>
                <span className="text-xs text-slate-600">{comment.length} / 1000</span>
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Describe your experience — communication, quality of work, professionalism, and whether you'd hire again..."
                className="w-full p-4 rounded-2xl text-sm text-slate-200 placeholder-slate-600 resize-none transition-all"
                style={{
                  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
                  outline:'none', minHeight:'130px',
                }}
                onFocus={e => e.target.style.borderColor='rgba(124,58,237,0.5)'}
                onBlur={e  => e.target.style.borderColor='rgba(255,255,255,0.1)'}
                required minLength={10} maxLength={1000}
              />
            </div>

            {/* Submit */}
            <button type="submit" disabled={actionLoading || rating === 0 || comment.length < 10}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all"
              style={{
                background: (rating > 0 && comment.length >= 10) ? 'linear-gradient(135deg, #7C3AED, #06B6D4)' : 'rgba(255,255,255,0.06)',
                color: (rating > 0 && comment.length >= 10) ? '#fff' : '#475569',
                boxShadow: (rating > 0 && comment.length >= 10) ? '0 8px 24px rgba(124,58,237,0.35)' : 'none',
                cursor: (actionLoading || rating === 0 || comment.length < 10) ? 'not-allowed' : 'pointer',
              }}>
              {actionLoading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
              ) : (
                <><Sparkles size={15} /> Submit Review</>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
