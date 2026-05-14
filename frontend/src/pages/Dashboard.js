import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AddTodo from '../components/AddTodo';
import TodoItem from '../components/TodoItem';

const PRIORITIES = ['All', 'High', 'Medium', 'Low'];

function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [activeNav, setActiveNav] = useState('tasks');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${token}` };

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  // eslint-disable-next-line
  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/todos', { headers });
      setTodos(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const addTodo = async (text) => {
    const res = await axios.post('http://localhost:5000/api/todos', { text }, { headers });
    setTodos([res.data, ...todos]);
  };

  const toggleTodo = async (id) => {
    const res = await axios.patch(`http://localhost:5000/api/todos/${id}`, {}, { headers });
    setTodos(todos.map(t => t._id === id ? res.data : t));
  };

  const deleteTodo = async (id) => {
    await axios.delete(`http://localhost:5000/api/todos/${id}`, { headers });
    setTodos(todos.filter(t => t._id !== id));
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const total = todos.length;
  const done = todos.filter(t => t.completed).length;
  const pending = todos.filter(t => !t.completed).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const initial = user?.name?.charAt(0).toUpperCase() || 'U';
  const priorities = ['high', 'medium', 'low'];
  const getPriority = (todo, index) => priorities[index % 3];

  const getFilteredTodos = () => {
    let filtered = [...todos];
    if (filter !== 'All') filtered = filtered.filter((t, i) => getPriority(t, i) === filter.toLowerCase());
    if (activeNav === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(t => new Date(t.createdAt).toDateString() === today);
    }
    if (activeNav === 'completed') filtered = filtered.filter(t => t.completed);
    if (activeNav === 'priority') filtered = filtered.filter((t, i) => getPriority(t, i) === 'high');
    if (search.trim()) filtered = filtered.filter(t => t.text.toLowerCase().includes(search.toLowerCase()));
    return filtered;
  };

  const filteredTodos = getFilteredTodos();
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  const navTitle = { tasks: 'All Tasks', today: "Today's Tasks", priority: 'High Priority', completed: 'Completed' }[activeNav];

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">✦</div>
          <span className="sidebar-brand-name">TaskFlow</span>
        </div>

        <div className="sidebar-section-label">Workspace</div>
        <nav className="sidebar-nav">
          {[
            { id: 'tasks',     icon: '📋', label: 'My Tasks',  badge: total },
            { id: 'today',     icon: '📅', label: 'Today',     badge: null },
            { id: 'priority',  icon: '🔥', label: 'Priority',  badge: null },
            { id: 'completed', icon: '✅', label: 'Completed', badge: done },
          ].map(item => (
            <div key={item.id} className={`sidebar-item ${activeNav === item.id ? 'active' : ''}`} onClick={() => setActiveNav(item.id)}>
              <span className="sidebar-item-icon">{item.icon}</span>
              {item.label}
              {item.badge > 0 && <span className="sidebar-item-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-divider" />
        <div className="sidebar-section-label">Settings</div>
        <nav className="sidebar-nav">
          <div className="sidebar-item" onClick={handleLogout}>
            <span className="sidebar-item-icon">⇤</span>
            Logout
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-stats-card">
            <div className="sidebar-stats-label">Completion Rate</div>
            <div className="sidebar-stats-val">{pct}%</div>
            <div className="sidebar-stats-sub">{done} of {total} tasks done</div>
            <div className="sidebar-mini-bar">
              <div className="sidebar-mini-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initial}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">Developer</div>
            </div>
            <button className="btn-logout" onClick={handleLogout} title="Logout">⇤</button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="dashboard-main">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-left">
            <h2>{navTitle}</h2>
            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="topbar-search">
            <span>🔍</span>
            <input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="topbar-right">
            {/* THEME TOGGLE */}
            <button className="theme-toggle" onClick={toggleTheme}>
              <span>{theme === 'light' ? '🌙' : '☀️'}</span>
              <div className="theme-toggle-track">
                <div className="theme-toggle-thumb" />
              </div>
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
            <div className="topbar-chip"><span className="live-dot" />{pending} pending</div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="dashboard-content">
          {/* WELCOME */}
          <div className="welcome-bar">
            <div className="welcome-text">
              <h3>Welcome back, {user?.name?.split(' ')[0]} 👋</h3>
              <p>You have {pending} pending task{pending !== 1 ? 's' : ''} — let's get things done!</p>
            </div>
            <button className="add-task-btn" onClick={() => document.getElementById('task-input')?.focus()}>
              + New Task
            </button>
          </div>

          {/* STATS */}
          <div className="stat-cards">
            {[
              { label: 'Total Tasks', val: total, cls: 'c-purple', icon: '📋', iconCls: 'purple', bar: '100%', barColor: 'linear-gradient(90deg,#6366f1,#8b5cf6)' },
              { label: 'Completed',   val: done,  cls: 'c-green',  icon: '✅', iconCls: 'green',  bar: `${pct}%`, barColor: '#10b981' },
              { label: 'Pending',     val: pending, cls: 'c-yellow', icon: '⏳', iconCls: 'yellow', bar: total ? `${(pending/total)*100}%` : '0%', barColor: '#f59e0b' },
              { label: 'Progress',    val: `${pct}%`, cls: 'c-blue', icon: '📈', iconCls: 'blue', bar: `${pct}%`, barColor: '#3b82f6' },
            ].map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-card-top">
                  <span className="stat-card-label">{s.label}</span>
                  <div className={`stat-card-icon ${s.iconCls}`}>{s.icon}</div>
                </div>
                <div className={`stat-card-val ${s.cls}`}>{s.val}</div>
                <div className="stat-card-sub">{i === 0 ? 'All time' : i === 1 ? 'Well done!' : i === 2 ? 'Left to do' : 'Completion rate'}</div>
                <div className="stat-card-bar">
                  <div className="stat-card-fill" style={{ width: s.bar, background: s.barColor }} />
                </div>
              </div>
            ))}
          </div>

          {/* TWO COLS */}
          <div className="dashboard-cols">
            <div>
              <div className="section-card">
                <div className="section-card-header">
                  <div className="section-card-title">
                    {navTitle} <span className="section-card-count">{filteredTodos.length}</span>
                  </div>
                  <div className="section-card-actions">
                    <button className="icon-btn" title="Refresh" onClick={fetchTodos}>↻</button>
                  </div>
                </div>
                <AddTodo onAdd={addTodo} inputId="task-input" />
                <div className="filter-tabs">
                  {PRIORITIES.map(p => (
                    <div key={p} className={`filter-tab ${filter === p ? 'active' : ''}`} onClick={() => setFilter(p)}>{p}</div>
                  ))}
                </div>
                {loading ? (
                  <p className="loading">Loading tasks...</p>
                ) : filteredTodos.length === 0 ? (
                  <div className="empty">
                    <div className="empty-icon">📭</div>
                    <div className="empty-title">No tasks here</div>
                    <div className="empty-sub">Add a task above to get started</div>
                  </div>
                ) : (
                  <div className="todo-list">
                    {filteredTodos.map((todo, index) => (
                      <TodoItem key={todo._id} todo={todo} priority={getPriority(todo, index)} onToggle={toggleTodo} onDelete={deleteTodo} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="right-col">
              <div className="progress-card">
                <div className="progress-card-title">Task Status <span>Overview</span></div>
                <div className="progress-ring-wrap">
                  <svg width="88" height="88">
                    <circle cx="44" cy="44" r={radius} fill="none" stroke="var(--bg2)" strokeWidth="8" />
                    <circle cx="44" cy="44" r={radius} fill="none" stroke="url(#grad)" strokeWidth="8"
                      strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                      style={{ transform:'rotate(-90deg)', transformOrigin:'center', transition:'stroke-dashoffset .6s' }} />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div>
                    <div className="progress-ring-pct">{pct}%</div>
                    <div className="progress-ring-label">Completed</div>
                  </div>
                </div>
                <div className="progress-breakdown">
                  {[
                    { label: 'Completed', val: done,    color: '#10b981' },
                    { label: 'Pending',   val: pending, color: '#f59e0b' },
                    { label: 'Total',     val: total,   color: '#6366f1' },
                  ].map((r, i) => (
                    <div className="progress-row" key={i}>
                      <div className="progress-row-dot" style={{ background: r.color }} />
                      <span className="progress-row-label">{r.label}</span>
                      <span className="progress-row-val" style={{ color: r.color }}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="quick-card">
                <div className="quick-card-title">Quick Access</div>
                <div className="quick-items">
                  {[
                    { id:'tasks',     icon:'📋', label:'All Tasks',     sub:'View everything',      val:total,   color:'#6366f1', bg:'rgba(99,102,241,0.1)'  },
                    { id:'today',     icon:'📅', label:'Today',         sub:'Added today',           val:todos.filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString()).length, color:'#3b82f6', bg:'rgba(59,130,246,0.1)' },
                    { id:'priority',  icon:'🔥', label:'High Priority', sub:'Urgent tasks',          val:todos.filter((t,i)=>i%3===0).length, color:'#ef4444', bg:'rgba(239,68,68,0.1)' },
                    { id:'completed', icon:'✅', label:'Completed',     sub:'Done tasks',            val:done,    color:'#10b981', bg:'rgba(16,185,129,0.1)' },
                  ].map(item => (
                    <div className="quick-item" key={item.id} onClick={() => setActiveNav(item.id)}>
                      <div className="quick-item-icon" style={{ background: item.bg }}>{item.icon}</div>
                      <div className="quick-item-text">
                        <div className="quick-item-title">{item.label}</div>
                        <div className="quick-item-sub">{item.sub}</div>
                      </div>
                      <div className="quick-item-val" style={{ color: item.color }}>{item.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;