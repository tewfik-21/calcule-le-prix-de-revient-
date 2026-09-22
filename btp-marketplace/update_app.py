import os

app_file = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\App.tsx'

with open(app_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Add states for password recovery
if "const [isRecoveringPassword, setIsRecoveringPassword]" not in content:
    content = content.replace(
        "const [showAuthModal, setShowAuthModal] = useState(false);",
        "const [showAuthModal, setShowAuthModal] = useState(false);\n  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);\n  const [newPassword, setNewPassword] = useState('');"
    )

# Handle PASSWORD_RECOVERY event
old_auth_listener = """    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {"""

new_auth_listener = """    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveringPassword(true);
      }
      if (session?.user) {"""

content = content.replace(old_auth_listener, new_auth_listener)

# Add password recovery modal JSX
modal_jsx = """
      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
"""

recovery_modal_jsx = """
      {/* Password Recovery Modal */}
      {isRecoveringPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm relative">
            <h3 className="text-white font-bold text-center mb-4">
              {lang === 'ar' ? 'تعيين كلمة مرور جديدة' : 'Définir un nouveau mot de passe'}
            </h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const { error } = await supabase.auth.updateUser({ password: newPassword });
                if (error) throw error;
                alert(lang === 'ar' ? 'تم تحديث كلمة المرور بنجاح!' : 'Mot de passe mis à jour avec succès!');
                setIsRecoveringPassword(false);
              } catch (err: any) {
                alert(err.message);
              }
            }} className="space-y-4">
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder={lang === 'ar' ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}
                className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2 text-white text-sm"
              />
              <button
                type="submit"
                className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition"
              >
                {lang === 'ar' ? 'حفظ كلمة المرور' : 'Enregistrer le mot de passe'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
"""

content = content.replace(modal_jsx, recovery_modal_jsx)

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated App.tsx with password recovery modal!")
