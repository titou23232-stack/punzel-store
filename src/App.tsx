import { useEffect, useState } from 'react'

function App() {
  const [user, setUser] = useState<any>(null)
  const [debug, setDebug] = useState('Chargement...')

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp

    if (!tg) {
      setDebug('Telegram WebApp non détecté')
      return
    }

    tg.ready()
    tg.expand()

    setDebug('WebApp détecté')

    // Méthode 1
    if (tg.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user)
      setDebug('Utilisateur trouvé')
      return
    }

    // Méthode 2 (parfois nécessaire)
    setTimeout(() => {
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user)
        setDebug('Utilisateur trouvé (délai)')
      } else {
        setDebug('Aucun utilisateur trouvé. initData: ' + (tg.initData || 'vide'))
      }
    }, 500)
  }, [])

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', background: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1>Punzel Store</h1>

      {user ? (
        <div>
          <p>Bonjour <strong>{user.first_name}</strong> 👋</p>
          <p>Username : @{user.username || 'aucun'}</p>
          <p>ID : {user.id}</p>
        </div>
      ) : (
        <p>{debug}</p>
      )}

      <hr style={{ margin: '20px 0', borderColor: '#333' }} />
      <p>Mini App prête ✅</p>
    </div>
  )
}

export default App