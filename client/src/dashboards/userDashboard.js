import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import DashboardHome from './DashboardHome';
import '../css/dashboard.css';

const UserDashboardHome = () => {
  const { auth } = useAuth();
  const [stats, setStats] = useState(null);
  const [myScrapes, setMyScrapes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth?.role || auth.role !== 'user') return;

    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/dashboard/user/summary');
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load summary');
      }
    };

    const fetchUserScrapes = async () => {
      try {
        const { data } = await api.get("/scrape/user");
        setMyScrapes(data);
      } catch (err) {
        console.error("Error fetching user's scrapes:", err);
      }
    };

    fetchSummary();
    fetchUserScrapes();
  }, [auth]);

  return (
    <div className="dashboard-wrapper">
      <Sidebar role={auth?.role} />
      <main className="page-container dashboard-page">
        <h1 className="page-header">My Dashboard</h1>

        {error && (
          <div className="popup-error">
            {error}
            <button className="close-btn" onClick={() => setError('')}>×</button>
          </div>
        )}
        {stats ? (
          <div className="card inline-card">
            <p className="card-label">My Total Scrapes</p>
            <p className="card-value">{myScrapes.length || 0}</p>
            <DashboardHome />
          </div>
        ) : (
          <p>Loading…</p>
        )}
      </main>
    </div>
  );
}

export default UserDashboardHome;
