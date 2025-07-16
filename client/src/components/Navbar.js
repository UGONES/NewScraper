import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/navbar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../css/responsive.css';

const Navbar = ({ items = [] }) => {
  const { auth } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dropdownRef = useRef(null);
  const hamburgerRef = useRef(null);

  const token = auth?.token;
  const user = auth;

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Log the incoming items for debug
  useEffect(() => {
    console.log('[DEBUG] Navbar received items:', items);
  }, [items]);

  // Improved filtering: check title, intro, or source
  const filtered = items.filter((item) => {
    const text = item.title || item.intro || item.source || '';
    return text.toLowerCase().includes(query.toLowerCase());
  });

  const getDashboardLink = () =>
    user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/user';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOnDashboard =
    location.pathname.includes('/dashboard') || location.pathname.includes('/admin');

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">Data Scraper</Link>
        </div>

        <button ref={hamburgerRef} className="hamburger" onClick={toggleMenu}>
          <i className="fas fa-bars"></i>
        </button>

        <div ref={dropdownRef} className={`navbar-menu ${menuOpen ? 'show' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item"><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li className="nav-item"><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
            <li className="nav-item"><Link to="/services" onClick={() => setMenuOpen(false)}>Services</Link></li>

            {token && !isOnDashboard && (
              <li className="nav-item">
                <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)}>My Dashboard</Link>
              </li>
            )}

            {!token && !isOnDashboard && (
              <li className="nav-item mobile-only">
                <Link to="/signup" onClick={() => setMenuOpen(false)}>
                  <i className="fas fa-user-circle fa-lg" style={{ color: '#61dafb' }}></i>
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="auth-buttons desktop-only">
          {!token && !isOnDashboard && (
            <Link to="/signup">
              <i className="fas fa-user-circle fa-lg" style={{ color: '#61dafb' }}></i>
            </Link>
          )}
        </div>
      </nav>

      <header className="search-header">
        <div className="search-container">
          <input
            type="search"
            className="search-input"
            placeholder="Search..."
            aria-label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
            <ul className="search-results">
              {query && filtered.length > 0 ? (
                filtered.map((item) => (
                  <li key={item._id || item.id} className="result-item">
                    <strong>{item.title || item.source || 'Untitled'}</strong>
                    <p>{item.description || item.intro?.slice(0, 100)}</p>
                  </li>
                ))
              ) : query ? (
                <li className="no-results">No results found.</li>
              ) : null}
            </ul>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
