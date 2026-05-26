const express = require("express");
const router = express.Router();

const { baliprov_destination, Klook } = require("../lib/scraper");

/**
 * @route   GET /api/baliprov
 * @desc    Scrape data destinasi dari lovebali.baliprov.go.id
 * @query   search (contoh: ?search=pantai)
 */
router.get("/baliprov", async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message:
          'Parameter "search" wajib diisi. Contoh: /api/baliprov?search=ubud',
      });
    }

    const data = await baliprov_destination(search);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("BaliProv Scraper Error:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Terjadi kesalahan pada server",
        error: error.message,
      });
  }
});

/**
 * @route   GET /api/klook
 * @desc    Scrape data pencarian klook.com
 * @query   query, start (contoh: ?query=bali&start=0)
 */
router.get("/klook", async (req, res) => {
  try {
    const { query, start } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "query" wajib diisi. Contoh: /api/klook?query=bali',
      });
    }

    const startIndex = start ? parseInt(start) : 0;

    const result = await Klook(query, startIndex);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Klook Scraper Error:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Terjadi kesalahan pada server",
        error: error.message,
      });
  }
});

module.exports = router;
