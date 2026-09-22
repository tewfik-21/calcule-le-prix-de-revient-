import React, { useState } from 'react';
import { Truck, Search, ShieldCheck, ChevronRight } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: () => void;
  t: (key: string) => string;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete, t }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const handleComplete = () => {
    setIsExiting(true);
    setTimeout(onComplete, 400); // Wait for exit animation
  };

  const nextSlide = () => {
    if (currentSlide === slides.length - 1) {
      handleComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const slides = [
    {
      id: 1,
      icon: <Truck className="w-20 h-20 text-orange-500" />,
      title: "Bienvenue sur Binadz",
      description: "Le premier carrefour numérique en Algérie dédié aux professionnels du Bâtiment et des Travaux Publics.",
      color: "from-orange-500/20 to-transparent"
    },
    {
      id: 2,
      icon: <Search className="w-20 h-20 text-blue-500" />,
      title: "Trouvez ce dont vous avez besoin",
      description: "Achetez, louez ou vendez des engins lourds, des matériaux de construction et trouvez des appels d'offres facilement.",
      color: "from-blue-500/20 to-transparent"
    },
    {
      id: 3,
      icon: <ShieldCheck className="w-20 h-20 text-emerald-500" />,
      title: "Transactions Sécurisées",
      description: "Connectez-vous directement avec des fournisseurs et des clients vérifiés, sans intermédiaires cachés.",
      color: "from-emerald-500/20 to-transparent"
    }
  ];

  return (
    <div className={`fixed inset-0 z-50 bg-slate-950 flex flex-col transition-opacity duration-400 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Top Bar with Skip */}
      <div className="flex justify-end p-6 z-10">
        <button 
          onClick={handleComplete}
          className="text-slate-400 font-bold hover:text-white transition-colors"
        >
          Ignorer
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Decorative Background Blob */}
        <div className={`absolute inset-0 bg-gradient-to-b ${slides[currentSlide].color} opacity-50 transition-colors duration-700 ease-in-out blur-3xl`} />
        
        {/* Slide Content */}
        <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center">
          <div className="mb-10 p-6 bg-slate-900/50 rounded-full border border-white/5 backdrop-blur-sm shadow-2xl transform transition-transform duration-500 hover:scale-105">
            {slides[currentSlide].icon}
          </div>
          
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight leading-tight">
            {slides[currentSlide].title}
          </h2>
          
          <p className="text-slate-400 text-lg leading-relaxed font-medium">
            {slides[currentSlide].description}
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-8 pb-12 z-10 flex flex-col items-center gap-8">
        
        {/* Pagination Dots */}
        <div className="flex gap-3">
          {slides.map((_, index) => (
            <div 
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'w-8 bg-orange-500' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={nextSlide}
          className="w-full max-w-sm bg-orange-500 hover:bg-orange-600 text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(249,115,22,0.3)]"
        >
          <span>{currentSlide === slides.length - 1 ? "Commencer" : "Suivant"}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
