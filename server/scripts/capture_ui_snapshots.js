const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'test_results', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function captureSnapshots() {
  console.log('===============================================================');
  console.log('       KINETIX AI — AUTOMATED UI SNAPSHOT ENGINE (PUPPETEER)   ');
  console.log('===============================================================\n');

  console.log('🚀 Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // Helper delay
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  // 1. Landing Gateway
  console.log('📸 1. Capturing Gateway / Landing Page...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await wait(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'Figure_6_1_Gateway_Landing.png'), fullPage: false });
  console.log('   ✔ Saved Figure_6_1_Gateway_Landing.png');

  // 2. Login Page
  console.log('📸 2. Capturing Login Page...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await wait(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'Figure_6_2_Login_Page.png'), fullPage: false });
  console.log('   ✔ Saved Figure_6_2_Login_Page.png');

  // 3. Login as Manager to access Protected Routes
  console.log('🔐 Performing Authentication as Manager...');
  try {
    await page.evaluate(() => {
      // Simulate authenticating demo user in localStorage as handled by AuthContext
      const demoUser = {
        id: 'demo-manager',
        name: 'Team India Manager',
        email: 'manager@kinetix.ai',
        role: 'manager',
        sport: 'Cricket',
        teamName: 'India'
      };
      localStorage.setItem('activeUser', JSON.stringify(demoUser));
      localStorage.setItem('token', 'demo-jwt-token-kinetix-ai');
    });
  } catch (e) {
    console.error('Auth evaluate error:', e.message);
  }

  // 4. Manager Dashboard
  console.log('📸 3. Capturing Manager Dashboard...');
  await page.goto('http://localhost:3000/dashboard/manager', { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await wait(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'Figure_6_3_Manager_Dashboard.png'), fullPage: false });
  console.log('   ✔ Saved Figure_6_3_Manager_Dashboard.png');

  // 5. Cricket Lab
  console.log('📸 4. Capturing Cricket Lab AI & CV Page...');
  await page.goto('http://localhost:3000/cricket-lab', { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await wait(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'Figure_6_4_Cricket_Lab.png'), fullPage: false });
  console.log('   ✔ Saved Figure_6_4_Cricket_Lab.png');

  // 6. Players Directory
  console.log('📸 5. Capturing Players Directory...');
  await page.goto('http://localhost:3000/players', { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await wait(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'Figure_6_5_Players_List.png'), fullPage: false });
  console.log('   ✔ Saved Figure_6_5_Players_List.png');

  // 7. Analyst Dashboard
  console.log('📸 6. Capturing Analyst Dashboard...');
  await page.evaluate(() => {
    const demoAnalyst = {
      id: 'demo-analyst',
      name: 'Data Analyst',
      email: 'analyst@kinetix.ai',
      role: 'analyst',
      sport: 'Cricket',
      teamName: 'India'
    };
    localStorage.setItem('activeUser', JSON.stringify(demoAnalyst));
  });
  await page.goto('http://localhost:3000/dashboard/analyst', { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await wait(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'Figure_6_6_Analyst_Dashboard.png'), fullPage: false });
  console.log('   ✔ Saved Figure_6_6_Analyst_Dashboard.png');

  // 8. Player Dashboard
  console.log('📸 7. Capturing Player Personal Dashboard...');
  await page.evaluate(() => {
    const demoPlayer = {
      id: 'demo-player',
      name: 'Virat Kohli',
      email: 'player@kinetix.ai',
      role: 'player',
      sport: 'Cricket',
      teamName: 'India'
    };
    localStorage.setItem('activeUser', JSON.stringify(demoPlayer));
  });
  await page.goto('http://localhost:3000/dashboard/player', { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await wait(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'Figure_6_7_Player_Dashboard.png'), fullPage: false });
  console.log('   ✔ Saved Figure_6_7_Player_Dashboard.png');

  // 9. Admin Panel
  console.log('📸 8. Capturing Admin Panel...');
  await page.evaluate(() => {
    const demoAdmin = {
      id: 'demo-admin',
      name: 'System Administrator',
      email: 'admin@kinetix.ai',
      role: 'admin',
      sport: 'Cricket',
      teamName: 'India'
    };
    localStorage.setItem('activeUser', JSON.stringify(demoAdmin));
  });
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await wait(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'Figure_6_8_Admin_Panel.png'), fullPage: false });
  console.log('   ✔ Saved Figure_6_8_Admin_Panel.png');

  // 10. Public Hub
  console.log('📸 9. Capturing Public Hub (Unauthenticated Access)...');
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.goto('http://localhost:3000/hub', { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await wait(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'Figure_6_9_Public_Hub.png'), fullPage: false });
  console.log('   ✔ Saved Figure_6_9_Public_Hub.png');

  // 11. System Analytics Tracker
  console.log('📸 10. Capturing System Analytics...');
  await page.goto('http://localhost:3000/system-admin', { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await wait(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'Figure_6_10_System_Analytics.png'), fullPage: false });
  console.log('   ✔ Saved Figure_6_10_System_Analytics.png');

  await browser.close();
  console.log('\n===============================================================');
  console.log('✔ ALL 10 UI SNAPSHOTS CAPTURED SUCCESSFULLY!');
  console.log('Screenshots location:', SCREENSHOTS_DIR);
  console.log('===============================================================\n');
}

captureSnapshots().catch(err => {
  console.error('Error during snapshot capture:', err);
  process.exit(1);
});
