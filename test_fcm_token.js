const fs = require('fs');
console.log(fs.readFileSync('src/services/notificationService.ts', 'utf8').substring(0, 1000));
