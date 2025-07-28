import puppeteer from "puppeteer";
import { ScrapeService } from "./sevices/ScrapeService";
import { delay } from "./util";
import type { Task } from "./types";
import { mongoService } from "./sevices/MongoService";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage(); // THIS IS THE KEY PART
  page.on("console", (msg) => {
    for (let i = 0; i < msg.args().length; ++i)
      console.log(`${i}: ${msg.args()[i]}`);
  });
  const scrapeService = new ScrapeService(browser, page);

  for (let i = 234; i <= 416; ++i) {
    // getting task links
    let contestNumber: string = i < 100 ? `0${i}` : `${i}`;
    const contestLink = `https://atcoder.jp/contests/abc${contestNumber}/tasks`;
    const links = await scrapeService.getTaskLinks(contestLink);
    console.log(`scraping links from: ${contestLink}`);

    // scraping each task
    for (const link of links) {
      // delay between 1 and 5 seconds randomly
      const delayInSeconds = Math.floor(Math.random() * 5) + 1;
      await delay(delayInSeconds);
      const task: Task = await scrapeService.scrapeTaskInfo(link);
      console.log(`scraped ${task.id}, trying to insert...`);
      mongoService.insertTask(task);
    }
  }
  await browser.close();
  mongoService.disconnect();
})();
