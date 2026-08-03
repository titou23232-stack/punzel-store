import { useEffect, useState } from 'react'

type Product = {
  id: number
  name: string
  price: number
  image: string
  description: string
}

type CartItem = Product & { quantity: number }

const PRODUCTS: Product[] = [
  { id: 1, name: 'Xanax', price: 15, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJhx-xztg-n9PMr7wLxunTzbf3SDJe1hSxpkzr9cPB-w&s=10', description: 'L’alprazolam est un médicament utilisé pour réduire les sensations d’anxiété. Il aide à favoriser un état de calme et de détente.' },
  { id: 2, name: 'Ordonnance', price: 35, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzUnRhKHeeNKrKDzTbOcpiDd9eo7JNdnsyEdNyC8ftKA&s=10', description: 'Une ordonnance médicale est un document qui indique un traitement à suivre, avec les informations nécessaires à son utilisation.' },
  { id: 3, name: 'Dxtrometrophane', price: 20, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgEk4pnpfjIUxFjbc1kYViNFO4ngSgGhNmKcp1vgjLRQ&s=10', description: 'Le dextrométhorphane peut provoquer des sensations de vertige ou de tête qui tourne.' }
]

function App() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [page, setPage] = useState<'catalog' | 'cart' | 'profile'>('catalog')
  const [xp, setXp] = useState(0)
  const [orders, setOrders] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)

    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      if (tg.initDataUnsafe?.user) setUser(tg.initDataUnsafe.user)
    }

    const savedXp = localStorage.getItem('xp')
    const savedOrders = localStorage.getItem('orders')
    if (savedXp) setXp(Number(savedXp))
    if (savedOrders) setOrders(Number(savedOrders))

    return () => clearTimeout(timer)
  }, [])

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => i.id !== id))
      return
    }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)
  const level = Math.floor(xp / 100) + 1
  const xpInLevel = xp % 100

  const placeOrder = () => {
    if (cart.length === 0) return
    const gainedXp = Math.floor(total)
    const newXp = xp + gainedXp
    const newOrders = orders + 1
    setXp(newXp)
    setOrders(newOrders)
    localStorage.setItem('xp', String(newXp))
    localStorage.setItem('orders', String(newOrders))
    alert(`Commande validée !\n+${gainedXp} XP`)
    setCart([])
    setPage('catalog')
  }

  // ÉCRAN DE CHARGEMENT AVEC TON LOGO
  if (loading) {
    return (
      <div style={{
        background: '#000',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <img 
          src="https://i.imgur.com/0DSuWL6.jpeg" 
          alt="Punzel Store" 
          style={{ 
            width: 220, 
            height: 220, 
            objectFit: 'contain',
            borderRadius: 16,
            marginBottom: 20
          }} 
        />
        <p style={{ color: '#22c55e', fontSize: 14 }}>Chargement...</p>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '16px 16px 80px 16px', 
      fontFamily: 'sans-serif', 
      background: '#000', 
      color: '#22c55e', 
      minHeight: '100vh' 
    }}>
      <h1 style={{ margin: '0 0 16px 0', color: '#22c55e', textAlign: 'center' }}>Punzel Store</h1>

      {page === 'catalog' && PRODUCTS.map(p => (
        <div key={p.id} style={cardStyle}>
          <img src={p.image} style={{ width: 80, height: 80, borderRadius: 8 }} />
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, color: '#22c55e' }}>{p.name}</h3>
            <p style={{ fontSize: 13, color: '#4ade80', opacity: 0.8 }}>{p.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: '#22c55e' }}>{p.price} €</strong>
              <button onClick={() => addToCart(p)} style={addBtn}>Ajouter</button>
            </div>
          </div>
        </div>
      ))}

      {page === 'cart' && (
        <div>
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#4ade80' }}>Panier vide</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} style={{ ...cardStyle, justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ color: '#22c55e' }}>{item.name}</strong>
                    <div style={{ fontSize: 13, color: '#4ade80' }}>{item.price} € × {item.quantity}</div>
                  </div>
                  <div>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={qtyBtn}>-</button>
                    <span style={{ margin: '0 8px', color: '#22c55e' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={qtyBtn}>+</button>
                  </div>
                </div>
              ))}
              <h3 style={{ color: '#22c55e' }}>Total : {total.toFixed(2)} €</h3>
              <button onClick={placeOrder} style={orderBtn}>Valider la commande</button>
            </>
          )}
        </div>
      )}

      {page === 'profile' && (
        <div style={cardStyle}>
          <div style={{ width: '100%' }}>
            <h2 style={{ margin: '0 0 12px 0', color: '#22c55e' }}>Mon Profil</h2>
            {user ? (
              <>
                <p style={{ color: '#4ade80' }}><strong style={{ color: '#22c55e' }}>{user.first_name}</strong></p>
                <p style={{ color: '#4ade80' }}>@{user.username || 'pas de username'}</p>
              </>
            ) : (
              <p style={{ color: '#4ade80' }}>Utilisateur non détecté</p>
            )}
            <hr style={{ borderColor: '#14532d', margin: '12px 0' }} />
            <p style={{ color: '#4ade80' }}>Niveau : <strong style={{ color: '#22c55e' }}>{level}</strong></p>
            <p style={{ color: '#4ade80' }}>XP : <strong style={{ color: '#22c55e' }}>{xp}</strong></p>
            <p style={{ color: '#4ade80' }}>Commandes : <strong style={{ color: '#22c55e' }}>{orders}</strong></p>
            <div style={{ background: '#14532d', height: 10, borderRadius: 5, marginTop: 8 }}>
              <div style={{ background: '#22c55e', height: '100%', width: `${xpInLevel}%`, borderRadius: 5 }} />
            </div>
            <p style={{ fontSize: 12, color: '#4ade80' }}>{xpInLevel}/100 XP</p>
          </div>
        </div>
      )}

      <div style={bottomNav}>
        <button onClick={() => setPage('catalog')} style={navItem(page === 'catalog')}>🏠<br/>Catalogue</button>
        <button onClick={() => setPage('cart')} style={navItem(page === 'cart')}>🛒<br/>Panier ({cartCount})</button>
        <button onClick={() => setPage('profile')} style={navItem(page === 'profile')}>👤<br/>Profil</button>
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#0a0a0a',
  border: '1px solid #14532d',
  borderRadius: 12,
  padding: 12,
  marginBottom: 12,
  display: 'flex',
  gap: 12
}

const addBtn: React.CSSProperties = {
  background: '#14532d',
  color: '#22c55e',
  border: '1px solid #22c55e',
  padding: '6px 12px',
  borderRadius: 6,
  fontWeight: 'bold'
}

const qtyBtn: React.CSSProperties = {
  background: '#14532d',
  color: '#22c55e',
  border: '1px solid #22c55e',
  width: 28,
  height: 28,
  borderRadius: 6
}

const orderBtn: React.CSSProperties = {
  width: '100%',
  background: '#14532d',
  color: '#22c55e',
  border: '1px solid #22c55e',
  padding: 14,
  borderRadius: 10,
  fontWeight: 'bold',
  marginTop: 12
}

const bottomNav: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  background: '#000',
  borderTop: '1px solid #14532d',
  display: 'flex',
  justifyContent: 'space-around',
  padding: '8px 0',
  zIndex: 100
}

const navItem = (active: boolean): React.CSSProperties => ({
  background: 'transparent',
  color: active ? '#22c55e' : '#4ade80',
  border: 'none',
  fontSize: 12,
  fontWeight: active ? 'bold' : 'normal',
  opacity: active ? 1 : 0.6
})

export default App