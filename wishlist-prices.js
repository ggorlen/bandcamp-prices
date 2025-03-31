const fs = require("node:fs/promises");
const cheerio = require("cheerio");

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:136.0) Gecko/20100101 Firefox/136.0";

const getJson = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: { "User-Agent": userAgent, ...options.headers },
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return res.json();
};

const getText = async (url) => {
  const res = await fetch(url, {
    headers: { "User-Agent": userAgent },
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return res.text();
};

const wishlistPrices = async (fanPageUrl) => {
  const collectionItemsUrl =
    "https://bandcamp.com/api/fancollection/1/wishlist_items";
  const html = await getText(fanPageUrl);
  const $ = cheerio.load(html);
  const userData = JSON.parse($("#pagedata").attr("data-blob"));

  const collection = await getJson(collectionItemsUrl, {
    method: "POST",
    body: JSON.stringify({
      fan_id: userData.fan_data.fan_id,
      older_than_token: userData.wishlist_data.last_token,
      count: 100000,
    }),
    headers: { "Content-Type": "application/json" },
  });

  return collection.items.map((item) => ({
    band_name: item.band_name,
    album_title: item.album_title,
    item_url: item.item_url,
    price: item.price,
    currency: item.currency,
  }));
};

const main = async () => {
  const fanPageUrl = "https://www.bandcamp.com/ggorlen";
  const fileName = "bandcamp-wishlist-prices.json";
  const data = await wishlistPrices(fanPageUrl);
  await fs.writeFile(fileName, JSON.stringify(data, null, 2));
  console.log(`Wishlist prices saved to ${fileName}`);
};

if (require.main === module) {
  main();
}
