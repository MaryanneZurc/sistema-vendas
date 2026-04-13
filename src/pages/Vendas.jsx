import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle, User, Package, AlertTriangle } from 'lucide-react';

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

  const alterarQuantidade = (id, delta) => {
    setCarrinho(carrinho.map(item => {
      if (item.id === id) {
        const novaQtd = item.qtd + delta;
        if (novaQtd >= 1 && novaQtd <= item.estoque) {
          return { ...item, qtd: novaQtd };
        } else if (novaQtd > item.estoque) {
          alert("Limite de estoque atingido para este produto!");
        }
      }
      return item;
    }));
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

      for (const item of carrinho) {
        const { error: erroEstoque } = await supabase.rpc('decrement_stock', { 
          row_id: item.id, 
          quantity: item.qtd 
        });
        if (erroEstoque) console.error("Erro no estoque:", erroEstoque);
      }

      alert("Venda realizada com sucesso!");
      setCarrinho([]);
      setClienteId('');
      fetchDados();
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
        
        {/* Catálogo e Cliente */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4 flex items-center gap-2">
              <User size={16}/> Dados do Cliente
            </h2>
            <select 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 uppercase text-sm font-medium"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            >
              <option value="">Selecione o cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome} - {c.documento}</option>)}
            </select>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-400 uppercase mb-4 flex items-center gap-2">
              <Package size={16}/> Catálogo de Produtos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {produtos.map(p => (
                <div 
                  key={p.id} 
                  className={`p-4 border rounded-xl transition-all flex justify-between items-center group ${
                    p.estoque <= 5 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100 hover:border-blue-300'
                  }`}
                >
                  <div>
                    <p className="font-bold text-gray-700">{p.nome}</p>
                    <p className="text-green-600 font-bold text-lg">R$ {p.preco.toFixed(2)}</p>
                    <p className={`text-xs font-bold flex items-center gap-1 ${p.estoque <= 5 ? 'text-orange-600' : 'text-gray-400'}`}>
                      {p.estoque <= 5 && <AlertTriangle size={12} />}
                      Estoque: {p.estoque}
                    </p>
                  </div>
                  <button 
                    onClick={() => adicionarAoCarrinho(p)}
                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 shadow-md active:scale-90 transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumo da Venda Interativo */}
        <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 flex flex-col h-[calc(100vh-180px)] sticky top-8">
          <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Resumo da Venda</h2>
          
          <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2 custom-scrollbar">
            {carrinho.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <ShoppingCart className="mx-auto mb-2 opacity-10" size={60} />
                <p className="text-sm">Seu carrinho está pronto para novas vendas.</p>
              </div>
            ) : (
              carrinho.map(item => (
                <div key={item.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-700 text-xs uppercase leading-tight">{item.nome}</span>
                    <button onClick={() => removerDoCarrinho(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 bg-white border rounded-md px-1 py-1">
                      <button 
                        onClick={() => alterarQuantidade(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-red-50 text-red-500 rounded transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      
                      <span className="w-6 text-center font-black text-sm">{item.qtd}</span>
                      
                      <button 
                        onClick={() => alterarQuantidade(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-green-50 text-green-600 rounded transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400">Total item</p>
                      <p className="font-bold text-blue-700">R$ {(item.preco * item.qtd).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Subtotal:</span>
              <span className="text-2xl font-black text-gray-900">R$ {totalVenda.toFixed(2)}</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Forma de Pagamento</label>
              <select 
                className="w-full p-3 border rounded-lg bg-gray-50 text-sm font-bold outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
              >
                <option>Dinheiro</option>
                <option>Cartão de Crédito</option>
                <option>Pix</option>
              </select>
            </div>

            <button 
              disabled={carregando}
              onClick={finalizarVenda}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-black hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg active:scale-95 uppercase tracking-wider"
            >
              {carregando ? "Processando..." : <><CheckCircle size={22}/> Finalizar Venda</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}