'use client'

import { useState, useEffect } from 'react'
import { Container, Card, CardContent, Typography, Button, Box, Alert } from '@mui/material'

export default function TesteNotificacao() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
      addLog(`Permissão inicial: ${Notification.permission}`)
    } else {
      addLog('❌ Notificações não suportadas neste navegador')
    }

    if ('serviceWorker' in navigator) {
      addLog('✅ ServiceWorker suportado')
    } else {
      addLog('❌ ServiceWorker não suportado')
    }
  }, [])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      addLog('❌ Notificações não suportadas')
      return
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    addLog(`Permissão: ${result}`)

    if (result === 'granted') {
      addLog('✅ Permissão concedida!')
    } else {
      addLog('❌ Permissão negada')
    }
  }

  const testarNotificacaoSimples = () => {
    if (permission !== 'granted') {
      addLog('❌ Permissão necessária')
      return
    }

    try {
      const notification = new Notification('Teste Simples', {
        body: 'Notificação simples sem ServiceWorker',
        icon: '/icons/icon-192x192.png'
      })

      addLog('✅ Notificação simples enviada')

      notification.onclick = () => {
        addLog('👆 Notificação clicada')
        window.focus()
        notification.close()
      }

      setTimeout(() => notification.close(), 5000)
    } catch (error) {
      addLog(`❌ Erro na notificação simples: ${error}`)
    }
  }

  const testarServiceWorker = async () => {
    if (permission !== 'granted') {
      addLog('❌ Permissão necessária')
      return
    }

    if (!('serviceWorker' in navigator)) {
      addLog('❌ ServiceWorker não disponível')
      return
    }

    try {
      addLog('🔄 Registrando ServiceWorker...')
      const registration = await navigator.serviceWorker.ready
      addLog('✅ ServiceWorker pronto')

      const options: any = {
        body: 'Notificação via ServiceWorker',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'test-sw'
      }

      // Adicionar vibrate se suportado
      if ('vibrate' in navigator) {
        options.vibrate = [200, 100, 200]
      }

      await registration.showNotification('Teste ServiceWorker', options)

      addLog('✅ Notificação ServiceWorker enviada')
    } catch (error) {
      addLog(`❌ Erro no ServiceWorker: ${error}`)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Teste de Notificações - Debug
          </Typography>

          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={requestPermission}>
              Pedir Permissão
            </Button>
            <Button variant="contained" onClick={testarNotificacaoSimples}>
              Teste Simples
            </Button>
            <Button variant="contained" onClick={testarServiceWorker}>
              Teste ServiceWorker
            </Button>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            Permissão atual: <strong>{permission}</strong>
          </Alert>

          <Typography variant="h6" gutterBottom>
            Logs:
          </Typography>

          <Box
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              maxHeight: 400,
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          >
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}