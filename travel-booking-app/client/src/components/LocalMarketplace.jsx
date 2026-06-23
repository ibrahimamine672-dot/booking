import { useState } from 'react';
import { checkout } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StripeProvider from './StripeProvider';
import StripeCheckout from './StripeCheckout';
import { useNavigate } from 'react-router-dom';
import {
  Coffee,
  Shirt,
  ShoppingBag,
  Store,
  Package,
  CreditCard,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  ShoppingCart,
  Minus,
  Plus,
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'cafe',
    label: 'Café / Salon de thé',
    icon: Coffee,
    description: 'Délices et boissons locales',
    products: [
      { name: 'Espresso', price: 15, image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=300&h=300&fit=crop', description: 'Café corsé à l\'italienne' },
      { name: 'Croissant', price: 8, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038028a?w=300&h=300&fit=crop', description: 'Viennoiserie feuilletée au beurre' },
      { name: 'Thé à la menthe', price: 12, image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=300&fit=crop', description: 'Thé vert frais à la menthe marocaine' },
      { name: 'Pain au chocolat', price: 10, image: 'https://images.unsplash.com/photo-1544616326-af2d458c2a9c?w=300&h=300&fit=crop', description: 'Pâte feuilletée fourrée au chocolat' },
    ],
  },
  {
    id: 'clothing',
    label: 'Boutique de vêtements',
    icon: Shirt,
    description: 'Mode traditionnelle et moderne',
    products: [
      { name: 'T-shirt Artisanal', price: 180, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop', description: 'T-shirt en coton bio fait main' },
      { name: 'Djellaba Traditionnelle', price: 550, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=300&fit=crop', description: 'Veste longue traditionnelle brodée' },
      { name: 'Caftan de Soirée', price: 1200, image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&h=300&fit=crop', description: 'Caftan élégant en soie et dentelle' },
      { name: 'Babouches en Cuir', price: 250, image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&h=300&fit=crop', description: 'Chaussures traditionnelles marocaines' },
    ],
  },
  {
    id: 'grocery',
    label: 'Supermarché / Épicerie',
    icon: ShoppingBag,
    description: 'Produits locaux et essentiels',
    products: [
      { name: 'Eau Minérale', price: 5, image: 'https://images.unsplash.com/photo-1561553590-56e0b9a28f8e?w=300&h=300&fit=crop', description: 'Bouteille d\'eau 1.5L' },
      { name: 'Snacks Salés', price: 15, image: 'https://images.unsplash.com/photo-1621447504864-d8686e77898d?w=300&h=300&fit=crop', description: 'Mélange de biscuits et crackers' },
      { name: 'Briwates & Pâtisserie', price: 35, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=300&fit=crop', description: 'Pâtisseries marocaines assorties' },
      { name: 'Huile d\'Olive Vierge', price: 85, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop', description: 'Huile d\'olive extra vierge du Maroc' },
    ],
  },
];

const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop';

export default function LocalMarketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [cart, setCart] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategory);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.name === product.name);
      if (existing) {
        return prev.map((p) =>
          p.name === product.name ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productName, delta) => {
    setCart((prev) =>
      prev.map((p) =>
        p.name === productName
          ? { ...p, quantity: Math.max(0, p.quantity + delta) }
          : p
      ).filter((p) => p.quantity > 0)
    );
  };

  const removeFromCart = (productName) => {
    setCart((prev) => prev.filter((p) => p.name !== productName));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setPaymentStatus('loading');
    setPaymentError('');
    try {
      const res = await checkout(
        cart.map((item) => ({ name: item.name, price: item.price, quantity: item.quantity })),
        cartTotal,
        'MAD'
      );
      setClientSecret(res.clientSecret);
      setPaymentStatus('stripe');
    } catch (err) {
      setPaymentStatus('error');
      setPaymentError(err.message || 'Payment failed. Please try again.');
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentStatus('success');
    setCart([]);
  };

  const handlePaymentError = (msg) => {
    setPaymentStatus('error');
    setPaymentError(msg);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Store className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Marché Local</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Produits et artisans de la région</p>
        </div>
        {cartCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-2xl shadow-sm">
            <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">{cartCount}</span>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {CATEGORIES.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
              activeCategory === id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              activeCategory === id ? 'bg-white/15' : 'bg-slate-100 dark:bg-slate-700'
            }`}>
              <Icon className={`w-4 h-4 ${activeCategory === id ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
            </div>
            <div className="text-left">
              <p className="font-bold leading-tight">{label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {currentCategory && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {currentCategory.products.length} produit{currentCategory.products.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {currentCategory.products.map((product) => {
              const inCart = cart.find((p) => p.name === product.name);
              return (
                <div
                  key={product.name}
                  className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:scale-[1.02] transition-all duration-500"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-900">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl px-2.5 py-1 text-xs font-extrabold text-slate-800 dark:text-slate-200 shadow-sm">
                      {product.price} DH
                    </div>
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{product.name}</h3>
                      {product.description && (
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{product.description}</p>
                      )}
                    </div>
                    {inCart ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(product.name, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white w-6 text-center">{inCart.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.name, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-all duration-200 active:scale-[0.97]"
                      >
                        + Ajouter
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Cart & Checkout */}
      {cart.length > 0 && (
        <div className="mt-10 bg-white dark:bg-slate-800 rounded-3xl border border-emerald-200 dark:border-emerald-700/50 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Panier</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{cartCount} article{cartCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => setCart([])}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 mb-5">
            {cart.map((item) => (
              <div key={item.name} className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700/30 last:border-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-700 flex-shrink-0 shadow-sm">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{item.price} DH × {item.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0 ml-3">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">{item.price * item.quantity} DH</span>
                  <button
                    onClick={() => removeFromCart(item.name)}
                    className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700/30 pt-4">
            <div className="flex items-center justify-between mb-5">
              <span className="text-base font-extrabold text-slate-900 dark:text-white">Total</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{cartTotal} DH</span>
            </div>

            {paymentStatus === 'success' && (
              <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Paiement réussi !</p>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Votre commande a été confirmée.</p>
                </div>
              </div>
            )}

            {paymentStatus === 'error' && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-800 dark:text-red-300">Paiement échoué</p>
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">{paymentError}</p>
                </div>
              </div>
            )}

            {paymentStatus === 'stripe' && clientSecret ? (
              <StripeProvider clientSecret={clientSecret}>
                <StripeCheckout
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </StripeProvider>
            ) : paymentStatus === 'loading' ? (
              <button
                disabled
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2.5"
              >
                <Loader2 className="w-4 h-4 animate-spin" /> Traitement...
              </button>
            ) : (
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 disabled:from-emerald-300 disabled:to-emerald-300 dark:disabled:from-emerald-800 dark:disabled:to-emerald-800 text-white font-extrabold rounded-2xl transition-all duration-200 text-sm flex items-center justify-center gap-2.5 active:scale-[0.98] shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 disabled:shadow-none"
              >
                <CreditCard className="w-4 h-4" /> Payer {cartTotal} DH
              </button>
            )}

            {!user && (
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 text-center mt-2">Connectez-vous pour effectuer un paiement.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
