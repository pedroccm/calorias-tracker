'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { fakeAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function FormPeso() {
  const [peso, setPeso] = useState('')
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!peso) {
      toast.error('Por favor, insira o peso')
      return
    }

    setLoading(true)
    
    try {
      const user = fakeAuth.getUser()
      const { error } = await supabase
        .from('ct_peso')
        .insert([{ 
          peso: parseFloat(peso), 
          data,
          user_id: user?.id || 1
        }])

      if (error) throw error

      toast.success('Peso registrado com sucesso!')
      setPeso('')
      
      // Recarregar a página para atualizar o gráfico
      window.location.reload()
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao registrar peso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="peso" className="block text-sm font-medium text-gray-700 mb-2">
          Peso (kg)
        </label>
        <input
          type="number"
          id="peso"
          step="0.1"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
          placeholder="75.5"
          disabled={loading}
        />
      </div>

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

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
      >
        {loading ? 'Salvando...' : 'Registrar Peso'}
      </button>
    </form>
  )
}