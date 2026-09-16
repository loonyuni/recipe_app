// Headless smoke test: load app.js in a stub DOM and exercise the main paths so
// reference errors / render-path bugs fail CI without a browser.
// Run: node scripts/smoke.js [path-to-app.js]  (default: app.js)
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const appPath = process.argv[2] || path.join(__dirname, "..", "app.js");

function makeEl() {
  const el = {
    _html: "", _text: "", hidden: false, value: "", disabled: false,
    dataset: {}, style: {},
    classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
    setAttribute() {}, getAttribute() { return null; },
    addEventListener() {}, removeEventListener() {},
    appendChild() {}, removeChild() {}, remove() {}, select() {}, focus() {}, blur() {},
    getBoundingClientRect() { return { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 }; },
    contains() { return false; }, closest() { return null; },
    querySelector() { return makeEl(); }, querySelectorAll() { return []; },
    get firstChild() { return makeEl(); }, get parentNode() { return makeEl(); },
  };
  Object.defineProperty(el, "innerHTML", { get() { return this._html; }, set(v) { this._html = String(v); } });
  Object.defineProperty(el, "textContent", { get() { return this._text; }, set(v) { this._text = String(v); } });
  Object.defineProperty(el, "files", { get() { return []; } });
  return el;
}

const store = {};
const localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};

const sandbox = {
  window: {
    location: { href: "http://localhost/", search: "", hash: "", pathname: "/" },
    history: { pushState() {}, replaceState() {} },
    addEventListener() {}, localStorage, matchMedia: () => ({ matches: false, addEventListener() {} }),
    scrollTo() {}, KITCHEN_ARCHIVE_SUPABASE: undefined, supabase: undefined,
  },
  document: { querySelector: () => makeEl(), querySelectorAll: () => [], createElement: () => makeEl(), addEventListener() {}, body: makeEl() },
  localStorage,
  navigator: { clipboard: { writeText: async () => {} }, share: undefined, serviceWorker: undefined },
  console,
  setTimeout: (fn) => { try { fn(); } catch (e) {} return 0; },
  clearTimeout() {},
  URLSearchParams, URL, FormData: class { get() { return ""; } }, Date, Math, JSON,
  fetch: async () => ({ ok: false, json: async () => ([]) }),
};
sandbox.globalThis = sandbox; sandbox.self = sandbox;
vm.createContext(sandbox);

const code = fs.readFileSync(appPath, "utf8");
const exercise = `
;(function () {
  const first = state.recipes[0];
  showRecipe(first.id, { updateUrl: false });
  if (state.mode !== "detail") throw new Error("showRecipe did not enter detail mode");
  showList();
  if (state.mode !== "list") throw new Error("showList did not return to list mode");
  for (const v of ["library","recent","pastry"]) { state.view = v; filteredRecipes(); }
  state.view = "library";
  for (const s of ["recent","rating","mostcooked","title","time"]) { state.sort = s; filteredRecipes(); }
  state.minRating = 4.5; filteredRecipes(); state.minRating = 0;
  renderRecentlyViewed(); relatedRecipes(first); cookCountLabel(first);
})();
`;
try {
  vm.runInContext(code + exercise, sandbox, { filename: "app.js" });
  console.log("SMOKE OK");
} catch (e) {
  console.error("SMOKE FAIL:", e && e.stack ? e.stack.split("\n").slice(0, 6).join("\n") : e);
  process.exit(1);
}
