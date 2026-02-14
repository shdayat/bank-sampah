import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Target, 
  History, 
  Leaf, 
  Wallet, 
  Weight, 
  ArrowRight,
  Trash2,
  TrendingUp,
  Menu,
  X,
  LogOut,
  User,
  LogIn,
  Lock,
  Settings,
  Edit2,
  Save,
  ShieldCheck,
  Users,
  UserPlus,
  Trash
} from 'lucide-react';

// --- DATA AWAL KATALOG SAMPAH ---
const INITIAL_WASTE_CATALOG = [
  { id: 1, name: 'Botol Plastik (PET)', price: 3000, category: 'Plastik', icon: '🥤' },
  { id: 2, name: 'Kardus Bekas', price: 1500, category: 'Kertas', icon: '📦' },
  { id: 3, name: 'Kaleng Aluminium', price: 12000, category: 'Logam', icon: '🥫' },
  { id: 4, name: 'Kertas HVS/Buku', price: 2000, category: 'Kertas', icon: 'paper' },
  { id: 5, name: 'Botol Kaca', price: 500, category: 'Kaca', icon: '🍾' },
  { id: 6, name: 'Minyak Jelantah', price: 5000, category: 'Cairan', icon: '🛢️' },
];

// --- FORMAT RUPIAH ---
const formatIDR = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

// --- DATA SIMULASI USER & ADMIN ---
const MOCK_DB = {
  'admin': {
    pin: '123456',
    role: 'admin',
    name: 'Administrator',
    balance: 0,
    totalWeight: 0,
    transactions: [],
    savingGoal: { name: '', targetAmount: 0 }
  },
  'Budi Santoso': {
    pin: '1234',
    role: 'user',
    name: 'Budi Santoso',
    balance: 150000,
    totalWeight: 45,
    transactions: [
      { id: 1, date: '2023-10-25', type: 'Setor', item: 'Kardus Bekas', weight: 10, total: 15000 },
      { id: 2, date: '2023-10-24', type: 'Setor', item: 'Botol Plastik', weight: 5, total: 15000 },
    ],
    savingGoal: { name: 'Beli Emas Antam 1gr', targetAmount: 1200000 }
  },
  'Siti Aminah': {
    pin: '1234',
    role: 'user',
    name: 'Siti Aminah',
    balance: 500000,
    totalWeight: 120,
    transactions: [
       { id: 3, date: '2023-10-26', type: 'Setor', item: 'Kaleng Aluminium', weight: 5, total: 60000 },
    ],
    savingGoal: { name: 'Bayar Listrik Bulan Ini', targetAmount: 600000 }
  }
};

export default function EcoSaveApp() {
  // --- GLOBAL APP STATE ---
  const [wasteCatalog, setWasteCatalog] = useState(INITIAL_WASTE_CATALOG);
  const [usersDb, setUsersDb] = useState(MOCK_DB); 

  // --- AUTH STATE ---
  const [currentUser, setCurrentUser] = useState(null); // Username string
  const [userRole, setUserRole] = useState('guest'); // 'user' | 'admin' | 'guest'
  
  // --- SESSION STATE ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [balance, setBalance] = useState(0); 
  const [totalWeight, setTotalWeight] = useState(0); 
  const [transactions, setTransactions] = useState([]);
  const [savingGoal, setSavingGoal] = useState({ name: '', targetAmount: 0 });

  // State Inputs
  const [selectedWasteId, setSelectedWasteId] = useState(1);
  const [inputWeight, setInputWeight] = useState('');
  const [notification, setNotification] = useState(null);
  
  // Login Inputs
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin User Management State
  const [newUser, setNewUser] = useState({ username: '', name: '', pin: '', role: 'user' });
  const [editingUserKey, setEditingUserKey] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', pin: '' });

  // --- AUTH LOGIC ---
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const username = loginUsername.trim();
    const userData = usersDb[username];

    // Validasi User & PIN
    if (!userData) {
      setLoginError('User tidak ditemukan.');
      return;
    }
    if (userData.pin !== loginPin) {
      setLoginError('PIN salah. Silakan coba lagi.');
      return;
    }

    // Login Sukses
    if (userData.role === 'admin') {
      setUserRole('admin');
      setActiveTab('admin-users'); // Admin default tab (changed to users)
    } else {
      setUserRole('user');
      setActiveTab('dashboard'); // User default tab
      // Load Data User
      setBalance(userData.balance);
      setTotalWeight(userData.totalWeight);
      setTransactions(userData.transactions);
      setSavingGoal(userData.savingGoal);
    }
    
    setCurrentUser(username);
  };

  const handleLogout = () => {
    // Simpan state terakhir user ke DB (hanya jika user biasa)
    if (userRole === 'user' && currentUser) {
      setUsersDb(prev => ({
        ...prev,
        [currentUser]: {
          ...prev[currentUser],
          balance,
          totalWeight,
          transactions,
          savingGoal
        }
      }));
    }
    
    // Reset State
    setCurrentUser(null);
    setUserRole('guest');
    setLoginUsername('');
    setLoginPin('');
    setLoginError('');
  };

  // --- CORE LOGIC (USER) ---
  const selectedWaste = wasteCatalog.find(w => w.id === parseInt(selectedWasteId)) || wasteCatalog[0];
  const estimatedEarn = inputWeight ? parseFloat(inputWeight) * selectedWaste.price : 0;

  const handleDeposit = (e) => {
    e.preventDefault();
    if (!inputWeight || parseFloat(inputWeight) <= 0) return;

    const amount = parseFloat(inputWeight) * selectedWaste.price;
    const newTransaction = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: 'Setor',
      item: selectedWaste.name,
      weight: parseFloat(inputWeight),
      total: amount
    };

    setTransactions([newTransaction, ...transactions]);
    setBalance(prev => prev + amount);
    setTotalWeight(prev => prev + parseFloat(inputWeight));
    setInputWeight('');
    setNotification('Setoran berhasil dicatat! Saldo bertambah.');
    
    setTimeout(() => setNotification(null), 3000);
  };

  // --- ADMIN LOGIC (CATALOG) ---
  const handleUpdatePrice = (id, newPrice) => {
    setWasteCatalog(prev => prev.map(item => 
      item.id === id ? { ...item, price: parseInt(newPrice) } : item
    ));
  };
  
  const handleUpdateName = (id, newName) => {
    setWasteCatalog(prev => prev.map(item => 
      item.id === id ? { ...item, name: newName } : item
    ));
  };

  // --- ADMIN LOGIC (USER MANAGEMENT) ---
  const handleAddUser = (e) => {
    e.preventDefault();
    const { username, name, pin, role } = newUser;
    
    if (usersDb[username]) {
      alert("Username/ID sudah terdaftar!");
      return;
    }

    setUsersDb(prev => ({
      ...prev,
      [username]: {
        pin,
        role,
        name,
        balance: 0,
        totalWeight: 0,
        transactions: [],
        savingGoal: { name: '', targetAmount: 0 }
      }
    }));
    setNewUser({ username: '', name: '', pin: '', role: 'user' });
    alert("User berhasil ditambahkan.");
  };

  const handleDeleteUser = (username) => {
    if (username === currentUser) {
      alert("Tidak bisa menghapus akun yang sedang login.");
      return;
    }
    if (window.confirm(`Yakin ingin menghapus user ${username}?`)) {
      const newDb = { ...usersDb };
      delete newDb[username];
      setUsersDb(newDb);
    }
  };

  const startEditUser = (username, user) => {
    setEditingUserKey(username);
    setEditFormData({ name: user.name, pin: user.pin });
  };

  const saveEditUser = (username) => {
    setUsersDb(prev => ({
      ...prev,
      [username]: {
        ...prev[username],
        name: editFormData.name,
        pin: editFormData.pin
      }
    }));
    setEditingUserKey(null);
  };

  // --- COMPONENTS ---

  // 1. LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden animate-fade-in border border-emerald-100">
          <div className="bg-emerald-600 p-8 text-center relative">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-emerald-500">
              <Leaf className="text-emerald-600" size={36} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">EcoSave</h1>
            <p className="text-emerald-100 text-sm">Portal Bank Sampah Digital</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Username Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ID Pengguna</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Masukkan ID Pengguna"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* PIN Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">PIN Keamanan</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    type="password" 
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder="Masukkan PIN"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all tracking-widest"
                    required
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-pulse">
                  <X size={16} /> {loginError}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <LogIn size={20} /> Masuk Sistem
              </button>
            </form>
            
            {/* Demo credentials removed as requested */}
            <div className="mt-8 text-center text-xs text-gray-400">
               &copy; 2024 EcoSave Digital System
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. NAVIGATION COMPONENT
  const Navigation = () => (
    <>
      {/* Mobile Bottom Nav (User Only) */}
      {userRole === 'user' && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-6 py-2 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <NavButton icon={<LayoutDashboard size={20} />} label="Home" tab="dashboard" />
          <NavButton icon={<PlusCircle size={20} />} label="Setor" tab="deposit" />
          <NavButton icon={<Target size={20} />} label="Target" tab="goal" />
          <NavButton icon={<History size={20} />} label="Riwayat" tab="history" />
        </nav>
      )}

      {/* Mobile Bottom Nav (Admin Only) */}
      {userRole === 'admin' && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-6 py-2 flex justify-center items-center gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <NavButton icon={<LayoutDashboard size={20} />} label="Dashboard" tab="admin-dashboard" />
           <NavButton icon={<Users size={20} />} label="Users" tab="admin-users" />
           <NavButton icon={<Settings size={20} />} label="Katalog" tab="admin-catalog" />
        </nav>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-emerald-900 text-white fixed left-0 top-0 p-6 shadow-xl z-50">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-white p-2 rounded-full shadow-lg">
            <Leaf className="text-emerald-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">EcoSave</h1>
            <div className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded-full inline-block mt-1 uppercase tracking-wider font-semibold">
              {userRole === 'admin' ? 'Administrator' : 'Member Area'}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {userRole === 'user' ? (
            <>
              <SidebarButton icon={<LayoutDashboard size={20} />} label="Dashboard" tab="dashboard" />
              <SidebarButton icon={<PlusCircle size={20} />} label="Setor Sampah" tab="deposit" />
              <SidebarButton icon={<Target size={20} />} label="Target Tabungan" tab="goal" />
              <SidebarButton icon={<History size={20} />} label="Riwayat Transaksi" tab="history" />
            </>
          ) : (
            <>
              <SidebarButton icon={<LayoutDashboard size={20} />} label="Dashboard" tab="admin-dashboard" />
              <SidebarButton icon={<Users size={20} />} label="Manajemen User" tab="admin-users" />
              <SidebarButton icon={<Settings size={20} />} label="Manajemen Katalog" tab="admin-catalog" />
            </>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-emerald-800">
          <div className="flex items-center gap-3 mb-4">
             <div className={`p-2 rounded-full ${userRole === 'admin' ? 'bg-amber-500 text-white' : 'bg-emerald-800 text-emerald-100'}`}>
                {userRole === 'admin' ? <ShieldCheck size={16} /> : <User size={16} />}
             </div>
             <div>
                <div className="text-xs text-emerald-300">Login sebagai:</div>
                <div className="font-medium text-sm truncate w-32 capitalize">{usersDb[currentUser]?.name}</div>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-emerald-200 hover:text-white hover:bg-emerald-800 px-3 py-2 rounded-lg transition text-sm group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Keluar
          </button>
        </div>
      </aside>
    </>
  );

  const NavButton = ({ icon, label, tab }) => (
    <button 
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === tab ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:text-gray-600'}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  const SidebarButton = ({ icon, label, tab }) => (
    <button 
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${activeTab === tab ? 'bg-white text-emerald-900 shadow-lg font-semibold translate-x-1' : 'text-emerald-100 hover:bg-emerald-800 hover:pl-4'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  // 3. ADMIN VIEW: DASHBOARD
  const AdminDashboardView = () => {
    // Calculate statistics
    let totalDeposits = 0;
    let totalEarnings = 0;
    let totalCitizens = 0;

    Object.entries(usersDb).forEach(([username, user]) => {
      if (user.role === 'user') {
        totalDeposits += user.transactions.length;
        totalEarnings += user.balance;
        totalCitizens += 1;
      }
    });

    // Get top contributors
    const topContributors = Object.entries(usersDb)
      .filter(([username, user]) => user.role === 'user')
      .sort(([, a], [, b]) => (b.totalWeight || 0) - (a.totalWeight || 0))
      .slice(0, 5);

    return (
      <div className="space-y-6 animate-fade-in">
        <header className="flex justify-between items-end bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-2xl text-white shadow-lg mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Laporan Dashboard 📊</h2>
            <p className="text-purple-100 opacity-90">Statistik keseluruhan Bank Sampah.</p>
          </div>
          <LayoutDashboard size={48} className="text-white opacity-20" />
        </header>

        {/* Main Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Deposits */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-100">Jumlah Setoran</h3>
              <PlusCircle size={24} className="text-blue-200" />
            </div>
            <div className="text-4xl font-bold">{totalDeposits}</div>
            <p className="text-xs text-blue-100 mt-2">Total transaksi dari semua warga</p>
          </div>

          {/* Total Earnings */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-emerald-100">Perolehan Warga</h3>
              <Wallet size={24} className="text-emerald-200" />
            </div>
            <div className="text-4xl font-bold">{formatIDR(totalEarnings)}</div>
            <p className="text-xs text-emerald-100 mt-2">Total saldo warga terkumpul</p>
          </div>

          {/* Total Citizens */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-amber-100">Total Warga Aktif</h3>
              <Users size={24} className="text-amber-200" />
            </div>
            <div className="text-4xl font-bold">{totalCitizens}</div>
            <p className="text-xs text-amber-100 mt-2">Anggota Bank Sampah</p>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-purple-600"/> Warga Teraktif (Kontributor Terbanyak)
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {topContributors.length > 0 ? (
              topContributors.map(([username, user], index) => (
                <div key={username} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-purple-400 to-indigo-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{user.name}</div>
                      <div className="text-xs text-gray-500">{username}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-600">{user.totalWeight || 0} Kg</div>
                    <div className="text-xs text-gray-500">Total sampah</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-gray-400">
                <p>Belum ada data warga</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 4. ADMIN VIEW: CATALOG MANAGEMENT
  const AdminCatalogView = () => (
    <div className="space-y-6 animate-fade-in">
       <header className="flex justify-between items-end bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-2xl text-white shadow-lg mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Manajemen Katalog 🛠️</h2>
          <p className="text-emerald-100 opacity-90">Atur harga dan jenis sampah yang diterima.</p>
        </div>
        <ShieldCheck size={48} className="text-white opacity-20" />
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">Jenis Sampah</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Harga / Kg</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {wasteCatalog.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <input 
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateName(item.id, e.target.value)}
                          className="font-medium text-gray-800 bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none w-full"
                        />
                        <div className="text-xs text-gray-400">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 w-32 border focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                      <span className="text-gray-400 text-xs">Rp</span>
                      <input 
                        type="number"
                        value={item.price}
                        onChange={(e) => handleUpdatePrice(item.id, e.target.value)}
                        className="bg-transparent outline-none w-full font-semibold text-gray-700 text-sm"
                      />
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
                      <Edit2 size={12} /> Auto-Save
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-yellow-50 text-yellow-800 text-sm flex items-center gap-2 border-t border-yellow-100">
           <Settings size={16} />
           Perubahan harga akan langsung berlaku untuk semua pengguna saat setor sampah.
        </div>
      </div>
    </div>
  );

  // 5. ADMIN VIEW: USER MANAGEMENT
  const AdminUserManagementView = () => (
    <div className="space-y-6 animate-fade-in">
       <header className="flex justify-between items-end bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white shadow-lg mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Manajemen Pengguna 👥</h2>
          <p className="text-blue-100 opacity-90">Tambah user baru, edit nama & reset PIN.</p>
        </div>
        <Users size={48} className="text-white opacity-20" />
      </header>

      {/* Add New User Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
          <UserPlus size={20} className="text-blue-600"/> Tambah Pengguna Baru
        </h3>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-5 gap-4">
           <input
             type="text"
             placeholder="Username / ID (Unik)"
             value={newUser.username}
             onChange={(e) => setNewUser({...newUser, username: e.target.value})}
             className="p-3 border rounded-xl text-sm md:col-span-1"
             required
           />
           <input
             type="text"
             placeholder="Nama Lengkap"
             value={newUser.name}
             onChange={(e) => setNewUser({...newUser, name: e.target.value})}
             className="p-3 border rounded-xl text-sm md:col-span-1"
             required
           />
           <input
             type="text"
             placeholder="PIN (Angka)"
             value={newUser.pin}
             onChange={(e) => setNewUser({...newUser, pin: e.target.value})}
             className="p-3 border rounded-xl text-sm md:col-span-1"
             required
           />
           <select
             value={newUser.role}
             onChange={(e) => setNewUser({...newUser, role: e.target.value})}
             className="p-3 border rounded-xl text-sm md:col-span-1"
           >
             <option value="user">User Warga</option>
             <option value="admin">Administrator</option>
           </select>
           <button type="submit" className="bg-blue-600 text-white font-semibold p-3 rounded-xl hover:bg-blue-700 transition md:col-span-1">
             + Tambah
           </button>
        </form>
      </div>

      {/* User List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">ID / Username</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Nama Lengkap</th>
                <th className="p-4 text-sm font-semibold text-gray-600">PIN</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Role</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(usersDb).map(([username, user]) => (
                <tr key={username} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-800">{username}</td>
                  
                  {/* Edit Mode Logic */}
                  {editingUserKey === username ? (
                     <>
                       <td className="p-4">
                         <input 
                           value={editFormData.name}
                           onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                           className="border p-1 rounded w-full text-sm"
                         />
                       </td>
                       <td className="p-4">
                         <input 
                           value={editFormData.pin}
                           onChange={(e) => setEditFormData({...editFormData, pin: e.target.value})}
                           className="border p-1 rounded w-20 text-sm"
                         />
                       </td>
                       <td className="p-4 text-sm capitalize text-gray-500">{user.role}</td>
                       <td className="p-4 text-right space-x-2">
                         <button onClick={() => saveEditUser(username)} className="text-green-600 hover:text-green-800 bg-green-50 p-2 rounded-lg">
                           <Save size={16}/>
                         </button>
                         <button onClick={() => setEditingUserKey(null)} className="text-gray-500 hover:text-gray-700 bg-gray-50 p-2 rounded-lg">
                           <X size={16}/>
                         </button>
                       </td>
                     </>
                  ) : (
                    <>
                      <td className="p-4 text-gray-600">{user.name}</td>
                      <td className="p-4 font-mono text-gray-500 text-sm">{user.pin}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => startEditUser(username, user)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition" title="Edit User">
                           <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteUser(username)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="Hapus User">
                           <Trash size={16} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 6. USER VIEWS (Dashboard, Deposit, etc)
  const DashboardView = () => {
    // Logic Target
    const progressPercentage = savingGoal.targetAmount > 0 ? Math.min((balance / savingGoal.targetAmount) * 100, 100) : 0;
    
    return (
      <div className="space-y-6 animate-fade-in">
        <header className="flex justify-between items-center mb-2">
          <div>
              <h2 className="text-2xl font-bold text-gray-800">Halo, {usersDb[currentUser]?.name.split(' ')[0]}! 👋</h2>
              <p className="text-gray-500 text-sm">Mari pantau kontribusimu hari ini.</p>
          </div>
          <button onClick={handleLogout} className="md:hidden p-2 text-gray-400 bg-white shadow-sm border border-gray-100 rounded-lg">
            <LogOut size={20} />
          </button>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-emerald-100 mb-1">
                <Wallet size={18} />
                <span className="text-sm font-medium">Total Saldo</span>
              </div>
              <div className="text-3xl font-bold tracking-tight">{formatIDR(balance)}</div>
            </div>
            <Leaf className="absolute right-[-20px] bottom-[-20px] text-white opacity-10 w-32 h-32 group-hover:scale-110 transition-transform duration-500" />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Weight size={18} />
                <span className="text-sm font-medium">Sampah Didaur Ulang</span>
              </div>
              <div className="text-3xl font-bold text-gray-800">{totalWeight} <span className="text-lg text-gray-400 font-normal">Kg</span></div>
            </div>
            <div className="bg-orange-50 p-3 rounded-full">
              <Trash2 className="text-orange-500" size={24} />
            </div>
          </div>
        </div>

        {/* Mini Goal Tracker */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition" onClick={() => setActiveTab('goal')}>
          <div className="flex justify-between items-end mb-3">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2"><Target size={16} className="text-emerald-500"/> Target: {savingGoal.name}</h3>
              <p className="text-sm text-gray-500">
                Terkumpul {formatIDR(balance)} dari {formatIDR(savingGoal.targetAmount)}
              </p>
            </div>
            <div className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg">
              {Math.round(progressPercentage)}%
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div 
              className="bg-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  const DepositView = () => (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">Setor Sampah</h2>
        <p className="text-gray-500">Pilih sampah dan masukkan beratnya.</p>
      </header>

      {notification && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-bounce-short">
          <PlusCircle size={18} />
          {notification}
        </div>
      )}

      <form onSubmit={handleDeposit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        {/* Waste Type Selection (Dynamic from State) */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 block">Pilih Jenis Sampah</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {wasteCatalog.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedWasteId(item.id)}
                className={`cursor-pointer p-3 rounded-xl border transition-all flex flex-col gap-1 relative ${selectedWasteId === item.id ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-2xl">{item.icon}</span>
                  {selectedWasteId === item.id && <div className="w-2 h-2 rounded-full bg-emerald-500 absolute top-3 right-3"></div>}
                </div>
                <div className="font-medium text-gray-800 text-sm mt-1">{item.name}</div>
                <div className="text-xs text-emerald-600 font-semibold">{formatIDR(item.price)}/kg</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weight Input */}
        <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Berat (Kg)</label>
            <div className="relative">
                <input 
                    type="number" 
                    step="0.1"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="0.0"
                    required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Kg</span>
            </div>
        </div>

        {/* Calculation Preview */}
        <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-100">
            <span className="text-gray-600 text-sm font-medium">Estimasi Pendapatan:</span>
            <span className="text-xl font-bold text-emerald-600">{formatIDR(estimatedEarn)}</span>
        </div>

        <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex justify-center items-center gap-2"
        >
            <PlusCircle size={20} />
            Konfirmasi Setoran
        </button>
      </form>
    </div>
  );

  const GoalView = () => {
    const progressPercentage = savingGoal.targetAmount > 0 ? Math.min((balance / savingGoal.targetAmount) * 100, 100) : 0;
    const remainingAmount = Math.max(savingGoal.targetAmount - balance, 0);
    // Dynamic calculation using Plastic Bottle price (id=1)
    const plasticPrice = wasteCatalog.find(w => w.id === 1)?.price || 3000;
    const wasteNeededForGoal = (remainingAmount / plasticPrice).toFixed(1);

    return (
      <div className="space-y-6 animate-fade-in">
         <header>
          <h2 className="text-2xl font-bold text-gray-800">Target Tabungan</h2>
          <p className="text-gray-500">Wujudkan impianmu dengan sampah.</p>
        </header>
  
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center space-y-4">
          <div className="inline-block p-4 rounded-full bg-yellow-50 text-yellow-500 mb-2 ring-4 ring-yellow-50/50">
              <Target size={36} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">{savingGoal.name || 'Belum ada target'}</h3>
          
          <div className="relative pt-4 pb-2">
              <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-emerald-600">{formatIDR(balance)}</span>
                  <span className="text-gray-400">{formatIDR(savingGoal.targetAmount)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden relative shadow-inner">
                  <div 
                      className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000 flex items-center justify-end px-2"
                      style={{ width: `${progressPercentage}%` }}
                  >
                      <span className="text-[10px] text-white font-bold drop-shadow-md">{Math.round(progressPercentage)}%</span>
                  </div>
              </div>
          </div>
  
          {remainingAmount > 0 ? (
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm text-left flex gap-3 items-start border border-blue-100">
                  <TrendingUp className="shrink-0 mt-1" size={18} />
                  <div>
                      <span className="font-bold block mb-1">Semangat! 💪</span>
                      Kamu butuh <span className="font-bold">{formatIDR(remainingAmount)}</span> lagi. 
                      Ini setara dengan ~<span className="font-bold text-blue-700 underline">{wasteNeededForGoal} Kg Botol Plastik</span>.
                  </div>
              </div>
          ) : savingGoal.targetAmount > 0 ? (
              <div className="bg-green-100 text-green-800 p-4 rounded-xl font-bold animate-pulse flex items-center justify-center gap-2">
                  🎉 Selamat! Target kamu sudah tercapai!
              </div>
          ) : (
               <div className="text-gray-400 text-sm">Silakan atur target tabunganmu.</div>
          )}
        </div>
  
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Edit2 size={16}/> Ubah Target</h4>
          <div className="space-y-3">
              <div>
                  <label className="text-xs text-gray-500 block mb-1 uppercase font-semibold">Nama Target</label>
                  <input 
                      type="text" 
                      value={savingGoal.name}
                      onChange={(e) => setSavingGoal({...savingGoal, name: e.target.value})}
                      placeholder="Misal: Beli Sepeda"
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
              </div>
              <div>
                  <label className="text-xs text-gray-500 block mb-1 uppercase font-semibold">Nominal Target (Rp)</label>
                  <input 
                      type="number" 
                      value={savingGoal.targetAmount}
                      onChange={(e) => setSavingGoal({...savingGoal, targetAmount: parseFloat(e.target.value)})}
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
              </div>
          </div>
        </div>
      </div>
    );
  };

  const HistoryView = () => (
    <div className="space-y-6 animate-fade-in">
        <header>
            <h2 className="text-2xl font-bold text-gray-800">Riwayat</h2>
            <p className="text-gray-500">Catatan perjalanan lingkunganmu.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {transactions.length > 0 ? (
                <div className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                            <div className="flex gap-3 items-center">
                                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                                    <ArrowRight size={18} className="rotate-[-45deg]" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-800">{tx.item}</div>
                                    <div className="text-xs text-gray-500">{tx.date} • {tx.weight} Kg</div>
                                </div>
                            </div>
                            <div className="font-bold text-emerald-600">
                                +{formatIDR(tx.total)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-10 text-center text-gray-400 flex flex-col items-center gap-3">
                    <div className="bg-gray-100 p-4 rounded-full"><History size={24}/></div>
                    <p>Belum ada transaksi. Yuk setor sampah pertamamu!</p>
                </div>
            )}
        </div>
    </div>
  );

  // --- MAIN LAYOUT RENDER ---
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 md:pl-64">
      <Navigation />
      <main className="max-w-3xl mx-auto p-6 pb-24 md:pb-6 md:pt-10">
        {userRole === 'admin' ? (
           <>
             {activeTab === 'admin-dashboard' && <AdminDashboardView />}
             {activeTab === 'admin-catalog' && <AdminCatalogView />}
             {activeTab === 'admin-users' && <AdminUserManagementView />}
           </>
        ) : (
           <>
             {activeTab === 'dashboard' && <DashboardView />}
             {activeTab === 'deposit' && <DepositView />}
             {activeTab === 'goal' && <GoalView />}
             {activeTab === 'history' && <HistoryView />}
           </>
        )}
      </main>
    </div>
  );
}