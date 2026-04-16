import { useEffect, useState } from "react";
// Corrigindo o import que estava falhando no seu print
import { supabase } from "../lib/supabaseClient"; 

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    preco: "",
    estoque: "",
  });

  useEffect(() => {
    fetchProdutos();
  }, []);

  async function fetchProdutos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("nome");
      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error("Erro:", error.message);
    } finally {
      setLoading(false);
    }
  }

  function prepararEdicao(p) {
    setEditandoId(p.id);
    setNovoProduto({
      nome: p.nome,
      preco: p.preco,
      estoque: p.estoque,
    });
    setMostrarForm(true);
  }

  async function handleSalvar(e) {
    e.preventDefault();
    try {
      if (editandoId) {
        // UPDATE: Altera preço e estoque no banco
        const { error } = await supabase
          .from("produtos")
          .update({
            nome: novoProduto.nome,
            preco: parseFloat(novoProduto.preco),
            estoque: parseInt(novoProduto.estoque),
          })
          .eq("id", editandoId);
        if (error) throw error;
        alert("Produto atualizado!");
      } else {
        // INSERT: Novo produto
        const { error } = await supabase.from("produtos").insert([
          {
            ...novoProduto,
            preco: parseFloat(novoProduto.preco),
            estoque: parseInt(novoProduto.estoque),
            ativo: true,
          },
        ]);
        if (error) throw error;
        alert("Produto cadastrado!");
      }
      fecharFormulario();
      fetchProdutos();
    } catch (error) {
      alert("Erro na operação: " + error.message);
    }
  }

  function fecharFormulario() {
    setMostrarForm(false);
    setEditandoId(null);
    setNovoProduto({ nome: "", preco: "", estoque: "" });
  }

  if (loading) return <div className="p-8 text-center font-bold">Carregando Produtos...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 font-sans">📦 Gestão de Produtos</h1>
        <button 
          onClick={() => mostrarForm ? fecharFormulario() : setMostrarForm(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold shadow-md"
        >
          {mostrarForm ? "Cancelar" : "+ Novo Produto"}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleSalvar} className="mb-8 p-6 border rounded-2xl bg-white shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            placeholder="Nome do Produto" 
            className="border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
            value={novoProduto.nome}
            onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})}
            required
          />
          <input 
            type="number" step="0.01" placeholder="Preço (R$)" 
            className="border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
            value={novoProduto.preco}
            onChange={e => setNovoProduto({...novoProduto, preco: e.target.value})}
            required
          />
          <input 
            type="number" placeholder="Estoque Inicial" 
            className="border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
            value={novoProduto.estoque}
            onChange={e => setNovoProduto({...novoProduto, estoque: e.target.value})}
            required
          />
          <button type="submit" className="bg-green-600 text-white p-3 rounded-xl col-span-full font-black">
            {editandoId ? "CONFIRMAR ALTERAÇÃO DE PREÇO/ESTOQUE" : "CADASTRAR PRODUTO"}
          </button>
        </form>
      )}

      {/* Grid de Cards de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {produtos.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-1">{p.nome}</h3>
            <p className="text-sm text-gray-500 mb-4 font-medium">Estoque: <span className="text-blue-600">{p.estoque}</span></p>
            <div className="flex justify-between items-end">
              <span className="text-xl font-black text-green-600">R$ {p.preco.toFixed(2)}</span>
              <button 
                onClick={() => prepararEdicao(p)}
                className="text-blue-500 hover:underline font-bold text-sm"
              >
                ✏️ Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}