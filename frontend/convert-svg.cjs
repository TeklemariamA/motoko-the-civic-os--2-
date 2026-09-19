const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const svgPath = path.resolve(__dirname, 'public/bot.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:transparent;">
        ${svgContent}
      </body>
    </html>
  `;
  await page.setContent(html);
  
  const svgElement = await page.$('svg');
  // ensure the SVG fills the space
  await page.evaluate(() => {
    const svg = document.querySelector('svg');
    svg.style.width = '100%';
    svg.style.height = '100%';
    Object.assign(document.body.style, { margin: 0, overflow: 'hidden' });
  });

  // 192x192
  await page.setViewportSize({ width: 192, height: 192 });
  await svgElement.screenshot({ path: path.join(__dirname, 'public/icon-192.png'), omitBackground: true });

  // 512x512
  await page.setViewportSize({ width: 512, height: 512 });
  await svgElement.screenshot({ path: path.join(__dirname, 'public/icon-512.png'), omitBackground: true });

  await browser.close();
  console.log("Converted bot.svg to 192x192 and 512x512 PNGs!");
})();
