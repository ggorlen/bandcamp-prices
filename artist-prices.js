/* script to show prices of all items on a bandcamp artist page */

const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:136.0) Gecko/20100101 Firefox/136.0";

const getText = async (url) => {
  const res = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
    },
  });

  if (!res.ok) {
    throw Error(res.statusText);
  }
  return res.text();
};

async function* allPrices(baseUrl) {
  let browser;
  try {
    browser = await puppeteer.launch();
    const [page] = await browser.pages();
    await page.setUserAgent(userAgent);
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    const albumUrls = await page.$$eval(".music-grid-item a", (els) =>
      els.map((e) => e.href),
    );
    await browser.close();
    const prices = [];

    for (const url of albumUrls) {
      const $ = cheerio.load(await getText(url));

      for (const e of [...$(".buyItem.digital .nobreak")]) {
        const album = {
          url,
          title: $("h2.trackTitle").text().trim(),
          artist: $("#name-section a").text().trim(),
          price: $(e)
            .text()
            .replace(/\s{2,}/g, " ")
            .replace("or more", "")
            .trim(),
        };
        yield album;
      }
    }

    return prices;
  } finally {
    await browser?.close();
  }
}

const baseUrl = process.argv[2] || "https://aleksiperala.bandcamp.com";
(async () => {
  for await (const album of allPrices(baseUrl)) {
    console.log(album);
  }
})();
