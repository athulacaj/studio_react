const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<!DOCTYPE html><html><head><title>My Title</title></head><body></body></html>`);
const titleEl = dom.window.document.querySelector('title');
console.log("innerText:", titleEl.innerText);
console.log("textContent:", titleEl.textContent);
