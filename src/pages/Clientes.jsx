import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Edit, Plus } from 'lucide-react';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState(''); // CPF ou CNPJ
  const { isAdmin } = useAuth(); // Aqui pegamos a permissão do banco!

  // Buscar clientes ao carregar a página
  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    const { data } = await supabase.from('clientes').select('*').order('nome');
    setClientes(data || []);
  }

  async function handleAddCliente(e) {
    e.preventDefault();
    const { error } = await supabase
      .from('clientes')
      .insert([{ nome, cpf_cnpj: documento }]);
    
    if (error) alert(error.message);
    else {
      setNome(''); setDocumento('');
      fetchClientes();
    }
  }

  async function handleDelete(id) {
    if (!confirm("Tem certeza?")) return;
    
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    
    if (error) alert("Erro: Você provavelmente não tem permissão para excluir.");
    else fetchClientes();
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Clientes</h1>

      {/* Formulário de Cadastro */}
      <form onSubmit={handleAddCliente} className="mb-8 flex gap-4 bg-white p-4 rounded-lg shadow">
        <input 
          placeholder="Nome do Cliente" 
          value={nome} 
          onChange={e => setNome(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <input 
          placeholder="CPF/CNPJ" 
          value={documento} 
          onChange={e => setDocumento(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus size={18} /> Adicionar
        </button>
      </form>

      {/* Tabela de Resultados */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Documento</th>
              <th className="p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{c.nome}</td>
                <td className="p-4">{c.cpf_cnpj}</td>
                <td className="p-4 flex gap-3">
                  {/* Lógica de Permissão na Interface */}
                  {isAdmin ? (
                    <>
                      <button className="text-blue-600 hover:text-blue-800"><Edit size={18}/></button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs italic">Apenas leitura</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}