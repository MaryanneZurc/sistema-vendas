import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DollarSign, Users, Package, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalVendas: 0, qtdClientes: 0, qtdProdutos: 0 });
  const [grafico, setGrafico] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    // Busca contagem de clientes e produtos
    const { count: clientes } = await supabase.from('clientes').select('*', { count: 'exact', head: true });
    const { count: produtos } = await supabase.from('produtos').select('*', { count: 'exact', head: true });
    
    // Busca faturamento das vendas
    const { data: vendas } = await supabase.from('vendas').select('total, created_at');

    const total = vendas?.reduce((acc, v) => acc + Number(v.total), 0) || 0;
    
    setStats({ totalVendas: total, qtdClientes: clientes || 0, qtdProdutos: produtos || 0 });
    
    // Agrupa vendas por data para o gráfico
    const dadosAgrupados = vendas?.map(v => ({
      data: new Date(v.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      valor: v.total
    }));
    setGrafico(dadosAgrupados || []);
  }

  const Card = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-4 rounded-lg ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">Resumo do Sistema</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card title="Faturamento Total" value={`R$ ${stats.totalVendas.toFixed(2)}`} icon={DollarSign} color="bg-green-500" />
        <Card title="Clientes Cadastrados" value={stats.qtdClientes} icon={Users} color="bg-blue-500" />
        <Card title="Itens no Catálogo" value={stats.qtdProdutos} icon={Package} color="bg-orange-500" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-green-500"/> Fluxo de Vendas
        </h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grafico}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="data" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Venda (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}