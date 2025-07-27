import { JSDOM } from "jsdom";
export function cleanKatexFromHTML(html: string): DocumentFragment {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const katexElements = doc.querySelectorAll(".katex");

  katexElements.forEach((katexEl) => {
    const annotation = katexEl.querySelector(
      'annotation[encoding="application/x-tex"]',
    );

    if (annotation && annotation.textContent) {
      const latex = annotation.textContent.trim();
      const latexText = doc.createTextNode(`$${latex}$`);
      katexEl.parentNode?.replaceChild(latexText, katexEl);
    } else {
      katexEl.remove();
    }
  });

  // Create a DocumentFragment and append all children from the body to it
  const fragment = doc.createDocumentFragment();
  while (doc.body.firstChild) {
    fragment.appendChild(doc.body.firstChild);
  }

  return fragment;
}
