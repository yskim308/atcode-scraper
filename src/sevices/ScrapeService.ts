import type { Page, Browser } from "puppeteer";
import type { Task, Sample } from "../types";
import { JSDOM } from "jsdom";
import { cleanKatexFromHTML } from "../util";}

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

  getFormattedText(sections: HTMLSelectElement[], headerText: string) {
    const targetSection = sections.find((section) => {
      section.querySelector('h3')?.innerText === headerText;
    })
    if (!targetSection) {
      throw new Error(`header text ${headerText} could not be found`);
    }
    targetSection?.querySelector('h3')?.remove();
    return cleanKatexFromHTML(targetSection?.innerHTML);
  }

  async getSamples(): Promise<Sample[]> {
    const samples = await this.page.evaluate(() => {
      const pairs: Sample[] = [];
      const sections = Array.from(document.querySelectorAll("section"));

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
    return samples;
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

    const scoreSelector = ".lang-en > p:nth-child(1) > var:nth-child(1)";
    const score = await getFormattedText(scoreSelector, this.page);

    const statementSelector = ".lang-en > div:nth-child(2)";
    const statement = await getFormattedText(statementSelector, this.page);

    const constraintsSelector =
      ".lang-en > div:nth-child(3) > section:nth-child(1) > ul:nth-child(2)";
    const constraints = await getFormattedText(constraintsSelector, this.page);

    const inputSelector =
      ".lang-en > div:nth-child(5) > div:nth-child(1) > section:nth-child(1)";
    let input = await getFormattedText(inputSelector, this.page);
    input = input.slice(5);

    const outputSelector =
      ".lang-en > div:nth-child(5) > div:nth-child(2) > section:nth-child(1)";
    let output = await getFormattedText(outputSelector, this.page);
    output = output.slice(6);

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
