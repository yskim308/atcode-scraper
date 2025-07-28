import readlineSync from "readline-sync";
import { ScrapeService } from "./sevices/ScrapeService";
import type { Task } from "./types";

const taskLink = readlineSync.question("enter task link\n");

import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  const scrapeService = new ScrapeService(browser, page);

  const task: Task = await scrapeService.scrapeTaskInfo(taskLink);
  browser.close();
})();
