// pages/api/trending.js

import mysql from "mysql2/promise";
import puppeteer from "puppeteer";
import cron from "node-cron"; // 👈 adăugăm aici cron-ul direct

// 🔥 fetch există nativ în Next.js

// Configurare pool MySQL
const pool = mysql.createPool({
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  port: process.env.MYSQL_ADDON_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Normalizează text: fără diacritice, doar caractere simple
function normalizeText(text) {
  return text.toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9 ]/gi, '');
}

// Verificare dacă toate cuvintele din keyword apar întregi în articol
function matchesTrend(keyword, articleText) {
  const stopWords = ["2023", "2024", "2025", "luni", "marti", "miercuri", "joi", "vineri", "sambata", "duminica",
    "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie",
    "octombrie", "noiembrie", "decembrie", "zi", "an", "ani", "azi", "maine", "ieri"];

  const words = normalizeText(keyword)
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word));

  const textWords = normalizeText(articleText).split(/\s+/);

  return words.every(word => textWords.includes(word));
}

// Scraping Google Trends și asociere cu articole
async function getTrendingMatches() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  await page.goto('https://trends.google.com/trending?geo=RO&sort=search-volume', {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });

  await page.waitForSelector('div.mZ3RIc', { timeout: 15000 }).catch(() => null);

  const keywords = await page.evaluate(() =>
    Array.from(document.querySelectorAll('div.mZ3RIc')).map(el => el.textContent.trim()).filter(Boolean)
  );

  await browser.close();

  const response = await fetch('https://www.newsflow.ro/api/articles');
  const news = (await response.json()).data || [];

  const matches = [];

  for (const keyword of keywords) {
    const match = news.find(article => matchesTrend(keyword, article.text + ' ' + article.intro));
    if (match) {
      matches.push({ keyword, article: { id: match.id } });
      console.log(`✅ Găsit match pentru '${keyword}' -> articol ID ${match.id}`);
    } else {
      console.log(`❌ Niciun match pentru '${keyword}'`);
    }
  }

  return { matches };
}

// 👉 API handler
export default async function handler(req, res) {
  try {
    console.log('🟡 Pornim trending scraping...');

    const { matches } = await getTrendingMatches();

    const seenArticleIds = new Set();
    const uniqueMatches = matches.filter(({ article }) => {
      if (seenArticleIds.has(article.id)) {
        return false;
      }
      seenArticleIds.add(article.id);
      return true;
    });

    await pool.query("DELETE FROM trends");

    for (const { keyword, article } of uniqueMatches) {
      await pool.query(
        "INSERT INTO trends (article_id, keyword) VALUES (?, ?)",
        [article.id, keyword]
      );
    }

    console.log(`🟢 Trending scraping completat. ${uniqueMatches.length} trenduri salvate.`);
    res.status(200).json({
      success: true,
      inserted: uniqueMatches.length,
      keywords: uniqueMatches.map(m => m.keyword)
    });
  } catch (error) {
    console.error('🔴 Eroare trending:', error);
    res.status(500).json({ error: error.toString() });
  }
}

// 👉 Adăugăm CRON JOB la fiecare 5 minute
cron.schedule('*/5 * * * *', async () => {
  console.log('🔵 Cron trending pornit...');
  const req = {}; // simulăm request
  const res = {
    status: (code) => ({
      json: (data) => console.log(`🔵 Cron trending status ${code}`, data)
    })
  };
  await handler(req, res);
});
