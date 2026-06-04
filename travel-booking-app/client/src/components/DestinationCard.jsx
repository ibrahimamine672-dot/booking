import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, ChevronRight } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop';

function getReviewScoreClass(rating) {
  if (rating >= 4.5) return 'review-score-excellent';
  if (rating >= 3.5) return 'review-score-good';
  if (rating >= 2.5) return 'review-score-fair';
  if (rating > 0) return 'review-score-poor';
  return 'review-score-none';
}

function getReviewLabel(rating) {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 3.5) return 'Good';
  if (rating >= 2.5) return 'Fair';
  if (rating > 0) return 'Poor';
  return '';
}

export default function DestinationCard({ destination }) {
  const { t } = useTranslation();
  const { _id, name, country, city, description, image, price, rating } = destination;
  const { ref, className } = useScrollReveal({ threshold: 0.1 });

  return (
    <Link
      ref={ref}
      to={`/destinations/${_id}`}
      className={`group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-primary-200 dark:hover:border-primary-600 hover:shadow-booking-card-hover dark:hover:shadow-primary-900/30 transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image || DEFAULT_IMAGE}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Deal badge */}
        <div className="absolute top-2 left-2">
          <span className="deal-badge deal-badge-genius">{t('destinations.genius')}</span>
        </div>

        {/* Price */}
        {price && (
          <div className="absolute bottom-2 left-2">
            <span className="text-xs text-white/70 booking-price-from">{t('destinations.from')} </span>
            <span className="text-lg font-bold text-white">${price}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-0.5 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors truncate">
              {name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{city}{city && country ? ', ' : ''}{country}</span>
            </div>
          </div>

          {/* Review Score */}
          {rating > 0 && (
            <div className="flex flex-col items-end flex-shrink-0">
              <div className={`review-score ${getReviewScoreClass(rating)}`}>
                {rating}
              </div>
              <span className="text-[0.625rem] text-gray-400 dark:text-gray-500 mt-0.5 font-medium">{t(`destinations.${getReviewLabel(rating).toLowerCase()}`)}</span>
            </div>
          )}
        </div>

        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
            {description}
          </p>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <span className="deal-badge deal-badge-location text-[0.625rem]">{t('destinations.greatLocation')}</span>
          </div>
          <span className="text-xs font-medium text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 flex items-center gap-0.5">
            {t('destinations.viewDeal')}
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
