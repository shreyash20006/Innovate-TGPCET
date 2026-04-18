import fs from 'fs';
import path from 'path';

const dirs = ['src/pages', 'src/components'];
dirs.forEach(dir => {
  const fullDir = path.join(process.cwd(), dir);
  if(!fs.existsSync(fullDir)) return;
  const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.tsx'));

  files.forEach(file => {
    const p = path.join(fullDir, file);
    let content = fs.readFileSync(p, 'utf8');

    content = content.replace(/bg-\[#05000f99\]/g, 'bg-cyber-bg2/80');
    content = content.replace(/bg-\[#04000a\]/g, 'bg-cyber-bg2');
    content = content.replace(/bg-\[#000014e6\]/g, 'bg-cyber-bg/90');
    content = content.replace(/bg-\[#0a0014\]\/70/g, 'bg-cyber-bg2/80');
    content = content.replace(/bg-\[#04000fe6\]/g, 'bg-cyber-bg2/90');
    content = content.replace(/bg-\[#000500e6\]/g, 'bg-cyber-bg2/90');
    content = content.replace(/bg-\[#020617\]/g, 'bg-cyber-bg2');
    content = content.replace(/backgroundColor:\s*'#020617'/g, "backgroundColor: 'var(--color-cyber-bg2)'");
    content = content.replace(/after:from-\[#ff00661f\]/g, "after:from-cyber-pink/20");

    fs.writeFileSync(p, content);
  });
});
console.log("Migration complete");
