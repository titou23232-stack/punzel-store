import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Telegram: any
  }
}

function App() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user)
      }
    }
  }, [])

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Punzel Store</h1>
      {user ? (
        <div>
          <p>Bonjour <strong>{user.first_name}</strong> !</p>
          <p>Username : @{user.username || 'pas de username'}</p>
          <p>ID : {user.id}</p>
        </div>
      ) : (
        <p>Ouvre cette page depuis Telegram pour voir ton profil.</p>
      )}
      <hr />
      <p>Mini App prête ✅</p>
    </div>
  )
}

export default App