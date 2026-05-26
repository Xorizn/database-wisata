const express = require("express");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Aku Akan Kalahkan SDA Ini",
    endpoints: {
      baliprov: "/api/baliprov?search=keyword",
      klook: "/api/klook?query=keyword&start=0",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan" });
});

app.listen(PORT, () => {
  console.log(`✅ Server berhasil berjalan di http://localhost:${PORT}`);
});
