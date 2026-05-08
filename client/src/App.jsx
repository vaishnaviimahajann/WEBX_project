import React, { useState } from 'react';
import { AuthProvider, useAuth } from './pages.jsx';
import {
  HomePage, LoginPage, SignupPage,
  DashboardPage, DiscoverPage, ConnectionsPage,
  ProfilePage, ChatPage
} from './pages.jsx';
import './styles.css';

// ─── Navbar ───────────────────────────────────────────────────
function Navbar({ page, navigate }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate(user ? 'dashboard' : 'home')}>
        <span className="brand-dot">●</span> SkillSync
      </div>

      {!user ? (
        <div className="nav-right">
          <button className="nav-link" onClick={() => navigate('home')}>Home</button>
          <button className="nav-link" onClick={() => navigate('login')}>Login</button>
          <button className="btn-primary small" onClick={() => navigate('signup')}>Get started</button>
        </div>
      ) : (
        <>
          <div className="nav-links">
            <button className={`nav-link ${page === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('dashboard')}>Dashboard</button>
            <button className={`nav-link ${page === 'discover' ? 'active' : ''}`} onClick={() => navigate('discover')}>Discover</button>
            <button className={`nav-link ${page === 'connections' ? 'active' : ''}`} onClick={() => navigate('connections')}>Connections</button>
            <button className={`nav-link ${page === 'profile' ? 'active' : ''}`} onClick={() => navigate('profile')}>Profile</button>
          </div>
          <div className="nav-right">
            <div className="nav-avatar" onClick={() => setMenuOpen(!menuOpen)}>{user.name?.[0]}</div>
            {menuOpen && (
              <div className="nav-dropdown">
                <button onClick={() => { navigate('profile'); setMenuOpen(false); }}>👤 My Profile</button>
                <button onClick={() => { logout(); navigate('home'); setMenuOpen(false); }}>🚪 Sign out</button>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
}

// ─── Router ───────────────────────────────────────────────────
function Router() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('home');
  const [chatWith, setChatWith] = useState(null);

  const navigate = (p, data = null) => {
    if (p === 'chat' && data) setChatWith(data);
    setPage(p);
    window.scrollTo({ top: 0 });
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="loader-ring" />
      <p>Loading SkillSync...</p>
    </div>
  );

  // Redirect if not logged in
  const protectedPages = ['dashboard', 'discover', 'connections', 'profile', 'chat'];
  if (protectedPages.includes(page) && !user) {
    return (
      <>
        <Navbar page="login" navigate={navigate} />
        <main className="main-content"><LoginPage navigate={navigate} /></main>
      </>
    );
  }

  // Redirect if logged in to auth page
  if ((page === 'login' || page === 'signup') && user) {
    return (
      <>
        <Navbar page="dashboard" navigate={navigate} />
        <main className="main-content"><DashboardPage navigate={navigate} /></main>
      </>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'home':        return <HomePage navigate={navigate} />;
      case 'login':       return <LoginPage navigate={navigate} />;
      case 'signup':      return <SignupPage navigate={navigate} />;
      case 'dashboard':   return <DashboardPage navigate={navigate} />;
      case 'discover':    return <DiscoverPage navigate={navigate} />;
      case 'connections': return <ConnectionsPage navigate={navigate} />;
      case 'profile':     return <ProfilePage navigate={navigate} />;
      case 'chat':        return <ChatPage chatWith={chatWith} navigate={navigate} />;
      default:            return <HomePage navigate={navigate} />;
    }
  };

  const isFullPage = ['home', 'login', 'signup'].includes(page);

  return (
    <>
      <Navbar page={page} navigate={navigate} />
      <main className={isFullPage ? '' : 'main-content container'}>
        {renderPage()}
      </main>
    </>
  );
}

// ─── App ──────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
