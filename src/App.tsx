import { useEffect, useState } from 'react'
import { init, retrieveLaunchParams, miniApp } from '@tma.js/sdk'

function App() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    try {
      init()
      miniApp.ready()
      miniApp.expand()

      const { initData } = retrieveLaunchParams()
      if (initData?.user) {
        setUser(initData.user)
      }
    } catch (e) {
      console.log('Pas dans Telegram')
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