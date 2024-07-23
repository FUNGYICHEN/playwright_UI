const { chromium } = require('playwright');
const fs = require('fs-extra');
const tesseract = require('tesseract.js');
const path = require('path');
const Jimp = require('jimp');  // 引入 Jimp 用于图像处理
const axios = require('axios');

async function processCaptcha(captchaPath, processedImagePath) {
    const image = await Jimp.read(captchaPath);
    image
        .resize(2 * image.bitmap.width, 2 * image.bitmap.height) // 放大图像
        .greyscale() // 转换为灰度图像
        .invert() // 反转颜色，使其变成白底黑字
        .contrast(1) // 增加对比度
        .normalize() // 正规化图像
        .blur(1) // 平滑处理
        .posterize(2) // 降低色深以减少噪声
        .threshold({ max: 128 }) // 二值化处理
        .write(processedImagePath); // 保存预处理后的图像
}

async function recognizeCaptcha(processedImagePath) {
    const { data: { text } } = await tesseract.recognize(processedImagePath, 'eng', {
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', // 白名单字符
        tessedit_pageseg_mode: tesseract.PSM.SINGLE_BLOCK, // 设置页面分割模式
        logger: () => { },
    });
    return text.trim();
}

async function loginToBackend() {
    const imageDir = path.join('C:\\Users\\luekc\\Desktop\\playwright_UI-master\\tests\\Q6\\codepng');
    await fs.ensureDir(imageDir);

    const browser = await chromium.launch({ headless: false }); // 使用非无头模式
    const page = await browser.newPage();

    let token = null;
    let loginResponse = null;
    const maxRetries = 20; // 最大重试次数

    try {
        await page.goto('https://oms-q6-npf2.qit1.net/login');

        // 填写用户名和密码
        await page.fill('input[name="username"]', 'qatest0001');
        await page.fill('input[name="password"]', '396012');

        // 监听网络请求
        page.on('response', async response => {
            const url = response.url();
            if (url.includes('/manage/backend/login')) {
                try {
                    const jsonResponse = await response.json();
                    loginResponse = jsonResponse;
                } catch (e) {
                    console.log('无法解析响应:', e);
                }
            }
        });

        let retries = 0;

        while (retries < maxRetries) {
            retries++;
            // 等待验证码图像出现
            const captchaSelector = 'img.validate-image';
            await page.waitForSelector(captchaSelector);

            // 截图验证码图像
            const captchaElement = await page.$(captchaSelector);
            const captchaBuffer = await captchaElement.screenshot();

            // 将图像保存到本地文件
            const captchaPath = path.join(imageDir, 'captcha.png');
            await fs.writeFile(captchaPath, captchaBuffer);

            // 显示捕获的验证码图像路径
            console.log(`Captcha image saved at: ${captchaPath}`);

            // 图像预处理
            const processedImagePath = path.join(imageDir, 'captcha_processed.png');
            await processCaptcha(captchaPath, processedImagePath);

            // 检查处理后的图像
            console.log(`Processed captcha image saved at: ${processedImagePath}`);

            // 使用 Tesseract.js 提取图像中的文本
            let captchaText = await recognizeCaptcha(processedImagePath);
            console.log('提取的验证码文本:', captchaText);

            // 检查提取的验证码文本是否为空或不符合要求
            if (!captchaText || !/^\d{4}$/.test(captchaText)) {
                console.log('提取的验证码文本无效，重试...');
                // 点击验证码图像刷新验证码
                await captchaElement.click();
                await page.waitForTimeout(2000); // 等待验证码刷新
                continue;
            }

            // 填写验证码
            await page.fill('input[name="validateCode"]', captchaText);

            // 确保验证码已输入后再点击登录按钮
            await page.waitForTimeout(1000);

            // 点击登录按钮
            await page.click('button.btn-login'); // 通过类名选择登录按钮

            // 等待页面加载完成
            await page.waitForTimeout(2000);

            // 检查是否存在验证码错误提示
            const errorMessage1 = await page.$('p.el-message__content');
            const errorMessage2 = await page.$('div.el-form-item__error');

            if (errorMessage1) {
                const errorText1 = await errorMessage1.textContent();
                if (errorText1.includes('驗證失敗，請重新輸入')) {
                    console.log('验证码错误，重试...');
                    // 清空输入的验证码栏位
                    await page.fill('input[name="validateCode"]', '');
                    // 点击验证码图像刷新验证码
                    await captchaElement.click();
                    await page.waitForTimeout(2000); // 等待验证码刷新
                    continue;
                }
            }

            if (errorMessage2) {
                const errorText2 = await errorMessage2.textContent();
                if (errorText2.includes('請輸入4位數驗證碼')) {
                    console.log('验证码错误，重试...');
                    // 清空输入的验证码栏位
                    await page.fill('input[name="validateCode"]', '');
                    // 点击验证码图像刷新验证码
                    await captchaElement.click();
                    await page.waitForTimeout(2000); // 等待验证码刷新
                    continue;
                }
            }

            // 验证码正确，尝试登录后台
            console.log('验证码正确，尝试登录后台');

            // 等待捕获登录响应
            await page.waitForTimeout(2000);

            if (loginResponse) {
                if (loginResponse.code === '0000') {
                    console.log('成功登录后台');
                    token = loginResponse.result.token;
                    break;
                } else {
                    console.log('登录后台失败');
                    break;
                }
            } else {
                console.log('未捕获到登录响应，重试...');
            }
        }

        if (retries === maxRetries) {
            console.log('验证码尝试次数已达最大限制，登录失败');
        }

    } catch (error) {
        console.error('Error:', error.message);
        return null;
    } finally {
        await browser.close();
        console.log('流程完成，浏览器关闭');
    }

    return token;
}

async function fetchVerificationCode(phoneNumber) {
    const token = await loginToBackend();
    if (!token) {
        console.error('无法登录后台并获取token');
        return null;
    }

    const url = "http://oms-q6-npf2.qit1.net/manage/backend/func/otp/queryCode";
    const headers = {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept': '*/*',
        'Authorization': `Bearer ${token}`
    };
    const payload = {
        "phoneNumber": phoneNumber, // 使用传入的手机号码
        "token": token // 使用从登录获取的token
    };

    for (let i = 0; i < 10; i++) {
        try {
            const response = await axios.post(url, payload, { headers });
            const data = response.data;
            if (data.result && data.result.data && data.result.data.length > 0) {
                const match = data.result.data[0]; // 取第一个匹配项
                return match.code;
            } else {
                console.log("No verification code received, retrying...");
                await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒后重试
            }
        } catch (error) {
            if (error.response) {
                console.error(`HTTP error occurred: ${error.response.status} - ${error.response.statusText}`);
            } else {
                console.error(`An error occurred: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒后重试
        }
    }

    console.log('简讯验证码尝试次数已达最大限制，获取失败');
    return null;
}

// 单独运行代码进行测试
if (require.main === module) {
    (async () => {
        const phoneNumber = "61705663"; // 替换为实际需要查询的手机号码
        const code = await fetchVerificationCode(phoneNumber);
        console.log(`获取到的验证码: ${code}`);
    })();
}

module.exports = { fetchVerificationCode };