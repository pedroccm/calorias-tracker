// Sistema de autenticação fake (client-side only)
export const fakeAuth = {
  login: (username: string, password: string) => {
    if (username === 'pedroccm' && password === 'q1w2e3r4t5') {
      const user = {
        id: 1,
        nome: 'Pedro CCM',
        username: 'pedroccm'
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user))
      }
      return { success: true, user }
    }
    return { success: false, error: 'Usuário ou senha inválidos' }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
  },

  getUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  },

  isAuthenticated: () => {
    return fakeAuth.getUser() !== null
  }
}