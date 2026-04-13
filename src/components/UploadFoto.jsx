import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';

export default function UploadFoto({ onUploadComplete, fotoAtual }) {
  const [carregando, setCarregando] = useState(false);
  const [preview, setPreview] = useState(fotoAtual);

  async function handleFileChange(event) {
    try {
      setCarregando(true);
      const file = event.target.files[0];
      if (!file) return;

      // 1. Gerar um nome único para o arquivo (ex: timestamp_nome.jpg)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Fazer o Upload para o bucket 'fotos-produtos'
      const { error: uploadError } = await supabase.storage
        .from('fotos-produtos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Pegar a URL pública do arquivo que acabamos de subir
      const { data } = supabase.storage
        .from('fotos-produtos')
        .getPublicUrl(filePath);

      // 4. Atualizar o preview local e avisar o componente pai (Produtos.jsx)
      setPreview(data.publicUrl);
      onUploadComplete(data.publicUrl); // Passa a URL para o formulário de cadastro

    } catch (error) {
      alert('Erro no upload: ' + error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:border-blue-300 transition-colors cursor-pointer group relative">
      
      {/* Área de Visualização/Preview */}
      {preview ? (
        <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg shadow-md" />
      ) : (
        <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
           <ImageIcon size={48} strokeWidth={1}/>
        </div>
      )}

      {/* Botão/Overlay de Upload */}
      <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white p-2 text-center">
        {carregando ? (
          <>
            <Loader2 className="animate-spin" size={24} />
            <span className="text-xs">Enviando...</span>
          </>
        ) : (
          <>
            <UploadCloud size={24} />
            <span className="text-xs font-medium">{preview ? 'Alterar Foto' : 'Adicionar Foto'}</span>
          </>
        )}
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          disabled={carregando}
          className="sr-only" // Esconde o input padrão feio do navegador
        />
      </label>
      
      {!preview && !carregando && (
         <span className="text-xs text-gray-400 font-medium">Clique para subir imagem</span>
      )}
    </div>
  );
}