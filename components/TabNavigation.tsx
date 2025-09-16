interface TabNavigationProps {
  activeTab: 'peso' | 'refeicao' | 'historico'
  setActiveTab: (tab: 'peso' | 'refeicao' | 'historico') => void
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const tabs = [
    { id: 'peso' as const, label: 'Peso', icon: '⚖️' },
    { id: 'refeicao' as const, label: 'Refeição', icon: '🍽️' },
    { id: 'historico' as const, label: 'Histórico', icon: '📊' },
  ]

  return (
    <div className="flex rounded-lg bg-gray-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="text-sm">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}