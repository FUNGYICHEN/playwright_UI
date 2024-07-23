const { chromium, devices } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const constantsPath = path.resolve(__dirname, './Q8constants.js');

async function setupQ8() {
    const browser = await chromium.launch({ headless: false });
    const device = devices['iPhone 11'];
    const context = await browser.newContext({ ...device });

    const page = await context.newPage();
    try {
        await page.goto("https://wap-q8-npf2.qit1.net/login");
        await page.locator("#username").fill("uitest001");
        await page.locator('#password').type('396012');
        await page.locator('div.submitBtn.btns:has-text("登錄")').click();
        await page.waitForLoadState('networkidle');

        // 增加等待时间
        await page.waitForTimeout(5000);

        const userRecordValue = await page.evaluate(() => localStorage.getItem('userRecord'));
        console.log(`userRecord Value: ${userRecordValue}`);

        if (userRecordValue) {
            const updatedConstants = `
module.exports = {
    userRecordKey: 'userRecord',
    userRecordValue: '${userRecordValue}'
};
            `;
            fs.writeFileSync(constantsPath, updatedConstants);
            console.log('Q8constants.js has been updated');
        } else {
            console.error('Failed to retrieve userRecord value');
        }
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await page.close();
        await browser.close();
    }
}

module.exports = { setupQ8 };