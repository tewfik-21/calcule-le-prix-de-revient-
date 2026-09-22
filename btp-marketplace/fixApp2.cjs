const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf-8').split('\n');

const codeToInsert = `        });
        initPushNotifications(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          identity: session.user.email || 'Utilisateur',
          type: 'email',
          isPremium: false,
          isVerified: false,
          adsPostedCount: 0
        });
        initPushNotifications(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });`;

lines.splice(448, 8, ...codeToInsert.split('\n'));
fs.writeFileSync('src/App.tsx', lines.join('\n'), 'utf-8');
