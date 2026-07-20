import React, { useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const navigate = useNavigate();

  const isSuccess = status === 'success';

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/client/payment-history');
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  return (
    <div className="max-w-md mx-auto py-20 text-center">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">
        <div
          className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-6 ${
            isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
          }`}
        >
          {isSuccess ? '✓' : '✕'}
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </h2>
        <p className="text-slate-300 mb-8">
          {isSuccess
            ? 'Your contract has been successfully funded. The freelancer can now begin work with peace of mind.'
            : 'Unfortunately, your transaction could not be processed. Please try again or use a different payment method.'}
        </p>

        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mb-5 ${
            isSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {isSuccess ? 'Transaction Completed' : 'Transaction Failed'}
        </div>

        {isSuccess && (
          <p className="mt-4 text-xs text-slate-400">
            Redirecting to payment history in a few seconds...
          </p>
        )}

        <Link
          to="/client/manage-contracts"
          className={`inline-block w-full py-3 rounded-xl font-semibold transition text-white ${
            isSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Return to Contracts
        </Link>
      </div>
    </div>
  );
}
