import os

file_path = r'c:\Users\BEDRI KHAOULA\Desktop\01\Calculateur-Prix-de-Revient-Carriere\btp-marketplace\src\components\SideMenu.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

admin_btn_code = """
            {user?.role === 'admin' && (
              <button 
                onClick={onAdminSelect}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors mt-2"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">{lang === 'ar' ? 'لوحة تحكم المسؤول' : lang === 'fr' ? 'Panneau Admin' : 'Admin Panel'}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            )}
"""

# Find the profile button to insert after it.
target_str = """className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"\n            >\n              <div className="flex items-center gap-3">\n                <User className="w-5 h-5" />\n                <span className="font-medium">{t.loginButton || 'Se connecter'}</span>\n              </div>\n              <ChevronRight className="w-4 h-4 opacity-50" />\n            </button>"""

if "onAdminSelect" in admin_btn_code and admin_btn_code not in content:
    # Let's just insert it before the closing div of the profile section
    # Let's find "onLogout" button and insert before it?
    # Better: just use a simpler regex or string replacement.
    
    parts = content.split('onClick={onLogout}')
    if len(parts) > 1:
        # parts[0] has the button before logout.
        # we can insert the admin button right before the logout button
        insert_target = """<button \n              onClick={onLogout}"""
        if insert_target in content:
             content = content.replace(insert_target, admin_btn_code + "\n            " + insert_target)
             with open(file_path, 'w', encoding='utf-8') as f:
                 f.write(content)
             print("Admin button inserted successfully.")
        else:
             print("Could not find insert target")
    else:
        print("Could not find onLogout")

