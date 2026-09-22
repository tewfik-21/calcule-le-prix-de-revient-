import os

modal_file = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\components\modals\AuthModal.tsx'

with open(modal_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Add new states
old_states = """  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');"""

new_states = """  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);"""
content = content.replace(old_states, new_states)

# Add handleResetPassword function
reset_func = """  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setResetEmailSent(true);
    } catch (err: any) {
      setErrorMsg(err.message === 'User not found' ? 'Utilisateur non trouvé' : 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };"""
content = content.replace("const handleSubmit = async (e: React.FormEvent) => {", reset_func + "\n\n  const handleSubmit = async (e: React.FormEvent) => {")

# Add "Forgot Password" link
old_pass_input = """className="w-full bg-slate-900 border border-white/5 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-semibold"
                  />
                </div>
              </div>"""

new_pass_input = """className="w-full bg-slate-900 border border-white/5 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-semibold"
                  />
                </div>
                {!isSignUp && (
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => setIsResettingPassword(true)}
                      className="text-[10px] text-orange-500 hover:text-orange-400 font-semibold"
                    >
                      {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
                    </button>
                  </div>
                )}
              </div>"""
content = content.replace(old_pass_input, new_pass_input)

# Replace the form content if isResettingPassword is true
old_form = """        <form onSubmit={handleSubmit} className="space-y-4">"""

new_form = """        {isResettingPassword ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <h3 className="text-white font-bold text-center mb-2">
              {lang === 'ar' ? 'استعادة كلمة المرور' : 'Réinitialiser le mot de passe'}
            </h3>
            
            {resetEmailSent ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-emerald-400 text-sm font-semibold mb-2">
                  {lang === 'ar' ? 'تم إرسال الرابط إلى بريدك الإلكتروني.' : 'Lien envoyé à votre adresse e-mail.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsResettingPassword(false);
                    setResetEmailSent(false);
                  }}
                  className="text-white text-xs hover:underline"
                >
                  {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Retour à la connexion'}
                </button>
              </div>
            ) : (
              <>
                <p className="text-slate-400 text-xs text-center">
                  {lang === 'ar' 
                    ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك.' 
                    : 'Entrez votre e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.'}
                </p>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="exemple@email.com"
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-semibold"
                    />
                  </div>
                </div>
                
                {errorMsg && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-semibold text-rose-400">{errorMsg}</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading || !authEmail}
                  className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    lang === 'ar' ? 'إرسال الرابط' : 'Envoyer le lien'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsResettingPassword(false)}
                  className="w-full py-2 text-slate-400 hover:text-white text-xs font-bold transition mt-2"
                >
                  {lang === 'ar' ? 'العودة' : 'Retour'}
                </button>
              </>
            )}
          </form>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">"""

content = content.replace(old_form, new_form)

# Close the new ternary operator at the end of the form
old_form_close = """          <div className="mt-6">
            <p className="text-[10px] text-center text-slate-500">
              {t.accept_terms} <a href="#" className="text-orange-500 hover:text-orange-400 font-semibold">{t.terms}</a>
            </p>
          </div>
        </form>"""

new_form_close = """          <div className="mt-6">
            <p className="text-[10px] text-center text-slate-500">
              {t.accept_terms} <a href="#" className="text-orange-500 hover:text-orange-400 font-semibold">{t.terms}</a>
            </p>
          </div>
        </form>
        )}"""

content = content.replace(old_form_close, new_form_close)

with open(modal_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated AuthModal.tsx with reset password logic!")
