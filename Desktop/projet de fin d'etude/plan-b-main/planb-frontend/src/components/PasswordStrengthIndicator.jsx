// PasswordStrengthIndicator - Indicateur de force du mot de passe
import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

const PASSWORD_RULES = [
    { id: 'length', label: 'Au moins 8 caractères', test: (p) => p.length >= 8 },
    { id: 'upper', label: 'Une lettre majuscule', test: (p) => /[A-Z]/.test(p) },
    { id: 'lower', label: 'Une lettre minuscule', test: (p) => /[a-z]/.test(p) },
    { id: 'digit', label: 'Un chiffre', test: (p) => /[0-9]/.test(p) },
    { id: 'special', label: 'Un caractère spécial (!@#$%...)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(p) },
];

export function validatePassword(password) {
    return PASSWORD_RULES.every((rule) => rule.test(password));
}

export function getPasswordErrors(password) {
    return PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => rule.label);
}

function PasswordStrengthIndicator({ password }) {
    const results = useMemo(() => {
        return PASSWORD_RULES.map((rule) => ({
            ...rule,
            passed: rule.test(password),
        }));
    }, [password]);

    const passedCount = results.filter((r) => r.passed).length;
    const strength = passedCount / PASSWORD_RULES.length;

    const strengthLabel = strength === 1 ? 'Fort' : strength >= 0.6 ? 'Moyen' : 'Faible';
    const strengthColor = strength === 1 ? 'bg-green-500' : strength >= 0.6 ? 'bg-yellow-500' : 'bg-red-500';

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            {/* Barre de force */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${strengthColor} transition-all duration-300`}
                        style={{ width: `${strength * 100}%` }}
                    />
                </div>
                <span className={`text-xs font-medium ${strength === 1 ? 'text-green-600' : strength >= 0.6 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {strengthLabel}
                </span>
            </div>

            {/* Règles détaillées */}
            <ul className="space-y-1">
                {results.map((rule) => (
                    <li key={rule.id} className={`flex items-center gap-1.5 text-xs ${rule.passed ? 'text-green-600' : 'text-gray-400'}`}>
                        {rule.passed ? (
                            <Check className="w-3 h-3 flex-shrink-0" />
                        ) : (
                            <X className="w-3 h-3 flex-shrink-0" />
                        )}
                        {rule.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PasswordStrengthIndicator;
