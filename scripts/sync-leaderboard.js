/**
 * Automated µLearn GECI Leaderboard Sync Bot
 * 
 * Automates login to app.mulearn.org, exports campus CSV,
 * parses student Karma records, and updates MongoDB Atlas via backend API.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const MULEARN_EMAIL = process.env.MULEARN_EMAIL || 'mulearn@gecidukki.ac.in';
const MULEARN_PASSWORD = process.env.MULEARN_PASSWORD || 'gecimulearn@000';
const SYNC_SECRET = process.env.LEADERBOARD_SYNC_SECRET || 'mulearn-geci-sync-secret-2026';
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://mulearn-geci-mu.vercel.app/api/leaderboard/sync';

// Simple CSV parser
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
    if (currentLine.length < headers.length) continue;
    
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = currentLine[index] || '';
    });
    results.push(obj);
  }
  return results;
}

// POST helper to sync payload to Vercel API
function sendSyncPayload(apiUrl, syncSecret, students) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(apiUrl);
    const postData = JSON.stringify({ students });

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-sync-secret': syncSecret
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error [${res.statusCode}]: ${parsed.message || body}`));
          }
        } catch (e) {
          resolve({ raw: body, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

async function runSyncBot() {
  console.log('🤖 Starting µLearn GECI Leaderboard Automation Bot...');
  console.log(`🔑 Credentials: ${MULEARN_EMAIL}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  try {
    // 1. Navigate to Login
    console.log('🌐 Opening https://app.mulearn.org/login ...');
    await page.goto('https://app.mulearn.org/login', { waitUntil: 'networkidle' });

    // 2. Fill login form if email/password input exists
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    if (await emailInput.count() > 0) {
      console.log('🔑 Filling login credentials...');
      await emailInput.fill(MULEARN_EMAIL);
      
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      if (await passwordInput.count() > 0) {
        await passwordInput.fill(MULEARN_PASSWORD);
      }

      // Click login button
      const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      if (await submitBtn.count() > 0) {
        await Promise.all([
          page.waitForNavigation({ timeout: 15000 }).catch(() => {}),
          submitBtn.click()
        ]);
      }
    }

    // 3. Navigate to Campus Management
    console.log('📍 Navigating to https://app.mulearn.org/dashboard/campus/manage ...');
    await page.goto('https://app.mulearn.org/dashboard/campus/manage', { waitUntil: 'networkidle' });

    // 4. Click Export CSV and capture download
    console.log('📥 Triggering Export CSV download...');
    const exportBtn = page.locator('button:has-text("Export CSV"), button:has-text("Export"), a:has-text("Export CSV")');
    
    let csvContent = '';
    if (await exportBtn.count() > 0) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 20000 }),
        exportBtn.first().click()
      ]);

      const downloadPath = await download.path();
      csvContent = fs.readFileSync(downloadPath, 'utf8');
      console.log(`✅ CSV downloaded successfully (${csvContent.length} bytes)`);
    } else {
      console.log('⚠️ Export CSV button not found via standard selector, checking page content...');
    }

    // 5. Parse CSV & Sync to Backend
    if (csvContent) {
      const students = parseCSV(csvContent);
      console.log(`📊 Parsed ${students.length} student records from CSV.`);
      
      console.log(`🚀 Sending sync payload to ${BACKEND_API_URL} ...`);
      const syncResult = await sendSyncPayload(BACKEND_API_URL, SYNC_SECRET, students);
      console.log('🎉 SYNC SUCCESSFUL!', syncResult);
    } else {
      console.log('❌ Could not retrieve CSV content.');
    }

  } catch (error) {
    console.error('❌ Bot Sync Failure:', error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
    console.log('🏁 Bot execution finished.');
  }
}

runSyncBot();
