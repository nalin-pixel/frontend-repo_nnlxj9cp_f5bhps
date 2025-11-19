import { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function App() {
  const [user, setUser] = useState(null)

  if(!user){
    return <Login onLogin={setUser} />
  }

  return <Dashboard user={user} onLogout={()=>setUser(null)} />
}

export default App