'use client'

import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { fakeAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function FormRefeicao() {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [calorias, setCalorias] = useState('')
  const [tipo, setTipo] = useState<string>('almoco')
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [horario, setHorario] = useState(format(new Date(), 'HH:mm'))
  const [imagem, setImagem] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem muito grande. Máximo 5MB')
        return
      }
      setImagem(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `refeicoes/${fileName}`

    const { error, data } = await supabase.storage
      .from('comida')
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('comida')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nome) {
      toast.error('Por favor, insira o nome da refeição')
      return
    }

    setLoading(true)
    
    try {
      let imagemUrl = null
      
      if (imagem) {
        imagemUrl = await uploadImage(imagem)
      }

      const user = fakeAuth.getUser()
      const { error } = await supabase
        .from('ct_refeicoes')
        .insert([{
          nome,
          descricao,
          calorias: calorias ? parseInt(calorias) : null,
          tipo,
          data,
          horario,
          imagem_url: imagemUrl,
          user_id: user?.id || 1
        }])

      if (error) throw error

      toast.success('Refeição registrada com sucesso!')
      
      // Limpar formulário
      setNome('')
      setDescricao('')
      setCalorias('')
      setImagem(null)
      setPreviewUrl('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao registrar refeição')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
          Nome da Refeição *
        </label>
        <input
          type="text"
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Ex: Salada Caesar"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Refeição
        </label>
        <select
          id="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          disabled={loading}
        >
          <option value="cafe_da_manha">☕ Café da Manhã</option>
          <option value="almoco">🍽️ Almoço</option>
          <option value="lanche">🥤 Lanche</option>
          <option value="jantar">🍴 Jantar</option>
          <option value="outro">🍎 Outro</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-2">
            Data
          </label>
          <input
            type="date"
            id="data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="horario" className="block text-sm font-medium text-gray-700 mb-2">
            Horário
          </label>
          <input
            type="time"
            id="horario"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="calorias" className="block text-sm font-medium text-gray-700 mb-2">
          Calorias (opcional)
        </label>
        <input
          type="number"
          id="calorias"
          value={calorias}
          onChange={(e) => setCalorias(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="450"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
          Descrição (opcional)
        </label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Detalhes sobre a refeição..."
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Foto da Refeição (opcional)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          disabled={loading}
        />
        {previewUrl && (
          <div className="mt-3">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
      >
        {loading ? 'Salvando...' : 'Registrar Refeição'}
      </button>
    </form>
  )
}