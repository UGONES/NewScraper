import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../api/axios';
import Sidebar from '../../../components/Sidebar';
import { useAuth } from '../../../context/AuthContext';
import '../../../css/dashboard.css';

const ManageUsers = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initialUser = location.state?.selectedUser || null;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userScrapes, setUserScrapes] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    api.get('/dashboard/admin/users')
      .then(({ data }) => {
        const sorted = [...data].sort((a, b) => (a.role === 'admin' ? -1 : 1));
        setUsers(sorted);
      })
      .catch((err) => console.error('Error loading users:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (initialUser) {
      api.get('/scrape/admin')
        .then(({ data }) => {
          const userScrapes = data
            .filter(scrape => scrape.userId?._id === initialUser._id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setSelectedUser(initialUser);
          setUserScrapes(userScrapes);
          setShowOverlay(true);
        })
        .catch((err) => console.error('Error loading scrapes:', err));
    }
  }, [initialUser]);

  const handleUserClick = (user) => {
    if (user.role !== 'admin') {
      navigate('/admin/users', { state: { selectedUser: user } });
    }
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar role={auth?.role} />
      <main className="page-container dashboard-page">
        <h1 className="page-header">Manage Users</h1>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr
                    key={u._id}
                    className={u.role === 'admin' ? 'admin-row' : 'clickable-row'}
                    onClick={() => handleUserClick(u)}
                    title={u.role !== 'admin' ? 'Click to view user scrapes' : ''}
                  >
                    <td>{index + 1}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Overlay to display selected user's scrapes */}
        {showOverlay && selectedUser && (
          <div className="overlay" onClick={() => setShowOverlay(false)}>
            <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
              <h2>{selectedUser.username}'s Scrapes</h2>
              {userScrapes.length === 0 ? (
                <p>No scrapes found for this user.</p>
              ) : (
                <div className="scrape-table">
                  {userScrapes.map(scrape => (
                    <div key={scrape._id} className="scrape-entry">
                      <div className="scrape-header">
                        <strong>{scrape.source.slice(0, 60)}</strong>
                        <small>{formatDate(scrape.createdAt)}</small>
                      </div>
                      <p>{scrape.result.slice(0, 100)}...</p>
                      <details>
                        <summary>Full Analysis</summary>
                        <pre className="scrape-analysis">{scrape.result}</pre>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageUsers;
