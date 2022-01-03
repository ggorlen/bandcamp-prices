/* script to show prices of all items on a bandcamp artist page */

const axios = require("axios");
const cheerio = require("cheerio");

const baseUrl = process.argv[2] || "https://aleksiperala.bandcamp.com";
axios.get(baseUrl)
  .then(async ({data}) => {
    let $ = cheerio.load(data);
    const albums = [];
    $(".music-grid-item a").each(function (i, e) {
      albums.push($(e).attr("href"));
    });

    const prices = [];
    for (const album of albums) {
      const {data} = await axios.get(baseUrl + album);
      $ = cheerio.load(data);
      $(".buyItem.digital .nobreak").each(function (i, e) {
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

    console.table(prices);
  })
;
