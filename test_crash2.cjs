const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/#/report', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const voiceBtn = btns.find(b => b.textContent.includes('Voice'));
    if (voiceBtn) voiceBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    const mockBtn = document.getElementById('mock-voice-submit');
    if (mockBtn) mockBtn.click();
  });

  await new Promise(r => setTimeout(r, 1000));
  
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log("SCREEN TEXT:\n", bodyText);
  
  await browser.close();
})();
