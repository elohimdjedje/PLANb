import { Star } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Composant d'affichage de notation par étoiles
 * Affiche les étoiles, le score et le nombre d'avis
 */
export const StarRating = ({
    rating,
    reviewsCount = 0,
    showCount = true,
    size = 'md',
    showScore = true
}) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; // Arrondir à 0.5 près

    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8'
    };

    const starClass = sizeClasses[size];

    // Générer les 5 étoiles
    for (let i = 1; i <= 5; i++) {
        if (i <= roundedRating) {
            // Étoile pleine
            stars.push(
                <Star
                    key={i}
                    className={`${starClass} fill-yellow-400 text-yellow-400`}
                />
            );
        } else if (i - 0.5 === roundedRating) {
            // Demi-étoile
            stars.push(
                <Star
                    key={i}
                    className={`${starClass} fill-yellow-400/50 text-yellow-400`}
                />
            );
        } else {
            // Étoile vide
            stars.push(
                <Star
                    key={i}
                    className={`${starClass} text-gray-300`}
                />
            );
        }
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex gap-0.5">{stars}</div>
            {showScore && (
                <span className="font-semibold text-gray-900">
                    {rating.toFixed(1)}
                </span>
            )}
            {showCount && reviewsCount > 0 && (
                <span className="text-sm text-gray-500">
                    ({reviewsCount} {reviewsCount === 1 ? 'avis' : 'avis'})
                </span>
            )}
        </div>
    );
};

StarRating.propTypes = {
    rating: PropTypes.number.isRequired,
    reviewsCount: PropTypes.number,
    showCount: PropTypes.bool,
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    showScore: PropTypes.bool
};

export default StarRating;
