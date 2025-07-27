import puppeteer from "puppeteer";
import { ScrapeService } from "./sevices/ScrapeService";
import { delay } from "./util";
import type { Task } from "./types";

const testLink = "https://atcoder.jp/contests/abc416/tasks";
const taskLink = "https://atcoder.jp/contests/abc416/tasks/abc416_f";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const scrapeService = new ScrapeService(browser, page);
  for (let i = 46; i <= 416; ++i) {
    const links = await scrapeService.getTaskLinks(
      `https://atcoder.jp/contest/abc${i}/tasks`,
    );
    console.log("will now scrape these links:");
    console.log(links);
    for (const link of links) {
      // delay between 1 and 5 seconds randomly
      const randomDelay = Math.floor(Math.random() * 4) + 1;
      await delay(randomDelay);
      const task: Task = await scrapeService.scrapeTaskInfo(taskLink);
      console.log("scraped task:");
      console.log(task);
    }
  }
  await browser.close();
})();
