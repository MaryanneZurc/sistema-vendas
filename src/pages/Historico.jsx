import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, User, CreditCard, Receipt, Search } from 'lucide-react';

export default function Historico() {
  const [vendas, setVendas] = useState([]);
  const [busca, setBusca] = useState(''); // Estado para o texto da busca

  useEffect(() => {
    fetchVendas();
  }, []);

  async function fetchVendas() {
    const { data } = await supabase
      .from('vendas')
      .select(`
        id, 
        total, 
        forma_pagamento, 
        created_at,
        clientes ( nome )
      `)
      .order('created_at', { ascending: false });
    
    setVendas(data || []);
  }

  // Lógica de filtragem em tempo real
  const vendasFiltradas = vendas.filter(v => {
    const nomeCliente = v.clientes?.nome?.toLowerCase() || '';
    const pagamento = v.forma_pagamento?.toLowerCase() || '';
    const termo = busca.toLowerCase();
    
    return nomeCliente.includes(termo) || pagamento.includes(termo);
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Receipt className="text-blue-600" /> Histórico de Vendas
          </h1>
          <p className="text-sm text-gray-500">Consulte e filtre todas as transações realizadas</p>
        </div>

        {/* Barra de Busca Estilizada */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por cliente ou pagamento..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Data</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Pagamento</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendasFiltradas.length > 0 ? (
              vendasFiltradas.map((v) => (
                <tr key={v.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(v.created_at).toLocaleString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700 uppercase">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      {v.clientes?.nome || 'Consumidor'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                      v.forma_pagamento === 'Pix' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <CreditCard size={12} /> {v.forma_pagamento}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-gray-800 text-right">
                    R$ {Number(v.total).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                  Nenhuma venda encontrada para "{busca}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}