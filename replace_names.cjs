const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('d:\\ERP\\ERP_FULL\\ERP_FULL\\ERP_FRONTEND\\src', function(filePath) {
    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js') && !filePath.endsWith('.css')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    // Email and URLs
    newContent = newContent.replace(/nexora-erp\.com/g, 'aminoidai.com');

    // Names
    newContent = newContent.replace(/Nexora/g, 'Aminoid Ai');
    newContent = newContent.replace(/NEXORA/g, 'AMINOID AI');
    // CSS classes / lowercases
    newContent = newContent.replace(/nexora/g, 'aminoidai'); 

    // Dashboard Acme
    newContent = newContent.replace(/ACME CORP/g, 'Aminoid Ai');
    newContent = newContent.replace(/Acme Corp/g, 'Aminoid Ai');
    newContent = newContent.replace(/ACME/g, 'Aminoid Ai');

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated ${filePath}`);
    }
});
