/**
 * Automated µLearn GECI Leaderboard Sync Bot
 * 
 * Synchronizes µLearn campus Karma dataset to MongoDB Atlas.
 * Hybrid Engine:
 * 1. Direct REST API authentication & CSV download (Fast, Lightweight)
 * 2. Playwright Headless Browser fallback (UI Automation)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

let chromium;
try {
  chromium = require('playwright').chromium;
} catch (e) {
  try {
    chromium = require('playwright-core').chromium;
  } catch (err) {
    console.log('ℹ️ Playwright browser module not loaded, using Direct REST API Sync Engine.');
  }
}

const MULEARN_EMAIL = process.env.MULEARN_EMAIL || 'mulearngeci@mulearn';
const MULEARN_PASSWORD = process.env.MULEARN_PASSWORD || 'Gecimulearn2025';
const SYNC_SECRET = process.env.LEADERBOARD_SYNC_SECRET || 'mulearn-geci-sync-secret-2026';
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://mulearn-geci-mu.vercel.app/api/leaderboard/sync';

// Robust CSV parser supporting quotes, commas inside fields, and standard headers
function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  
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

// Direct REST API fetch method
function fetchDirectCSV() {
  return new Promise((resolve) => {
    const authData = JSON.stringify({
      emailOrMuid: MULEARN_EMAIL,
      password: MULEARN_PASSWORD
    });

    const options = {
      hostname: 'api.mulearn.org',
      port: 443,
      path: '/api/v1/auth/user-authentication/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(authData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const accessToken = json.response?.accessToken || json.accessToken || json.token;
          if (accessToken) {
            console.log('✅ Direct µLearn REST API Authenticated successfully!');
            // Fetch CSV endpoint
            fetchCampusCSV(accessToken).then(csv => resolve(csv)).catch(() => resolve(null));
          } else {
            resolve(null);
          }
        } catch (err) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(authData);
    req.end();
  });
}

function fetchCampusCSV(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.mulearn.org',
      port: 443,
      path: '/api/v1/dashboard/campus/csv/',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 && (body.includes('Karma') || body.includes('Student'))) {
          resolve(body);
        } else {
          reject(new Error('Failed to fetch CSV via REST API'));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function runSyncBot() {
  console.log('🤖 Starting µLearn GECI Leaderboard Automation Bot...');
  console.log(`🔑 Account: ${MULEARN_EMAIL}`);

  let csvContent = await fetchDirectCSV();

  if (csvContent) {
    console.log(`🎉 Downloaded campus CSV via Direct REST API (${csvContent.length} bytes)!`);
  } else if (chromium) {
    console.log('🔄 REST API fallback triggered: Starting Playwright Headless Browser...');
    try {
      const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
      });
      const context = await browser.newContext({ acceptDownloads: true });
      const page = await context.newPage();

      page.on('response', async (response) => {
        const url = response.url();
        const contentType = response.headers()['content-type'] || '';
        if (url.includes('export') || url.includes('csv') || contentType.includes('text/csv')) {
          try {
            const text = await response.text();
            if (text && (text.includes('Karma') || text.includes('Student'))) {
              csvContent = text;
            }
          } catch (err) {}
        }
      });

      console.log('🌐 Navigating to https://app.mulearn.org/login ...');
      await page.goto('https://app.mulearn.org/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);

      const emailInput = page.locator('input[placeholder*="email" i], input[placeholder*="muid" i], input[type="text"]');
      if (await emailInput.count() > 0) {
        await emailInput.first().fill(MULEARN_EMAIL);
        const passwordInput = page.locator('input[type="password"]');
        if (await passwordInput.count() > 0) {
          await passwordInput.first().fill(MULEARN_PASSWORD);
        }
        const submitBtn = page.locator('button:has-text("Sign in"), button:has-text("Sign In"), button[type="submit"]');
        if (await submitBtn.count() > 0) {
          await Promise.all([
            page.waitForNavigation({ timeout: 15000 }).catch(() => {}),
            submitBtn.first().click()
          ]);
        }
      }

      await page.goto('https://app.mulearn.org/dashboard/campus/manage', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(2000);

      const exportBtn = page.locator('button:has-text("Export CSV"), button:has-text("Export")');
      if (await exportBtn.count() > 0 && !csvContent) {
        const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
        await exportBtn.first().click();
        const download = await downloadPromise;
        if (download) {
          const downloadPath = await download.path();
          csvContent = fs.readFileSync(downloadPath, 'utf8');
        }
      }

      await browser.close();
    } catch (err) {
      console.log('⚠️ Playwright execution note:', err.message);
    }
  }

  // Sync parsed CSV to MongoDB via API
  if (csvContent) {
    const students = parseCSV(csvContent);
    console.log(`📊 Successfully parsed ${students.length} student records!`);

    console.log(`🚀 Dispatching sync request to ${BACKEND_API_URL} ...`);
    const syncResult = await sendSyncPayload(BACKEND_API_URL, SYNC_SECRET, students);
    console.log('🎉 LEADERBOARD DATABASE SYNC COMPLETE:', syncResult);
  } else {
    console.log('⚠️ Automatic retrieval pending. Admin manual CSV upload is ready at /admin/leaderboard');
  }

  console.log('🏁 Bot script execution finished.');
}

runSyncBot();
