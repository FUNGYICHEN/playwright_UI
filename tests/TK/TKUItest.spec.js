const { test, expect } = require('@playwright/test');
const { userRecordKey, userRecordValue } = require('./TKconstants');
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

    await page.goto('http://wap.pp-af.com/');
    await page.waitForLoadState('networkidle');

    await page.close();
});



test('檢查 Acerca de Castillo', async () => {
    const page = await globalThis.context.newPage();
    // 设置 localStorage 语言为越南语
    await page.addInitScript(() => {
        localStorage.setItem('locale', 'mx');
    });
    await page.goto('http://wap.pp-af.com/accountCenter');
    await page.waitForLoadState('networkidle');
    const missingElements = [];

    // 检查 .icon.icon-alert.logo 并检查大小
    const logo = await page.locator('.icon.icon-alert.logo').first();
    const logoVisible = await logo.isVisible();
    console.log(`Castillo icon 是否存在: ${logoVisible}`);
    if (logoVisible) {
        const logoSize = await logo.evaluate(element => {
            return {
                width: element.offsetWidth,
                height: element.offsetHeight
            };
        });
        console.log(`Castillo icon大小: ${logoSize.width}x${logoSize.height}`);
        const expectedWidth = 20;
        const expectedHeight = 20;
        if (logoSize.width !== expectedWidth || logoSize.height !== expectedHeight) {
            missingElements.push(`icon 大小不符 (期望: ${expectedWidth}x${expectedHeight}, 实际: ${logoSize.width}x${logoSize.height})`);
        }
    } else {
        missingElements.push('icon');
    }

    // 找到第12个 .menu-item框架
    const menuItem = await page.locator('.menu-item').nth(10);
    const menuItemVisible = await menuItem.isVisible();
    console.log(`第11个 .menu-item 是否存在: ${menuItemVisible}`);
    if (!menuItemVisible) {
        throw new Error('第11个 .menu-item 不存在');
    }

    // 在找到的 .menu-item 中查找 main-label 的文本内容
    const mainLabel = menuItem.locator('.main-label');
    const mainLabelText = await mainLabel.textContent();
    console.log(`第11个 .menu-item 下的 main-label 文本内容: ${mainLabelText}`);

    if (mainLabelText.trim() !== "Acerca de Castillo") {
        missingElements.push('Acerca de Castillo 文本不匹配');
    }

    // 检查并点击“Acerca de Castillo”按钮
    const aboutButton = mainLabel.locator('div:has-text("Acerca de Castillo")');
    const aboutButtonVisible = await aboutButton.isVisible();
    console.log(`Acerca de Castillo 按钮是否存在: ${aboutButtonVisible}`);
    if (!aboutButtonVisible) {
        missingElements.push('Acerca de Castillo 按钮');
    } else {
        await aboutButton.click();
    }

    // 检查弹窗中的所有文案和图片大小
    await page.waitForSelector('.about-container', { state: 'visible' });

    const textsToCheck = [
        { text: 'Juego responsable', tag: 'div.about-heading' },
        { text: 'CastilloJuego Confiable. Nuestra empresa cumple con las regulaciones y directrices aplicables de las autoridades de juego remoto y se esfuerza por ser un operador de juego remoto socialmente responsable. El juego remoto es una experiencia de entretenimiento legal para millones de jugadores en todo el mundo. Para la mayoría de los jugadores, el juego a distancia es una experiencia agradable, pero también aceptamos la realidad de que un pequeño número de jugadores que se dedican al juego a distancia pueden ser menores de edad o sufrir impedimentos relacionados con el juego. Problemas con sus vidas o su situación financiera . Ser una empresa socialmente responsable significa prestar atención a nuestros actores y adoptar un enfoque proactivo ante los problemas que pueden tener un impacto en la sociedad. esto es exactamente por quéCastilloSe adoptarán y se comprometerán plenamente a hacer cumplir los siguientes procedimientos y restricciones más estrictos.', tag: 'div.about-desc' },
        { text: 'Ejecutar política', tag: 'div.about-heading' },
        { text: 'Restricciones de acceso para menores', tag: 'div.about-desc' },
        { text: 'CastilloLos nuevos clientes deben declarar que son mayores de edad en su jurisdicción y tener al menos 18 años. Cuando sospechemos que un cliente puede haber hecho una declaración falsa o que un menor puede estar intentando utilizar nuestros servicios, utilizaremos métodos razonables para una mayor verificación.', tag: 'div.about-desc' },
        { text: 'CastilloCualquier persona menor de 18 años no podrá utilizar nuestros servicios. Esta política cumple plenamente y cumple con las reglas y regulaciones de la autoridad de juego remoto que regula y otorga licencias a nuestras operaciones, First Cagayan Leisure and Resort Corporation (FCRLC) para la Autoridad de la Zona Económica de Cagayán (CEZA), de Santa Ana, Cagayán, Filipinas;', tag: 'div.about-desc' },
        { text: 'Nos comprometemos a hacer todo lo posible y también necesitamos su ayuda para lograr lo siguiente', tag: 'div.about-heading' },
        { text: '1. Cubrir los sitios web de apuestas en línea en computadoras que puedan ser utilizadas por menores de edad mediante el uso de software de protección para niños.', tag: 'div.about-desc' },
        { text: '2. No dejar su computadora desatendida mientras está conectada a sitios web de apuestas en línea.', tag: 'div.about-desc' },
        { text: '3. No divulgar los detalles de su tarjeta de crédito o cuenta bancaria a menores de edad.', tag: 'div.about-desc' },
        { text: '4. No permitas que la opción "Guardar contraseña" esté activada en la página de inicio de sesión.', tag: 'div.about-desc' },
        { text: '5. Crear perfiles de inicio de sesión independientes para menores de edad en la computadora para que no puedan acceder a sus datos cuando inicien sesión.', tag: 'div.about-desc' },
        { text: '6. Si sabe que alguien menor de 18 años (o menor de la edad legal en su jurisdicción) se ha registrado erróneamente como jugador nuestro, infórmenos de inmediato.', tag: 'div.about-desc' },
        { text: 'Calificación de Funcionar', tag: 'p.about-heading' },
        { text: 'Juego responsable', tag: 'p.about-heading' },
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

    // 檢查圖片大小
    const imagesToCheck = [
        { selector: 'img[src="/res/images/com-tk/about-footer-1.png"]', description: 'icon_1', expectedWidth: 391, expectedHeight: 50 },
        { selector: 'img[src="/res/images/com-tk/about-footer-2.png"]', description: 'icon_2', expectedWidth: 181, expectedHeight: 48 }
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

    // 打印所有檢查結果後再判斷是否有錯誤
    if (missingElements.length > 0) {
        console.log(`以下元素未找到或大小不符: ${missingElements.join(', ')}`);
        expect(missingElements.length, `以下元素未找到或大小不符: ${missingElements.join(', ')}`).toBe(0);
    }

    await page.close();
});








test('检查 About Castillo(EN)', async () => {
    const page = await globalThis.context.newPage();

    await page.addInitScript(() => {
        localStorage.setItem('locale', 'en');
    });

    await page.goto('http://wap.pp-af.com/accountCenter');
    await page.waitForLoadState('networkidle');
    const missingElements = [];

    // 检查 .icon.icon-alert.logo 并检查大小
    const logo = await page.locator('.icon.icon-alert.logo').first();
    const logoVisible = await logo.isVisible();
    console.log(`Castillo icon 是否存在: ${logoVisible}`);
    if (logoVisible) {
        const logoSize = await logo.evaluate(element => {
            return {
                width: element.offsetWidth,
                height: element.offsetHeight
            };
        });
        console.log(`Castillo icon大小: ${logoSize.width}x${logoSize.height}`);
        const expectedWidth = 20;
        const expectedHeight = 20;
        if (logoSize.width !== expectedWidth || logoSize.height !== expectedHeight) {
            missingElements.push(`icon 大小不符 (期望: ${expectedWidth}x${expectedHeight}, 实际: ${logoSize.width}x${logoSize.height})`);
        }
    } else {
        missingElements.push('icon');
    }

    // 找到第12个 .menu-item框架
    const menuItem = await page.locator('.menu-item').nth(10);
    const menuItemVisible = await menuItem.isVisible();
    console.log(`第11个 .menu-item 是否存在: ${menuItemVisible}`);
    if (!menuItemVisible) {
        throw new Error('第11个 .menu-item 不存在');
    }

    // 在找到的 .menu-item 中查找 main-label 的文本内容
    const mainLabel = menuItem.locator('.main-label');
    const mainLabelText = await mainLabel.textContent();
    console.log(`第11个 .menu-item 下的 main-label 文本内容: ${mainLabelText}`);

    if (mainLabelText.trim() !== "About Castillo") {
        missingElements.push('About Castillo 文本不匹配');
    }

    // 检查并点击“Acerca de Castillo”按钮
    const aboutButton = mainLabel.locator('div:has-text("About Castillo")');
    const aboutButtonVisible = await aboutButton.isVisible();
    console.log(`About Castillo 按钮是否存在: ${aboutButtonVisible}`);
    if (!aboutButtonVisible) {
        missingElements.push('About Castillo 按钮');
    } else {
        await aboutButton.click();
    }

    // 检查弹窗中的所有文案和图片大小
    await page.waitForSelector('.about-container', { state: 'visible' });

    const textsToCheck = [
        { text: 'Responsible Gambling', tag: 'div.about-heading' },
        { text: 'Castillo is committed to loyal and trustworthy gambling guarantees. Our company complies with applicable regulations and guidelines from remote gaming authorities and strives to be a socially responsible remote gaming operator. Remote gambling is a legal entertainment experience for millions of players around the world. For most players, remote gambling is an enjoyable experience. However, we also accept the reality that a small number of players who indulge in remote gambling may be under the legal age or suffer from gambling-related impairments. Problems with their lives or financial situation. Being a socially responsible company means paying attention to our players, and it means taking a proactive approach to issues that may have an impact on society. That\'s why Castillo has adopted and is fully committed to enforcing the strictest procedures and restrictions below.', tag: 'div.about-desc' },
        { text: 'Execution policy', tag: 'div.about-heading' },
        { text: 'Access restrictions for minors', tag: 'div.about-desc' },
        { text: 'Castillo requires new customers to declare that they are of legal age in their jurisdiction and are at least 18 years old. When we suspect that a customer may have made a false declaration or that a minor may be trying to use our services, we will use reasonable methods for further verification.', tag: 'div.about-desc' },
        { text: 'Castillo will not allow anyone under the age of 18 to use our services. This policy fully complies with and meets the rules and regulations of the remote gaming authority that regulates and licenses our operations, First Cagayan Leisure and Resort Corporation (FCRLC) for the Cagayan Economic Zone Authority (CEZA), of Santa Ana, Cagayan, Philippines ;', tag: 'div.about-desc' },
        { text: 'We promise to do our best and need your help to do the following', tag: 'div.about-heading' },
        { text: '1. Use child protection software to block remote gambling websites from computers that may be used by minors.', tag: 'div.about-desc' },
        { text: '2. Do not leave your computer unattended when logging into a remote gaming website.', tag: 'div.about-desc' },
        { text: '3. Do not share your credit card or bank account details with minors.', tag: 'div.about-desc' },
        { text: '4. Do not enable the "Save Password" option on the Real Sports login page.', tag: 'div.about-desc' },
        { text: '5. Create a separate login file for minors on the computer so that they cannot access your information when they log in.', tag: 'div.about-desc' },
        { text: '6. If you know of anyone under the age of 18 (or under the legal age in their jurisdiction) who has mistakenly registered as a player with us, please notify us immediately.', tag: 'div.about-desc' },
        { text: 'Operation Qualification', tag: 'p.about-heading' },
        { text: 'Responsible Gambling', tag: 'p.about-heading' }
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

    // 檢查圖片大小
    const imagesToCheck = [
        { selector: 'img[src="/res/images/com-tk/about-footer-1.png"]', description: 'icon_1', expectedWidth: 391, expectedHeight: 50 },
        { selector: 'img[src="/res/images/com-tk/about-footer-2.png"]', description: 'icon_2', expectedWidth: 181, expectedHeight: 48 }
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

    // 打印所有檢查結果後再判斷是否有錯誤
    if (missingElements.length > 0) {
        console.log(`以下元素未找到或大小不符: ${missingElements.join(', ')}`);
        expect(missingElements.length, `以下元素未找到或大小不符: ${missingElements.join(', ')}`).toBe(0);
    }

    await page.close();
});







test.describe('遊戲場館測試', () => {
    test('rich88', async () => {
        // 设置测试超时
        test.setTimeout(9000000);

        const page = await globalThis.context.newPage();

        // 设置 localStorage 语言为越南语
        await page.addInitScript(() => {
            localStorage.setItem('locale', 'mx');
        });

        await page.goto('https://wap.mcmcgo.com/hall');
        await page.waitForLoadState('networkidle');

        // 检查并关闭弹窗
        let closeButtonVisible = true;
        while (closeButtonVisible) {
            const closeButton = page.locator('svg path[fill="#999"]').first();
            closeButtonVisible = await closeButton.isVisible();
            if (closeButtonVisible) {
                await closeButton.click();
                console.log('關閉广告');
                await page.waitForTimeout(1000);
            }
        }

        // 切换到 Slot 类别
        const slotCategory = page.locator('.label:has-text("Slot")');
        await slotCategory.click();
        console.log('已切换到 Slot 類別');

        await page.waitForLoadState('networkidle');

        // 点击游戏场馆按钮
        const gameVenueButton = page.locator('.enter-game-button.bk-rich.mx');
        await gameVenueButton.click();
        console.log('已點擊遊戲場館按钮');

        await page.waitForLoadState('networkidle');

        const errors = [];

        // 封装游戏点击和 API 检查的函数
        async function checkGameItem(index) {
            try {
                // 定位并点击游戏项目
                const gameItem = page.locator('.game_item').nth(index);
                await gameItem.click();
                console.log(`已点击第 ${index + 1} 个游戏项目`);

                // 等待并拦截 API 请求
                try {
                    const response = await page.waitForResponse(response => response.url().includes('https://betacenter.ark8899.com/v1/player/game/login/'), { timeout: 12000 });
                    const statusCode = response.status();
                    console.log(`第 ${index + 1} 個遊戲項目 API 狀態碼: ${statusCode}`);
                    if (statusCode !== 200) {
                        errors.push(`第 ${index + 1} 遊戲項目的 API 狀態碼: ${statusCode}`);
                    }
                } catch (error) {
                    console.log(`第 ${index + 1} 個遊戲項目 API 無返回狀態碼`);
                    errors.push(`第 ${index + 1} 個遊戲項目 API 無返回狀態碼`);
                }

                // 返回上一页
                try {
                    await page.goBack();
                    await page.waitForTimeout(5000); // 等待 5 秒再点击下一款游戏
                } catch (error) {
                    console.log(`第 ${index + 1} 个游戏项目返回上一页失败`);
                    errors.push(`第 ${index + 1} 个游戏项目返回上一页失败`);
                }
            } catch (error) {
                console.log(`第 ${index + 1} 个游戏项目处理失败`);
                errors.push(`第 ${index + 1} 个游戏项目处理失败`);
            }
        }

        // 检查108个游戏项目
        for (let i = 0; i < 98; i++) {
            await checkGameItem(i);
        }

        // 打印所有错误
        if (errors.length > 0) {
            console.error('以下是檢測到的錯誤:');
            errors.forEach(error => console.error(error));
        }

        expect(errors.length).toBe(0); // 确保没有错误

        await page.close();
    });
});