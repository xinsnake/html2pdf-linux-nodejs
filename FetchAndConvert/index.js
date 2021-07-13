const fs = require('fs');
const puppeteer = require('puppeteer');

const path = `/tmp/html2pdf-${new Date().getTime()}-${Math.random().toString(36).substring(7)}.pdf`;

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const url = req.query.url;
    console.log(url);
    if (!url) {
        context.res = {
            status: 400,
            body: { error: 'query string "url" is required' }
        };
        return;
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });
    await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
    });
    await page.emulateMediaType('screen');
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.pdf({ path: path, format: 'a4', landscape: true, printBackground: true });
    await browser.close();

    const fileBuffer = fs.readFileSync(path);
    context.res = {
        status: 200,
        body: fileBuffer,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": "inline"
        }
    };
}