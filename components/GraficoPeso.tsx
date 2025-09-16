'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { fakeAuth } from '@/lib/auth'
import { CtPeso } from '@/lib/database.types'

export default function GraficoPeso() {
  const [dados, setDados] = useState<CtPeso[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPesos()
  }, [])

  const fetchPesos = async () => {
    try {
      const user = fakeAuth.getUser()
      const { data, error } = await supabase
        .from('ct_peso')
        .select('*')
        .eq('user_id', user?.id || 1)
        .order('data', { ascending: true })
        .limit(30)

      if (error) throw error

      setDados(data || [])
    } catch (error) {
      console.error('Erro ao buscar pesos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (dados.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum registro de peso ainda</p>
        <p className="text-sm mt-2">Comece registrando seu peso acima</p>
      </div>
    )
  }

  const chartData = dados.map(item => ({
    data: format(parseISO(item.data), 'dd/MM', { locale: ptBR }),
    peso: item.peso,
    dataCompleta: format(parseISO(item.data), 'dd/MM/yyyy', { locale: ptBR })
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-gray-600">{payload[0].payload.dataCompleta}</p>
          <p className="text-lg font-semibold text-green-600">
            {payload[0].value} kg
          </p>
        </div>
      )
    }
    return null
  }

  const minPeso = Math.min(...dados.map(d => Number(d.peso)))
  const maxPeso = Math.max(...dados.map(d => Number(d.peso)))
  const yAxisDomain = [minPeso - 2, maxPeso + 2]

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Evolução do Peso (últimos 30 registros)
      </h3>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="data" 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              domain={yAxisDomain}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="peso"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {dados.length > 1 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">Último Peso</p>
            <p className="text-xl font-bold text-green-600">
              {dados[dados.length - 1].peso} kg
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">Variação Total</p>
            <p className="text-xl font-bold text-blue-600">
              {(Number(dados[dados.length - 1].peso) - Number(dados[0].peso)).toFixed(1)} kg
            </p>
          </div>
        </div>
      )}
    </div>
  )
}