import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Onboarding Tour Component for new users
function OnboardingTour() {
    const [currentStep, setCurrentStep] = useState(0);
    const [showTour, setShowTour] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const tourSteps = [
        {
            title: "Bienvenue sur PlanB ! 🎉",
            message: "Découvrez la première plateforme de petites annonces pour l'Afrique. Laissez-nous vous guider !",
            icon: "🏠",
            position: "center"
        },
        {
            title: "Parcourez les annonces",
            message: "Explorez des milliers d'annonces dans l'immobilier, les véhicules et les locations de vacances.",
            icon: "🔍",
            position: "center"
        },
        {
            title: "Publiez vos annonces",
            message: "Cliquez sur 'Déposer une annonce' pour vendre ou louer vos biens facilement.",
            icon: "📝",
            position: "center"
        },
        {
            title: "Complétez votre profil",
            message: "Important : Ajoutez votre numéro de téléphone et email dans votre profil pour que les acheteurs puissent vous contacter !",
            icon: "👤",
            position: "center",
            action: () => navigate('/profile')
        }
    ];

    useEffect(() => {
        // Check if user just registered (flag set during registration)
        const isNewUser = localStorage.getItem('isNewUser');
        const hasSeenTour = localStorage.getItem('hasSeenOnboarding');
        
        if (isNewUser === 'true' && !hasSeenTour) {
            setShowTour(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTour();
        }
    };

    const handleSkip = () => {
        completeTour();
    };

    const completeTour = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        localStorage.removeItem('isNewUser');
        setShowTour(false);
        // Execute action if present on last step
        if (tourSteps[currentStep].action) {
            tourSteps[currentStep].action();
        }
    };

    if (!showTour) return null;

    const step = tourSteps[currentStep];

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
                {/* Progress indicator */}
                <div className="flex gap-2 mb-6">
                    {tourSteps.map((_, index) => (
                        <div 
                            key={index}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                                index <= currentStep ? 'bg-orange-500' : 'bg-gray-200'
                            }`}
                        />
                    ))}
                </div>

                {/* Icon */}
                <div className="text-6xl text-center mb-4">{step.icon}</div>

                {/* Content */}
                <h2 className="text-xl font-bold text-gray-900 text-center mb-3">{step.title}</h2>
                <p className="text-gray-600 text-center mb-8">{step.message}</p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSkip}
                        className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Passer
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                        {currentStep === tourSteps.length - 1 ? 'Terminer' : 'Suivant'}
                    </button>
                </div>

                {/* Step counter */}
                <p className="text-center text-sm text-gray-400 mt-4">
                    {currentStep + 1} / {tourSteps.length}
                </p>
            </div>
        </div>
    );
}

export default OnboardingTour;
