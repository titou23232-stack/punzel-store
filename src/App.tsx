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
  { id: 3, name: 'Dextrometrophane', price: 20, image: 'https://cdn.pim.mesoigner.fr/mesoigner/d8a30df0dd02958e70f279d4d06be75a/mesoigner-thumbnail-1000-1000-inset/086/984/100/dextromethorphane-biogaran-1-5-mg-ml-sans-sucre-solution-buvable-edulcoree-au-maltitol-liquide-et-a-la-saccharine-sodique.webp', description: 'Le dextrométhorphane peut provoquer des sensations de vertige ou de tête qui tourne.' }
]

function App() {
  const [user, setUser] = useState<any>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [page, setPage] = useState<'catalog' | 'cart'>('catalog')

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      if (tg.initDataUnsafe?.user) setUser(tg.initDataUnsafe.user)
    }
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

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif', background: '#111', color: 'white', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Punzel Store</h1>
        <button onClick={() => setPage(page === 'catalog' ? 'cart' : 'catalog')} style={{ background: '#0088cc', color: 'white', border: 'none', padding: '8px 14px', borderRadius: 8 }}>
          {page === 'catalog' ? `Panier (${cartCount})` : 'Catalogue'}
        </button>
      </div>

      {user && <p>Bonjour <strong>{user.first_name}</strong></p>}

      {page === 'catalog' && PRODUCTS.map(p => (
        <div key={p.id} style={{ background: '#1e1e1e', borderRadius: 12, padding: 12, marginBottom: 12, display: 'flex', gap: 12 }}>
          <img src={p.image} style={{ width: 80, height: 80, borderRadius: 8 }} />
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0 }}>{p.name}</h3>
            <p style={{ fontSize: 13, opacity: 0.7 }}>{p.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{p.price} €</strong>
              <button onClick={() => addToCart(p)} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 6 }}>Ajouter</button>
            </div>
          </div>
        </div>
      ))}

      {page === 'cart' && (
        <div>
          {cart.length === 0 ? <p>Panier vide</p> : (
            <>
              {cart.map(item => (
                <div key={item.id} style={{ background: '#1e1e1e', padding: 12, marginBottom: 10, borderRadius: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{item.name}</strong>
                    <div>{item.price} € × {item.quantity}</div>
                  </div>
                  <div>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span style={{ margin: '0 8px' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
              ))}
              <h3>Total : {total.toFixed(2)} €</h3>
              <button onClick={() => { alert('Commande envoyée !'); setCart([]); setPage('catalog') }} style={{ width: '100%', background: '#0088cc', color: 'white', border: 'none', padding: 14, borderRadius: 10, marginTop: 12 }}>
                Valider la commande
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default App