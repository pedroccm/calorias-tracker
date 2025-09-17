'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fakeAuth } from '@/lib/auth'
import toast from 'react-hot-toast'
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert
} from '@mui/material'
import {
  ArrowBack,
  Add,
  Delete,
  Notifications,
  NotificationsOff,
  AccessTime
} from '@mui/icons-material'

interface NotificationTime {
  id: string
  time: string
  enabled: boolean
  message: string
}

export default function NotificacoesPage() {
  const [user, setUser] = useState<any>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [times, setTimes] = useState<NotificationTime[]>([])
  const [newTime, setNewTime] = useState('')
  const [newMessage, setNewMessage] = useState('Não esqueça de registrar sua refeição! 📸🍽️')
  const router = useRouter()

  useEffect(() => {
    const userData = fakeAuth.getUser()
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(userData)

    // Verificar permissão atual
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // Carregar configurações salvas
    loadSavedSettings()
  }, [router])

  const loadSavedSettings = () => {
    try {
      const saved = localStorage.getItem('notification-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        setTimes(settings.times || [])
        setNotificationsEnabled(settings.enabled || false)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const saveSettings = (newTimes: NotificationTime[], enabled: boolean) => {
    try {
      const settings = {
        times: newTimes,
        enabled: enabled
      }
      localStorage.setItem('notification-settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
    }
  }

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Seu navegador não suporta notificações')
      return false
    }

    if (permission === 'granted') {
      return true
    }

    const result = await Notification.requestPermission()
    setPermission(result)

    if (result === 'granted') {
      toast.success('Permissão concedida! Notificações ativadas 🔔')
      return true
    } else {
      toast.error('Permissão negada. Ative nas configurações do navegador')
      return false
    }
  }

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const hasPermission = await requestNotificationPermission()
      if (!hasPermission) return
    }

    const newEnabled = !notificationsEnabled
    setNotificationsEnabled(newEnabled)
    saveSettings(times, newEnabled)

    if (newEnabled) {
      scheduleAllNotifications()
      toast.success('Notificações ativadas! 🔔')
    } else {
      cancelAllNotifications()
      toast.success('Notificações desativadas 🔕')
    }
  }

  const addNotificationTime = () => {
    if (!newTime) {
      toast.error('Escolha um horário')
      return
    }

    if (times.some(t => t.time === newTime)) {
      toast.error('Esse horário já foi adicionado')
      return
    }

    const newNotification: NotificationTime = {
      id: Date.now().toString(),
      time: newTime,
      enabled: true,
      message: newMessage || 'Não esqueça de registrar sua refeição! 📸🍽️'
    }

    const newTimes = [...times, newNotification]
    setTimes(newTimes)
    saveSettings(newTimes, notificationsEnabled)

    setNewTime('')
    setNewMessage('Não esqueça de registrar sua refeição! 📸🍽️')

    if (notificationsEnabled) {
      scheduleNotification(newNotification)
    }

    toast.success('Horário adicionado! ⏰')
  }

  const removeNotificationTime = (id: string) => {
    const newTimes = times.filter(t => t.id !== id)
    setTimes(newTimes)
    saveSettings(newTimes, notificationsEnabled)
    toast.success('Horário removido')
  }

  const toggleTimeEnabled = (id: string) => {
    const newTimes = times.map(t =>
      t.id === id ? { ...t, enabled: !t.enabled } : t
    )
    setTimes(newTimes)
    saveSettings(newTimes, notificationsEnabled)
  }

  const scheduleNotification = (notifTime: NotificationTime) => {
    if (!notifTime.enabled || permission !== 'granted') return

    const [hours, minutes] = notifTime.time.split(':').map(Number)
    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(hours, minutes, 0, 0)

    // Se o horário já passou hoje, agendar para amanhã
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime()

    console.log(`⏰ Agendado para ${scheduledTime.toLocaleString()}, em ${Math.round(timeUntilNotification/1000/60)} minutos`)

    setTimeout(() => {
      if ('serviceWorker' in navigator && 'Notification' in window) {
        console.log('🔔 Disparando notificação:', notifTime.message)

        navigator.serviceWorker.ready.then(registration => {
          const options: any = {
            body: notifTime.message,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: `meal-reminder-${notifTime.id}`,
            requireInteraction: true,
            timestamp: Date.now(),
            data: {
              url: '/refeicoes/adicionar'
            }
          }

          // Adicionar vibrate se suportado (Android)
          if ('vibrate' in navigator) {
            options.vibrate = [200, 100, 200]
          }

          // Adicionar actions se suportado
          if ('actions' in Notification.prototype) {
            options.actions = [
              {
                action: 'open',
                title: 'Registrar Refeição'
              },
              {
                action: 'dismiss',
                title: 'Dispensar'
              }
            ]
          }

          registration.showNotification('🍎 Calorias Tracker', options)
            .then(() => console.log('✅ Notificação enviada!'))
            .catch(error => console.error('❌ Erro na notificação:', error))
        }).catch(error => {
          console.error('❌ Erro no ServiceWorker:', error)
        })
      }

      // Reagendar para o próximo dia
      scheduleNotification(notifTime)
    }, timeUntilNotification)
  }

  const scheduleAllNotifications = () => {
    times.forEach(time => {
      if (time.enabled) {
        scheduleNotification(time)
      }
    })
  }

  const cancelAllNotifications = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.getNotifications().then(notifications => {
          notifications.forEach(notification => notification.close())
        })
      })
    }
  }

  const testNotification = () => {
    console.log('🔔 Testando notificação...')
    console.log('📱 Permissão:', permission)
    console.log('🔧 ServiceWorker disponível:', 'serviceWorker' in navigator)

    if (permission !== 'granted') {
      toast.error('Permissão de notificação necessária')
      console.error('❌ Permissão negada!')
      return
    }

    if ('serviceWorker' in navigator) {
      console.log('🚀 Enviando notificação via ServiceWorker...')
      navigator.serviceWorker.ready.then(registration => {
        console.log('✅ ServiceWorker pronto:', registration)

        const notificationOptions: any = {
          body: 'Esta é uma notificação de teste! 🍎',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'test-notification',
          requireInteraction: true
        }

        // Adicionar vibrate se suportado (Android)
        if ('vibrate' in navigator) {
          notificationOptions.vibrate = [200, 100, 200]
        }

        registration.showNotification('Teste - Calorias Tracker', notificationOptions).then(() => {
          console.log('✅ Notificação enviada com sucesso!')
        }).catch(error => {
          console.error('❌ Erro ao enviar notificação:', error)
        })
      }).catch(error => {
        console.error('❌ Erro no ServiceWorker:', error)
      })
    } else {
      console.error('❌ ServiceWorker não disponível')
    }

    toast.success('Notificação de teste enviada! Verifique o console.')
  }

  if (!user) return null

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/')}
          sx={{ mb: 2 }}
        >
          Voltar
        </Button>

        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Notificações
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure lembretes para registrar suas refeições
        </Typography>
      </Box>

      {/* Status das notificações */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {notificationsEnabled ? <Notifications color="primary" /> : <NotificationsOff />}
              <Typography variant="h6">
                Status das Notificações
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationsEnabled}
                  onChange={toggleNotifications}
                />
              }
              label={notificationsEnabled ? 'Ativadas' : 'Desativadas'}
            />
          </Box>

          {permission !== 'granted' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Permissão de notificação necessária. Clique no botão acima para ativar.
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`Permissão: ${permission === 'granted' ? 'Concedida' : 'Pendente'}`}
              color={permission === 'granted' ? 'success' : 'default'}
              size="small"
            />
            <Chip
              label={`${times.filter(t => t.enabled).length} horários ativos`}
              color="primary"
              size="small"
            />
          </Box>

          {permission === 'granted' && (
            <Button
              variant="outlined"
              size="small"
              onClick={testNotification}
              sx={{ mt: 2 }}
            >
              Testar Notificação
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Adicionar novo horário */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Adicionar Novo Horário
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              type="time"
              label="Horário"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Mensagem da notificação"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Não esqueça de registrar sua refeição! 📸🍽️"
              fullWidth
              multiline
              rows={2}
            />

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={addNotificationTime}
              disabled={!newTime}
            >
              Adicionar Horário
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Lista de horários */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Horários Configurados ({times.length})
          </Typography>

          {times.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AccessTime sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                Nenhum horário configurado ainda
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Adicione horários para receber lembretes
              </Typography>
            </Box>
          ) : (
            <List>
              {times.map((time) => (
                <ListItem key={time.id} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">
                          {time.time}
                        </Typography>
                        <Chip
                          label={time.enabled ? 'Ativo' : 'Inativo'}
                          size="small"
                          color={time.enabled ? 'success' : 'default'}
                        />
                      </Box>
                    }
                    secondary={time.message}
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Switch
                        checked={time.enabled}
                        onChange={() => toggleTimeEnabled(time.id)}
                        size="small"
                      />
                      <IconButton
                        edge="end"
                        onClick={() => removeNotificationTime(time.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}