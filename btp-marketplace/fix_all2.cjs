const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/ÃƒÂ¢ââ‚¬ÂºÃ‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â /g, '⛏️');
c = c.replace(/ÃƒÂ¢ââ‚¬ÂºÃ‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â/g, '⛏️');
c = c.replace(/ÃƒÂ°Ã…Â¸Ã‚ ââ‚¬â€ ÃƒÂ¯Ã‚Â¸Ã‚ /g, '🏗️');
c = c.replace(/ÃƒÂ°Ã…Â¸Ã‚ ââ‚¬â€ ÃƒÂ¯Ã‚Â¸Ã‚/g, '🏗️');
c = c.replace(/ÃƒÂ¢ââ‚¬Â°Ã‚Â°ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÂ¯Ã‚Â¸Ã‚Â/g, ''); // the string from screenshot

fs.writeFileSync('src/App.tsx', c, 'utf8');
console.log('Fixed more chars');
