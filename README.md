# 安裝node.js
https://nodejs.cn/download/#google_vignette

# 初始化playwright框架
終端機輸入
npx init playwright
選擇:javaScript
選擇腳本放置位置:tests
添加GitHub:True

# 安装 Playwright 和 pytest-playwright
pip install playwright pytest-playwright

# 运行 Playwright 安装命令以下载所需的浏览器
playwright install

# 運行測試指令
npx playwright test 運行所有測試
npx playwright test tests/UIbasicstest.spec.js 運行某一個js腳本測試
npx playwright test --ui 運行ui檢查測試
npx playwright test tests/UIbasicstest.spec.js --debug 運行偵錯測試，針對每一個步驟確認是否正確



# 安裝json-reporter
# 若用原本預設的報告json檔，會有亂碼，無法轉化成lp檔，要用此插件來產生json檔才會正常
npm install --save-dev playwright-ctrf-json-reporter

# 新增convertToLineProtocol.js
# 主要將json檔案轉化為lp檔，可以直接匯入DB中


# playrightauto\ctrf\results
# json/lp生成位置

# gafana
# server.js(暫不使用)
運行後會定時更新json網頁報告
garfana 使用 json api進行連接

# gafana
選擇添加數據源InfluxDB
Query language欄位 選擇Flux
輸入URL 預設為http://127.0.0.1:8086
Auth中的Basic auth開關打開，Basic Auth Details輸入你登入DB的帳號密碼
Organization的值，可以回到DB中的左側欄，有一個Q圖案點擊，接著點擊ABOUT，就可以看到Organization ID
最後輸入你bucket的名稱


# 接著建立儀表板
選擇使用table
在下方欄位輸入，即可查詢到2小時內的錯誤訊息，若有其他範圍區間，可修改start或是新增stop來指定範圍
true為從新到舊、false為從舊到新

from(bucket: "playwright_results")
  |> range(start: -2h)
  |> filter(fn: (r) => r["_measurement"] == "playwright_errors")
  |> filter(fn: (r) => r["_field"] == "message")
  |> map(fn: (r) => ({ r with platform: r.suite }))
  |> rename(columns: {_time: "Time", _value: "Message", platform: "Suite"})
  |> keep(columns: ["Time", "Suite", "Message"])
  |> sort(columns: ["Time"], desc: true)  // 按时间排序，desc: false表示升序
  |> yield(name: "results")


# jenkins不支援外部htnl報告，所以打開報告會是空白
需要在系統設置 > Script Console

輸入指令System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval';")

重新登入jenkins