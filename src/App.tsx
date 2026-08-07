import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uajxxenodzturmmwevvq.supabase.co'
const SUPABASE_KEY = 'sb_publishable_mBx6LDqh0GHUoQG9FCxFqg_BDXPVf7H'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const ADMIN_IDS = [5553381196, 6044402765]
const VINTED_URL = 'https://www.vinted.fr/member/3164609498-punslestore5'
const PAYPAL_URL = 'https://paypal.me/PunzelStore'

const WHEEL_IMAGE = 'https://i.imgur.com/3xFzdoI.jpeg'

type Product = {
  id: number
  name: string
  price: number
  image: string
  description: string
}

type CartItem = Product & { quantity: number }

const WHEEL_PRIZES = [
  { label: 'PERDU', type: 'lose' },
  { label: '+20 XP', type: 'xp', value: 20 },
  { label: 'PERDU', type: 'lose' },
  { label: '+50 XP', type: 'xp', value: 50 },
  { label: '+20 XP', type: 'xp', value: 20 },
  { label: 'PERDU', type: 'lose' },
  { label: '+50 XP', type: 'xp', value: 50 },
  { label: '+20 XP', type: 'xp', value: 20 },
  { label: 'Boîte Xanax', type: 'xanax' },
  { label: 'PERDU', type: 'lose' },
]

const canSpinToday = () => {
  const last = localStorage.getItem('lastWheelSpin')
  if (!last) return true
  return new Date(last).toDateString() !== new Date().toDateString()
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Xanax 0,50mg', price: 15, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJhx-xztg-n9PMr7wLxunTzbf3SDJe1hSxpkzr9cPB-w&s=10', description: 'L’alprazolam est un médicament utilisé pour réduire les sensations d’anxiété.' },
  { id: 2, name: 'Ordonnance', price: 35, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzUnRhKHeeNKrKDzTbOcpiDd9eo7JNdnsyEdNyC8ftKA&s=10', description: 'Une ordonnance médicale.' },
  { id: 3, name: 'Dextrometrophane', price: 20, image: 'https://cdn.pim.mesoigner.fr/mesoigner/d8a30df0dd02958e70f279d4d06be75a/mesoigner-thumbnail-1000-1000-inset/086/984/100/dextromethorphane-biogaran-1-5-mg-ml-sans-sucre-solution-buvable-edulcoree-au-maltitol-liquide-et-a-la-saccharine-sodique.webp', description: 'Le dextrométhorphane.' }
]

function App() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [page, setPage] = useState<'catalog' | 'cart' | 'profile' | 'admin' | 'form' | 'wheel' | 'games' | 'review'>('catalog')
  const [spinning, setSpinning] = useState(false)
  const [wheelResult, setWheelResult] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)
  const [xp, setXp] = useState(0)
  const [orders, setOrders] = useState(0)
  const [adminOrders, setAdminOrders] = useState<any[]>([])
  const [gameHistory, setGameHistory] = useState<string[]>([])
  const [referralCode, setReferralCode] = useState('')
  const [myReferralCode, setMyReferralCode] = useState('')
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [lastOrderTotal, setLastOrderTotal] = useState(0)

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
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user)
        setMyReferralCode(`PUNZEL${tg.initDataUnsafe.user.id}`)
      }
    }
    const savedXp = localStorage.getItem('xp')
    const savedOrders = localStorage.getItem('orders')
    const savedHistory = localStorage.getItem('gameHistory')
    if (savedXp) setXp(Number(savedXp))
    if (savedOrders) setOrders(Number(savedOrders))
    if (savedHistory) setGameHistory(JSON.parse(savedHistory))
    return () => clearTimeout(timer)
  }, [])

  const loadAdminOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (data) setAdminOrders(data)
  }

  useEffect(() => {
    if (page === 'admin') loadAdminOrders()
  }, [page])

  const validateOrder = async (orderId: number) => {
    const { error } = await supabase.from('orders').update({ status: 'validated' }).eq('id', orderId)
    if (!error) {
      setAdminOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'validated' } : o))
      alert('Commande validée !')
    } else {
      alert('Erreur lors de la validation')
    }
  }

  const refuseOrder = async (orderId: number) => {
    if (!confirm('Tu es sûr de vouloir refuser et supprimer cette commande ?')) return
    const { error } = await supabase.from('orders').delete().eq('id', orderId)
    if (!error) {
      setAdminOrders(prev => prev.filter(o => o.id !== orderId))
      alert('Commande refusée et supprimée')
    } else {
      alert('Erreur lors de la suppression')
    }
  }

  const submitReview = async () => {
    if (rating === 0) {
      alert('Merci de mettre une note sur 5 étoiles')
      return
    }
    if (!reviewText.trim()) {
      alert('Merci d’écrire un commentaire / recommandation')
      return
    }

    await supabase.from('reviews').insert({
      user_id: user?.id,
      username: user?.username || null,
      first_name: user?.first_name || null,
      rating: rating,
      comment: reviewText,
      order_total: lastOrderTotal
    })

    alert('Merci pour ton avis !')
    setRating(0)
    setReviewText('')
    setPage('catalog')
  }

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
  const discount = xp >= 1000 ? 0.10 : 0
  const totalAfterDiscount = total * (1 - discount)
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)
  const level = Math.floor(xp / 100) + 1
  const xpInLevel = xp % 100
  const isAdmin = ADMIN_IDS.includes(user?.id)
  const hasProduct = (id: number) => cart.some(i => i.id === id)

  const spinWheel = () => {
    if (spinning || !canSpinToday()) return
    setSpinning(true)
    setWheelResult(null)

    const random = Math.random()
    let selectedIndex = 0
    if (random < 0.40) selectedIndex = 0
    else if (random < 0.55) selectedIndex = 1
    else if (random < 0.65) selectedIndex = 2
    else if (random < 0.75) selectedIndex = 3
    else if (random < 0.85) selectedIndex = 4
    else if (random < 0.92) selectedIndex = 5
    else if (random < 0.97) selectedIndex = 6
    else if (random < 0.99) selectedIndex = 7
    else selectedIndex = 8

    const selected = WHEEL_PRIZES[selectedIndex]
    const segment = 360 / WHEEL_PRIZES.length
    const extraSpins = 6 * 360
    const targetAngle = 360 - (selectedIndex * segment + segment / 2)
    const finalRotation = extraSpins + targetAngle
    setRotation(prev => prev + finalRotation)

    setTimeout(() => {
      setSpinning(false)
      localStorage.setItem('lastWheelSpin', new Date().toISOString())

      let resultText = ''
      if (selected.type === 'xp') {
        const newXp = xp + (selected.value || 0)
        setXp(newXp)
        localStorage.setItem('xp', String(newXp))
        resultText = `🎉 +${selected.value} XP !`
      } else if (selected.type === 'xanax') {
        const xanaxProduct = PRODUCTS.find(p => p.id === 1)
        if (xanaxProduct) {
          setCart(prev => {
            const existing = prev.find(i => i.id === 1 && i.price === 0)
            if (existing) {
              return prev.map(i => (i.id === 1 && i.price === 0) ? { ...i, quantity: i.quantity + 1 } : i)
            }
            return [...prev, { ...xanaxProduct, price: 0, name: 'Boîte Xanax (OFFERTE)', quantity: 1 }]
          })
        }
        resultText = '💊 JACKPOT ! Boîte de Xanax offerte ajoutée au panier !'
      } else {
        resultText = '😢 Perdu...'
      }

      setWheelResult(resultText)
      const newHistory = [resultText, ...gameHistory].slice(0, 20)
      setGameHistory(newHistory)
      localStorage.setItem('gameHistory', JSON.stringify(newHistory))
    }, 4200)
  }

  const applyReferral = () => {
    if (!referralCode.trim()) {
      alert('Entre un code de parrainage')
      return
    }
    if (referralCode === myReferralCode) {
      alert('Tu ne peux pas utiliser ton propre code')
      return
    }
    if (localStorage.getItem('usedReferral')) {
      alert('Tu as déjà utilisé un code')
      return
    }
    const newXp = xp + 50
    setXp(newXp)
    localStorage.setItem('xp', String(newXp))
    localStorage.setItem('usedReferral', referralCode)
    alert('Code accepté ! +50 XP')
    setReferralCode('')
  }

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
      total: totalAfterDiscount,
      status: 'pending'
    }

    const { error } = await supabase.from('orders').insert(orderData)
    if (error) {
      alert('Erreur lors de la commande')
      return
    }

    try {
      await fetch('https://uajxxenodzturmmwevvq.supabase.co/functions/v1/notify-admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sb_publishable_mBx6LDqh0GHUoQG9FCxFqg_BDXPVf7H'
        },
        body: JSON.stringify({
          order: {
            first_name: user.first_name,
            username: user.username,
            total: totalAfterDiscount,
            products: { items: cart, form: form }
          }
        })
      })
    } catch (e) {}

    const gainedXp = Math.floor(totalAfterDiscount)
    const newXp = xp + gainedXp
    const newOrdersCount = orders + 1
    setXp(newXp)
    setOrders(newOrdersCount)
    localStorage.setItem('xp', String(newXp))
    localStorage.setItem('orders', String(newOrdersCount))

    const tg = (window as any).Telegram?.WebApp
    if (hasProduct(2)) {
      if (tg) tg.openLink(PAYPAL_URL)
      else window.open(PAYPAL_URL, '_blank')
    } else {
      if (tg) tg.openLink(VINTED_URL)
      else window.open(VINTED_URL, '_blank')
    }

    // On force l'avis
    setLastOrderTotal(totalAfterDiscount)
    setCart([])
    setForm({ quantity: '', fullName: '', address: '', phone: '', whatClientWants: '', birthDate: '' })
    setPage('review')
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
                <div key={item.id + '-' + item.price} style={{ ...cardStyle, justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ color: '#22c55e' }}>{item.name}</strong>
                    <div style={{ fontSize: 13, color: item.price === 0 ? '#fbbf24' : '#4ade80' }}>
                      {item.price === 0 ? 'OFFERT' : `${item.price} €`} × {item.quantity}
                    </div>
                  </div>
                  <div>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={qtyBtn}>-</button>
                    <span style={{ margin: '0 8px', color: '#22c55e' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={qtyBtn}>+</button>
                  </div>
                </div>
              ))}
              <h3 style={{ color: '#22c55e' }}>
                Total : {total.toFixed(2)} €
                {discount > 0 && <span style={{ color: '#fbbf24' }}> (−10 % = {totalAfterDiscount.toFixed(2)} €)</span>}
              </h3>
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

      {/* ========== PAGE AVIS OBLIGATOIRE ========== */}
      {page === 'review' && (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#22c55e', marginBottom: 8 }}>Merci pour ta commande !</h2>
          <p style={{ color: '#4ade80', marginBottom: 24 }}>Laisse-nous un avis obligatoire 👇</p>

          <div style={{ marginBottom: 20 }}>
            <p style={{ color: '#22c55e', marginBottom: 10 }}>Note sur 5 étoiles :</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: 36,
                    cursor: 'pointer',
                    color: star <= rating ? '#fbbf24' : '#333'
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Écris ton avis / recommandation ici..."
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            style={{
              width: '100%',
              minHeight: 120,
              padding: 14,
              borderRadius: 10,
              border: '1px solid #14532d',
              background: '#0a0a0a',
              color: '#22c55e',
              fontSize: 15,
              marginBottom: 16,
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
          />

          <button onClick={submitReview} style={orderBtn}>
            Envoyer mon avis
          </button>
        </div>
      )}

      {page === 'wheel' && (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#22c55e', marginBottom: 6 }}>Roue de la Fortune</h2>
          <p style={{ color: '#4ade80', marginBottom: 16, fontSize: 14 }}>1 spin par jour</p>

          <div style={{ position: 'relative', width: 300, height: 300, margin: '0 auto 24px' }}>
            <div style={{
              position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '13px solid transparent', borderRight: '13px solid transparent',
              borderTop: '22px solid #facc15', zIndex: 30,
              filter: 'drop-shadow(0 0 8px #facc15)'
            }} />
            <div style={{
              width: 300, height: 300, borderRadius: '50%',
              border: '12px solid #39ff14', boxShadow: '0 0 25px #39ff14',
              overflow: 'hidden', position: 'relative'
            }}>
              <img
                src={WHEEL_IMAGE}
                alt="Roue"
                style={{
                  width: '118%', height: '118%', marginLeft: '-9%', marginTop: '-9%',
                  borderRadius: '50%',
                  transition: spinning ? 'transform 4.2s cubic-bezier(0.15, 0.85, 0.25, 1)' : 'none',
                  transform: `rotate(${rotation}deg)`,
                  objectFit: 'cover', display: 'block'
                }}
              />
            </div>
          </div>

          <button
            onClick={spinWheel}
            disabled={spinning || !canSpinToday()}
            style={{
              width: '90%', maxWidth: 320,
              background: (spinning || !canSpinToday()) ? '#333' : '#facc15',
              color: '#000', border: 'none', padding: '16px 20px',
              borderRadius: 14, fontWeight: 'bold', fontSize: 18,
              opacity: (spinning || !canSpinToday()) ? 0.6 : 1
            }}
          >
            {spinning ? 'La roue tourne...' : !canSpinToday() ? "Déjà utilisé aujourd'hui" : '🎰 Lancer la roue'}
          </button>

          {wheelResult && (
            <div style={{
              marginTop: 22, padding: 16, background: '#0a0a0a',
              border: '2px solid #22c55e', borderRadius: 12,
              color: '#22c55e', fontWeight: 'bold', fontSize: 17
            }}>
              {wheelResult}
            </div>
          )}
        </div>
      )}

      {page === 'games' && (
        <div>
          <h2 style={{ color: '#22c55e' }}>Mes Jeux</h2>
          {gameHistory.length === 0 ? (
            <p style={{ color: '#4ade80', textAlign: 'center' }}>Aucun gain pour le moment</p>
          ) : (
            gameHistory.map((h, i) => (
              <div key={i} style={{ ...cardStyle, justifyContent: 'center' }}>
                <p style={{ color: '#22c55e', margin: 0 }}>{h}</p>
              </div>
            ))
          )}
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
            {xp >= 1000 && <p style={{ color: '#fbbf24' }}>✓ Réduction 10 % active</p>}
            <div style={{ background: '#14532d', height: 10, borderRadius: 5, marginTop: 8 }}>
              <div style={{ background: '#22c55e', height: '100%', width: `${xpInLevel}%`, borderRadius: 5 }} />
            </div>

            <button onClick={() => setPage('games')} style={{ ...orderBtn, marginTop: 16 }}>
              🎮 Voir mes gains (Jeux)
            </button>

            <hr style={{ borderColor: '#14532d', margin: '16px 0' }} />
            <h3 style={{ color: '#22c55e', marginBottom: 8 }}>Parrainage</h3>
            <p style={{ color: '#4ade80', fontSize: 13 }}>Ton code : <strong style={{ color: '#22c55e' }}>{myReferralCode || '...'}</strong></p>
            <input
              placeholder="Code de parrainage"
              value={referralCode}
              onChange={e => setReferralCode(e.target.value)}
              style={inputStyle}
            />
            <button onClick={applyReferral} style={{ ...orderBtn, marginTop: 8 }}>
              Utiliser un code (+50 XP)
            </button>
          </div>
        </div>
      )}

      {page === 'admin' && isAdmin && (
        <div>
          <h2 style={{ color: '#22c55e', marginBottom: 16 }}>📦 Commandes Admin</h2>
          {adminOrders.length === 0 ? (
            <p style={{ color: '#4ade80', textAlign: 'center' }}>Aucune commande pour le moment</p>
          ) : (
            adminOrders.map((order, index) => (
              <div key={order.id || index} style={{
                background: '#0a0a0a', border: '1px solid #14532d',
                borderRadius: 12, padding: 14, marginBottom: 14
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <strong style={{ color: '#22c55e' }}>
                    {order.first_name || 'Client'} (@{order.username || 'N/A'})
                  </strong>
                  <span style={{ 
                    color: order.status === 'pending' ? '#fbbf24' : order.status === 'validated' ? '#22c55e' : '#ef4444',
                    fontSize: 13, fontWeight: 'bold'
                  }}>
                    {order.status === 'pending' ? 'En attente' : order.status === 'validated' ? 'Validée' : order.status}
                  </span>
                </div>
                <p style={{ color: '#4ade80', fontSize: 13, margin: '4px 0' }}>
                  📅 {new Date(order.created_at).toLocaleString('fr-FR')}
                </p>
                <p style={{ color: '#4ade80', fontSize: 13, margin: '4px 0' }}>
                  💰 Total : <strong style={{ color: '#22c55e' }}>{order.total} €</strong>
                </p>
                {order.products?.items && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #14532d' }}>
                    <p style={{ color: '#22c55e', fontSize: 13, marginBottom: 6 }}>Produits :</p>
                    {order.products.items.map((item: any, i: number) => (
                      <div key={i} style={{ color: '#4ade80', fontSize: 13, marginLeft: 8 }}>
                        • {item.name} × {item.quantity} {item.price === 0 ? ' (OFFERT)' : ` — ${item.price}€`}
                      </div>
                    ))}
                  </div>
                )}
                {order.products?.form && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #14532d' }}>
                    <p style={{ color: '#22c55e', fontSize: 13, marginBottom: 6 }}>Infos client :</p>
                    <p style={{ color: '#4ade80', fontSize: 13, margin: '2px 0' }}>👤 {order.products.form.fullName}</p>
                    <p style={{ color: '#4ade80', fontSize: 13, margin: '2px 0' }}>📍 {order.products.form.address}</p>
                    <p style={{ color: '#4ade80', fontSize: 13, margin: '2px 0' }}>📞 {order.products.form.phone}</p>
                    {order.products.form.whatClientWants && (
                      <p style={{ color: '#4ade80', fontSize: 13, margin: '2px 0' }}>📝 {order.products.form.whatClientWants}</p>
                    )}
                  </div>
                )}
                {order.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                    <button onClick={() => validateOrder(order.id)} style={{
                      flex: 1, background: '#14532d', color: '#22c55e',
                      border: '1px solid #22c55e', padding: '10px',
                      borderRadius: 8, fontWeight: 'bold', fontSize: 14
                    }}>✅ Valider</button>
                    <button onClick={() => refuseOrder(order.id)} style={{
                      flex: 1, background: '#3f0a0a', color: '#ef4444',
                      border: '1px solid #ef4444', padding: '10px',
                      borderRadius: 8, fontWeight: 'bold', fontSize: 14
                    }}>❌ Refuser</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {page !== 'form' && page !== 'review' && (
        <div style={bottomNav}>
          <button onClick={() => setPage('catalog')} style={navItem(page === 'catalog')}>🏠<br/>Catalogue</button>
          <button onClick={() => setPage('cart')} style={navItem(page === 'cart')}>🛒<br/>Panier ({cartCount})</button>
          <button onClick={() => setPage('wheel')} style={navItem(page === 'wheel')}>🎡<br/>Roue</button>
          <button onClick={() => setPage('profile')} style={navItem(page === 'profile')}>👤<br/>Profil</button>
          {isAdmin && (
            <button onClick={() => setPage('admin')} style={navItem(page === 'admin')}>
              🛡️<br/>Commandes Admin
            </button>
          )}
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