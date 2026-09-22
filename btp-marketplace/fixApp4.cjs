const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
/type: 'email',\s+\}\);/g,
`type: 'email',
          isPremium: false,
          isVerified: false,
          adsPostedCount: 0
        });`
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
