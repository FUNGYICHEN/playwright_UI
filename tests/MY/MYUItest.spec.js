const { test, expect } = require('@playwright/test');
const { userRecordKey, userRecordValue } = require('./MYconstants');
// const { randomHongKongPhoneNumber, randomUsername } = require('./phoneNumbers');
// const { fetchVerificationCode } = require('./Q6phonecode'); // 引入验证码获取函数

test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    globalThis.context = context;
});

test.beforeEach(async () => {
    const page = await globalThis.context.newPage();

    await page.addInitScript(({ key, value }) => {
        localStorage.setItem(key, value);
    }, { key: userRecordKey, value: userRecordValue });

    await page.goto('https://wap-my.qbpink01.com');
    await page.waitForLoadState('networkidle');

    await page.close();
});






test('關於 Betone', async () => {
    const page = await globalThis.context.newPage();
    // 设置页面语言为中文
    await page.addInitScript(() => {
        localStorage.setItem('locale', 'zh-CN');
    });

    // 导航到个人页面
    await page.goto('https://wap-my.qbpink01.com/accountCenter');
    await page.waitForLoadState('networkidle');

    const missingElements = [];


    // 检查并点击“关於 Betone”按钮
    const aboutButton = await page.locator('.about span:has-text("关於 Betone")');
    const aboutButtonVisible = await aboutButton.isVisible();
    console.log(`关於 Betone 按钮是否存在: ${aboutButtonVisible}`);
    if (!aboutButtonVisible) {
        missingElements.push('关於 Betone 按钮');
    } else {
        await aboutButton.click();
    }

    // 检查图片大小
    const logoImage = await page.locator('.about img[alt="logo"]');
    const logoImageVisible = await logoImage.isVisible();
    if (logoImageVisible) {
        const logoImageSize = await logoImage.evaluate(img => ({ width: img.naturalWidth, height: img.naturalHeight }));
        console.log(`Logo 图片大小: ${logoImageSize.width}x${logoImageSize.height}`);
        const expectedLogoWidth = 93;  // 设置期望宽度
        const expectedLogoHeight = 114;  // 设置期望高度
        if (logoImageSize.width !== expectedLogoWidth || logoImageSize.height !== expectedLogoHeight) {
            missingElements.push(`Logo 图片大小不符 (期望: ${expectedLogoWidth}x${expectedLogoHeight}, 实际: ${logoImageSize.width}x${logoImageSize.height})`);
        }
    } else {
        missingElements.push('Logo 图片');
    }

    // 检查弹窗中的所有文案和图片大小
    await page.waitForSelector('.about-container', { state: 'visible' });

    const textsToCheck = [
        { text: '博彩责任', tag: 'div.about-heading' },
        { text: 'Betone致力於忠诚与可信赖的博彩保证。我们公司遵从远端博彩管理当局的适用法规以及指引，而且努力成为对社会负责任的远端博彩运营公司。远程博彩是全球数以百万玩家的合法娱乐体验。对大多数玩家来说，远端博彩是一项令人愉快的体验，不过，我们也接受这样的现实，少部分沈迷在远端博彩的玩家可能会未达到法定年龄或者出现由於博彩而影响了他们的生活或财务状况的问题。作为一个对社会负责的公司意味着要关注我们的玩家，意味着要对可能对社会产生影响的问题采用主动的方法去解决。这正是为何Betone会采用并完全承诺执行以下最严格的程式和限制。', tag: 'div.about-desc' },
        { text: '执行政策', tag: 'div.about-heading' },
        { text: '对未成年人的访问限制', tag: 'div.about-desc' },
        { text: 'Betone要求新客户申明他们已经达到他们所属的司法管辖地区规定的法定年龄且至少年满18岁。当我们怀疑客户可能虚假申报或可能有未成年人试图使用我们的服务时，我们会使用合理的方法进一步进行验证。', tag: 'div.about-desc' },
        { text: 'Betone不会允许任何未满18岁的人士使用我们的服务。此政策完全遵从并满足监管和给我们发放运营牌照的远端博彩管理当局，First Cagayan Leisure and Resort Corporation (FCRLC) for the Cagayan Economic Zone Authority (CEZA), of Santa Ana, Cagayan，Philippines的规则和规定；', tag: 'div.about-desc' },
        { text: '我们承诺将尽我们所能而同时也需要您的协助做到以下这些', tag: 'div.about-heading' },
        { text: '1丶使用儿童保护软体从可能被未成年人使用的电脑上遮罩远端博彩网站。', tag: 'div.about-desc' },
        { text: '2丶当您的电脑登入到远端博彩网站时不要让电脑处於无人在旁的状况。', tag: 'div.about-desc' },
        { text: '3丶不要告知未成年人您的信用卡或银行帐户的详细资料。', tag: 'div.about-desc' },
        { text: '4丶不要在本网站登入页面上让“保存密码”选项生效。', tag: 'div.about-desc' },
        { text: '5丶在电脑上为未成年人建立独立的登入档案，令他们登入时无法访问您的资料。', tag: 'div.about-desc' },
        { text: '6丶如果您知道有人未满18岁（或未满他们所属司法管辖地区法定年龄）但错误地注册成为我们的玩家，请立刻通知我们。', tag: 'div.about-desc' },
        { text: '运营资质', tag: 'p.about-heading' },
        { text: '博彩责任', tag: 'p.about-heading' },
    ];

    const normalizeText = (text) => {
        return text.replace(/[^\w\s]/gi, '').replace(/\s+/g, '');
    };

    for (const item of textsToCheck) {
        let textVisible;
        try {
            const normalizedItem = normalizeText(item.text);
            const locator = await page.locator(`${item.tag}`).evaluateAll((elements, text) => {
                const regex = new RegExp(text, 'i');
                return elements.some(element => regex.test(element.innerText.replace(/[^\w\s]/gi, '').replace(/\s+/g, '')));
            }, normalizedItem);
            textVisible = locator;
            console.log(`Text "${item.text}" (${item.tag}) visible: ${textVisible}`);
            if (!textVisible) missingElements.push(`Text "${item.text}" (${item.tag})`);
        } catch (error) {
            missingElements.push(`Error checking text "${item.text}": ${error.message}`);
        }
    }

    // 检查图片大小
    const imagesToCheck = [
        { selector: 'img[src="/res/images/about-footer-1.png"]', description: 'icon_1', expectedWidth: 391, expectedHeight: 50 },
        { selector: 'img[src="/res/images/about-footer-2.png"]', description: 'icon_2', expectedWidth: 181, expectedHeight: 48 }
    ];

    for (const image of imagesToCheck) {
        try {
            const imgSize = await page.evaluate(selector => {
                const img = document.querySelector(selector);
                return img ? { width: img.naturalWidth, height: img.naturalHeight } : null;
            }, image.selector);

            if (imgSize) {
                console.log(`${image.description} size: ${imgSize.width}x${imgSize.height}`);
                if ((imgSize.width !== image.expectedWidth && image.expectedWidth !== 'auto') || imgSize.height !== image.expectedHeight) {
                    missingElements.push(`${image.description} size mismatch (expected: ${image.expectedWidth}x${image.expectedHeight}, actual: ${imgSize.width}x${imgSize.height})`);
                }
            } else {
                console.log(`${image.description} not found`);
                missingElements.push(image.description);
            }
        } catch (error) {
            missingElements.push(`Error checking image "${image.description}": ${error.message}`);
        }
    }

    // 打印所有检查结果后再判断是否有错误
    if (missingElements.length > 0) {
        console.log(`以下元素未找到或大小不符: ${missingElements.join(', ')}`);
        expect(missingElements.length, `以下元素未找到或大小不符: ${missingElements.join(', ')}`).toBe(0);
    }

    await page.close();
});






test('About Betone(EN)', async () => {
    const page = await globalThis.context.newPage();
    // Set the page language to English
    await page.addInitScript(() => {
        localStorage.setItem('locale', 'en');
    });

    // Navigate to the account page
    await page.goto('https://wap-my.qbpink01.com/accountCenter');
    await page.waitForLoadState('networkidle');

    const missingElements = [];

    // Check and click the "About Betone" button
    const aboutButton = await page.locator('.about span:has-text("About Betone")');
    const aboutButtonVisible = await aboutButton.isVisible();
    console.log(`About Betone button exists: ${aboutButtonVisible}`);
    if (!aboutButtonVisible) {
        missingElements.push('About Betone button');
    } else {
        await aboutButton.click();
    }

    // Check the logo image size
    const logoImage = await page.locator('.about img[alt="logo"]');
    const logoImageVisible = await logoImage.isVisible();
    if (logoImageVisible) {
        const logoImageSize = await logoImage.evaluate(img => ({ width: img.naturalWidth, height: img.naturalHeight }));
        console.log(`Logo image size: ${logoImageSize.width}x${logoImageSize.height}`);
        const expectedLogoWidth = 93;
        const expectedLogoHeight = 114;
        if (logoImageSize.width !== expectedLogoWidth || logoImageSize.height !== expectedLogoHeight) {
            missingElements.push(`Logo image size mismatch (expected: ${expectedLogoWidth}x${expectedLogoHeight}, actual: ${logoImageSize.width}x${logoImageSize.height})`);
        }
    } else {
        missingElements.push('Logo image');
    }

    // Check the content in the modal
    await page.waitForSelector('.about-container', { state: 'visible' });

    const textsToCheck = [
        { text: 'Responsible Gambling', tag: 'div.about-heading' },
        { text: 'Betone is committed to loyal and trustworthy gambling guarantees. Our company complies with applicable regulations and guidelines from remote gaming authorities and strives to be a socially responsible remote gaming operator. Remote gambling is a legal entertainment experience for millions of players around the world. For most players, remote gambling is an enjoyable experience. However, we also accept the reality that a small number of players who indulge in remote gambling may be under the legal age or suffer from gambling-related impairments. Problems with their lives or financial situation. Being a socially responsible company means paying attention to our players, and it means taking a proactive approach to issues that may have an impact on society. That\'s why Betone has adopted and is fully committed to enforcing the strictest procedures and restrictions below.', tag: 'div.about-desc' },
        { text: 'Execution policy', tag: 'div.about-heading' },
        { text: 'Access restrictions for minors', tag: 'div.about-desc' },
        { text: 'Betone requires new customers to declare that they are of legal age in their jurisdiction and are at least 18 years old. When we suspect that a customer may have made a false declaration or that a minor may be trying to use our services, we will use reasonable methods for further verification.', tag: 'div.about-desc' },
        { text: 'Betone will not allow anyone under the age of 18 to use our services. This policy fully complies with and meets the rules and regulations of the remote gaming authority that regulates and licenses our operations, First Cagayan Leisure and Resort Corporation (FCRLC) for the Cagayan Economic Zone Authority (CEZA), of Santa Ana, Cagayan, Philippines;', tag: 'div.about-desc' },
        { text: 'We promise to do our best and need your help to do the following', tag: 'div.about-heading' },
        { text: '1. Use child protection software to block remote gambling websites from computers that may be used by minors.', tag: 'div.about-desc' },
        { text: '2. Do not leave your computer unattended when logging into a remote gaming website.', tag: 'div.about-desc' },
        { text: '3. Do not share your credit card or bank account details with minors.', tag: 'div.about-desc' },
        { text: '4. Do not enable the "Save Password" option on the login page of this website.', tag: 'div.about-desc' },
        { text: '5. Create a separate login file for minors on the computer so that they cannot access your information when they log in.', tag: 'div.about-desc' },
        { text: '6. If you know of anyone under the age of 18 (or under the legal age in their jurisdiction) who has mistakenly registered as a player with us, please notify us immediately.', tag: 'div.about-desc' },
        { text: 'Operation Qualification', tag: 'p.about-heading' },
        { text: 'Responsible Gambling', tag: 'p.about-heading' },
    ];

    const normalizeText = (text) => {
        return text.replace(/[^\w\s]/gi, '').replace(/\s+/g, '');
    };

    for (const item of textsToCheck) {
        let textVisible;
        try {
            const normalizedItem = normalizeText(item.text);
            const locator = await page.locator(`${item.tag}`).evaluateAll((elements, text) => {
                const regex = new RegExp(text, 'i');
                return elements.some(element => regex.test(element.innerText.replace(/[^\w\s]/gi, '').replace(/\s+/g, '')));
            }, normalizedItem);
            textVisible = locator;
            console.log(`Text "${item.text}" (${item.tag}) visible: ${textVisible}`);
            if (!textVisible) missingElements.push(`Text "${item.text}" (${item.tag})`);
        } catch (error) {
            missingElements.push(`Error checking text "${item.text}": ${error.message}`);
        }
    }

    // Check the footer images size
    const imagesToCheck = [
        { selector: 'img[src="/res/images/about-footer-1.png"]', description: 'icon_1', expectedWidth: 391, expectedHeight: 50 },
        { selector: 'img[src="/res/images/about-footer-2.png"]', description: 'icon_2', expectedWidth: 181, expectedHeight: 48 }
    ];

    for (const image of imagesToCheck) {
        try {
            const imgSize = await page.evaluate(selector => {
                const img = document.querySelector(selector);
                return img ? { width: img.naturalWidth, height: img.naturalHeight } : null;
            }, image.selector);

            if (imgSize) {
                console.log(`${image.description} size: ${imgSize.width}x${imgSize.height}`);
                if ((imgSize.width !== image.expectedWidth && image.expectedWidth !== 'auto') || imgSize.height !== image.expectedHeight) {
                    missingElements.push(`${image.description} size mismatch (expected: ${image.expectedWidth}x${image.expectedHeight}, actual: ${imgSize.width}x${imgSize.height})`);
                }
            } else {
                console.log(`${image.description} not found`);
                missingElements.push(image.description);
            }
        } catch (error) {
            missingElements.push(`Error checking image "${image.description}": ${error.message}`);
        }
    }

    // Print all the missing elements or size mismatches
    if (missingElements.length > 0) {
        console.log(`以下元素未找到或大小不符: ${missingElements.join(', ')}`);
        expect(missingElements.length, `以下元素未找到或大小不符: ${missingElements.join(', ')}`).toBe(0);
    }

    await page.close();
});