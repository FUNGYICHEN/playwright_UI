const { test, expect, devices } = require('@playwright/test');
const { userState, userValue } = require('./Q5constants');

test.describe('@WAP Q5 测试', () => {
    let page;
    let context;

    test.beforeAll(async ({ browser }) => {
        // 创建一个浏览器上下文，并保持在整个测试期间使用
        context = await browser.newContext({
            ...devices['iPhone 11'],
            headless: true, // 启用无头模式
        });
        // 在上下文中创建一个页面，并保持在整个测试期间使用
        page = await context.newPage();

        // 注入 userState 和 userValue 到 localStorage 中
        await page.addInitScript(({ key, value }) => {
            localStorage.setItem(key, value);
        }, { key: 'state', value: JSON.stringify({ user: userState, game: userValue }) });

        // 初始加载一个页面，以确保数据被注入
        await page.goto('http://wap-q4.qbpink01.com/');
        await page.waitForLoadState('networkidle');
    });

    test.beforeEach(async () => {
        // 确保页面未关闭。如果页面关闭了，重新创建页面。
        if (!page || page.isClosed()) {
            page = await context.newPage();
            await page.addInitScript(({ key, value }) => {
                localStorage.setItem(key, value);
            }, { key: 'state', value: JSON.stringify({ user: userState, game: userValue }) });
        }
    });

    test.afterAll(async () => {
        // 所有测试完成后关闭页面和上下文
        if (page && !page.isClosed()) {
            await page.close();
        }
        if (context) {
            await context.close();
        }
    });

    test('檢查關於 BETRIX', async () => {

        // 导航到个人页面
        await page.goto('http://wap-q4.qbpink01.com/account');
        await page.waitForLoadState('networkidle');

        const missingElements = [];

        // 检查并验证第一个图标是否存在及大小是否正确
        const firstIcon = await page.locator('img.h-5.w-5[src^="data:image/svg+xml"]').first();
        const firstIconVisible = await firstIcon.isVisible();
        console.log(`BETRIX icon 是否存在: ${firstIconVisible}`);
        if (firstIconVisible) {
            const firstIconSize = await firstIcon.evaluate(element => {
                return {
                    width: element.offsetWidth,
                    height: element.offsetHeight
                };
            });
            console.log(`BETRIX icon 大小: ${firstIconSize.width}x${firstIconSize.height}`);
            const expectedWidth = 20;
            const expectedHeight = 20;
            if (firstIconSize.width !== expectedWidth || firstIconSize.height !== expectedHeight) {
                missingElements.push(`icon 大小不符 (期望: ${expectedWidth}x${expectedHeight}, 實際: ${firstIconSize.width}x${firstIconSize.height})`);
            }
        } else {
            missingElements.push('BETRIX icon');
        }

        // 检查并点击“關於 BETRIX”按钮
        const aboutButton = await page.locator('div.flex.cursor-pointer', { hasText: '關於 BETRIX' }).first();
        const aboutButtonVisible = await aboutButton.isVisible();
        console.log(`關於 BETRIX 按钮是否存在: ${aboutButtonVisible}`);
        if (!aboutButtonVisible) {
            missingElements.push('關於 BETRIX 按钮');
        } else {
            await aboutButton.click();
        }

        // 检查弹窗是否出现
        await page.waitForSelector('.ant-modal-content', { state: 'visible' });

        // 检查弹窗内的文案
        const textsToCheck = [
            '關於我們',
            '博彩政策',
            'BETRIX致力於忠誠與可信賴的博彩保證。',
            '遠程博彩是全球數以百萬玩家的合法娛樂體驗。',
            '對大多數玩家來說，遠端博彩是一項令人愉快的體驗，',
            '不過，我們也接受這樣的現實，少部分沈迷在遠端博彩的玩家可能會未達到法定年齡或者出現由於博彩而影響了他們的生活或財務狀況的問題。',
            '作為一個對社會負責的公司意味著要關注我們的玩家，',
            '意味著要對可能對社會產生影響的問題採用主動的方法去解決。',
            '這正是為何BETRIX會採用並完全承諾執行以下最嚴格的程式和限制。',
            '執行政策：',
            '對未成年人的訪問限制',
            'BETRIX要求新客戶申明他們已經達到他們所屬的司法管轄地區規定的法定年齡且至少年滿18歲。',
            '當我們懷疑客戶可能虛假申報或可能有未成年人試圖使用我們的服務時，我們會使用合理的方法進一步進行驗證。',
            'BETRIX不會允許任何未滿18歲的人士使用我們的服務。',
            '此政策完全遵從並滿足監管和給我們發放運營牌照的遠端博彩管理當局，First Cagayan Leisure and Resort Corporation (FCRLC) for the Cagayan Economic Zone Authority (CEZA), of Santa Ana, Cagayan，Philippines的規則和規定；',
            '我們承諾將盡我們所能而同時也需要您的協助做到以下這些',
            '1、使用兒童保護軟體從可能被未成年人使用的電腦上遮罩遠端博彩網站。',
            '2、當您的電腦登入到遠端博彩網站時不要讓電腦處於無人在旁的狀況。',
            '3、不要告知未成年人您的信用卡或銀行帳戶的詳細資料。',
            '4、不要在BETRIX登入頁面上讓“保存密碼”選項生效。',
            '5、在電腦上為未成年人建立獨立的登入檔案，令他們登入時無法訪問您的資料。',
            '6、如果您知道有人未滿18歲（或未滿他們所屬司法管轄地區法定年齡）但錯誤地註冊成為我們的玩家，請立刻通知我們。',
            '運營資質',
            '博彩責任'
        ];

        for (const text of textsToCheck) {
            const textVisible = await page.locator(`text=${text}`).isVisible();
            console.log(`文案 "${text}" 是否存在: ${textVisible}`);
            if (!textVisible) missingElements.push(`文案 "${text}"`);
        }


        // 检查图片大小
        const imagesToCheck = [
            { selector: 'img[src="https://wap-q4.qbpink01.com/assets/about-footer-1-wf_6gNCz.png"]', description: 'footer image 1', expectedWidth: 391, expectedHeight: 50 },
            { selector: 'img[src="data:image/png;base64,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"]', description: 'footer image 2', expectedWidth: 181, expectedHeight: 48 }
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

    });



    test('檢查about BETRIX', async () => {
        // 设置 localStorage 语言为英语
        await page.addInitScript(() => {
            localStorage.setItem('locale', '"en"');
        });

        // 导航到账户页面
        await page.goto('http://wap-q4.qbpink01.com/account');
        await page.waitForLoadState('networkidle');

        const missingElements = [];

        // 检查并验证第一个图标是否存在及大小是否正确
        const firstIcon = await page.locator('img.h-5.w-5[src^="data:image/svg+xml"]').first();
        const firstIconVisible = await firstIcon.isVisible();
        console.log(`BETRIX 图标是否可见: ${firstIconVisible}`);
        if (firstIconVisible) {
            const firstIconSize = await firstIcon.evaluate(element => {
                return {
                    width: element.offsetWidth,
                    height: element.offsetHeight
                };
            });
            console.log(`BETRIX 图标大小: ${firstIconSize.width}x${firstIconSize.height}`);
            const expectedWidth = 20;
            const expectedHeight = 20;
            if (firstIconSize.width !== expectedWidth || firstIconSize.height !== expectedHeight) {
                missingElements.push(`图标大小不符 (期望: ${expectedWidth}x${expectedHeight}, 实际: ${firstIconSize.width}x${firstIconSize.height})`);
            }
        } else {
            missingElements.push('BETRIX 图标');
        }

        // 检查并点击“About BETRIX”按钮
        const aboutButton = await page.locator('div.flex.cursor-pointer', { hasText: 'About BETRIX' }).first();
        const aboutButtonVisible = await aboutButton.isVisible();
        console.log(`"About BETRIX" 按钮是否可见: ${aboutButtonVisible}`);
        if (!aboutButtonVisible) {
            missingElements.push('"About BETRIX" 按钮');
        } else {
            await aboutButton.click();
        }

        // 检查弹窗是否出现
        await page.waitForSelector('.ant-modal-content', { state: 'visible' });

        // 定义标准化函数
        const normalizeText = (text) => {
            return text.replace(/[^\w\s]/gi, '').replace(/\s+/g, '').toLowerCase();
        };

        // 检查弹窗内的文案
        const textsToCheck = [
            'About Us',
            'Gaming Policy',
            'BETRIX is committed to faithful and reliable gaming guarantees.',
            'Remote gaming is a legal entertainment experience for millions of players around the world.',
            'Remote gaming is an enjoyable experience for most players,',
            'but we also accept that a small number of players who indulge in remote gaming may be underage or experience gambling that affects their life or financial situation.',
            'Being a socially responsible company means paying attention to our players,',
            'and means taking a proactive approach to issues that can have an impact on society.',
            'This is why BETRIX adopts and fully commits to the strictest procedures and restrictions below.',
            'Execute Policy:',
            'Access restrictions for minors',
            'BETRIX requires new customers to declare that they are of legal age in their jurisdiction and are at least 18 years old.',
            'When we suspect that a customer may have falsely declared or that a minor may be trying to use our service, we will use reasonable methods to further verify.',
            'BETRIX will not allow anyone under the age of 18 to use our services.',
            'This policy fully complies with and complies with the rules and regulations of the First Cagayan Leisure and Resort Corporation (FCRLC) for the Cagayan Economic Zone Authority (CEZA) of Santa Ana, Cagayan, Philippines;',
            'We promise to do our best and need your assistance to do the following',
            '1. Use child protection software to shield remote gaming sites from computers that may be used by minors.',
            '2. When your computer is logged in to the remote gaming website, do not leave the computer in a situation where no one is around.',
            '3. Do not tell minors your credit card or bank account details.',
            '4. Do not enable the "Save Password" option on the BETRIX login page.',
            '5. Create a separate login file for minors on the computer so that they cannot access your information when they log in.',
            '6. If you know of someone under 18 (or under the legal age in their jurisdiction) who has mistakenly registered as our player, please notify us immediately.',
            'Operation qualification',
            'Gaming Responsibility'
        ];

        for (const text of textsToCheck) {
            const normalizedText = normalizeText(text);
            const textVisible = await page.locator('.ant-modal-content').evaluate((element, normalizedText) => {
                const pageText = element.innerText.replace(/[^\w\s]/gi, '').replace(/\s+/g, '').toLowerCase();
                return pageText.includes(normalizedText);
            }, normalizedText);

            console.log(`文案 "${text}" 是否可见: ${textVisible}`);
            if (!textVisible) missingElements.push(`文案 "${text}"`);
        }

        // 检查图片大小
        const imagesToCheck = [
            { selector: 'img[src="http://wap-q4.qbpink01.com/assets/about-footer-1-wf_6gNCz.png"]', description: 'footer image 1', expectedWidth: 391, expectedHeight: 50 },
            { selector: 'img[src="data:image/png;base64,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"]', description: 'footer image 2', expectedWidth: 181, expectedHeight: 48 }
        ];

        for (const image of imagesToCheck) {
            const imgSize = await page.evaluate(selector => {
                const img = document.querySelector(selector);
                return img ? { width: img.naturalWidth, height: img.naturalHeight } : null;
            }, image.selector);

            if (imgSize) {
                console.log(`${image.description} 大小: ${imgSize.width}x${imgSize.height}`);
                if ((imgSize.width !== image.expectedWidth && image.expectedWidth !== 'auto') || imgSize.height !== image.expectedHeight) {
                    missingElements.push(`${image.description} 大小不符 (期望: ${image.expectedWidth}x${image.expectedHeight}, 实际: ${imgSize.width}x${imgSize.height})`);
                }
            } else {
                console.log(`${image.description} 未找到`);
                missingElements.push(image.description);
            }
        }

        // 打印所有检查结果并判断是否有错误
        if (missingElements.length > 0) {
            console.log(`以下元素未找到或大小不符: ${missingElements.join(', ')}`);
            expect(missingElements.length, `以下元素未找到或大小不符: ${missingElements.join(', ')}`).toBe(0);
        }

    });

});

