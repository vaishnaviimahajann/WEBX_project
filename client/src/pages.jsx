import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// ─── API BASE ─────────────────────────────────────────────────
const API = 'http://localhost:5000/api';

// ─── Auth Context ─────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ss_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(u => { setUser(u); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (t, u) => {
    localStorage.setItem('ss_token', t);
    setToken(t); setUser(u);
  };
  const logout = () => {
    localStorage.removeItem('ss_token');
    setToken(null); setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ─── API Helper ───────────────────────────────────────────────
export function useApi() {
  const { token } = useAuth();
  const call = async (method, path, body) => {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Error');
    return data;
  };
  return { get: (p) => call('GET', p), post: (p, b) => call('POST', p, b), put: (p, b) => call('PUT', p, b) };
}

// ─── HOME PAGE ────────────────────────────────────────────────
export function HomePage({ navigate }) {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-badge">✦ For students who build</div>
        <h1 className="hero-title">Find your next<br /><span className="gradient-text">teammate</span><br />by skill, not chance.</h1>
        <p className="hero-sub">SkillSync connects college students by their tech stack. Discover peers with complementary skills and start collaborations that actually ship.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => navigate('signup')}>Create your profile →</button>
          <button className="btn-outline" onClick={() => navigate('login')}>I already have an account</button>
        </div>
        <div className="hero-stats">
          <div className="stat"><span className="stat-num">2k+</span><span className="stat-label">Students</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-num">50+</span><span className="stat-label">Colleges</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-num">500+</span><span className="stat-label">Collabs</span></div>
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Built for student collaboration</h2>
        <p className="section-sub">College is full of brilliant people working in silos. SkillSync turns your campus — and beyond — into a searchable network of builders.</p>
        <div className="features-grid">
          {[
            { icon: '🔍', title: 'Discover by Skill', desc: 'Search students by React, ML, UI/UX, and 100+ other skills.' },
            { icon: '🤝', title: 'Connect Instantly', desc: 'Send connection requests. Build your network of builders.' },
            { icon: '💬', title: 'Real-time Chat', desc: 'Message your connections instantly with Socket.io powered chat.' },
            { icon: '📋', title: 'Collab Board', desc: 'Shared notes between you and your teammate.' },
          ].map(f => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="testimonials">
        <h2 className="section-title">Loved by student builders</h2>
        <div className="testimonial-grid">
          {[
            { q: 'Found my hackathon team in two days. We placed 2nd at our campus event.', name: 'Aarav S.', info: 'CS · IIT Bombay' },
            { q: 'Way easier than scrolling LinkedIn. Filters by skill is the killer feature.', name: 'Maya R.', info: 'ECE · BITS Pilani' },
            { q: 'Shipped my first SaaS with two people I met here. Wild.', name: 'Dev K.', info: 'IT · NIT Trichy' },
          ].map(t => (
            <div className="testimonial-card" key={t.name}>
              <p className="testimonial-quote">"{t.q}"</p>
              <div className="testimonial-author">
                <div className="avatar-sm">{t.name[0]}</div>
                <div><div className="author-name">{t.name}</div><div className="author-info">{t.info}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to build with someone great?</h2>
        <p>Join SkillSync and meet your next collaborator today.</p>
        <button className="btn-primary large" onClick={() => navigate('signup')}>Get started — it's free</button>
      </section>

      <footer className="footer">
        <div className="footer-brand">● SkillSync</div>
        <p>© 2026 SkillSync — Made for students.</p>
      </footer>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────
export function LoginPage({ navigate }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.msg); return; }
      login(data.token, data.user);
      navigate('dashboard');
    } catch { setError('Server error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand" onClick={() => navigate('home')}>● SkillSync</div>
        <h2>Welcome back</h2>
        <p className="auth-sub">Sign in to your account</p>
        {error && <div className="auth-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@college.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn-primary full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>
        <p className="auth-switch">Don't have an account? <span onClick={() => navigate('signup')}>Sign up</span></p>
      </div>
    </div>
  );
}

// ─── SIGNUP PAGE ──────────────────────────────────────────────
export function SignupPage({ navigate }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', branch: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.msg); return; }
      login(data.token, data.user);
      navigate('dashboard');
    } catch { setError('Server error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand" onClick={() => navigate('home')}>● SkillSync</div>
        <h2>Create your profile</h2>
        <p className="auth-sub">Join thousands of student builders shipping together.</p>
        {error && <div className="auth-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input type="text" placeholder="Rahul Sharma" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@college.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Min 6 characters" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="field-row">
            <div className="field">
              <label>College</label>
              <input type="text" placeholder="IIT Bombay" value={form.college}
                onChange={e => setForm({ ...form, college: e.target.value })} />
            </div>
            <div className="field">
              <label>Branch</label>
              <input type="text" placeholder="CSE" value={form.branch}
                onChange={e => setForm({ ...form, branch: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <span onClick={() => navigate('login')}>Log in</span></p>
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────
export function DashboardPage({ navigate }) {
  const { user } = useAuth();
  const api = useApi();
  const [connections, setConnections] = useState({ incoming: [], sent: [], friends: [] });
  const [suggested, setSuggested] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/connections').then(setConnections).catch(() => {});
    api.get('/users/discover').then(u => setSuggested(u.slice(0, 3))).catch(() => {});
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const sendRequest = async (id) => {
    try {
      await api.post('/connections/send', { receiverId: id });
      setSuggested(s => s.filter(u => u._id !== id));
      showToast('Connection request sent!');
    } catch (e) { showToast(e.message); }
  };

  const profilePct = [user?.bio, user?.skills?.length, user?.github, user?.college].filter(Boolean).length * 25;

  return (
    <div className="dash-page">
      {toast && <div className="toast">{toast}</div>}
      <div className="dash-hero">
        <h1>Hey {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's what's happening in your network today.</p>
      </div>

      <div className="dash-grid">
        <div className="dash-left">
          <div className="dash-card">
            <div className="card-label">PROFILE COMPLETION</div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${profilePct}%` }} /></div>
            <div className="progress-text">{profilePct}% complete</div>
            <button className="btn-secondary" onClick={() => navigate('profile')}>Complete profile</button>
          </div>

          <div className="dash-card">
            <div className="card-label">QUICK LINKS</div>
            <button className="quick-link" onClick={() => navigate('profile')}>👤 View my profile</button>
            <button className="quick-link" onClick={() => navigate('discover')}>🔍 Discover students</button>
            <button className="quick-link" onClick={() => navigate('connections')}>🤝 My connections</button>
          </div>

          {connections.incoming.length > 0 && (
            <div className="dash-card notif-card">
              <div className="card-label">🔔 INCOMING REQUESTS</div>
              {connections.incoming.map(c => (
                <div className="notif-item" key={c._id}>
                  <div className="avatar-sm">{c.sender.name[0]}</div>
                  <span>{c.sender.name}</span>
                  <button className="btn-xs" onClick={async () => {
                    await api.put(`/connections/${c._id}`, { status: 'accepted' });
                    api.get('/connections').then(setConnections);
                    showToast('Accepted!');
                  }}>Accept</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-right">
          <div className="dash-card">
            <div className="card-label">SUGGESTED CONNECTIONS</div>
            {suggested.length === 0 ? (
              <p className="empty-text">No suggestions right now.</p>
            ) : suggested.map(u => (
              <div className="suggest-item" key={u._id}>
                <div className="avatar-md">{u.name[0]}</div>
                <div className="suggest-info">
                  <div className="suggest-name">{u.name}</div>
                  <div className="suggest-meta">{u.branch} · {u.college}</div>
                  {u.skills?.length > 0 && (
                    <div className="skill-tags">{u.skills.slice(0, 3).map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
                  )}
                </div>
                <button className="btn-connect" onClick={() => sendRequest(u._id)}>Connect</button>
              </div>
            ))}
          </div>

          <div className="dash-card">
            <div className="card-label">RECENT ACTIVITY</div>
            {connections.friends.length === 0 ? (
              <p className="empty-text">Activity feed will appear here as you connect with others.</p>
            ) : connections.friends.slice(0, 3).map(c => {
              const other = c.sender._id === user?._id ? c.receiver : c.sender;
              return (
                <div className="activity-item" key={c._id}>
                  <div className="avatar-sm">{other.name[0]}</div>
                  <span>You connected with <strong>{other.name}</strong></span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DISCOVER PAGE ────────────────────────────────────────────
export function DiscoverPage({ navigate }) {
  const api = useApi();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [sent, setSent] = useState(new Set());
  const [toast, setToast] = useState('');

  const SKILLS = ['React', 'Node.js', 'Python', 'ML', 'Flutter', 'UI/UX', 'MongoDB', 'Firebase', 'Java', 'C++'];

  useEffect(() => { fetchStudents(); }, [search, skill]);

  const fetchStudents = async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (skill) params.set('skill', skill);
    const data = await api.get(`/users/discover?${params}`).catch(() => []);
    setStudents(data);
  };

  const sendReq = async (id) => {
    try {
      await api.post('/connections/send', { receiverId: id });
      setSent(s => new Set([...s, id]));
      setToast('Request sent!');
      setTimeout(() => setToast(''), 2500);
    } catch (e) { setToast(e.message); setTimeout(() => setToast(''), 2500); }
  };

  return (
    <div className="discover-page">
      {toast && <div className="toast">{toast}</div>}
      <div className="discover-header">
        <h1>Discover Students</h1>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input placeholder="Search by name, skill, college..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="skill-filters">
        <button className={`filter-pill ${skill === '' ? 'active' : ''}`} onClick={() => setSkill('')}>All</button>
        {SKILLS.map(s => (
          <button key={s} className={`filter-pill ${skill === s ? 'active' : ''}`} onClick={() => setSkill(skill === s ? '' : s)}>{s}</button>
        ))}
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>No students found. Try different search.</p>
        </div>
      ) : (
        <div className="students-grid">
          {students.map(u => (
            <div className="student-card" key={u._id}>
              <div className="student-avatar">{u.name[0]}</div>
              <div className="student-name">{u.name}</div>
              <div className="student-meta">{u.branch} · {u.college}</div>
              <p className="student-bio">{u.bio || 'No bio yet.'}</p>
              {u.skills?.length > 0 && (
                <div className="skill-tags">{u.skills.slice(0, 4).map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
              )}
              <div className="student-links">
                {u.github && <a href={u.github} target="_blank" rel="noreferrer" className="link-btn">GitHub</a>}
                {u.linkedin && <a href={u.linkedin} target="_blank" rel="noreferrer" className="link-btn">LinkedIn</a>}
              </div>
              <button
                className={`btn-connect full ${sent.has(u._id) ? 'sent' : ''}`}
                onClick={() => sendReq(u._id)}
                disabled={sent.has(u._id)}
              >
                {sent.has(u._id) ? '✓ Request Sent' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CONNECTIONS PAGE ─────────────────────────────────────────
export function ConnectionsPage({ navigate }) {
  const api = useApi();
  const { user } = useAuth();
  const [tab, setTab] = useState('incoming');
  const [data, setData] = useState({ incoming: [], sent: [], friends: [] });
  const [toast, setToast] = useState('');

  useEffect(() => { api.get('/connections').then(setData).catch(() => {}); }, []);

  const respond = async (id, status) => {
    await api.put(`/connections/${id}`, { status });
    api.get('/connections').then(setData);
    setToast(status === 'accepted' ? 'Connection accepted!' : 'Request declined');
    setTimeout(() => setToast(''), 2500);
  };

  const tabs = [
    { id: 'incoming', label: `Incoming (${data.incoming.length})` },
    { id: 'sent', label: `Sent (${data.sent.length})` },
    { id: 'friends', label: `Friends (${data.friends.length})` },
  ];

  return (
    <div className="connections-page">
      {toast && <div className="toast">{toast}</div>}
      <h1>Connections</h1>
      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <div className="connections-list">
        {tab === 'incoming' && (data.incoming.length === 0 ? (
          <div className="empty-state"><p>No incoming requests.</p></div>
        ) : data.incoming.map(c => (
          <div className="conn-item" key={c._id}>
            <div className="avatar-md">{c.sender.name[0]}</div>
            <div className="conn-info">
              <div className="conn-name">{c.sender.name}</div>
              <div className="conn-meta">{c.sender.branch} · {c.sender.college}</div>
              {c.sender.skills?.length > 0 && (
                <div className="skill-tags">{c.sender.skills.slice(0, 3).map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
              )}
            </div>
            <div className="conn-actions">
              <button className="btn-primary small" onClick={() => respond(c._id, 'accepted')}>Accept</button>
              <button className="btn-outline small" onClick={() => respond(c._id, 'rejected')}>Decline</button>
            </div>
          </div>
        )))}

        {tab === 'sent' && (data.sent.length === 0 ? (
          <div className="empty-state"><p>No sent requests.</p></div>
        ) : data.sent.map(c => (
          <div className="conn-item" key={c._id}>
            <div className="avatar-md">{c.receiver.name[0]}</div>
            <div className="conn-info">
              <div className="conn-name">{c.receiver.name}</div>
              <div className="conn-meta">{c.receiver.branch} · {c.receiver.college}</div>
            </div>
            <span className="badge-pending">Pending</span>
          </div>
        )))}

        {tab === 'friends' && (data.friends.length === 0 ? (
          <div className="empty-state"><p>No connections yet. Discover students to connect!</p></div>
        ) : data.friends.map(c => {
          const other = c.sender._id === user?._id ? c.receiver : c.sender;
          return (
            <div className="conn-item" key={c._id}>
              <div className="avatar-md">{other.name[0]}</div>
              <div className="conn-info">
                <div className="conn-name">{other.name}</div>
                <div className="conn-meta">{other.branch} · {other.college}</div>
                {other.skills?.length > 0 && (
                  <div className="skill-tags">{other.skills.slice(0, 3).map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
                )}
              </div>
              <button className="btn-outline small" onClick={() => navigate('chat', other)}>💬 Chat</button>
            </div>
          );
        }))}
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────
export function ProfilePage({ navigate }) {
  const { user, setUser, token } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', college: user?.college || '', branch: user?.branch || '', bio: user?.bio || '', skills: user?.skills?.join(', ') || '', github: user?.github || '', linkedin: user?.linkedin || '' });
  const [toast, setToast] = useState('');

  const save = async () => {
    const res = await fetch(`${API}/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) }),
    });
    const data = await res.json();
    setUser(data);
    setEditing(false);
    setToast('Profile updated!');
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <div className="profile-page">
      {toast && <div className="toast">{toast}</div>}
      <div className="profile-card header-card">
        <div className="profile-avatar-lg">{user?.name?.[0]}</div>
        <div className="profile-header-info">
          {editing ? (
            <input className="edit-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          ) : (
            <h1>{user?.name}</h1>
          )}
          <p className="profile-meta">{user?.college} · {user?.branch}</p>
        </div>
        <button className="btn-primary" onClick={() => editing ? save() : setEditing(true)}>
          {editing ? '✓ Save profile' : 'Edit profile'}
        </button>
        {editing && <button className="btn-outline" onClick={() => setEditing(false)}>Cancel</button>}
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="card-label">ABOUT</div>
          {editing ? (
            <textarea className="edit-textarea" placeholder="Write a short bio..." value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })} />
          ) : (
            <p>{user?.bio || 'Add a short bio to introduce yourself.'}</p>
          )}
        </div>

        <div className="profile-card">
          <div className="card-label">COLLEGE & BRANCH</div>
          {editing ? (
            <div className="field-row">
              <input className="edit-input" placeholder="College" value={form.college}
                onChange={e => setForm({ ...form, college: e.target.value })} />
              <input className="edit-input" placeholder="Branch" value={form.branch}
                onChange={e => setForm({ ...form, branch: e.target.value })} />
            </div>
          ) : (
            <p>{user?.college || 'Not set'} · {user?.branch || 'Not set'}</p>
          )}
        </div>

        <div className="profile-card">
          <div className="card-label">SKILLS</div>
          {editing ? (
            <input className="edit-input" placeholder="React, Node.js, Python, ..." value={form.skills}
              onChange={e => setForm({ ...form, skills: e.target.value })} />
          ) : user?.skills?.length > 0 ? (
            <div className="skill-tags lg">{user.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
          ) : (
            <p>No skills yet — add your tech stack.</p>
          )}
        </div>

        <div className="profile-card">
          <div className="card-label">LINKS</div>
          {editing ? (
            <>
              <input className="edit-input" placeholder="GitHub URL" value={form.github}
                onChange={e => setForm({ ...form, github: e.target.value })} />
              <input className="edit-input mt8" placeholder="LinkedIn URL" value={form.linkedin}
                onChange={e => setForm({ ...form, linkedin: e.target.value })} />
            </>
          ) : (
            <>
              {user?.github && <a href={user.github} target="_blank" rel="noreferrer" className="profile-link">🐙 GitHub</a>}
              {user?.linkedin && <a href={user.linkedin} target="_blank" rel="noreferrer" className="profile-link">💼 LinkedIn</a>}
              {!user?.github && !user?.linkedin && <p>No links added.</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CHAT PAGE ────────────────────────────────────────────────
export function ChatPage({ chatWith, navigate }) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [socket, setSocket] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/messages/${chatWith._id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setMessages).catch(() => {});

    // Socket.io dynamic import
    import('socket.io-client').then(({ io }) => {
      const s = io('http://localhost:5000');
      s.emit('join', user._id);
      s.on('receive_message', (msg) => setMessages(prev => [...prev, msg]));
      s.on('message_sent', (msg) => setMessages(prev => [...prev, msg]));
      setSocket(s);
      return () => s.disconnect();
    }).catch(() => {});
  }, [chatWith._id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    if (socket) socket.emit('send_message', { senderId: user._id, receiverId: chatWith._id, text });
    else setMessages(prev => [...prev, { sender: user._id, text, createdAt: new Date() }]);
    setText('');
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate('connections')}>← Back</button>
        <div className="avatar-sm">{chatWith.name[0]}</div>
        <div>
          <div className="chat-name">{chatWith.name}</div>
          <div className="chat-meta">{chatWith.branch} · {chatWith.college}</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => {
          const mine = (m.sender === user._id || m.sender?._id === user._id);
          return (
            <div key={i} className={`msg ${mine ? 'mine' : 'theirs'}`}>
              <div className="msg-bubble">{m.text}</div>
              <div className="msg-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-bar">
        <input
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button className="btn-primary" onClick={send}>Send →</button>
      </div>
    </div>
  );
}
