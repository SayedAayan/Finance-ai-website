const fs = require('fs');
const path = require('path');

const fixImports = dir => {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) {
      fixImports(fp);
    } else if (fp.endsWith('.jsx') || fp.endsWith('.js')) {
      let c = fs.readFileSync(fp, 'utf8');
      
      // Update relative imports
      // from '../ -> from '../../
      // from './ -> from '../
      let nc = c
        .replace(/from\s+['"]\.\.\//g, "from '../../")
        .replace(/from\s+['"]\.\//g, "from '../");
        
      if (c !== nc) {
        fs.writeFileSync(fp, nc);
        console.log(`Updated ${fp}`);
      }
    }
  }
};

fixImports('src/pages/website');
fixImports('src/pages/admin');
