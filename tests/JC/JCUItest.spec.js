const { test, expect } = require('@playwright/test');
const { userRecordKey, userRecordValue } = require('./JCconstants');
// const { randomHongKongPhoneNumber, randomUsername } = require('./phoneNumbers');
// const { fetchVerificationCode } = require('./JCphonecode'); // 引入验证码获取函数

test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    globalThis.context = context;
});

test.beforeEach(async () => {
    const page = await globalThis.context.newPage();

    await page.addInitScript(({ key, value }) => {
        localStorage.setItem(key, value);
    }, { key: userRecordKey, value: userRecordValue });

    await page.goto('http://wapv2.jc-uat.qit1.net');
    await page.waitForLoadState('networkidle');

    await page.close();
});


test('登入頁檢查', async () => {
    const page = await globalThis.context.newPage();

    await page.goto('http://wapv2.jc-uat.qit1.net/login');
    await page.waitForLoadState('networkidle');
    const missingElements = [];

    // 检查“6-12個英文字母和數字”文案是否存在
    const usernamePlaceholderVisible = await page.locator('input[placeholder="6-12個英文字母和數字"]').isVisible();
    console.log(`6-12個英文字母和數字: ${usernamePlaceholderVisible}`);
    if (!usernamePlaceholderVisible) missingElements.push('6-12個英文字母和數字');

    // 检查“請輸入密碼”文案是否存在
    const passwordPlaceholderVisible = await page.locator('input[placeholder="請輸入密碼"]').isVisible();
    console.log(`請輸入密碼文案是否存在: ${passwordPlaceholderVisible}`);
    if (!passwordPlaceholderVisible) missingElements.push('請輸入密碼文案');

    // 检查“記住密碼”文案是否存在
    const rememberPasswordLabelVisible = await page.locator('label:has-text("記住密碼")').isVisible();
    console.log(`記住密碼文案是否存在: ${rememberPasswordLabelVisible}`);
    if (!rememberPasswordLabelVisible) missingElements.push('記住密碼文案');

    // 检查“忘記密碼?”文案是否存在
    const forgotPasswordLabelVisible = await page.locator('label.guestEle a:has-text("忘記密碼")').isVisible();
    console.log(`忘記密碼是否存在: ${forgotPasswordLabelVisible}`);
    if (!forgotPasswordLabelVisible) missingElements.push('忘記密碼');

    // 检查“登錄”文案是否存在
    const loginButtonVisible = await page.locator('div.submitBtn.btns:has-text("登入")').isVisible();
    console.log(`登入是否存在: ${loginButtonVisible}`);
    if (!loginButtonVisible) missingElements.push('登入');

    // 检查“註冊”文案是否存在
    const registerButtonVisible = await page.locator('div.submitBtn.btns:has-text("註冊")').isVisible();
    console.log(`註冊是否存在: ${registerButtonVisible}`);
    if (!registerButtonVisible) missingElements.push('註冊');

    // 检查“先去逛逛”与“聯繫客服”是否存在
    const exploreTextVisible = await page.locator('div[style="text-align: center;"]:has-text("先去逛逛")').isVisible();
    console.log(`先去逛逛文案是否存在: ${exploreTextVisible}`);
    if (!exploreTextVisible) missingElements.push('先去逛逛文案');

    // 检查密碼圖標是否存在
    const passwordIconVisible = await page.locator('svg.iconeye.am-icon.am-icon-eye.am-icon-md').isVisible();
    console.log(`密碼圖標是否存在: ${passwordIconVisible}`);
    if (!passwordIconVisible) missingElements.push('密碼圖標');

    // 检查图标是否存在及其大小
    const iconSelector = 'img[src="/res/images/com-jc/jc-icon.png"]';
    const iconVisible = await page.locator(iconSelector).isVisible();
    console.log(`圖標是否存在: ${iconVisible}`);
    if (!iconVisible) {
        missingElements.push('圖標');
    } else {
        const { width, height } = await page.evaluate(selector => {
            const img = document.querySelector(selector);
            return { width: img.naturalWidth, height: img.naturalHeight };
        }, iconSelector);

        console.log(`圖標大小: ${width}x${height}`);
        const expectedWidth = 700;  // 替换为预期宽度
        const expectedHeight = 700; // 替换为预期高度
        if (width !== expectedWidth || height !== expectedHeight) {
            missingElements.push(`圖標大小 (實際: ${width}x${height}, 預期: ${expectedWidth}x${expectedHeight})`);
        }
    }

    // 打印所有检查结果后再判断是否有错误
    if (missingElements.length > 0) {
        console.log(`以下元素未找到或大小不符: ${missingElements.join(', ')}`);
        expect(missingElements.length, `以下元素未找到或大小不符: ${missingElements.join(', ')}`).toBe(0);
    }

    await page.close();
});




test('首頁檢查', async () => {
    const page = await globalThis.context.newPage();
    try {
        await page.goto('http://wapv2.jc-uat.qit1.net/hall');
        await page.waitForLoadState('networkidle');

        const missingElements = [];

        // 檢查並關閉彈窗
        let closeButtonVisible = true;
        while (closeButtonVisible) {
            const closeButton = page.locator('.promotionAd-btn-box .promotionAd-btn.show');
            closeButtonVisible = await closeButton.isVisible();
            if (closeButtonVisible) {
                await closeButton.click();
                console.log('關閉廣告');
                // 等待彈窗消失並檢查是否還有彈窗存在
                await page.waitForTimeout(1000); // 可以根據需要調整等待時間
            }
        }

        // 查找並檢查圖片元素
        const elementsToCheck = [
            { label: '平台圖標', selector: '.logo img[src="/res/images/com-jc/jc-icon.png"][alt=""]', expectedWidth: 44.21875, expectedHeight: 44.21875 },
            { label: '用戶圖標', selector: '.account-info img[src="/res/images/icon-account.png"][alt=""]', expectedWidth: 26, expectedHeight: 26 },
            { label: '用戶ID', selector: '.account-info span.user-id:has-text("uitest001")' },  // 文案，不檢查大小
            { label: '登出圖標', selector: '.func-btn .icon.icon-logout' },
            { label: '登出文案', selector: '.func-btn .label:has-text("登出")' },  // 文案，不檢查大小
            { label: '香港語系圖標', selector: '.lang-wrapper .lang-box.current-lang img[src="/res/images/lang/hk.png"][alt=""]', expectedWidth: 24, expectedHeight: 24 }
        ];

        for (const element of elementsToCheck) {
            const elementHandle = page.locator(element.selector);
            const elementExists = await elementHandle.count() > 0;

            if (!elementExists) {
                missingElements.push(`${element.label} 不存在`);
            } else {
                // 如果是需要檢查大小的元素
                if (element.expectedWidth !== undefined && element.expectedHeight !== undefined) {
                    const { width, height } = await elementHandle.evaluate(el => {
                        const rect = el.getBoundingClientRect();
                        return { width: rect.width, height: rect.height };
                    });

                    console.log(`${element.label} 大小: 寬度=${width}px, 高度=${height}px`);

                    // 檢查元素是否可見
                    const isVisible = await elementHandle.isVisible();
                    console.log(`${element.label} 是否可見: ${isVisible}`);
                    if (!isVisible) {
                        missingElements.push(`${element.label} 不可見`);
                    }

                    // 檢查元素大小
                    if (width !== element.expectedWidth || height !== element.expectedHeight) {
                        missingElements.push(`${element.label} 大小不符: 寬度=${width}px (預期=${element.expectedWidth}px), 高度=${height}px (預期=${element.expectedHeight}px)`);
                    }
                } else {
                    // 只檢查元素是否可見
                    const isVisible = await elementHandle.isVisible();
                    console.log(`${element.label} 是否可見: ${isVisible}`);
                    if (!isVisible) {
                        missingElements.push(`${element.label} 不可見`);
                    }
                }
            }
        }

        // 檢查橫幅框架和圖片
        const bannerFrame = page.locator('.banner .banner-content .sliderBannerBox-sportII');
        const bannerFrameExists = await bannerFrame.count() > 0;
        if (!bannerFrameExists) {
            missingElements.push('橫幅框架不存在');
        } else {
            const { width, height } = await bannerFrame.evaluate(el => {
                const rect = el.getBoundingClientRect();
                return { width: rect.width, height: rect.height };
            });
            console.log(`橫幅框架大小: 寬度=${width}px, 高度=${height}px`);

            const bannerImages = bannerFrame.locator('img.banImg');
            const bannerImagesCount = await bannerImages.count();
            for (let i = 0; i < bannerImagesCount; i++) {
                const bannerImage = bannerImages.nth(i);
                const { width, height } = await bannerImage.evaluate(el => {
                    const rect = el.getBoundingClientRect();
                    return { width: rect.width, height: rect.height };
                });
                console.log(`橫幅圖片 ${i + 1} 大小: 寬度=${width}px, 高度=${height}px`);
            }
        }

        // 打印所有检查结果后再判断是否有错误
        if (missingElements.length > 0) {
            console.log(`以下元素未找到或不可見: ${missingElements.join(', ')}`);
        } else {
            console.log('所有檢查项均通過');
        }

        expect(missingElements.length, `以下元素未找到或不可見: ${missingElements.join(', ')}`).toBe(0);
    } catch (error) {
        console.error('發生錯誤:', error);
        throw error;
    } finally {
        await page.close();
    }
});





test('首頁跑馬燈與排行榜檢查', async () => {
    const page = await globalThis.context.newPage();
    try {
        await page.goto('http://wapv2.jc-uat.qit1.net/hall');
        console.log('成功導航到首頁');
        await page.waitForLoadState('networkidle');

        const missingElements = [];

        // 檢查並關閉彈窗
        let closeButtonVisible = true;
        while (closeButtonVisible) {
            const closeButton = page.locator('.promotionAd-btn-box .promotionAd-btn.show');
            closeButtonVisible = await closeButton.isVisible();
            if (closeButtonVisible) {
                await closeButton.click();
                console.log('關閉廣告');
                await page.waitForTimeout(1000);
            }
        }

        // 檢查跑馬燈元素是否存在
        const marqueeElement = page.locator('#noticeBoxSportII .notice_Group .notice_ListBox .marqee');
        const marqueeExists = await marqueeElement.count() > 0;
        if (!marqueeExists) {
            missingElements.push('跑馬燈元素不存在');
        } else {
            const isVisible = await marqueeElement.isVisible();
            console.log(`跑馬燈元素是否可見: ${isVisible}`);
            if (!isVisible) {
                missingElements.push('跑馬燈元素不可見');
            }
        }

        // 檢查排行榜圖片大小和存在
        const dragonBgElement = page.locator('img.dragon-bg[src="/res/images/homeSportII/dragon-bg.png"][alt="dragon-bg"]');
        const dragonBgExists = await dragonBgElement.count() > 0;
        if (!dragonBgExists) {
            missingElements.push('排行榜圖片不存在');
        } else {
            const { width, height } = await dragonBgElement.evaluate(el => {
                const rect = el.getBoundingClientRect();
                return { width: rect.width, height: rect.height };
            });
            console.log(`排行榜圖片大小: 寬度=${width}px, 高度=${height}px`);
            const isVisible = await dragonBgElement.isVisible();
            console.log(`排行榜圖片是否可見: ${isVisible}`);
            if (!isVisible) {
                missingElements.push('排行榜圖片不可見');
            }
        }

        // 檢查兩個元素是否存在
        const dragonTigerContentElement = page.locator('.dragon-tiger-content');
        const dragonTigerListElement = page.locator('.dragon-tiger-list.dragon-tiger-list-1');

        const dragonTigerContentVisible = await dragonTigerContentElement.isVisible();
        console.log(`龍虎內容 元素是否可見: ${dragonTigerContentVisible}`);
        if (!dragonTigerContentVisible) {
            missingElements.push('龍虎內容 元素不存在');
        }

        const dragonTigerListVisible = await dragonTigerListElement.isVisible();
        console.log(`龍虎列表-1 元素是否可見: ${dragonTigerListVisible}`);
        if (!dragonTigerListVisible) {
            missingElements.push('龍虎列表-1 元素不存在');
        }

        // 檢查在線人數、點數、鎖定點數、文案是否存在
        const onlineNumberElement = page.locator('.account-user .online-number div:has-text("在線人數")');
        const pointLabelElement = page.locator('.account-user .balances .balance:has(div.label:has-text("點數"))').first();
        const lockedPointLabelElement = page.locator('.account-user .balances .balance:has(div.label:has-text("鎖定點數"))');

        const onlineNumberVisible = await onlineNumberElement.isVisible();
        console.log(`在線人數 文案是否可見: ${onlineNumberVisible}`);
        if (!onlineNumberVisible) {
            missingElements.push('在線人數 文案不存在');
        }

        const pointLabelVisible = await pointLabelElement.isVisible();
        console.log(`點數 文案是否可見: ${pointLabelVisible}`);
        if (!pointLabelVisible) {
            missingElements.push('點數 文案不存在');
        }

        const lockedPointLabelVisible = await lockedPointLabelElement.isVisible();
        console.log(`鎖定點數 文案是否可見: ${lockedPointLabelVisible}`);
        if (!lockedPointLabelVisible) {
            missingElements.push('鎖定點數 文案不存在');
        }

        // 檢查額外元素
        const extraElementsToCheck = [
            { iconLabel: 'icon-gift', textLabel: '禮物兌換' },
            { iconLabel: 'icon-rebate', textLabel: '返水領取' },
            { iconLabel: 'icon-deposit', textLabel: '存款' },
            { iconLabel: 'icon-withdraw', textLabel: '提款' }
        ];

        for (const element of extraElementsToCheck) {
            const iconElement = page.locator(`.icon.${element.iconLabel}`);
            const textElement = page.locator(`.label:has-text("${element.textLabel}")`);

            const iconExists = await iconElement.count() > 0;
            const textExists = await textElement.count() > 0;

            if (!iconExists) {
                missingElements.push(`${element.textLabel} icon 不存在`);
            } else {
                const iconVisible = await iconElement.isVisible();
                console.log(`${element.textLabel} icon 是否存在: ${iconVisible}`);
                if (!iconVisible) {
                    missingElements.push(`${element.textLabel} icon 不可見`);
                }
            }

            if (!textExists) {
                missingElements.push(`${element.textLabel} 文案不存在`);
            } else {
                const textVisible = await textElement.isVisible();
                console.log(`${element.textLabel} 文案 是否存在: ${textVisible}`);
                if (!textVisible) {
                    missingElements.push(`${element.textLabel} 文案 不可見`);
                }
            }
        }

        // 打印所有检查结果后再判断是否有错误
        if (missingElements.length > 0) {
            console.log(`以下元素未找到或不可見: ${missingElements.join(', ')}`);
        } else {
            console.log('所有檢查项均通過');
        }

        expect(missingElements.length, `以下元素未找到或不可見: ${missingElements.join(', ')}`).toBe(0);
    } catch (error) {
        console.error('發生錯誤:', error.message);
        throw error;
    } finally {
        await page.close();
    }
});




test('場館icon檢查', async () => {
    const page = await globalThis.context.newPage();
    try {
        await page.goto('http://wapv2.jc-uat.qit1.net/hall');
        console.log('成功導航到首頁');
        await page.waitForLoadState('networkidle');

        const missingElements = [];

        // 檢查並關閉彈窗
        let closeButtonVisible = true;
        while (closeButtonVisible) {
            const closeButton = page.locator('.promotionAd-btn-box .promotionAd-btn.show');
            closeButtonVisible = await closeButton.isVisible();
            if (closeButtonVisible) {
                await closeButton.click();
                console.log('關閉廣告');
                await page.waitForTimeout(1000);
            }
        }

        // 檢查icon和label是否存在，並檢查背景圖片
        const elementsToCheck = [
            { label: '真人icon', selector: '.category-filter .icon-live', expectedBg: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/gameCategory/icon-delier-active.png' },
            { label: '真人label', selector: '.category-filter .label:has-text("真人")' },
            { label: '體育icon', selector: '.category-filter .icon-sport', expectedBg: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/gameCategory/icon-sport-ball.png' },
            { label: '體育label', selector: '.category-filter .label:has-text("體育")' },
            { label: '專區icon', selector: '.category-filter .icon-zone', expectedBg: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/gameCategory/icon-logo-s.png' },
            { label: '專區label', selector: '.category-filter .label:has-text("專區")' },
            { label: '棋牌icon', selector: '.category-filter .icon-chess', expectedBg: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/gameCategory/icon-poker-cards.png' },
            { label: '棋牌label', selector: '.category-filter .label:has-text("棋牌")' },
            { label: '電子icon', selector: '.category-filter .icon-eGame', expectedBg: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/gameCategory/icon-slot-machine.png' },
            { label: '電子label', selector: '.category-filter .label:has-text("電子")' },
            { label: '捕魚icon', selector: '.category-filter .icon-fish', expectedBg: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/gameCategory/icon-fish.png' },
            { label: '捕魚label', selector: '.category-filter .label:has-text("捕魚")' },
            { label: '電競icon', selector: '.category-filter .icon-eSport', expectedBg: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/gameCategory/icon-esport.png' },
            { label: '電競label', selector: '.category-filter .label:has-text("電競")' },
            { label: '實況icon', selector: '.category-filter .icon-animal-planet', expectedBg: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/gameCategory/icon-live.png' },
            { label: '實況label', selector: '.category-filter .label:has-text("實況")' }
        ];

        for (const element of elementsToCheck) {
            const elementHandle = page.locator(element.selector);
            const isVisible = await elementHandle.isVisible();
            console.log(`${element.label} 是否存在: ${isVisible}`);
            if (!isVisible) {
                missingElements.push(`${element.label} 不存在`);
            }

            // 檢查背景圖片
            if (element.expectedBg) {
                const backgroundImage = await elementHandle.evaluate(el => getComputedStyle(el).backgroundImage);
                const imageUrl = backgroundImage.slice(5, -2); // 去掉 url(" 和 ")
                console.log(`${element.label} 圖片是否正確: ${imageUrl === element.expectedBg}`);
                if (imageUrl !== element.expectedBg) {
                    missingElements.push(`${element.label} 圖片不正確`);
                }
            }
        }

        // 打印所有检查结果后再判断是否有错误
        if (missingElements.length > 0) {
            console.log(`以下元素未找到或不可見: ${missingElements.join(', ')}`);
        } else {
            console.log('所有檢查通過');
        }

        expect(missingElements.length, `以下元素未找到或不可見: ${missingElements.join(', ')}`).toBe(0);
    } catch (error) {
        console.error('發生錯誤:', error.message);
        throw error;
    } finally {
        await page.close();
    }
});




test('真人遊戲商圖片檢查', async () => {
    const page = await globalThis.context.newPage();
    try {
        await page.goto('http://wapv2.jc-uat.qit1.net/hall');
        console.log('成功導航到首頁');
        await page.waitForLoadState('networkidle');

        const missingElements = [];

        // 檢查並關閉彈窗
        let closeButtonVisible = true;
        while (closeButtonVisible) {
            const closeButton = page.locator('.promotionAd-btn-box .promotionAd-btn.show');
            closeButtonVisible = await closeButton.isVisible();
            if (closeButtonVisible) {
                await closeButton.click();
                console.log('關閉廣告');
                await page.waitForTimeout(1000);
            }
        }

        // 定義檢查元素和預期的背景圖片URL
        const venueElementsToCheck = [
            { label: 'T9真人', selector: '.enter-game-button.bk-live-t9.zh-TW', expectedUrl: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/game-zone/live-t9.png' },
            { label: 'PP真人', selector: '.enter-game-button.bk-live-pp.zh-TW', expectedUrl: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/game-zone/live-pp.png' },
            { label: 'DG真人', selector: '.enter-game-button.bk-dg.zh-TW', expectedUrl: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/game-zone/bk-dg.png' },
            { label: 'SEXY真人', selector: '.enter-game-button.bk-sexy.zh-TW', expectedUrl: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/game-zone/bk-sexy.png' },
            { label: 'AFB真人', selector: '.enter-game-button.bk-live-afb.zh-TW', expectedUrl: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/game-zone/live-afb.png' },
            { label: 'WM真人', selector: '.enter-game-button.bk-wm.zh-TW', expectedUrl: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/game-zone/bk-wm.png' },
            { label: 'OB真人', selector: '.enter-game-button.bk-live-ob.zh-TW', expectedUrl: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/game-zone/live-ob.png' },
            { label: 'ASTAR真人', selector: '.enter-game-button.bk-live-astar.zh-TW', expectedUrl: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/game-zone/live-astar.png' },
            { label: 'WE真人', selector: '.enter-game-button.bk-we.zh-TW', expectedUrl: 'http://wapv2.jc-uat.qit1.net/res/images/homeSportII/game-zone/bk-we.png' }
        ];

        for (const element of venueElementsToCheck) {
            const elementHandle = page.locator(element.selector);
            const isVisible = await elementHandle.isVisible();
            console.log(`${element.label} 是否存在: ${isVisible}`);
            if (!isVisible) {
                missingElements.push(`${element.label} 不存在`);
                continue;
            }

            const background = await elementHandle.evaluate(el => getComputedStyle(el).background);
            const urlRegex = /url\(["']?([^"'\)]+)["']?\)/g;
            const urls = [];
            let match;
            while ((match = urlRegex.exec(background)) !== null) {
                urls.push(match[1]);
            }

            console.log(`${element.label} 提取的URL: ${urls.join(', ')}`);
            const isCorrectUrl = urls.includes(element.expectedUrl);
            console.log(`${element.label} 背景圖片是否正確: ${isCorrectUrl}`);
            if (!isCorrectUrl) {
                missingElements.push(`${element.label} 背景圖片不正確`);
            }
        }

        // 打印所有检查结果后再判断是否有错误
        if (missingElements.length > 0) {
            console.log(`以下元素未找到或不可見: ${missingElements.join(', ')}`);
        } else {
            console.log('所有检查项均通过');
        }

        expect(missingElements.length, `以下元素未找到或不可見: ${missingElements.join(', ')}`).toBe(0);
    } catch (error) {
        console.error('發生錯誤:', error.message);
        throw error;
    } finally {
        await page.close();
    }
});




// test.only('首頁場館檢查', async () => {
//     const page = await globalThis.context.newPage();
//     try {
//         await page.goto('http://wapv2.jc-uat.qit1.net/hall');
//         console.log('成功導航到首頁');
//         await page.waitForLoadState('networkidle');

//         const missingElements = [];

//         // 檢查並關閉彈窗
//         let closeButtonVisible = true;
//         while (closeButtonVisible) {
//             const closeButton = page.locator('.promotionAd-btn-box .promotionAd-btn.show');
//             closeButtonVisible = await closeButton.isVisible();
//             if (closeButtonVisible) {
//                 await closeButton.click();
//                 console.log('關閉廣告');
//                 await page.waitForTimeout(1000);
//             }
//         }

//         // 檢查icon和label是否存在
//         const elementsToCheck = [
//             { label: '真人icon', selector: '.category-filter .icon-live' },
//             { label: '真人label', selector: '.category-filter .label:has-text("真人")' },
//             { label: '體育icon', selector: '.category-filter .icon-sport' },
//             { label: '體育label', selector: '.category-filter .label:has-text("體育")' },
//             { label: '專區icon', selector: '.category-filter .icon-zone' },
//             { label: '專區label', selector: '.category-filter .label:has-text("專區")' },
//             { label: '棋牌icon', selector: '.category-filter .icon-chess' },
//             { label: '棋牌label', selector: '.category-filter .label:has-text("棋牌")' },
//             { label: '電子icon', selector: '.category-filter .icon-eGame' },
//             { label: '電子label', selector: '.category-filter .label:has-text("電子")' },
//             { label: '捕魚icon', selector: '.category-filter .icon-fish' },
//             { label: '捕魚label', selector: '.category-filter .label:has-text("捕魚")' },
//             { label: '電競icon', selector: '.category-filter .icon-eSport' },
//             { label: '電競label', selector: '.category-filter .label:has-text("電競")' },
//             { label: '實況icon', selector: '.category-filter .icon-animal-planet' },
//             { label: '實況label', selector: '.category-filter .label:has-text("實況")' }
//         ];

//         for (const element of elementsToCheck) {
//             const elementHandle = page.locator(element.selector);
//             const isVisible = await elementHandle.isVisible();
//             console.log(`${element.label} 是否存在: ${isVisible}`);
//             if (!isVisible) {
//                 missingElements.push(`${element.label} 不存在`);
//             }
//         }

//         // 檢查場館icon和label是否存在
//         const venueElementsToCheck = [
//             { label: 'T9真人icon', selector: '.enter-game-button.bk-live-t9.zh-TW .logo.game-t9-live' },
//             { label: 'T9真人文字', selector: '.enter-game-button.bk-live-t9.zh-TW .label:has-text("T9真人")' },
//             { label: 'PP真人icon', selector: '.enter-game-button.bk-live-pp.zh-TW .logo.game-pp' },
//             { label: 'PP真人文字', selector: '.enter-game-button.bk-live-pp.zh-TW .label:has-text("PP真人")' },
//             { label: 'EVO真人icon', selector: '.enter-game-button.bk-evo.zh-TW .logo.game-evo' },
//             { label: 'EVO真人文字', selector: '.enter-game-button.bk-evo.zh-TW .label:has-text("EVO真人")' },
//             { label: 'DG真人icon', selector: '.enter-game-button.bk-dg.zh-TW .logo.game-dg' },
//             { label: 'DG真人文字', selector: '.enter-game-button.bk-dg.zh-TW .label:has-text("DG真人")' },
//             { label: 'SEXY真人icon', selector: '.enter-game-button.bk-sexy.zh-TW .logo.game-sexy' },
//             { label: 'SEXY真人文字', selector: '.enter-game-button.bk-sexy.zh-TW .label:has-text("SEXY真人")' },
//             { label: 'AFB真人icon', selector: '.enter-game-button.bk-live-afb.zh-TW .logo.game-afb-live' },
//             { label: 'AFB真人文字', selector: '.enter-game-button.bk-live-afb.zh-TW .label:has-text("AFB真人")' },
//             { label: 'WM真人icon', selector: '.enter-game-button.bk-wm.zh-TW .logo.game-wm' },
//             { label: 'WM真人文字', selector: '.enter-game-button.bk-wm.zh-TW .label:has-text("WM真人")' },
//             { label: 'OB真人icon', selector: '.enter-game-button.bk-live-ob.zh-TW .logo.game-ob-live' },
//             { label: 'OB真人文字', selector: '.enter-game-button.bk-live-ob.zh-TW .label:has-text("OB真人")' },
//             { label: 'ASTAR真人icon', selector: '.enter-game-button.bk-live-astar.zh-TW .logo.game-astar-live' },
//             { label: 'ASTAR真人文字', selector: '.enter-game-button.bk-live-astar.zh-TW .label:has-text("ASTAR真人")' },
//             { label: 'WE真人icon', selector: '.enter-game-button.bk-we.zh-TW .logo.game-we' },
//             { label: 'WE真人文字', selector: '.enter-game-button.bk-we.zh-TW .label:has-text("WE真人")' }
//         ];

//         for (const element of venueElementsToCheck) {
//             const elementHandle = page.locator(element.selector);
//             const isVisible = await elementHandle.isVisible();
//             console.log(`${element.label} 是否存在: ${isVisible}`);
//             if (!isVisible) {
//                 missingElements.push(`${element.label} 不存在`);
//             }
//         }

//         // 點擊體育標籤
//         const sportsTab = page.locator('.category-filter .label:has-text("體育")');
//         await sportsTab.click();
//         await page.waitForLoadState('networkidle');

//         // 檢查體育場館icon和label是否存在
//         const sportsVenueElementsToCheck = [
//             { label: 'FB體育icon', selector: '.enter-game-button.bk-fb.zh-TW .logo.game-fb' },
//             { label: 'FB體育文字', selector: '.enter-game-button.bk-fb.zh-TW .label:has-text("FB體育")' },
//             { label: 'GAME ONE體育icon', selector: '.enter-game-button.bk-game-one-sport.zh-TW .logo.game-one' },
//             { label: 'GAME ONE體育文字', selector: '.enter-game-button.bk-game-one-sport.zh-TW .label:has-text("GAME ONE體育")' },
//             { label: 'SBO體育icon', selector: '.enter-game-button.bk-sbo.zh-TW .logo.game-sbo' },
//             { label: 'SBO體育文字', selector: '.enter-game-button.bk-sbo.zh-TW .label:has-text("SBO體育")' },
//             { label: 'WE體育icon', selector: '.enter-game-button.bk-we-sport.zh-TW .logo.game-we-sport' },
//             { label: 'WE體育文字', selector: '.enter-game-button.bk-we-sport.zh-TW .label:has-text("WE體育")' }
//         ];

//         for (const element of sportsVenueElementsToCheck) {
//             const elementHandle = page.locator(element.selector);
//             const isVisible = await elementHandle.isVisible();
//             console.log(`${element.label} 是否存在: ${isVisible}`);
//             if (!isVisible) {
//                 missingElements.push(`${element.label} 不存在`);
//             }
//         }


//         // 點擊專區標籤
//         const zoneTab = page.locator('.category-filter .label:has-text("專區")');
//         await zoneTab.click();
//         await page.waitForLoadState('networkidle');


//         // 檢查專區場館icon和label是否存在
//         const zoneVenueElementsToCheck = [
//             { label: 'GAME ONE體育icon', selector: '.enter-game-button.bk-game-one-sport.zh-TW .logo' },
//             { label: 'GAME ONE體育文字', selector: '.enter-game-button.bk-game-one-sport.zh-TW .label:has-text("GAME ONE體育")' },
//             { label: 'GAME ONE香港麻將館icon', selector: '.enter-game-button.bk-g1-poker.zh-TW .logo' },
//             { label: 'GAME ONE香港麻將館文字', selector: '.enter-game-button.bk-g1-poker.zh-TW .label:has-text("GAME ONE香港麻將館")' },
//             { label: 'GAME ONE電子icon', selector: '.enter-game-button.bk-coming.zh-TW .logo' },
//             { label: 'GAME ONE電子文字', selector: '.enter-game-button.bk-coming.zh-TW .label:has-text("GAME ONE電子")' }
//         ];
//         for (const element of zoneVenueElementsToCheck) {
//             const elementHandle = page.locator(element.selector);
//             const isVisible = await elementHandle.isVisible();
//             console.log(`${element.label} 是否存在: ${isVisible}`);
//             if (!isVisible) {
//                 missingElements.push(`${element.label} 不存在`);
//             }
//         }




//         // 點擊棋牌標籤
//         const chessTab = page.locator('.category-filter .label:has-text("棋牌")');
//         await chessTab.click();
//         await page.waitForLoadState('networkidle');

//         // 檢查棋牌場館icon和label是否存在
//         const chessVenueElementsToCheck = [
//             { label: '開元棋牌icon', selector: '.enter-game-button.bk-ky.zh-TW .logo.game-ky' },
//             { label: '開元棋牌文字', selector: '.enter-game-button.bk-ky.zh-TW .label:has-text("開元棋牌")' },
//             { label: 'VG棋牌icon', selector: '.enter-game-button.bk-vg.zh-TW .logo.game-vg' },
//             { label: 'VG棋牌文字', selector: '.enter-game-button.bk-vg.zh-TW .label:has-text("VG棋牌")' },
//             { label: '樂遊棋牌icon', selector: '.enter-game-button.bk-leg.zh-TW .logo.game-leg' },
//             { label: '樂遊棋牌文字', selector: '.enter-game-button.bk-leg.zh-TW .label:has-text("樂遊棋牌")' },
//             { label: '百勝棋牌icon', selector: '.enter-game-button.bk-baison.zh-TW .logo.game-baison' },
//             { label: '百勝棋牌文字', selector: '.enter-game-button.bk-baison.zh-TW .label:has-text("百勝棋牌")' },
//             { label: 'GAME ONE香港麻將館icon', selector: '.enter-game-button.bk-g1-poker.zh-TW .logo.game-one' },
//             { label: 'GAME ONE香港麻將館文字', selector: '.enter-game-button.bk-g1-poker.zh-TW .label:has-text("GAME ONE香港麻將館")' },
//             { label: '博樂棋牌icon', selector: '.enter-game-button.bk-bole.zh-TW .logo.game-bole' },
//             { label: '博樂棋牌文字', selector: '.enter-game-button.bk-bole.zh-TW .label:has-text("博樂棋牌")' }
//         ];

//         for (const element of chessVenueElementsToCheck) {
//             const elementHandle = page.locator(element.selector);
//             const isVisible = await elementHandle.isVisible();
//             console.log(`${element.label} 是否存在: ${isVisible}`);
//             if (!isVisible) {
//                 missingElements.push(`${element.label} 不存在`);
//             }
//         }

//         // 打印所有检查结果后再判断是否有错误
//         if (missingElements.length > 0) {
//             console.log(`以下元素未找到或不可見: ${missingElements.join(', ')}`);
//         } else {
//             console.log('所有检查项均通过');
//         }

//         expect(missingElements.length, `以下元素未找到或不可見: ${missingElements.join(', ')}`).toBe(0);
//     } catch (error) {
//         console.error('發生錯誤:', error.message);
//         throw error;
//     } finally {
//         await page.close();
//     }
// });