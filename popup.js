const rateListEl = document.getElementById("rate-list");
const updatedEl = document.getElementById("updated-time");
const refreshBtn = document.getElementById("refresh");
const btnLabel = refreshBtn.querySelector(".btn-label");

const CURRENCY_NAMES = {
  KZT: "Тенге", USD: "Доллар", EUR: "Евро", GBP: "Фунт", TRY: "Лира",
  UAH: "Гривна", PLN: "Злотый", CNY: "Юань", INR: "Рупия", BRL: "Реал",
  JPY: "Иена", KRW: "Вона", CHF: "Франк", CAD: "Канад. $", AUD: "Австрал. $",
  MXN: "Песо", SGD: "Сингапур $", HKD: "Гонконг $", TWD: "Тайвань $", THB: "Бат",
};

const DISPLAY_ORDER = [
  "KZT", "USD", "EUR", "GBP", "TRY", "UAH", "PLN", "CNY", "INR", "BRL",
  "KRW", "CHF", "CAD", "AUD", "MXN", "SGD", "HKD", "TWD", "THB",
];

function renderRates(rates) {
  rateListEl.innerHTML = "";

  const available = DISPLAY_ORDER.filter((code) => rates[code]);

  if (available.length === 0) {
    rateListEl.innerHTML = '<div class="loading">Нет данных о курсах</div>';
    return;
  }

  for (const code of available) {
    const rate = rates[code];
    const name = CURRENCY_NAMES[code] || code;

    const item = document.createElement("div");
    item.className = "rate-item";

    const left = document.createElement("span");
    left.className = "rate-item-code";
    left.textContent = `1 ${code}`;

    const right = document.createElement("span");
    right.className = "rate-item-value";
    right.textContent = `${rate.toFixed(2)} \u20BD`;

    const eqLabel = document.createElement("span");
    eqLabel.className = "rate-item-eq";
    eqLabel.textContent = name;

    item.appendChild(left);
    item.appendChild(eqLabel);
    item.appendChild(right);
    rateListEl.appendChild(item);
  }
}

async function loadRates() {
  const result = await chrome.storage.local.get(["rates", "timestamp"]);

  if (result.rates) {
    renderRates(result.rates);
    if (result.timestamp) {
      const time = new Date(result.timestamp);
      updatedEl.textContent =
        "Обновлено: " + time.toLocaleString("ru-RU", {
          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
        });
    }
  } else {
    rateListEl.innerHTML = '<div class="loading">Нет данных</div>';
    updatedEl.textContent = "";
  }
}

refreshBtn.addEventListener("click", async () => {
  refreshBtn.disabled = true;
  btnLabel.textContent = "Обновление\u2026";

  try {
    await chrome.runtime.sendMessage({ type: "refreshRates" });
    await loadRates();
    btnLabel.textContent = "Готово!";
  } catch (e) {
    btnLabel.textContent = "Ошибка";
  }

  setTimeout(() => {
    btnLabel.textContent = "Обновить курсы";
    refreshBtn.disabled = false;
  }, 1500);
});

loadRates();
