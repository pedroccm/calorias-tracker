'use client'

import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { fakeAuth } from '@/lib/auth'
import toast from 'react-hot-toast'
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton
} from '@mui/material'
import {
  PhotoCamera,
  PhotoLibrary,
  Delete,
  RestaurantMenu
} from '@mui/icons-material'

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

  const triggerCamera = () => {
    const input = document.createElement('input') as HTMLInputElement & { capture?: string }
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.style.display = 'none'

    document.body.appendChild(input)

    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Imagem muito grande. Máximo 5MB')
          document.body.removeChild(input)
          return
        }
        setImagem(file)
        setPreviewUrl(URL.createObjectURL(file))
      }
      document.body.removeChild(input)
    }

    input.oncancel = () => {
      document.body.removeChild(input)
    }

    input.click()
  }

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `refeicoes/${fileName}`

    const { error, data } = await supabase.storage
      .from('comidas')
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('comidas')
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
    <Box component="form" onSubmit={handleSubmit} sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <TextField
        fullWidth
        required
        label="Nome da Refeição"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Ex: Salada Caesar"
        disabled={loading}
        size="small"
        InputProps={{
          startAdornment: <RestaurantMenu sx={{ mr: 1, color: 'action.active' }} />
        }}
      />

      <FormControl fullWidth size="small">
        <InputLabel>Tipo de Refeição</InputLabel>
        <Select
          value={tipo}
          label="Tipo de Refeição"
          onChange={(e) => setTipo(e.target.value)}
          disabled={loading}
        >
          <MenuItem value="cafe_da_manha">☕ Café da Manhã</MenuItem>
          <MenuItem value="almoco">🍽️ Almoço</MenuItem>
          <MenuItem value="lanche">🥤 Lanche</MenuItem>
          <MenuItem value="jantar">🍴 Jantar</MenuItem>
          <MenuItem value="outro">🍎 Outro</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2 }}>
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
        <TextField
          fullWidth
          type="time"
          label="Horário"
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          disabled={loading}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <TextField
        fullWidth
        type="number"
        label="Calorias (opcional)"
        value={calorias}
        onChange={(e) => setCalorias(e.target.value)}
        placeholder="450"
        disabled={loading}
        size="small"
      />

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Descrição (opcional)"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Detalhes sobre a refeição..."
        disabled={loading}
        size="small"
      />

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Foto da Refeição (opcional)
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            startIcon={<PhotoLibrary />}
            sx={{ py: 2, flexDirection: 'column', gap: 1 }}
          >
            <Typography variant="body2">Carregar da Galeria</Typography>
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={triggerCamera}
            disabled={loading}
            startIcon={<PhotoCamera />}
            sx={{ py: 2, flexDirection: 'column', gap: 1 }}
          >
            <Typography variant="body2">Tirar Foto</Typography>
          </Button>
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
          disabled={loading}
        />

        {previewUrl && (
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 1,
                  mb: 2
                }}
              />
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => {
                  setImagem(null)
                  setPreviewUrl('')
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
              >
                Remover Foto
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={loading}
        fullWidth
        sx={{ py: 2, mt: 2 }}
      >
        {loading ? 'Salvando...' : 'Registrar Refeição'}
      </Button>
    </Box>
  )
}