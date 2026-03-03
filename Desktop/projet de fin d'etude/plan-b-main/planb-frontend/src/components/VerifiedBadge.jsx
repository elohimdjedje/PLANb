import PropTypes from 'prop-types';
import { ShieldCheck } from 'lucide-react';

const BADGE_INFO = {
    identity_verified: { label: 'Identité vérifiée' },
    bailleur_certified: { label: 'Bailleur certifié' },
    vehicule_certified: { label: 'Vendeur auto certifié' },
    hotel_certified: { label: 'Établissement certifié' },
    manual_certified: { label: 'Certifié par l\'admin' },
};

// Mapping des catégories vers les labels
const CATEGORY_LABELS = {
    auto: 'Auto',
    immobilier: 'Immobilier',
    emploi: 'Emploi',
    services: 'Services',
    electronique: 'Électronique',
    mode: 'Mode',
    maison: 'Maison',
    loisirs: 'Loisirs',
};

/**
 * Génère un chemin SVG en forme de badge dentelé (sunburst / Twitter-style)
 * spikes : nombre de pointes, r1 : rayon intérieur, r2 : rayon extérieur
 */
function starburst(cx, cy, spikes, r1, r2) {
    const step = Math.PI / spikes;
    let d = '';
    for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? r2 : r1;
        const angle = i * step - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        d += (i === 0 ? 'M' : 'L') + x.toFixed(3) + ',' + y.toFixed(3);
    }
    return d + 'Z';
}

function TwitterBadgeSVG({ px }) {
    const path = starburst(50, 50, 14, 34, 48);
    return (
        <svg
            width={px}
            height={px}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
        >
            {/* Badge dentelé bleu */}
            <path d={path} fill="#3899E0" />

            {/* Coche blanche épaisse */}
            <polyline
                points="30,52 44,66 70,36"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
}

export const VerifiedBadge = ({ isVerified, badges = [], size = 'sm', className = '' }) => {
    if (!isVerified) return null;

    const sizePx = { xs: 14, sm: 18, md: 22, lg: 28, xl: 36 }[size] ?? 18;
    const mainBadge = badges?.length > 0 ? badges[0] : null;
    const badgeInfo = mainBadge ? BADGE_INFO[mainBadge] : null;
    const title = badgeInfo?.label || 'Utilisateur vérifié par Plan B';

    return (
        <span 
            title={title} 
            aria-label={title} 
            className={`inline-flex items-center flex-shrink-0 ${className}`}
            style={{ lineHeight: 0 }}
        >
            <TwitterBadgeSVG px={sizePx} />
        </span>
    );
};

export const BadgeList = ({ badges = [], size = 'sm' }) => {
    if (!badges || badges.length === 0) return null;

    const sizePx = { xs: 12, sm: 14, md: 16 }[size] ?? 14;
    const textSize = { xs: '10px', sm: '11px', md: '13px' }[size] ?? '11px';

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {badges.map(badge => {
                const info = BADGE_INFO[badge];
                if (!info) return null;
                return (
                    <span
                        key={badge}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: '#EBF5FF',
                            border: '1px solid #BEE0FF',
                            borderRadius: 999,
                            padding: '3px 10px',
                            fontSize: textSize,
                            fontWeight: 600,
                            color: '#3899E0',
                        }}
                    >
                        <TwitterBadgeSVG px={sizePx} />
                        {info.label}
                    </span>
                );
            })}
        </div>
    );
};

VerifiedBadge.propTypes = {
    isVerified: PropTypes.bool.isRequired,
    badges: PropTypes.arrayOf(PropTypes.string),
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    className: PropTypes.string,
};

/**
 * Badge contextuel : "Vendeur vérifié pour cette catégorie"
 * Option 2 du système de vérification par scope
 */
export const CategoryCertifiedBadge = ({ isCertified, category, size = 'sm', showLabel = true }) => {
    if (!isCertified) return null;

    const sizeClasses = {
        xs: 'text-xs px-1.5 py-0.5',
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
    };

    const iconSizes = {
        xs: 'w-3 h-3',
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    const categoryLabel = CATEGORY_LABELS[category?.toLowerCase()] || category;
    const title = `Vendeur vérifié pour ${categoryLabel}`;

    return (
        <span
            title={title}
            className={`inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 rounded-full font-medium ${sizeClasses[size] || sizeClasses.sm}`}
        >
            <ShieldCheck className={iconSizes[size] || iconSizes.sm} />
            {showLabel && <span>Vérifié {categoryLabel}</span>}
        </span>
    );
};

CategoryCertifiedBadge.propTypes = {
    isCertified: PropTypes.bool.isRequired,
    category: PropTypes.string,
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
    showLabel: PropTypes.bool,
};

export default VerifiedBadge;
