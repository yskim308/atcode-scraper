import puppeteer from "puppeteer";
import { ScrapeService } from "./sevices/ScrapeService";
import { delay } from "./util";
import type { Task } from "./types";
import { mongoService } from "./sevices/MongoService";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  const scrapeService = new ScrapeService(browser, page);

  for (let i = 46; i <= 416; ++i) {
    // getting task links
    let contestNumber: string = i < 100 ? `0${i}` : `${i}`;
    const contestLink = `https://atcoder.jp/contests/abc${contestNumber}/tasks`;
    const links = await scrapeService.getTaskLinks(contestLink);
    console.log(`scraping links from: ${contestLink}`);
    console.log(links);

    // scraping each task
    for (const link of links) {
      // delay between 1 and 5 seconds randomly
      const randomDelay = Math.floor(Math.random() * 4) + 1;
      await delay(randomDelay);
      const task: Task = await scrapeService.scrapeTaskInfo(link);
      console.log("scraped task, and inserting: ");
      console.log(task);
      mongoService.insertTask(task);
    }
  }
  await browser.close();
  mongoService.disconnect();
})();
