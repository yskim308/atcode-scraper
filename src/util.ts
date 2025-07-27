import { JSDOM } from "jsdom";
export function cleanKatexFromHTML(html: string): string {
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
