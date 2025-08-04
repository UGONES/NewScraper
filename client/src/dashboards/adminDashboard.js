import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import "../css/dashboard.css";
import DashboardHome from "./DashboardHome";

const Card = ({ title, value }) => (
  <div className="card">
    <p className="card-label">{title}</p>
    <p className="card-value">{value}</p>
  </div>
);

const AdminDashboardHome = () => {
  const { auth } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalScrapes: 0 });
  const [myScrapes, setMyScrapes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth?.role || auth.role !== 'admin') return;

    const fetchSummary = async () => {
      try {
        const { data } = await api.get("/dashboard/admin/summary");
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load summary');
      } finally {
        setLoading(false);
      }
    };

    const fetchAdminScrapes = async () => {
      try {
        const { data } = await api.get("/scrape/user"); // Admin's own scrapes
        setMyScrapes(data);
      } catch (err) {
        console.error("Error fetching admin scrapes:", err);
      }
    };

    fetchSummary();
    fetchAdminScrapes();
  }, [auth]);

  return (
    <div className="dashboard-wrapper">
      <Sidebar role={auth?.role} />
      <main className="page-container dashboard-page">
        <h1 className="page-header">Admin Dashboard</h1>
        {error && (
          <div className="popup-error">
            {error}
            <button className="close-btn" onClick={() => setError('')}>×</button>
          </div>
        )}
        {loading ? (
          <p>Loading…</p>
        ) : (
          <><div className="card-grid">
            <Card title="Total Users" value={stats.totalUsers} />
            <Card title="Total Scrapes" value={stats.totalScrapes} />
            <Card title="My Scrapes" value={myScrapes.length || 0} />
          </div>
            <div className="card inline-card">
              <DashboardHome />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardHome;
