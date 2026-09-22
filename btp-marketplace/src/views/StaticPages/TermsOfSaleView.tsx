import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface TermsOfSaleViewProps {
  onBack: () => void;
}

export function TermsOfSaleView({ onBack }: TermsOfSaleViewProps) {
  return (
    <div className="min-h-screen bg-slate-950 pb-20 md:pb-0 relative text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center h-16 px-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 mr-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Conditions de vente et paiement</h1>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 mt-4">
        
        <div className="bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-white/5 space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-orange-500 mb-6">Conditions de vente et paiement</h2>
          
          <div className="space-y-6 text-slate-300">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white">1. Nature des transactions</h3>
              <p className="leading-relaxed">
                Notre plateforme agit exclusivement comme un intermédiaire de mise en relation entre professionnels (B2B). Nous ne sommes pas partie prenante dans les contrats de vente, de location ou de prestation de services conclus entre les utilisateurs.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white">2. Tarification des annonces</h3>
              <p className="leading-relaxed">
                L'inscription à la plateforme est gratuite. Cependant, la publication de certaines annonces ou la mise en avant de votre profil peut être soumise à des frais. Les tarifs applicables sont clairement indiqués avant toute validation de commande.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white">3. Modalités de paiement</h3>
              <p className="leading-relaxed">
                Le règlement des services payants de la plateforme s'effectue en ligne via nos partenaires de paiement sécurisés. Les factures sont émises électroniquement et disponibles dans votre espace client.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white">4. Paiement entre utilisateurs</h3>
              <p className="leading-relaxed">
                Les transactions financières liées à l'achat, la vente ou la location d'équipements se font directement entre les utilisateurs, en dehors de la plateforme. Nous recommandons la plus grande vigilance et l'utilisation de moyens de paiement tracés pour vos transactions.
              </p>
            </section>
            
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white">5. Politique de remboursement</h3>
              <p className="leading-relaxed">
                Les services de mise en avant et d'abonnement souscrits sur la plateforme ne sont pas remboursables une fois la prestation commencée, conformément à la législation en vigueur pour les services numériques B2B.
              </p>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}
