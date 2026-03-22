// src/cron.js
const cron = require('node-cron');
const { syncAll } = require('./controllers/sync');

// ===========================
// Auto Sync — วันที่ 16 พฤษภาคม ทุกปี
// Cron: "0 0 16 5 *" = เวลา 00:00 น. วันที่ 16 เดือน 5
// ===========================
cron.schedule('0 0 16 5 *', async () => {
    console.log('========================================');
    console.log('[CRON] Auto Sync Started:', new Date().toISOString());
    console.log('========================================');

    try {
        const results = await syncAll();
        console.log('[CRON] Sync Results:', JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('[CRON] Sync Error:', error);
    }

    console.log('[CRON] Auto Sync Completed:', new Date().toISOString());
});

console.log('[CRON] Auto Sync scheduled: May 16th every year at 00:00');
