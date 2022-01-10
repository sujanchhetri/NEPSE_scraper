"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const puppeteer = require("puppeteer");
const fs = require("fs");
function scraper(option) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //browser initiate
            let browser = yield puppeteer.launch({
                args: ["--start-maximized"],
                headless: false,
            });
            // opens a new blank page
            let page = yield browser.newPage();
            // resize the browser
            yield page.setViewport({ width: 1366, height: 768 });
            // navigate to url and wait until page loads completely
            yield page.goto(`http://www.nepalstock.com.np/main/todays_price/index/${option.code} `, {
                waitUntil: "networkidle0",
            });
            // waits until page loads completely
            yield page.waitForSelector(".container", { visible: true });
            const content = yield page.evaluate(() => {
                let rowList = [];
                let rows = document.querySelectorAll("table tbody tr");
                rows.forEach((row) => {
                    `  `;
                    // Declares the data we want to scrape
                    let record = {
                        Sn: "",
                        Traded_Companies: "",
                        No_Of_Transaction: "",
                        Max_Price: "",
                        Min_Price: "",
                        Closing_Price: "",
                        Traded_Shares: "",
                        Amount: "",
                        Previous_Closing: "",
                        Difference_Rs: ""
                    };
                    // getting textvalue of each column of a row and adding them to a list
                    const tdList = Array.from(row.querySelectorAll("td"), (column) => column.innerText);
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
                            Difference_Rs: tdList[9]
                        });
                    }
                });
                return rowList;
            });
            // Store output by creating json file for each airport code i.e. A-Z
            fs.writeFile(`./ShareData/ShareData-${option.index}.json`, JSON.stringify(content, null, 2), (err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(`Data  of Stock Page-${option.index} Scraped`);
                }
            });
            // close the browser
            yield browser.close();
        }
        catch (e) {
            console.log(e);
        }
    });
}
let main = () => __awaiter(void 0, void 0, void 0, function* () {
    // Loop through the stock page
    for (let i = 1; i <= 11; ++i) {
        yield Promise.all([
            scraper({
                code: i,
                index: i,
            }),
        ]);
    }
});
main()
    .then(() => {
    console.log("Scraping Completed!");
})
    .catch((e) => {
    console.log(`Failed due to exception - ${e}`);
});
