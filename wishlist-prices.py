# https://stackoverflow.com/questions/64418583/scraping-bandcamp-fan-collections-via-post/64419449#64419449
import json
import pandas as pd
import requests
from bs4 import BeautifulSoup


def wishlist_prices(fan_page_url, collection_items_url):
    res = requests.get(fan_page_url)
    res.raise_for_status()
    soup = BeautifulSoup(res.text, "lxml")
    user = json.loads(soup.find(id="pagedata")["data-blob"])

    data = {
        "fan_id": user["fan_data"]["fan_id"],
        "older_than_token": user["wishlist_data"]["last_token"],
        "count": 100000,
    }
    res = requests.post(collection_items_url, json=data)
    res.raise_for_status()
    collection = res.json()
    df = pd.DataFrame(
        collection["items"],
        columns=("band_name", "album_title", "item_url", "price", "currency")
    )
    df.to_csv("xbandcamp-wishlist-prices.csv", index=False)


if __name__ == "__main__":
    fan_page_url = "https://www.bandcamp.com/ggorlen"
    collection_items_url = "https://bandcamp.com/api/fancollection/1/wishlist_items"
    wishlist_prices(fan_page_url, collection_items_url)
