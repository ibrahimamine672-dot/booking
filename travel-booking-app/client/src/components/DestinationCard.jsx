import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, ChevronRight, Star } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=450&fit=crop';

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
      className={`group block bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] hover:scale-[1.02] transition-all duration-500 ${className}`}
    >
      {/* Image Container with fixed aspect ratio */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700">
        <img
          src={image || DEFAULT_IMAGE}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Deal badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-400/90 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-xl shadow-lg">
            <Star className="w-3 h-3 fill-slate-900" />
            {t('destinations.genius')}
          </span>
        </div>

        {/* Price */}
        {price && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="text-xs font-medium text-white/80">{t('destinations.from')} </span>
            <span className="text-2xl font-extrabold tracking-tight text-white">${price}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 truncate">
              {name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                {city}{city && country ? ', ' : ''}{country}
              </span>
            </div>
          </div>

          {/* Review Score */}
          {rating > 0 && (
            <div className="flex flex-col items-end flex-shrink-0">
              <div className={`review-score ${getReviewScoreClass(rating)}`}>
                {rating}
              </div>
              <span className="text-[0.625rem] font-semibold text-slate-400 dark:text-slate-500 mt-1">{t(`destinations.${getReviewLabel(rating).toLowerCase()}`)}</span>
            </div>
          )}
        </div>

        {description && (
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/30">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-[0.625rem] font-bold rounded-xl">
              {t('destinations.greatLocation')}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-300">
            {t('destinations.viewDeal')}
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </div>
      </div>
    </Link>
  );
}
