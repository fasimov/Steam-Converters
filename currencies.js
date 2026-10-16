/*
 * Currency definitions for Steam price converter.
 * Maps currency symbols and codes to ISO 4217 codes and their RUB rate key.
 * The rate for each currency is fetched as: 1 unit of currency = X RUB.
 *
 * IMPORTANT: Prefixed dollar currencies (MX$, HK$, NT$, S$, R$, A$, C$)
 * must appear BEFORE plain USD so the parser matches the specific symbol first.
 * USD uses negative lookbehind/lookahead to avoid matching prefixed dollar symbols.
 */

const CURRENCIES = [
  // Prefixed dollar currencies — checked before USD
  { code: "MXN", symbol: "MX$", name: "Мексиканский песо",        patterns: [/MX\$\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*MX\$/] },
  { code: "HKD", symbol: "HK$", name: "Гонконгский доллар",       patterns: [/HK\$\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*HK\$/] },
  { code: "TWD", symbol: "NT$", name: "Тайваньский доллар",       patterns: [/NT\$\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*NT\$/] },
  { code: "SGD", symbol: "S$",  name: "Сингапурский доллар",      patterns: [/S\$\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*S\$/] },
  { code: "BRL", symbol: "R$",  name: "Бразильский реал",         patterns: [/R\$\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*R\$/] },
  { code: "AUD", symbol: "A$",  name: "Австралийский доллар",     patterns: [/A\$\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*A\$/] },
  { code: "CAD", symbol: "C$",  name: "Канадский доллар",         patterns: [/C\$\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*C\$/] },
  // USD — excludes prefixed dollar symbols via lookbehind/lookahead
  { code: "USD", symbol: "$",   name: "Доллар США",               patterns: [/(?<![A-Za-z])\$\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\$(?![A-Za-z])/] },
  // Unique symbol currencies
  { code: "KZT", symbol: "\u20B8", name: "Казахстанский тенге",    patterns: [/\u20B8\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u20B8/] },
  { code: "EUR", symbol: "\u20AC", name: "Евро",                   patterns: [/\u20AC\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u20AC/] },
  { code: "GBP", symbol: "\u00A3", name: "Фунт стерлингов",        patterns: [/\u00A3\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u00A3/] },
  { code: "TRY", symbol: "\u20BA", name: "Турецкая лира",          patterns: [/\u20BA\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u20BA/] },
  { code: "UAH", symbol: "\u20B4", name: "Украинская гривна",      patterns: [/\u20B4\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u20B4/] },
  { code: "PLN", symbol: "z\u0142", name: "Польский злотый",        patterns: [/([\d][\d\s,.]*)\s*z\u0142/i] },
  { code: "CNY", symbol: "\u00A5", name: "Китайский юань",         patterns: [/\u00A5\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u00A5/] },
  { code: "INR", symbol: "\u20B9", name: "Индийская рупия",         patterns: [/\u20B9\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u20B9/] },
  { code: "KRW", symbol: "\u20A9", name: "Южнокорейская вона",      patterns: [/\u20A9\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u20A9/] },
  { code: "CHF", symbol: "Fr",    name: "Швейцарский франк",       patterns: [/Fr\.?\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*Fr\b/i] },
  { code: "THB", symbol: "\u0E3F", name: "Тайский бат",             patterns: [/\u0E3F\s*([\d][\d\s,.]*)/, /([\d][\d\s,.]*)\s*\u0E3F/] },
  { code: "RUB", symbol: "\u20BD", name: "Российский рубль",        patterns: [] },
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CURRENCIES };
}
