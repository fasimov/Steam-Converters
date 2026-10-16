(function () {
  "use strict";

  let rates = null;
  let debounceTimer = null;
  const processed = new WeakSet();
  const RUBLE = "\u20BD";

  const CURRENCIES = [
    // Prefixed dollar patterns must come BEFORE plain USD to avoid false matches
    { code: "MXN", patterns: [/MX\$\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*MX\$/] },
    { code: "HKD", patterns: [/HK\$\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*HK\$/] },
    { code: "TWD", patterns: [/NT\$\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*NT\$/] },
    { code: "SGD", patterns: [/S\$\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*S\$/] },
    { code: "BRL", patterns: [/R\$\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*R\$/] },
    { code: "AUD", patterns: [/A\$\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*A\$/] },
    { code: "CAD", patterns: [/C\$\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*C\$/] },
    // USD uses negative lookbehind/lookahead to avoid matching prefixed dollar symbols
    { code: "USD", patterns: [/(?<![A-Za-z])\$\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\$(?![A-Za-z])/] },
    { code: "KZT", patterns: [/\u20B8\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u20B8/] },
    { code: "EUR", patterns: [/\u20AC\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u20AC/] },
    { code: "GBP", patterns: [/\u00A3\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u00A3/] },
    { code: "TRY", patterns: [/\u20BA\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u20BA/] },
    { code: "UAH", patterns: [/\u20B4\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u20B4/] },
    { code: "PLN", patterns: [/([\d][\d\s,.]*)\s*z\u0142/i] },
    { code: "CNY", patterns: [/\u00A5\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u00A5/] },
    { code: "INR", patterns: [/\u20B9\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u20B9/] },
    { code: "KRW", patterns: [/\u20A9\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u20A9/] },
    { code: "CHF", patterns: [/Fr\.?\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*Fr\b/i] },
    { code: "THB", patterns: [/\u0E3F\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u0E3F/] },
  ];

  const ALL_SYMBOLS = [
    "\u20B8", "$", "\u20AC", "\u00A3", "\u20BA", "\u20B4", "\u0142",
    "\u00A5", "\u20B9", "R$", "\u20A9", "Fr", "C$", "A$", "MX$",
    "S$", "HK$", "NT$", "\u0E3F",
  ];

  function textContainsCurrency(text) {
    for (const sym of ALL_SYMBOLS) {
      if (text.includes(sym)) return true;
    }
    return false;
  }

  function getRates() {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage({ type: "getRates" }, (response) => {
          resolve(response);
        });
      } catch (e) {
        resolve(null);
      }
    });
  }

  function parseAmount(text) {
    for (const currency of CURRENCIES) {
      for (const pattern of currency.patterns) {
        const match = text.match(pattern);
        if (!match) continue;

        let numStr = match[1].trim().replace(/[\s]/g, "");
        numStr = numStr.replace(/,(?=\d{3}\b)/g, "");
        numStr = numStr.replace(",", ".");
        const num = parseFloat(numStr);
        if (!isNaN(num) && num > 0) {
          return { amount: num, code: currency.code };
        }
      }
    }
    return null;
  }

  function formatRub(amount) {
    const rounded = Math.round(amount);
    return rounded.toLocaleString("ru-RU") + "\u00A0" + RUBLE;
  }

  function processTextNode(textNode) {
    if (processed.has(textNode)) return;

    const text = textNode.nodeValue;
    if (!text || !textContainsCurrency(text)) return;

    processed.add(textNode);

    const result = parseAmount(text);
    if (!result) return;

    const rate = rates[result.code];
    if (!rate) return;

    const rubAmount = result.amount * rate;
    const rubText = formatRub(rubAmount);

    const span = document.createElement("span");
    span.className = "cur-rub-converted";
    span.textContent = rubText;
    span.title = result.amount.toLocaleString("ru-RU") + "\u00A0" + result.code;

    if (textNode.parentNode) {
      textNode.parentNode.insertBefore(span, textNode.nextSibling);
    }
  }

  function scanPage(root) {
    if (!rates) return;

    const container = root || document.body;
    if (!container) return;

    if (container.classList && container.classList.contains("cur-rub-converted"))
      return;

    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (processed.has(node)) return NodeFilter.FILTER_REJECT;
          if (!node.nodeValue || !textContainsCurrency(node.nodeValue))
            return NodeFilter.FILTER_REJECT;

          let parent = node.parentNode;
          while (parent) {
            if (parent.classList && parent.classList.contains("cur-rub-converted"))
              return NodeFilter.FILTER_REJECT;
            parent = parent.parentNode;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      nodes.push(node);
    }
    nodes.forEach(processTextNode);
  }

  function debouncedScan() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => scanPage(), 300);
  }

  function startObserver() {
    const observer = new MutationObserver((mutations) => {
      if (!rates) return;
      let shouldScan = false;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
            shouldScan = true;
            break;
          }
        }
        if (shouldScan) break;
      }
      if (shouldScan) debouncedScan();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  async function init() {
    try {
      const response = await getRates();
      if (response && response.rates) {
        rates = response.rates;
        scanPage();
        startObserver();
      }
    } catch (e) {
      console.error("Steam Conv: initialization failed", e);
    }
  }

  init();
})();
