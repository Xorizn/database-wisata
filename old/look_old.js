const axios = require("axios");
const fs = require("fs");

function Klook(query, start = 0) {
  return new Promise(async (resolve, reject) => {
    const COOKIE = "COOKIE";
    const USER_AGENT =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    const BASE_URL =
      "https://www.klook.com/v1/cardinfocenterservicesrv/search/platform/complete_search_v3";

    function trimCard(card) {
      const d = card.data || {};
      const price = d.price || {};
      const review = d.review_obj || {};
      const trackInfo = card.track_info || {};

      return {
        title: d.title || null,
        sub_title: d.sub_title || null,
        category: d.category || null,
        city_name: d.city_name || null,
        cover_url: d.cover_url || null,
        deep_link: d.deep_link || null,
        price: price.selling_price || null,
        price_format: price.selling_price_format || null,
        display_price: trackInfo.display_price || null,
        original_price: trackInfo.original_price || null,
        rating: review.star || null,
        review_count: review.count || null,
        tags: (d.general_tag || []).map((t) => t.text).filter(Boolean),
        sold_out: d.sold_out || false,
      };
    }

    const HEADERS = {
      "User-Agent": USER_AGENT,
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
      Referer: `https://www.klook.com/id/search/?query=${encodeURIComponent(query)}`,
      Cookie: COOKIE,
    };

    const allData = [];
    try {
      const { data } = await axios.get(BASE_URL, {
        headers: HEADERS,
        params: {
          query: query,
          sort: "most_relevant",
          tab_key: "0",
          start: start,
          size: 15,
          k_lang: "id_ID",
          k_currency: "IDR",
        },
        timeout: 15000,
      });

      const cards = data?.result?.search_result?.cards || [];
      allData.push(...cards.map(trimCard));

      const output = {
        meta: {
          source: "klook.com",
          query: query,
          start: start,
          currency: "IDR",
          language: "id_ID",
          scraped_at: new Date().toISOString(),
          total: allData.length,
        },
        data: allData,
      };

      resolve(output);
    } catch (error) {
      reject(error);
    }
  });
}

Klook("bali", 0)
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.error(err.message);
  });