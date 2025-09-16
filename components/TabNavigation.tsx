import { Tabs, Tab, Box } from '@mui/material'
import { Scale, Restaurant, BarChart } from '@mui/icons-material'

interface TabNavigationProps {
  activeTab: 'peso' | 'refeicao' | 'historico'
  setActiveTab: (tab: 'peso' | 'refeicao' | 'historico') => void
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue as 'peso' | 'refeicao' | 'historico')
  }

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        sx={{
          '& .MuiTab-root': {
            minHeight: 64,
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            gap: 1
          }
        }}
      >
        <Tab
          value="peso"
          label="Peso"
          icon={<Scale />}
          iconPosition="start"
        />
        <Tab
          value="refeicao"
          label="Refeição"
          icon={<Restaurant />}
          iconPosition="start"
        />
        <Tab
          value="historico"
          label="Histórico"
          icon={<BarChart />}
          iconPosition="start"
        />
      </Tabs>
    </Box>
  )
}