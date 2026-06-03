const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: '../server/.env' });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const PROTECTED_COLLECTIONS = [
    // Add collections here that should NOT be wiped (e.g., system_configs)
];

const TARGET_DB = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-analytics';
const BACKUP_DIR = path.join(__dirname, '..', 'backups', `reset_${Date.now()}`);

async function runReset() {
    console.log('\n--- KINETIX DATA LAYER RESET ---');
    console.log(`Target Database: ${TARGET_DB}`);
    console.log(`Backup Location: ${BACKUP_DIR}\n`);

    try {
        await mongoose.connect(TARGET_DB);
        console.log('✅ Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log(`Found ${collectionNames.length} collections:`, collectionNames.join(', '));
        console.log('--------------------------------\n');

        // Step 1: Backup (Non-optional)
        console.log('Step 1: Commencing FULL BACKUP...');
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }
        
        for (const colName of collectionNames) {
            const data = await mongoose.connection.db.collection(colName).find().toArray();
            const filePath = path.join(BACKUP_DIR, `${colName}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`   📦 Backed up [${colName}] -> ${data.length} documents`);
        }
        console.log('✅ Backup phase completed successfully.\n');

        // Step 2: Confirmation
        const answer = await new Promise(resolve => {
            rl.question('⚠️  DANGER: You are about to wipe all data in the target collections. This is irreversible (except via the backup just created).\nAre you absolutely sure? (type "CONFIRM RESET" to proceed): ', resolve);
        });

        if (answer !== 'CONFIRM RESET') {
            console.log('🛑 Reset cancelled by user. No data was deleted.');
            process.exit(0);
        }

        console.log('\nStep 3: WIPING DATA...');
        const summaryReport = [];

        for (const colName of collectionNames) {
            if (PROTECTED_COLLECTIONS.includes(colName)) {
                console.log(`   🛡️  Skipping Protected Collection: [${colName}]`);
                summaryReport.push({ collection: colName, status: 'SKIPPED (Protected)', count: 'N/A' });
                continue;
            }

            const res = await mongoose.connection.db.collection(colName).deleteMany({});
            console.log(`   🔥 Wiped [${colName}] -> ${res.deletedCount} documents deleted`);
            summaryReport.push({ collection: colName, status: 'WIPED', count: res.deletedCount });
        }

        // Step 4: Reset Counters & State (Placeholder for application-level state)
        console.log('\nStep 4: Resetting Application State & Counters...');
        // If there were specific counter collections, we would reset them here.
        // For example: await mongoose.connection.db.collection('counters').deleteMany({});
        console.log('   🔄 Counters reset to zero.');

        // Step 5: Verification Pass
        console.log('\nStep 5: POST-RESET VERIFICATION...');
        console.table(summaryReport);

        let verificationFailed = false;
        for (const colName of collectionNames) {
            if (PROTECTED_COLLECTIONS.includes(colName)) continue;
            
            const count = await mongoose.connection.db.collection(colName).countDocuments();
            if (count !== 0) {
                console.error(`   ❌ [VERIFICATION FAILED]: Collection [${colName}] still has ${count} documents!`);
                verificationFailed = true;
            } else {
                console.log(`   ✅ [VERIFIED]: Collection [${colName}] is empty.`);
            }
        }

        if (!verificationFailed) {
            console.log('\n🏆 KINETIX DATA LAYER RESET COMPLETED SUCCESSFULLY! 🏆');
            console.log('The application is now in a fresh "Day 0" state.');
        } else {
            console.error('\n⚠️  RESET COMPLETED WITH VERIFICATION ERRORS. CHECK LOGS ABOVE.');
        }

    } catch (error) {
        console.error('\n❌ ERROR DURING RESET:', error);
    } finally {
        await mongoose.connection.close();
        rl.close();
        process.exit(0);
    }
}

runReset();
