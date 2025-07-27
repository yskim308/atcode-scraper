import type { Page, Browser } from "puppeteer";
import type { Task } from "../types";

export class ScrapeService {
  private browser: Browser;
  private page: Page;
  constructor(browser: Browser, page: Page) {
    this.browser = browser;
    this.page = page;
  }

  async getTaskLinks(taskPageURL: string): Promise<string[]> {
    await this.page.goto(taskPageURL);
    const links = await this.page.$$eval(
      "table.table tbody tr td:first-child a",
      (anchors) => anchors.map((a) => a.href),
    );
    return links;
  }

  async scrapeTaskInfo(taskURL: string): Promise<Task> {
    await this.page.goto(taskURL);
    // get id from url
    const urlObject = new URL(taskURL);
    const pathParts = urlObject.pathname.split("/");
    const id = pathParts[pathParts.length - 1];
    const url = taskURL;

    const score = await this.page.$eval(
      ".lang-en > p:nth-child(1) > var:nth-child(1) > span:nth-child(1) > span:nth-child(1) > span:nth-child(1) > math:nth-child(1) > semantics:nth-child(1) > annotation:nth-child(2)",
      (element) => element.textContent,
    );
  }
}
