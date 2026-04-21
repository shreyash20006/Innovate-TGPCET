/**
 * fix_light_mode.cjs
 * Replaces hardcoded white text colors with theme-aware equivalents.
 * Run: node fix_light_mode.cjs
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(walk(full));
    } else if (/\.(tsx|jsx|ts)$/.test(f)) {
      results.push(full);
    }
  });
  return results;
}

// ----- RULES -----
// Each rule: { find: RegExp, replace: string|function, desc }
const rules = [
  // 1. className="... text-white ..." → text-cyber-white
  //    BUT skip text-white inside DNASnakeFooter (it's always dark bg)
  {
    desc: 'className text-white → text-cyber-white',
    find: /\btext-white\b/g,
    replace: 'text-cyber-white',
    skipFiles: ['DNASnakeFooter.tsx'],
  },

  // 2. style={{ color: 'white' }} or style={{ color: "#fff" }} or "#ffffff"
  {
    desc: "style color: 'white' → var(--text-primary)",
    find: /color:\s*['"]white['"]/g,
    replace: "color: 'var(--text-primary)'",
    skipFiles: ['DNASnakeFooter.tsx'],
  },
  {
    desc: "style color: '#fff' → var(--text-primary)",
    find: /color:\s*['"]#[fF]{3,6}['"]/g,
    replace: "color: 'var(--text-primary)'",
    skipFiles: ['DNASnakeFooter.tsx'],
  },
  {
    desc: "style color: '#ffffff' → var(--text-primary)",
    find: /color:\s*['"]#[Ff]{6}['"]/g,
    replace: "color: 'var(--text-primary)'",
    skipFiles: ['DNASnakeFooter.tsx'],
  },

  // 3. text-cyber-white in headings already handles h1/h2/h3 via CSS var
  // 4. Explicit text-gray-* for sub‑paragraphs: text-cyber-muted stays as is (already themed)
  
  // 5. "text-cyber-white" already maps to --text-primary which is dark in light mode ✓
  // 6. navbar: text-cyber-white covers links already

  // 7. WebkitTextStroke white → use currentColor safe variant
  {
    desc: "WebkitTextStroke rgba(255,255,255 → rgba(var text-primary style",
    find: /WebkitTextStroke:\s*['"][\d.]+px\s+rgba\(255,255,255/g,
    replace: (m) => m.replace('rgba(255,255,255', 'rgba(var(--text-r,255),var(--text-g,255),var(--text-b,255)'),
    skipFiles: [],
  },
];

const files = walk(SRC);
let totalChanges = 0;

for (const file of files) {
  const basename = path.basename(file);
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  let fileChanges = 0;

  for (const rule of rules) {
    if (rule.skipFiles && rule.skipFiles.some(s => basename.includes(s))) continue;
    const before = content;
    content = content.replace(rule.find, rule.replace);
    if (content !== before) {
      // Count occurrences changed
      const matches = (before.match(rule.find) || []).length;
      console.log(`  [${basename}] ${rule.desc} (${matches} occurrences)`);
      fileChanges += matches;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    totalChanges += fileChanges;
  }
}

console.log(`\nDone! Total replacements: ${totalChanges} across ${files.length} files scanned.`);
