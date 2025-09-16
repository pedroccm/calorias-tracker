'use client'

import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { fakeAuth } from '@/lib/auth'
import { CtRefeicao } from '@/lib/database.types'
import toast from 'react-hot-toast'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  AlertTitle
} from '@mui/material'
import { Delete } from '@mui/icons-material'

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
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="text.primary">
          Histórico de Refeições
        </Typography>
        <TextField
          type="date"
          size="small"
          value={dataFiltro}
          onChange={(e) => setDataFiltro(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 'auto' }}
        />
      </Box>

      {totalCalorias > 0 && (
        <Alert severity="success" sx={{ bgcolor: 'success.light' }}>
          <AlertTitle>Total de Calorias do Dia</AlertTitle>
          <Typography variant="h5" fontWeight="bold" color="success.dark">
            {totalCalorias} kcal
          </Typography>
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : refeicoes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Nenhuma refeição registrada nesta data
          </Typography>
        </Box>
      ) : (
        <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
          {refeicoes.map((refeicao) => (
            <Card key={refeicao.id} elevation={1}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip label={refeicao.horario} size="small" variant="outlined" />
                      <Chip
                        label={getTipoLabel(refeicao.tipo || 'outro')}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {refeicao.nome}
                    </Typography>
                    {refeicao.descricao && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {refeicao.descricao}
                      </Typography>
                    )}
                    {refeicao.calorias && (
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        {refeicao.calorias} kcal
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    onClick={() => handleDelete(refeicao.id!)}
                    color="error"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </Box>

                {refeicao.imagem_url && (
                  <Box sx={{ mt: 2 }}>
                    <Box
                      component="img"
                      src={refeicao.imagem_url}
                      alt={refeicao.nome}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}