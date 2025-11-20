const fs = require('fs');
const path = require('path');

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Arreglar imports de UI components
  content = content.replace(/from ['"]@\/components\/ui\/([^'"]+)['"]/g, 'from "@jess/ui/$1"');
  
  // Arreglar imports de admin components (solo en app/)
  if (filePath.includes('apps/admin/app')) {
    content = content.replace(/from ['"]@\/components\/admin\/([^'"]+)['"]/g, 'from "@/components/$1"');
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed: ${filePath}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.next') {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixImportsInFile(filePath);
    }
  });
}

console.log('🔧 Fixing broken imports in admin...\n');
walkDir('./apps/admin');
console.log('\n✅ Done!');
