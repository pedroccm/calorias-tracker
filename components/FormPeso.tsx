'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { fakeAuth } from '@/lib/auth'
import toast from 'react-hot-toast'
import {
  TextField,
  Button,
  Box,
  InputAdornment
} from '@mui/material'
import { Scale } from '@mui/icons-material'

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
    <Box component="form" onSubmit={handleSubmit} sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <TextField
        fullWidth
        required
        type="number"
        inputProps={{ step: 0.1 }}
        label="Peso"
        value={peso}
        onChange={(e) => setPeso(e.target.value)}
        placeholder="75.5"
        disabled={loading}
        size="small"
        InputProps={{
          startAdornment: <Scale sx={{ mr: 1, color: 'action.active' }} />,
          endAdornment: <InputAdornment position="end">kg</InputAdornment>
        }}
      />

      <TextField
        fullWidth
        type="date"
        label="Data"
        value={data}
        onChange={(e) => setData(e.target.value)}
        disabled={loading}
        size="small"
        InputLabelProps={{ shrink: true }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={loading}
        fullWidth
        sx={{ py: 2, mt: 2 }}
      >
        {loading ? 'Salvando...' : 'Registrar Peso'}
      </Button>
    </Box>
  )
}