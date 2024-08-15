const { test, expect, devices } = require('@playwright/test');
const { userRecordKey, userRecordValue } = require('./VNconstants'); // 确保路径正确


test.describe('@WAP VN 測試', () => {
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

        // 注入 token 或其他需要的数据到 localStorage 中
        await page.addInitScript(({ key, value }) => {
            localStorage.setItem(key, value);
        }, { key: userRecordKey, value: userRecordValue });

        // 初始加载一个页面，以确保 token 被注入
        await page.goto('http://wap.jisookorea.com');
        await page.waitForLoadState('networkidle');
    });

    test.beforeEach(async () => {
        // 确保页面未关闭。如果页面关闭了，重新创建页面。
        if (!page || page.isClosed()) {
            page = await context.newPage();
            await page.addInitScript(({ key, value }) => {
                localStorage.setItem(key, value);
            }, { key: userRecordKey, value: userRecordValue });
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




    test('登入頁檢查', async () => {
        // 设置 localStorage 语言为越南语
        await page.addInitScript(() => {
            localStorage.setItem('locale', 'vi-VN');
        });

        await page.goto('http://wap.jisookorea.com/login');
        await page.waitForLoadState('networkidle');

        const elementsToCheck = [
            { selector: 'input[placeholder="6-12 chữ cái tiếng anh và số "]', description: '帳號-12 chữ cái tiếng anh và số ' },
            { selector: 'input[placeholder="Xin vui lòng nhập mật khẩu"]', description: '請輸入密碼Xin vui lòng nhập mật khẩu' },
            { selector: 'label:has-text("Tự động đăng nhập")', description: '記住密碼Tự động đăng nhập' },
            { selector: 'label.guestEle a:has-text("CSKH")', description: '忘記密碼CSKH' },
            { selector: 'div.login:has-text("Đăng nhập")', description: '登入Đăng nhập' },
            { selector: 'div.signup a:has-text("Đăng ký")', description: '註冊Đăng ký' },
            { selector: 'div.goRoundFirst:has-text("Quay lại")', description: '先去逛逛Quay lại' },
            { selector: 'svg.iconeye.am-icon.am-icon-eye.am-icon-md', description: '隱碼圖標' },
            { selector: 'div.backHome', description: '首頁按鈕backHome' },
            { selector: 'div.logo', description: 'logo' },
            { selector: 'div.subTitle', description: 'CREATE ACCOUNT' }
        ];

        const missingElements = [];
        for (const element of elementsToCheck) {
            const isVisible = await page.locator(element.selector).isVisible();
            console.log(`${element.description} 是否存在: ${isVisible}`);
            if (!isVisible) {
                missingElements.push(element.description);
            }
        }

        // 打印所有检查结果后再判断是否有错误
        if (missingElements.length > 0) {
            console.log(`以下元素未找到或大小不符: ${missingElements.join(', ')}`);
            expect(missingElements.length, `以下元素未找到或大小不符: ${missingElements.join(', ')}`).toBe(0);
        }

    });

    test('註冊頁檢查', async () => {
        // 设置 localStorage 语言为越南语
        await page.addInitScript(() => {
            localStorage.setItem('locale', 'vi-VN');
        });

        await page.goto('http://wap.jisookorea.com/reg');
        await page.waitForLoadState('networkidle');

        const elementsToCheck = [
            { selector: 'label:has-text("Tài khoản")', description: '帳號' },
            { selector: 'input[placeholder="6-12 chữ tiếng anh và số "]', description: '6-12個英文單字和數字' },
            { selector: 'label:has-text("Mật khẩu"):not(:has-text("Xác nhận lại mật khẩu"))', description: '密碼' },
            { selector: 'input[placeholder="mật khẩu của Quý khách"]', description: '你的密碼' },
            { selector: 'label:has-text("Xác nhận lại mật khẩu")', description: '確認密碼' },
            { selector: 'input[placeholder="Phải có từ 6-16 ký tự"]', description: '必須為 6-16 個字符' },
            { selector: 'div.submitBtn:has-text("Đăng ký")', description: '註冊' },
            { selector: 'div.has-account:has-text("Đã có tài khoản RG88 ⮕")', description: '已有RG88帳戶' }
        ];

        const missingElements = [];
        for (const element of elementsToCheck) {
            const isVisible = await page.locator(element.selector).isVisible();
            console.log(`${element.description} 是否存在: ${isVisible}`);
            if (!isVisible) {
                missingElements.push(element.description);
            }
        }

        // 打印所有检查结果后再判断是否有错误
        if (missingElements.length > 0) {
            console.log(`以下元素未找到或不符: ${missingElements.join(', ')}`);
            expect(missingElements.length, `以下元素未找到或不符: ${missingElements.join(', ')}`).toBe(0);
        }

    });




    test('檢查 Giới thiệu về RG88', async () => {
        // 设置 localStorage 语言为越南语
        await page.addInitScript(() => {
            localStorage.setItem('locale', 'vi-VN');
        });

        // 导航到个人页面
        await page.goto('http://wap.jisookorea.com/accountCenter');
        await page.waitForLoadState('networkidle');

        const missingElements = [];

        // 檢查 .icon.icon-alert.logo 並檢查大小
        const logo = await page.locator('.icon.icon-alert.logo').first();
        const logoVisible = await logo.isVisible();
        console.log(`RG88 icon 是否存在: ${logoVisible}`);
        if (logoVisible) {
            const logoSize = await logo.evaluate(element => {
                return {
                    width: element.offsetWidth,
                    height: element.offsetHeight
                };
            });
            console.log(`RG88 icon大小: ${logoSize.width}x${logoSize.height}`);
            const expectedWidth = 20;
            const expectedHeight = 20;
            if (logoSize.width !== expectedWidth || logoSize.height !== expectedHeight) {
                missingElements.push(`icon 大小不符 (期望: ${expectedWidth}x${expectedHeight}, 實際: ${logoSize.width}x${logoSize.height})`);
            }
        } else {
            missingElements.push('icon');
        }


        //檢查並點擊“Giới thiệu về RG88”按鈕
        const aboutButton = await page.locator('.menu-item .main-label div:has-text("Giới thiệu về RG88")').first();
        const aboutButtonVisible = await aboutButton.isVisible();
        console.log(`Giới thiệu về RG88按鈕是否存在: ${aboutButtonVisible}`);
        if (!aboutButtonVisible) {
            missingElements.push('Giới thiệu về RG88');
        } else {
            await aboutButton.click();
        }

        // 檢查彈窗中的所有文案和圖片大小
        await page.waitForSelector('.about-container', { state: 'visible' });

        const textsToCheck = [
            { text: 'Cá cược có trách nhiệm', tag: 'div.about-heading' },
            'RG88 cam kết đảm bảo các hoạt động cá cược đáng tin cậy. Công ty chúng tôi tuân thủ các quy định và hướng dẫn hiện hành từ các cơ quan quản lý trò chơi từ xa và cố gắng trở thành nhà điều hành trò chơi từ xa có trách nhiệm với xã hội. Cá cược từ xa là trải nghiệm giải trí hợp pháp cho hàng triệu người chơi trên khắp thế giới. Đối với hầu hết người chơi, cờ bạc từ xa là một trải nghiệm thú vị. Tuy nhiên, chúng tôi cũng chấp nhận thực tế là một số ít người chơi cờ bạc từ xa có thể chưa đủ độ tuổi hợp pháp hoặc bị suy giảm sức khỏe liên quan đến cờ bạc. Vấn đề với cuộc sống hoặc tình hình tài chính của họ. Trở thành một công ty có trách nhiệm với xã hội có nghĩa là chú ý đến người chơi của chúng tôi và điều đó có nghĩa là thực hiện cách tiếp cận chủ động đối với các vấn đề có thể có tác động đến xã hội. Đó là lý do tại sao RG88 đã áp dụng và hoàn toàn cam kết thực thi các quy trình và hạn chế nghiêm ngặt nhất dưới đây.',
            'Chính sách thực thi',
            'Hạn chế truy cập cho trẻ vị thành niên',
            'Chúng tôi hứa sẽ cố gắng hết sức và cần sự giúp đỡ của Quý khách để thực hiện những việc sau',
            '1. Sử dụng phần mềm bảo vệ trẻ em để chặn các trang web cờ bạc từ xa khỏi máy tính mà trẻ vị thành niên có thể sử dụng.',
            '2. Đừng để máy tính của Quý khách không được giám sát khi đăng nhập vào một trang web chơi game từ xa.',
            '3. Không chia sẻ thông tin thẻ tín dụng hoặc tài khoản ngân hàng của Quý khách với trẻ vị thành niên.',
            '4. Không bật tùy chọn "Lưu mật khẩu" trên trang đăng nhập Real Sports.',
            '5. Tạo file đăng nhập riêng cho trẻ vị thành niên trên máy tính để chúng không thể truy cập được thông tin của Quý khách khi đăng nhập.',
            '6. Nếu Quý khách biết bất kỳ ai dưới 18 tuổi (hoặc dưới độ tuổi hợp pháp trong khu vực pháp lý của họ) đã đăng ký nhầm làm người chơi với chúng tôi, vui lòng thông báo cho chúng tôi ngay lập tức.',
            'Trình độ hoạt động',
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
            { selector: 'img[src="/res/images/com-tk/about-footer-1.png"]', description: 'icon_1', expectedWidth: 391, expectedHeight: 50 },
            { selector: 'img[src="/res/images/com-tk/about-footer-2.png"]', description: 'icon_2', expectedWidth: 181, expectedHeight: 48 }
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



    test('遊戲icon', async () => {
        // 設置 localStorage 語言為越南語
        await page.addInitScript(() => {
            localStorage.setItem('locale', 'vi-VN');
        });

        // 打開目標頁面
        await page.goto('http://wap.jisookorea.com/hall');
        await page.waitForLoadState('networkidle');

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

        // 點擊 ag-slot
        await page.locator('.game.ag-slot').click();
        await page.waitForTimeout(5000); // 等待頁面加載完成

        const gameIcons = [
            { name: 'Lucha Heroes', selector: 'img[alt="Lucha Heroes"]', filePath: 'https://wap-tn.qit1.net/photo/AG_icon/WH49_en.png' },
            { name: 'Ultra Shift', selector: 'img[alt="Ultra Shift"]', filePath: 'https://wap-tn.qit1.net/photo/AG_icon/WH54_en.png' },
        ];

        const results = [];
        const errors = [];

        for (const game of gameIcons) {
            let iconExists = false;
            let renderedSize = { width: 0, height: 0 };
            let intrinsicSize = { width: 0, height: 0 };
            let fileSize = NaN;
            let statusCode = 200;

            // 檢測圖片元素
            const gameIcon = page.locator(game.selector);
            iconExists = await gameIcon.count() > 0;

            if (iconExists) {
                const sizes = await gameIcon.evaluate(el => {
                    const renderedWidth = el.clientWidth;
                    const renderedHeight = el.clientHeight;
                    const intrinsicWidth = el.naturalWidth;
                    const intrinsicHeight = el.naturalHeight;
                    return {
                        renderedWidth,
                        renderedHeight,
                        intrinsicWidth,
                        intrinsicHeight,
                        aspectRatio: renderedWidth / renderedHeight,
                        intrinsicAspectRatio: intrinsicWidth / intrinsicHeight
                    };
                });

                renderedSize = { width: sizes.renderedWidth, height: sizes.renderedHeight };
                intrinsicSize = { width: sizes.intrinsicWidth, height: sizes.intrinsicHeight };
            }

            // 获取文件大小和状态码
            try {
                const response = await page.request.get(game.filePath);
                statusCode = response.status();
                if (statusCode === 200) {
                    const buffer = await response.body();
                    fileSize = buffer.byteLength;
                }
            } catch (error) {
                statusCode = '無狀態碼';
            }

            results.push({
                game: game.name,
                exists: iconExists,
                renderedWidth: renderedSize.width,
                renderedHeight: renderedSize.height,
                intrinsicWidth: intrinsicSize.width,
                intrinsicHeight: intrinsicSize.height,
                renderedAspectRatio: renderedSize.width / renderedSize.height,
                intrinsicAspectRatio: intrinsicSize.width / intrinsicSize.height,
                fileSize,
                statusCode
            });

            if (!/^2/.test(statusCode)) {
                errors.push(`${game.name} 文件加载失败，状态码: ${statusCode}`);
            }
        }

        results.forEach(result => {
            console.log(`${result.game} 圖片存在: ${result.exists}`);
            if (result.exists) {
                console.log(`${result.game} 圖片大小: 寬度=${result.renderedWidth}px, 高度=${result.renderedHeight}px`);
                console.log(`${result.game} 圖片內在大小: 寬度=${result.intrinsicWidth}px, 高度=${result.intrinsicHeight}px`);
                console.log(`${result.game} 圖片渲染的寬高比: ${result.renderedAspectRatio}`);
                console.log(`${result.game} 圖片內在的寬高比: ${result.intrinsicAspectRatio}`);
                console.log(`${result.game} 圖片文件大小: ${isNaN(result.fileSize) ? 'NaN' : `${result.fileSize} bytes`}`);
                console.log(`${result.game} 圖片文件狀態碼: ${result.statusCode}`);
            }
        });

        // 打印所有错误
        if (errors.length > 0) {
            console.error('以下是检测到的错误:');
            errors.forEach(error => {
                console.error(error);
                const gameName = error.split(' ')[0];
                const result = results.find(r => r.game === gameName);
                if (result) {
                    console.error(`${result.game} 圖片文件大小: ${isNaN(result.fileSize) ? 'NaN' : `${result.fileSize} bytes`}`);
                }
            });
        }

        expect(errors.length).toBe(0); // 確保沒有錯誤

    });



    //     test.describe('遊戲場館測試', () => {
    //         test.beforeAll(async ({ browser }) => {
    //             globalThis.context = await browser.newContext({
    //                 ...devices['iPhone 11'],
    //             });
    //         });

    //         test('rich88', async () => {
    //             // 设置测试超时
    //             test.setTimeout(600000);

    //             const page = await globalThis.context.newPage();

    //             // 设置 localStorage 语言为越南语
    //             await page.addInitScript(() => {
    //                 localStorage.setItem('locale', 'vi-VN');
    //             });

    //             await page.goto('http://wap.jisookorea.com');
    //             await page.waitForLoadState('networkidle');

    //             // 检查并关闭弹窗
    //             let closeButtonVisible = true;
    //             while (closeButtonVisible) {
    //                 const closeButton = page.locator('svg path[fill="#999"]').first();
    //                 closeButtonVisible = await closeButton.isVisible();
    //                 if (closeButtonVisible) {
    //                     await closeButton.click();
    //                     console.log('關閉广告');
    //                     await page.waitForTimeout(1000);
    //                 }
    //             }

    //             // 點擊游戏类别
    //             const richSlotCategory = page.locator('div.game-category div.game.rich-slot');
    //             await richSlotCategory.click();
    //             console.log('已點擊 rich-slot 類別');

    //             await page.waitForLoadState('networkidle');

    //             const errors = [];

    //             // 封装游戏点击和 API 检查的函数
    //             async function checkGameItem(index) {
    //                 try {
    //                     // 定位并点击游戏项目
    //                     const gameItem = page.locator('.game_item').nth(index);
    //                     await gameItem.click();
    //                     console.log(`已点击第 ${index + 1} 个游戏项目`);

    //                     // 等待并拦截 API 请求
    //                     try {
    //                         const response = await page.waitForResponse(response => response.url().includes('https://lobbycenter.ark8899.com/v1/player/game/login'), { timeout: 12000 });
    //                         const statusCode = response.status();
    //                         console.log(`第 ${index + 1} 個遊戲項目 API 狀態碼: ${statusCode}`);
    //                         if (statusCode !== 200) {
    //                             errors.push(`第 ${index + 1} 遊戲項目的 API 狀態碼: ${statusCode}`);
    //                         }
    //                     } catch (error) {
    //                         console.log(`第 ${index + 1} 個遊戲項目 API 無返回狀態碼`);
    //                         errors.push(`第 ${index + 1} 個遊戲項目 API 無返回狀態碼`);
    //                     }

    //                     // 返回上一页
    //                     try {
    //                         await page.goBack();
    //                         await page.waitForTimeout(5000); // 等待 5 秒再点击下一款游戏
    //                     } catch (error) {
    //                         console.log(`第 ${index + 1} 个游戏项目返回上一页失败`);
    //                         errors.push(`第 ${index + 1} 个游戏项目返回上一页失败`);
    //                     }
    //                 } catch (error) {
    //                     console.log(`第 ${index + 1} 个游戏项目处理失败`);
    //                     errors.push(`第 ${index + 1} 个游戏项目处理失败`);
    //                 }
    //             }

    //             // 检查108个游戏项目
    //             for (let i = 0; i < 92; i++) {
    //                 await checkGameItem(i);
    //             }

    //             // 打印所有错误
    //             if (errors.length > 0) {
    //                 console.error('以下是檢測到的錯誤:');
    //                 errors.forEach(error => console.error(error));
    //             }

    //             expect(errors.length).toBe(0); // 确保没有错误

    //             await page.close();
    //         });
    //     });
});