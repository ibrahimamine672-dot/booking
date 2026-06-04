import { useState } from 'react';
import { checkout } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
      await checkout(
        cart.map((item) => ({ name: item.name, price: item.price, quantity: item.quantity })),
        cartTotal,
        'MAD'
      );
      setPaymentStatus('success');
      setCart([]);
    } catch (err) {
      setPaymentStatus('error');
      setPaymentError(err.message || 'Payment failed. Please try again.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
          <Store className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Marché Local</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Produits et artisans de la région</p>
        </div>
        {cartCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-sm">
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{cartCount}</span>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-medium transition-all duration-200 ${
              activeCategory === id
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className={`w-6 h-6 rounded-sm flex items-center justify-center ${
              activeCategory === id ? 'bg-white/15' : 'bg-gray-100 dark:bg-gray-600'
            }`}>
              <Icon className={`w-3.5 h-3.5 ${activeCategory === id ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
            </div>
            <div className="text-left">
              <p className="font-medium leading-tight">{label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {currentCategory && (
        <>
          <div className="flex items-center gap-1.5 mb-3">
            <Package className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{currentCategory.products.length} produit{currentCategory.products.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentCategory.products.map((product) => {
              const inCart = cart.find((p) => p.name === product.name);
              return (
                <div key={product.name} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-emerald-200 dark:hover:border-emerald-600 hover:shadow-sm transition-all duration-200">
                  <div className="relative h-32 overflow-hidden bg-gray-50 dark:bg-gray-900">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                      loading="lazy"
                    />
                    <div className="absolute top-1.5 right-1.5 bg-white/90 dark:bg-gray-800/90 rounded-sm px-1.5 py-0.5 text-[0.625rem] font-bold text-gray-700 dark:text-gray-200 shadow-sm">
                      {product.price} DH
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-0.5 line-clamp-1">{product.name}</h3>
                    {product.description && (
                      <p className="text-[0.625rem] text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">{product.description}</p>
                    )}
                    {inCart ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQuantity(product.name, -1)}
                          className="w-6 h-6 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 w-5 text-center">{inCart.quantity}</span>
                        <button onClick={() => updateQuantity(product.name, 1)}
                          className="w-6 h-6 flex items-center justify-center bg-emerald-600 text-white rounded-sm hover:bg-emerald-700 transition-colors">
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(product)}
                        className="text-[0.625rem] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2 py-1 rounded-sm transition-colors w-full">
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
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-700 p-5 transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Panier</h3>
                <p className="text-[0.625rem] text-gray-500 dark:text-gray-400">{cartCount} article{cartCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button onClick={() => setCart([])} className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {cart.map((item) => (
              <div key={item.name} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded overflow-hidden bg-gray-50 dark:bg-gray-700 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                    <p className="text-[0.625rem] text-gray-400 dark:text-gray-500">{item.price} DH × {item.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{item.price * item.quantity} DH</span>
                  <button onClick={() => removeFromCart(item.name)} className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-100">Total</span>
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{cartTotal} DH</span>
            </div>

            {paymentStatus === 'success' && (
              <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-green-800 dark:text-green-300">Paiement réussi !</p>
                  <p className="text-[0.625rem] text-green-600 dark:text-green-400">Votre commande a été confirmée.</p>
                </div>
              </div>
            )}

            {paymentStatus === 'error' && (
              <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-800 dark:text-red-300">Paiement échoué</p>
                  <p className="text-[0.625rem] text-red-600 dark:text-red-400">{paymentError}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={paymentStatus === 'loading'}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 dark:disabled:bg-emerald-800 text-white font-semibold rounded-sm transition-all text-xs flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              {paymentStatus === 'loading' ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Traitement...</>
              ) : !user ? (
                <><CreditCard className="w-3.5 h-3.5" /> Connectez-vous pour payer</>
              ) : (
                <><CreditCard className="w-3.5 h-3.5" /> Payer {cartTotal} DH</>
              )}
            </button>

            {!user && (
              <p className="text-[0.625rem] text-gray-400 dark:text-gray-500 text-center mt-1.5">Connectez-vous pour effectuer un paiement.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
