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

// Robust CSV parser supporting quotes, commas inside fields, and standard headers
function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  
  // Clean headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let insideQuotes = false;
    let currentValue = '';

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"' || char === "'") {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim().replace(/^["']|["']$/g, ''));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim().replace(/^["']|["']$/g, ''));

    if (values.length < headers.length) continue;

    const obj = {};
    headers.forEach((header, index) => {
      const key = header.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      obj[key] = values[index] || '';
      obj[header] = values[index] || '';
    });

    // Map standardized fields
    obj.full_name = obj.student || obj.full_name || obj.name || values[1] || 'Student';
    obj.karma = parseInt(obj.karma || values[2] || '0', 10);
    obj.level = parseInt(obj.level || values[3] || '1', 10);
    obj.department = obj.department___cluster || obj.department || values[4] || 'CSE';
    obj.is_alumni = String(obj.alumni_status || obj.is_alumni || values[5] || '').toLowerCase().includes('true') || String(values[5]) === '1';
    obj.muid = obj.muid || obj.full_name.toLowerCase().replace(/\s+/g, '') + '@mulearn';

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
  console.log(`🔑 Target Account: ${MULEARN_EMAIL}`);

  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  let csvContent = '';

  // Intercept any direct CSV API responses
  page.on('response', async (response) => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';
    if (url.includes('export') || url.includes('csv') || contentType.includes('text/csv')) {
      try {
        const text = await response.text();
        if (text && text.includes('Karma') || text.includes('Student')) {
          csvContent = text;
          console.log(`📡 Intercepted CSV response from network (${text.length} bytes)`);
        }
      } catch (err) {}
    }
  });

  try {
    // 1. Navigate to Login page
    console.log('🌐 Opening https://app.mulearn.org/login ...');
    await page.goto('https://app.mulearn.org/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // 2. Fill login credentials if inputs exist
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="muid" i]');
    if (await emailInput.count() > 0) {
      console.log('🔑 Filling email/username...');
      await emailInput.first().fill(MULEARN_EMAIL);

      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      if (await passwordInput.count() > 0) {
        console.log('🔑 Filling password...');
        await passwordInput.first().fill(MULEARN_PASSWORD);
      }

      const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In"), button:has-text("Submit")');
      if (await submitBtn.count() > 0) {
        console.log('🚀 Clicking Submit...');
        await submitBtn.first().click();
        await page.waitForTimeout(4000);
      }
    }

    // 3. Directly navigate to Manage Campus URL
    console.log('📍 Navigating to https://app.mulearn.org/dashboard/campus/manage ...');
    await page.goto('https://app.mulearn.org/dashboard/campus/manage', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // 4. Click "Export CSV" button
    console.log('📥 Searching for Export CSV button...');
    const exportBtn = page.locator('button:has-text("Export CSV"), button:has-text("Export"), a:has-text("Export CSV"), div:has-text("Export CSV")');

    if (await exportBtn.count() > 0 && !csvContent) {
      console.log('✅ Found Export CSV button! Triggering click...');
      
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
      await exportBtn.first().click();
      
      const download = await downloadPromise;
      if (download) {
        const downloadPath = await download.path();
        csvContent = fs.readFileSync(downloadPath, 'utf8');
        console.log(`🎉 Downloaded CSV file successfully (${csvContent.length} bytes)`);
      }
    }

    // 5. Sync parsed CSV to MongoDB via API
    if (csvContent) {
      const students = parseCSV(csvContent);
      console.log(`📊 Successfully parsed ${students.length} student records!`);

      console.log(`🚀 Dispatching sync request to ${BACKEND_API_URL} ...`);
      const syncResult = await sendSyncPayload(BACKEND_API_URL, SYNC_SECRET, students);
      console.log('🎉 LEADERBOARD DATABASE SYNC COMPLETE:', syncResult);
    } else {
      console.log('⚠️ Could not intercept or download CSV automatically. Fallback to Admin manual upload option.');
    }

  } catch (error) {
    console.error('❌ Bot Execution Note:', error.message);
  } finally {
    await browser.close();
    console.log('🏁 Bot script completed.');
  }
}

runSyncBot();
