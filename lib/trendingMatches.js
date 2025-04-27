// ✅ lib/trendingMatches.js
import puppeteer from 'puppeteer';

function normalizeText(text) {
  return text.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9 ]/gi, '');
}

function matchesTrend(keyword, articleText) {
  const stopWords = [
    "2023", "2024", "2025", "luni", "marti", "miercuri", "joi", "vineri", "sambata", "duminica",
    "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie",
    "octombrie", "noiembrie", "decembrie", "zi", "an", "ani", "azi", "maine", "ieri"
  ];

  const words = normalizeText(keyword)
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word));

  const text = normalizeText(articleText);

  const sentences = text.split(/[.!?]/);

  for (const sentence of sentences) {
    const normalizedSentence = normalizeText(sentence);

    let lastIndex = -1;
    let orderValid = true;

    for (const word of words) {
      const index = normalizedSentence.indexOf(word);
      if (index === -1 || index < lastIndex) {
        orderValid = false;
        break;
      }
      lastIndex = index;
    }

    if (orderValid) {
      return true; // toate cuvintele apar in ordinea corectă
    }
  }

  return false;
}


export async function getTrendingMatches() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  // await page.goto('https://trends.google.com/trends/trendingsearches/daily?geo=RO', {
  await page.goto('https://trends.google.com/trending?geo=RO&sort=search-volume', {

    waitUntil: 'networkidle0', timeout: 60000,
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
    if (match) matches.push({ keyword, article: { id: match.id } });
  }

  return { matches };
}
