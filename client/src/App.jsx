import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, logout } from './store/slices/authSlice';
import { getCurrentUser } from './services/authService';

// Layouts
import MainLayout from './components/layout/MainLayout';
import ClientLayout from './components/layout/ClientLayout';
import FreelancerLayout from './components/layout/FreelancerLayout';
import AdminLayout from './components/layout/AdminLayout';

// Pages – Public
import Home from './pages/public/Home';
import Services from './pages/public/Services';
import GigDetails from './pages/public/GigDetails';
import NotFound from './pages/public/NotFound';

// Pages – Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Pages – Client
import ClientDashboard from './pages/client/Dashboard';
import PostJob from './pages/client/PostJob';
import ManageContracts from './pages/client/ManageContracts';
import ClientContractDetails from './pages/client/ContractDetails';
import ClientManageGigs from './pages/client/ManageGigs';
import ViewProposals from './pages/client/ViewProposals';
import GiveReview from './pages/client/GiveReview';
import Payment from './pages/client/Payment';
import PaymentStatus from './pages/client/PaymentStatus';
import PaymentHistory from './pages/client/PaymentHistory';

// Pages – Freelancer
import FreelancerDashboard from './pages/freelancer/Dashboard';
import FindJobs from './pages/freelancer/FindJobs';
import ManageGigs from './pages/freelancer/ManageGigs';
import MyContracts from './pages/freelancer/MyContracts';
import FreelancerContractDetails from './pages/freelancer/ContractDetails';
import MyProposals from './pages/freelancer/MyProposals';
import Wallet from './pages/freelancer/Wallet';

// Pages – Shared
import Messages from './pages/shared/Messages';

// Pages – Admin
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import Reports from './pages/admin/Reports';

import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

import Profile from "./pages/freelancer/Profile";

import { connectSocket, disconnectSocket } from './services/socket';

export default function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');

    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser && !token) {
      dispatch(
        setUser({
          token: savedToken,
          user: JSON.parse(savedUser),
        })
      );
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const data = await getCurrentUser();
        dispatch(setUser(data.user));
      } catch (error) {
        dispatch(logout());
      }
    };
    fetchUser();
  }, [token, dispatch]);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    connectSocket(token);

    return () => {
      disconnectSocket();
    };
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
  <Route
    index
    element={<Home />}
  />

  <Route
    path="services"
    element={<Services />}
  />

  <Route
    path="gig/:id"
    element={<GigDetails />}
  />

  <Route
    path="login"
    element={<Login />}
  />

  <Route
    path="register"
    element={<Register />}
  />

  <Route
    path="forgot-password"
    element={
      <ForgotPassword />
    }
  />

  <Route
    path="reset-password/:token"
    element={
      <ResetPassword />
    }
  />

  <Route
    path="verify-email/:token"
    element={
      <VerifyEmail />
    }
  />

  <Route
    path="404"
    element={<NotFound />}
  />
</Route>

        {/* Client Routes */}
        <Route
          path="/client"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/client/dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="manage-gigs" element={<ClientManageGigs />} />
          <Route path="manage-contracts" element={<ManageContracts />} />
          <Route path="contract/:id" element={<ClientContractDetails />} />
          <Route path="contract/:id/review" element={<GiveReview />} />
          <Route path="contract/:id/pay" element={<Payment />} />
          <Route path="payment-status" element={<PaymentStatus />} />
          <Route path="payment-history" element={<PaymentHistory />} />
          <Route path="proposals/:gigId" element={<ViewProposals />} />
          <Route path="messages" element={<Messages />} />
        </Route>

        {/* Freelancer Routes */}
        <Route
          path="/freelancer"
          element={
            <ProtectedRoute allowedRoles={['freelancer']}>
              <FreelancerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/freelancer/dashboard" replace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="dashboard" element={<FreelancerDashboard />} />
          <Route path="find-jobs" element={<FindJobs />} />
          <Route path="manage-gigs" element={<ManageGigs />} />
          <Route path="my-contracts" element={<MyContracts />} />
          <Route path="contract/:id" element={<FreelancerContractDetails />} />
          <Route path="my-proposals" element={<MyProposals />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="messages" element={<Messages />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
