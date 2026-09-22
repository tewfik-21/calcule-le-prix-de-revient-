import os

modal_file = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\components\modals\AuthModal.tsx'

with open(modal_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add states
content = content.replace(
    "const [isSignUp, setIsSignUp] = useState(false);",
    "const [isSignUp, setIsSignUp] = useState(false);\n  const [isOtpStep, setIsOtpStep] = useState(false);\n  const [otpCode, setOtpCode] = useState('');"
)

# 2. Update handleSubmit
old_submit = """      } else {
        // Phone mockup fallback for now
        onLogin(authPhone, 'phone');
      }"""
new_submit = """      } else {
        if (!isOtpStep) {
          setTimeout(() => {
            setIsOtpStep(true);
            setLoading(false);
          }, 800);
          return;
        } else {
          if (otpCode.length < 4) {
             throw new Error(t('login') !== 'Se Connecter' ? 'رمز التحقق قصير جداً' : 'Code de vérification trop court');
          }
          onLogin(authPhone, 'phone');
        }
      }"""
content = content.replace(old_submit, new_submit)

# 3. Update JSX
old_jsx = """          {authMethod === 'phone' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Numéro de téléphone *</label>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    placeholder="0555 00 00 00"
                    value={authPhone}
                    onChange={e => setAuthPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-semibold"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}"""

new_jsx = """          {authMethod === 'phone' && (
            <div className="space-y-3">
              {!isOtpStep ? (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Numéro de téléphone *</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="tel"
                      required
                      placeholder="0555 00 00 00"
                      value={authPhone}
                      onChange={e => setAuthPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-semibold"
                      dir="ltr"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    {t('login') !== 'Se Connecter' ? 'رمز التحقق (OTP)' : 'Code de vérification (OTP)'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="1234"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-550 focus:border-orange-500 focus:outline-none font-semibold tracking-widest text-center"
                      dir="ltr"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-center mt-2 font-semibold text-orange-500/80">
                    {t('login') !== 'Se Connecter' ? '(وضع تجريبي: أدخل أي 4 أرقام)' : '(Mode démo: Entrez 4 chiffres)'}
                  </p>
                </div>
              )}
            </div>
          )}"""
content = content.replace(old_jsx, new_jsx)

# 4. Change login button text to show Verify if it's OTP step
old_btn = """            {isSignUp ? "Créer un compte" : t('login')}
          </button>"""
new_btn = """            {authMethod === 'phone' && isOtpStep ? (t('login') !== 'Se Connecter' ? 'تحقق' : 'Vérifier') : (isSignUp ? "Créer un compte" : t('login'))}
          </button>"""
content = content.replace(old_btn, new_btn)

with open(modal_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Phone OTP logic added successfully!")
