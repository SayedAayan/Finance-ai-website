import { useState, useEffect, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCms, defaultCmsConfig } from '../../context/CmsContext';
import { LayoutDashboard, Users, FileEdit, Settings, Search, Edit2, Trash2, Shield, Activity, TrendingUp, ChevronDown, Home, LogOut, Sun, Moon, Image as ImageIcon, RotateCcw, AlertCircle, CheckCircle2, MessageSquare, Plus } from 'lucide-react';

const ImageUploadField = ({ label, value, onChange, variant = 'rectangular', caption }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e) => {
    handleFile(e.target.files[0]);
    if (e.target) e.target.value = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const isSquare = variant === 'square';
  const containerClass = "w-full h-[160px]";

  return (
    <div className="mb-4 flex flex-col h-full">
      <label className="block text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">{label}</label>

      <div
        className={`relative group overflow-hidden rounded-xl border-2 border-dashed transition-colors cursor-pointer bg-[#f9f9fb] dark:bg-gray-900/40 flex flex-col items-center justify-center ${containerClass} ${isDragging ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/10' : 'border-gray-300 dark:border-gray-700 hover:border-violet-600 dark:hover:border-violet-500'}`}
        onClick={() => !value && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={onFileInputChange} />

        {value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-md"
                  title="Change"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onChange(''); }}
                  className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors backdrop-blur-md"
                  title="Remove"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className={`flex flex-col items-center justify-center p-4 text-center pointer-events-none transition-colors ${isDragging ? 'text-violet-600' : 'text-gray-400 group-hover:text-violet-600'}`}>
            <ImageIcon size={28} className="mb-2" />
            <p className="text-[12px] font-semibold whitespace-nowrap">Click or drag to upload</p>
          </div>
        )}
      </div>
      <div className="min-h-[40px] mt-3">
        {caption && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>
        )}
      </div>
    </div>
  );
};

const SectionAccordion = ({ id, title, children, expandedSection, setExpandedSection }) => (
  <div className="bg-white dark:bg-black border border-violet-100/60 dark:border-violet-900/20 rounded-xl shadow-[0_2px_12px_rgba(124,58,237,0.03)] dark:shadow-none mb-4 overflow-hidden">
    <button
      onClick={() => setExpandedSection(expandedSection === id ? null : id)}
      className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-black hover:bg-violet-50/30 dark:hover:bg-violet-900/10 transition-colors"
    >
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-violet-700">{title}</h3>
      <ChevronDown size={16} className={`text-violet-500 transition-transform duration-200 ${expandedSection === id ? 'rotate-180' : ''}`} />
    </button>
    <div className={`transition-all duration-300 ease-in-out ${expandedSection === id ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 hidden'}`}>
      <div className="p-5 pt-0 border-t border-violet-50/50 dark:border-gray-800/80 space-y-5 mt-2">
        {children}
      </div>
    </div>
  </div>
);

const InputGroup = ({ label, value, onChange, type = "text", multiline = false, placeholder = "" }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
    {multiline ? (
      <textarea
        rows={3} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 dark:focus:ring-violet-400 dark:focus:border-violet-400 text-gray-900 dark:text-gray-100 transition-shadow placeholder:text-gray-400 shadow-sm resize-y"
      />
    ) : (
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 dark:focus:ring-violet-400 dark:focus:border-violet-400 text-gray-900 dark:text-gray-100 transition-shadow placeholder:text-gray-400 shadow-sm"
      />
    )}
  </div>
);

const ProgressRing = ({ progress, colorClass, size = 64, strokeWidth = 6, children }) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setCurrentProgress(progress), 200);
    return () => clearTimeout(timer);
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (currentProgress / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${colorClass}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90 absolute">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="currentColor" strokeWidth={strokeWidth} className="opacity-10 dark:opacity-20" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="transparent" stroke="currentColor" strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {children !== undefined ? children : (
        <span className="absolute text-[13px] font-bold text-gray-900 dark:text-gray-100">{progress}%</span>
      )}
    </div>
  );
};



export default function Superadmin() {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { cmsConfig: remoteCms, refreshCms } = useCms();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const [cmsConfig, setCmsConfig] = useState(remoteCms);
  const [expandedSection, setExpandedSection] = useState('global');
  const [isSaving, setIsSaving] = useState(false);

  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    if (remoteCms) setCmsConfig(remoteCms);
  }, [remoteCms]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(console.error);
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const method = editingUser.id ? 'PUT' : 'POST';
    const url = editingUser.id ? `/api/users/${editingUser.id}` : '/api/users';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser)
      });
      setShowUserModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to save user');
    }
  };

  const handleSaveCMS = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmsConfig)
      });
      if (!res.ok) throw new Error('Failed to save');
      await refreshCms();
      alert('CMS Configuration saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save CMS configuration');
    }
    setIsSaving(false);
  };

  const handleResetCMS = () => {
    if (confirm('Are you sure you want to reset all configurations to their original defaults? Any unsaved changes will be lost.')) {
      setCmsConfig(defaultCmsConfig);
    }
  };

  const updateNestedConfig = (section, path, value) => {
    setCmsConfig(prev => {
      const newConfig = { ...prev };
      let current = newConfig[section];
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newConfig;
    });
  };

  if (!currentUser?.isSuperadmin) return <Navigate to="/" replace />;

  const handleLogout = async () => {
    try { await logout(); } catch (e) { console.error(e); }
  };

  const renderOverview = () => (
    <div className="flex flex-col flex-1 min-h-0 space-y-4 animate-in fade-in duration-500 pb-2">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Overview</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time platform metrics and activity.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 shrink-0">
        {[
          {
            label: 'Total Pro Users', value: users.length.toLocaleString(), icon: Users, type: 'count', progress: 85,
            bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400',
            stat: '+12%', statColor: 'text-emerald-600 dark:text-emerald-400', statBg: 'bg-emerald-50 dark:bg-emerald-500/10'
          },
          {
            label: 'Active AI Chats', value: '3,241', icon: MessageSquare, type: 'count', progress: 62,
            bg: 'bg-violet-100 dark:bg-violet-900/30', color: 'text-violet-600 dark:text-violet-400',
            stat: '+5%', statColor: 'text-emerald-600 dark:text-emerald-400', statBg: 'bg-emerald-50 dark:bg-emerald-500/10'
          },
          {
            label: 'Articles Served', value: '89.2k', icon: FileEdit, type: 'count', progress: 92,
            bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400',
            stat: '+18%', statColor: 'text-emerald-600 dark:text-emerald-400', statBg: 'bg-emerald-50 dark:bg-emerald-500/10'
          },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-black p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between h-[150px] relative overflow-hidden group">
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${item.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <item.icon className={item.color} size={18} strokeWidth={2.5} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold tracking-wide uppercase">{item.label}</p>
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-bold ${item.statColor} ${item.statBg} px-2 py-0.5 rounded-md`}>
                <TrendingUp size={12} strokeWidth={3} /> {item.stat}
              </div>
            </div>

            <div className="flex justify-between items-center relative z-10 mt-1">
              <div className="flex flex-col">
                <h3 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-none">{item.value}</h3>
              </div>

              <ProgressRing progress={item.progress || item.value} colorClass={item.color} size={52} strokeWidth={5}>
                {item.type === 'count' ? (
                  <item.icon size={20} strokeWidth={2.5} className="opacity-80 dark:opacity-70" />
                ) : undefined}
              </ProgressRing>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout below stats */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">

        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] flex flex-col min-h-0">
          <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800/50 flex justify-between items-center shrink-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Recent Activity</h3>
            <button className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700">View all</button>
          </div>
          <div className="p-6 flex-1 overflow-hidden relative min-h-0">
            <style>{`
              @keyframes auto-scroll-up {
                0% { transform: translateY(0); }
                100% { transform: translateY(-50%); }
              }
              .ticker-feed {
                animation: auto-scroll-up 15s linear infinite;
              }
              .ticker-feed:hover {
                animation-play-state: paused;
              }
            `}</style>
            <div className="ticker-feed space-y-6">
              {[
                { icon: FileEdit, bg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', title: 'CMS Updated', desc: 'Changed Platform Name from "Website" to "Stockbuzz".', time: '1 min ago' },
                { icon: Users, bg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', title: 'New user registered', desc: 'admin@stockbuzz.in created a new Pro account.', time: '2 mins ago' },
                { icon: FileEdit, bg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', title: 'CMS Updated', desc: 'Changed Homepage Heading to "What are you here for?????".', time: '5 mins ago' },
                { icon: ImageIcon, bg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', title: 'CMS Updated', desc: 'Uploaded a new Favicon in Brand Settings.', time: '10 mins ago' },
                { icon: FileEdit, bg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', title: 'CMS Updated', desc: 'Changed Platform Name from "Website" to "Stockbuzz".', time: '1 min ago' },
                { icon: Users, bg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', title: 'New user registered', desc: 'admin@stockbuzz.in created a new Pro account.', time: '2 mins ago' },
                { icon: FileEdit, bg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', title: 'CMS Updated', desc: 'Changed Homepage Heading to "What are you here for?????".', time: '5 mins ago' },
                { icon: ImageIcon, bg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', title: 'CMS Updated', desc: 'Uploaded a new Favicon in Brand Settings.', time: '10 mins ago' },
              ].map((feed, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0 ${feed.bg}`}>
                    <feed.icon size={14} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 dark:text-gray-100 leading-tight">{feed.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{feed.desc}</p>
                  </div>
                  <div className="ml-auto text-[11px] text-gray-400 font-medium whitespace-nowrap">{feed.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions / System Health */}
        <div className="space-y-4 flex flex-col pb-2">
          <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] shrink-0">
            <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800/50">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">System Health</h3>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'Database Status', val: 'Operational', color: 'text-emerald-500' },
                { label: 'API Uptime', val: '99.98%', color: 'text-emerald-500' },
                { label: 'Server Load', val: '24%', color: 'text-blue-500' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">{item.label}</span>
                  <span className={`text-[13px] font-bold ${item.color}`}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl border border-violet-500 shadow-lg shadow-violet-500/20 p-4 text-white relative overflow-hidden shrink-0 mt-auto">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
            <h3 className="text-sm font-bold mb-1 relative z-10">Upgrade API Tier</h3>
            <p className="text-[11px] text-violet-100/80 mb-3 leading-relaxed relative z-10">You are approaching your monthly API limit for market data feeds.</p>
            <div className="flex justify-start">
              <button className="inline-flex px-4 py-1.5 bg-white text-violet-700 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 transition-colors relative z-10">
                View Plans
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Users</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage accounts and permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={14} />
            <input
              type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors w-48 text-gray-900 dark:text-gray-100 shadow-sm placeholder:text-gray-400"
            />
          </div>
          <button onClick={() => { setEditingUser({ name: '', email: '', status: 'Active', isPro: false }); setShowUserModal(true); }} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-violet-500/20 flex items-center gap-2">
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-800">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">User</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Plan</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Joined</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map(user => (
              <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors group">
                <td className="px-5 py-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</div>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${user.isPro ? 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400 border border-violet-200 dark:border-violet-800' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
                    {user.isPro ? 'PRO' : 'BASIC'}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{user.joinDate}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                    <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {user.status}
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingUser(user); setShowUserModal(true); }} className="p-1.5 text-gray-400 hover:text-violet-600 rounded transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!cmsConfig) return <div className="text-gray-500 text-sm">Loading Configuration...</div>;

    return (
      <div className="space-y-4 animate-in fade-in duration-500 pb-12">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#fafafa] dark:bg-[#0a0a0a] py-4 z-50 border-b border-gray-200 dark:border-gray-800 -mx-8 px-8 lg:-mx-12 lg:px-12 xl:-mx-16 xl:px-16">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Website Content</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Design and text updates apply live.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCMS}
              className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              onClick={handleSaveCMS} disabled={isSaving}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-violet-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? 'Deploying...' : 'Publish'}
            </button>
          </div>
        </div>

        <SectionAccordion id="global" title="Brand Settings" expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Column 1: Site Logo -> Platform Name */}
            <div className="flex flex-col h-full">
              <ImageUploadField label="Site Logo" value={cmsConfig.global?.siteLogo} onChange={val => updateNestedConfig('global', ['siteLogo'], val)} variant="rectangular" caption="PNG or SVG, transparent background recommended" />
              <div className="mt-auto">
                <InputGroup label="Platform Name" value={cmsConfig.global?.siteName || ''} onChange={e => updateNestedConfig('global', ['siteName'], e.target.value)} />
              </div>
            </div>

            {/* Column 2: Favicon -> Tagline */}
            <div className="flex flex-col h-full">
              <ImageUploadField label="Favicon" value={cmsConfig.global?.favicon} onChange={val => updateNestedConfig('global', ['favicon'], val)} variant="square" caption="PNG or SVG, recommended 512×512px" />
              <div className="mt-auto">
                <InputGroup label="Tagline" value={cmsConfig.global?.siteTagline || ''} onChange={e => updateNestedConfig('global', ['siteTagline'], e.target.value)} />
              </div>
            </div>

            {/* Column 3: Live Preview -> Brand Color */}
            <div className="flex flex-col h-full">
              <div className="mb-4 flex flex-col flex-1">
                <label className="block text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Live Preview</label>
                {/* Mock Browser Window */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden flex flex-col h-[160px]">
                  {/* Browser Header / Tab */}
                  <div className="bg-gray-100 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center gap-4 shrink-0">
                    <div className="flex gap-1.5 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    </div>
                    {/* Mock Tab */}
                    <div className="bg-white dark:bg-black px-3 py-1 rounded-t-lg flex items-center gap-2 min-w-[80px] max-w-[140px] border border-b-0 border-gray-200 dark:border-gray-800 mt-2 relative -mb-[9px] shadow-sm">
                      {cmsConfig.global?.favicon ? (
                        <img src={cmsConfig.global?.favicon} alt="Favicon" className="w-3 h-3 object-contain" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      )}
                      <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate">
                        {cmsConfig.global?.siteName || 'Website'}
                      </span>
                    </div>
                  </div>
                  {/* Browser Content / Header Mockup */}
                  <div className="p-4 bg-white dark:bg-[#0a0a0a] flex-1 flex flex-col">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/60 shrink-0">
                      <div className="flex items-center gap-3">
                        {cmsConfig.global?.siteLogo ? (
                          <img src={cmsConfig.global?.siteLogo} alt="Logo" className="h-5 object-contain max-w-[100px]" />
                        ) : (
                          <span className="text-sm font-extrabold tracking-tight truncate max-w-[100px]" style={{ color: cmsConfig.global?.primaryColor || '#7c3aed' }}>
                            {cmsConfig.global?.siteName || 'Platform'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="hidden xl:flex gap-2">
                          <div className="h-1.5 w-6 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                          <div className="h-1.5 w-6 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                        </div>
                        <div
                          className="px-3 py-1 rounded-full text-[9px] font-bold text-white shadow-sm whitespace-nowrap"
                          style={{ backgroundColor: cmsConfig.global?.primaryColor || '#7c3aed' }}
                        >
                          Get Started
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2.5">
                      <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-900 rounded"></div>
                      <div className="h-2 w-1/2 bg-gray-50 dark:bg-gray-900/50 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Spacer block to match caption heights in other columns */}
                <div className="min-h-[40px] mt-3"></div>
              </div>
              <div className="mt-auto">
                <InputGroup label="Brand Color (Hex)" value={cmsConfig.global?.primaryColor || ''} onChange={e => updateNestedConfig('global', ['primaryColor'], e.target.value)} />
              </div>
            </div>

          </div>
        </SectionAccordion>

        <SectionAccordion id="home" title="Hero Section" expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
          <ImageUploadField label="Hero Graphic" value={cmsConfig.home?.hero?.icon} onChange={val => updateNestedConfig('home', ['hero', 'icon'], val)} variant="rectangular" />
          <div className="space-y-4">
            <InputGroup label="Heading" value={cmsConfig.home?.hero?.heading || ''} onChange={e => updateNestedConfig('home', ['hero', 'heading'], e.target.value)} />
            <InputGroup label="Subheading" value={cmsConfig.home?.hero?.subheading || ''} onChange={e => updateNestedConfig('home', ['hero', 'subheading'], e.target.value)} multiline />
            <InputGroup label="Search Placeholder" value={cmsConfig.home?.hero?.searchPlaceholder || ''} onChange={e => updateNestedConfig('home', ['hero', 'searchPlaceholder'], e.target.value)} />
          </div>
        </SectionAccordion>

        <SectionAccordion id="pricing" title="Pricing Plans" expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
          <div className="space-y-6">
            {(cmsConfig.pricing?.plans || []).map((plan, index) => (
              <div key={plan.id} className="p-4 border border-violet-100/60 dark:border-violet-900/30 rounded-xl bg-violet-50/20 dark:bg-violet-900/10 space-y-4 shadow-[0_2px_8px_rgba(124,58,237,0.02)]">
                <div className="flex items-center justify-between border-b border-violet-100/50 dark:border-violet-900/30 pb-3">
                  <h4 className="text-sm font-semibold text-violet-900 dark:text-violet-100">{plan.name} Plan</h4>
                  <span className="text-xs font-medium text-violet-400 dark:text-violet-500 uppercase tracking-wider">{plan.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Name" value={plan.name} onChange={e => {
                    const newPlans = [...cmsConfig.pricing.plans];
                    newPlans[index].name = e.target.value;
                    updateNestedConfig('pricing', ['plans'], newPlans);
                  }} />
                  <InputGroup label="Price" value={plan.price} type="number" onChange={e => {
                    const newPlans = [...cmsConfig.pricing.plans];
                    newPlans[index].price = e.target.value;
                    updateNestedConfig('pricing', ['plans'], newPlans);
                  }} />
                  <InputGroup label="Billing Cycle" value={plan.billingCycle} onChange={e => {
                    const newPlans = [...cmsConfig.pricing.plans];
                    newPlans[index].billingCycle = e.target.value;
                    updateNestedConfig('pricing', ['plans'], newPlans);
                  }} />
                  <InputGroup label="Button Label" value={plan.buttonLabel} onChange={e => {
                    const newPlans = [...cmsConfig.pricing.plans];
                    newPlans[index].buttonLabel = e.target.value;
                    updateNestedConfig('pricing', ['plans'], newPlans);
                  }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Features (one per line)</label>
                  <textarea
                    rows={4}
                    value={plan.features.join('\n')}
                    onChange={e => {
                      const newPlans = [...cmsConfig.pricing.plans];
                      newPlans[index].features = e.target.value.split('\n');
                      updateNestedConfig('pricing', ['plans'], newPlans);
                    }}
                    placeholder="Enter feature..."
                    className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 dark:focus:ring-violet-400 dark:focus:border-violet-400 text-gray-900 dark:text-gray-100 transition-shadow placeholder:text-gray-400 shadow-sm leading-relaxed resize-y"
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionAccordion>

        <SectionAccordion id="navbar" title="Navigation" expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
          <div className="grid grid-cols-2 gap-4 mb-2">
            <InputGroup label="CTA Button Label" value={cmsConfig.navbar?.askAiLabel || ''} onChange={e => updateNestedConfig('navbar', ['askAiLabel'], e.target.value)} />
            <InputGroup label="Default Currency" value={cmsConfig.navbar?.defaultCurrency || ''} onChange={e => updateNestedConfig('navbar', ['defaultCurrency'], e.target.value)} />
          </div>
          <InputGroup label="Ticker Bar Symbols (comma separated)" value={(cmsConfig.navbar?.tickers || []).join(', ')} onChange={e => updateNestedConfig('navbar', ['tickers'], e.target.value.split(',').map(s => s.trim()))} />
        </SectionAccordion>

        <SectionAccordion id="footer" title="Footer" expandedSection={expandedSection} setExpandedSection={setExpandedSection}>
          <ImageUploadField label="Footer Logo (Optional)" value={cmsConfig.footer?.logo} onChange={val => updateNestedConfig('footer', ['logo'], val)} variant="rectangular" />
          <div className="space-y-4">
            <InputGroup label="Description" value={cmsConfig.footer?.tagline || ''} onChange={e => updateNestedConfig('footer', ['tagline'], e.target.value)} multiline />
            <InputGroup label="Copyright" value={cmsConfig.footer?.copyright || ''} onChange={e => updateNestedConfig('footer', ['copyright'], e.target.value)} />
          </div>
        </SectionAccordion>
      </div>
    );
  };

  return (
    <div className="h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex font-sans antialiased overflow-hidden selection:bg-violet-200 dark:selection:bg-violet-900/50">

      {/* Sidebar - Compact Width */}
      <aside className="w-[220px] bg-[#fafafa] dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0 h-full relative z-20">
        <div className="p-5 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity text-left w-full focus:outline-none"
          >
            <div className="p-1.5 bg-violet-600 rounded-md shadow-sm">
              <Shield className="text-white" size={16} />
            </div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight">Superadmin</h1>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="mb-4">
            <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dashboard</div>
            <div className="space-y-0.5">
              {[
                { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                { id: 'users', icon: Users, label: 'Users' }
              ].map(tab => (
                <button
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeTab === tab.id ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200'}`}
                >
                  <tab.icon size={16} className={activeTab === tab.id ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400'} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800/80 pt-4 mb-4">
            <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Configuration</div>
            <div className="space-y-0.5">
              {[
                { id: 'content', icon: FileEdit, label: 'Website CMS' },
                { id: 'settings', icon: Settings, label: 'Settings' }
              ].map(tab => (
                <button
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeTab === tab.id ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200'}`}
                >
                  <tab.icon size={16} className={activeTab === tab.id ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400'} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-0.5">
          <Link to="/" className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:bg-violet-50 dark:text-gray-400 dark:hover:bg-violet-900/10 hover:text-violet-700 dark:hover:text-violet-400 transition-colors group">
            <Home size={16} className="text-gray-400 group-hover:text-violet-500 transition-colors" /> Back to Site
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors text-left group">
            <LogOut size={16} className="text-current opacity-80 group-hover:opacity-100" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content - Max Width Container */}
      <main className={`flex-1 h-full relative z-10 scroll-smooth flex flex-col ${activeTab === 'overview' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <div className="max-w-[1400px] w-full mx-auto px-8 lg:px-12 xl:px-16 py-6 lg:py-8 flex-1 flex flex-col min-h-0">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'content' && renderContent()}
          {activeTab === 'settings' && (
            <div className="space-y-5 animate-in fade-in duration-500">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform preferences.</p>
              </div>
              <div className="bg-white dark:bg-black border border-violet-100/60 dark:border-violet-900/20 rounded-xl p-5 shadow-[0_2px_12px_rgba(124,58,237,0.03)] dark:shadow-none">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Appearance</h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                  <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                  <button onClick={toggleTheme} className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 border border-transparent ${isDarkMode ? 'bg-violet-600' : 'bg-gray-300 border-gray-200 dark:bg-gray-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform flex items-center justify-center ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`}>
                      {isDarkMode ? <Moon size={10} className="text-violet-600" /> : <Sun size={10} className="text-gray-400" />}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showUserModal && editingUser && (
        <div className="fixed inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-black rounded-xl max-w-[400px] w-full p-6 shadow-2xl shadow-violet-500/10 border border-violet-100/60 dark:border-violet-900/30 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
              {editingUser.id ? 'Edit User' : 'Add User'}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <InputGroup label="Full Name" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} />
              <InputGroup label="Email Address" type="email" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} />

              <div className="flex items-center justify-between pt-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-tight">Status</label>
                <select
                  value={editingUser.status} onChange={e => setEditingUser({ ...editingUser, status: e.target.value })}
                  className="px-3 py-1.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 text-gray-900 dark:text-gray-100 cursor-pointer shadow-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2 pb-2 border-b border-violet-50 dark:border-gray-800/80">
                <label className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                  Pro Subscription
                </label>
                <button
                  type="button" onClick={() => setEditingUser({ ...editingUser, isPro: !editingUser.isPro })}
                  className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 border border-transparent ${editingUser.isPro ? 'bg-violet-600' : 'bg-gray-300 border-gray-200 dark:bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${editingUser.isPro ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-4 mt-2">
                <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm shadow-violet-500/20 transition-colors">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
