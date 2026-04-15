import { useEffect, useState } from 'react';
import { supabase } from "../lib/supabaseClient";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProdutos();
  }, []);

  async function fetchProdutos() {
    setLoading(true);
    const { data } = await supabase.from('produtos').select('*').order('nome');
    setProdutos(data || []);
    setLoading(false);
  }

  async function handleDesativar(id, nome) {
    if (window.confirm(`Desativar ${nome}?`)) {
      await supabase.from('produtos').update({ ativo: false }).eq('id', id);
      fetchProdutos();
    }
  }

  if (loading) return <p className="p-8 text-center">Carregando...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestão de Produtos</h1>
        {/* BOTÃO DE CADASTRO QUE TINHA SUMIDO */}
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700">
          + Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {produtos.map((p) => {
          const isInativo = p.ativo === false;
          // LÓGICA DE ESTOQUE BAIXO (Cor de alerta)
          const estoqueBaixo = p.estoque <= 5;

          return (
            <div key={p.id} className={`border rounded-xl p-4 shadow-sm ${isInativo ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
              {/* ESPAÇO PARA FOTO */}
              <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {p.imagem_url ? (
                  <img src={p.imagem_url} alt={p.nome} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-gray-400 text-xs">Sem Foto</span>
                )}
              </div>

              <h3 className="font-bold text-lg">{p.nome}</h3>
              
              {/* STATUS DE ESTOQUE COM MUDANÇA DE COR */}
              <p className={`text-sm font-bold ${estoqueBaixo && !isInativo ? 'text-orange-500' : 'text-gray-500'}`}>
                Estoque: {p.estoque} {estoqueBaixo && !isInativo && "(Baixo!)"}
              </p>

              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-black text-blue-600">R$ {p.preco?.toFixed(2)}</span>
                
                {isInativo ? (
                  <span className="text-gray-400 italic">Fora de linha</span>
                ) : (
                  <button 
                    onClick={() => handleDesativar(p.id, p.nome)}
                    className="text-red-500 hover:underline text-sm font-bold"
                  >
                    Desativar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}