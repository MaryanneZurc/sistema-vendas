import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { PackagePlus, Trash2, Tag, Archive } from 'lucide-react';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchProdutos();
  }, []);

  async function fetchProdutos() {
    const { data } = await supabase.from('produtos').select('*').order('nome');
    setProdutos(data || []);
  }

  async function handleAddProduto(e) {
    e.preventDefault();
    const { error } = await supabase
      .from('produtos')
      .insert([{ nome, preco: parseFloat(preco), estoque: parseInt(estoque) }]);
    
    if (error) alert("Erro ao inserir: " + error.message);
    else {
      setNome(''); setPreco(''); setEstoque('');
      fetchProdutos();
    }
  }

  async function handleDelete(id) {
    if (!confirm("Excluir este produto?")) return;
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) alert("Acesso Negado: Apenas administradores podem excluir.");
    else fetchProdutos();
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Archive className="text-blue-600" /> Estoque de Produtos
      </h1>

      {/* Formulário (Visível apenas para Admin ou conforme sua regra de negócio) */}
      {isAdmin && (
        <form onSubmit={handleAddProduto} className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <input 
            placeholder="Nome do Produto" 
            value={nome} 
            onChange={e => setNome(e.target.value)}
            className="border p-2 rounded-lg outline-blue-500" required
          />
          <input 
            type="number" step="0.01" placeholder="Preço (R$)" 
            value={preco} 
            onChange={e => setPreco(e.target.value)}
            className="border p-2 rounded-lg outline-blue-500" required
          />
          <input 
            type="number" placeholder="Estoque Inicial" 
            value={estoque} 
            onChange={e => setEstoque(e.target.value)}
            className="border p-2 rounded-lg outline-blue-500" required
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
            <PackagePlus size={18} /> Cadastrar
          </button>
        </form>
      )}

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos.map(p => (
          <div key={p.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{p.nome}</h3>
              <div className="flex items-center gap-2 text-green-600 font-semibold my-1">
                <Tag size={16} /> R$ {p.preco.toFixed(2)}
              </div>
              <p className="text-sm text-gray-500">Estoque: <span className="font-medium text-gray-700">{p.estoque} unidades</span></p>
            </div>
            {isAdmin && (
              <button 
                onClick={() => handleDelete(p.id)}
                className="text-gray-300 hover:text-red-600 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}