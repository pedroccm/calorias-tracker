'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { fakeAuth } from '@/lib/auth'
import toast from 'react-hot-toast'
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material'
import { Login } from '@mui/icons-material'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simular delay de autenticação
    setTimeout(() => {
      const result = fakeAuth.login(username, password)
      
      if (result.success) {
        toast.success(`Bem-vindo, ${result.user?.nome}!`)
        router.push('/')
      } else {
        toast.error(result.error || 'Erro ao fazer login')
      }
      setLoading(false)
    }, 500)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={4}>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Meu Tracker
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Faça login para continuar
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
              <TextField
                fullWidth
                required
                label="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="Digite seu usuário"
                disabled={loading}
                size="small"
              />

              <TextField
                fullWidth
                required
                type="password"
                label="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                disabled={loading}
                size="small"
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                fullWidth
                startIcon={<Login />}
                sx={{ py: 2, mt: 2 }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Dados de acesso:
              </Typography>
              <Typography variant="body2">
                Usuário: <Box component="code" sx={{ bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>pedroccm</Box><br />
                Senha: <Box component="code" sx={{ bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>q1w2e3r4t5</Box>
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}