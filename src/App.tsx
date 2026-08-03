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
    name: 'xanax 0,50mg',
    price: 15.00,
    image: 'https://www.google.com/imgres?q=alprazolam&imgurl=https%3A%2F%2Fmboapharma.cm%2Fwp-content%2Fuploads%2F2025%2F03%2Falprazolam-biogaran-0-50-mg-comprime-secable.webp&imgrefurl=https%3A%2F%2Fmboapharma.cm%2Fproduit%2Falprazolam-biogaran-050-mg%2F&docid=9s5gfhRDgPwDDM&tbnid=5vAVFXVSOqq9HM&vet=12ahUKEwjHpqfpk4WWAxWMVKQEHTSgOlYQnPAOegUIiQEQAA..i&w=300&h=300&hcb=2&ved=2ahUKEwjHpqfpk4WWAxWMVKQEHTSgOlYQnPAOegUIiQEQAA',
    description: 'Description du produit 1'
  },
  {
    id: 2,
    name: 'ordonnance',
    price: 35.00,
    image: 'https://www.google.com/imgres?q=ordonnance&imgurl=https%3A%2F%2Fstatic.allodocteurs.fr%2Fv1%2F31157-default-720%2Fb48bfa025a4c2f0951ceb2481b8f0e1b%2Fmedia&imgrefurl=https%3A%2F%2Fwww.allodocteurs.fr%2Fse-soigner-ordonnances-on-vous-dit-tout-sur-leur-mode-demploi-28671.html&docid=WcToedflJwtAUM&tbnid=w-MgFlKCfwzPeM&vet=12ahUKEwjUuq2IlIWWAxU_U6QEHU0NFGkQnPAOegQINRAA..i&w=720&h=405&hcb=2&ved=2ahUKEwjUuq2IlIWWAxU_U6QEHU0NFGkQnPAOegQINRAA',
    description: 'Description du produit 2'
  },
  {
    id: 3,
    name: 'dextrometrophane',
    price: 20.00,
    image: 'https://www.google.com/imgres?q=dextrometrophane&imgurl=https%3A%2F%2Fcdn.pim.mesoigner.fr%2Fmesoigner%2Fd8a30df0dd02958e70f279d4d06be75a%2Fmesoigner-thumbnail-1000-1000-inset%2F086%2F984%2F100%2Fdextromethorphane-biogaran-1-5-mg-ml-sans-sucre-solution-buvable-edulcoree-au-maltitol-liquide-et-a-la-saccharine-sodique.webp&imgrefurl=https%3A%2F%2Fpharmacie-gascogne-seysses.mesoigner.fr%2Fmedicament-produit-parapharmacie%2F346663-dextromethorphane-biogaran-1-5-mg-ml-sans-sucre-solution-buvable-edulcoree-au-maltitol-liquide-et-a-la-saccharine-sodique&docid=hDCQ1pKpjkMJDM&tbnid=n-HjYwhJwPy1NM&vet=12ahUKEwjtz9mklIWWAxUTe6QEHT3PNs0QnPAOegQIPhAA..i&w=1000&h=1000&hcb=2&ved=2ahUKEwjtz9mklIWWAxUTe6QEHT3PNs0QnPAOegQIPhAA',
    description: 'Description du produit 3'
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
          {page === 'catalog' ? `Panier (${cartCount})` : 'Catalogue'}
        </button>
      </div>

      {user && (
        <p style={{ marginBottom: 16, opacity: 0.8 }}>
          Bonjour <strong>{user.first_name}</strong>
        </p>
      )}

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
                    <div style={{ fontSize: 13, opacity