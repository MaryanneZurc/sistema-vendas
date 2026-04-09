import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Clientes from './pages/Clientes';
import Produtos from './pages/Produtos'; 
import Dashboard from './pages/Dashboard';
import Vendas from './pages/Vendas';

// Componente para proteger rotas e envolver com a Sidebar
const PrivateLayout = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center">Carregando...</div>;
  if (!user) return <Navigate replace to="/login" />;

  return <Sidebar>{children}</Sidebar>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
         <Route path="/" element={
  <PrivateLayout>
    <Dashboard />
  </PrivateLayout>
} />

          <Route path="/clientes" element={
            <PrivateLayout>
              <Clientes />
            </PrivateLayout>
          } />
          <Route path="/produtos" element={
  <PrivateLayout>
    <Produtos />
  </PrivateLayout>
} />

<Route path="/vendas" element={
  <PrivateLayout>
    <Vendas />
  </PrivateLayout>
} />
         
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;