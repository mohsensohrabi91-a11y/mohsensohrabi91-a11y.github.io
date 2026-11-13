// Khordad Online — breaking news site.
// News comes from news.json (newest first). Refreshes every 60 seconds.
const REFRESH_MS = 60 * 1000;

function faNum(s) {
  return String(s).replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

function renderDate() {
  try {
    const fmt = new Intl.DateTimeFormat("fa-IR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      timeZone: "Asia/Tehran",
    });
    document.getElementById("jalali-date").textContent = fmt.format(new Date());
  } catch (e) { /* ignore */ }
}

function timeLabel(iso) {
  try {
    const d = new Date(iso);
    const fmt = new Intl.DateTimeFormat("fa-IR", {
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tehran",
    });
    return fmt.format(d);
  } catch (e) { return ""; }
}

function cardHTML(item, hero) {
  const link = item.link || "#";
  const time = item.time ? `<span class="time">🕐 ${timeLabel(item.time)}</span>` : "";
  const summary = item.summary ? `<p>${item.summary}</p>` : "";
  if (hero) {
    return `<a class="hero-card" href="${link}" target="_blank" rel="noopener">
      <span class="hero-tag">خبر فوری</span>
      <h1>${item.title}</h1>
      ${summary}
      ${time}
    </a>`;
  }
  const tag = item.breaking ? `<span class="tag">فوری</span>` : "";
  return `<a class="news-item" href="${link}" target="_blank" rel="noopener">
    <h3>${tag}${item.title}</h3>
    ${summary}
    ${time}
  </a>`;
}

async function loadNews() {
  try {
    const res = await fetch("news.json?t=" + Date.now());
    const items = await res.json();
    if (!Array.isArray(items) || !items.length) return;

    const heroItem = items.find(i => i.breaking) || items[0];
    const rest = items.filter(i => i !== heroItem);

    document.getElementById("hero").innerHTML = cardHTML(heroItem, true);
    document.getElementById("news-list").innerHTML =
      rest.map(i => cardHTML(i, false)).join("");
    document.getElementById("ticker").textContent = heroItem.title;

    const now = new Intl.DateTimeFormat("fa-IR", {
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tehran",
    }).format(new Date());
    document.getElementById("updated-at").textContent = now;
  } catch (e) {
    console.error("news load failed", e);
  }
}

renderDate();
loadNews();
setInterval(loadNews, REFRESH_MS);
