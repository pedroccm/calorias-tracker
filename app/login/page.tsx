'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { fakeAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

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
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Meu Tracker
            </h1>
            <p className="text-gray-600">
              Faça login para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-lg font-medium text-gray-700 mb-3">
                Usuário
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Digite seu usuário"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-3">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Digite sua senha"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 text-lg rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 mt-8"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              <strong>Dados de acesso:</strong><br />
              Usuário: <code className="bg-white px-2 py-1 rounded">pedroccm</code><br />
              Senha: <code className="bg-white px-2 py-1 rounded">q1w2e3r4t5</code>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}