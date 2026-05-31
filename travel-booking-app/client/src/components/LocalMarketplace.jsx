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
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'cafe',
    label: 'Café / Salon de thé',
    icon: Coffee,
    description: 'Délices et boissons locales',
    products: [
      {
        name: 'Espresso',
        price: 15,
        image:
          'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=300&h=300&fit=crop',
        description: 'Café corsé à l\'italienne',
      },
      {
        name: 'Croissant',
        price: 8,
        image:
          'https://images.unsplash.com/photo-1555507036-ab1f4038028a?w=300&h=300&fit=crop',
        description: 'Viennoiserie feuilletée au beurre',
      },
      {
        name: 'Thé à la menthe',
        price: 12,
        image:
          'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=300&fit=crop',
        description: 'Thé vert frais à la menthe marocaine',
      },
      {
        name: 'Pain au chocolat',
        price: 10,
        image:
          'https://images.unsplash.com/photo-1544616326-af2d458c2a9c?w=300&h=300&fit=crop',
        description: 'Pâte feuilletée fourrée au chocolat',
      },
    ],
  },
  {
    id: 'clothing',
    label: 'Boutique de vêtements',
    icon: Shirt,
    description: 'Mode traditionnelle et moderne',
    products: [
      {
        name: 'T-shirt Artisanal',
        price: 180,
        image:
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
        description: 'T-shirt en coton bio fait main',
      },
      {
        name: 'Djellaba Traditionnelle',
        price: 550,
        image:
          'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=300&fit=crop',
        description: 'Veste longue traditionnelle brodée',
      },
      {
        name: 'Caftan de Soirée',
        price: 1200,
        image:
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&h=300&fit=crop',
        description: 'Caftan élégant en soie et dentelle',
      },
      {
        name: 'Babouches en Cuir',
        price: 250,
        image:
          'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&h=300&fit=crop',
        description: 'Chaussures traditionnelles marocaines',
      },
    ],
  },
  {
    id: 'grocery',
    label: 'Supermarché / Épicerie',
    icon: ShoppingBag,
    description: 'Produits locaux et essentiels',
    products: [
      {
        name: 'Eau Minérale',
        price: 5,
        image:
          'https://images.unsplash.com/photo-1561553590-56e0b9a28f8e?w=300&h=300&fit=crop',
        description: 'Bouteille d\'eau 1.5L',
      },
      {
        name: 'Snacks Salés',
        price: 15,
        image:
          'https://images.unsplash.com/photo-1621447504864-d8686e77898d?w=300&h=300&fit=crop',
        description: 'Mélange de biscuits et crackers',
      },
      {
        name: 'Briwates & Pâtisserie',
        price: 35,
        image:
          'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=300&fit=crop',
        description: 'Pâtisseries marocaines assorties',
      },
      {
        name: 'Huile d\'Olive Vierge',
        price: 85,
        image:
          'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop',
        description: 'Huile d\'olive extra vierge du Maroc',
      },
    ],
  },
];

const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop';

export default function LocalMarketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [cart, setCart] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'loading' | 'success' | 'error'
  const [paymentError, setPaymentError] = useState('');

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategory);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.name === product.name);
      if (existing) {
        return prev.map((p) =>
          p.name === product.name
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productName) => {
    setCart((prev) => prev.filter((p) => p.name !== productName));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
    <div className="animate-fadeIn">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Store className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Marché Local</h2>
          <p className="text-sm text-gray-500">
            Découvrez les produits et artisans de la région
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeCategory === id
                ? 'bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20 shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                activeCategory === id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="font-semibold leading-tight">{label}</p>
              <p
                className={`text-xs mt-0.5 ${
                  activeCategory === id ? 'text-emerald-500' : 'text-gray-400'
                }`}
              >
                {description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {currentCategory && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {currentCategory.products.length} produit
              {currentCategory.products.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentCategory.products.map((product) => (
              <div
                key={product.name}
                className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 animate-fadeIn"
              >
                {/* Product Image */}
                <div className="relative h-36 sm:h-40 overflow-hidden bg-gray-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = DEFAULT_PRODUCT_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Price Badge */}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-emerald-600 shadow-sm">
                    {product.price} DH
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-600">
                      {product.price} DH
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors duration-200"
                    >
                      {cart.find((p) => p.name === product.name)
                        ? `Ajouté (${cart.find((p) => p.name === product.name).quantity})`
                        : 'Ajouter'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Cart & Checkout */}
      {cart.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 animate-slideUp">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Panier ({cart.reduce((s, i) => s + i.quantity, 0)} articles)
              </h3>
            </div>
            <button
              onClick={() => setCart([])}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Vider
            </button>
          </div>

          <div className="space-y-3 mb-4">
            {cart.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.price} DH × {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {item.price * item.quantity} DH
                  </span>
                  <button
                    onClick={() => removeFromCart(item.name)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-emerald-600">
                {cartTotal} DH
              </span>
            </div>

            {/* Payment Status Feedback */}
            {paymentStatus === 'success' && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 text-sm">
                    Paiement réussi ! 🎉
                  </p>
                  <p className="text-xs text-green-600">
                    Votre commande a été confirmée.
                  </p>
                </div>
              </div>
            )}

            {paymentStatus === 'error' && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800 text-sm">
                    Paiement échoué
                  </p>
                  <p className="text-xs text-red-600">{paymentError}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={paymentStatus === 'loading'}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              {paymentStatus === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Traitement...
                </>
              ) : !user ? (
                <>
                  <CreditCard className="w-5 h-5" />
                  Connectez-vous pour payer
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Payer {cartTotal} DH
                </>
              )}
            </button>

            {!user && (
              <p className="text-xs text-gray-400 text-center mt-2">
                Vous devez être connecté pour effectuer un paiement.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
