const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

function baliprov_destination(search) {
  return new Promise((resolve, reject) => {
    axios
      .get(
        `https://lovebali.baliprov.go.id/destination/search?search=${search}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        },
      )
      .then((response) => {
        const data = response.data;
        const $ = cheerio.load(data);
        const hasil = [];

        $("div.container > div.row > div > div > a").each(function (a, b) {
          const style = $(b).find("div.event_card").attr("style") || "";
          const bgMatch = style.match(
            /background-image:\s*url\(['"]?(.*?)['"]?\)/,
          );
          const backgroundImage = bgMatch ? bgMatch[1] : null;
          const fallbackImage =
            $(b).find("div.event_card").attr("data-fallback") || null;

          hasil.push({
            title: $(b).find("h6").text().trim(),
            location: $(b).find("p").text().trim(),
            detail: $(b).find("div.detail").text().trim(),
            link: $(b).attr("href"),
            backgroundImage,
            fallbackImage,
          });
        });

        resolve(hasil);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

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

module.exports = {
  baliprov_destination,
  Klook,
};