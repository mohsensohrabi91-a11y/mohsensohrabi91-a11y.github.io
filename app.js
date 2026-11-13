// خرداد آنلاین — سایت خبری کامل (صفحه اصلی، صفحه خبر، صفحه بخش)
// همهٔ خبرها از news.json می‌آیند (جدیدترین اول). صفحه اصلی هر ۶۰ ثانیه تازه می‌شود.
const CATS = { iran: "ایران", world: "جهان", sport: "ورزش", breaking: "خبر فوری", all: "همهٔ خبرها" };
const REFRESH_MS = 60 * 1000;
let NEWS = [];

function esc(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fmtTime(iso) {
  try {
    return new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tehran" }).format(new Date(iso));
  } catch (e) { return ""; }
}
function fmtDate(iso) {
  try {
    return new Intl.DateTimeFormat("fa-IR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Tehran" }).format(new Date(iso));
  } catch (e) { return ""; }
}
function renderDate() {
  const el = document.getElementById("jalali-date");
  if (el) el.textContent = fmtDate(new Date().toISOString());
}
function artURL(id) { return "article.html?id=" + id; }
function imgTag(item, cls) {
  if (!item.image) return "";
  return `<div class="${cls}"><img src="${esc(item.image)}" alt="" loading="lazy"></div>`;
}
function metaLine(item) {
  return `<div class="meta">${fmtDate(item.time)} — ساعت ${fmtTime(item.time)}</div>`;
}

async function loadNews() {
  const res = await fetch("news.json?t=" + Date.now());
  NEWS = await res.json();
  return NEWS;
}

function breakingBar() {
  const b = NEWS.find(i => i.breaking);
  const bar = document.getElementById("breaking-bar");
  if (!bar) return;
  if (b) {
    bar.style.display = "block";
    const a = document.getElementById("breaking-link");
    a.href = artURL(b.id);
    a.textContent = b.title.replace(/^فوری\s*\|\s*/, "");
  }
}

function cardHTML(item) {
  const tag = item.breaking ? `<span class="breaking-tag">فوری</span>` : "";
  return `<article class="card">
    <a href="${artURL(item.id)}">${imgTag(item, "card-img")}</a>
    <span class="cat-tag">${CATS[item.cat] || ""}</span>
    <h3><a href="${artURL(item.id)}">${tag}${esc(item.title.replace(/^فوری\s*\|\s*/, ""))}</a></h3>
    ${item.summary ? `<p>${esc(item.summary)}</p>` : ""}
    ${metaLine(item)}
  </article>`;
}
function rowHTML(item) {
  const tag = item.breaking ? `<span class="breaking-tag">فوری</span>` : "";
  return `<div class="news-row">
    <a href="${artURL(item.id)}">${imgTag(item, "thumb")}</a>
    <div>
      <span class="cat-tag">${CATS[item.cat] || ""}</span>
      <h3><a href="${artURL(item.id)}">${tag}${esc(item.title.replace(/^فوری\s*\|\s*/, ""))}</a></h3>
      ${item.summary ? `<p>${esc(item.summary)}</p>` : ""}
      ${metaLine(item)}
    </div>
  </div>`;
}

async function renderHome() {
  renderDate();
  await loadNews();
  breakingBar();
  if (!NEWS.length) return;

  const hero = NEWS.find(i => i.breaking) || NEWS[0];
  const rest = NEWS.filter(i => i !== hero);
  document.getElementById("hero").innerHTML = `
    <div class="hero-grid">
      <a href="${artURL(hero.id)}" class="hero-img"><img src="${esc(hero.image)}" alt=""></a>
      <div class="hero-text">
        <span class="cat-tag">${CATS[hero.cat] || ""}</span>
        <h1><a href="${artURL(hero.id)}">${hero.breaking ? `<span class="breaking-tag">فوری</span>` : ""}${esc(hero.title.replace(/^فوری\s*\|\s*/, ""))}</a></h1>
        ${hero.summary ? `<p>${esc(hero.summary)}</p>` : ""}
        ${metaLine(hero)}
      </div>
    </div>`;

  document.getElementById("sub-grid").innerHTML = rest.slice(0, 3).map(cardHTML).join("");
  document.getElementById("latest-list").innerHTML = rest.slice(3, 11).map(rowHTML).join("");

  const top = NEWS.slice(0, 5);
  document.getElementById("top-list").innerHTML = top.map((it, idx) => `
    <div class="side-item"><a href="${artURL(it.id)}"><span class="rank">${idx + 1}</span>${esc(it.title.replace(/^فوری\s*\|\s*/, ""))}</a>
    <span class="time">${fmtTime(it.time)}</span></div>`).join("");

  for (const cat of ["iran", "world", "sport"]) {
    const items = NEWS.filter(i => i.cat === cat).slice(0, 3);
    const el = document.getElementById("block-" + cat);
    if (!items.length || !el) { if (el) el.style.display = "none"; continue; }
    el.innerHTML = `<div class="section-head"><h2>${CATS[cat]}</h2><a href="section.html?cat=${cat}">همهٔ خبرهای ${CATS[cat]} ←</a></div>
      <div class="cards">${items.map(cardHTML).join("")}</div>`;
  }

  document.getElementById("updated-at").textContent =
    new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tehran" }).format(new Date());
  setInterval(async () => { await loadNews(); breakingBar(); }, REFRESH_MS);
}

async function renderArticle() {
  renderDate();
  const id = Number(new URLSearchParams(location.search).get("id"));
  await loadNews();
  const item = NEWS.find(i => i.id === id);
  const el = document.getElementById("article");
  if (!item) {
    el.innerHTML = `<p style="padding:40px 0">این خبر پیدا نشد. <a href="index.html" style="color:#bb1919">بازگشت به صفحه اصلی ←</a></p>`;
    return;
  }
  document.title = item.title.replace(/^فوری\s*\|\s*/, "") + " | خرداد آنلاین";
  const body = (item.body && item.body.length ? item.body : [item.summary]).filter(Boolean);
  const related = NEWS.filter(i => i.cat === item.cat && i.id !== item.id).slice(0, 3);
  el.innerHTML = `
    <nav class="breadcrumb"><a href="index.html">صفحه اصلی</a> / <a href="section.html?cat=${item.cat}">${CATS[item.cat] || ""}</a></nav>
    <article class="article">
      <span class="cat-tag">${CATS[item.cat] || ""}</span>
      <h1>${item.breaking ? `<span class="breaking-tag">فوری</span>` : ""}${esc(item.title.replace(/^فوری\s*\|\s*/, ""))}</h1>
      ${item.summary ? `<p class="lede">${esc(item.summary)}</p>` : ""}
      <div class="article-meta"><span>خرداد آنلاین</span><span>${fmtDate(item.time)}</span><span>ساعت ${fmtTime(item.time)}</span></div>
      ${item.image ? `<figure class="article-hero"><img src="${esc(item.image)}" alt=""><figcaption>خرداد آنلاین</figcaption></figure>` : ""}
      <div class="article-body">${body.map(p => `<p>${esc(p)}</p>`).join("")}</div>
      <div class="article-share"><span>اشتراک‌گذاری:</span>
        <a href="${esc(item.link)}" target="_blank" rel="noopener">مشاهده در تلگرام ↗</a>
        <a href="https://t.me/share/url?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(item.title)}" target="_blank" rel="noopener">ارسال در تلگرام</a>
      </div>
      ${related.length ? `<div class="related"><h2>خبرهای مرتبط</h2><div class="sub-grid">${related.map(cardHTML).join("")}</div></div>` : ""}
    </article>`;
}

async function renderSection() {
  renderDate();
  const cat = new URLSearchParams(location.search).get("cat") || "all";
  document.querySelectorAll(".main-nav a[data-cat]").forEach(a => {
    if (a.dataset.cat === cat) a.classList.add("active");
  });
  await loadNews();
  let items, title, desc;
  if (cat === "breaking") {
    items = NEWS.filter(i => i.breaking);
    title = "خبر فوری"; desc = "مهم‌ترین خبرهای فوری لحظه‌ای — تازه‌ترین‌ها در صدر.";
  } else if (cat === "all") {
    items = NEWS;
    title = "همهٔ خبرها"; desc = "آرشیو خبرهای امروز خرداد آنلاین.";
  } else {
    items = NEWS.filter(i => i.cat === cat);
    title = CATS[cat] || "خبرها"; desc = `آخرین خبرهای بخش ${CATS[cat] || ""}.`;
  }
  document.title = title + " | خرداد آنلاین";
  const el = document.getElementById("section");
  el.innerHTML = `<h1 class="section-title">${title}</h1><p class="section-desc">${desc}</p>
    ${items.length ? items.map(rowHTML).join("") : "<p style='padding:30px 0'>در این بخش هنوز خبری منتشر نشده است.</p>"}`;
}
