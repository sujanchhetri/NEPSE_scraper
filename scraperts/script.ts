const puppeteer = require("puppeteer");
const fs = require("fs");

async function scraper(option: any) {
  try {
    //browser initiate
    let browser = await puppeteer.launch({
      args: ["--start-maximized"],
      headless: false,
    });
    // opens a new blank page
    let page = await browser.newPage();

    // resize the browser
    await page.setViewport({ width: 1366, height: 768 });

    // navigate to url and wait until page loads completely
    await page.goto(`http://www.nepalstock.com.np/main/todays_price/index/${option.code} `, {
      waitUntil: "networkidle0",
    });

    // waits until page loads completely
    await page.waitForSelector(".container", { visible: true });

    
    const content = await page.evaluate(() => {
      let rowList: any[] = [];

      let rows = document.querySelectorAll("table tbody tr");
      rows.forEach((row) => {
        `  `;
        // Declares the data we want to scrape
        let record: {
          Sn: string;
          Traded_Companies: string;
          No_Of_Transaction: string;
          Max_Price: string;
          Min_Price: string;
          Closing_Price: string;
          Traded_Shares: string;
          Amount: string;
          Previous_Closing: string;
          Difference_Rs: string;
        } = {
          Sn: "",
          Traded_Companies: "",
          No_Of_Transaction: "",
          Max_Price: "",
          Min_Price: "",
          Closing_Price: "",
          Traded_Shares: "",
          Amount:"",
          Previous_Closing:"",
          Difference_Rs: ""
        };
        // getting textvalue of each column of a row and adding them to a list
        const tdList = Array.from(
          row.querySelectorAll("td"),
          (column) => column.innerText,
        );

        if (tdList.length >= 9) {
          // push the data
          rowList.push({
            Sn: tdList[0],
            Traded_Companies: tdList[1],
            No_Of_Transaction: tdList[2],
            Max_Price: tdList[3],
            Min_Price: tdList[4],
            Closing_Price: tdList[5],
            Traded_Shares: tdList[6],
            Amount: tdList[7],
            Previous_Closing: tdList[8],
            Difference_Rs:tdList[9]
          });
        }
      });
      return rowList;
    });
    // Store output by creating json file for each airport code i.e. A-Z
    fs.writeFile(
      `./ShareData/ShareData-${option.index}.json`,
      JSON.stringify(content, null, 2),
      (err: any) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Data  of Stock Page-${option.index} Scraped`);
        }
      },
    );
    // close the browser
    await browser.close();
  } catch (e) {
    console.log(e);
  }
}

let main = async () => {
  // Loop through the stock page
  for (let i = 1; i <= 11; ++i) {
    await Promise.all([
      scraper({
        code: i,
        index: i,
      }),
    ]);
  }
};

main()
  .then(() => {
    console.log("Scraping Completed!");
  })
  .catch((e) => {
    console.log(`Failed due to exception - ${e}`);
  });
