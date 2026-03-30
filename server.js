const app = require('./src/app');
const initDB = require('./src/utils/initDB');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

initDB().then(() => {
    app.listen(PORT, () => {
        console.log('========================================');
        console.log(`  PARIVAR MART - Server Started`);
        console.log(`  URL: http://localhost:${PORT}`);
        console.log('========================================');
    });
}).catch(err => {
    console.error('Critical Error on Startup:', err);
});
