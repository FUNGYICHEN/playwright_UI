const { test, expect } = require('@playwright/test');
const { userRecordKey, userRecordValue } = require('./Q0constants');
const { randomHongKongPhoneNumber, randomUsername } = require('./phoneNumbers');
const { fetchVerificationCode } = require('./Q0phonecode'); // 引入验证码获取函数

test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    globalThis.context = context;
});

test.beforeEach(async () => {
    const page = await globalThis.context.newPage();

    await page.addInitScript(({ key, value }) => {
        localStorage.setItem(key, value);
    }, { key: userRecordKey, value: userRecordValue });

    await page.goto('http://wap-q0-npf2.qit1.net');
    await page.waitForLoadState('networkidle');

    await page.close();
});





test('檢查關於Q0', async () => {
    const page = await globalThis.context.newPage();

    // 导航到个人页面
    await page.goto('http://wap-q0-npf2.qit1.net/accountCenter');
    await page.waitForLoadState('networkidle');

    const missingElements = [];

    // 檢查 .icon.icon-alert.logo 並檢查大小
    const logo = await page.locator('.icon.icon-alert.logo').first();
    const logoVisible = await logo.isVisible();
    console.log(`q0 icon 是否存在: ${logoVisible}`);
    if (logoVisible) {
        const logoSize = await logo.evaluate(element => {
            return {
                width: element.offsetWidth,
                height: element.offsetHeight
            };
        });
        console.log(`q0 icon大小: ${logoSize.width}x${logoSize.height}`);
        const expectedWidth = 20;
        const expectedHeight = 20;
        if (logoSize.width !== expectedWidth || logoSize.height !== expectedHeight) {
            missingElements.push(`icon 大小不符 (期望: ${expectedWidth}x${expectedHeight}, 實際: ${logoSize.width}x${logoSize.height})`);
        }
    } else {
        missingElements.push('icon');
    }

    // 檢查並點擊“關於 q0”按鈕
    const aboutButton = await page.locator('.main-label .main-label-text', { hasText: '關於 q0' }).first();
    const aboutButtonVisible = await aboutButton.isVisible();
    console.log(`關於 q0按鈕是否存在: ${aboutButtonVisible}`);
    if (!aboutButtonVisible) {
        missingElements.push('關於 q0按鈕');
    } else {
        await aboutButton.click();
    }

    // 檢查彈窗中的所有文案和圖片大小
    await page.waitForSelector('.about-container', { state: 'visible' });

    const textsToCheck = [
        { text: '博彩責任', tag: 'div.about-heading' },
        { text: '博彩責任', tag: 'p.about-heading' },
        'q0致力於忠誠與可信賴的博彩保證。我們公司遵從遠端博彩管理當局的適用法規以及指引，而且努力成為對社會負責任的遠端博彩運營公司。遠程博彩是全球數以百萬玩家的合法娛樂體驗。對大多數玩家來說，遠端博彩是一項令人愉快的體驗，不過，我們也接受這樣的現實，少部分沈迷在遠端博彩的玩家可能會未達到法定年齡或者出現由於博彩而影響了他們的生活或財務狀況的問題。作為一個對社會負責的公司意味著要關注我們的玩家，意味著要對可能對社會產生影響的問題採用主動的方法去解決。這正是為何港體會會採用並完全承諾執行以下最嚴格的程式和限制。',
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
        'q0要求新客戶申明他們已經達到他們所屬的司法管轄地區規定的法定年齡且至少年滿18歲。當我們懷疑客戶可能虛假申報或可能有未成年人試圖使用我們的服務時，我們會使用合理的方法進一步進行驗證。',
        'q0不會允許任何未滿18歲的人士使用我們的服務。此政策完全遵從並滿足監管和給我們發放運營牌照的遠端博彩管理當局，First Cagayan Leisure and Resort Corporation (FCRLC) for the Cagayan Economic Zone Authority (CEZA), of Santa Ana, Cagayan，Philippines的規則和規定；',
        '我們承諾將盡我們所能而同時也需要您的協助做到以下這些',
        '1、使用兒童保護軟體從可能被未成年人使用的電腦上遮罩遠端博彩網站。',
        '2、當您的電腦登入到遠端博彩網站時不要讓電腦處於無人在旁的狀況。',
        '3、不要告知未成年人您的信用卡或銀行帳戶的詳細資料。',
        '4、不要在本網站登入頁面上讓“保存密碼”選項生效。',
        '5、在電腦上為未成年人建立獨立的登入檔案，令他們登入時無法訪問您的資料。',
        '6、如果您知道有人未滿18歲（或未滿他們所屬司法管轄地區法定年齡）但錯誤地註冊成為我們的玩家，請立刻通知我們。',
        '運營資質',
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






test('檢查關於 q0 (EN)', async () => {
    const page = await globalThis.context.newPage();
    // Set localStorage language to English
    await page.addInitScript(() => {
        localStorage.setItem('locale', 'en');
    });

    // Navigate to the personal page
    await page.goto('http://wap-q0-npf2.qit1.net/accountCenter');
    await page.waitForLoadState('networkidle');

    const missingElements = [];

    // Check .icon.icon-alert.logo and check size
    const logo = await page.locator('.icon.icon-alert.logo').first();
    const logoVisible = await logo.isVisible();
    console.log(`q0 icon visible: ${logoVisible}`);
    if (logoVisible) {
        const logoSize = await logo.evaluate(element => {
            return {
                width: element.offsetWidth,
                height: element.offsetHeight
            };
        });
        console.log(`q0 icon size: ${logoSize.width}x${logoSize.height}`);
        const expectedWidth = 20;
        const expectedHeight = 20;
        if (logoSize.width !== expectedWidth || logoSize.height !== expectedHeight) {
            missingElements.push(`icon size mismatch (expected: ${expectedWidth}x${expectedHeight}, actual: ${logoSize.width}x${logoSize.height})`);
        }
    } else {
        missingElements.push('icon');
    }

    // Check and click "About q0" button
    const aboutButton = await page.locator('.main-label .main-label-text', { hasText: 'About q0' }).first();
    const aboutButtonVisible = await aboutButton.isVisible();
    console.log(`About q0 button visible: ${aboutButtonVisible}`);
    if (!aboutButtonVisible) {
        missingElements.push('About q0 button');
    } else {
        await aboutButton.click();
    }

    // Check all texts and image sizes in the popup
    await page.waitForSelector('.about-container', { state: 'visible' });

    const textsToCheck = [
        { text: 'Responsible Gambling', tag: 'div.about-heading' },
        { text: 'q0 is committed to loyal and trustworthy gambling guarantees. Our company complies with applicable regulations and guidelines from remote gaming authorities and strives to be a socially responsible remote gaming operator. Remote gambling is a legal entertainment experience for millions of players around the world. For most players, remote gambling is an enjoyable experience. However, we also accept the reality that a small number of players who indulge in remote gambling may be under the legal age or suffer from gambling-related impairments. Problems with their lives or financial situation. Being a socially responsible company means paying attention to our players, and it means taking a proactive approach to issues that may have an impact on society. That\'s why q0 has adopted and is fully committed to enforcing the strictest procedures and restrictions below.', tag: 'div.about-desc' },
        { text: 'Execution policy', tag: 'div.about-heading' },
        { text: 'Access restrictions for minors', tag: 'div.about-desc' },
        { text: 'q0 requires new customers to declare that they are of legal age in their jurisdiction and are at least 18 years old. When we suspect that a customer may have made a false declaration or that a minor may be trying to use our services, we will use reasonable methods for further verification.', tag: 'div.about-desc' },
        { text: 'q0 will not allow anyone under the age of 18 to use our services. This policy fully complies with and meets the rules and regulations of the remote gaming authority that regulates and licenses our operations, First Cagayan Leisure and Resort Corporation (FCRLC) for the Cagayan Economic Zone Authority (CEZA), of Santa Ana, Cagayan, Philippines ;', tag: 'div.about-desc' },
        { text: 'We promise to do our best and need your help to do the following', tag: 'div.about-heading' },
        { text: '1. Use child protection software to block remote gambling websites from computers that may be used by minors.', tag: 'div.about-desc' },
        { text: '2. Do not leave your computer unattended when logging into a remote gaming website.', tag: 'div.about-desc' },
        { text: '3. Do not share your credit card or bank account details with minors.', tag: 'div.about-desc' },
        { text: '4. Do not enable the "Save Password" option on the login page of this website.', tag: 'div.about-desc' },
        { text: '5. Create a separate login file for minors on the computer so that they cannot access your information when they log in.', tag: 'div.about-desc' },
        { text: '6. If you know of anyone under the age of 18 (or under the legal age in their jurisdiction) who has mistakenly registered as a player with us, please notify us immediately.', tag: 'div.about-desc' },
        { text: 'Operation Qualification', tag: 'p.about-heading' },
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
            console.log(`Text "${item}" visible: ${textVisible}`);
            if (!textVisible) missingElements.push(`Text "${item}"`);
        } else {
            const normalizedItem = normalizeText(item.text);
            const locator = await page.locator(`${item.tag}`).evaluateAll((elements, text) => {
                const regex = new RegExp(text, 'i');
                return elements.some(element => regex.test(element.innerText.replace(/[^\w\s]/gi, '').replace(/\s+/g, '')));
            }, normalizedItem);
            textVisible = locator;
            console.log(`Text "${item.text}" (${item.tag}) visible: ${textVisible}`);
            if (!textVisible) missingElements.push(`Text "${item.text}" (${item.tag})`);
        }
    }

    // Check image sizes
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
            console.log(`${image.description} size: ${imgSize.width}x${imgSize.height}`);
            if ((imgSize.width !== image.expectedWidth && image.expectedWidth !== 'auto') || imgSize.height !== image.expectedHeight) {
                missingElements.push(`${image.description} size mismatch (expected: ${image.expectedWidth}x${image.expectedHeight}, actual: ${imgSize.width}x${imgSize.height})`);
            }
        } else {
            console.log(`${image.description} not found`);
            missingElements.push(image.description);
        }
    }

    // Print all check results before determining if there were errors
    if (missingElements.length > 0) {
        console.log(`The following elements were not found or had size mismatches: ${missingElements.join(', ')}`);
        expect(missingElements.length, `The following elements were not found or had size mismatches: ${missingElements.join(', ')}`).toBe(0);
    }

    await page.close();
});


