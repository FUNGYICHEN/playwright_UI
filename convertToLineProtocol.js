const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const lpFilePath = path.join(__dirname, 'ctrf', 'results', 'results.lp');
const inputPath = path.join(__dirname, 'ctrf', 'ctrf-report.json');
const org = 'QA_test';
const bucket = 'playwright_results';
// const token = 'b1-kyQA3ARcP85_p6d5ry0XrQ1TSs9EDjpkagk4oyzeWCoOUt89l-K8gfnOhYqF3fCLfZEZdse4yJSUGdYXXNw==';
const token = '_jPDDWo3llYJuRRoCY9LUTzgy-kbNRr8gzkE-KriNKGhz9X1zb8fGzrDvJCF6pQxb2MdLjidzodvG9x_HiiKqQ==';
const MAX_RETRIES = 5; // 設置最大重試次數
let retryCount = 0;

// 清理 ANSI 轉義字符的函數
function stripAnsi(str) {
    return str.replace(
        /[\u001b\u009b][[()#;?]*(?:(?:[a-zA-Z\d]*(?:;[a-zA-Z\d]*)*)?\u0007|(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-ntqry=><~])/g,
        ''
    );
}

// 讀取 JSON 文件並生成 Line Protocol 數據的函數
function processJsonData() {
    fs.readFile(inputPath, 'utf8', (err, data) => {
        if (err) {
            console.error('讀取 JSON 文件時出錯:', err);
            return;
        }

        try {
            const jsonData = JSON.parse(data);

            const lines = [];
            let currentTime = Date.now() * 1e6;
            const timeIncrement = 1e6; // 每個條目的時間增量（1微秒）

            // 添加總體測試結果
            const summary = jsonData.results.summary;
            const summaryLine = `playwright_summary tests=${summary.tests},passed=${summary.passed},failed=${summary.failed} ${currentTime}`;
            lines.push(summaryLine);
            currentTime += timeIncrement;

            // 按平台分類匯總測試結果
            const platformSummary = {};

            jsonData.results.tests.forEach((test) => {
                const platform = test.suite.split('\\')[0];
                if (!platformSummary[platform]) {
                    platformSummary[platform] = { tests: 0, passed: 0, failed: 0 };
                }
                platformSummary[platform].tests += 1;
                if (test.status === 'passed') {
                    platformSummary[platform].passed += 1;
                } else if (test.message) { // 只有在 test.message 存在時才計算失敗
                    platformSummary[platform].failed += 1;
                    // 添加失敗的測試信息
                    const message = stripAnsi(test.message.replace(/"/g, '\\"').replace(/\n/g, '\\n'));
                    const failedLine = `playwright_errors,platform=${platform} message="${message}" ${currentTime}`;
                    lines.push(failedLine);
                }
                currentTime += timeIncrement;
            });

            // 將平台分類結果寫入 Line Protocol 文件
            for (const [platform, counts] of Object.entries(platformSummary)) {
                const platformLine = `playwright_results,platform=${platform} tests=${counts.tests},passed=${counts.passed},failed=${counts.failed} ${currentTime}`;
                lines.push(platformLine);
                currentTime += timeIncrement;
            }

            // 寫入 Line Protocol 文件
            fs.writeFile(lpFilePath, lines.join('\n'), (err) => {
                if (err) {
                    console.error('寫入 Line Protocol 文件時出錯:', err);
                    return;
                }
                console.log('成功寫入 Line Protocol 文件:', lpFilePath);

                // 調試信息
                console.log('寫入的 Line Protocol 內容:', lines.join('\n'));

                // 上傳新數據
                exec(`curl -X POST "http://localhost:8086/api/v2/write?org=${org}&bucket=${bucket}&precision=ns" -H "Authorization: Token ${token}" --data-binary @${lpFilePath}`, (err, stdout, stderr) => {
                    if (err) {
                        console.error(`上傳新數據時出錯: ${err}`);
                        return;
                    }
                    if (stderr) {
                        console.error(`上傳新數據時的stderr: ${stderr}`);
                    } else {
                        console.log(`新數據上傳成功: ${stdout}`);
                    }
                });
            });
        } catch (error) {
            console.error('解析 JSON 時出錯:', error);
            retryCount += 1;
            if (retryCount <= MAX_RETRIES) {
                console.log(`重試解析 JSON 數據 (${retryCount}/${MAX_RETRIES})...`);
                processJsonData();
            } else {
                console.error('達到最大重試次數，停止重試。');
            }
        }
    });
}

// 開始讀取和處理 JSON 數據
processJsonData();
