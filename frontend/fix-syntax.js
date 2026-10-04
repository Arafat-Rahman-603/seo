const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.tsx')) {
      let c = fs.readFileSync(p, 'utf8');
      
      c = c.replace(/\(\(\)\)/g, '()');
      
      fs.writeFileSync(p, c);
    }
  });
}

walk('src/app');
console.log('Fixed syntax error');
