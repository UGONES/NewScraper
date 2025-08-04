import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api/axios';
import { AuthProvider, useAuth } from './context/AuthContext';

import ProtectedRoute from './routes/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Contact from './pages/Contact';

import DashboardRouter from './routes/DashboardRouter';
import Profile from './pages/Dashboard/Profile';
import AdminScrapes from './pages/Dashboard/Admin/AdminScrapes';
import UserScrapes from './pages/Dashboard/User/UserScapes';
import UserDashboardHome from './dashboards/userDashboard';
import AdminDashboardHome from './dashboards/adminDashboard';
import ManageUsers from './pages/Dashboard/Admin/ManageUsers';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

function AppContent() {
  const { auth } = useAuth();
  const [scrapes, setScrapes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth || !auth.token || !auth.role) {
      navigate("/signin");
      return;
    }

    const loadScrapes = async () => {
      try {
        const endpoint = auth.role === 'admin' ? '/api/scrape/admin' : '/api/scrape/user';
        const res = await api.get(endpoint);
        setScrapes(res.data);
      } catch (err) {
        console.error('Error loading scrapes for navbar:', err);
      }
    };

    loadScrapes();
  }, [auth]);


  return (
    <>
      <Navbar items={scrapes} />

      <Routes>
        {/* ── Public routes ── */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/contact" element={<Contact />} />

        {/* ── Protected routes ── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* Admin */}
          <Route path="/dashboard/admin" element={<AdminDashboardHome />} />
          <Route path="/admin/scrapes" element={<AdminScrapes />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/profile" element={<Profile />} />

          {/* User */}
          <Route path="/dashboard/user" element={<UserDashboardHome />} />
          <Route path="/user/scrapes" element={<UserScrapes />} />
          <Route path="/user/profile" element={<Profile />} />
        </Route>
      </Routes>

      <Footer />
    </>
  );
}


