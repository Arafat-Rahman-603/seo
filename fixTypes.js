const fs = require('fs');
const files = ['AboutContent.tsx', 'ServicesContent.tsx', 'ContactContent.tsx'];
for (const f of files) {
  const p = 'northstar/src/components/' + f;
  let code = fs.readFileSync(p, 'utf8');
  code = code.replace(/data-editor-path="([^"]+)"/g, (match, path) => {
    let type = 'text';
    if (path.toLowerCase().includes('description') || path.toLowerCase().includes('message')) type = 'textarea';
    return match + ` data-editor-type="${type}"`;
  });
  fs.writeFileSync(p, code);
}
console.log('Done mapping field types');
