// pages/api/scrape.js
import puppeteer from 'puppeteer';
import pLimit from 'p-limit';

// Funcție simulată pentru inserarea unui articol în baza de date
async function insertArticleIntoDB(article) {
  // Aici introdu logica de inserare în baza ta de date (ex: folosind un ORM)
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Inserare în DB: ${article.h1}`);
      resolve();
    }, 100);
  });
}

// Configurația pentru website-uri (poți adăuga mai multe)
const websites = [
  // Fanatik
  // desprecopii.ro/noutati
  // viva
  // agrobiznes
 

/*
  {
    cat: "Agricultură",
    name: 'agrobiznes.ro',
    url: 'https://agrobiznes.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'h3 a'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: '.tdb-title-text',
      img: 'figure a img',
      intro: 'div.tdb-block-inner > p:first-of-type',
      label: 'div.tdb-block-inner span:nth-child(2) a'
    }
  }, 
  {
    cat: "Actualitate",
    name: 'europalibera.org',
    url: 'https://romania.europalibera.org',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'h4'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1.title',
      img: 'div.thumb img',
      intro: 'div.intro > p',
      label: 'Actualitate'
    }
  },  

  */
  {
    cat: "Sănătate",
    name: 'clicksanatate.ro',
    url: 'https://clicksanatate.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'a.title'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1',
      img: 'div.container-image picture img',
      intro: 'section.body p.svelte-verh7n',
      label: 'ul.breadcrump li.svelte-verh7n:nth-of-type(2) a'
    }
  },   
  {
    cat: "Sănătate",
    name: 'csid.ro',
    url: 'https://www.csid.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'div.article__content h3.article__title a'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1',
      img: ['div.single__media a picture img','div.single__media picture img'],
      intro: 'div.single__content p:first-of-type strong',
      label: 'div.breadcrumbs > span span:nth-of-type(2)'
    }
  },   
  {
    cat: "Economie",
    name: 'profit.ro',
    url: 'https://www.profit.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'a.article-title'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1',
      img: 'div.art-img picture img',
      intro: 'div.article-content p:first-of-type strong',
      label: 'div.categ a'
    }
  },  
  {
    cat: "Economie",
    name: 'zf.ro',
    url: 'https://www.zf.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'h2 a', 
      'h3 a'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1.articleTitle',
      img: 'div.articleThumb img',
      intro: 'div.text-content p:first-of-type',
      label: 'span.labelTag '
    }
  },  
  {
    cat: "Economie",
    name: 'economica.net',
    url: 'https://www.economica.net',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'h3.article__title a'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1.single__title',
      img: 'div.single__media picture img',
      intro: 'div.single__content p:first-of-type',
      label: 'nav.rank-math-breadcrumb > p a:nth-of-type(2)'
    }
  }, 
  {
    cat: "Actualitate",
    name: 'tvrinfo.ro',
    url: 'https://tvrinfo.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'div.article__content > div.article__text > a.article__link'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1.article-details__title',
      img: 'div.article__thumbnail-wrapper img',
      intro: 'section.article-details__content h4',
      label: 'Actualitate'
    }
  }, 
  {
    cat: "Actualitate",
    name: 'spotmedia.ro',
    url: 'https://spotmedia.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'div.mbm-h6 a'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1.entry-title',
      img: 'figure.post-thumbnail img',
      intro: 'div.entry-content p:first-of-type',
      label: 'div.breadcrumbs__wrap div.breadcrumbs__item:nth-of-type(5) a'
    }
  }, 
  
  {
    cat: "Actualitate",
    name: 'pressone.ro',
    url: 'https://pressone.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'div.col-12.col-md-4.border-r a.text-decoration-none.text-black'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1',
      img: 'img.img-fluid',
      intro: 'p.font-primary',
      label: 'span.badge'
    }
  },  
  {
    cat: "Actualitate",
    name: 'antena3.ro',
    url: 'https://www.antena3.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'h3 a'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1',
      img: 'div.poza-articol img',
      intro: 'div.text > p:first-of-type',
      label: 'div.articol #location > a:nth-of-type(2)'
    }
  },    
  {
    cat: "Agricultură",
    name: 'agrointel.ro',
    url: 'https://agrointel.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'a.excerpt'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1',
      img: 'figure img',
      intro: 'article > p:first-of-type',
      label: 'navmenu li:first-child a'
    }
  },  
  {
    cat: "Monden",
    name: 'ciao.ro',
    url: 'https://ciao.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'h2.article__title a'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1.single__title',
      img: 'div.single__media div a picture img',
      intro: 'div.single__content p:first-of-type strong',
      label: 'span.category a'
    }
  },  
  {
    cat: "Mame și copii",
    name: 'superbebe.ro',
    url: 'https://superbebe.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'h3.entry-title a'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1.entry-title',
      img: 'div.td-post-featured-image figure img',
      intro: 'div.td-post-content p:first-of-type > strong',
      label: 'ul.td-category li:first-child a'
    }
  },  
  {
    cat: "Mame și copii",
    name: 'totuldespremame.ro',
    url: 'https://totuldespremame.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'h3.post-title a',
      'h2.post-title a', 
      'h1.post-title a',            
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1',
      img: 'div.entry-thumbnail figure img',
      intro: 'div.entry-content p:first-of-type > strong',
      label: 'div.single-breadcrumbs > span a:nth-child(2) a'
    }
  },  
  {
    cat: "Sănătate",
    name: 'clicksanatate.ro',
    url: 'https://clicksanatate.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'a.title'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1',
      img: 'div.container-image picture img',
      intro: 'p.svelte-verh7n',
      label: 'ul.breadcrump li:nth-child(2) a'
    }
  },  
  {
    cat: "Sănătate",
    name: 'csid.ro',
    url: 'https://www.csid.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'h3 a'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1',
      img: 'div.single__media picture img',
      intro: ['div.single__excerpt', 'div.single__content p:first-of-type'],
      label: 'div.breadcrumbs > span > span:nth-child(2) a'
    }
  }, 
  {
    cat: "Sport",
    name: 'prosport.ro',
    url: 'https://www.prosport.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'h2 a'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1',
      img: 'div.single__media picture img',
      intro: 'div.single-content p:first-of-type',
      label: 'div.breadcrumbs > span > span.breadcrumb_last'
    }
  }, 
  {
    cat: "Sport",
    name: 'gsp.ro',
    url: 'https://www.gsp.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'h2 a'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1',
      img: 'div.thumb img',
      intro: 'p.do-not-hide strong',
      label: 'div.h6 a:nth-child(2)'
    }
  }, 
  {
    cat: "Actualitate",
    name: 'observatornews.ro',
    url: 'https://observatornews.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'a.full-link'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1',
      img: 'div.media-top picture img',
      intro: 'div.center-cnt p:first-of-type',
      label: 'span.bcr a:nth-child(2)'
    }
  }, 
  {
    cat: "Actualitate",
    name: 'libertatea.ro',
    url: 'https://www.libertatea.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'h3.article-title a',
      'h2.article-title a'
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1',
      img: 'div.thumb img',
      intro: 'p.intro',
      label: 'span.category-label-inner '
    }
  },  
  {
    cat: "Actualitate",
    name: 'adevarul.ro',
    url: 'https://adevarul.ro',
    // Selectorii pentru extragerea linkurilor din pagina principală
    linkSelectors: [
      'div.svelte-4dr2hm a',
    ],
    // Selectorii pentru extragerea detaliilor din fiecare articol
    detailSelectors: {
      h1: 'h1',
      img: 'picture img',
      intro: 'main.svelte-1m9guhq > p',
      label: 'ul.breadcrump li:nth-child(2) a'
    }
  },  
  {
    cat: "Actualitate",
    name: 'g4media.ro',
    url: 'https://www.g4media.ro',
    linkSelectors: [
      'h3.post-title a'
    ],
    detailSelectors: {
      h1: 'h1.post-title',
      img: 'div.post-image img',
      intro: 'div.post-content p:first-of-type',
      label: 'span.category a'
    }
  },
  {
    cat: "Actualitate",
    name: 'digi24.ro',
    url: 'https://www.digi24.ro',
    linkSelectors: [
      'h3.h4 a'
    ],
    detailSelectors: {
      h1: 'h1',
      img: 'figure.article-thumb img',
      intro: 'div.entry p:first-of-type',
      label: 'ul.breadcrumbs li:nth-child(3) a'
    }
  },
  {
    cat: "Actualitate",
    name: 'evz.ro',
    url: 'https://evz.ro',
    linkSelectors: [
      'h2.post-title a'
    ],
    detailSelectors: {
      h1: 'h1.title',
      img: 'div.blog-details-thumb img',
      intro: 'p.p1, p.first-info',
      label: 'div.blog-details-content-top a'
    }
  },
  {
    cat: "Actualitate",
    name: 'news.ro',
    url: 'https://www.news.ro',
    linkSelectors: [
      'h2 a'
    ],
    detailSelectors: {
      h1: 'h1',
      img: 'figure.article-img img',
      intro: 'div.article-content p:first-of-type',
      label: 'ol.breadcrumb li:nth-child(2) a'
    }
  },
  {
    cat: "Actualitate",
    name: 'stirileprotv.ro',
    url: 'https://stirileprotv.ro',
    linkSelectors: [
      'h3.item a',
      'h3.article-title a',
      'h3.article-title-daily a'
    ],
    detailSelectors: {
      h1: 'h1',
      img: 'div.article--media figure img',
      intro: 'div.article--lead p',
      label: 'div.article--section-information a'
    }
  },
  {
    cat: "Actualitate",
    name: 'ziare.com',
    url: 'https://ziare.com',
    linkSelectors: [
      'h2.spotlight__article__title a',
      'h3.news__article__title a',
      'h1.spotlight__article__title a'
    ],
    detailSelectors: {
      h1: 'h1',
      img: 'a.news__image img.img-responsive',
      intro: 'div.news__content p:first-child',
      label: 'ul.breadcrumb li:nth-child(2) a'
    }
  },
  {
    cat: "Actualitate",
    name: 'hotnews.ro',
    url: 'https://hotnews.ro',
    linkSelectors: [
      'h2.entry-title a',
      'article.article-excerpt a.title'
    ],
    detailSelectors: {
      h1: 'h1.entry-title',
      img: 'figure.post-thumbnail img',
      intro: 'div.entry-content p:first-of-type',
      label: 'hn-category-tag>a'
    }
  },
  {
    cat: "Actualitate",
    name: 'spotmedia.ro',
    url: 'https://spotmedia.ro',
    linkSelectors: [
      'div.mbm-h6 a'
    ],
    detailSelectors: {
      h1: 'h1.entry-title',
      img: 'figure.post-thumbnail img',
      intro: 'div.entry-content p:first-of-type',
      label: 'div.breadcrumbs__wrap div:nth-child(5) a'
    }
  }
];



// Funcție care procesează un articol (link) folosind o pagină nouă
async function scrapeArticle(browser, link, detailSelectors) {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

  try {
    console.log(`Navigăm la ${link}`);
    await page.goto(link, { waitUntil: 'networkidle2' });
    console.log(`Pagina pentru ${link} a fost încărcată.`);

    await page.waitForSelector(detailSelectors.h1, { timeout: 5000 });
    console.log(`Am găsit elementul <h1> pentru ${link}.`);

    // Extragem detaliile: h1, img, intro și label
    const data = await page.evaluate((detailSelectors) => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.innerText.trim() : "";
      };
      const getSrc = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return "";
        return el.getAttribute('data-lazy-src') || el.src;
      };

      const h1 = getText(detailSelectors.h1);
      const imgSrc = Array.isArray(detailSelectors.img)
        ? detailSelectors.img.map(sel => getSrc(sel)).find(src => src)
        : getSrc(detailSelectors.img);
      const intro = getText(detailSelectors.intro);
      const labelText = getText(detailSelectors.label);
      const label = (!labelText || labelText.split(/\s+/).length > 3) ? "Actualitate" : labelText;

      return { h1, imgSrc, intro, label };
    }, detailSelectors);
    
    console.log(`Date extrase pentru ${link}:`, data);
    
    if (!data.h1 || data.h1 === "" || !data.imgSrc || data.imgSrc === "") {
      console.warn(`Articolul ${link} a fost skip-uit din cauza lipsei de h1 sau imgSrc.`);
      return null;
    }

    return { link, ...data };
  } catch (err) {
    console.error(`Eroare la procesarea linkului ${link}: ${err.message}`);
    return null;
  } finally {
    await page.close();
  }
}





// Funcție care extrage linkurile din pagina principală a website-ului și procesează articolele
async function scrapeWebsite(browser, website) {
  const page = await browser.newPage();
  console.log(`Navigăm la ${website.url}...`);

  try {
    await page.goto(website.url, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch (err) {
    console.error(`Eroare la navigarea ${website.url}: ${err.message}`);
    await page.close();
    // Returnăm un array gol pentru a ignora acest website
    return [];
  }

  console.log(
    `Extragem linkurile de pe ${website.name} folosind selectorii: ${website.linkSelectors.join(', ')}`
  );
  
  let links = await page.evaluate((selectors) => {
    const allLinks = [];
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (el.href) {
          const normalizedHref = el.href.split('#')[0];
          allLinks.push(normalizedHref);
        }
      });
    });
    // Eliminăm duplicatele
    return [...new Set(allLinks)];
  }, website.linkSelectors);

  await page.close();

  // Filtrăm linkurile: trebuie să înceapă cu website.url
  links = links.filter(link => link.startsWith(website.url));
  console.log(`Am găsit ${links.length} linkuri valide pe ${website.name}.`);

  // Procesăm linkurile în paralel, limitând concurența (ex.: 5 pagini simultan)
  const limit = pLimit(5);
  const articlePromises = links.map((link) =>
    limit(() => scrapeArticle(browser, link, website.detailSelectors))
  );
  const results = (await Promise.all(articlePromises))
    .filter(article => article !== null)
    .map(article => ({ ...article, name: website.name }));
  return results;
}





// Endpoint API care lansează procesul de scraping
export default async function handler(req, res) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });    
    const allResults = {};

    // Parcurgem fiecare website și procesăm articolele
    for (const website of websites) {
      console.log(`\n=== Începem scraping pentru ${website.name} ===`);
      const results = await scrapeWebsite(browser, website);
      allResults[website.name] = results;
      console.log(`=== Finalizat scraping pentru ${website.name} ===\n`);
    }

    await browser.close();
    console.log("Scraping complet pentru toate website-urile.");

    // Inserăm articolele valide în baza de date
    for (const site in allResults) {
      for (const article of allResults[site]) {
        if (!article.error) {
          try {
            await insertArticleIntoDB(article);
          } catch (inserareErr) {
            console.error(`Eroare la inserarea articolului ${article.link}: ${inserareErr.message}`);
          }
        } else {
          console.log(`Articolul ${article.link} a fost skip-uit din DB din cauza erorii.`);
        }
      }
    }

    res.status(200).json(allResults);
  } catch (error) {
    console.error("Eroare la scraping:", error);
    res.status(500).json({ error: error.toString() });
  }
}
