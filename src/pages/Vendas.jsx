import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Plus, Trash2, CheckCircle, User, Package } from 'lucide-react';

export default function Vendas() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    fetchDados();
  }, []);

  async function fetchDados() {
    const resClientes = await supabase.from('clientes').select('*').order('nome');
    // Filtramos apenas produtos que têm estoque maior que 0
    const resProdutos = await supabase.from('produtos').select('*').gt('estoque', 0).order('nome');
    setClientes(resClientes.data || []);
    setProdutos(resProdutos.data || []);
  }

  const adicionarAoCarrinho = (p) => {
    const itemExistente = carrinho.find(item => item.id === p.id);
    if (itemExistente) {
      if (itemExistente.qtd >= p.estoque) return alert("Estoque insuficiente!");
      setCarrinho(carrinho.map(item => 
        item.id === p.id ? { ...item, qtd: item.qtd + 1 } : item
      ));
    } else {
      setCarrinho([...carrinho, { ...p, qtd: 1 }]);
    }
  };

  const removerDoCarrinho = (id) => {
    setCarrinho(carrinho.filter(item => item.id !== id));
  };

  const totalVenda = carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);

  async function finalizarVenda() {
    if (!clienteId) return alert("Por favor, selecione um cliente.");
    if (carrinho.length === 0) return alert("O carrinho está vazio.");

    setCarregando(true);
    try {
      // 1. Registrar a Venda
      const { data: venda, error: erroVenda } = await supabase
        .from('vendas')
        .insert([{
          cliente_id: clienteId,
          total: totalVenda,
          forma_pagamento: formaPagamento,
          vendedor_id: user.id
        }])
        .select()
        .single();

      if (erroVenda) throw erroVenda;

      // 2. Atualizar Estoque (RPC que criamos no SQL Editor anteriormente)
      for (const item of carrinho) {
        const { error: erroEstoque } = await supabase.rpc('decrement_stock', { 
          row_id: item.id, 
          quantity: item.qtd 
        });
        if (erroEstoque) console.error("Erro no estoque:", erroEstoque);
      }

      alert("Venda realizada com sucesso!");
      setCarrinho([]);
      fetchDados(); // Atualiza a lista de produtos com o novo estoque
    } catch (error) {
      alert("Erro ao processar venda: " + error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-8 text-gray-800 flex items-center gap-2">
        <ShoppingCart className="text-blue-600" /> Ponto de Venda (PDV)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna da Esquerda: Seleção */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4 flex items-center gap-2">
              <User size={16}/> Dados do Cliente
            </h2>
            <select 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            >
              <option value="">Selecione o cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.documento})</option>)}
            </select>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4 flex items-center gap-2">
              <Package size={16}/> Catálogo de Produtos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {produtos.map(p => (
                <div key={p.id} className="p-4 border rounded-xl hover:border-blue-300 transition-colors flex justify-between items-center group">
                  <div>
                    <p className="font-bold text-gray-700">{p.nome}</p>
                    <p className="text-green-600 font-medium">R$ {p.preco.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Estoque: {p.estoque}</p>
                  </div>
                  <button 
                    onClick={() => adicionarAoCarrinho(p)}
                    className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Carrinho */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col h-[calc(100vh-200px)]">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Resumo da Venda</h2>
          
          <div className="flex-1 overflow-y-auto space-y-4 mb-6">
            {carrinho.length === 0 ? (
              <p className="text-gray-400 text-center mt-10">Carrinho vazio</p>
            ) : (
              carrinho.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                  <div className="flex-1">
                    <p className="font-medium">{item.nome}</p>
                    <p className="text-gray-500">{item.qtd}x R$ {item.preco.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">R$ {(item.preco * item.qtd).toFixed(2)}</span>
                    <button onClick={() => removerDoCarrinho(item.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between items-center text-xl font-black text-gray-900">
              <span>Total:</span>
              <span>R$ {totalVenda.toFixed(2)}</span>
            </div>

            <select 
              className="w-full p-2 border rounded-lg bg-gray-50 text-sm"
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
            >
              <option>Dinheiro</option>
              <option>Cartão de Crédito</option>
              <option>Pix</option>
            </select>

            <button 
              disabled={carregando}
              onClick={finalizarVenda}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {carregando ? "Processando..." : <><CheckCircle size={20}/> FINALIZAR VENDA</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}