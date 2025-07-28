import { ScrapeService } from "./sevices/ScrapeService";
import { delay } from "./util";
import type { Task } from "./types";
import puppeteer from "puppeteer";

const testLink = "https://atcoder.jp/contests/abc416/tasks";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  const scrapeService = new ScrapeService(browser, page);

  const links = await scrapeService.getTaskLinks(testLink);
  console.log(`crapingl inks from: ${testLink}`);
  console.log(links);

  for (const link of links) {
    const task: Task = await scrapeService.scrapeTaskInfo(link);
    console.log(`scraped task from :${link}`);
    console.log(task);
  }
})();
