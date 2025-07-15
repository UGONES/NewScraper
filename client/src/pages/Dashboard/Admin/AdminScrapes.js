// ... same imports
import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import { FiFileText, FiMenu, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Sidebar from '../../../components/Sidebar';
import { useAuth } from '../../../context/AuthContext';
import '../../../css/dashboard.css';

const AdminScrapes = () => {
  const { auth } = useAuth();
  const [adminScrapes, setAdminScrapes] = useState([]);
  const [allUserScrapes, setAllUserScrapes] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedScrape, setSelectedScrape] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [expandedScrape, setExpandedScrape] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/scrape/user'),
      api.get('/scrape/admin')
    ])
      .then(([userRes, adminRes]) => {
        // ✅ Sort both by date (newest first)
        const sortedAdmin = userRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const sortedAllUsers = adminRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAdminScrapes(sortedAdmin);
        setAllUserScrapes(sortedAllUsers);
      })
      .catch((err) => {
        console.error('Error fetching scrapes:', err);
        setError("Failed to load admin scrapes.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleScrape = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const { data } = await api.post('/scrape/user', { input });
      setAdminScrapes([data, ...adminScrapes]); // newest first
      setSelectedScrape(data);
      setInput('');
      setSuccessMsg('Scrape successful!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Scrape failed';
      setError(msg);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Group user scrapes, ensuring each group is also sorted newest first
  const groupedByUser = allUserScrapes.reduce((acc, scrape) => {
    const username = scrape.userId?.username || 'Unknown';
    if (!acc[username]) acc[username] = [];
    acc[username].push(scrape);
    return acc;
  }, {});

  // Sort individual user scrape lists (newest first)
  Object.keys(groupedByUser).forEach((username) => {
    groupedByUser[username].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  });

  const sortedUsernames = Object.keys(groupedByUser).sort();

  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar role={auth?.role} />

      {!sidebarOpen && (
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}>
          <FiMenu />
        </button>
      )}

      {sidebarOpen && (
        <div className="history-overlay" onClick={() => setSidebarOpen(false)}>
          <aside className="history-sidebar open" onClick={(e) => e.stopPropagation()}>
            <h2 className="history-title">
              <FiFileText />
              <span>Scrape History</span>
              <button className="history-close" onClick={() => setSidebarOpen(false)}>
                <FiX />
              </button>
            </h2>
            <div className="history-list">
              {adminScrapes.map((scrape) => (
                <button
                  key={scrape._id}
                  className="history-item"
                  onClick={() => {
                    setSelectedScrape(scrape);
                    setShowAnalysis(false);
                    setSidebarOpen(false);
                  }}
                >
                  <div>{scrape.source.slice(0, 20)}</div>
                  <small>{formatDate(scrape.createdAt)}</small>
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}

      <main className="page-container dashboard-page">
        <h1 className="page-header">Admin Scrapes</h1>

        {loading ? (
          <p>Loading Admin Scrapes...</p>
        ) : (
          <>
            {error && (
              <div className="popup-error">
                {error}
                <button className="close-btn" onClick={() => setError('')}>×</button>
              </div>
            )}

            {successMsg && (
              <div className="popup-success">
                {successMsg}
                <button className="close-btn" onClick={() => setSuccessMsg('')}>×</button>
              </div>
            )}

            <div className="user-list">
              <button
                className="user-button general-toggle"
                onClick={() => setShowUserList(!showUserList)}
              >
                📁 General Scrapes ({sortedUsernames.length})
                {showUserList ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {showUserList && (
                <div className="user-button-list">
                  {sortedUsernames.map((username) => (
                    <button
                      key={username}
                      className="user-button"
                      onClick={() => {
                        setSelectedUser({ name: username, scrapes: groupedByUser[username] });
                        setShowOverlay(true);
                        setShowUserList(false);
                      }}
                    >
                      {username} ({groupedByUser[username].length})
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleScrape} className="scrape-form">
              <textarea
                rows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a URL or topic to scrape as admin..."
                required
              />
              <button type="submit" className="scrape-btn">Scrape</button>
            </form>

            {selectedScrape && (
              <div className="scrape-display">
                <h2 className="scrape-source">{selectedScrape.source}</h2>
                <p className="scrape-result">{selectedScrape.result.slice(0, 100)}...</p>
                <button
                  className="analysis-btn"
                  onClick={() => setShowAnalysis(!showAnalysis)}
                >
                  {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
                </button>

                {showAnalysis && (
                  <div className="scrape-analysis">
                    <pre>{selectedScrape.result}</pre>
                  </div>
                )}
              </div>
            )}

            {showOverlay && selectedUser && (
              <div className="overlay" onClick={() => setShowOverlay(false)}>
                <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                  <h2>{selectedUser.name}'s Scrapes</h2>
                  <div className="scrape-table">
                    {selectedUser.scrapes.map((scrape) => (
                      <div key={scrape._id} className="scrape-entry">
                        <div className="scrape-header">
                          <strong>{scrape.source.slice(0, 60)}</strong>
                          <small>{formatDate(scrape.createdAt)}</small>
                        </div>
                        <p>{scrape.result.slice(0, 100)}...</p>
                        <button
                          className="analysis-btn"
                          onClick={() =>
                            setExpandedScrape(
                              expandedScrape === scrape._id ? null : scrape._id
                            )
                          }
                        >
                          {expandedScrape === scrape._id ? 'Hide Analysis' : 'Show Analysis'}
                        </button>
                        {expandedScrape === scrape._id && (
                          <div className="scrape-analysis">
                            <p>{scrape.result}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminScrapes;
