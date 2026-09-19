const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/#/login', { waitUntil: 'networkidle2' });
  
  // Set auth local storage
  await page.evaluate(() => {
    localStorage.setItem('civiclens_auth', JSON.stringify({
      user: { id: 1, name: 'Test Citizen', role: 'CITIZEN', phone: '1234567890' },
      isAuthenticated: true
    }));
  });
  
  await page.goto('http://localhost:5173/#/report', { waitUntil: 'networkidle2' });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
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
