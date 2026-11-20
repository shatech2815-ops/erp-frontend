const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      if (fs.statSync(dirFile).isDirectory()) {
        filelist = walkSync(dirFile, filelist);
      } else if (dirFile.endsWith('.jsx') || dirFile.endsWith('.js')) {
        filelist.push(dirFile);
      }
    } catch (err) {
      if (err.code === 'OENT' || err.code === 'ENOTDIR') return;
      else throw err;
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src'));

let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace double quote strings: "http://localhost:7002/api/something" -> `${import.meta.env.VITE_API_URL}/something`
  content = content.replace(/"http:\/\/localhost:7002\/api([^"]*)"/g, '`${import.meta.env.VITE_API_URL}$1`');
  
  // Replace single quote strings: 'http://localhost:7002/api/something' -> `${import.meta.env.VITE_API_URL}/something`
  content = content.replace(/'http:\/\/localhost:7002\/api([^']*)'/g, '`${import.meta.env.VITE_API_URL}$1`');

  // Replace template literals: `http://localhost:7002/api/something` -> `${import.meta.env.VITE_API_URL}/something`
  content = content.replace(/`http:\/\/localhost:7002\/api([^`]*)`/g, '`${import.meta.env.VITE_API_URL}$1`');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log('Updated:', file);
  }
});

console.log(`Updated ${modifiedCount} files.`);
