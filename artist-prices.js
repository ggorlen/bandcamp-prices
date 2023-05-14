/* script to show prices of all items on a bandcamp artist page */

const cheerio = require("cheerio");

const getText = url =>
  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw Error(res.statusText);
      }

      return res.text();
    });

const allPrices = async baseUrl => {
  const $ = cheerio.load(await getText(baseUrl));
  const albums = [...$(".music-grid-item a")]
    .map(e => $(e).attr("href"));

  const prices = [];
  for (const album of albums) {
    const $ = cheerio.load(await getText(baseUrl + album));
    $(".buyItem.digital .nobreak").each((_, e) => {
      prices.push([
        baseUrl + album,
        $(e)
          .text()
          .replace(/\s{2,}/g, " ")
          .replace("or more", "")
          .trim()
      ]);
    });
  }

  return prices;
};

const baseUrl = process.argv[2] || "https://aleksiperala.bandcamp.com";
allPrices(baseUrl).then(prices => console.table(prices));
