/**
 * Generates a Playwright storage state file for PATE Canvas authentication.
 *
 * Run once locally (headed) to capture the MFA-authenticated session, then
 * upload the output file to ADO Secure Files as "pate-user1-storagestate.json".
 *
 * Usage:
 *   node generate-pate-storagestate.js
 *
 * Prerequisites:
 *   npm install playwright   (or: npx playwright install chromium)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const OUTPUT = path.join(__dirname, 'pate-user1-storagestate.json');

// PATE Canvas provider navigates to the play URL constructed from appLogicalName +
// environment. Sign in on make.powerapps.com so both domains share the session.
const START_URL = 'https://make.powerapps.com';

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Opening Power Apps…');
  await page.goto(START_URL);
  console.log('');
  console.log('Sign in as the test user (complete MFA if prompted).');
  console.log('Wait until the Power Apps home page fully loads.');
  console.log('Then press ENTER here to save the session.');
  console.log('');

  await new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin });
    rl.once('line', () => { rl.close(); resolve(); });
  });

  await context.storageState({ path: OUTPUT });
  await browser.close();

  const kb = (fs.statSync(OUTPUT).size / 1024).toFixed(1);
  console.log(`\nSaved: ${OUTPUT}  (${kb} KB)`);
  console.log('Upload this file to: ADO → Pipelines → Library → Secure Files → pate-user1-storagestate.json');
}

main().catch(err => { console.error(err); process.exit(1); });
