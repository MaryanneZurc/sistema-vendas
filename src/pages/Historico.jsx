import { useEffect, useState } from 'react';
import { supabase } from "../lib/supabaseClient";

export default function Historico() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendas();
  }, []);

  async function fetchVendas() {
    try {
      setLoading(true);
      // Buscamos todas as vendas, incluindo as canceladas, para auditoria
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          *,
          clientes ( nome )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendas(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelarVenda(id) {
    const confirmacao = window.confirm("⚠️ ATENÇÃO: Esta venda será marcada como CANCELADA. O registro permanecerá no sistema para fins de auditoria, mas o status será alterado. Confirmar?");
    
    if (confirmacao) {
      const { error } = await supabase
        .from('vendas')
        .update({ status: 'cancelado' })
        .eq('id', id);

      if (error) {
        alert("Erro ao cancelar venda: " + error.message);
      } else {
        fetchVendas(); // Atualiza a lista para mostrar o efeito visual de cancelado
      }
    }
  }

  if (loading) return <div className="p-8 text-center">Carregando histórico de transações...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📜 Histórico de Vendas</h1>
        <span className="text-sm text-gray-500">{vendas.length} transações registradas</span>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
            <tr>
              <th className="p-4 border-b">Data</th>
              <th className="p-4 border-b">Cliente</th>
              <th className="p-4 border-b">Total</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda) => {
              const isCancelada = venda.status === 'cancelado';

              return (
                <tr 
                  key={venda.id} 
                  className={`border-b transition-colors ${isCancelada ? 'bg-gray-50 text-gray-400' : 'hover:bg-blue-50 text-gray-700'}`}
                >
                  <td className="p-4">
                    {new Date(venda.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className={`p-4 font-medium ${isCancelada ? 'line-through' : ''}`}>
                    {venda.clientes?.nome || "Consumidor Final"}
                  </td>
                  <td className={`p-4 font-bold ${isCancelada ? 'line-through' : 'text-green-600'}`}>
                    R$ {Number(venda.total || 0).toFixed(2)}
                  </td>
                  <td className="p-4">
                    {isCancelada ? (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-black uppercase">
                        Cancelada
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black uppercase">
                        Concluída
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {!isCancelada ? (
                      <button 
                        onClick={() => handleCancelarVenda(venda.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                        title="Cancelar Venda"
                      >
                        🚫 Cancelar
                      </button>
                    ) : (
                      <span className="text-xs italic text-gray-300">Indisponível</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {vendas.length === 0 && (
          <div className="p-10 text-center text-gray-500 italic">
            Nenhuma venda encontrada no banco de dados.
          </div>
        )}
      </div>
    </div>
  );
}