const { test, expect, devices } = require('@playwright/test');
const { userRecordKey, userRecordValue } = require('./Q0constants');
const { randomHongKongPhoneNumber, randomUsername } = require('./phoneNumbers');
const { fetchVerificationCode } = require('./Q0phonecode'); // 引入验证码获取函数

test.describe('@WAP Q0 測試', () => {
    test.beforeAll(async ({ browser }) => {
        globalThis.context = await browser.newContext({
            ...devices['iPhone 11'],
        });
    });

    test.beforeEach(async () => {
        const page = await globalThis.context.newPage();

        await page.addInitScript(({ key, value }) => {
            localStorage.setItem(key, value);
        }, { key: userRecordKey, value: userRecordValue });

        await page.goto('https://wap-q0.qbpink01.com');
        await page.waitForLoadState('networkidle');

        await page.close();
    });




    test('註冊正確流程檢查', async () => {
        const page = await globalThis.context.newPage();
        const errors = [];

        await page.goto('https://wap-q0.qbpink01.com/reg');
        await page.waitForLoadState('networkidle');

        // 生成随机用户名，固定密码
        const username = randomUsername();
        const password = '396012';

        // 填写表单
        const usernameInput = page.locator('input[placeholder="請輸入帳號"]');
        await usernameInput.fill(username);

        const phoneInput = page.locator('input[placeholder="請輸入手機號"]');
        const phoneInputHK = randomHongKongPhoneNumber();
        console.log(`生成的隨機手機號: ${phoneInputHK}`);
        await phoneInput.fill(phoneInputHK);

        const sendCodeButton = page.locator('div.opt-btn#validate');
        await sendCodeButton.click();

        // 等待验证码发送请求完成
        await page.waitForTimeout(5000);

        // 获取验证码
        const otpCode = await fetchVerificationCode(phoneInputHK.slice(-8)); // 传入生成的手机号码
        console.log(`獲取到的簡訊驗證碼: ${otpCode}`);
        if (!otpCode) {
            errors.push('無法獲取驗證碼');
        } else {
            const otpInput = page.locator('input[placeholder="請輸入手機驗證碼"]');
            await otpInput.fill(otpCode);
        }

        const passwordInput = page.locator('input[placeholder="請輸入登入密碼"]');
        await passwordInput.fill(password);


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



    test('註冊錯誤流程檢查', async () => {
        const page = await globalThis.context.newPage();
        const errors = [];

        await page.goto('https://wap-q0.qbpink01.com/reg');
        await page.waitForLoadState('networkidle');

        // 1-1 只輸入英文或數字
        const usernameInput = page.locator('input[placeholder="請輸入帳號"]');
        const usernameMessage = page.locator('.message[style*="display: block"]');
        const usernameIcon = page.locator('svg.icon-canname.am-icon-exclamation-circle[style*="display: block"]');

        // 只輸入英文
        await usernameInput.fill('wefkrurtty');
        await usernameInput.press('Tab');
        await page.waitForSelector('.message[style*="display: block"]', { timeout: 5000 });
        await page.waitForSelector('svg.icon-canname.am-icon-exclamation-circle[style*="display: block"]', { timeout: 5000 });
        if (!await usernameMessage.isVisible() || !await usernameIcon.isVisible()) {
            errors.push('只輸入英文: 未顯示 "請輸入6-12個英文字母和數字" 提示或圖標');
        } else {
            console.log('只輸入英文: 顯示 "請輸入6-12個英文字母和數字" 提示和圖標');
        }
        await usernameInput.fill('');

        // 只輸入數字
        await usernameInput.fill('76576586');
        await usernameInput.press('Tab');
        await page.waitForSelector('.message[style*="display: block"]', { timeout: 5000 });
        await page.waitForSelector('svg.icon-canname.am-icon-exclamation-circle[style*="display: block"]', { timeout: 5000 });
        if (!await usernameMessage.isVisible() || !await usernameIcon.isVisible()) {
            errors.push('只輸入數字: 未顯示 "請輸入6-12個英文字母和數字" 提示或圖標');
        } else {
            console.log('只輸入數字: 顯示 "請輸入6-12個英文字母和數字" 提示和圖標');
        }
        await usernameInput.fill('');

        // 點擊發送驗證碼按鈕
        const sendCodeButton = page.locator('div.opt-btn#validate');
        await sendCodeButton.click();

        // 檢查是否出現 "請輸入手機號碼" 提示
        const phoneErrorMessage = page.locator('.am-toast-notice-content .am-toast-text div:has-text("請輸入手機號")');
        await page.waitForSelector('.am-toast-notice-content .am-toast-text div:has-text("請輸入手機號")', { timeout: 5000 });
        if (!await phoneErrorMessage.isVisible()) {
            errors.push('點擊發送驗證碼: 未顯示 "請輸入手機號碼" 提示');
        } else {
            console.log('點擊發送驗證碼: 顯示 "請輸入手機號碼" 提示');
        }

        // 1-3 輸入錯誤的手機號碼並點擊發送驗證碼
        const phoneInput = page.locator('input[placeholder="請輸入手機號"]');
        await phoneInput.fill('284758394857666');
        await sendCodeButton.click();
        const wrongPhoneErrorMessage = page.locator('.am-toast-notice-content .am-toast-text div:has-text("請輸入正確的手機號碼")');
        await page.waitForSelector('.am-toast-notice-content .am-toast-text div:has-text("請輸入正確的手機號碼")', { timeout: 5000 });
        if (!await wrongPhoneErrorMessage.isVisible()) {
            errors.push('輸入錯誤的手機號碼: 未顯示 "請輸入正確的手機號碼" 提示');
        } else {
            console.log('輸入錯誤的手機號碼: 顯示 "請輸入正確的手機號碼" 提示');
        }
        await phoneInput.fill('');

        // 2-1 輸入錯誤的驗證碼
        console.log('檢查錯誤驗證碼的提示');
        const username = randomUsername();
        await usernameInput.fill(username);
        const phoneInputHK = randomHongKongPhoneNumber();
        await phoneInput.fill(phoneInputHK);
        await sendCodeButton.click();
        const otpInput = page.locator('input[placeholder="請輸入手機驗證碼"]');
        await otpInput.fill('1111');
        const passwordInput = page.locator('input[placeholder="請輸入登入密碼"]');
        await passwordInput.fill('123456');

        const registerButton = page.locator('div.submitBtn');
        await registerButton.click();

        // 等待“加载中”提示消失或“OTP驗証碼錯誤”提示出現
        try {
            await page.waitForSelector('.am-toast-text-info:has-text("載入中")', { state: 'hidden', timeout: 10000 });
        } catch (e) {
            // 如果没有加载中提示，继续检查错误提示
        }
        await page.waitForSelector('.am-toast-text-info:has-text("OTP驗証碼錯誤")', { timeout: 5000 });
        const otpErrorMessage = page.locator('.am-toast-text-info:has-text("OTP驗証碼錯誤")');
        if (!await otpErrorMessage.isVisible()) {
            errors.push('輸入錯誤的驗證碼: 未顯示 "OTP驗証碼錯誤" 提示');
        } else {
            console.log('輸入錯誤的驗證碼: 顯示 "OTP驗証碼錯誤" 提示');
        }

        // 2-3 輸入短密碼
        console.log('檢查短密碼提示');
        await usernameInput.fill(username);
        await phoneInput.fill(phoneInputHK);
        await otpInput.fill('1234'); // 使用随便一个验证码
        await passwordInput.fill('12345');
        await registerButton.click();
        await page.waitForSelector('.am-toast-text:has-text("密碼長度不能小於6位")', { timeout: 5000 });
        const shortPasswordMessage = page.locator('.am-toast-text:has-text("密碼長度不能小於6位")');
        if (!await shortPasswordMessage.isVisible()) {
            errors.push('輸入短密碼: 未顯示 "密碼長度不能小於6位" 提示');
        } else {
            console.log('輸入短密碼: 顯示 "密碼長度不能小於6位" 提示');
        }

        // 2-4 輸入長密碼
        console.log('檢查長密碼提示');
        await usernameInput.fill(username);
        await phoneInput.fill(phoneInputHK);
        await otpInput.fill('1234'); // 使用随便一个验证码
        await passwordInput.fill('12345678999999999');
        await registerButton.click();
        await page.waitForSelector('.am-toast-text:has-text("密碼長度不能超過16位")', { timeout: 5000 });
        const longPasswordMessage = page.locator('.am-toast-text:has-text("密碼長度不能超過16位")');
        if (!await longPasswordMessage.isVisible()) {
            errors.push('輸入長密碼: 未顯示 "密碼長度不能超過16位" 提示');
        } else {
            console.log('輸入長密碼: 顯示 "密碼長度不能超過16位" 提示');
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









    test('檢查關於Q0', async () => {
        const page = await globalThis.context.newPage();

        // 导航到个人页面
        await page.goto('https://wap-q0.qbpink01.com/accountCenter');
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
        await page.goto('https://wap-q0.qbpink01.com/accountCenter');
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





    test('Q0首頁檢查', async () => {
        const page = await globalThis.context.newPage();
        // 打開目標頁面
        await page.goto('https://wap-q0.qbpink01.com/');


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

        // 確認彈窗是否存在
        const banner = page.locator('.smartbanner.zh-TW');
        await expect(banner).toBeVisible();
        console.log('確認彈窗存在');

        // 檢查彈窗大小
        const bannerBoundingBox = await banner.boundingBox();
        console.log(`彈窗大小: ${JSON.stringify(bannerBoundingBox)}`);

        // 確認彈窗內文案
        const bannerTitle = banner.locator('.smartbanner-title');
        const bannerDescription = banner.locator('.smartbanner-description');
        await expect(bannerTitle).toHaveText('Q0 APP');
        console.log('確認彈窗標題正確');
        await expect(bannerDescription).toHaveText('真人娛樂、體育投注、電子遊藝等盡在一手掌握');
        console.log('確認彈窗描述正確');

        // 確認logo圖標是否存在並且正確
        const logo = banner.locator('.smartbanner-icon img');
        await expect(logo).toHaveAttribute('src', 'res/images/com-q0/q0-icon2.png?v=001');
        console.log('確認logo圖標存在且正確');

        // 確認下面這些icon標籤文案是否存在，並比對background圖片URL
        const gameCategories = [
            { icon: '.icon-sport', label: '體育', expectedUrl: 'https://wap-q0.qbpink01.com/res/images/com-q1/gameCategory/icon-sport-ball.png' },
            { icon: '.icon-eGame', label: '電子', expectedUrl: 'https://wap-q0.qbpink01.com/res/images/com-q1/gameCategory/icon-slot-machine.png' },
            { icon: '.icon-chess', label: '棋牌', expectedUrl: 'https://wap-q0.qbpink01.com/res/images/com-q1/gameCategory/icon-poker-cards.png' },
            { icon: '.icon-eSport', label: '電競', expectedUrl: 'https://wap-q0.qbpink01.com/res/images/com-q1/gameCategory/icon-esport.png' },
            { icon: '.icon-fish', label: '捕魚', expectedUrl: 'https://wap-q0.qbpink01.com/res/images/com-q1/gameCategory/icon-fish.png' },
            { icon: '.icon-animal-planet', label: '實況', expectedUrl: 'https://wap-q0.qbpink01.com/res/images/com-q1/gameCategory/icon-live.png' }
        ];

        for (const category of gameCategories) {
            const icon = page.locator(`${category.icon}`);
            const label = icon.locator('..').locator('.label');
            await expect(icon).toBeVisible();
            console.log(`確認${category.label}圖標存在`);
            await expect(label).toHaveText(category.label);
            console.log(`確認${category.label}標籤文案正確`);

            // 抓取background圖片URL並比對
            const backgroundImage = await icon.evaluate(el => window.getComputedStyle(el).backgroundImage);
            const imageUrl = backgroundImage.slice(5, -2); // 提取URL
            await expect(imageUrl).toBe(category.expectedUrl);
            console.log(`抓取${category.label}圖標圖片URL: ${imageUrl}`);
        }

        // 確認新的按鈕圖標和文案是否存在，並抓取background圖片URL
        const accountButtons = [
            { icon: '.icon-rebate', label: 'VIP', expectedUrl: 'https://wap-q0.qbpink01.com/res/images/com-q1/account-functions/icon-money-bag.png' },
            { icon: '.icon-deposit', label: '存款', expectedUrl: 'https://wap-q0.qbpink01.com/res/images/com-q1/account-functions/icon-piggy-bank.png' },
            { icon: '.icon-withdraw', label: '提款', expectedUrl: 'https://wap-q0.qbpink01.com/res/images/com-q1/account-functions/icon-dollar.png' }
        ];

        for (const button of accountButtons) {
            const icon = page.locator(`${button.icon}`);
            const label = icon.locator('..').locator('.label');
            await expect(icon).toBeVisible();
            console.log(`確認${button.label}圖標存在`);
            await expect(label).toHaveText(button.label);
            console.log(`確認${button.label}標籤文案正確`);

            // 抓取background圖片URL並比對
            const backgroundImage = await icon.evaluate(el => window.getComputedStyle(el).backgroundImage);
            const imageUrl = backgroundImage.slice(5, -2); // 提取URL
            await expect(imageUrl).toBe(button.expectedUrl);
            console.log(`抓取${button.label}圖標圖片URL: ${imageUrl}`);
        }

        // 確認banner框架是否存在
        const bannerFrame = page.locator('#sliderBannerBox');
        await expect(bannerFrame).toBeVisible();
        console.log('確認banner框架存在');
    });
});