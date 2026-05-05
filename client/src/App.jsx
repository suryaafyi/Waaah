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
