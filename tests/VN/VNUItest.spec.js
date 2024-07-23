const { test, expect } = require('@playwright/test');
const { userRecordKey, userRecordValue } = require('./VNconstants'); // 确保路径正确

test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    globalThis.context = context;
});

test.beforeEach(async () => {
    const page = await globalThis.context.newPage();

    // 注入脚本以设置 localStorage
    await page.addInitScript(({ key, value }) => {
        localStorage.setItem(key, value);
    }, { key: userRecordKey, value: userRecordValue });

    // 导航到目标页面
    await page.goto('https://wap-tn.qit1.net');
    await page.waitForLoadState('networkidle');

    // 关闭页面
    await page.close();
});



test('登入頁檢查', async () => {
    const page = await globalThis.context.newPage();
    // 设置 localStorage 语言为越南语
    await page.addInitScript(() => {
        localStorage.setItem('locale', 'vi-VN');
    });

    await page.goto('http://wap-tn.qit1.net/login');
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

    await page.close();
});

test('註冊頁檢查', async () => {
    const page = await globalThis.context.newPage();
    // 设置 localStorage 语言为越南语
    await page.addInitScript(() => {
        localStorage.setItem('locale', 'vi-VN');
    });

    await page.goto('http://wap-tn.qit1.net/reg');
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

    await page.close();
});




test('檢查 Giới thiệu về RG88', async () => {
    const page = await globalThis.context.newPage();
    // 设置 localStorage 语言为越南语
    await page.addInitScript(() => {
        localStorage.setItem('locale', 'vi-VN');
    });

    // 导航到个人页面
    await page.goto('https://wap-tn.qit1.net/accountCenter');
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

    await page.close();
});



