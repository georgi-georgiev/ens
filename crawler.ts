import { launch, TimeoutError } from "puppeteer";
import { appendFileSync } from "fs";
import { expose } from "threads/worker";

const crawler = {
    async start(words: string[], output: string) {
        let browser = await launch({
            headless: false,
        });
        let page = await browser.newPage();
        let dateStr1 = "2024-08-02T13:43:40.000Z";
        let date1 = new Date(dateStr1);
        let timestamp = date1.getTime();
        page.setCookie({
            name: "_ga",
            value: "GA1.2.843096909.1659019335",
            domain: ".ens.domains",
            expires: timestamp,
            path: "/",
        });
        await page.goto("https://app.ens.domains/search/asdfg", {
            waitUntil: "domcontentloaded",
        });

        let availabilityDiv =
            "#root > div > main > div > a > div.label-container > div";
        let searchInput = "#root > header > form > input";
        let searchButton = "#root > header > form > button";
        let warningHeading = "#root > div > main > div > h2";

        await page.waitForSelector(availabilityDiv);

        for (let index = 0; index < words.length; index++) {
            let word = words[index];

            try {
                await page.evaluate((sel) => {
                    var elements = document.querySelectorAll(sel);
                    for (var i = 0; i < elements.length; i++) {
                        let parent = elements[i].parentNode;
                        if (parent != null) {
                            parent.removeChild(elements[i]);
                        }
                    }
                }, warningHeading);

                await page.evaluate((sel) => {
                    var elements = document.querySelectorAll(sel);
                    for (var i = 0; i < elements.length; i++) {
                        let parent = elements[i].parentNode;
                        if (parent != null) {
                            parent.removeChild(elements[i]);
                        }
                    }
                }, availabilityDiv);

                await page.type(searchInput, "");

                await page.type(searchInput, word);
                await page.click(searchButton);

                try {
                    let warning = await page.waitForSelector(warningHeading, {
                        timeout: 1000,
                    });
                    if (warning != null) {
                        let warningText = await warning.evaluate(
                            (e) => e.textContent
                        );
                        if (warningText != null) {
                            if (warningText == "Warning") {
                                console.log(word + " Warning");
                                continue;
                            } else {
                                console.log(word + " " + warningText);
                            }
                        }
                    }
                } catch (ex) {
                    if (!(ex instanceof TimeoutError)) {
                        console.log(word + " " + ex);
                    }
                }

                let availibityElement = await page.waitForSelector(
                    availabilityDiv
                );
                if (availibityElement == null) {
                    console.log(word + " availability is null");
                } else {
                    let availability = await availibityElement.evaluate(
                        (e) => e.textContent
                    );
                    if (availability == "Available") {
                        appendFileSync(
                            "output/" + output + ".txt",
                            word + "\r\n"
                        );
                    }
                }
            } catch (ex) {
                console.log(word + " " + ex);
                browser;
            }
        }
    },
};

export type Crawler = typeof crawler;

expose(crawler);
