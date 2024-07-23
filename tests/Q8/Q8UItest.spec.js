const { test, expect } = require('@playwright/test');
const { userRecordKey, userRecordValue } = require('./Q8constants');
const { randomHongKongPhoneNumber, randomUsername } = require('./phoneNumbers');
const { fetchVerificationCode } = require('./Q8phonecode');// 引入验证码获取函数 // 引入验证码获取函数

test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    globalThis.context = context;
});

test.beforeEach(async () => {
    const page = await globalThis.context.newPage();

    await page.addInitScript(({ key, value }) => {
        localStorage.setItem(key, value);
    }, { key: userRecordKey, value: userRecordValue });

    await page.goto('https://wap-q8-npf2.qit1.net');
    await page.waitForLoadState('networkidle');

    await page.close();
});




test('登入頁檢查', async () => {
    const page = await globalThis.context.newPage();

    await page.goto('https://wap-q8-npf2.qit1.net/login');
    await page.waitForLoadState('networkidle');
    const missingElements = [];

    // 检查“帳號為6-12個數字和英文字”文案是否存在
    const usernamePlaceholderVisible = await page.locator('input[placeholder="帳號為6-12個數字和英文字"]').isVisible();
    console.log(`帳號為6-12個數字和英文字文案是否存在: ${usernamePlaceholderVisible}`);
    if (!usernamePlaceholderVisible) missingElements.push('帳號為6-12個數字和英文字文案');

    // 检查“請輸入登入密碼”文案是否存在
    const passwordPlaceholderVisible = await page.locator('input[placeholder="請輸入登入密碼"]').isVisible();
    console.log(`請輸入登入密碼文案是否存在: ${passwordPlaceholderVisible}`);
    if (!passwordPlaceholderVisible) missingElements.push('請輸入登入密碼文案');

    // 检查“記住密碼”文案是否存在
    const rememberPasswordLabelVisible = await page.locator('label:has-text("記住密碼")').isVisible();
    console.log(`記住密碼文案是否存在: ${rememberPasswordLabelVisible}`);
    if (!rememberPasswordLabelVisible) missingElements.push('記住密碼文案');

    // 检查“忘記密碼?”文案是否存在
    const forgotPasswordLabelVisible = await page.locator('label.guestEle a:has-text("忘記密碼?")').isVisible();
    console.log(`忘記密碼文案是否存在: ${forgotPasswordLabelVisible}`);
    if (!forgotPasswordLabelVisible) missingElements.push('忘記密碼文案');

    // 检查“登錄”文案是否存在
    const loginButtonVisible = await page.locator('div.submitBtn.btns:has-text("登錄")').isVisible();
    console.log(`登錄文案是否存在: ${loginButtonVisible}`);
    if (!loginButtonVisible) missingElements.push('登錄文案');

    // 检查“沒有帳號？去註冊?”文案是否存在
    const registerTextVisible = await page.locator('div.toRegister:has-text("沒有帳號？去註冊?")').isVisible();
    console.log(`沒有帳號？去註冊?文案是否存在: ${registerTextVisible}`);
    if (!registerTextVisible) missingElements.push('沒有帳號？去註冊?文案');

    // 检查“先去逛逛”与“聯繫客服”是否存在
    const exploreTextVisible = await page.locator('div.z5chi00YrtqjH > div:has-text("先去逛逛")').isVisible();
    console.log(`先去逛逛文案是否存在: ${exploreTextVisible}`);
    if (!exploreTextVisible) missingElements.push('先去逛逛文案');

    const contactSupportTextVisible = await page.locator('div.z5chi00YrtqjH > div:has-text("聯繫客服")').isVisible();
    console.log(`聯繫客服文案是否存在: ${contactSupportTextVisible}`);
    if (!contactSupportTextVisible) missingElements.push('聯繫客服文案');

    // 检查图标并比对大小
    const imagesToCheck = [
        { selector: 'img[src="/res/images/com-q8/q8-icon2.png?v=001"]', description: 'Q8圖標', expectedWidth: 966, expectedHeight: 306 },
        { selector: 'img.login-icon', description: '登入圖標', expectedWidth: 48, expectedHeight: 48 },
        { selector: 'img.login-remove.login-remove1', description: '移除圖標', expectedWidth: 48, expectedHeight: 48 }
    ];

    for (const image of imagesToCheck) {
        const imgSize = await page.evaluate(selector => {
            const img = document.querySelector(selector);
            return img ? { width: img.naturalWidth, height: img.naturalHeight } : null;
        }, image.selector);

        if (imgSize) {
            console.log(`${image.description} 大小: ${imgSize.width}x${imgSize.height}`);
            if (imgSize.width !== image.expectedWidth || imgSize.height !== image.expectedHeight) {
                missingElements.push(`${image.description} (期望: ${image.expectedWidth}x${image.expectedHeight}, 实际: ${imgSize.width}x${imgSize.height})`);
            }
        } else {
            console.log(`${image.description} 未找到`);
            missingElements.push(image.description);
        }
    }

    // 检查密碼圖標是否存在
    const passwordIconVisible = await page.locator('div.password-icon div.iconeye[type="eye"] svg').nth(1).isVisible();
    console.log(`密碼圖標是否存在: ${passwordIconVisible}`);
    if (!passwordIconVisible) missingElements.push('密碼圖標');

    // 打印所有检查结果后再判断是否有错误
    if (missingElements.length > 0) {
        console.log(`以下元素未找到或大小不符: ${missingElements.join(', ')}`);
        expect(missingElements.length, `以下元素未找到或大小不符: ${missingElements.join(', ')}`).toBe(0);
    }

    await page.close();
});

test('註冊頁檢查', async () => {
    const page = await globalThis.context.newPage();

    await page.goto('https://wap-q8-npf2.qit1.net/reg');
    await page.waitForLoadState('networkidle');

    const missingElements = [];

    // 检查文案是否存在
    const labelsToCheck = [
        { selector: 'label:has-text("註冊帳號")', text: '註冊帳號' },
        { selector: 'label:has-text("手機號碼")', text: '手機號碼' },
        { selector: 'label:has-text("驗證碼")', text: '驗證碼' },
        { selector: 'label:has-text("登入密碼")', text: '登入密碼' },
        { selector: 'label:has-text("確認密碼")', text: '確認密碼' }
    ];

    for (const label of labelsToCheck) {
        const labelVisible = await page.locator(label.selector).isVisible();
        console.log(`${label.text} 文案是否存在: ${labelVisible}`);
        if (!labelVisible) missingElements.push(`${label.text} `);
    }

    // 检查输入框 placeholder 是否存在
    const inputsToCheck = [
        { selector: 'input[placeholder="輸入會員帳號"]', text: '輸入會員帳號' },
        { selector: 'input[placeholder="輸入手機號"]', text: '輸入手機號' },
        { selector: 'input[placeholder="密碼為6~16位字符之間"]', text: '密碼為6~16位字符之間' },
        { selector: 'input[placeholder="請與上方的密碼相同"]', text: '請與上方的密碼相同' }
    ];

    for (const input of inputsToCheck) {
        const inputVisible = await page.locator(input.selector).isVisible();
        console.log(`${input.text} 文案: ${inputVisible}`);
        if (!inputVisible) missingElements.push(`${input.text} placeholder`);
    }

    // 检查按钮和链接是否存在
    const elementsToCheck = [
        { selector: 'div.submitBtn:has-text("確認註冊")', text: '確認註冊' },
        { selector: 'div.has-account:has-text("已有帳號？去登入?")', text: '已有帳號？去登入?' }
    ];

    for (const element of elementsToCheck) {
        const elementVisible = await page.locator(element.selector).isVisible();
        console.log(`${element.text} 是否存在: ${elementVisible}`);
        if (!elementVisible) missingElements.push(`${element.text}`);
    }

    // 打印所有检查结果后再判断是否有错误
    if (missingElements.length > 0) {
        console.log(`以下元素未找到或文本不符: ${missingElements.join(', ')}`);
        expect(missingElements.length, `以下元素未找到或文本不符: ${missingElements.join(', ')}`).toBe(0);
    }

    await page.close();
});





test('註冊錯誤流程檢查', async () => {
    const page = await globalThis.context.newPage();
    const errors = [];

    await page.goto('https://wap-q8-npf2.qit1.net/reg');
    await page.waitForLoadState('networkidle');

    // 1-1 只輸入英文或數字
    const usernameInput = page.locator('input[placeholder="輸入會員帳號"]');
    const usernameMessage = page.locator('.message[style*="display: block"]');
    const usernameIcon = page.locator('svg.icon-canname.am-icon-exclamation-circle[style*="display: block"]');

    // 只輸入英文
    await usernameInput.fill('wefkrurtty');
    await usernameInput.press('Tab');
    await page.waitForTimeout(1000); // 增加等待时间
    if (!await usernameMessage.isVisible() || !await usernameIcon.isVisible()) {
        errors.push('只輸入英文: 未顯示 "請輸入6-12個英文字母和數字" 提示或圖標');
    }
    await usernameInput.fill('');

    // 只輸入數字
    await usernameInput.fill('76576586');
    await usernameInput.press('Tab');
    await page.waitForTimeout(1000); // 增加等待时间
    if (!await usernameMessage.isVisible() || !await usernameIcon.isVisible()) {
        errors.push('只輸入數字: 未顯示 "請輸入6-12個英文字母和數字" 提示或圖標');
    }
    await usernameInput.fill('');

    // 點擊發送驗證碼按鈕
    const sendCodeButton = page.locator('div.opt-btn#validate');
    await sendCodeButton.click();

    // 檢查是否出現 "請輸入手機號碼" 提示
    await page.waitForTimeout(1000); // 增加等待时间
    const phoneErrorMessage = page.locator('.am-toast-notice-content .am-toast-text div:has-text("請輸入手機號碼")');
    if (!await phoneErrorMessage.isVisible()) {
        errors.push('點擊發送驗證碼: 未顯示 "請輸入手機號碼" 提示');
    }

    // 1-3 輸入錯誤的手機號碼並點擊發送驗證碼
    const phoneInput = page.locator('input[placeholder="輸入手機號"]');
    await phoneInput.fill('284758394857666');
    await sendCodeButton.click();
    await page.waitForTimeout(1000); // 增加等待时间
    const wrongPhoneErrorMessage = page.locator('.am-toast-notice-content .am-toast-text div:has-text("請輸入正確的手機號碼")');
    if (!await wrongPhoneErrorMessage.isVisible()) {
        errors.push('輸入錯誤的手機號碼: 未顯示 "請輸入正確的手機號碼" 提示');
    }
    await phoneInput.fill('');

    // 2-1 輸入錯誤的驗證碼
    console.log('檢查錯誤驗證碼的提示');
    const username = randomUsername();
    await usernameInput.fill(username);
    const phoneInputHK = randomHongKongPhoneNumber();
    await phoneInput.fill(phoneInputHK);
    await sendCodeButton.click();
    await page.waitForTimeout(1000); // 增加等待时间
    const otpInput = page.locator('input[placeholder="輸入手機驗證碼"]');
    await otpInput.fill('1111');
    const passwordInput = page.locator('input[placeholder="密碼為6~16位字符之間"]');
    await passwordInput.fill('123456');
    const confirmPasswordInput = page.locator('input[placeholder="請與上方的密碼相同"]');
    await confirmPasswordInput.fill('123456');
    const registerButton = page.locator('div.submitBtn');
    await registerButton.click();

    // 等待“加载中”提示消失或“OTP驗証碼錯誤”提示出現
    try {
        await page.waitForSelector('.am-toast-text-info:has-text("載入中")', { state: 'hidden', timeout: 10000 });
    } catch (e) {
        // 如果没有加载中提示，继续检查错误提示
    }
    await page.waitForTimeout(1000); // 增加等待时间

    const otpErrorMessage = page.locator('.am-toast-text-info:has-text("OTP驗証碼錯誤")');
    if (!await otpErrorMessage.isVisible()) {
        errors.push('輸入錯誤的驗證碼: 未顯示 "OTP驗証碼錯誤" 提示');
    }

    // 2-2 輸入不一致的密碼
    console.log('檢查不一致的密碼提示');
    await usernameInput.fill(username);
    await phoneInput.fill(phoneInputHK);
    await otpInput.fill('1234'); // 使用随便一个验证码
    await passwordInput.fill('123456');
    await confirmPasswordInput.fill('1234567');
    await registerButton.click();
    await page.waitForTimeout(1000); // 增加等待时间

    const passwordMismatchMessage = page.locator('.am-toast-text:has-text("您兩次輸入的密碼不一致")');
    if (!await passwordMismatchMessage.isVisible()) {
        errors.push('輸入不一致的密碼: 未顯示 "您兩次輸入的密碼不一致" 提示');
    }

    // 2-3 輸入短密碼
    console.log('檢查短密碼提示');
    await usernameInput.fill(username);
    await phoneInput.fill(phoneInputHK);
    await otpInput.fill('1234'); // 使用随便一个验证码
    await passwordInput.fill('12345');
    await confirmPasswordInput.fill('12345');
    await registerButton.click();
    await page.waitForTimeout(1000); // 增加等待时间

    const shortPasswordMessage = page.locator('.am-toast-text:has-text("密碼長度不能小於6位")');
    if (!await shortPasswordMessage.isVisible()) {
        errors.push('輸入短密碼: 未顯示 "密碼長度不能小於6位" 提示');
    }

    // 打印所有錯誤訊息
    if (errors.length > 0) {
        console.log('以下是檢測到的錯誤:');
        errors.forEach(error => console.error(error));
    } else {
        console.log('所有檢查項目均通過');
    }

    expect(errors.length).toBe(0); // 確保沒有錯誤
});


test('註冊正確流程檢查', async () => {
    const page = await globalThis.context.newPage();
    const errors = [];

    await page.goto('https://wap-q8-npf2.qit1.net/reg');
    await page.waitForLoadState('networkidle');

    // 生成随机用户名，固定密码
    const username = randomUsername();
    const password = '396012';

    // 填写表单
    const usernameInput = page.locator('input[placeholder="輸入會員帳號"]');
    await usernameInput.fill(username);

    const phoneInput = page.locator('input[placeholder="輸入手機號"]');
    const phoneInputHK = randomHongKongPhoneNumber();
    console.log(`生成的隨機手機號: ${phoneInputHK}`);
    await phoneInput.fill(phoneInputHK);

    const sendCodeButton = page.locator('div.opt-btn#validate');
    await sendCodeButton.click();

    // 等待验证码发送请求完成
    await page.waitForTimeout(5000);

    // 获取验证码
    const otpCode = await fetchVerificationCode(phoneInputHK.slice(-8)); // 传入生成的手机号码
    console.log(`获取到的簡訊驗證碼: ${otpCode}`);
    if (!otpCode) {
        errors.push('无法获取验证码');
    } else {
        const otpInput = page.locator('input[placeholder="輸入手機驗證碼"]');
        await otpInput.fill(otpCode);
    }

    const passwordInput = page.locator('input[placeholder="密碼為6~16位字符之間"]');
    await passwordInput.fill(password);

    const confirmPasswordInput = page.locator('input[placeholder="請與上方的密碼相同"]');
    await confirmPasswordInput.fill(password);

    const registerButton = page.locator('div.submitBtn');
    await registerButton.click();

    // 等待所有消息提示消失
    const messages = page.locator('.am-toast-text-info');

    // 检查是否出现“註冊成功”或“登入成功”提示
    let successMessageVisible = false;
    let successMessageContent = '';
    const checkMessages = async () => {
        const allMessages = await messages.allTextContents();
        const successMessage = allMessages.find(message => message.includes('註冊成功') || message.includes('登入成功'));
        if (successMessage) {
            successMessageVisible = true;
            successMessageContent = successMessage;
        }
        return successMessageVisible;
    };

    for (let i = 0; i < 30; i++) {
        if (await checkMessages()) {
            break;
        }
        await page.waitForTimeout(1000); // 每秒检查一次
    }

    if (!successMessageVisible) {
        errors.push('註冊失敗: 未顯示 "註冊成功" 或 "登入成功" 提示');
    } else {
        console.log(`捕獲到的成功訊息: ${successMessageContent}`);
    }

    // 打印所有错误信息
    if (errors.length > 0) {
        console.log('以下是檢測到的錯誤:');
        errors.forEach(error => console.error(error));
    } else {
        console.log('所有檢查項目均通過');
    }

    expect(errors.length).toBe(0); // 確保沒有錯誤
});


test('首頁體育下注(注额15)', async () => {
    const page = await globalThis.context.newPage();

    await page.goto('https://wap-q8-npf2.qit1.net/hall');
    await page.waitForLoadState('networkidle');

    // 找到第二个 .gameRate-card 元素
    const gameRateCards = page.locator('.gameRate-card');
    const targetCard = gameRateCards.nth(1);

    // 获取 winlose 和 fontWeight 的文本内容并打印
    const combinedText = await targetCard.evaluate(card => {
        const winlose = card.querySelector('.winlose').textContent.trim();
        const fontWeight = card.querySelector('.fontWeight').textContent.trim();
        return `${winlose}/${fontWeight}`;
    });
    console.log(`下注赔率: ${combinedText}`);

    // 检查是否找到了 targetCard
    const targetCardExists = await targetCard.count() > 0;
    console.log(`賠率框架: ${targetCardExists}`);
    expect(targetCardExists, '未找到賠率框架').toBeTruthy();

    // 点击第二个 .gameRate-card 元素
    await targetCard.click();

    // 检查计算器是否显示
    await page.waitForSelector('.calculator.active');
    const calculatorVisible = await page.isVisible('.calculator.active');
    console.log(`虛擬鍵盤: ${calculatorVisible}`);
    expect(calculatorVisible, '虛擬鍵盤未顯示').toBeTruthy();

    // 点击数字“1”和“5”
    await page.locator('.typeNumer div:has-text("1")').first().click();
    await page.locator('.typeNumer div:has-text("5")').first().click();

    // 检查并点击“接受更改”或“投注”按钮
    const updateOddsButton = page.locator('button.updateOdds_btn');
    const acceptButton = page.locator('button.accept');

    const isUpdateOddsVisible = await updateOddsButton.isVisible();
    if (isUpdateOddsVisible) {
        console.log('点击“接受更改”按钮');
        await updateOddsButton.click();
        await page.waitForSelector('button.accept', { state: 'visible' });
    }

    const acceptButtonExists = await acceptButton.isVisible();
    console.log(`投注按钮: ${acceptButtonExists}`);
    expect(acceptButtonExists, '未找到投注按钮').toBeTruthy();
    await acceptButton.click();

    // 跳过“投注中”消息
    await page.waitForSelector('.am-toast-text-info:has-text("投注中")', { state: 'hidden' });

    // 检查第二个提示消息并确认是否为“投注成功”
    const successMessageSelector = '.am-toast-notice-content .am-toast-text div:has-text("投注成功")';
    const errorMessageSelector = '.am-toast-text:has(svg.am-icon-fail) .am-toast-text-info';

    let successMessageVisible = await page.isVisible(successMessageSelector);

    if (successMessageVisible) {
        console.log('投注成功');
        await page.close();
        return; // 测试通过，结束测试
    } else {
        const errorMessage = await page.locator(errorMessageSelector).innerText();
        console.log(`提示訊息: ${errorMessage}`);

        await acceptButton.click(); // 再次点击“投注”按钮

        // 再次跳过“投注中”消息
        await page.waitForSelector('.am-toast-text-info:has-text("投注中")', { state: 'hidden' });

        // 再次检查第二个提示消息
        successMessageVisible = await page.isVisible(successMessageSelector);

        if (successMessageVisible) {
            console.log('投注成功');
            await page.close();
            return;
        } else {
            const secondErrorMessage = await page.locator(errorMessageSelector).innerText();
            console.log(`第二次提示訊息: ${secondErrorMessage}`);
            expect(successMessageVisible, `投注失败，提示信息: ${secondErrorMessage}`).toBeTruthy();
        }
    }

    await page.close();
});



test('檢查首頁', async () => {
    const page = await globalThis.context.newPage();

    // 导航到目标页面
    await page.goto('https://wap-q8-npf2.qit1.net/hall');
    await page.waitForLoadState('networkidle');
    const missingElements = [];
    // 要检查的 alt 属性列表
    const altAttributes = ['足球', '籃球', '網球', '棒球', 'gift', 'sponsor'];

    for (const alt of altAttributes) {
        const img = page.locator(`img[alt="${alt}"]`);
        const count = await img.count();
        if (count > 0) {
            const isVisible = await img.first().isVisible();
            console.log(`${alt}:${isVisible}`);
            if (!isVisible) {
                missingElements.push(`icon ${alt}`);
            }
        } else {
            console.log(`icon ${alt} 不存在`);
            missingElements.push(`icon ${alt}`);
        }
    }
    // 要检查的底部菜单项
    const footerLabels = ['首頁', '娛樂城', '走地', '客服', '個人中心'];

    for (const label of footerLabels) {
        const footerItem = page.locator(`.footer-item:has-text("${label}")`);
        const count = await footerItem.count();
        if (count > 0) {
            const isVisible = await footerItem.first().isVisible();
            console.log(`${label}:${isVisible}`);
            if (!isVisible) {
                missingElements.push(`底部项目 ${label}`);
            }
        } else {
            console.log(`底部项目 ${label} 不存在`);
            missingElements.push(`底部项目 ${label}`);
        }
    }
    // 检查其他指定元素
    const elementsToCheck = [
        { selector: 'img[alt="banner"]', description: 'banner' },
        { selector: 'button.deposit', description: '存款按钮' },
        { selector: 'button.logout', description: '登出按钮' },
        { selector: '.sportDetails_nav:first-child', description: '體育的第一場賽事' }
    ];

    for (const element of elementsToCheck) {
        const locator = page.locator(element.selector);
        const count = await locator.count();
        if (count > 0) {
            const isVisible = await locator.first().isVisible();
            console.log(`${element.description}:${isVisible}`);
            if (!isVisible) {
                missingElements.push(`${element.description}`);
            }
        } else {
            console.log(`${element.description} 不存在`);
            missingElements.push(`${element.description}`);
        }
    }

    await page.close();

    if (missingElements.length > 0) {
        throw new Error(`以下元素不存在: ${missingElements.join(', ')}`);
    }
});




test('檢查娛樂城', async () => {
    const page = await globalThis.context.newPage();
    // 導航到首頁
    await page.goto('https://wap-q8-npf2.qit1.net/sportEvents');
    await page.waitForLoadState('networkidle');
    // 檢查並關閉彈窗
    let closeButtonVisible = true;
    while (closeButtonVisible) {
        const closeButton = page.locator('svg path[fill="#999"]').first();
        closeButtonVisible = await closeButton.isVisible();
        if (closeButtonVisible) {
            await closeButton.click();
            console.log('關閉廣告');
            // 等待彈窗消失並檢查是否還有彈窗存在
            await page.waitForTimeout(1000); // 可以根據需要調整等待時間
        }
    }
    // 檢查首頁的banner元素
    const banner = page.locator('.banner img.banImg');
    const bannerExists = await banner.count() > 0;
    console.log(`banner框架: ${bannerExists}`);
    expect(bannerExists, 'banner框架').toBeTruthy();

    // 檢查跑馬燈元素
    const marquee = page.locator('.marqee');
    const marqueeExists = await marquee.count() > 0;
    console.log(`跑馬燈: ${marqueeExists}`);
    expect(marqueeExists, '未找到跑馬燈').toBeTruthy();

    const categories = ['真人', '體育', '電子', '棋牌', '電競', '捕魚', '實況'];

    for (const category of categories) {
        const labelLocator = page.locator(`.categoryType .label:has-text("${category}")`);
        const count = await labelLocator.count();
        const isVisible = count > 0 && await labelLocator.first().isVisible();
        console.log(`${category} : ${isVisible}`);
        expect(isVisible, `${category} 不存在`).toBeTruthy();
    }
    const gameNamesToCheck = [
        'JOKER捕魚',
        '小艾電競',
        'EVO真人',
        'DG真人',
        'SEXY真人',
        'WM真人',
        'Motivation真人',
        'OB真人',
        'WE真人',
        '皇冠體育',
        'SBO體育',
        // '港體會體育',
        // 'OB彩票',
        'KA電子',
        'PP電子',
        'SWG 電子',
        'TPG電子',
        'PG電子',
        'JOKER電子',
        'MW電子',
        '博樂棋牌',
        'VG棋牌',
        'OB棋牌',
        '香港麻將館',
        '百勝棋牌',
        '樂遊棋牌',
        '開元棋牌',
        '雷火電競',
        'CQ9捕魚',
        'TPG捕魚',
        '百勝捕魚',
        'SWG 捕魚'
    ];

    // 檢查每個指定的 gameName 元素是否存在
    for (const gameName of gameNamesToCheck) {
        const gameNameLocator = page.locator(`.gameName:has-text("${gameName}")`);
        const gameNameExists = await gameNameLocator.count() > 0;
        console.log(`(${gameName}): ${gameNameExists}`);
        expect(gameNameExists, `未找到 gameName (${gameName})`).toBeTruthy();
    }
    // 檢查每日簽到
    const checkInImage = page.locator('img[alt="每日簽到"]');
    const checkInText = page.locator('span.hasData:has-text("每日簽到")');
    const checkInImageExists = await checkInImage.count() > 0;
    const checkInTextExists = await checkInText.count() > 0;
    console.log(`每日簽到圖片: ${checkInImageExists}`);
    console.log(`每日簽到文案: ${checkInTextExists}`);
    expect(checkInImageExists, '未找到每日簽到圖片').toBeTruthy();
    expect(checkInTextExists, '未找到每日簽到文字').toBeTruthy();

    // 檢查紅包
    // const redEnvelopeImage = page.locator('img[src="/res/images/red-envelope.png"]');
    // const redEnvelopeText = page.locator('div.redEnvelope-entrance-text:has-text("紅包包包包")');
    // const redEnvelopeImageExists = await redEnvelopeImage.count() > 0;
    // const redEnvelopeTextExists = await redEnvelopeText.count() > 0;
    // console.log(`紅包圖片: ${redEnvelopeImageExists}`);
    // console.log(`紅包文案${redEnvelopeTextExists}`);
    // expect(redEnvelopeImageExists, '未找到紅包圖片').toBeTruthy();
    // expect(redEnvelopeTextExists, '未找到紅包文字').toBeTruthy();

    // 檢查幸運輪
    const luckyWheel = page.locator('div.center-icon.zh-TW');
    const luckyWheelExists = await luckyWheel.count() > 0;
    console.log(`幸運輪: ${luckyWheelExists}`);
    expect(luckyWheelExists, '未找到幸運輪').toBeTruthy();
    await page.close();
});





test('檢查個人頁icon圖片', async () => {
    const page = await globalThis.context.newPage();
    // 导航到个人页面
    await page.goto('https://wap-q8-npf2.qit1.net/accountCenter');
    await page.waitForLoadState('networkidle');

    const iconsToCheck = [
        { text: '優惠活動', class: 'icon-promotion', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-promotion2.png' },
        { text: '加入我們', class: 'icon-friend', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-friend.png' },
        { text: '返水領取', class: 'icon-getrebate', url: "https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-getrebate.png" },
        { text: 'VIP福利', class: 'icon-rebate', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-rebate.png' },
        { text: '每日盈虧數據', class: 'icon-profit', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-profit.png' },
        { text: '充提記錄', class: 'icon-history', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-history.png' },
        { text: '錢包交易紀錄', class: 'icon-statement', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-statement.png' },
        { text: '綁定銀行卡', class: 'icon-bank-card', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-bank-card.png' },
        { text: '遊戲投注數據', class: 'icon-record', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-record.png' },
        // { text: '推廣鏈結', class: 'icon-invitefriend', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-friend2.png?t=21491204' },
        // { text: '全民代理', class: 'icon-friend2', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-friend2.png' },
        // { text: '推薦好友', class: 'icon-friend2', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-friend2.png' },
        // { text: '好友推廣鏈結', class: 'icon-friend2', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-friend2.png' },
        { text: '賽果查詢', class: 'icon-game-result', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-game-result.png' },
        { text: '語言選擇', class: 'icon-language', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-language.png' }
    ];

    const errors = [];

    for (const { text, class: iconClass, url } of iconsToCheck) {
        const iconElement = page.locator(`.main-label:has(.main-label-text:has-text("${text}")) .${iconClass}`);
        const iconExists = await iconElement.count() > 0;
        console.log(`${text} 是否存在: ${iconExists}`);

        // 如果元素不存在，记录错误信息
        if (!iconExists) {
            errors.push(`${text} 图标不存在`);
            continue;
        }

        // 如果元素存在，检查其背景图片是否存在
        let backgroundImage = '';
        if (iconExists) {
            backgroundImage = await iconElement.evaluate(el => {
                const styles = window.getComputedStyle(el);
                return styles.backgroundImage;
            });
            console.log(`${text} 背景图片: ${backgroundImage}`);
        }

        // 断言背景图片是否符合预期
        if (backgroundImage !== `url("${url}")`) {
            errors.push(`${text} 背景图片不正确，预期: url("${url}")，实际: ${backgroundImage}`);
        }

        // 获取图片大小
        const { width, height } = await iconElement.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
        });

        console.log(`${text} 图片大小: 宽度=${width}px, 高度=${height}px`);

        // 断言图片大小是否正确
        if (width !== 27 || height !== 27) {
            errors.push(`${text} 图片大小不正确，宽度=${width}px, 高度=${height}px`);
        }
    }

    // 打印所有错误
    if (errors.length > 0) {
        console.error('以下是检测到的错误:');
        errors.forEach(error => console.error(error));
    }

    // 确保没有错误
    expect(errors.length, `以下是检测到的错误: ${errors.join(', ')}`).toBe(0);
});




test('檢查個人頁並點擊各個鏈接', async () => {
    const page = await globalThis.context.newPage();
    const missingCategories = [];
    const errorMessages = [];
    const checkedLabels = new Set();

    // 导航到个人页面
    await page.goto('https://wap-q8-npf2.qit1.net/accountCenter');
    await page.waitForLoadState('networkidle');

    const categoriesToCheck = [
        { label: 'uitest001', selector: 'text=uitest001' },
        { label: 'VIP', selector: 'text=VIP' },
        { label: '錢包餘額', selector: 'text=錢包餘額' },
        { label: '上次提款金額', selector: 'text=上次提款金額' },
        { label: '優惠申請大廳', selector: '.promote .label:text("優惠申請大廳")' },
        { label: '錢包中心', selector: '.functional-buttons .label:text("錢包中心")' },
        { label: '存款', selector: '.functional-buttons .label:text("存款")' },
        { label: '提款', selector: '.functional-buttons .label:text("提款")' },
        // { label: '合營代理', selector: 'text=合營代理' },
        { label: '返水領取', selector: 'text=返水領取' },
        { label: 'VIP福利', selector: 'text=VIP福利' },
        { label: '每日盈虧數據', selector: 'text=每日盈虧數據' },
        { label: '充提記錄', selector: 'text=充提記錄' },
        { label: '錢包交易紀錄', selector: 'text=錢包交易紀錄' },
        { label: '綁定銀行卡', selector: 'text=綁定銀行卡' },
        { label: '遊戲投注數據', selector: 'text=遊戲投注數據' },
        // { label: '推廣鏈結', selector: 'text=推廣鏈結' },
        // { label: '全民代理', selector: 'text=全民代理' },
        // { label: '推薦好友', selector: 'text=推薦好友' },
        // { label: '好友推廣鏈結', selector: 'text=好友推廣鏈結' },
        { label: '賽果查詢', selector: 'text=賽果查詢' },
        { label: '語言選擇', selector: 'text=語言選擇' }
    ];

    const categoriesToClick = [
        { label: '優惠申請大廳', selector: '.promote .label:text("優惠申請大廳")' },
        { label: '錢包中心', selector: '.functional-buttons .label:text("錢包中心")' },
        { label: '存款', selector: '.functional-buttons .label:text("存款")' },
        { label: '提款', selector: '.functional-buttons .label:text("提款")' },
        // { label: '合營代理', selector: 'text=合營代理' },
        { label: '返水領取', selector: 'text=返水領取' },
        { label: 'VIP福利', selector: 'text=VIP福利' },
        { label: '每日盈虧數據', selector: 'text=每日盈虧數據' },
        { label: '充提記錄', selector: 'text=充提記錄' },
        { label: '錢包交易紀錄', selector: 'text=錢包交易紀錄' },
        { label: '綁定銀行卡', selector: 'text=綁定銀行卡' },
        { label: '遊戲投注數據', selector: 'text=遊戲投注數據' },
        // { label: '推廣鏈結', selector: 'text=推廣鏈結' },
        // { label: '全民代理', selector: 'text=全民代理' },
        // { label: '推薦好友', selector: 'text=推薦好友' },
        // { label: '好友推廣鏈結', selector: 'text=好友推廣鏈結' },
        { label: '賽果查詢', selector: 'text=賽果查詢' },
        { label: '語言選擇', selector: 'text=語言選擇' }
    ];

    // 检查标签是否存在
    for (const category of categoriesToCheck) {
        const elementExists = await page.locator(category.selector).count() > 0;
        console.log(`${category.label} 文案是否存在: ${elementExists}`);
        if (!elementExists) {
            missingCategories.push(category.label);
        }
        checkedLabels.add(category.label);
    }

    // 点击标签并检查错误消息
    for (const category of categoriesToClick) {
        const elementExists = await page.locator(category.selector).count() > 0;
        console.log(`${category.label} 链接是否存在: ${elementExists}`);
        if (elementExists) {
            const exactMatch = await page.locator(category.selector).first();
            await exactMatch.click();
            console.log(`点击 ${category.label} 链接`);

            // 等待“加载中”消息消失
            try {
                await page.waitForSelector('.am-toast-text-info:has-text("載入中")', { state: 'hidden', timeout: 10000 });
            } catch (e) {
                // 无需在这里打印日志，只需继续检查错误消息
            }

            // 检查是否有错误消息
            const errorMessageVisible = await page.isVisible('.am-toast-text:has(svg.am-icon-fail) .am-toast-text-info');
            if (errorMessageVisible) {
                const errorMessage = await page.locator('.am-toast-text:has(svg.am-icon-fail) .am-toast-text-info').innerText();
                errorMessages.push(`${category.label}: ${errorMessage}`);
                console.log(`${category.label} 点击后报错: ${errorMessage}`);
            } else {
                console.log(`${category.label} 点击后无错误`);
            }

            // 返回个人页面
            await page.goto('https://wap-q8-npf2.qit1.net/accountCenter');
            await page.waitForLoadState('networkidle');
        } else if (!checkedLabels.has(category.label)) {
            missingCategories.push(category.label);
            console.log(`${category.label} 链接未找到`);
        }
    }

    // 打印缺少的标签
    if (missingCategories.length > 0) {
        console.log(`以下標籤未找到: ${missingCategories.join(', ')}`);
    }

    // 打印错误消息
    if (errorMessages.length > 0) {
        console.log(`以下標籤點擊跳轉過去後報錯: ${errorMessages.join(', ')}`);
    }

    // 统一报告错误
    const totalErrors = missingCategories.length + errorMessages.length;
    if (totalErrors > 0) {
        const allErrors = [...missingCategories, ...errorMessages].join(', ');
        expect(totalErrors, `以下標籤未找到或鏈接點擊跳轉後報錯: ${allErrors}`).toBe(0);
    }

    await page.close();
});



test('檢查個人頁並點擊錢包中心', async () => {
    const page = await globalThis.context.newPage();

    // 导航到个人页面
    await page.goto('https://wap-q8-npf2.qit1.net/accountCenter');
    await page.waitForLoadState('networkidle');

    // 点击“錢包中心”并检查
    const feature = { label: '錢包中心', icon: '.icon.icon-transfer', name: 'uitest001', balanceLabel: '錢包餘額' };

    const iconElement = page.locator(feature.icon);
    await iconElement.click();

    // 检查是否有错误消息
    const errorMessageSelector = '.am-toast-text:has(svg.am-icon-fail) .am-toast-text-info';
    const errorMessageVisible = await page.isVisible(errorMessageSelector);

    if (errorMessageVisible) {
        const errorMessage = await page.locator(errorMessageSelector).innerText();
        console.log(`错误消息: ${feature.label}: ${errorMessage}`);
        expect(errorMessageVisible).toBeFalsy(); // 失败测试
    }

    // 检查帳號標籤、帳號、錢包餘額
    const accountLabel = await page.locator('.total_account span:has-text("帳號")').count() > 0;
    const accountName = await page.locator('.txt_account').innerText();
    const walletBalanceLabel = await page.locator('.total_account span:has-text("錢包餘額")').count() > 0;

    console.log(`帳號標籤: ${accountLabel}`);
    console.log(`帳號: ${accountName}`);
    console.log(`錢包餘額標籤: ${walletBalanceLabel}`);

    expect(accountLabel).toBeTruthy();
    expect(accountName).toBe('uitest001');
    expect(walletBalanceLabel).toBeTruthy();

    // 检查每个游戏的名称和图标
    const gameNames = [
        'CQ9電子餘額', 'Motivation真人餘額', '樂遊棋牌餘額', '開元棋牌餘額', 'PG電子餘額',
        '小艾電競餘額', 'JOKER電子餘額', 'DG真人餘額', 'JDB/SPRIBE餘額', '百勝棋牌餘額',
        '香港麻將館餘額', 'OB棋牌餘額', '利記體育餘額', 'SEXY餘額',
        '皇冠餘額', 'WM餘額', '雷火餘額', 'VG餘額', 'EVO餘額', '鬥雞餘額', 'KA餘額',
        '博樂餘額', 'MW餘額', 'WE餘額', 'PP餘額', 'SWG餘額', 'TPG餘額', 'OB真人餘額',
        'RCB賽馬餘額',
    ];

    for (const game of gameNames) {
        const gameExists = await page.locator(`span:has-text("${game}")`).count() > 0;
        console.log(`${game}: ${gameExists}`);
        expect(gameExists).toBeTruthy();
    }

    // 检查每个游戏的 icon-reload 和 btnCoin
    const gameItems = await page.locator('.myQuotaList li');

    for (let i = 0; i < await gameItems.count(); i++) {
        const gameItem = gameItems.nth(i);
        const maintenanceExists = await gameItem.locator('.txt_maintenance').count() > 0;

        if (maintenanceExists) {
            console.log(`第 ${i + 1} 個遊戲正在維護中`);
            continue;
        }

        const reloadIconExists = await gameItem.locator('.icon_recycle #icon-reload').count() > 0;
        const btnCoinExists = await gameItem.locator('.btnCoin:has-text("返回主帳號")').count() > 0;

        console.log(`第 ${i + 1} 個遊戲的 重整按鈕 是否存在: ${reloadIconExists}`);
        console.log(`第 ${i + 1} 個遊戲的 返回主帳號按鈕 是否存在: ${btnCoinExists}`);

        expect(reloadIconExists).toBeTruthy();
        expect(btnCoinExists).toBeTruthy();
    }

    // 点击“一鍵轉回”按钮
    const oneClickTransferButton = page.locator('.money_back .icon-money');
    await oneClickTransferButton.click();

    // 检查是否有错误消息
    const transferErrorMessageVisible = await page.isVisible(errorMessageSelector);
    if (transferErrorMessageVisible) {
        const transferErrorMessage = await page.locator(errorMessageSelector).innerText();
        console.log(`轉回錯誤消息: ${transferErrorMessage}`);
        expect(transferErrorMessageVisible).toBeFalsy(); // 失败测试
    }

    // 等待提交中消息消失
    await page.waitForSelector('.am-toast-text-info:has-text("提交中")', { state: 'hidden', timeout: 10000 });

    // 检查转账成功消息
    const successMessageSelector = '.am-toast-text:has(svg.am-icon-success) .am-toast-text-info';
    const successMessageVisible = await page.isVisible(successMessageSelector);
    const successMessage = await page.locator(successMessageSelector).innerText();
    console.log(`轉換消息: ${successMessage}`);
    expect(successMessage).toBe('轉換成功');

    await page.close();
});




test('檢查個人頁並點擊存款', async () => {
    const page = await globalThis.context.newPage();

    // 导航到个人页面
    await page.goto('https://wap-q8-npf2.qit1.net/accountCenter');
    await page.waitForLoadState('networkidle');
    const missingElements = [];

    // 检查并点击存款按钮
    const depositIconVisible = await page.locator('.icon.icon-deposit').isVisible({ timeout: 5000 });
    console.log(`存款圖標是否可見: ${depositIconVisible}`);
    if (!depositIconVisible) missingElements.push('存款圖標');

    const depositLabelVisible = await page.locator('.label:has-text("存款")').isVisible({ timeout: 5000 });
    console.log(`存款標籤是否可見: ${depositLabelVisible}`);
    if (!depositLabelVisible) missingElements.push('存款標籤');

    await page.locator('.icon.icon-deposit').click();
    await page.waitForLoadState('networkidle');

    // 要检查的元素及其描述
    const elementsToCheck = [
        { selector: '.tit:has-text("存款")', description: '存款頁面標題' },
        { selector: '.am-list.currentFps .am-list-header:has-text("FPS(轉數快")', description: 'FPS(轉數快)標題' },
        { selector: '.am-list.currentFps .am-list-item:has-text("轉數快")', description: '轉數快選項' },
        { selector: '.am-list.currentFps .am-list-item:has-text("數字樂測試")', description: '數字樂測試選項' },
        { selector: '.am-list-header:has-text("轉帳充值")', description: '轉帳充值標題' },
        { selector: '.am-list-content:has-text("銀行轉帳通道")', description: '銀行轉帳通道内容' },
        { selector: '.am-list-header:has-text("門市付款")', description: '門市付款標題' },
        { selector: '.am-list-content:has-text("門市付款")', description: '門市付款内容' },
        { selector: '.am-list-header:has-text("加密貨幣充值")', description: '加密貨幣充值標題' },
        // { selector: '.am-list-content:has-text("TRC20 充值")', description: 'TRC20 充值选项' },
        { selector: '.am-list-content:has-text("ERC20 充值")', description: 'ERC20 充值选项' }
    ];

    // 检查每个元素是否可见
    for (const element of elementsToCheck) {
        await page.locator(element.selector).scrollIntoViewIfNeeded();
        const isVisible = await page.locator(element.selector).isVisible({ timeout: 10000 });
        console.log(`${element.description} 是否可见: ${isVisible}`);
        if (!isVisible) missingElements.push(element.description);
        await page.waitForTimeout(500);
    }

    // 检查图片大小
    const imagesToCheck = [
        { selector: 'img[src="/res/images/com-q8/icon-bank.png"]', description: '銀行圖標', expectedWidth: 100, expectedHeight: 100 },
        { selector: 'img[src="/res/images/icon-quickly-pay.png"]', description: '轉數快圖標', expectedWidth: 130, expectedHeight: 113 },
        { selector: 'img[src="/res/images/com-q8/icon-cvs-pay.png"]', description: '門市付款圖標', expectedWidth: 100, expectedHeight: 100 },
        { selector: 'img[src="/res/images/com-q8/icon-usdt-shield.png"]', description: 'USDT 圖標', expectedWidth: 1024, expectedHeight: 1024 },
        { selector: 'img[src="/res/images/com-q8/coin.png"]', description: '金幣圖標', expectedWidth: 114, expectedHeight: 114 },
        { selector: 'img[src="/res/images/com-q1/account-center/icon-alert.png"]', description: '驚嘆號圖標', expectedWidth: 20, expectedHeight: 21 }
    ];

    for (const image of imagesToCheck) {
        const imgSize = await page.evaluate(selector => {
            const img = document.querySelector(selector);
            return img ? { width: img.naturalWidth, height: img.naturalHeight } : null;
        }, image.selector);

        if (imgSize) {
            console.log(`${image.description} 大小: ${imgSize.width}x${imgSize.height}`);
            if (imgSize.width !== image.expectedWidth || imgSize.height !== image.expectedHeight) {
                missingElements.push(`${image.description} 大小不正确`);
            }
        } else {
            console.log(`${image.description} 未找到`);
            missingElements.push(image.description);
        }
    }

    // 打印所有检查结果后再判断是否有错误
    if (missingElements.length > 0) {
        console.log(`以下元素未找到或大小不正确: ${missingElements.join(', ')}`);
        expect(missingElements.length, `元素未找到或icon大小不正确: ${missingElements.join(', ')}`).toBe(0);
    }

    await page.close();
});



test('檢查關於樂古娛樂', async () => {
    const page = await globalThis.context.newPage();

    // 导航到个人页面
    await page.goto('https://wap-q8-npf2.qit1.net/accountCenter');
    await page.waitForLoadState('networkidle');

    const missingElements = [];

    // 檢查 .icon.icon-alert.logo 並檢查大小
    const logo = await page.locator('.icon.icon-alert.logo').first();
    const logoVisible = await logo.isVisible();
    console.log(`樂古娛樂icon 是否存在: ${logoVisible}`);
    if (logoVisible) {
        const logoSize = await logo.evaluate(element => {
            return {
                width: element.offsetWidth,
                height: element.offsetHeight
            };
        });
        console.log(`樂古娛樂icon大小: ${logoSize.width}x${logoSize.height}`);
        const expectedWidth = 50;
        const expectedHeight = 20;
        if (logoSize.width !== expectedWidth || logoSize.height !== expectedHeight) {
            missingElements.push(`icon 大小不符 (期望: ${expectedWidth}x${expectedHeight}, 實際: ${logoSize.width}x${logoSize.height})`);
        }
    } else {
        missingElements.push('icon');
    }

    // 檢查並點擊“關於 港體會”按鈕
    const aboutButton = await page.locator('.main-label .main-label-text', { hasText: '關於 樂古娛樂' }).first();
    const aboutButtonVisible = await aboutButton.isVisible();
    console.log(`關於 樂古娛樂按鈕是否存在: ${aboutButtonVisible}`);
    if (!aboutButtonVisible) {
        missingElements.push('關於 樂古娛樂按鈕');
    } else {
        await aboutButton.click();
    }

    // 檢查彈窗中的所有文案和圖片大小
    await page.waitForSelector('.about-container', { state: 'visible' });

    const textsToCheck = [
        { text: '博彩責任', tag: 'div.about-heading' },
        { text: '博彩責任', tag: 'p.about-heading' },
        '樂古娛樂致力於忠誠與可信賴的博彩保證。我們公司遵從遠端博彩管理當局的適用法規以及指引，而且努力成為對社會負責任的遠端博彩運營公司。遠程博彩是全球數以百萬玩家的合法娛樂體驗。對大多數玩家來說，遠端博彩是一項令人愉快的體驗，不過，我們也接受這樣的現實，少部分沈迷在遠端博彩的玩家可能會未達到法定年齡或者出現由於博彩而影響了他們的生活或財務狀況的問題。作為一個對社會負責的公司意味著要關注我們的玩家，意味著要對可能對社會產生影響的問題採用主動的方法去解決。這正是為何樂古娛樂會採用並完全承諾執行以下最嚴格的程式和限制。',
        '執行政策',
        '對未成年人的訪問限制',
        '我們承諾將盡我們所能而同時也需要您的協助做到以下這些',
        '1、使用兒童保護軟體從可能被未成年人使用的電腦上遮罩遠端博彩網站。',
        '2、當您的電腦登入到遠端博彩網站時不要讓電腦處於無人在旁的狀況。',
        '3、不要告知未成年人您的信用卡或銀行帳戶的詳細資料。',
        '4、不要在實發體育登入頁面上讓“保存密碼”選項生效。',
        '5、在電腦上為未成年人建立獨立的登入檔案，令他們登入時無法訪問您的資料。',
        '6、如果您知道有人未滿18歲（或未滿他們所屬司法管轄地區法定年齡）但錯誤地註冊成為我們的玩家，請立刻通知我們。',
        '運營資質',
        '樂古娛樂要求新客戶申明他們已經達到他們所屬的司法管轄地區規定的法定年齡且至少年滿18歲。當我們懷疑客戶可能虛假申報或可能有未成年人試圖使用我們的服務時，我們會使用合理的方法進一步進行驗證。',
        '樂古娛樂不會允許任何未滿18歲的人士使用我們的服務。此政策完全遵從並滿足監管和給我們發放運營牌照的遠端博彩管理當局，First Cagayan Leisure and Resort Corporation (FCRLC) for the Cagayan Economic Zone Authority (CEZA), of Santa Ana, Cagayan，Philippines的規則和規定；'
    ];

    const normalizeText = (text) => {
        return text.replace(/[^\w\s]/gi, '').replace(/\s+/g, '');
    };

    for (const item of textsToCheck) {
        let textVisible;
        if (typeof item === 'string') {
            const normalizedItem = normalizeText(item);
            const locator = await page.locator('body').evaluate((body, text) => {
                const regex = new RegExp(text, 'i');
                return regex.test(body.innerText.replace(/[^\w\s]/gi, '').replace(/\s+/g, ''));
            }, normalizedItem);
            textVisible = locator;
            console.log(`文案 "${item}" 是否存在: ${textVisible}`);
            if (!textVisible) missingElements.push(`文案 "${item}"`);
        } else {
            const normalizedItem = normalizeText(item.text);
            const locator = await page.locator(`${item.tag}`).evaluateAll((elements, text) => {
                const regex = new RegExp(text, 'i');
                return elements.some(element => regex.test(element.innerText.replace(/[^\w\s]/gi, '').replace(/\s+/g, '')));
            }, normalizedItem);
            textVisible = locator;
            console.log(`文案 "${item.text}" (${item.tag}) 是否存在: ${textVisible}`);
            if (!textVisible) missingElements.push(`文案 "${item.text}" (${item.tag})`);
        }
    }

    // 检查图片大小
    const imagesToCheck = [
        { selector: 'img[src="/res/images/about-footer-1.png"]', description: 'icon_1', expectedWidth: 391, expectedHeight: 50 },
        { selector: 'img[src="/res/images/about-footer-2.png"]', description: 'icon_2', expectedWidth: 181, expectedHeight: 48 }
    ];

    for (const image of imagesToCheck) {
        const imgSize = await page.evaluate(selector => {
            const img = document.querySelector(selector);
            return img ? { width: img.naturalWidth, height: img.naturalHeight } : null;
        }, image.selector);

        if (imgSize) {
            console.log(`${image.description} 大小: ${imgSize.width}x${imgSize.height}`);
            if ((imgSize.width !== image.expectedWidth && image.expectedWidth !== 'auto') || imgSize.height !== image.expectedHeight) {
                missingElements.push(`${image.description} 大小不符 (期望: ${image.expectedWidth}x${image.expectedHeight}, 實際: ${imgSize.width}x${imgSize.height})`);
            }
        } else {
            console.log(`${image.description} 未找到`);
            missingElements.push(image.description);
        }
    }

    // 打印所有检查结果后再判断是否有错误
    if (missingElements.length > 0) {
        console.log(`以下元素未找到或大小不符: ${missingElements.join(', ')}`);
        expect(missingElements.length, `以下元素未找到或大小不符: ${missingElements.join(', ')}`).toBe(0);
    }

    await page.close();
});


test('檢查走地頁', async () => {
    const page = await globalThis.context.newPage();
    // 導航到首頁
    await page.goto('https://wap-q8-npf2.qit1.net/showSportEvents/sportEvents/20003');
    await page.waitForLoadState('networkidle');

    // 要檢查的類別和數值對應的元素選擇器
    const categories = [
        { selector: '.categoryTabs_menu:has(span:has-text("即將"))', description: '即將' },
        { selector: '.categoryTabs_menu:has(span:has-text("今日"))', description: '今日' },
        { selector: '.categoryTabs_menu:has(span:has-text("早盤"))', description: '早盤' },
        { selector: '.categoryTabs_menu:has(span:has-text("冠軍"))', description: '冠軍' },
        { selector: '.categoryTabs_menu:has(span:has-text("走地"))', description: '走地' },
    ];

    for (const category of categories) {
        const categoryElement = page.locator(category.selector);
        const categoryExists = await categoryElement.count() > 0;
        console.log(`${category.description} 標籤: ${categoryExists}`);
        expect(categoryExists, `未找到 ${category.description} 標籤`).toBeTruthy();

        // 點擊元素
        await categoryElement.click();
        console.log(`點擊 ${category.description}`);
    }
    // 找到第一个 dynamicData_nav 元素并点击
    await page.waitForSelector('.sportContent .dynamicData .dynamicData_nav');
    const dynamicDataNav = page.locator('.sportContent .dynamicData .dynamicData_nav').first();
    const dynamicDataNavExists = await dynamicDataNav.count() > 0;
    console.log(`賽事下拉選單: ${dynamicDataNavExists}`);
    expect(dynamicDataNavExists, '未找到賽事').toBeTruthy();
    await dynamicDataNav.click();
    console.log('展開赛事下注列表');
    // 找到第二个 .gameRate-card 元素
    const gameRateCards = page.locator('.gameRate-card');
    const targetCard = gameRateCards.nth(1);

    // 获取 winlose 和 fontWeight 的文本内容并打印
    const combinedText = await targetCard.evaluate(card => {
        const winlose = card.querySelector('.winlose').textContent.trim();
        const fontWeight = card.querySelector('.fontWeight').textContent.trim();
        return `${winlose}/${fontWeight}`;
    });
    console.log(`下注赔率: ${combinedText}`);

    // 检查是否找到了 targetCard
    const targetCardExists = await targetCard.count() > 0;
    console.log(`賠率框架: ${targetCardExists}`);
    expect(targetCardExists, '未找到賠率框架').toBeTruthy();

    // 点击第二个 .gameRate-card 元素
    await targetCard.click();

    // 检查计算器是否显示
    await page.waitForSelector('.calculator.active');
    const calculatorVisible = await page.isVisible('.calculator.active');
    console.log(`虛擬鍵盤: ${calculatorVisible}`);
    expect(calculatorVisible, '虛擬鍵盤未顯示').toBeTruthy();

    // 点击数字“1”和“5”
    await page.locator('.typeNumer div:has-text("1")').first().click();
    await page.locator('.typeNumer div:has-text("5")').first().click();

    // 检查并点击“接受更改”或“投注”按钮
    const updateOddsButton = page.locator('button.updateOdds_btn');
    const acceptButton = page.locator('button.accept');

    const isUpdateOddsVisible = await updateOddsButton.isVisible();
    if (isUpdateOddsVisible) {
        console.log('点击“接受更改”按钮');
        await updateOddsButton.click();
        await page.waitForSelector('button.accept', { state: 'visible' });
    }

    const acceptButtonExists = await acceptButton.isVisible();
    console.log(`投注按钮: ${acceptButtonExists}`);
    expect(acceptButtonExists, '未找到投注按钮').toBeTruthy();
    await acceptButton.click();

    // 跳过“投注中”消息
    await page.waitForSelector('.am-toast-text-info:has-text("投注中")', { state: 'hidden' });

    // 检查第二个提示消息并确认是否为“投注成功”
    const successMessageSelector = '.am-toast-notice-content .am-toast-text div:has-text("投注成功")';
    const errorMessageSelector = '.am-toast-text:has(svg.am-icon-fail) .am-toast-text-info';

    let successMessageVisible = await page.isVisible(successMessageSelector);

    if (successMessageVisible) {
        console.log('投注成功');
        await page.close();
        return; // 测试通过，结束测试
    } else {
        const errorMessage = await page.locator(errorMessageSelector).innerText();
        console.log(`提示訊息: ${errorMessage}`);

        await acceptButton.click(); // 再次点击“投注”按钮

        // 再次跳过“投注中”消息
        await page.waitForSelector('.am-toast-text-info:has-text("投注中")', { state: 'hidden' });

        // 再次检查第二个提示消息
        successMessageVisible = await page.isVisible(successMessageSelector);

        if (successMessageVisible) {
            console.log('投注成功');
            await page.close();
            return;
        } else {
            const secondErrorMessage = await page.locator(errorMessageSelector).innerText();
            console.log(`第二次提示訊息: ${secondErrorMessage}`);
            expect(successMessageVisible, `投注失败，提示信息: ${secondErrorMessage}`).toBeTruthy();
        }
    }

    await page.close();
});



test('登入頁檢查(EN)', async () => {
    const page = await globalThis.context.newPage();
    // 设置 localStorage 语言为英文
    await page.addInitScript(() => {
        localStorage.setItem('locale', 'en');
    });

    await page.goto('https://wap-q8-npf2.qit1.net/login');
    await page.waitForLoadState('networkidle');

    const missingElements = [];
    // 检查“帳號為6-12個數字和英文字”文案是否存在
    const usernamePlaceholderVisible = await page.locator('input[placeholder="6-12 Characters"]').isVisible();
    console.log(`6-12 Characters是否存在: ${usernamePlaceholderVisible}`);
    if (!usernamePlaceholderVisible) missingElements.push('6-12 Characters');

    // 检查“請輸入登入密碼”文案是否存在
    const passwordPlaceholderVisible = await page.locator('input[placeholder="Please enter password"]').isVisible();
    console.log(`Please enter password是否正確: ${passwordPlaceholderVisible}`);
    if (!passwordPlaceholderVisible) missingElements.push('Please enter password');

    // 检查“記住密碼”文案是否存在
    const rememberPasswordLabelVisible = await page.locator('label:has-text("Remember password")').isVisible();
    console.log(`Remember password是否正確: ${rememberPasswordLabelVisible}`);
    if (!rememberPasswordLabelVisible) missingElements.push('Remember password');

    // 检查“忘記密碼?”文案是否存在
    const forgotPasswordLabelVisible = await page.locator('label.guestEle a:has-text("Forget password?")').isVisible();
    console.log(`Forget password?是否正確: ${forgotPasswordLabelVisible}`);
    if (!forgotPasswordLabelVisible) missingElements.push('Forget password?');

    // 检查“登錄”文案是否存在
    const loginButtonVisible = await page.locator('div.submitBtn.btns:has-text("Sign in")').isVisible();
    console.log(`Sign in是否正確: ${loginButtonVisible}`);
    if (!loginButtonVisible) missingElements.push('Sign in');

    // 检查“沒有帳號？去註冊?”文案是否存在
    const registerTextVisible = await page.locator('div.toRegister:has-text("No account？Sign up now?")').isVisible();
    console.log(`No account？Sign up now?是否正確: ${registerTextVisible}`);
    if (!registerTextVisible) missingElements.push('No account？Sign up now?');

    // 检查“先去逛逛”与“聯繫客服”是否存在
    const exploreTextVisible = await page.locator('div.z5chi00YrtqjH > div:has-text("Go round first")').isVisible();
    console.log(`Go round first是否正確: ${exploreTextVisible}`);
    if (!exploreTextVisible) missingElements.push('Go round first');

    const contactSupportTextVisible = await page.locator('div.z5chi00YrtqjH > div:has-text("Service")').isVisible();
    console.log(`Service是否正確: ${contactSupportTextVisible}`);
    if (!contactSupportTextVisible) missingElements.push('Service');

    // 检查图标并比对大小
    const imagesToCheck = [
        { selector: 'img[src="/res/images/com-q8/q8-icon2.png?v=001"]', description: 'Q8圖標', expectedWidth: 966, expectedHeight: 306 },
        { selector: 'img.login-icon', description: '登入圖標', expectedWidth: 48, expectedHeight: 48 },
        { selector: 'img.login-remove.login-remove1', description: '移除圖標', expectedWidth: 48, expectedHeight: 48 }
    ];

    for (const image of imagesToCheck) {
        const imgSize = await page.evaluate(selector => {
            const img = document.querySelector(selector);
            return img ? { width: img.naturalWidth, height: img.naturalHeight } : null;
        }, image.selector);

        if (imgSize) {
            console.log(`${image.description} 大小: ${imgSize.width}x${imgSize.height}`);
            if (imgSize.width !== image.expectedWidth || imgSize.height !== image.expectedHeight) {
                missingElements.push(`${image.description} (期望: ${image.expectedWidth}x${image.expectedHeight}, 实际: ${imgSize.width}x${imgSize.height})`);
            }
        } else {
            console.log(`${image.description} 未找到`);
            missingElements.push(image.description);
        }
    }

    // 检查密碼圖標是否存在
    const passwordIconVisible = await page.locator('div.password-icon div.iconeye[type="eye"] svg').nth(1).isVisible();
    console.log(`密碼圖標是否存在: ${passwordIconVisible}`);
    if (!passwordIconVisible) missingElements.push('密碼圖標');

    // 打印所有检查结果后再判断是否有错误
    if (missingElements.length > 0) {
        console.log(`以下元素未找到或大小不符: ${missingElements.join(', ')}`);
        expect(missingElements.length, `以下元素未找到或大小不符: ${missingElements.join(', ')}`).toBe(0);
    }

    await page.close();
});

test('註冊頁檢查(EN)', async () => {
    const page = await globalThis.context.newPage();
    // 设置 localStorage 语言为英文
    await page.addInitScript(() => {
        localStorage.setItem('locale', 'en');
    });

    await page.goto('https://wap-q8-npf2.qit1.net/reg');
    await page.waitForLoadState('networkidle');

    const missingElements = [];

    // 检查文案是否存在
    const labelsToCheck = [
        { selector: 'label:has-text("Account")', text: 'Account' },
        { selector: 'label:has-text("Phone"):not(:has-text("Verification"))', text: 'Phone' }, // 使用 :not 选择器排除 Phone Verification
        { selector: 'label:has-text("Code")', text: 'Code' },
        { selector: 'label:has-text("password")', text: 'Password' },
        { selector: 'label:has-text("Confirm")', text: 'Confirm' }
    ];

    for (const label of labelsToCheck) {
        const labelVisible = await page.locator(label.selector).isVisible();
        console.log(`${label.text} 文案是否存在: ${labelVisible}`);
        if (!labelVisible) missingElements.push(`${label.text} 文案`);
    }

    // 检查输入框 placeholder 是否存在
    const inputsToCheck = [
        { selector: 'input[placeholder="Please enter your account"]', text: 'Please enter your account' },
        { selector: 'input[placeholder="Phone Number"]', text: 'Phone Number' },
        { selector: 'input[placeholder="Verification Code"]', text: 'Verification Code' },
        { selector: 'input[placeholder="Your Password"]', text: 'Your Password' },
        { selector: 'input[placeholder="6-16 Characters"]', text: '6-16 Characters' }
    ];

    for (const input of inputsToCheck) {
        const inputVisible = await page.locator(input.selector).isVisible();
        console.log(`${input.text} 文案: ${inputVisible}`);
        if (!inputVisible) missingElements.push(`${input.text} placeholder`);
    }

    // 检查按钮和链接是否存在
    const elementsToCheck = [
        { selector: 'div.submitBtn:has-text("Sign up")', text: 'Sign up' },
        { selector: 'div.has-account:has-text("Already have an account？Login?")', text: 'Already have an account？Login?' }
    ];

    for (const element of elementsToCheck) {
        const elementVisible = await page.locator(element.selector).isVisible();
        console.log(`${element.text} 是否存在: ${elementVisible}`);
        if (!elementVisible) missingElements.push(`${element.text}`);
    }

    // 打印所有检查结果后再判断是否有错误
    if (missingElements.length > 0) {
        console.log(`以下元素未找到或文本不符: ${missingElements.join(', ')}`);
        expect(missingElements.length, `以下元素未找到或文本不符: ${missingElements.join(', ')}`).toBe(0);
    }

    await page.close();
});



test('首頁檢查(EN)', async () => {
    const page = await globalThis.context.newPage();
    // 设置 localStorage 语言为英文
    await page.addInitScript(() => {
        localStorage.setItem('locale', 'en');
    });
    await page.goto('https://wap-q8-npf2.qit1.net/hall');
    await page.waitForLoadState('networkidle');

    const errors = [];

    // 检查 login 和 register 按钮是否存在
    const elementsToCheck = [
        { selector: '.LoginDiv_btns .deposit', description: 'deposit 按钮' },
        { selector: '.LoginDiv_btns .logout', description: 'logout 按钮' }
    ];

    for (const { selector, description } of elementsToCheck) {
        const elementExists = await page.locator(selector).first().count() > 0;
        console.log(`${description} 是否存在: ${elementExists}`);
        if (!elementExists) {
            errors.push(`${description} 不存在`);
        }
    }

    // 检查 logo 图标是否存在并抓取大小
    const logoElement = page.locator('.LoginDiv_logo img').first();
    const logoExists = await logoElement.count() > 0;
    console.log(`logo 是否存在: ${logoExists}`);
    if (!logoExists) {
        errors.push('logo 不存在');
    } else {
        const logoSize = await logoElement.evaluate(el => {
            return {
                width: el.clientWidth,
                height: el.clientHeight
            };
        });
        console.log(`logo 大小: 宽度=${logoSize.width}px, 高度=${logoSize.height}px`);
        if (logoSize.width !== 110 || logoSize.height !== 35) {
            errors.push(`logo 大小不正确，宽度=${logoSize.width}px, 高度=${logoSize.height}px`);
        }
    }

    // 点击 arrowSvg 按钮
    const arrowSvgElement = page.locator('.arrowSvg').nth(0);  // 定位到第一个 .arrowSvg
    const arrowSvgExists = await arrowSvgElement.count() > 0;
    console.log(`arrowSvg 是否存在: ${arrowSvgExists}`);
    expect(arrowSvgExists).toBe(true);

    if (arrowSvgExists) {
        await arrowSvgElement.click();
        console.log('arrowSvg 已点击');

        // 检查点击后类名变化
        const arrowSvgShowExists = await page.locator('.arrowSvg.show').count() > 0;
        console.log(`arrowSvg.show 是否存在: ${arrowSvgShowExists}`);
        if (!arrowSvgShowExists) {
            errors.push('arrowSvg 点击后未能变成 arrowSvg.show');
        }
    }

    // 检查 bannerImg 元素是否存在并抓取大小
    const bannerImgElement = page.locator('.bannerImg img').first();
    const bannerImgExists = await bannerImgElement.count() > 0;
    console.log(`bannerImg 是否存在: ${bannerImgExists}`);
    expect(bannerImgExists).toBe(true);

    if (bannerImgExists) {
        const bannerImgSize = await bannerImgElement.evaluate(el => {
            return {
                width: el.clientWidth,
                height: el.clientHeight
            };
        });
        console.log(`bannerImg 大小: 宽度=${bannerImgSize.width}px, 高度=${bannerImgSize.height}px`);
        if (bannerImgSize.width !== 394 || bannerImgSize.height !== 70) {
            errors.push(`bannerImg 大小不正确，宽度=${bannerImgSize.width}px, 高度=${bannerImgSize.height}px`);
        }
    }

    // 检查图标是否存在并抓取大小
    const iconsToCheck = [
        { alt: 'Football', src: '/soccor_a2e6e921d0778423cc6911b8c4e4d811.png', width: 36, height: 36 },
        { alt: 'Basketball', src: '/basketball_a60f6032e66bb6c01b16d3edb6ed52e9.png', width: 36, height: 36 },
        { alt: 'Tennis', src: '/tennis_2f2d0b4ff025620ec491bedcf26ad4e3.png', width: 36, height: 36 },
        { alt: 'Baseball', src: '/baseball_24d151c7cdce6cf4825c6bf7d10cd026.png', width: 36, height: 36 },
        { alt: 'gift', src: '/gift_e3532dc7dbc29f264e30a254166b0e97.png', width: 36, height: 36 },
        { alt: 'sponsor', src: '/sponsor_cac5099cc00aa6b0701e597bacf198ce.png', width: 36, height: 36 }
    ];

    for (const { alt, src, width, height } of iconsToCheck) {
        const iconElement = page.locator(`img[alt="${alt}"][src="${src}"]`).first();
        const iconExists = await iconElement.count() > 0;
        console.log(`${alt} 是否存在: ${iconExists}`);
        expect(iconExists).toBe(true);

        if (iconExists) {
            const iconSize = await iconElement.evaluate(el => {
                return {
                    width: el.clientWidth,
                    height: el.clientHeight
                };
            });
            console.log(`${alt} 图标大小: 宽度=${iconSize.width}px, 高度=${iconSize.height}px`);
            if (iconSize.width !== width || iconSize.height !== height) {
                errors.push(`${alt} 图标大小不正确，宽度=${iconSize.width}px, 高度=${iconSize.height}px`);
            }
        }
    }

    // 检查 gameTypeLogo 元素是否存在并抓取大小
    const gameTypeLogoElement = page.locator('.gameTypeLogo svg').first();
    const gameTypeLogoExists = await gameTypeLogoElement.count() > 0;
    console.log(`gameTypeLogo 是否存在: ${gameTypeLogoExists}`);
    expect(gameTypeLogoExists).toBe(true);

    if (gameTypeLogoExists) {
        const gameTypeLogoSize = await gameTypeLogoElement.evaluate(el => {
            return {
                width: el.clientWidth,
                height: el.clientHeight
            };
        });
        console.log(`gameTypeLogo 大小: 宽度=${gameTypeLogoSize.width}px, 高度=${gameTypeLogoSize.height}px`);
        if (gameTypeLogoSize.width !== 20 || gameTypeLogoSize.height !== 20) {
            errors.push(`gameTypeLogo 大小不正确，宽度=${gameTypeLogoSize.width}px, 高度=${gameTypeLogoSize.height}px`);
        }
    }

    // 检查 footer 元素是否存在并进行点击
    const footerItems = [
        { label: 'Home', class: 'icon-play' },
        { label: 'casino', class: 'icon-home' },
        { label: 'In-Play', class: 'icon-roll' },
        { label: 'Personal', class: 'icon-account' }
    ];

    for (const { label, class: iconClass } of footerItems) {
        const footerItemElement = page.locator(`.footer-item:has(.label:has-text("${label}")) .${iconClass}`).first();
        const footerItemExists = await footerItemElement.count() > 0;
        console.log(`${label} 是否存在: ${footerItemExists}`);
        expect(footerItemExists).toBe(true);

        if (footerItemExists) {
            await footerItemElement.click();
            console.log(`${label} 已点击`);
        }
    }

    // 打印所有错误
    if (errors.length > 0) {
        console.error('以下是检测到的错误:');
        errors.forEach(error => console.error(error));
    }

    expect(errors.length).toBe(0); // 确保没有错误
});



test('檢查娛樂城(EN)', async () => {
    const page = await globalThis.context.newPage();
    // 设置 localStorage 语言为英文
    await page.addInitScript(() => {
        localStorage.setItem('locale', 'en');
    });
    await page.goto('https://wap-q8-npf2.qit1.net/sportEvents');
    await page.waitForLoadState('networkidle');

    const errors = [];

    // 檢查並關閉彈窗
    let closeButtonVisible = true;
    while (closeButtonVisible) {
        const closeButton = page.locator('svg path[fill="#999"]').first();
        closeButtonVisible = await closeButton.isVisible();
        if (closeButtonVisible) {
            await closeButton.click();
            console.log('關閉廣告');
            // 等待彈窗消失並檢查是否還有彈窗存在
            await page.waitForTimeout(1000); // 可以根據需要調整等待時間
        }
    }

    // 檢查首頁的banner圖片
    const bannerImgElement = page.locator('.slider-frame img');
    const bannerImgExists = await bannerImgElement.count() > 0;
    console.log(`banner圖片是否存在: ${bannerImgExists}`);
    expect(bannerImgExists).toBe(true);

    if (bannerImgExists) {
        const bannerImgSize = await bannerImgElement.evaluate(el => {
            return {
                width: el.clientWidth,
                height: el.clientHeight
            };
        });
        console.log(`banner圖片大小: 宽度=${bannerImgSize.width}px, 高度=${bannerImgSize.height}px`);
        if (bannerImgSize.width !== 338 || bannerImgSize.height !== 79) {
            errors.push(`banner圖片大小不正确，宽度=${bannerImgSize.width}px, 高度=${bannerImgSize.height}px`);
        }
    }

    // 檢查跑馬燈元素
    const marquee = page.locator('.marqee');
    const marqueeExists = await marquee.count() > 0;
    console.log(`跑馬燈: ${marqueeExists}`);
    expect(marqueeExists).toBeTruthy();

    const categories = ['Live', 'Sports', 'Slots', 'Chess', 'E-Sports', 'Fishing', 'Live games'];

    for (const category of categories) {
        const labelLocator = page.locator(`.categoryType .label:has-text("${category}")`);
        const count = await labelLocator.count();
        const isVisible = count > 0 && await labelLocator.first().isVisible();
        console.log(`${category} : ${isVisible}`);
        expect(isVisible, `${category} 不存在`).toBeTruthy();
    }

    const gameNamesToCheck = [
        'EVO LIVE CASINO',
        'DG LIVE CASINO',
        'SEXY LIVE CASINO',
        'WM LIVE CASINO',
        'Motivation LIVE CASINO',
        'OB LIVE CASINO',
        'WE LIVE CASINO',
        'CR SPORTS',
        'SBO SPORTS',
        // 'KONG LOTTO SPORTS',
        'KA Slots',
        // 'JDB Slots',
        'PP Slots',
        'SWG Slots',
        'TPG Slots',
        'PG Slots',
        'JOKER Slots',
        'MW Slots',
        'BOLE MAHJONG',
        'VG CHESS',
        'OB CHESS',
        'Hong Kong CHESS',
        'BAISON CHESS',
        'LEG CHESS',
        'KAIYUAN CHESS',
        'IA ESPORTS',
        'TF ESPORTS',
        'CQ9 FISHING',
        'TPG FISHING',
        'JOKER FISHING',
        'BAISON FISHING',
        'SWG FISHING',
        // 'JDB FISHING',
    ];

    // 檢查每個指定的 gameName 元素是否存在
    for (const gameName of gameNamesToCheck) {
        const gameNameLocator = page.locator(`.gameName:has-text("${gameName}")`);
        const gameNameExists = await gameNameLocator.count() > 0;
        console.log(`(${gameName}): ${gameNameExists}`);
        expect(gameNameExists, `未找到 gameName (${gameName})`).toBeTruthy();
    }

    // 檢查每日簽到
    const checkInImage = page.locator('img[alt="Daily Bouns1"]');
    const checkInText = page.locator('span.hasData:has-text("Daily Bouns1")');
    const checkInImageExists = await checkInImage.count() > 0;
    const checkInTextExists = await checkInText.count() > 0;
    console.log(`每日簽到圖片: ${checkInImageExists}`);
    console.log(`每日簽到文案: ${checkInTextExists}`);
    expect(checkInImageExists).toBeTruthy();
    expect(checkInTextExists).toBeTruthy();

    if (checkInImageExists) {
        const checkInImageSize = await checkInImage.evaluate(el => {
            return {
                width: el.clientWidth,
                height: el.clientHeight
            };
        });
        console.log(`每日簽到圖片大小: 宽度=${checkInImageSize.width}px, 高度=${checkInImageSize.height}px`);
        if (checkInImageSize.width !== 65 || checkInImageSize.height !== 47) {
            errors.push(`每日簽到圖片大小不正确，宽度=${checkInImageSize.width}px, 高度=${checkInImageSize.height}px`);
        }
    }

    // 檢查紅包
    // const redEnvelopeImage = page.locator('img[src="/res/images/red-envelope.png"]');
    // const redEnvelopeText = page.locator('div.redEnvelope-entrance-text:has-text("紅包包包包")');
    // const redEnvelopeImageExists = await redEnvelopeImage.count() > 0;
    // const redEnvelopeTextExists = await redEnvelopeText.count() > 0;
    // console.log(`紅包圖片: ${redEnvelopeImageExists}`);
    // console.log(`紅包文案${redEnvelopeTextExists}`);
    // expect(redEnvelopeImageExists).toBeTruthy();
    // expect(redEnvelopeTextExists).toBeTruthy();

    // if (redEnvelopeImageExists) {
    //     const redEnvelopeImageSize = await redEnvelopeImage.evaluate(el => {
    //         return {
    //             width: el.clientWidth,
    //             height: el.clientHeight
    //         };
    //     });
    //     console.log(`紅包圖片大小: 宽度=${redEnvelopeImageSize.width}px, 高度=${redEnvelopeImageSize.height}px`);
    //     if (redEnvelopeImageSize.width !== 45 || redEnvelopeImageSize.height !== 56) {
    //         errors.push(`紅包圖片大小不正确，宽度=${redEnvelopeImageSize.width}px, 高度=${redEnvelopeImageSize.height}px`);
    //     }
    // }

    // 檢查幸運輪
    const luckyWheel = page.locator('div.center-icon.en');
    const luckyWheelExists = await luckyWheel.count() > 0;
    console.log(`幸運輪: ${luckyWheelExists}`);
    expect(luckyWheelExists).toBeTruthy();

    if (luckyWheelExists) {
        const luckyWheelSize = await page.evaluate(() => {
            const element = document.querySelector('#sector.sector-menu-wrapper.q6');
            return {
                width: element.clientWidth,
                height: element.clientHeight,
                bottom: element.style.bottom,
                left: element.style.left
            };
        });
        console.log(`幸運輪大小: 宽度=${luckyWheelSize.width}px, 高度=${luckyWheelSize.height}px, bottom=${luckyWheelSize.bottom}, left=${luckyWheelSize.left}`);
        if (luckyWheelSize.width !== 50 || luckyWheelSize.height !== 100) {
            errors.push(`幸運輪大小不正确，宽度=${luckyWheelSize.width}px, 高度=${luckyWheelSize.height}px`);
        }
        if (luckyWheelSize.bottom !== '100px' || luckyWheelSize.left !== '344px') {
            errors.push(`幸運輪位置不正确，bottom=${luckyWheelSize.bottom}, left=${luckyWheelSize.left}`);
        }
    }

    // 打印所有错误
    if (errors.length > 0) {
        console.error('以下是检测到的错误:');
        errors.forEach(error => console.error(error));
    }

    expect(errors.length).toBe(0); // 确保没有错误

    await page.close();
});



test('檢查個人頁並點擊各個鏈接(EN)', async () => {
    const page = await globalThis.context.newPage();
    // 设置 localStorage 语言为英文
    await page.addInitScript(() => {
        localStorage.setItem('locale', 'en');
    });

    // 导航到个人页面
    await page.goto('https://wap-q8-npf2.qit1.net/accountCenter');
    await page.waitForLoadState('networkidle');

    const missingCategories = [];
    const errorMessages = [];

    const categoriesToCheck = [
        { label: 'uitest001', selector: 'text=uitest001' },
        { label: 'VIP', selector: 'text=VIP' },
        { label: 'Balance', selector: 'text=Balance' },
        { label: 'Recent Withdraw', selector: 'text=Recent Withdraw' },
        { label: 'Task Center', selector: '.promote .label:text("Task Center")' },
        { label: 'Wallet', selector: '.functional-buttons .label:text("Wallet")' },
        { label: 'Deposit', selector: '.functional-buttons .label:text("Deposit")' },
        { label: 'Withdraw', selector: '.functional-buttons .label:text("Withdraw")' },
        // { label: 'Agency Commission', selector: 'text=Agency Commission' },
        { label: 'Rebate', selector: 'text=Rebate' },
        { label: 'VIP', selector: 'text=VIP' },
        { label: 'Profit', selector: 'text=Profit' },
        { label: 'Deposit & Withdrawal', selector: 'text=Deposit & Withdrawal' },
        { label: 'Transaction Record', selector: 'text=Transaction Record' },
        { label: 'Bank Card Management', selector: 'text=Bank Card Management' },
        { label: 'Bet History', selector: 'text=Bet History' },
        // { label: 'Refer a Friend', selector: 'text=Refer a Friend' },
        // { label: 'National agent', selector: 'text=National agent' },
        // { label: 'Recommend friends', selector: 'text=Recommend friends' },
        // { label: 'Friend promotion link', selector: 'text=Friend promotion link' },
        { label: 'Game Result', selector: 'text=Game Result' },
        { label: 'Language Selection', selector: 'text=Language Selection' },
        { label: 'Join us', selector: '.main-label-text:text("Join us")' }  // 新增的“Join us”元素
    ];

    const categoriesToClick = [
        { label: 'Task Center', selector: '.promote .label:text("Task Center")' },
        { label: 'Wallet', selector: '.functional-buttons .label:text("Wallet")' },
        { label: 'Deposit', selector: '.functional-buttons .label:text("Deposit")' },
        { label: 'Withdraw', selector: '.functional-buttons .label:text("Withdraw")' },
        // { label: 'Agency Commission', selector: 'text=Agency Commission' },
        { label: 'Rebate', selector: 'text=Rebate' },
        { label: 'VIP', selector: 'text=VIP' },
        { label: 'Profit', selector: 'text=Profit' },
        { label: 'Deposit & Withdrawal', selector: 'text=Deposit & Withdrawal' },
        { label: 'Transaction Record', selector: 'text=Transaction Record' },
        { label: 'Bank Card Management', selector: 'text=Bank Card Management' },
        { label: 'Bet History', selector: 'text=Bet History' },
        // { label: 'Refer a Friend', selector: 'text=Refer a Friend' },
        // { label: 'National agent', selector: 'text=National agent' },
        // { label: 'Recommend friends', selector: 'text=Recommend friends' },
        // { label: 'Friend promotion link', selector: 'text=Friend promotion link' },
        { label: 'Game Result', selector: 'text=Game Result' },
        { label: 'Language Selection', selector: 'text=Language Selection' },
        { label: 'Join us', selector: '.main-label-text:text("Join us")' }
    ];

    // 检查标签是否存在
    for (const category of categoriesToCheck) {
        const elementExists = await page.locator(category.selector).count() > 0;
        console.log(`${category.label} 文案是否存在: ${elementExists}`);
        if (!elementExists) {
            missingCategories.push(category.label);
        }
    }

    // 打印缺少的标签并使测试失败
    if (missingCategories.length > 0) {
        console.log(`以下標籤未找到: ${missingCategories.join(', ')}`);
        expect(missingCategories.length, `以下標籤未找到: ${missingCategories.join(', ')}`).toBe(0);
    }

    // 点击标签并检查错误消息
    for (const category of categoriesToClick) {
        const elementExists = await page.locator(category.selector).count() > 0;
        console.log(`${category.label} 链接是否存在: ${elementExists}`);
        if (elementExists) {
            const exactMatch = await page.locator(category.selector).first();
            await exactMatch.click();
            console.log(`点击 ${category.label} 链接`);

            // 等待“加载中”消息消失
            try {
                await page.waitForSelector('.am-toast-text-info:has-text("載入中")', { state: 'hidden', timeout: 10000 });
            } catch (e) {
                // 无需在这里打印日志，只需继续检查错误消息
            }

            // 检查是否有错误消息
            const errorMessageVisible = await page.isVisible('.am-toast-text:has(svg.am-icon-fail) .am-toast-text-info');
            if (errorMessageVisible) {
                const errorMessage = await page.locator('.am-toast-text:has(svg.am-icon-fail) .am-toast-text-info').innerText();
                errorMessages.push(`${category.label}: ${errorMessage}`);
                console.log(`${category.label} 点击后报错: ${errorMessage}`);
            } else {
                console.log(`${category.label} 点击后无错误`);
            }

            // 返回个人页面
            await page.goto('https://wap-q8-npf2.qit1.net/accountCenter');
            await page.waitForLoadState('networkidle');
        } else {
            missingCategories.push(category.label);
            console.log(`${category.label} 链接未找到`);
        }
    }

    // 打印错误消息并使测试失败
    if (errorMessages.length > 0) {
        console.log(`以下標籤點擊跳轉過去後報錯: ${errorMessages.join(', ')}`);
        expect(errorMessages.length, `以下標籤點擊跳轉過去後報錯: ${errorMessages.join(', ')}`).toBe(0);
    }

    await page.close();
});




test('檢查個人頁icon圖片(EN)', async () => {
    const page = await globalThis.context.newPage();
    // 设置 localStorage 语言为英文
    await page.addInitScript(() => {
        localStorage.setItem('locale', 'en');
    });

    // 导航到个人页面
    await page.goto('https://wap-q8-npf2.qit1.net/accountCenter');
    await page.waitForLoadState('networkidle');

    const iconsToCheck = [
        { text: 'Profit', class: 'icon-promotion', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-promotion2.png' },
        // { text: 'Agency Commission', class: 'icon-moneyback', url: 'https://wap-q6-npf2.qit1.net/res/images/com-q6/account-center/icon-friend.png' },
        { text: 'Rebate', class: 'icon-getrebate', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-getrebate.png' },
        { text: 'VIP', class: 'icon-rebate', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-rebate.png' },
        { text: 'Profit', class: 'icon-profit', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-profit.png' },
        { text: 'Deposit & Withdrawal', class: 'icon-history', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-history.png' },
        { text: 'Transaction Record', class: 'icon-statement', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-statement.png' },
        { text: 'Bank Card Management', class: 'icon-bank-card', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-bank-card.png' },
        { text: 'Bet History', class: 'icon-record', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-record.png' },
        // { text: 'Refer a Friend', class: 'icon-invitefriend', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-friend2.png?t=21491204' },
        // { text: 'National agent', class: 'icon-friend2', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-friend2.png' },
        // { text: 'Recommend friends', class: 'icon-friend2', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-friend2.png' },
        // { text: 'Friend promotion link', class: 'icon-friend2', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-friend2.png' },
        { text: 'Game Result', class: 'icon-game-result', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-game-result.png' },
        { text: 'Language Selection', class: 'icon-language', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-language.png' },
        { text: 'Join us', class: 'icon-friend', url: 'https://wap-q8-npf2.qit1.net/res/images/com-q8/account-center/icon-friend.png' }
    ];

    const errors = [];

    for (const { text, class: iconClass, url } of iconsToCheck) {
        const iconElement = page.locator(`.main-label:has(.main-label-text:has-text("${text}")) .${iconClass}`);
        const iconExists = await iconElement.count() > 0;
        console.log(`${text} 是否存在: ${iconExists}`);

        // 断言该元素是否存在
        expect(iconExists).toBe(true); // 假设元素应存在

        // 如果元素存在，检查其背景图片是否存在
        let backgroundImage = '';
        if (iconExists) {
            backgroundImage = await iconElement.evaluate(el => {
                const styles = window.getComputedStyle(el);
                return styles.backgroundImage;
            });
            console.log(`${text} 背景图片: ${backgroundImage}`);
        }

        // 断言背景图片是否符合预期
        if (backgroundImage !== `url("${url}")`) {
            errors.push(`${text} 背景图片不正确，预期: url("${url}")，实际: ${backgroundImage}`);
        }

        // 获取图片大小
        const { width, height } = await iconElement.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
        });

        console.log(`${text} 图片大小: 宽度=${width}px, 高度=${height}px`);

        // 断言图片大小是否正确
        if (width !== 27 || height !== 27) {
            errors.push(`${text} 图片大小不正确，宽度=${width}px, 高度=${height}px`);
        }
    }

    // 打印所有错误
    if (errors.length > 0) {
        console.error('以下是检测到的错误:');
        errors.forEach(error => console.error(error));
    }

    expect(errors.length).toBe(0); // 确保没有错误
});




test('檢查About Luk gu(EN)', async () => {
    const page = await globalThis.context.newPage();
    // 设置 localStorage 语言为英文
    await page.addInitScript(() => {
        localStorage.setItem('locale', 'en');
    });

    // 导航到个人页面
    await page.goto('https://wap-q8-npf2.qit1.net/accountCenter');
    await page.waitForLoadState('networkidle');

    const missingElements = [];

    // 檢查 .icon.icon-alert.logo 並檢查大小
    const logo = await page.locator('.icon.icon-alert.logo').first();
    const logoVisible = await logo.isVisible();
    console.log(`About Luk gu icon是否存在: ${logoVisible}`);
    if (logoVisible) {
        const logoSize = await logo.evaluate(element => {
            return {
                width: element.offsetWidth,
                height: element.offsetHeight
            };
        });
        console.log(`About Luk gu icon大小: ${logoSize.width}x${logoSize.height}`);
        const expectedWidth = 50;
        const expectedHeight = 20;
        if (logoSize.width !== expectedWidth || logoSize.height !== expectedHeight) {
            missingElements.push(`icon 大小不符 (期望: ${expectedWidth}x${expectedHeight}, 實際: ${logoSize.width}x${logoSize.height})`);
        }
    } else {
        missingElements.push('icon');
    }

    // 檢查並點擊“關於 港體會”按鈕
    const aboutButton = await page.locator('.main-label .main-label-text', { hasText: 'About Luk gu' }).first();
    const aboutButtonVisible = await aboutButton.isVisible();
    console.log(`About Luk gu按鈕是否存在: ${aboutButtonVisible}`);
    if (!aboutButtonVisible) {
        missingElements.push('About Luk gu');
    } else {
        await aboutButton.click();
    }

    // 檢查彈窗中的所有文案和圖片大小
    await page.waitForSelector('.about-container', { state: 'visible' });

    const textsToCheck = [
        { text: 'Responsible Gambling', tag: 'div.about-heading' },
        { text: 'Responsible Gambling', tag: 'p.about-heading' },
        'Luk gu is committed to loyal and trustworthy gambling guarantees. Our company complies with applicable regulations and guidelines from remote gaming authorities and strives to be a socially responsible remote gaming operator. Remote gambling is a legal entertainment experience for millions of players around the world. For most players, remote gambling is an enjoyable experience. However, we also accept the reality that a small number of players who indulge in remote gambling may be under the legal age or suffer from gambling-related impairments. Problems with their lives or financial situation. Being a socially responsible company means paying attention to our players, and it means taking a proactive approach to issues that may have an impact on society. That\'s why Luk gu has adopted and is fully committed to enforcing the strictest procedures and restrictions below.',
        'Execution policy',
        'Access restrictions for minors',
        'We promise to do our best and need your help to do the following',
        '1. Use child protection software to block remote gambling websites from computers that may be used by minors.',
        '2. Do not leave your computer unattended when logging into a remote gaming website.',
        '3. Do not share your credit card or bank account details with minors.',
        '4. Do not enable the "Save Password" option on the login page of this website.',
        '5. Create a separate login file for minors on the computer so that they cannot access your information when they log in.',
        '6. If you know of anyone under the age of 18 (or under the legal age in their jurisdiction) who has mistakenly registered as a player with us, please notify us immediately.',
        'Operation Qualification',
    ];

    const normalizeText = (text) => {
        return text.replace(/[^\w\s]/gi, '').replace(/\s+/g, '');
    };

    for (const item of textsToCheck) {
        let textVisible;
        if (typeof item === 'string') {
            const normalizedItem = normalizeText(item);
            const locator = await page.locator('body').evaluate((body, text) => {
                const regex = new RegExp(text, 'i');
                return regex.test(body.innerText.replace(/[^\w\s]/gi, '').replace(/\s+/g, ''));
            }, normalizedItem);
            textVisible = locator;
            console.log(`文案 "${item}" 是否存在: ${textVisible}`);
            if (!textVisible) missingElements.push(`文案 "${item}"`);
        } else {
            const normalizedItem = normalizeText(item.text);
            const locator = await page.locator(`${item.tag}`).evaluateAll((elements, text) => {
                const regex = new RegExp(text, 'i');
                return elements.some(element => regex.test(element.innerText.replace(/[^\w\s]/gi, '').replace(/\s+/g, '')));
            }, normalizedItem);
            textVisible = locator;
            console.log(`文案 "${item.text}" (${item.tag}) 是否存在: ${textVisible}`);
            if (!textVisible) missingElements.push(`文案 "${item.text}" (${item.tag})`);
        }
    }

    // 检查图片大小
    const imagesToCheck = [
        { selector: 'img[src="/res/images/about-footer-1.png"]', description: 'icon_1', expectedWidth: 391, expectedHeight: 50 },
        { selector: 'img[src="/res/images/about-footer-2.png"]', description: 'icon_2', expectedWidth: 181, expectedHeight: 48 }
    ];

    for (const image of imagesToCheck) {
        const imgSize = await page.evaluate(selector => {
            const img = document.querySelector(selector);
            return img ? { width: img.naturalWidth, height: img.naturalHeight } : null;
        }, image.selector);

        if (imgSize) {
            console.log(`${image.description} 大小: ${imgSize.width}x${imgSize.height}`);
            if ((imgSize.width !== image.expectedWidth && image.expectedWidth !== 'auto') || imgSize.height !== image.expectedHeight) {
                missingElements.push(`${image.description} 大小不符 (期望: ${image.expectedWidth}x${image.expectedHeight}, 實際: ${imgSize.width}x${imgSize.height})`);
            }
        } else {
            console.log(`${image.description} 未找到`);
            missingElements.push(image.description);
        }
    }

    // 打印所有检查结果后再判断是否有错误
    if (missingElements.length > 0) {
        console.log(`以下元素未找到或大小不符: ${missingElements.join(', ')}`);
        expect(missingElements.length, `以下元素未找到或大小不符: ${missingElements.join(', ')}`).toBe(0);
    }

    await page.close();
});



test('檢查遊戲開啟(EN)', async () => {
    const page = await globalThis.context.newPage();
    // 设置 localStorage 语言为英文
    await page.addInitScript(() => {
        localStorage.setItem('locale', 'en');
    });

    // 导航到游戏页面
    await page.goto('https://wap-q8-npf2.qit1.net/sportEvents');
    await page.waitForLoadState('networkidle');

    const gamesToCheck = [
        {
            buttonSelector: '.enter-game-button.bk-ka-slot.en',
            gameName: 'KA Slots',
            iconSelector: 'li .game_item img[alt="KA All Star Sports Day"][src="https://rmpseaiconcdn.kaga88.com/kaga/gameIcon?game=KAAllStarSportsDay&lang=zh&type=circular_framed"]',
            expectedWidth: 150,
            expectedHeight: 150
        },
        // {
        //     buttonSelector: '.enter-game-button.bk-jdb-slot.en',
        //     gameName: 'JDB Slots',
        //     iconSelector: 'li .game_item img[alt="Flirting Scholar Tang"][src="https://dl.lfyanwei.com/jdb-assetsv3/games/8002/8002_en.png"]',
        //     expectedWidth: 150,
        //     expectedHeight: 150
        // },
        // {
        //     buttonSelector: '.enter-game-button.bk-pp-slot.en',
        //     gameName: 'PP Slots',
        //     iconSelector: 'li .game_item img[alt="Fortune Ace"][src="https://api.prerelease-env.biz/game_pic/square/200/vs1024fortune.png"]',
        //     expectedWidth: 150,
        //     expectedHeight: 150
        // },
        // {
        //     buttonSelector: '.enter-game-button.bk-swg-slot.en',
        //     gameName: 'SWG Slots',
        //     iconSelector: 'li .game_item img[alt="FortuneGems"][src="http://wap-q6-npf2.qit1.net/photo/SWG_icon/5003_en.png"]',
        //     expectedWidth: 150,
        //     expectedHeight: 150
        // }
    ];

    const errors = [];

    for (const game of gamesToCheck) {
        // 点击指定的游戏场馆
        await page.click(game.buttonSelector);

        // 等待页面加载并检查游戏图标
        await page.waitForSelector(game.iconSelector);
        const gameIcon = page.locator(game.iconSelector);
        const gameIconExists = await gameIcon.count() > 0;
        console.log(`${game.gameName} 游戏图标是否存在: ${gameIconExists}`);
        expect(gameIconExists, `${game.gameName} 游戏图标不存在`).toBeTruthy();

        if (gameIconExists) {
            const gameIconSize = await gameIcon.evaluate(el => {
                return {
                    width: el.clientWidth,
                    height: el.clientHeight
                };
            });
            console.log(`${game.gameName} 游戏图标大小: 宽度=${gameIconSize.width}px, 高度=${gameIconSize.height}px`);

            if (gameIconSize.width !== game.expectedWidth || gameIconSize.height !== game.expectedHeight) {
                console.error(`${game.gameName} 游戏图标大小不正确，宽度=${gameIconSize.width}px, 高度=${gameIconSize.height}px`);
                errors.push(`${game.gameName} 游戏图标大小不正确，宽度=${gameIconSize.width}px, 高度=${gameIconSize.height}px`);
            } else {
                console.log(`${game.gameName} 游戏图标大小正确`);
            }

            expect(gameIconSize.width).toBe(game.expectedWidth);
            expect(gameIconSize.height).toBe(game.expectedHeight);
        }

        // 返回游戏页面
        await page.goto('https://wap-q8-npf2.qit1.net/sportEvents');
        await page.waitForLoadState('networkidle');
    }

    // 打印所有错误
    if (errors.length > 0) {
        console.error('以下是检测到的错误:');
        errors.forEach(error => console.error(error));
    }

    expect(errors.length).toBe(0); // 确保没有错误

    await page.close();
});
