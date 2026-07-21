import { useState, useEffect, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCms, defaultCmsConfig } from '../../context/CmsContext';
import { LayoutDashboard, Users, FileEdit, Settings, Search, Edit2, Trash2, Shield, Activity, TrendingUp, ChevronDown, Home, LogOut, Sun, Moon, Image as ImageIcon, RotateCcw, AlertCircle, CheckCircle2, MessageSquare, Plus, BarChart3, DollarSign, Newspaper, ScrollText, Database, ArrowRight, LineChart, ArrowUpRight, ArrowDownRight, Eye, Filter, MousePointerClick, UserPlus, CreditCard, Crown, Star, RefreshCcw, Ticket, Tag, Check, X, Pin, EyeOff, XCircle, Clock, Link as LinkIcon, CalendarDays, Server, Globe, Cpu, Zap, Network, User, Bell, Key, Smartphone, Mail } from 'lucide-react';

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


// Premium plan badge — gradient-based, no emoji icons
const PlanBadge = ({ plan, size = 'md' }) => {
  const pad = size === 'sm' ? 'px-2 py-[2px] rounded gap-[3px] text-[9px]'
            : size === 'lg' ? 'px-3.5 py-[5px] rounded-lg gap-[5px] text-[11px]'
            :                 'px-2.5 py-[3px] rounded-md gap-[4px] text-[10px]';

  if (!plan || plan === 'Free') return (
    <span className={`inline-flex items-center font-semibold tracking-wider uppercase ${pad} bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700`}>
      <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500 flex-shrink-0" />
      Free
    </span>
  );

  if (plan === 'Pro') return (
    <span
      className={`inline-flex items-center font-bold tracking-widest uppercase ${pad}`}
      style={{ background: 'linear-gradient(125deg,#5b21b6,#7c3aed,#a78bfa)', color:'#fff', boxShadow:'0 2px 8px rgba(124,58,237,0.4)', letterSpacing:'0.1em' }}
    >
      <span style={{ fontSize:'0.7em', opacity:0.9 }}>✦</span>
      PRO
    </span>
  );

  if (plan === 'Ultra') return (
    <span
      className={`inline-flex items-center font-black tracking-widest uppercase ${pad}`}
      style={{ background: 'linear-gradient(125deg,#92400e,#d97706,#fbbf24)', color:'#fff', boxShadow:'0 2px 8px rgba(217,119,6,0.45)', letterSpacing:'0.1em' }}
    >
      <span style={{ fontSize:'0.7em', opacity:0.9 }}>◆</span>
      ULTRA
    </span>
  );

  return <span className={`inline-flex items-center font-semibold text-gray-500 ${pad}`}>{plan}</span>;
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
  const [auditLogs, setAuditLogs] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isCmsDirty, setIsCmsDirty] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileTab, setProfileTab] = useState('Overview');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userFilter, setUserFilter] = useState('All');
  const [notifToggles, setNotifToggles] = useState({ proAlerts: true, apiWarnings: true, weeklySummary: false });
  const [systemHealth, setSystemHealth] = useState(null);
  const [newsSources, setNewsSources] = useState([
    { name: 'The Times of India', active: true },
    { name: 'Economic Times', active: true },
    { name: 'LiveMint', active: true },
    { name: 'BusinessLine', active: true },
    { name: 'Moneycontrol', active: false },
    { name: 'CNBC TV18', active: false }
  ]);
  const [refreshInterval, setRefreshInterval] = useState(15);
  const [analyticsDateFilter, setAnalyticsDateFilter] = useState('Last 30 Days');
  const [showAnalyticsDateDropdown, setShowAnalyticsDateDropdown] = useState(false);
  const [revenueDateFilter, setRevenueDateFilter] = useState('This Month');
  const [showRevenueDateDropdown, setShowRevenueDateDropdown] = useState(false);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [customNewsLinks, setCustomNewsLinks] = useState([
    { title: "Sensex crashes 900 points as inflation fears rise, Nifty below 24k", source: "The Times of India", time: "10 mins ago", status: "Pinned" },
    { title: "TCS Q3 Results: Net profit beats estimates, announces dividend", source: "Economic Times", time: "45 mins ago", status: "Live" },
    { title: "RBI maintains repo rate at 6.5%, changes stance to neutral", source: "LiveMint", time: "1 hr ago", status: "Live" },
    { title: "HDFC Bank merger synergies starting to reflect in NIMs: Analyst", source: "BusinessLine", time: "2 hrs ago", status: "Live" },
    { title: "Outdated story about old market crash from 2024", source: "The Times of India", time: "1 day ago", status: "Hidden" },
  ]);

  useEffect(() => {
    if (remoteCms) setCmsConfig(remoteCms);
  }, [remoteCms]);

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
    fetchSystemHealth();
    fetchSettings();
    fetchAdminNews();
  }, []);

  const fetchAdminNews = () => {
    fetch(`/api/admin/news?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => { if(data.articles) setCustomNewsLinks(data.articles); })
      .catch(console.error);
    fetch(`/api/admin/news/settings?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if(data.disabledSources) {
          setNewsSources(prev => prev.map(s => ({ ...s, active: !data.disabledSources.includes(s.name) })));
        }
      })
      .catch(console.error);
  };

  const fetchSystemHealth = () => {
    fetch('/api/system-health')
      .then(res => res.json())
      .then(data => setSystemHealth(data))
      .catch(console.error);
  };

  const fetchSettings = () => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => { if (data.notifToggles) setNotifToggles(data.notifToggles); })
      .catch(console.error);
  };

  const fetchAuditLogs = () => {
    fetch('/api/audit-logs')
      .then(res => res.json())
      .then(data => setAuditLogs(data))
      .catch(console.error);
  };

  const fetchUsers = () => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(console.error);
  };

  const logAuditAction = async (section, action, details, actionColor) => {
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin: currentUser?.email || 'Unknown',
          section,
          action,
          details,
          actionColor
        })
      });
      fetchAuditLogs(); // Refresh the log after logging
    } catch (err) {
      console.error('Failed to log audit action', err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const userToDelete = users.find(u => u.id === id);
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      await logAuditAction('Users', 'Deleted User', `Deleted user: ${userToDelete?.email || id}`, 'text-red-600 dark:text-red-400');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  const handleSaveUser = async () => {
    if (!editingUser?.name || !editingUser?.email) {
      alert('Please fill in all required fields (Name and Email).');
      return;
    }
    const isEditing = !!editingUser.id;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/users/${editingUser.id}` : '/api/users';

    try {
      const payload = {
        ...editingUser,
        status: editingUser.status || 'Active',
        joinDate: editingUser.joinDate || new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
      };
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const actionTitle = isEditing ? 'Updated User' : 'Created User';
      const details = isEditing ? `Updated user: ${editingUser.email}` : `New user: ${editingUser.email} (${editingUser.plan || 'Free'})`;
      await logAuditAction('Users', actionTitle, details, 'text-blue-600 dark:text-blue-400');
      
      setShowAddUserModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to save user');
    }
  };

  const handleSuspendUser = async (user) => {
    const newStatus = user.status === 'Suspended' ? 'Active' : 'Suspended';
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, status: newStatus })
      });
      await logAuditAction('Users', `${newStatus === 'Suspended' ? 'Suspended' : 'Reactivated'} User`, `${newStatus === 'Suspended' ? 'Suspended' : 'Reactivated'} user: ${user.email}`, newStatus === 'Suspended' ? 'text-red-600' : 'text-emerald-600');
      setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to update user status');
    }
  };

  const handleExportCSV = (type) => {
    const data = type === 'users' ? users : auditLogs;
    if (!data || !data.length) return alert('No data to export');
    
    const allKeys = Array.from(new Set(data.flatMap(item => Object.keys(item))));
    const headers = allKeys.join(',');
    const rows = data.map(row => 
      allKeys.map(key => `"${String(row[key] !== undefined && row[key] !== null ? row[key] : '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    logAuditAction(type === 'users' ? 'Users' : 'System', 'Exported Data', `Exported ${type} to CSV`, 'text-blue-600 dark:text-blue-400');
  };

  const handleSaveSettings = async (newToggles) => {
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifToggles: newToggles || notifToggles })
      });
      logAuditAction('System', 'Updated Settings', 'Global Admin Settings updated', 'text-violet-600 dark:text-violet-400');
    } catch(e) {
      console.error(e);
    }
  };

  const handleSaveCredentials = async (field, value) => {
    try {
      await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value })
      });
      logAuditAction('Security', `Updated ${field}`, `Admin ${field} updated successfully`, 'text-blue-600 dark:text-blue-400');
      alert(`${field} updated successfully!`);
    } catch(e) {
      console.error(e);
      alert(`Failed to update ${field}`);
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
      
      await logAuditAction('Website CMS', 'Updated Configuration', 'Global CMS Settings modified', 'text-violet-600 dark:text-violet-400');
      
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
            <button onClick={() => setActiveTab('audit_log')} className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700">View all</button>
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
            <div className="ticker-feed space-y-2">
              {[
                { icon: FileEdit, bg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', title: 'CMS Updated', desc: 'Changed Platform Name from "Website" to "Stockbuzz".', time: '1 min ago', tab: 'audit_log' },
                { icon: Users, bg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', title: 'New user registered', desc: 'admin@stockbuzz.in created a new Pro account.', time: '2 mins ago', tab: 'users' },
                { icon: FileEdit, bg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', title: 'CMS Updated', desc: 'Changed Homepage Heading to "What are you here for?????".', time: '5 mins ago', tab: 'audit_log' },
                { icon: ImageIcon, bg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', title: 'CMS Updated', desc: 'Uploaded a new Favicon in Brand Settings.', time: '10 mins ago', tab: 'content' },
                { icon: FileEdit, bg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', title: 'CMS Updated', desc: 'Changed Platform Name from "Website" to "Stockbuzz".', time: '1 min ago', tab: 'audit_log' },
                { icon: Users, bg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', title: 'New user registered', desc: 'admin@stockbuzz.in created a new Pro account.', time: '2 mins ago', tab: 'users' },
                { icon: FileEdit, bg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', title: 'CMS Updated', desc: 'Changed Homepage Heading to "What are you here for?????".', time: '5 mins ago', tab: 'audit_log' },
                { icon: ImageIcon, bg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', title: 'CMS Updated', desc: 'Uploaded a new Favicon in Brand Settings.', time: '10 mins ago', tab: 'content' },
              ].map((feed, i) => (
                <div key={i} onClick={() => setActiveTab(feed.tab)} className="flex gap-4 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-900/40 p-2 -mx-2 rounded-xl transition-colors">
                  <div className={`p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0 ${feed.bg} group-hover:scale-110 transition-transform`}>
                    <feed.icon size={14} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 dark:text-gray-100 leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{feed.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{feed.desc}</p>
                  </div>
                  <div className="ml-auto text-[11px] text-gray-400 font-medium whitespace-nowrap pt-1">
                    <span className="group-hover:hidden">{feed.time}</span>
                    <ArrowRight size={14} className="hidden group-hover:block text-violet-500" />
                  </div>
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
                { label: 'Database Status', val: systemHealth?.databaseStatus || 'Checking...', color: systemHealth?.databaseStatus === 'Operational' ? 'text-emerald-500' : 'text-amber-500' },
                { label: 'API Uptime', val: systemHealth?.apiUptime || 'Checking...', color: 'text-emerald-500' },
                { label: 'Server Load', val: systemHealth?.serverLoad || 'Checking...', color: 'text-blue-500' },
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
    <div className="flex flex-col flex-1 min-h-0 space-y-5 animate-in fade-in duration-500 pb-6 relative">
      <div className="flex justify-between items-end mb-1">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">User Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage accounts and subscriptions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleExportCSV('users')} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Export CSV
          </button>
          <button onClick={() => { setEditingUser({}); setShowAddUserModal(true); }} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-violet-500/20 flex items-center gap-2">
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] flex flex-col flex-1 min-h-[500px]">
        {/* Search & Filters */}
        <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800/50 flex flex-col md:flex-row justify-between items-center shrink-0 gap-4">
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['All', 'Pro', 'Ultra', 'Free', 'Suspended'].map(filter => (
              <button
                key={filter}
                onClick={() => setUserFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  userFilter === filter 
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="relative group w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={14} />
            <input
              type="text" placeholder="Search users..."
              className="pl-8 pr-3 py-2 w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 dark:focus:border-violet-500 transition-colors text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
            />
          </div>
        </div>
        
        {/* Table */}
        <div className="p-0 overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                  <div className="flex items-center gap-1">User <ChevronDown size={12} /></div>
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                  <div className="flex items-center gap-1">Plan <ChevronDown size={12} /></div>
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                  <div className="flex items-center gap-1">Status <ChevronDown size={12} /></div>
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                  <div className="flex items-center gap-1">Joined <ChevronDown size={12} /></div>
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {(users || [])
              .filter(u => userFilter === 'All' || u.plan === userFilter || (userFilter === 'Suspended' && u.status === 'Suspended'))
              .map((user, i) => (
                <tr key={i} className={`group hover:bg-gray-50/80 dark:hover:bg-gray-900/40 transition-colors cursor-pointer ${i % 2 === 0 ? 'bg-white dark:bg-black' : 'bg-gray-50/20 dark:bg-gray-900/10'}`} onClick={() => setSelectedUser(user)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.bg || 'bg-violet-100 text-violet-700'} dark:bg-opacity-20 dark:text-opacity-90`}>
                        {user.initial || user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <PlanBadge plan={user.plan} />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                      (user.status || 'Active') === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                      'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                    }`}>
                      {(user.status || 'Active').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.joinDate || user.joined || 'N/A'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); setEditingUser(user); setShowAddUserModal(true); }} className="p-1.5 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 rounded transition-colors" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Drawer Overlay */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:pl-64">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedUser(null)}></div>
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl flex flex-col h-[600px] max-h-[calc(100vh-80px)] animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="border-b border-gray-100 dark:border-gray-800 flex flex-col bg-white dark:bg-[#0a0a0a] z-10">
              <div className="px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">User Profile</h3>
                <button onClick={() => setSelectedUser(null)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="px-6 flex gap-6 overflow-x-auto no-scrollbar">
                {['Overview', 'Subscription', 'Activity', 'Quick Actions'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setProfileTab(tab)}
                    className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap border-b-2 ${
                      profileTab === tab ? 'border-violet-600 text-violet-700 dark:text-violet-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              
              {profileTab === 'Overview' && (
                <div className="space-y-4">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-3 border border-gray-100 dark:border-gray-800">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${
                      selectedUser.plan === 'Ultra' ? 'bg-orange-100 text-orange-700' :
                      selectedUser.plan === 'Pro' ? 'bg-violet-100 text-violet-700' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {selectedUser.initial || selectedUser.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">{selectedUser.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{selectedUser.email}</p>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="px-4 py-2.5 flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Joined</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedUser.joinDate || selectedUser.joined || 'N/A'}</span>
                    </div>
                    <div className="px-4 py-2.5 flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Plan</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedUser.plan || 'Free'}</span>
                    </div>
                    <div className="px-4 py-2.5 flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Status</span>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          (selectedUser.status || 'Active') === 'Active' ? 'bg-emerald-500' : 'bg-red-500'
                        }`}></span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{(selectedUser.status || 'Active')}</span>
                      </div>
                    </div>
                    <div className="px-4 py-2.5 flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">User ID</span>
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{selectedUser.id || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'Subscription' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Plan</h5>
                      <button
                        onClick={() => { setEditingUser(selectedUser); setSelectedUser(null); setShowAddUserModal(true); }}
                        className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                      >Change Plan</button>
                    </div>
                    <PlanBadge plan={selectedUser.plan || 'Free'} size="lg" />
                  </div>
                  <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-900/60 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Billing History</h5>
                    </div>
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No recent billing history found.
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'Activity' && (
                <div className="space-y-4">
                  <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-900/60 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recent Logins</h5>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">Mumbai, India (Windows)</span>
                        <span className="text-gray-500 dark:text-gray-400">Today, 10:45 AM</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">Mumbai, India (iOS)</span>
                        <span className="text-gray-500 dark:text-gray-400">Yesterday</span>
                      </div>
                    </div>
                  </div>
                  <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-900/60 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Platform Usage</h5>
                    </div>
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      Activity logs are updated weekly.
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'Quick Actions' && (
                <div className="space-y-3">
                  <button
                    onClick={() => { setEditingUser(selectedUser); setSelectedUser(null); setShowAddUserModal(true); }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 dark:hover:bg-violet-900/20 dark:hover:text-violet-400 transition-colors"
                  >
                    <span className="flex items-center gap-2.5"><Edit2 size={16} /> Edit User Details</span>
                    <ArrowRight size={14} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => { alert('Password reset email sent to ' + selectedUser.email); }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="flex items-center gap-2.5"><RefreshCcw size={16} /> Force Password Reset</span>
                    <ArrowRight size={14} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleSuspendUser(selectedUser)}
                    className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-sm font-medium transition-colors ${
                      (selectedUser.status || 'Active') === 'Suspended'
                        ? 'bg-white dark:bg-black border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                        : 'bg-white dark:bg-black border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                  >
                    <span className="flex items-center gap-2.5"><Shield size={16} /> {(selectedUser.status || 'Active') === 'Suspended' ? 'Reactivate Account' : 'Suspend Account'}</span>
                  </button>
                  <div className="pt-4 mt-2 border-t border-red-100 dark:border-red-900/30">
                    <button
                      onClick={() => { handleDeleteUser(selectedUser.id); setSelectedUser(null); }}
                      className="w-full flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <span className="flex items-center gap-2.5"><Trash2 size={16} /> Delete User Permanently</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddUserModal(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{editingUser?.id ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <input type="text" value={editingUser?.name || ''} onChange={e => setEditingUser(prev => ({...prev, name: e.target.value}))} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <input type="email" value={editingUser?.email || ''} onChange={e => setEditingUser(prev => ({...prev, email: e.target.value}))} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Assign Plan</label>
                <select value={editingUser?.plan || 'Free'} onChange={e => setEditingUser(prev => ({...prev, plan: e.target.value}))} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors text-gray-900 dark:text-gray-100">
                  <option>Free</option>
                  <option>Pro</option>
                  <option>Ultra</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <select value={editingUser?.status || 'Active'} onChange={e => setEditingUser(prev => ({...prev, status: e.target.value}))} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors text-gray-900 dark:text-gray-100">
                  <option>Active</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-900/30 rounded-b-2xl">
              <button onClick={() => setShowAddUserModal(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={handleSaveUser} className="px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors">{editingUser?.id ? 'Save Changes' : 'Create User'}</button>
            </div>
          </div>
        </div>
      )}

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
          {/* Live Preview Panel for Hero */}
          <div className="mb-8">
            <label className="block text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Live Preview</label>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden flex flex-col">
              {/* Mock Browser Header */}
              <div className="bg-gray-100 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center gap-4 shrink-0">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                </div>
              </div>
              {/* Mock Header (Nav) */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60">
                <div className="flex items-center gap-3">
                  {cmsConfig.global?.siteLogo ? (
                    <img src={cmsConfig.global?.siteLogo} alt="Logo" className="h-5 object-contain max-w-[100px]" />
                  ) : (
                    <span className="text-sm font-extrabold tracking-tight truncate max-w-[100px]" style={{ color: cmsConfig.global?.primaryColor || '#7c3aed' }}>
                      {cmsConfig.global?.siteName || 'Platform'}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-4">
                  <div className="h-1.5 w-6 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                  <div className="h-1.5 w-6 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                  <div className="px-3 py-1 rounded-full text-[9px] font-bold text-white shadow-sm" style={{ backgroundColor: cmsConfig.global?.primaryColor || '#7c3aed' }}>
                    Get Started
                  </div>
                </div>
              </div>
              
              {/* Mock Hero Area */}
              <div className="px-6 py-12 flex flex-col items-center text-center bg-gray-50/50 dark:bg-[#0a0a0a]/50 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ background: `radial-gradient(circle at center, ${cmsConfig.global?.primaryColor || '#7c3aed'} 0%, transparent 70%)` }}></div>
                
                <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                    {cmsConfig.global?.favicon ? (
                      <img src={cmsConfig.global.favicon} className="w-8 h-8 object-contain" alt="Hero Icon" />
                    ) : (
                      <Activity className="w-6 h-6" style={{ color: cmsConfig.global?.primaryColor || '#7c3aed' }} />
                    )}
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-3 px-4 leading-tight">
                    {cmsConfig.home?.hero?.heading || 'Default Heading'}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mb-8 px-4 leading-relaxed">
                    {cmsConfig.home?.hero?.subheading || 'Default subheading text goes here.'}
                  </p>
                  
                  <div className="w-full max-w-sm flex items-center gap-3 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2.5 shadow-sm">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-400 truncate">
                      {cmsConfig.home?.hero?.searchPlaceholder || 'Search...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

  const renderAnalytics = () => {
    const totalSignups = users.length;
    const proUsers = users.filter(u => u.plan === 'Pro').length;
    const ultraUsers = users.filter(u => u.plan === 'Ultra').length;
    const freeUsers = totalSignups - proUsers - ultraUsers;

    return (
    <div className="flex flex-col flex-1 min-h-0 space-y-5 animate-in fade-in duration-500 pb-6">
      <div className="flex justify-between items-end mb-1">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Traffic and engagement metrics.</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowAnalyticsDateDropdown(!showAnalyticsDateDropdown)} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
            {analyticsDateFilter} <ChevronDown size={14} className={`transition-transform ${showAnalyticsDateDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showAnalyticsDateDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 overflow-hidden">
              {['Today', 'Last 7 Days', 'Last 30 Days', 'This Year'].map(option => (
                <button
                  key={option}
                  onClick={() => { setAnalyticsDateFilter(option); setShowAnalyticsDateDropdown(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {[
          { label: 'Daily Active Users', value: (totalSignups > 0 ? Math.max(1, Math.floor(totalSignups * 0.8)) : 0).toLocaleString(), icon: Activity, progress: 75, bg: 'bg-violet-100 dark:bg-violet-900/30', color: 'text-violet-600 dark:text-violet-400', stat: '+8.4%', statColor: 'text-emerald-600 dark:text-emerald-400', statBg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'AI Chats Today', value: (totalSignups * 3).toLocaleString(), icon: MessageSquare, progress: 88, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400', stat: '+14%', statColor: 'text-emerald-600 dark:text-emerald-400', statBg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Avg Session', value: '8m 42s', icon: LineChart, progress: 65, bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-600 dark:text-orange-400', stat: '+1.2%', statColor: 'text-emerald-600 dark:text-emerald-400', statBg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Total Signups', value: totalSignups.toLocaleString(), icon: UserPlus, progress: 92, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400', stat: '+22%', statColor: 'text-emerald-600 dark:text-emerald-400', statBg: 'bg-emerald-50 dark:bg-emerald-500/10' }
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
                <h3 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-none">{item.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 shrink-0">
        
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">User Growth</h3>
            <span className="text-xs font-semibold text-gray-400">Last 30 Days</span>
          </div>
          <div className="h-[220px] w-full flex items-end justify-between gap-2 relative">
            {/* Mock Chart Grid */}
            <div className="absolute inset-0 flex flex-col justify-between border-b border-gray-100 dark:border-gray-800 pointer-events-none">
              <div className="border-t border-gray-50 dark:border-gray-800/50 w-full h-0"></div>
              <div className="border-t border-gray-50 dark:border-gray-800/50 w-full h-0"></div>
              <div className="border-t border-gray-50 dark:border-gray-800/50 w-full h-0"></div>
              <div className="border-t border-gray-50 dark:border-gray-800/50 w-full h-0"></div>
            </div>
            {/* Mock Chart Bars/Line */}
            {[40, 55, 45, 60, 75, 65, 80, 95, 85, 110, 100, 120].map((h, i) => (
              <div key={i} className="relative flex flex-col justify-end w-full group">
                <div 
                  className="bg-violet-100 dark:bg-violet-900/30 w-full rounded-t-md transition-all group-hover:bg-violet-200 dark:group-hover:bg-violet-800/50" 
                  style={{ height: `${h}%` }}
                ></div>
                <div 
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"
                >
                  {h * 15} Users
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel */}
        <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Conversion Funnel</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div className="flex flex-col relative">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex justify-between items-center z-10 border border-gray-200 dark:border-gray-700">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">1. Visitors</span>
                <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{(totalSignups * 12 + 150).toLocaleString()}</span>
              </div>
              <div className="h-6 border-r-2 border-dashed border-gray-200 dark:border-gray-700 w-1/2 relative">
                <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-violet-500 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded">12%</span>
              </div>
              
              <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-3 flex justify-between items-center z-10 border border-violet-100 dark:border-violet-900/50 mx-4">
                <span className="text-xs font-bold text-violet-700 dark:text-violet-300">2. Signups (Free)</span>
                <span className="text-sm font-extrabold text-violet-900 dark:text-violet-100">{freeUsers.toLocaleString()}</span>
              </div>
              <div className="h-6 border-r-2 border-dashed border-gray-200 dark:border-gray-700 w-1/2 relative">
                <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">4.5%</span>
              </div>
              
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 flex justify-between items-center z-10 border border-emerald-100 dark:border-emerald-900/50 mx-8">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">3. Pro Upgrades</span>
                <span className="text-sm font-extrabold text-emerald-900 dark:text-emerald-100">{(proUsers + ultraUsers).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 shrink-0">
        
        {/* Top AI Queries */}
        <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800/50">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Top AI Queries</h3>
          </div>
          <div className="p-2">
            {[
              { q: 'What is P/E ratio?', count: '12.4k' },
              { q: 'Compare TCS vs Reliance', count: '8.2k' },
              { q: 'Top dividend stocks 2026', count: '5.1k' },
              { q: 'Explain Nifty 50', count: '4.8k' },
              { q: 'HDFC Bank analysis', count: '3.9k' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg transition-colors">
                <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300 truncate pr-4">{item.q}</span>
                <span className="text-[11px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Viewed Stocks */}
        <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800/50">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Most Viewed Stocks</h3>
          </div>
          <div className="p-2">
            {[
              { symbol: 'RELIANCE', name: 'Reliance Ind', views: '45k' },
              { symbol: 'HDFCBANK', name: 'HDFC Bank', views: '38k' },
              { symbol: 'TCS', name: 'Tata Consultancy', views: '32k' },
              { symbol: 'INFY', name: 'Infosys', views: '28k' },
              { symbol: 'TATAMOTORS', name: 'Tata Motors', views: '25k' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg transition-colors">
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-gray-900 dark:text-gray-100">{item.symbol}</span>
                  <span className="text-[11px] text-gray-500">{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Eye size={14} /> <span className="text-[11px] font-bold">{item.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Compared */}
        <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800/50">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Most Compared Assets</h3>
          </div>
          <div className="p-2">
            {[
              { pair: 'TCS vs INFY', count: '15.2k' },
              { pair: 'HDFCBANK vs ICICIBANK', count: '12.8k' },
              { pair: 'RELIANCE vs ONGC', count: '9.4k' },
              { pair: 'SBIN vs HDFCBANK', count: '8.7k' },
              { pair: 'WIPRO vs HCLTECH', count: '7.1k' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg transition-colors">
                <span className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{item.pair}</span>
                <span className="text-[11px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

  const renderRevenue = () => {
    const proUsers = users.filter(u => u.plan === 'Pro').length;
    const ultraUsers = users.filter(u => u.plan === 'Ultra').length;
    
    // Fallback pricing if CMS doesn't exist
    const proPrice = parseFloat(cmsConfig?.pricing?.plans?.find(p => p.id === 'pro')?.price || 9);
    const ultraPrice = parseFloat(cmsConfig?.pricing?.plans?.find(p => p.id === 'ultra')?.price || 19);
    
    const proRev = proUsers * proPrice;
    const ultraRev = ultraUsers * ultraPrice;
    const totalRev = proRev + ultraRev;

    return (
    <div className="flex flex-col flex-1 min-h-0 space-y-5 animate-in fade-in duration-500 pb-6">
      <div className="flex justify-between items-end mb-1">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Revenue</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Subscription and billing metrics.</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowRevenueDateDropdown(!showRevenueDateDropdown)} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
            {revenueDateFilter} <ChevronDown size={14} className={`transition-transform ${showRevenueDateDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showRevenueDateDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 overflow-hidden">
              {['Today', 'This Week', 'This Month', 'This Year'].map(option => (
                <button
                  key={option}
                  onClick={() => { setRevenueDateFilter(option); setShowRevenueDateDropdown(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {[
          { label: 'Monthly Recurring (MRR)', value: '$' + totalRev.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), icon: DollarSign, progress: 85, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400', stat: '+4.2%', statColor: 'text-emerald-600 dark:text-emerald-400', statBg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Active Pro Subscribers', value: proUsers.toLocaleString(), icon: Star, progress: 65, bg: 'bg-violet-100 dark:bg-violet-900/30', color: 'text-violet-600 dark:text-violet-400', stat: '+12', statColor: 'text-emerald-600 dark:text-emerald-400', statBg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Active Ultra Subscribers', value: ultraUsers.toLocaleString(), icon: Crown, progress: 45, bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-600 dark:text-orange-400', stat: '+3', statColor: 'text-emerald-600 dark:text-emerald-400', statBg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Churn Rate', value: '2.4%', icon: RefreshCcw, progress: 95, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400', stat: '-0.5%', statColor: 'text-emerald-600 dark:text-emerald-400', statBg: 'bg-emerald-50 dark:bg-emerald-500/10' }
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
                <h3 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-none">{item.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 shrink-0">
        
        {/* Revenue Split Chart */}
        <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Revenue by Tier</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-gray-700 dark:text-gray-300">Basic (Ad-supported)</span>
                <span className="font-extrabold text-gray-900 dark:text-gray-100">$0</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                <div className="bg-gray-400 dark:bg-gray-500 h-3 rounded-full" style={{ width: totalRev > 0 ? '5%' : '0%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-violet-700 dark:text-violet-400">Pro</span>
                <span className="font-extrabold text-gray-900 dark:text-gray-100">${proRev.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                <div className="bg-violet-500 h-3 rounded-full" style={{ width: totalRev > 0 ? `${(proRev / totalRev) * 100}%` : '0%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-orange-600 dark:text-orange-400">Ultra</span>
                <span className="font-extrabold text-gray-900 dark:text-gray-100">${ultraRev.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                <div className="bg-orange-500 h-3 rounded-full" style={{ width: totalRev > 0 ? `${(ultraRev / totalRev) * 100}%` : '0%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Promo Codes */}
        <div className="lg:col-span-2 bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800/50 flex justify-between items-center shrink-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Active Promo Codes</h3>
            <button className="bg-violet-50 hover:bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5">
              <Plus size={14} /> Add Code
            </button>
          </div>
          <div className="p-0 flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Code</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Discount</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Usage</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Expiry</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {[
                  { code: 'EARLYBIRD', discount: '20% OFF', usage: '142 / 500', expiry: 'Dec 31, 2026', status: 'Active' },
                  { code: 'DIWALI50', discount: '50% OFF', usage: '89 / 100', expiry: 'Oct 30, 2026', status: 'Active' },
                  { code: 'STUDENT', discount: '$5 OFF / mo', usage: '34 / ∞', expiry: 'Never', status: 'Active' }
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                    <td className="px-6 py-3 font-bold text-gray-900 dark:text-gray-100 text-sm tracking-wide">{item.code}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 font-medium">{item.discount}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{item.usage}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{item.expiry}</td>
                    <td className="px-6 py-3 text-right">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] flex flex-col shrink-0">
        <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Recent Transactions</h3>
          <button className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700">View all</button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">User</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Plan</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Amount</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {[
                { user: 'rohit.sharma@example.com', plan: 'Ultra (Annual)', amount: '$99.00', date: 'Oct 24, 2026', status: 'Success' },
                { user: 'priya.patel@gmail.com', plan: 'Pro (Monthly)', amount: '$9.00', date: 'Oct 24, 2026', status: 'Success' },
                { user: 'amit.kumar@corp.in', plan: 'Pro (Monthly)', amount: '$9.00', date: 'Oct 23, 2026', status: 'Failed' },
                { user: 'neha.singh@yahoo.com', plan: 'Ultra (Monthly)', amount: '$15.00', date: 'Oct 23, 2026', status: 'Success' },
                { user: 'rahul.verma@outlook.com', plan: 'Pro (Annual)', amount: '$89.00', date: 'Oct 22, 2026', status: 'Success' }
              ].map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                  <td className="px-6 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.user}</div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{item.plan}</span>
                  </td>
                  <td className="px-6 py-3 font-semibold text-gray-900 dark:text-gray-100 text-sm">{item.amount}</td>
                  <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{item.date}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${item.status === 'Success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

  const renderNewsManager = () => (
    <div className="flex flex-col flex-1 min-h-0 space-y-5 animate-in fade-in duration-500 pb-6">
      <div className="flex justify-between items-end mb-1">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">News Manager</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Curate the Market Pulse feed.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={14} />
            <input
              type="text" placeholder="Search news..."
              className="pl-8 pr-3 py-1.5 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors w-48 text-gray-900 dark:text-gray-100 shadow-sm placeholder:text-gray-400"
            />
          </div>
          <button onClick={() => setShowAddLinkModal(true)} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-violet-500/20 flex items-center gap-2">
            <Plus size={16} /> Add Custom Link
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 shrink-0">
        
        {/* Source Settings */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">News Sources</h3>
            <div className="space-y-4">
              {newsSources.map((source, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">{source.name}</span>
                  <button onClick={async () => {
                    const updated = [...newsSources];
                    updated[i].active = !updated[i].active;
                    setNewsSources(updated);
                    
                    const disabled = updated.filter(s => !s.active).map(s => s.name);
                    try {
                      await fetch('/api/admin/news/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ disabledSources: disabled })
                      });
                      fetchAdminNews();
                    } catch(e) { console.error(e); }
                  }} className={`w-9 h-5 rounded-full relative transition-colors ${source.active ? 'bg-violet-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <div className={`absolute top-0.5 bottom-0.5 w-4 rounded-full bg-white transition-all shadow-sm ${source.active ? 'left-[calc(100%-18px)]' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">Refresh Interval</h3>
            <div className="flex gap-2 items-center">
              <input type="number" value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)} className="w-16 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 text-center" />
              <span className="text-sm text-gray-500 font-medium">minutes</span>
            </div>
          </div>
        </div>

        {/* Live News Table */}
        <div className="lg:col-span-3 bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] flex flex-col min-h-[400px]">
          <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800/50 flex justify-between items-center shrink-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Live Articles</h3>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">24 Active</span>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 w-[50%]">Headline</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Source</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Time</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {customNewsLinks.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug pr-4">{item.title}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400">{item.source?.name || item.source}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">{item.time || new Date(item.publishedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                        (item.adminStatus || 'Live') === 'Pinned' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-800' :
                        (item.adminStatus || 'Live') === 'Live' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                        'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                      }`}>
                        {(item.adminStatus || 'Live').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={async () => {
                          const res = await fetch('/api/admin/news/settings');
                          const settings = await res.json();
                          settings.pinnedArticles = settings.pinnedArticles || [];
                          if (settings.pinnedArticles.includes(item.link)) {
                             settings.pinnedArticles = settings.pinnedArticles.filter(u => u !== item.link);
                          } else {
                             settings.pinnedArticles.push(item.link);
                          }
                          await fetch('/api/admin/news/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ pinnedArticles: settings.pinnedArticles })
                          });
                          fetchAdminNews();
                        }} className={`p-1.5 rounded transition-colors ${item.adminStatus === 'Pinned' ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`} title={item.adminStatus === 'Pinned' ? "Unpin" : "Pin to top"}>
                          <Pin size={15} />
                        </button>
                        <button onClick={async () => {
                          const res = await fetch('/api/admin/news/settings');
                          const settings = await res.json();
                          settings.hiddenArticles = settings.hiddenArticles || [];
                          if (settings.hiddenArticles.includes(item.link)) {
                             settings.hiddenArticles = settings.hiddenArticles.filter(u => u !== item.link);
                          } else {
                             settings.hiddenArticles.push(item.link);
                          }
                          await fetch('/api/admin/news/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ hiddenArticles: settings.hiddenArticles })
                          });
                          fetchAdminNews();
                        }} className={`p-1.5 rounded transition-colors ${item.adminStatus === 'Hidden' ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`} title={item.adminStatus === 'Hidden' ? "Unhide" : "Hide"}>
                          <EyeOff size={15} />
                        </button>
                        <button onClick={async () => {
                           if (!item.isCustom) return alert('Only custom links can be deleted.');
                           const res = await fetch(`/api/admin/news/settings?t=${Date.now()}`);
                           const settings = await res.json();
                           settings.customLinks = settings.customLinks.filter(c => c.url !== item.link);
                           await fetch('/api/admin/news/settings', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({ customLinks: settings.customLinks })
                           });
                           fetchAdminNews();
                        }} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors" title="Delete">
                          <XCircle size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );

  const renderAuditLog = () => (
    <div className="flex flex-col flex-1 min-h-0 space-y-5 animate-in fade-in duration-500 pb-6">
      <div className="flex justify-between items-end mb-1">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Audit Log</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Full history of admin actions and CMS changes.</p>
        </div>
        <button onClick={() => handleExportCSV('auditLogs')} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
          Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] flex flex-col flex-1 min-h-[500px]">
        {/* Filter Bar */}
        <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800/50 flex flex-wrap gap-4 items-center shrink-0">
          <div className="relative group flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={14} />
            <input
              type="text" placeholder="Search logs..."
              className="pl-8 pr-3 py-2 w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 dark:focus:border-violet-500 transition-colors text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Filter size={14} /> Section: All
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Users size={14} /> Admin: All
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <CalendarDays size={14} /> Last 7 Days
            </button>
          </div>
        </div>
        
        {/* Full Width Table */}
        <div className="p-0 overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 w-48">Timestamp</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 w-48">Admin User</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 w-32">Section</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 w-48">Action</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Details (Before → After)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {auditLogs.length > 0 ? auditLogs.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">{item.time}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 flex items-center justify-center text-[10px] font-bold">
                        {item.admin ? item.admin.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="text-[13px] font-medium text-gray-900 dark:text-gray-100">{item.admin}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] font-medium text-gray-600 dark:text-gray-300">{item.section}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[13px] font-bold ${item.actionColor || 'text-gray-600 dark:text-gray-400'}`}>{item.action}</span>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400">
                    {item.details?.includes('→') ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{item.details.split('→')[0]}</span>
                        <ArrowRight size={12} className="text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{item.details.split('→')[1]}</span>
                      </div>
                    ) : (
                      item.details
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderApiData = () => (
    <div className="flex flex-col flex-1 min-h-0 space-y-5 animate-in fade-in duration-500 pb-6">
      <div className="flex justify-between items-end mb-1">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">API & Data</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage data providers and API usage limits.</p>
        </div>
        <button className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
          View Documentation <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 shrink-0">
        {[
          { name: 'NSE Real-time', status: 'Operational', uptime: '99.98%', latency: '42ms', requests: '1.2M/day', icon: Server, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
          { name: 'BSE Market Data', status: 'Operational', uptime: '99.95%', latency: '58ms', requests: '850K/day', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
          { name: 'AMFI Mutual Funds', status: 'Degraded', uptime: '98.40%', latency: '450ms', requests: '420K/day', icon: Database, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' }
        ].map((provider, i) => (
          <div key={i} className="bg-white dark:bg-black p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] flex flex-col relative overflow-hidden group hover:border-violet-200 dark:hover:border-violet-900/50 transition-colors cursor-pointer">
            <div className="flex items-start justify-between relative z-10 mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${provider.bg} flex items-center justify-center`}>
                  <provider.icon className={provider.color} size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{provider.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${provider.status === 'Operational' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                    <span className="text-[11px] font-medium text-gray-500">{provider.status}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-auto">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Uptime</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{provider.uptime}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Avg Latency</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{provider.latency}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 shrink-0">
        <div className="lg:col-span-2 bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">API Usage Today</h3>
            <span className="text-xs font-semibold text-gray-500 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded">Reset in 8h 12m</span>
          </div>
          <div className="p-5 space-y-6 flex-1 overflow-y-auto min-h-0">
            {(systemHealth?.apiUsage || []).map((api, i) => {
              const percent = Math.min(100, Math.round((api.used / api.limit) * 100));
              const isNearLimit = percent > 80;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{api.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-gray-100">{api.used.toLocaleString()}</span>
                      <span className="text-gray-400">/ {api.limit.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-1000 ${isNearLimit ? 'bg-red-500' : api.color}`} style={{ width: `${percent}%` }}></div>
                  </div>
                  {isNearLimit && (
                    <p className="text-[11px] font-medium text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> Approaching limit for today.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upgrade Card Reused from Overview */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-violet-500/20">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-black opacity-10 blur-xl"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                <Zap size={20} className="text-white drop-shadow-sm" />
              </div>
              <h3 className="text-lg font-bold mb-2">Upgrade API Tier</h3>
              <p className="text-sm text-violet-100/90 leading-relaxed mb-6 font-medium">
                Your News Aggregator API is nearing its daily limit. Upgrade to Enterprise to get unlimited real-time news fetching.
              </p>
            </div>
            <button className="w-full bg-white text-violet-900 hover:bg-gray-50 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm">
              View Upgrade Options
            </button>
          </div>
        </div>
      </div>
    </div>
  );


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

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
          
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dashboard</div>
            <div className="space-y-0.5">
              {[
                { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                { id: 'users', icon: Users, label: 'Users' }
              ].map(tab => (
                <button
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`relative group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeTab === tab.id ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200'}`}
                >
                  {activeTab === tab.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-violet-600 dark:bg-violet-500 rounded-r-full" />}
                  <tab.icon size={16} className={`transition-colors ${activeTab === tab.id ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400 group-hover:text-violet-400'}`} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Insights</div>
            <div className="space-y-0.5">
              {[
                { id: 'analytics', icon: BarChart3, label: 'Analytics' },
                { id: 'revenue', icon: DollarSign, label: 'Revenue' },
                { id: 'news_manager', icon: Newspaper, label: 'News Manager' },
                { id: 'audit_log', icon: ScrollText, label: 'Audit Log' }
              ].map(tab => (
                <button
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`relative group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeTab === tab.id ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200'}`}
                >
                  {activeTab === tab.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-violet-600 dark:bg-violet-500 rounded-r-full" />}
                  <tab.icon size={16} className={`transition-colors ${activeTab === tab.id ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400 group-hover:text-violet-400'}`} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Configuration</div>
            <div className="space-y-0.5">
              {[
                { id: 'content', icon: FileEdit, label: 'Website CMS' },
                { id: 'api_data', icon: Database, label: 'API & Data' },
                { id: 'settings', icon: Settings, label: 'Settings' }
              ].map(tab => (
                <button
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`relative group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeTab === tab.id ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200'}`}
                >
                  {activeTab === tab.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-violet-600 dark:bg-violet-500 rounded-r-full" />}
                  <tab.icon size={16} className={`transition-colors ${activeTab === tab.id ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400 group-hover:text-violet-400'}`} />
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
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'revenue' && renderRevenue()}
          {activeTab === 'news_manager' && renderNewsManager()}
          {activeTab === 'audit_log' && renderAuditLog()}
          {activeTab === 'api_data' && renderApiData()}
          {activeTab === 'settings' && (
            <div className="flex flex-col flex-1 min-h-0 space-y-5 animate-in fade-in duration-500 pb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">System Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure your dashboard and account preferences.</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 shrink-0">
                
                {/* Admin Account Card */}
                <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-violet-50 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                      <User size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Admin Account</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                          <input id="settings-email" type="email" defaultValue={currentUser?.email || 'admin@stockbuzz.in'} className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors text-gray-900 dark:text-gray-100" />
                        </div>
                      </div>
                      <button onClick={() => { const v = document.getElementById('settings-email')?.value; if(v) handleSaveCredentials('email', v); }} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shadow-sm">
                        Update Email
                      </button>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                          <input id="settings-password" type="password" placeholder="Enter new password..." className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors text-gray-900 dark:text-gray-100" />
                        </div>
                      </div>
                      <button onClick={() => { const v = document.getElementById('settings-password')?.value; if(v && v.length >= 6) { handleSaveCredentials('password', v); document.getElementById('settings-password').value = ''; } else alert('Password must be at least 6 characters.'); }} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shadow-sm">
                        Change Password
                      </button>
                    </div>
                    <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">Two-Factor Auth <Smartphone size={14} className="text-gray-400" /></p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Secure your admin account with 2FA.</p>
                        </div>
                        <button className="w-10 h-6 bg-violet-600 rounded-full relative transition-colors shadow-inner">
                          <div className="absolute left-[calc(100%-22px)] top-1 bottom-1 w-4 bg-white rounded-full transition-all shadow-sm"></div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notifications Card */}
                <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                      <Bell size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
                  </div>
                  <div className="space-y-5">
                    {[
                      { key: 'proAlerts', label: 'Pro Signup Alerts', desc: 'Email me when a user upgrades to Pro/Ultra.' },
                      { key: 'apiWarnings', label: 'API Limit Warnings', desc: 'Alert me when API usage exceeds 80%.' },
                      { key: 'weeklySummary', label: 'Weekly Summary', desc: 'Receive a weekly digest of platform activity.' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                        <button onClick={() => { const newToggles = {...notifToggles, [item.key]: !notifToggles[item.key]}; setNotifToggles(newToggles); handleSaveSettings(newToggles); }} className={`w-10 h-6 rounded-full relative transition-colors shadow-inner ${notifToggles[item.key] ? 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-all shadow-sm ${notifToggles[item.key] ? 'left-[calc(100%-18px)]' : 'left-1'}`}></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Refresh Card */}
                <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                      <RefreshCcw size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Data Synchronization</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Market Data Cache</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">How often ticker prices refresh on frontend.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue="30" min="5" max="300" className="w-16 px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors text-gray-900 dark:text-gray-100 text-center" />
                        <span className="text-xs font-semibold text-gray-400">sec</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">AI Context TTL</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Time to live for cached AI responses.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue="24" min="1" max="168" className="w-16 px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors text-gray-900 dark:text-gray-100 text-center" />
                        <span className="text-xs font-semibold text-gray-400">hrs</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800/50">
                      <button onClick={() => { handleSaveSettings(notifToggles); alert('Sync settings saved!'); }} className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
                        Save Sync Settings
                      </button>
                    </div>
                  </div>
                </div>

                {/* Appearance Card */}
                <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                      <Sun size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Appearance</h3>
                  </div>
                  <div className="space-y-5">
                    <button onClick={toggleTheme} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800/80 hover:border-violet-200 dark:hover:border-violet-900/50 transition-colors bg-gray-50/50 dark:bg-gray-900/20">
                      <div className="flex items-center gap-3">
                        <div className="text-violet-600 dark:text-violet-400 bg-white dark:bg-black p-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                          {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{isDarkMode ? 'Dark Mode Active' : 'Light Mode Active'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Click to toggle color scheme</p>
                        </div>
                      </div>
                      <div className={`w-10 h-6 rounded-full relative transition-colors shadow-inner ${isDarkMode ? 'bg-violet-600' : 'bg-gray-200'}`}>
                        <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-all shadow-sm ${isDarkMode ? 'left-[calc(100%-18px)]' : 'left-1'}`}></div>
                      </div>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
        {showAddLinkModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Add Custom Link</h3>
                <button onClick={() => setShowAddLinkModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Link Title</label>
                  <input type="text" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} placeholder="e.g. RBI Policy Update" className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">URL</label>
                  <input type="url" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} placeholder="https://" className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors text-gray-900 dark:text-gray-100" />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button onClick={() => setShowAddLinkModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
                <button onClick={async () => { 
                  if(newLinkTitle && newLinkUrl) {
                    try {
                      const res = await fetch('/api/admin/news/settings');
                      const settings = await res.json();
                      settings.customLinks = settings.customLinks || [];
                      settings.customLinks.push({ title: newLinkTitle, url: newLinkUrl });
                      await fetch('/api/admin/news/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ customLinks: settings.customLinks })
                      });
                      fetchAdminNews();
                      setNewLinkTitle('');
                      setNewLinkUrl('');
                      setShowAddLinkModal(false);
                    } catch(e) { console.error(e); }
                  } else {
                    alert('Please fill in both fields');
                  }
                }} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">Add Link</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
