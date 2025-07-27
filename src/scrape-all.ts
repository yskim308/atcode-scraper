import puppeteer from "puppeteer";
import { ScrapeService } from "./sevices/ScrapeService";
import type { Task } from "./types";

const testLink = "https://atcoder.jp/contests/abc416/tasks";
const taskLink = "https://atcoder.jp/contests/abc416/tasks/abc416_f";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const scrapeService = new ScrapeService(browser, page);
  const links = await scrapeService.getTaskLinks(testLink);
  console.log(links);

  const task: Task = await scrapeService.scrapeTaskInfo(taskLink);
  console.log(task);
  await browser.close();
})();
