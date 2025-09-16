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
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Toaster position="top-center" />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <header className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Meu Tracker
              </h1>
              <p className="text-gray-600">
                Olá, {user.nome}!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Sair"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
          {activeTab === 'peso' && (
            <div className="space-y-6">
              <FormPeso />
              <GraficoPeso />
            </div>
          )}
          
          {activeTab === 'refeicao' && <FormRefeicao />}
          
          {activeTab === 'historico' && <ListaRefeicoes />}
        </div>
      </div>
    </main>
  )
}