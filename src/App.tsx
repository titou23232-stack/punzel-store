import { useEffect, useState } from 'react'

function App() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkTelegram = () => {
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.ready()
        tg.expand()
        if (tg.initDataUnsafe?.user) {
          setUser(tg.initDataUnsafe.user)
        }
      }
    }

    // On attend un peu que le script Telegram charge
    setTimeout(checkTelegram, 300)
  }, [])

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', background: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1>Punzel Store</h1>
      {user ? (
        <div>
          <p>Bonjour <strong>{user.first_name}</strong> 👋</p>
          <p>Username : @{user.username || 'aucun'}</p>
          <p>ID Telegram : {user.id}</p>
        </div>
      ) : (
        <p>Chargement du profil Telegram...</p>
      )}
      <hr style={{ margin: '20px 0', borderColor: '#333' }} />
      <p>Mini App prête ✅</p>
    </div>
  )
}

export default App