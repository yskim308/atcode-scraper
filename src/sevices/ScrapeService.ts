import type { Page, Browser } from "puppeteer";
import type { Task, Sample } from "../types";
import { cleanKatexFromHTML } from "../util";

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

  async getFormattedText(headerText: string) {
    // get the contents of the target section
    const result = await this.page.evaluate((headerText) => {
      const sections = document.querySelectorAll("section");
      const targetSection = Array.from(sections).find((section) => {
        return section.querySelector("h3")?.innerText === headerText;
      });
      if (!targetSection) {
        throw new Error(`header text ${headerText} could not be found`);
      }
      targetSection.querySelector("h3")?.remove();
      return targetSection;
    }, headerText);

    // clean up latet and return text content
    const cleanHTML = cleanKatexFromHTML(result.innerHTML);
    const textContent = cleanHTML.textContent;
    if (!textContent) {
      throw new Error(`no text content in ${headerText}`);
    }
    return textContent;
  }

  async getSamples(): Promise<Sample[]> {
    return await this.page.evaluate(() => {
      const pairs: Sample[] = [];

      const sections = document.querySelectorAll("sections");
      let lastLabel = "";
      let lastContent = "";
      for (const section of sections) {
        const h3 = section.querySelector("h3");
        const pre = section.querySelector("pre");
        if (!h3 || !pre) continue;

        const label = h3.textContent?.trim().toLowerCase() ?? "";
        const content = pre.textContent?.trim() ?? "";

        if (label.includes("sample input")) {
          lastLabel = label;
          lastContent = content;
        } else if (label.includes("sample output")) {
          pairs.push({
            input: lastContent,
            output: content,
          });
          lastLabel = "";
          lastContent = "";
        }
      }
      return pairs;
    });
  }

  async scrapeTaskInfo(taskURL: string): Promise<Task> {
    await this.page.goto(taskURL);
    // get id from url
    const urlObject = new URL(taskURL);
    const pathParts = urlObject.pathname.split("/");
    const id = pathParts[pathParts.length - 1];
    const url = taskURL;

    const taskNameSelector =
      "html body div#main-div.float-container div#main-container.container div.row div.col-sm-12 span.h2";
    const taskName = await this.page.$eval(taskNameSelector, (element) => {
      const anchor = element.querySelector("a");
      anchor?.remove();
      return element.textContent as string;
    });

    const sections: HTMLElement[] = await this.page.$$eval(
      "section",
      (sections) => {
        return sections;
      },
    );

    let score = await this.getFormattedText("Score");
    score = score.slice(1, -1); // dont want latext on score
    const statement = await this.getFormattedText("Problem Statement");
    const constraints = await this.getFormattedText("Constraints");
    let input = await this.getFormattedText("Input");
    let output = await this.getFormattedText("Output");

    const samples = await this.getSamples();
    return {
      id,
      url,
      taskName,
      score,
      statement,
      constraints,
      input,
      output,
      samples,
    };
  }
}
