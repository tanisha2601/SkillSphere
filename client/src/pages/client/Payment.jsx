import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { getContractById } from '../../store/slices/contractSlice';

import { createRazorpayOrder, clearPaymentError } from '../../store/slices/paymentSlice';

import toast from 'react-hot-toast';

export default function Payment() {
  const { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedContract, detailLoading } = useSelector((state) => state.contract);

  const { paymentLoading, error } = useSelector((state) => state.payment);

  useEffect(() => {
    dispatch(getContractById(id));

    return () => {
      dispatch(clearPaymentError());
    };
  }, [dispatch, id]);

  const handlePay = async () => {
    const confirmed = window.confirm(
      `Pay $${selectedContract.agreedBudget} to fund this contract?`
    );

    if (!confirmed) return;

    try {
      await dispatch(createRazorpayOrder(id)).unwrap();

      toast.success('Payment completed successfully.');

      dispatch(getContractById(id));

      navigate('/client/payment-history');
    } catch (err) {
      toast.error(err?.message || 'Payment failed');
      console.error(err);
    }
  };

  if (detailLoading) {
    return <div className="text-center py-20">Loading payment details...</div>;
  }

  if (!selectedContract) {
    return <div className="text-center py-20 text-slate-300">Contract not found.</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl mx-auto mb-4">
            💳
          </div>

          <h2 className="text-2xl font-bold text-slate-800">Fund Contract</h2>

          <p className="text-slate-300 mt-2">
            Deposit the agreed amount before the freelancer starts work.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="flex justify-between border-b pb-3">
            <span className="text-slate-300">Project</span>

            <span className="font-semibold">{selectedContract.gig?.title}</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="text-slate-300">Freelancer</span>

            <span className="font-semibold">{selectedContract.freelancer?.fullName}</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="text-slate-300">Contract Amount</span>

            <span className="text-2xl font-bold text-indigo-600">
              ${selectedContract.agreedBudget}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-300">Payment Status</span>

            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                selectedContract.paymentStatus === 'paid'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {selectedContract.paymentStatus}
            </span>
          </div>
        </div>

        {selectedContract.paymentStatus === 'paid' ? (
          <div className="rounded-xl bg-green-100 py-3 text-center font-semibold text-green-700">
            ✅ Contract Already Funded
          </div>
        ) : (
          <button
            onClick={handlePay}
            disabled={paymentLoading}
            className="w-full rounded-xl bg-indigo-600 py-4 text-white font-bold hover:bg-indigo-700 disabled:opacity-50"
          >
            {paymentLoading
              ? 'Processing...'
              : `Pay $${selectedContract.agreedBudget?.toLocaleString()}`}
          </button>
        )}
      </div>
    </div>
  );
}
