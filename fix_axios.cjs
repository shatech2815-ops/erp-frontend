const fs = require('fs');
const path = require('path');

const clientDir = 'd:/ERP/ERP_FULL/ERP_FRONTEND/src/pages/client';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace import axios
  if (content.includes('import axios from "axios";') || content.includes("import axios from 'axios';")) {
    // Determine relative path to interceptors based on directory depth
    // src/pages/client/ -> 3 levels deep relative to src?
    // Wait, interceptors is in src/interceptors.
    // src/pages/client/File.jsx -> ../../interceptors/interceptors
    content = content.replace(/import axios from ["']axios["'];/g, 'import apiInterceptor from "../../interceptors/interceptors";');
    changed = true;
  }

  // Replace axios. with apiInterceptor.
  if (content.includes('axios.')) {
    content = content.replace(/axios\./g, 'apiInterceptor.');
    changed = true;
  }

  // Replace `${import.meta.env.VITE_API_URL}/leads` with "/leads"
  if (content.includes('${import.meta.env.VITE_API_URL}')) {
    content = content.replace(/\`\$\{import\.meta\.env\.VITE_API_URL\}(.*?)\`/g, '"$1"');
    changed = true;
  }
  
  if (content.includes('import.meta.env.VITE_API_URL + ')) {
    content = content.replace(/import\.meta\.env\.VITE_API_URL \+ ["'](.*?)["']/g, '"$1"');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

walkDir(clientDir);
console.log('Done replacing axios in client pages.');
