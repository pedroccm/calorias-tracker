'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import { fakeAuth } from '@/lib/auth'
import FormPeso from '@/components/FormPeso'
import FormRefeicao from '@/components/FormRefeicao'
import ListaRefeicoes from '@/components/ListaRefeicoes'
import GraficoPeso from '@/components/GraficoPeso'
import TabNavigation from '@/components/TabNavigation'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  AppBar,
  Toolbar
} from '@mui/material'
import { Logout, Notifications } from '@mui/icons-material'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'peso' | 'refeicao' | 'historico'>('peso')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = fakeAuth.getUser()
    if (!currentUser) {
      router.push('/login')
    } else {
      setUser(currentUser)
    }
  }, [])

  const handleLogout = () => {
    fakeAuth.logout()
    router.push('/login')
  }

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress size={48} />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Toaster position="top-center" />

      <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h1" fontWeight="bold">
              Meu Tracker
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Olá, {user.nome}!
            </Typography>
          </Box>
          <IconButton
            onClick={() => router.push('/notificacoes')}
            color="inherit"
            title="Notificações"
          >
            <Notifications />
          </IconButton>
          <IconButton
            onClick={handleLogout}
            color="inherit"
            title="Sair"
          >
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <Card sx={{ mt: 3 }} elevation={2}>
          <CardContent>
            {activeTab === 'peso' && (
              <Box sx={{ gap: 4, display: 'flex', flexDirection: 'column' }}>
                <FormPeso />
                <GraficoPeso />
              </Box>
            )}

            {activeTab === 'refeicao' && <FormRefeicao />}

            {activeTab === 'historico' && <ListaRefeicoes />}
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}