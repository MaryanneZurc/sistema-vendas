import { useEffect, useState } from 'react';
import { supabase } from "../lib/supabaseClient";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  
  // Novo estado para controlar se estamos editando
  const [editandoId, setEditandoId] = useState(null);

  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    email: '',
    cpf_cnpj: '',
    telefone: ''
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error.message);
    } finally {
      setLoading(false);
    }
  }

  // Função para abrir o formulário já preenchido com os dados do cliente
  function prepararEdicao(cliente) {
    setEditandoId(cliente.id);
    setNovoCliente({
      nome: cliente.nome,
      email: cliente.email || '',
      cpf_cnpj: cliente.cpf_cnpj || '',
      telefone: cliente.telefone || ''
    });
    setMostrarForm(true);
  }

  async function handleSalvar(e) {
    e.preventDefault();
    try {
      if (editandoId) {
        // Lógica de EDIÇÃO (UPDATE)
        const { error } = await supabase
          .from('clientes')
          .update({ 
            nome: novoCliente.nome, 
            email: novoCliente.email, 
            cpf_cnpj: novoCliente.cpf_cnpj, 
            telefone: novoCliente.telefone 
          })
          .eq('id', editandoId);

        if (error) throw error;
        alert("Cliente atualizado com sucesso!");
      } else {
        // Lógica de NOVO CADASTRO (INSERT)
        const { error } = await supabase.from('clientes').insert([
          { ...novoCliente, ativo: true }
        ]);

        if (error) throw error;
        alert("Cliente cadastrado com sucesso!");
      }

      // Reseta o formulário e fecha
      fecharFormulario();
      fetchClientes();
    } catch (error) {
      alert("Erro na operação: " + error.message);
    }
  }

  function fecharFormulario() {
    setMostrarForm(false);
    setEditandoId(null);
    setNovoCliente({ nome: '', email: '', cpf_cnpj: '', telefone: '' });
  }

  async function handleDesativar(id, nome) {
    if (window.confirm(`Deseja inativar "${nome}"?`)) {
      const { error } = await supabase.from('clientes').update({ ativo: false }).eq('id', id);
      if (error) alert(error.message);
      else await fetchClientes();
    }
  }

  if (loading) return <div className="p-8 text-center font-bold text-blue-600">Carregando...</div>;

  return (
    <div className="p-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">👥 Gestão de Clientes</h1>
        <button 
          onClick={() => mostrarForm ? fecharFormulario() : setMostrarForm(true)} 
          className={`${mostrarForm ? 'bg-gray-500' : 'bg-blue-600'} text-white px-5 py-2 rounded-lg font-bold shadow-md transition-all`}
        >
          {mostrarForm ? "Cancelar" : "+ Novo Cliente"}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleSalvar} className="mb-8 p-6 border rounded-2xl bg-white shadow-lg grid grid-cols-1 md:grid-cols-2 gap-4 border-blue-50">
          <h2 className="col-span-full text-blue-600 font-bold uppercase text-sm mb-2">
            {editandoId ? "✏️ Editando Cliente" : "✨ Novo Cadastro"}
          </h2>
          <input 
            placeholder="Nome Completo" 
            className="border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-400" 
            value={novoCliente.nome} 
            onChange={e => setNovoCliente({...novoCliente, nome: e.target.value})} 
            required 
          />
          <input 
            placeholder="E-mail" 
            className="border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-400" 
            value={novoCliente.email} 
            onChange={e => setNovoCliente({...novoCliente, email: e.target.value})} 
          />
          <input 
            placeholder="CPF / CNPJ" 
            className="border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-400" 
            value={novoCliente.cpf_cnpj} 
            onChange={e => setNovoCliente({...novoCliente, cpf_cnpj: e.target.value})} 
          />
          <input 
            placeholder="Telefone" 
            className="border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-400" 
            value={novoCliente.telefone} 
            onChange={e => setNovoCliente({...novoCliente, telefone: e.target.value})} 
          />
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl col-span-full font-black shadow-sm">
            {editandoId ? "SALVAR ALTERAÇÕES" : "CADASTRAR CLIENTE"}
          </button>
        </form>
      )}

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="p-4 border-b">Nome</th>
              <th className="p-4 border-b">Documento</th>
              <th className="p-4 border-b">Contato</th>
              <th className="p-4 border-b text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => {
              const isInativo = c.ativo === false;
              return (
                <tr key={c.id} className={`border-b ${isInativo ? 'bg-gray-50 opacity-40 grayscale' : 'hover:bg-blue-50/30'}`}>
                  <td className={`p-4 font-bold ${isInativo ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {c.nome}
                  </td>
                  <td className="p-4 text-gray-500 font-medium">{c.cpf_cnpj || "---"}</td>
                  <td className="p-4 text-gray-500 text-sm">{c.telefone || "---"}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-4">
                      {!isInativo ? (
                        <>
                          <button onClick={() => prepararEdicao(c)} className="text-blue-600 hover:text-blue-800 font-bold text-sm">✏️ Editar</button>
                          <button onClick={() => handleDesativar(c.id, c.nome)} className="text-red-500 hover:text-red-700 font-bold text-sm">🚫 Inativar</button>
                        </>
                      ) : (
                        <span className="text-xs font-black text-gray-300 italic">INATIVO</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}