import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uajxxenodzturmmwevvq.supabase.co'
const SUPABASE_KEY = 'sb_publishable_mBx6LDqh0GHUoQG9FCxFqg_BDXPVf7H'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const ADMIN_IDS = [5553381196, 6044402765]
const VINTED_URL = 'https://www.vinted.fr/member/3164609498-punslestore5'
const PAYPAL_URL = 'const PAYPAL_URL = 'https://paypal.me/PunzelStore''

type Product = {
  id: number
  name: string
  price: number
  image: string
  description: string
}

type CartItem = Product & { quantity: number }

const PRODUCTS: Product[] = [
  { id: 1, name: 'Xanax 0,50mg', price: 15, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJhx-xztg-n9PMr7wLxunTzbf3SDJe1hSxpkzr9cPB-w&s=10', description: 'L’alprazolam est un médicament utilisé pour réduire les sensations d’anxiété. Il aide à favoriser un état de calme et de détente.' },
  { id: 2, name: 'Ordonnance', price: 35, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzUnRhKHeeNKrKDzTbOcpiDd9eo7JNdnsyEdNyC8ftKA&s=10', description: 'Une ordonnance médicale est un document qui indique un traitement à suivre, avec les informations nécessaires à son utilisation.' },
  { id: 3, name: 'Dextrometrophane', price: 20, image: 'https://cdn.pim.mesoigner.fr/mesoigner/d8a30df0dd02958e70f279d4d06be75a/mesoigner-thumbnail-1000-1000-inset/086/984/100/dextromethorphane-biogaran-1-5-mg-ml-sans-sucre-solution-buvable-edulcoree-au-maltitol-liquide-et-a-la-saccharine-sodique.webp', description: 'Le dextrométhorphane peut provoquer des sensations de vertige ou de tête qui tourne.' }
]

function App() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [page, setPage] = useState<'catalog' | 'cart' | 'profile' | 'admin' | 'form'>('catalog')
  const [xp, setXp] = useState(0)
  const [orders, setOrders] = useState(0)
  const [adminOrders, setAdminOrders] = useState<any[]>([])

  const [form, setForm] = useState({
    quantity: '',
    fullName: '',
    address: '',
    phone: '',
    whatClientWants: '',
    birthDate: ''
  })

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

  const loadAdminOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (data) setAdminOrders(data)
  }

  useEffect(() => {
    if (page === 'admin') loadAdminOrders()
  }, [page])

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
  const isAdmin = ADMIN_IDS.includes(user?.id)
  const hasProduct = (id: number) => cart.some(i => i.id === id)

  const goToForm = () => {
    if (cart.length === 0) return
    setPage('form')
  }

  const placeOrder = async () => {
    if (!user) return

    if (!form.fullName || !form.address || !form.phone) {
      alert('Merci de remplir Nom, Adresse et Téléphone')
      return
    }
    if (hasProduct(2) && (!form.whatClientWants || !form.birthDate)) {
      alert('Pour le Produit 2, remplis aussi "Ce que tu veux" et la date de naissance')
      return
    }

    const orderData = {
      user_id: user.id,
      username: user.username || null,
      first_name: user.first_name || null,
      products: { items: cart, form: form },
      total: total,
      status: 'pending'
    }

    const { error } = await supabase.from('orders').insert(orderData)

    if (error) {
      alert('Erreur lors de la commande')
      console.error(error)
      return
    }

    // Notification aux admins
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/notify-admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({
          order: {
            first_name: user.first_name,
            username: user.username,
            total: total,
            products: { items: cart, form: form }
          }
        })
      })
    } catch (e) {
      console.error('Erreur notification', e)
    }

    const gainedXp = Math.floor(total)
    const newXp = xp + gainedXp
    const newOrdersCount = orders + 1
    setXp(newXp)
    setOrders(newOrdersCount)
    localStorage.setItem('xp', String(newXp))
    localStorage.setItem('orders', String(newOrdersCount))

    // Redirection paiement
    const tg = (window as any).Telegram?.WebApp
    if (hasProduct(2)) {
      if (tg) tg.openLink(PAYPAL_URL)
      else window.open(PAYPAL_URL, '_blank')
    } else {
      if (tg) tg.openLink(VINTED_URL)
      else window.open(VINTED_URL, '_blank')
    }

    alert(`Commande enregistrée !\n+${gainedXp} XP\nTu vas être redirigé pour le paiement.`)
    setCart([])
    setForm({ quantity: '', fullName: '', address: '', phone: '', whatClientWants: '', birthDate: '' })
    setPage('catalog')
  }

  if (loading) {
    return (
      <div style={{ background: '#000', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <img src="https://i.imgur.com/0DSuWL6.jpeg" alt="Logo" style={{ width: 220, height: 220, objectFit: 'contain', borderRadius: 16, marginBottom: 20 }} />
        <p style={{ color: '#22c55e' }}>Chargement...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 16px 80px 16px', fontFamily: 'sans-serif', background: '#000', color: '#22c55e', minHeight: '100vh' }}>
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
          {cart.length === 0 ? <p style={{ textAlign: 'center', color: '#4ade80' }}>Panier vide</p> : (
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
              <button onClick={goToForm} style={orderBtn}>Continuer →</button>
            </>
          )}
        </div>
      )}

      {page === 'form' && (
        <div>
          <h2 style={{ color: '#22c55e' }}>Informations de commande</h2>
          <input placeholder="Nom et Prénom *" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} style={inputStyle} />
          <input placeholder="Adresse *" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={inputStyle} />
          <input placeholder="Numéro de téléphone *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
          {(hasProduct(1) || hasProduct(3)) && (
            <input placeholder="Quantité" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} style={inputStyle} />
          )}
          {hasProduct(2) && (
            <>
              <input placeholder="Ce que tu veux (Produit 2)" value={form.whatClientWants} onChange={e => setForm({ ...form, whatClientWants: e.target.value })} style={inputStyle} />
              <input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} style={inputStyle} />
            </>
          )}
          <button onClick={placeOrder} style={orderBtn}>Valider et Payer</button>
          <button onClick={() => setPage('cart')} style={{ ...orderBtn, background: '#333', marginTop: 8 }}>← Retour</button>
        </div>
      )}

      {page === 'profile' && (
        <div style={cardStyle}>
          <div style={{ width: '100%' }}>
            <h2 style={{ margin: '0 0 12px 0', color: '#22c55e' }}>Mon Profil</h2>
            {user && (
              <>
                <p style={{ color: '#4ade80' }}><strong style={{ color: '#22c55e' }}>{user.first_name}</strong></p>
                <p style={{ color: '#4ade80' }}>@{user.username || 'pas de username'}</p>
              </>
            )}
            <hr style={{ borderColor: '#14532d', margin: '12px 0' }} />
            <p style={{ color: '#4ade80' }}>Niveau : <strong style={{ color: '#22c55e' }}>{level}</strong></p>
            <p style={{ color: '#4ade80' }}>XP : <strong style={{ color: '#22c55e' }}>{xp}</strong></p>
            <p style={{ color: '#4ade80' }}>Commandes : <strong style={{ color: '#22c55e' }}>{orders}</strong></p>
            <div style={{ background: '#14532d', height: 10, borderRadius: 5, marginTop: 8 }}>
              <div style={{ background: '#22c55e', height: '100%', width: `${xpInLevel}%`, borderRadius: 5 }} />
            </div>
          </div>
        </div>
      )}

      {page === 'admin' && isAdmin && (
        <div>
          <h2 style={{ color: '#22c55e' }}>Commandes clients</h2>
          {adminOrders.length === 0 ? (
            <p style={{ color: '#4ade80' }}>Aucune commande</p>
          ) : (
            adminOrders.map(order => (
              <div key={order.id} style={cardStyle}>
                <div style={{ width: '100%' }}>
                  <p style={{ color: '#22c55e', margin: 0 }}><strong>{order.first_name}</strong> (@{order.username || 'N/A'})</p>
                  <p style={{ color: '#4ade80', fontSize: 13 }}>Total : {order.total} € — {order.status}</p>
                  <p style={{ color: '#4ade80', fontSize: 12 }}>{new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {page !== 'form' && (
        <div style={bottomNav}>
          <button onClick={() => setPage('catalog')} style={navItem(page === 'catalog')}>🏠<br/>Catalogue</button>
          <button onClick={() => setPage('cart')} style={navItem(page === 'cart')}>🛒<br/>Panier ({cartCount})</button>
          <button onClick={() => setPage('profile')} style={navItem(page === 'profile')}>👤<br/>Profil</button>
          {isAdmin && <button onClick={() => setPage('admin')} style={navItem(page === 'admin')}>🛡️<br/>Admin</button>}
        </div>
      )}
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#0a0a0a', border: '1px solid #14532d', borderRadius: 12,
  padding: 12, marginBottom: 12, display: 'flex', gap: 12
}
const addBtn: React.CSSProperties = {
  background: '#14532d', color: '#22c55e', border: '1px solid #22c55e',
  padding: '6px 12px', borderRadius: 6, fontWeight: 'bold'
}
const qtyBtn: React.CSSProperties = {
  background: '#14532d', color: '#22c55e', border: '1px solid #22c55e',
  width: 28, height: 28, borderRadius: 6
}
const orderBtn: React.CSSProperties = {
  width: '100%', background: '#14532d', color: '#22c55e', border: '1px solid #22c55e',
  padding: 14, borderRadius: 10, fontWeight: 'bold', marginTop: 12
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: 12, marginBottom: 10, borderRadius: 8,
  border: '1px solid #14532d', background: '#0a0a0a', color: '#22c55e',
  boxSizing: 'border-box'
}
const bottomNav: React.CSSProperties = {
  position: 'fixed', bottom: 0, left: 0, right: 0, background: '#000',
  borderTop: '1px solid #14532d', display: 'flex', justifyContent: 'space-around',
  padding: '8px 0', zIndex: 100
}
const navItem = (active: boolean): React.CSSProperties => ({
  background: 'transparent', color: active ? '#22c55e' : '#4ade80',
  border: 'none', fontSize: 12, fontWeight: active ? 'bold' : 'normal',
  opacity: active ? 1 : 0.6
})

export default App