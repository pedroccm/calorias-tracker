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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="nome" className="block text-lg font-medium text-gray-700 mb-3">
          Nome da Refeição *
        </label>
        <input
          type="text"
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Ex: Salada Caesar"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="tipo" className="block text-lg font-medium text-gray-700 mb-3">
          Tipo de Refeição
        </label>
        <select
          id="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
          <label htmlFor="data" className="block text-lg font-medium text-gray-700 mb-3">
            Data
          </label>
          <input
            type="date"
            id="data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="horario" className="block text-lg font-medium text-gray-700 mb-3">
            Horário
          </label>
          <input
            type="time"
            id="horario"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="calorias" className="block text-lg font-medium text-gray-700 mb-3">
          Calorias (opcional)
        </label>
        <input
          type="number"
          id="calorias"
          value={calorias}
          onChange={(e) => setCalorias(e.target.value)}
          className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="450"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="descricao" className="block text-lg font-medium text-gray-700 mb-3">
          Descrição (opcional)
        </label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={4}
          className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Detalhes sobre a refeição..."
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-4">
          Foto da Refeição (opcional)
        </label>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center bg-blue-50 border-2 border-blue-200 rounded-lg p-6 hover:bg-blue-100 transition-colors"
            disabled={loading}
          >
            <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-blue-700 font-medium text-center">Carregar da Galeria</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              input.capture = 'environment'
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement
                const file = target.files?.[0]
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error('Imagem muito grande. Máximo 5MB')
                    return
                  }
                  setImagem(file)
                  setPreviewUrl(URL.createObjectURL(file))
                }
              }
              input.click()
            }}
            className="flex flex-col items-center justify-center bg-green-50 border-2 border-green-200 rounded-lg p-6 hover:bg-green-100 transition-colors"
            disabled={loading}
          >
            <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-green-700 font-medium text-center">Tirar Foto</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          disabled={loading}
        />

        {previewUrl && (
          <div className="mt-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
            />
            <button
              type="button"
              onClick={() => {
                setImagem(null)
                setPreviewUrl('')
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              className="mt-3 w-full bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors"
            >
              Remover Foto
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-4 text-lg rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 mt-8"
      >
        {loading ? 'Salvando...' : 'Registrar Refeição'}
      </button>
    </form>
  )
}