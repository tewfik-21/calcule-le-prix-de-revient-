const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');
c = c.replace(/ÃƒÂ°Ã…Â¸ââ‚¬Å“Ã‚Â/g, '📍');
c = c.replace(/Ã¢ââ‚¬Â¦/g, ''); // Fix the database strings if they ended up hardcoded anywhere
fs.writeFileSync('src/App.tsx', c, 'utf8');
console.log('Done replacement');
