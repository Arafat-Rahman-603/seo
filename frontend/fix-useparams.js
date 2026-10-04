const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.tsx')) {
      let c = fs.readFileSync(p, 'utf8');
      
      if (c.includes('params?.id') && !c.includes('const params = useParams()')) {
        if (!c.includes('useParams')) {
          if (c.includes('next/navigation')) {
            c = c.replace(/import \{ ([^}]+) \} from 'next\/navigation';/, "import { $1, useParams } from 'next/navigation';");
          } else {
            c = c.replace(/['"]use client['"];\n/, '"use client";\nimport { useParams } from \'next/navigation\';\n');
          }
        }
        
        c = c.replace(/export default function ([A-Za-z0-9_]+)\(\) \{/, 'export default function $1() {\n  const params = useParams();\n');
        
        fs.writeFileSync(p, c);
      }
    }
  });
}

walk('src/app');
console.log('Fixed missing useParams');
