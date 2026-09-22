import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app = f.read()

# Add handlers after handlePostAdButtonClick
handlers = """  const handleAddStoreClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!user.isPremium) {
      alert(lang === 'ar' ? 'إنشاء المتاجر ميزة حصرية لأصحاب الاشتراك Premium. يرجى ترقية حسابك!' : 'La création de boutiques est exclusive aux abonnés Premium. Veuillez mettre à niveau votre compte!');
      setShowPremiumModal(true);
      return;
    }
    setShowAddStoreModal(true);
  };

  const handleAddTenderClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const userTenders = tenders.filter(t => t.authorId === user.id).length;
    const maxTenders = user.isPremium ? 5 : 1;
    if (userTenders >= maxTenders) {
      alert(lang === 'ar' ? `لقد وصلت للحد الأقصى (${maxTenders} مناقصات). ${!user.isPremium ? 'يرجى الترقية!' : ''}` : `Vous avez atteint la limite de ${maxTenders} appels d'offres. ${!user.isPremium ? 'Passez au Premium!' : ''}`);
      if (!user.isPremium) setShowPremiumModal(true);
      return;
    }
    setShowAddTenderModal(true);
  };

  const handleAddAuctionClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const userAuctions = auctions.filter(a => a.sellerId === user.id).length;
    const maxAuctions = user.isPremium ? 5 : 1;
    if (userAuctions >= maxAuctions) {
      alert(lang === 'ar' ? `لقد وصلت للحد الأقصى (${maxAuctions} مزادات). ${!user.isPremium ? 'يرجى الترقية!' : ''}` : `Vous avez atteint la limite de ${maxAuctions} enchères. ${!user.isPremium ? 'Passez au Premium!' : ''}`);
      if (!user.isPremium) setShowPremiumModal(true);
      return;
    }
    setShowAddAuctionModal(true);
  };

  const handleAddJobClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    // We don't check limits here because inside AddJobModal they choose between Offer and Request.
    // Instead, we will pass a custom prop to AddJobModal or we can check here by counting both and letting AddJobModal handle the specific error.
    // But actually, we can just check if they reached both limits. It's better to let AddJobModal open, but we will modify AddJobModal later if needed.
    // Let's just open the modal. Inside App.tsx handlePostJob we can enforce it, or inside AddJobModal.
    // For now, let's just open it.
    setShowAddJobModal(true);
  };
"""

app = app.replace(
    "const handlePostAdButtonClick = () => {",
    handlers + "\n  // Handling Post Ad click\n  const handlePostAdButtonClick = () => {"
)

# Update StoresView in App.tsx
stores_view_old = """          {activeView === 'stores' && (
            <StoresView
              mobileView={mobileView}
              setActiveView={setActiveView}
              setSelectedStore={setSelectedStore}
              t={t}
            />
          )}"""

stores_view_new = """          {activeView === 'stores' && (
            <StoresView
              mobileView={mobileView}
              setActiveView={setActiveView}
              setSelectedStore={setSelectedStore}
              t={t}
              onAddStoreClick={handleAddStoreClick}
            />
          )}"""
app = app.replace(stores_view_old, stores_view_new)

# Update TendersView
tenders_view_old = """          {activeView === 'tenders' && (
            <TendersView
              mobileView={mobileView}
              tenders={tenders}
              onAddTenderClick={() => {
                if (!user) setShowAuthModal(true);
                else setShowAddTenderModal(true);
              }}
              t={t}
            />
          )}"""

tenders_view_new = """          {activeView === 'tenders' && (
            <TendersView
              mobileView={mobileView}
              tenders={tenders}
              onAddTenderClick={handleAddTenderClick}
              t={t}
            />
          )}"""
app = app.replace(tenders_view_old, tenders_view_new)

# Update AuctionsView
app = app.replace(
    "onAddAuctionClick={() => { if (!user) setShowAuthModal(true); else setShowAddAuctionModal(true); }}",
    "onAddAuctionClick={handleAddAuctionClick}"
)

# Update JobsView
app = app.replace(
    "onAddJobClick={() => { if (!user) setShowAuthModal(true); else setShowAddJobModal(true); }}",
    "onAddJobClick={handleAddJobClick}"
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app)

print("App.tsx limits updated.")
