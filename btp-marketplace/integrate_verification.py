import re

# 1. Update SideMenu.tsx
with open('src/components/SideMenu.tsx', 'r', encoding='utf-8') as f:
    sidemenu = f.read()

# Add a prop to SideMenuProps for onVerificationSelect
sidemenu = sidemenu.replace(
    "onFavoritesSelect?: () => void;",
    "onFavoritesSelect?: () => void;\n  onVerificationSelect?: () => void;"
)

# Add onVerificationSelect to SideMenu component arguments
sidemenu = sidemenu.replace(
    "onFavoritesSelect,",
    "onFavoritesSelect,\n  onVerificationSelect,"
)

# Add the "Verification Center" button after "Mes annonces" or "Mes Favoris"
button_to_insert = """            <button 
              onClick={() => {
                onClose();
                onVerificationSelect?.();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <span className="font-bold text-slate-300 group-hover:text-white transition">
                  {lang === 'ar' ? 'توثيق الحساب' : 'Centre de Vérification'}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition" />
            </button>
"""

# Find where to insert it (after My Ads button which uses <Tags className="h-4.5 w-4.5" />)
sidemenu = sidemenu.replace(
    "import { X, LogOut, ChevronRight, Tags, User, Heart, Globe } from 'lucide-react';",
    "import { X, LogOut, ChevronRight, Tags, User, Heart, Globe, ShieldCheck } from 'lucide-react';"
)

# Let's insert it right after the Favorites button
sidemenu = re.sub(
    r'(<Heart className="h-4\.5 w-4\.5" />\s*</div>\s*<span className="font-bold text-slate-300 group-hover:text-white transition">\s*\{lang === \'ar\' \? \'المفضلة\' : \'Mes Favoris\'\}\s*</span>\s*</div>\s*<ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition" />\s*</button>)',
    r'\1\n' + button_to_insert,
    sidemenu
)

with open('src/components/SideMenu.tsx', 'w', encoding='utf-8') as f:
    f.write(sidemenu)


# 2. Update App.tsx
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app = f.read()

app = app.replace(
    "const [showAuthModal, setShowAuthModal] = useState(false);",
    "const [showAuthModal, setShowAuthModal] = useState(false);\n  const [showVerificationModal, setShowVerificationModal] = useState(false);"
)

app = app.replace(
    "MyAdsModal\n} from './components/modals';",
    "MyAdsModal,\n  VerificationModal\n} from './components/modals';"
)

app = app.replace(
    "onFavoritesSelect={() => setShowAuthModal(true)}",
    "onFavoritesSelect={() => setShowAuthModal(true)}\n        onVerificationSelect={() => setShowVerificationModal(true)}"
)

# App.tsx might have `onFavoritesSelect` passed when user is logged in
app = app.replace(
    "onFavoritesSelect={() => setShowAuthModal(true)}", 
    "onFavoritesSelect={() => setShowAuthModal(true)}\n        onVerificationSelect={() => setShowVerificationModal(true)}"
)

# Wait, the logged in SideMenu
app = re.sub(
    r'(<SideMenu.*?user=\{user\}.*?onFavoritesSelect=\{.*?\})',
    r'\1\n        onVerificationSelect={() => setShowVerificationModal(true)}',
    app,
    flags=re.DOTALL
)

# Insert VerificationModal at the bottom
verification_modal_tsx = """
      {showVerificationModal && (
        <VerificationModal
          onClose={() => setShowVerificationModal(false)}
          user={user}
          lang={lang}
          onUpgrade={() => setShowPremiumModal(true)}
        />
      )}
"""

app = app.replace(
    "{showAuthModal && (",
    verification_modal_tsx + "\n      {showAuthModal && ("
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app)

print("Integration complete.")
