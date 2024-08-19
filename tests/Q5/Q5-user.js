const { chromium, devices } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const constantsPath = path.resolve(__dirname, './Q5constants.js');

async function setupQ5() {
    const browser = await chromium.launch({ headless: true });
    const device = devices['iPhone 11'];
    const context = await browser.newContext({
        ...device
    });
    const page = await context.newPage();

    try {
        await page.goto("http://wap-q4.qbpink01.com/");
        await page.locator('button:has-text("登入")').click();
        await page.locator('#login_userId').fill('uitest001');
        await page.locator('#login_password').fill('396012');
        await page.locator('button[type="submit"].login-button').click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const stateValue = await page.evaluate(() => localStorage.getItem('state'));

        if (stateValue) {
            const parsedState = JSON.parse(stateValue);
            const userState = parsedState.user ? parsedState.user : {};
            const userValue = parsedState.game ? parsedState.game : {};

            const updatedConstants = `
module.exports = {
    userState: ${JSON.stringify(userState)},
    userValue: ${JSON.stringify(userValue)}
};
            `;
            fs.writeFileSync(constantsPath, updatedConstants);
        } else {
            console.error('未能捕获到 state 数据。');
        }

    } catch (error) {
        console.error('发生错误:', error);
    } finally {
        await page.close();
        await browser.close();
    }
}

module.exports = { setupQ5 }