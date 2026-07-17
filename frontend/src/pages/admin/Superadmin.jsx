import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LayoutDashboard, Users, FileEdit, Settings, Search, Edit2, Trash2, Shield, Activity, TrendingUp, ChevronRight, Home, LogOut, Sun, Moon } from 'lucide-react';

export default function Superadmin() {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cmsConfig, setCmsConfig] = useState({
    pages: {
      home: { title: "Home Page", content: {}, features: {} },
      chat: { title: "AI Chat Page", features: {} },
      news: { title: "News Hub", features: {} },
      markets: { title: "Markets Overview", features: {} }
    },
    global: {
      enableProSubscriptions: false,
      showBannerAds: false
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetch('/api/cms')
      .then(res => res.json())
      .then(data => {
        if (data && data.pages) setCmsConfig(data);
      })
      .catch(console.error);

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
      await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmsConfig)
      });
      alert('CMS Configuration saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save CMS configuration');
    }
    setIsSaving(false);
  };

  const handleFeatureToggle = (page, feature) => {
    if (!page) {
      // Global feature
      setCmsConfig(prev => ({
        ...prev,
        global: {
          ...prev.global,
          [feature]: !prev.global[feature]
        }
      }));
    } else {
      setCmsConfig(prev => ({
        ...prev,
        pages: {
          ...prev.pages,
          [page]: {
            ...prev.pages[page],
            features: {
              ...prev.pages[page].features,
              [feature]: !prev.pages[page].features[feature]
            }
          }
        }
      }));
    }
  };

  const handleContentChange = (page, key, value) => {
    setCmsConfig(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [page]: {
          ...prev.pages[page],
          content: {
            ...prev.pages[page].content,
            [key]: value
          }
        }
      }
    }));
  };

  // Protect route
  if (!currentUser?.isSuperadmin) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to home after logout is handled by the route protection above!
    } catch (e) {
      console.error(e);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Overview Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
              <Users className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Pro Users</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
            <TrendingUp size={16} /> Up to date
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-violet-50 dark:bg-violet-500/10 rounded-xl">
              <Activity className="text-violet-600 dark:text-violet-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active AI Chats</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">3,241</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
            <TrendingUp size={16} /> +5% this week
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
              <FileEdit className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">News Articles Served</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">89.2k</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
            <TrendingUp size={16} /> +18% this week
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 transition-colors w-64 text-gray-900 dark:text-white"
            />
          </div>
          <button 
            onClick={() => { setEditingUser({ name: '', email: '', status: 'Active', isPro: false }); setShowUserModal(true); }}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            + Add Pro User
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-950/50 border-b border-gray-200 dark:border-gray-800">
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Join Date</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map(user => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                <td className="p-4 text-sm">
                  {user.isPro ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">PRO</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Basic</span>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{user.joinDate}</td>
                <td className="p-4 text-sm">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${user.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => { setEditingUser(user); setShowUserModal(true); }} className="p-1.5 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors" title="Edit User">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete User">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Content Management</h2>
        <button 
          onClick={handleSaveCMS}
          disabled={isSaving}
          className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-8">
        {Object.entries(cmsConfig.pages).map(([pageKey, pageData]) => (
          <div key={pageKey} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-3">
              {pageData.title}
            </h3>
            
            {pageData.content && (
              <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Content</h4>
                <div className="space-y-4">
                  {Object.entries(pageData.content).map(([contentKey, contentValue]) => (
                    <div key={contentKey}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                        {contentKey.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      {contentKey.toLowerCase().includes('subtitle') || contentKey.toLowerCase().includes('text') ? (
                        <textarea 
                          value={contentValue}
                          onChange={e => handleContentChange(pageKey, contentKey, e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 text-gray-900 dark:text-white"
                          rows={3}
                        />
                      ) : (
                        <input 
                          type="text" 
                          value={contentValue}
                          onChange={e => handleContentChange(pageKey, contentKey, e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 text-gray-900 dark:text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pageData.features && (
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(pageData.features).map(([featureKey, isEnabled]) => (
                    <div key={featureKey} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                      <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {featureKey.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <button 
                        onClick={() => handleFeatureToggle(pageKey, featureKey)}
                        className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${isEnabled ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-3">Global Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(cmsConfig.global).map(([featureKey, isEnabled]) => (
              <div key={featureKey} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {featureKey.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <button 
                  onClick={() => handleFeatureToggle(null, featureKey)}
                  className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${isEnabled ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="text-violet-600 dark:text-violet-400" size={28} />
              <h1 className="text-lg font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Superadmin</h1>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'overview' ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <LayoutDashboard size={18} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'users' ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <Users size={18} /> Manage Users
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'content' ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <FileEdit size={18} /> Edit Website
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'settings' ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <Settings size={18} /> Settings
          </button>
        </nav>
        
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <Link 
            to="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white transition-all"
          >
            <Home size={18} /> Back to Site
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-all text-left"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'content' && renderContent()}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Platform Settings</h2>
            </div>
            
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Appearance</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                <button 
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${isDarkMode ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform flex items-center justify-center ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}>
                    {isDarkMode ? <Moon size={10} className="text-violet-600" /> : <Sun size={10} className="text-gray-400" />}
                  </div>
                </button>
              </div>
            </div>
            
            <p className="text-gray-500 dark:text-gray-400">More settings coming soon.</p>
          </div>
        )}
      </main>

      {/* User Edit Modal */}
      {showUserModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingUser.id ? 'Edit User' : 'Add New Pro User'}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input 
                  type="text" 
                  value={editingUser.name}
                  onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input 
                  type="email" 
                  value={editingUser.email}
                  onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select 
                  value={editingUser.status}
                  onChange={e => setEditingUser({...editingUser, status: e.target.value})}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-violet-500 text-gray-900 dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div className="flex items-center justify-between pt-2">
                <label className="block text-sm font-bold text-violet-700 dark:text-violet-400">Pro Subscription</label>
                <button 
                  type="button"
                  onClick={() => setEditingUser({...editingUser, isPro: !editingUser.isPro})}
                  className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${editingUser.isPro ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${editingUser.isPro ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-800">
                <button 
                  type="button" 
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm transition-colors"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
