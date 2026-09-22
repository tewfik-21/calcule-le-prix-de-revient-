import os

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\components\SideMenu.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add onAdminSelect to Props
content = content.replace("onStaticPageSelect?: (page: 'how_to_advertise' | 'terms_of_use' | 'terms_of_sale' | 'contact') => void;\n}", "onStaticPageSelect?: (page: 'how_to_advertise' | 'terms_of_use' | 'terms_of_sale' | 'contact') => void;\n  onAdminSelect?: () => void;\n}")

# 2. Add onAdminSelect to component args
content = content.replace("onStaticPageSelect\n}) => {", "onStaticPageSelect,\n  onAdminSelect\n}) => {")

# 3. Import Shield for Admin Panel button
content = content.replace("import { X, LogOut, ChevronRight, Tags, User, Heart, Globe, ShieldCheck } from 'lucide-react';", "import { X, LogOut, ChevronRight, Tags, User, Heart, Globe, ShieldCheck, Shield } from 'lucide-react';")

# 4. Insert Admin Panel button after Profile button
profile_btn_str = """
            <button 
              onClick={onLogin}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5" />
                <span className="font-medium">{t.loginButton || 'Se connecter'}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
"""
if profile_btn_str not in content:
    # Look for the user block
    pass

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Props added")
