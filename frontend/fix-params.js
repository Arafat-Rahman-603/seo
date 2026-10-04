const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.tsx')) {
      let c = fs.readFileSync(p, 'utf8');
      
      if (c.includes('params }: any') || c.includes('params: any')) {
        if (!c.includes('useParams')) {
          if (c.includes('next/navigation')) {
            c = c.replace(/import \{ ([^}]+) \} from 'next\/navigation';/, "import { $1, useParams } from 'next/navigation';");
          } else {
            c = c.replace(/['"]use client['"];\n/, '"use client";\nimport { useParams } from \'next/navigation\';\n');
          }
        }
        
        c = c.replace(/\{ params \}: any/, '()');
        c = c.replace(/\{ children, params \}: any/, '{ children }: any');
        
        c = c.replace(/const projectId = params\.id;/, 'const params = useParams();\n  const projectId = params.id as string;');
        c = c.replace(/const \{ id: projectId \} = params;/, 'const params = useParams();\n  const projectId = params.id as string;');
        c = c.replace(/const \{ id, pageName \} = params;/, 'const params = useParams();\n  const id = params.id as string;\n  const pageName = params.pageName as string;');
        c = c.replace(/const \{ id \} = params;/, 'const params = useParams();\n  const id = params.id as string;');
        c = c.replace(/params\.id/g, 'params?.id');
        
        fs.writeFileSync(p, c);
      }
    }
  });
}

walk('src/app');
console.log('Fixed params');
