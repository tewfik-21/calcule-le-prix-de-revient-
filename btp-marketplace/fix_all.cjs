const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/Ã /g, 'à');
c = c.replace(/Ã€/g, 'À');
c = c.replace(/ÃƒÂ¢ââ‚¬ÂºÃ‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â/g, '⛏️');
c = c.replace(/ÃƒÂ°Ã…Â¸Ã‚ ââ‚¬â€ ÃƒÂ¯Ã‚Â¸Ã‚/g, '🏗️');
c = c.replace(/Ã Â /g, 'à');
c = c.replace(/Ã /g, 'à');

fs.writeFileSync('src/App.tsx', c, 'utf8');
console.log('Fixed all remaining characters');
