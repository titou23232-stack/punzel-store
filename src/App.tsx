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
  {
    id: 1,
    name: 'T-Shirt Punzel',
    price: 19.99,
    image: 'https://via.placeholder.com/150',
    description: 'T-shirt confortable édition limitée'
  },
  {
    id: 2,
    name: 'Casquette',
    price: 14.99,
    image: 'https://via.placeholder.com/150',
    description: 'Casquette style street'
  },
  {
    id: 3,
    name: 'Hoodie',
    price: 39.99,
    image: 'https://via.placeholder.com/150',
    description: 'Hoodie chaud et stylé'
  }
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
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user)
      }
    }
  }, [])

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const placeOrder = () => {
    if (cart.length === 0) return
    alert(`Commande envoyée !\nTotal : ${total.toFixed(2)} €\nArticles : ${cartCount}`)
    setCart([])
    setPage('catalog')
  }

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif', background: '#111', color: 'white', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Punzel Store</h1>
        <button
          onClick={() => setPage(page === 'catalog' ? 'cart' : 'catalog')}
          style={{
            background: '#0088cc',
            color: 'white',
            border: 'none',
            padding: '8px 14px',
            borderRadius: 8,
            fontWeight: 'bold'
          }}
        >
          {page === 'catalog' ? `🛒 Panier (${cartCount})` : '← Catalogue'}
        </button>
      </div>

      {user && (
        <p style={{ marginBottom: 16, opacity: 0.8 }}>
          Bonjour <strong>{user.first_name}</strong>
        </p>
      )}

      {/* CATALOGUE */}
      {page === 'catalog' && (
        <div>
          {PRODUCTS.map(product => (
            <div
              key={product.id}
              style={{
                background: '#1e1e1e',
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                display: 'flex',
                gap: 12
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px 0' }}>{product.name}</h3>
                <p style={{ margin: '0 0 6px 0', fontSize: 13, opacity: 0.7 }}>{product.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{product.price.toFixed(2)} €</strong>
                  <button
                    onClick={() => addToCart(product)}
                    style={{
                      background: '#22c55e',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontWeight: 'bold'
                    }}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PANIER */}
      {page === 'cart' && (
        <div>
          {cart.length === 0 ? (
            <p>Ton panier est vide.</p>
          ) : (
            <>
              {cart.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: '#1e1e1e',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: 13, opacity: 0.7 }}>
                      {item.price.toFixed(2)} € × {item.quantity}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={btnStyle}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={btnStyle}>+</button>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 20, fontSize: 18, fontWeight: 'bold' }}>
                Total : {total.toFixed(2)} €
              </div>

              <button
                onClick={placeOrder}
                style={{
                  marginTop: 16,
                  width: '100%',
                  background: '#0088cc',
                  color: 'white',
                  border: 'none',
                  padding: 14,
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 'bold'
                }}
              >
                Valider la commande
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: '#333',
  color: 'white',
  border: 'none',
  width: 28,
  height: 28,
  borderRadius: 6,
  fontSize: 16
}

export default App