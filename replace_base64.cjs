const fs = require('fs');
const path = require('path');

const logoPath = 'd:\\ERP\\ERP_FULL\\ERP_FULL\\ERP_FRONTEND\\src\\assets\\aminoid_logo.png';
const base64Data = fs.readFileSync(logoPath, 'base64');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const logoRegex = /const MV_LOGO_B64 = '[^']+';/g;
walkDir('d:\\ERP\\ERP_FULL\\ERP_FULL\\ERP_FRONTEND\\src\\pages', function(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    if (logoRegex.test(content)) {
        let newContent = content.replace(logoRegex, `const MV_LOGO_B64 = '${base64Data}';`);
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated base64 in ${filePath}`);
    }
});
