const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', error => logs.push(`[error] ${error.message}`));
  
  // Test /tracks unauth
  await page.goto('http://localhost:3001/tracks');
  await page.waitForTimeout(2000);
  
  // Test /practice
  await page.goto('http://localhost:3001/practice');
  await page.waitForTimeout(2000);
  
  console.log("--- BROWSER LOGS ---");
  for (const log of logs) {
    console.log(log);
  }
  
  await browser.close();
})();
