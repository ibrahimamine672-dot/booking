import { Link } from 'react-router-dom';
import { MapPin, Star, ChevronRight } from 'lucide-react';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop';

export default function DestinationCard({ destination }) {
  const { _id, name, country, city, description, image, price, rating } = destination;

  return (
    <Link
      to={`/destinations/${_id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={image || DEFAULT_IMAGE}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Rating Badge */}
        {rating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-sm font-semibold text-amber-600 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            {rating}
          </div>
        )}

        {/* Price Badge */}
        {price && (
          <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
            ${price}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
          <MapPin className="w-3.5 h-3.5" />
          {city}, {country}
        </div>
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {description}
          </p>
        )}
        <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
          View Details
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
