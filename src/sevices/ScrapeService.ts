import type { Page, Browser } from "puppeteer";
import type { Task } from "./types";
import { JSDOM } from "jsdom";

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

  cleanKatexFromHTML(html: string): string {
    // Create a temporary DOM parser
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    // Find all KaTeX elements
    const katexElements = doc.querySelectorAll(".katex");

    katexElements.forEach((katexEl) => {
      // Get the LaTeX source from the annotation
      const annotation = katexEl.querySelector(
        'annotation[encoding="application/x-tex"]',
      );

      if (annotation && annotation.textContent) {
        const latex = annotation.textContent.trim();

        // Create a text node with dollar-wrapped LaTeX
        const latexText = doc.createTextNode(`$${latex}$`);

        // Replace the entire KaTeX element with the LaTeX text
        katexEl.parentNode?.replaceChild(latexText, katexEl);
      } else {
        // If no annotation found, just remove the KaTeX element
        katexEl.remove();
      }
    });
    return doc.body.innerHTML;
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
