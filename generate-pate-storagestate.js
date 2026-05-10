/**
 * Generates a Playwright storage state file for PATE Canvas authentication.
 *
 * Navigates to both make.powerapps.com AND the canvas app play URL so that
 * cookies for both domains are captured in the storage state.
 *
 * Run once locally (headed) to capture the MFA-authenticated session, then
 * upload the output file to ADO Secure Files as "pate-user1-storagestate.json".
 *
 * Usage:
 *   nvm use 20 && node generate-pate-storagestate.js
 */

const [major] = process.versions.node.split('.').map(Number);
if (major < 18) {
  console.error(`Node.js 18+ required (current: v${process.versions.node})`);
  console.error('Run with: nvm use 20 && node generate-pate-storagestate.js');
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  const { execSync } = require('child_process');
  console.log('playwright not found — installing locally…');
  execSync('npm install --no-save playwright', { stdio: 'inherit', cwd: __dirname });
  ({ chromium } = require('playwright'));
}
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const OUTPUT = path.join(__dirname, 'pate-user1-storagestate.json');

// Must match the environment/app in TC1_PJC_001.fx.yaml
const ENVIRONMENT_ID = '493ec420-26dc-ebc2-9bc0-11821149f051';
const APP_LOGICAL_NAME = 'capop_opexcapexapprovalappv34_ddc56';
const TENANT_ID = '47f44079-0021-4177-80c9-68531941e357';

const MAKER_URL = 'https://make.powerapps.com';
const PLAY_URL = `https://apps.powerapps.com/play/e/${ENVIRONMENT_ID}/an/${APP_LOGICAL_NAME}?tenantId=${TENANT_ID}`;

function prompt(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => { rl.close(); resolve(answer); });
  });
}

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Step 1: sign in at the maker portal
  console.log('\n[1/2] Opening Power Apps maker portal…');
  await page.goto(MAKER_URL);
  console.log('      Sign in as the test user and complete MFA.');
  console.log('      Wait until the Power Apps home page fully loads.');
  await prompt('      Press ENTER when ready → ');

  // Step 2: navigate to the canvas app play URL to seed apps.powerapps.com cookies
  console.log('\n[2/2] Opening the Canvas app play URL to seed apps.powerapps.com session…');
  console.log(`      ${PLAY_URL}`);
  await page.goto(PLAY_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('      Wait until the app fully loads (you see the app UI, not a login page).');
  await prompt('      Press ENTER when the app is loaded → ');

  await context.storageState({ path: OUTPUT });
  await browser.close();

  const kb = (fs.statSync(OUTPUT).size / 1024).toFixed(1);
  console.log(`\nSaved: ${OUTPUT}  (${kb} KB)`);
  console.log('Next: upload this file to ADO → Pipelines → Library → Secure Files → pate-user1-storagestate.json');
}

main().catch(err => { console.error(err); process.exit(1); });
