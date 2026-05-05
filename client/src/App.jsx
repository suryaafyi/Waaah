import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { storage } from './lib/storage'
import Onboarding from './screens/Onboarding'
import Home       from './screens/Home'
import Context    from './screens/Context'
import Result     from './screens/Result'
import Symptoms   from './screens/Symptoms'
import History    from './screens/History'
import Settings   from './screens/Settings'

import { InstallPrompt } from './components/InstallPrompt'

export default function App() {
  const baby = storage.getBaby()
  const hasBabyId = !!baby?.babyId

  useEffect(() => {
    const applyDarkRoom = () => {
      const prefs = JSON.parse(localStorage.getItem('waaah_prefs') ?? '{}')
      const hour = new Date().getHours()
      const isNight = hour >= 22 || hour < 6
      const shouldDim = prefs.darkRoomMode && isNight

      if (shouldDim) {
        document.documentElement.style.filter = 'brightness(0.45)'
        document.documentElement.style.transition = 'filter 1s ease'
      } else {
        document.documentElement.style.filter = 'brightness(1)'
      }
    }

    applyDarkRoom()
    const interval = setInterval(applyDarkRoom, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={(baby && hasBabyId) ? <Navigate to="/home" /> : <Onboarding />} />
        <Route path="/home"     element={<Home />} />
        <Route path="/context"  element={<Context />} />
        <Route path="/result"   element={<Result />} />
        <Route path="/symptoms" element={<Symptoms />} />
        <Route path="/history"  element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <InstallPrompt />
    </BrowserRouter>
  )
}
