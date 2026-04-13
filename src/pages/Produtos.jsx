import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Package, Plus, Minus, Trash2, Tag, ShoppingBag, ShoppingCart } from 'lucide-react';
import UploadFoto from '../components/UploadFoto'; // Importando o componente de upload

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [fotoUrl, setFotoUrl] = useState(''); // Estado para a URL da foto
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    fetchProdutos();
  }, []);

  async function fetchProdutos() {
    const { data } = await supabase.from('produtos').select('*').order('nome');
    setProdutos(data || []);
  }

  // Função para cadastrar produto com foto
  async function handleAddProduto(e) {
    e.preventDefault();
    setCarregando(true);
    
    try {
      const { error } = await supabase.from('produtos').insert([
        { 
          nome, 
          preco: parseFloat(preco), 
          estoque: parseInt(estoque),
          foto_url: fotoUrl // Salvando o link da foto no banco
        }
      ]);

      if (error) throw error;

      // Limpa os campos
      setNome('');
      setPreco('');
      setEstoque('');
      setFotoUrl('');
      fetchProdutos();
      alert("Produto cadastrado com sucesso!");
    } catch (error) {
      alert("Erro ao cadastrar: " + error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Excluir este produto?")) return;
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) alert("Erro ao excluir: " + error.message);
    else fetchProdutos();
  }

  // Função de Ajuste de Estoque Manual
  async function ajustarEstoque(id, quantidadeAtual, delta) {
    const novoEstoque = quantidadeAtual + delta;
    if (novoEstoque < 0) return;

    const { error } = await supabase
      .from('produtos')
      .update({ estoque: novoEstoque })
      .eq('id', id);

    if (error) alert(error.message);
    else fetchProdutos();
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-8 text-gray-800 flex items-center gap-2">
        <Package className="text-blue-600" /> Estoque de Produtos
      </h1>

      {/* Formulário de Cadastro com Upload */}
      <form onSubmit={handleAddProduto} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-6 items-center">
        
        {/* Componente de Upload */}
        <UploadFoto onUploadComplete={(url) => setFotoUrl(url)} fotoAtual={fotoUrl} />

        <div className="flex-1 min-w-[200px] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nome do Produto</label>
              <input 
                type="text" placeholder="Ex: Teclado Mecânico" 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={nome} onChange={(e) => setNome(e.target.value)} required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Preço (R$)</label>
              <input 
                type="number" step="0.01" placeholder="0.00" 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={preco} onChange={(e) => setPreco(e.target.value)} required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Estoque Inicial</label>
              <input 
                type="number" placeholder="0" 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={estoque} onChange={(e) => setEstoque(e.target.value)} required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus size={18} /> {carregando ? 'Salvando...' : 'Cadastrar Produto'}
          </button>
        </div>
      </form>

      {/* Grid de Produtos Atualizado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos.map((p) => (
          <div key={p.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
            <button 
              onClick={() => handleDelete(p.id)}
              className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>

            <div className="flex items-start gap-4">
              {/* Espaço para a Imagem Real */}
              <div className="bg-blue-50 w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center">
                {p.foto_url ? (
                  <img src={p.foto_url} alt={p.nome} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag size={28} className="text-blue-600 opacity-40" />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg leading-tight uppercase">{p.nome}</h3>
                <div className="flex items-center gap-1 text-green-600 font-black mt-1">
                  <Tag size={14} />
                  <span>R$ {Number(p.preco).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Ajuste de Estoque */}
            <div className="mt-6 flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase">Estoque Disponível</span>
                <span className={`text-sm font-bold ${p.estoque <= 5 ? 'text-orange-600 font-black' : 'text-gray-700'}`}>
                  {p.estoque} unidades {p.estoque <= 5 && '⚠️'}
                </span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => ajustarEstoque(p.id, p.estoque, -1)}
                  className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                >
                  <Minus size={16} />
                </button>
                <button 
                  onClick={() => ajustarEstoque(p.id, p.estoque, 1)}
                  className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-green-50 hover:text-green-600 transition-all shadow-sm"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}