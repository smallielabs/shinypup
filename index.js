//const { default: puppeteer } = require("puppeteer");

const puppeteer = require('puppeteer');

async function npboottprm_replext (){

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Navigate the page to a URL.
    await page.goto('https://mightymetrika.shinyapps.io/npbreplext031/');

    await page.waitForSelector('#M1', { timeout: 20_000 });

      // Scrolling to the bottom of the page
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });

    await page.click('#runSim');

    // Scrolling to the top of the page
    await page.evaluate(() => {
        window.scrollTo(0, 0);
    });

    await page.waitForSelector('#DataTables_Table_1_filter > label > input[type=search]', { timeout: 20_000 });

    // Scrolling to the bottom of the page
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });

    await page.click('#submit');

    await browser.close();
}

npboottprm_replext();