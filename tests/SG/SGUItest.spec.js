const { test, expect, devices } = require('@playwright/test');
const { userRecordKey, userRecordValue } = require('./SGconstants');
// const { randomHongKongPhoneNumber, randomUsername } = require('./phoneNumbers');
// const { fetchVerificationCode } = require('./Q6phonecode'); // 引入验证码获取函数

test.describe('@WAP SG 測試', () => {

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext({
            ...devices['iPhone 11']
        });
        globalThis.context = context;
    });

    test.beforeEach(async () => {
        const page = await globalThis.context.newPage();

        await page.addInitScript(({ key, value }) => {
            localStorage.setItem(key, value);
        }, { key: userRecordKey, value: userRecordValue });

        await page.goto('https://wap-sg.qbpink01.com');
        await page.waitForLoadState('networkidle');

        await page.close();
    });



    test('檢查 关於 Betone', async () => {
        const page = await globalThis.context.newPage();
        // 设置 localStorage 语言为中文
        await page.addInitScript(() => {
            localStorage.setItem('locale', 'zh-CN');
        });

        // 导航到个人页面
        await page.goto('https://wap-sg.qbpink01.com/accountCenter');
        await page.waitForLoadState('networkidle');

        const missingElements = [];

        // 檢查 logo.png 是否存在
        const logo = await page.locator('img[src="/logo_fc1a76f3b42b518866602813348c493b.png"]').first();
        const logoVisible = await logo.isVisible();
        console.log(`logo.png 是否存在: ${logoVisible}`);
        if (!logoVisible) {
            missingElements.push('logo.png');
        }

        //檢查並點擊“关於 Betone”按鈕
        const aboutButton = await page.locator('span:has-text("关於 Betone")').first();
        const aboutButtonVisible = await aboutButton.isVisible();
        console.log(`关於 Betone 按鈕是否存在: ${aboutButtonVisible}`);
        if (!aboutButtonVisible) {
            missingElements.push('关於 Betone');
        } else {
            await aboutButton.click();
        }

        // 檢查彈窗中的所有文案和圖片大小
        await page.waitForSelector('.about-container', { state: 'visible' });

        const textsToCheck = [
            '博彩责任',
            'Betone致力於忠诚与可信赖的博彩保证。我们公司遵从远端博彩管理当局的适用法规以及指引，而且努力成为对社会负责任的远端博彩运营公司。远程博彩是全球数以百万玩家的合法娱乐体验。对大多数玩家来说，远端博彩是一项令人愉快的体验，不过，我们也接受这样的现实，少部分沈迷在远端博彩的玩家可能会未达到法定年龄或者出现由於博彩而影响了他们的生活或财务状况的问题。作为一个对社会负责的公司意味着要关注我们的玩家，意味着要对可能对社会产生影响的问题采用主动的方法去解决。这正是为何Betone会采用并完全承诺执行以下最严格的程式和限制。',
            '执行政策',
            '对未成年人的访问限制',
            'Betone要求新客户申明他们已经达到他们所属的司法管辖地区规定的法定年龄且至少年满18岁。当我们怀疑客户可能虚假申报或可能有未成年人试图使用我们的服务时，我们会使用合理的方法进一步进行验证。',
            'Betone不会允许任何未满18岁的人士使用我们的服务。此政策完全遵从并满足监管和给我们发放运营牌照的远端博彩管理当局，First Cagayan Leisure and Resort Corporation (FCRLC) for the Cagayan Economic Zone Authority (CEZA), of Santa Ana, Cagayan，Philippines的规则和规定；',
            '我们承诺将尽我们所能而同时也需要您的协助做到以下这些',
            '1丶使用儿童保护软体从可能被未成年人使用的电脑上遮罩远端博彩网站。',
            '2丶当您的电脑登入到远端博彩网站时不要让电脑处於无人在旁的状况。',
            '3丶不要告知未成年人您的信用卡或银行帐户的详细资料。',
            '4丶不要在本网站登入页面上让“保存密码”选项生效。',
            '5丶在电脑上为未成年人建立独立的登入档案，令他们登入时无法访问您的资料。',
            '6丶如果您知道有人未满18岁（或未满他们所属司法管辖地区法定年龄）但错误地注册成为我们的玩家，请立刻通知我们。',
            '运营资质'
        ];
        const normalizeText = (text) => {
            return text.replace(/[^\w\s]/gi, '').replace(/\s+/g, '');
        };

        for (const item of textsToCheck) {
            const normalizedItem = normalizeText(item);
            const textVisible = await page.locator('body').evaluate((body, text) => {
                const regex = new RegExp(text, 'i');
                return regex.test(body.innerText.replace(/[^\w\s]/gi, '').replace(/\s+/g, ''));
            }, normalizedItem);
            console.log(`文案 "${item}" 是否存在: ${textVisible}`);
            if (!textVisible) missingElements.push(`文案 "${item}"`);
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





    test('檢查 About Betone(EN)', async () => {
        const page = await globalThis.context.newPage();
        // 设置 localStorage 语言为英文
        await page.addInitScript(() => {
            localStorage.setItem('locale', 'en');
        });

        // 导航到个人页面
        await page.goto('https://wap-sg.qbpink01.com/accountCenter');
        await page.waitForLoadState('networkidle');

        const missingElements = [];

        // 檢查 logo.png 是否存在
        const logo = await page.locator('img[src="/logo_fc1a76f3b42b518866602813348c493b.png"]').first();
        const logoVisible = await logo.isVisible();
        console.log(`logo.png 是否存在: ${logoVisible}`);
        if (!logoVisible) {
            missingElements.push('logo.png');
        }

        //檢查並點擊“关於 Betone”按鈕
        const aboutButton = await page.locator('span:has-text("About Betone")').first();
        const aboutButtonVisible = await aboutButton.isVisible();
        console.log(`About Betone 按鈕是否存在: ${aboutButtonVisible}`);
        if (!aboutButtonVisible) {
            missingElements.push('About Betone');
        } else {
            await aboutButton.click();
        }

        // 檢查彈窗中的所有文案和圖片大小
        await page.waitForSelector('.about-container', { state: 'visible' });

        const textsToCheck = [
            'Responsible Gambling',
            'Betone is committed to loyal and trustworthy gambling guarantees. Our company complies with applicable regulations and guidelines from remote gaming authorities and strives to be a socially responsible remote gaming operator. Remote gambling is a legal entertainment experience for millions of players around the world. For most players, remote gambling is an enjoyable experience. However, we also accept the reality that a small number of players who indulge in remote gambling may be under the legal age or suffer from gambling-related impairments. Problems with their lives or financial situation. Being a socially responsible company means paying attention to our players, and it means taking a proactive approach to issues that may have an impact on society. That\'s why Betone has adopted and is fully committed to enforcing the strictest procedures and restrictions below.',
            'Execution policy',
            'Access restrictions for minors',
            'Betone requires new customers to declare that they are of legal age in their jurisdiction and are at least 18 years old. When we suspect that a customer may have made a false declaration or that a minor may be trying to use our services, we will use reasonable methods for further verification.',
            'Betone will not allow anyone under the age of 18 to use our services. This policy fully complies with and meets the rules and regulations of the remote gaming authority that regulates and licenses our operations, First Cagayan Leisure and Resort Corporation (FCRLC) for the Cagayan Economic Zone Authority (CEZA), of Santa Ana, Cagayan, Philippines;',
            'We promise to do our best and need your help to do the following',
            '1. Use child protection software to block remote gambling websites from computers that may be used by minors.',
            '2. Do not leave your computer unattended when logging into a remote gaming website.',
            '3. Do not share your credit card or bank account details with minors.',
            '4. Do not enable the "Save Password" option on the login page of this website.',
            '5. Create a separate login file for minors on the computer so that they cannot access your information when they log in.',
            '6. If you know of anyone under the age of 18 (or under the legal age in their jurisdiction) who has mistakenly registered as a player with us, please notify us immediately.',
            'Operation Qualification'
        ];
        const normalizeText = (text) => {
            return text.replace(/[^\w\s]/gi, '').replace(/\s+/g, '');
        };

        for (const item of textsToCheck) {
            const normalizedItem = normalizeText(item);
            const textVisible = await page.locator('body').evaluate((body, text) => {
                const regex = new RegExp(text, 'i');
                return regex.test(body.innerText.replace(/[^\w\s]/gi, '').replace(/\s+/g, ''));
            }, normalizedItem);
            console.log(`文案 "${item}" 是否存在: ${textVisible}`);
            if (!textVisible) missingElements.push(`文案 "${item}"`);
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




    test('檢查 Mengenai Bet One(MY)', async () => {
        const page = await globalThis.context.newPage();
        // 设置 localStorage 语言为英文
        await page.addInitScript(() => {
            localStorage.setItem('locale', 'my');
        });

        // 导航到个人页面
        await page.goto('https://wap-sg.qbpink01.com/accountCenter');
        await page.waitForLoadState('networkidle');

        const missingElements = [];

        // 檢查 logo.png 是否存在
        const logo = await page.locator('img[src="/logo_fc1a76f3b42b518866602813348c493b.png"]').first();
        const logoVisible = await logo.isVisible();
        console.log(`logo.png 是否存在: ${logoVisible}`);
        if (!logoVisible) {
            missingElements.push('logo.png');
        }

        //檢查並點擊“关於 Betone”按鈕
        const aboutButton = await page.locator('span:has-text("Mengenai Bet One")').first();
        const aboutButtonVisible = await aboutButton.isVisible();
        console.log(`Mengenai Bet One 按鈕是否存在: ${aboutButtonVisible}`);
        if (!aboutButtonVisible) {
            missingElements.push('Mengenai Bet One');
        } else {
            await aboutButton.click();
        }

        // 檢查彈窗中的所有文案和圖片大小
        await page.waitForSelector('.about-container', { state: 'visible' });

        const textsToCheck = [
            'Tanggungjawab Permainan',
            'Betone berkomitmen untuk memastikan kesetiaan dan kepercayaan dalam permainan judi. Syarikat kami mematuhi peraturan dan panduan yang berlaku dari pihak berwenang judi jauh, dan berusaha untuk menjadi syarikat operasi judi jauh yang bertanggungjawab secara sosial. Permainan judi jauh adalah pengalaman hiburan yang sah untuk jutaan pemain di seluruh dunia. Untuk kebanyakan pemain, permainan judi jauh adalah pengalaman yang menyeronokkan, tetapi kita juga menerima kenyataan bahawa sejumlah kecil pemain yang tersangkut pada permainan judi jauh mungkin tidak mencapai usia undang-undang atau menghadapi masalah yang mempengaruhi kehidupan mereka atau situasi keuangan disebabkan permainan judi. Sebagai syarikat yang bertanggungjawab secara sosial, bermakna memperhatikan pemain kita dan mengadopsi kaedah proaktif untuk mengatasi isu-isu yang mungkin mempunyai kesan pada masyarakat. Inilah sebabnya Betone mengadopsi dan berjanji sepenuhnya untuk melaksanakan program dan keterangan paling ketat berikut.',
            'Laksanakan polisi',
            'Had akses untuk anak kecil',
            'Betone memerlukan pelanggan baru untuk menyatakan bahawa mereka telah mencapai usia undang-undang yang diperlukan oleh jurusan mereka dan sekurang-kurangnya 18 tahun. Apabila kita mencurigai bahawa pelanggan mungkin membuat deklarasi palsu atau bahawa anak kecil mungkin cuba untuk menggunakan perkhidmatan kita, kita akan menggunakan kaedah yang masuk akal untuk mengesahkan lebih lanjut.',
            'Betone tidak akan membenarkan sesiapa di bawah 18 tahun untuk menggunakan perkhidmatan kami. Polisi ini memenuhi dan memenuhi peraturan dan peraturan Pertama Cagayan Leisure and Resort Corporation (FCRLC) untuk Kerajaan Zon Ekonomi Cagayan (CEZA), Santa Ana, Cagayan, Filipina, yang mengatur dan mengeluarkan lesen operasi kepada kita;',
            'Kami berjanji untuk melakukan yang terbaik kami sambil memerlukan bantuan anda untuk mencapai',
            '1. Guna perisian perlindungan anak untuk menutup laman web permainan judi jauh dari komputer yang mungkin digunakan oleh anak kecil.',
            '2. Jangan biarkan komputer anda tidak dijaga bila log masuk ke laman web permainan judi jauh.',
            '3. Jangan menyatakan maklumat terperinci kad kredit atau akaun bank anda kepada anak kecil.',
            '4. Jangan dayakan pilihan "Simpan Kata Laluan" pada halaman log masuk laman web ini.',
            '5. Cipta fail log masuk independen untuk anak kecil di komputer untuk mencegahnya daripada mengakses maklumat anda apabila log masuk.',
            '6. Jika anda kenal seseorang yang berusia bawah 18 tahun (atau di bawah umur undang-undang kawasan mereka) tetapi telah secara salah terdaftar sebagai pemain kami, sila beritahu kami segera.',
            'Kelayakan Operasi'
        ];
        const normalizeText = (text) => {
            return text.replace(/[^\w\s]/gi, '').replace(/\s+/g, '');
        };

        for (const item of textsToCheck) {
            const normalizedItem = normalizeText(item);
            const textVisible = await page.locator('body').evaluate((body, text) => {
                const regex = new RegExp(text, 'i');
                return regex.test(body.innerText.replace(/[^\w\s]/gi, '').replace(/\s+/g, ''));
            }, normalizedItem);
            console.log(`文案 "${item}" 是否存在: ${textVisible}`);
            if (!textVisible) missingElements.push(`文案 "${item}"`);
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
});