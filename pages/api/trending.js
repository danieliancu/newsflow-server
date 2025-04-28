// pages/api/trending.js

import mysql from "mysql2/promise";
import puppeteer from "puppeteer";
import cron from "node-cron";

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

function normalizeText(text) {
  return text.toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9 ]/gi, '');
}

function matchesTrend(keyword, articleText) {
  const stopWords = [
    "2023", "2024", "2025", "luni", "marti", "miercuri", "joi", "vineri", "sambata", "duminica",
    "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august",
    "septembrie", "octombrie", "noiembrie", "decembrie", "zi", "an", "ani", "azi", "maine", "ieri"
  ];

  const words = normalizeText(keyword)
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word));

  const textWords = normalizeText(articleText).split(/\s+/);

  return words.every(word => textWords.includes(word));
}





async function getTrendingMatches() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('https://trends.google.com/trending?geo=RO', {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });

  await page.waitForSelector('div.mZ3RIc', { timeout: 15000 }).catch(() => null);

  let keywords = await page.evaluate(() =>
    Array.from(document.querySelectorAll('div.mZ3RIc'))
      .map(el => el.textContent.trim())
      .filter(Boolean)
  );

  await browser.close();

  // 🔥 Aplicăm noul filtru
  keywords = keywords.filter(keyword => {
    const words = keyword.split(/\s+/);
    if (words.length > 2) {
      // Dacă toate cuvintele sunt de maxim 2 litere, ignorăm
      const allShort = words.every(word => word.length <= 2);
      if (allShort) {
        console.log(`⚠️ Ignorat keyword '${keyword}' (toate cuvintele prea scurte)`);
        return false;
      }
    }
    return true;
  });

  const response = await fetch('https://www.newsflow.ro/api/articles');
  const news = (await response.json()).data || [];

  const matches = [];

  for (const keyword of keywords) {
    const matchedArticles = news.filter(article =>
      matchesTrend(keyword, article.text + ' ' + article.intro)
    );

    if (matchedArticles.length > 0) {
      const firstMatch = matchedArticles[0];
      const relatedMatches = matchedArticles.slice(1);

      matches.push({
        keyword,
        article: {
          id: firstMatch.id,
          text: firstMatch.text,
          intro: firstMatch.intro,
          href: firstMatch.href,
          imgSrc: firstMatch.imgSrc,
          source: firstMatch.source,
          label: firstMatch.label,
          cat: firstMatch.cat,
          date: firstMatch.date,
        },
        related: relatedMatches.map(article => ({
          id: article.id,
          text: article.text,
          intro: article.intro,
          href: article.href,
          imgSrc: article.imgSrc,
          source: article.source,
          label: article.label,
          cat: article.cat,
          date: article.date,
        }))
      });

      console.log(`✅ Găsit 1 principal și ${relatedMatches.length} articole suplimentare pentru '${keyword}'`);
    } else {
      console.log(`❌ Niciun articol găsit pentru '${keyword}'`);
    }
  }

  return { matches };
}






export default async function handler(req, res) {
  try {
    console.log('🟡 Pornim trending scraping...');

    const { matches } = await getTrendingMatches();

    // Ștergem tot înainte de inserare
    await pool.query("DELETE FROM trends_related");
    await pool.query("DELETE FROM trends");

    for (const { keyword, article, related } of matches) {
      const [result] = await pool.query(
        `INSERT INTO trends (article_id, keyword, date) VALUES (?, ?, ?)`,
        [article.id, keyword, new Date(article.date)]
      );

      const trendsId = result.insertId;

      if (related.length > 0) {
        const relatedValues = related.map(r => [
          trendsId,
          r.id,
          r.text,
          r.intro,
          r.href,
          r.imgSrc,
          r.source,
          r.label,
          r.cat,
          new Date(r.date)
        ]);

        const placeholders = relatedValues.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
        await pool.query(
          `INSERT INTO trends_related (trends_id, article_id, text, intro, href, imgSrc, source, label, cat, date) VALUES ${placeholders}`,
          relatedValues.flat()
        );
      }
    }

    console.log(`🟢 Trending scraping completat. ${matches.length} keywords procesate.`);
    res.status(200).json({
      success: true,
      inserted_keywords: matches.length,
    });

  } catch (error) {
    console.error('🔴 Eroare trending:', error);
    res.status(500).json({ error: error.toString() });
  }
}

// 👉 Pornim CRON JOB la fiecare 5 minute
cron.schedule('*/5 * * * *', async () => {
  console.log('🔵 Cron trending pornit...');
  const req = {};
  const res = {
    status: (code) => ({
      json: (data) => console.log(`🔵 Cron trending status ${code}`, data),
    }),
  };
  await handler(req, res);
});
