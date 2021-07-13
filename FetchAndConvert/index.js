const fs = require('fs');
const puppeteer = require('puppeteer');

const path = `/tmp/html2pdf-${new Date().getTime()}-${Math.random().toString(36).substring(7)}.pdf`;

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const url = req.query.url;
    if (!url) {
        context.res = {
            status: 400,
            body: { error: 'query string "url" is required' }
        };
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {
        waitUntil: 'networkidle2',
    });
    await page.emulateMediaType('screen');
    await page.pdf({ path: path, format: 'a4' });
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