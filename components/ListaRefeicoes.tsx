'use client'

import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { fakeAuth } from '@/lib/auth'
import { CtRefeicao } from '@/lib/database.types'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function ListaRefeicoes() {
  const [refeicoes, setRefeicoes] = useState<CtRefeicao[]>([])
  const [loading, setLoading] = useState(true)
  const [dataFiltro, setDataFiltro] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    fetchRefeicoes()
  }, [dataFiltro])

  const fetchRefeicoes = async () => {
    setLoading(true)
    try {
      const user = fakeAuth.getUser()
      const { data, error } = await supabase
        .from('ct_refeicoes')
        .select('*')
        .eq('user_id', user?.id || 1)
        .eq('data', dataFiltro)
        .order('horario', { ascending: true })

      if (error) throw error

      setRefeicoes(data || [])
    } catch (error) {
      console.error('Erro ao buscar refeições:', error)
      toast.error('Erro ao carregar refeições')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir esta refeição?')) return

    try {
      const { error } = await supabase
        .from('ct_refeicoes')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Refeição excluída')
      fetchRefeicoes()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir refeição')
    }
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      cafe_da_manha: '☕ Café da Manhã',
      almoco: '🍽️ Almoço',
      lanche: '🥤 Lanche',
      jantar: '🍴 Jantar',
      outro: '🍎 Outro'
    }
    return labels[tipo] || tipo
  }

  const totalCalorias = refeicoes.reduce((sum, r) => sum + (r.calorias || 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Histórico de Refeições
        </h3>
        <input
          type="date"
          value={dataFiltro}
          onChange={(e) => setDataFiltro(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
        />
      </div>

      {totalCalorias > 0 && (
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total de Calorias do Dia</p>
          <p className="text-2xl font-bold text-green-600">{totalCalorias} kcal</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : refeicoes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma refeição registrada nesta data</p>
        </div>
      ) : (
        <div className="space-y-3">
          {refeicoes.map((refeicao) => (
            <div key={refeicao.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {refeicao.horario}
                    </span>
                    <span className="text-xs text-gray-600">
                      {getTipoLabel(refeicao.tipo || 'outro')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-800">{refeicao.nome}</h4>
                  {refeicao.descricao && (
                    <p className="text-sm text-gray-600 mt-1">{refeicao.descricao}</p>
                  )}
                  {refeicao.calorias && (
                    <p className="text-sm font-medium text-green-600 mt-2">
                      {refeicao.calorias} kcal
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(refeicao.id!)}
                  className="text-red-500 hover:text-red-700 ml-4"
                  title="Excluir"
                >
                  🗑️
                </button>
              </div>
              
              {refeicao.imagem_url && (
                <div className="mt-3">
                  <img
                    src={refeicao.imagem_url}
                    alt={refeicao.nome}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}