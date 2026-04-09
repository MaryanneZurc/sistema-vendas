import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, Package, ShoppingCart, LogOut, User } from 'lucide-react';

export default function Sidebar({ children }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20}/> },
    { name: 'Clientes', path: '/clientes', icon: <Users size={20}/> },
    { name: 'Produtos', path: '/produtos', icon: <Package size={20}/> },
    { name: 'Venda (PDV)', path: '/vendas', icon: <ShoppingCart size={20}/> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Barra Lateral fixa */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-800 flex items-center gap-2 text-blue-400">
          <ShoppingCart /> MyStore
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Info do Usuário */}
        <div className="p-4 border-t border-gray-800 bg-gray-950">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-2 rounded-full">
              <User size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-blue-400 uppercase font-bold">{profile?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-900/50 hover:bg-red-700 text-red-200 py-2 rounded-lg transition-all"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </div>

      {/* Área do Conteúdo */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}