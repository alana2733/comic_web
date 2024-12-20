const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

// Cấu hình multer để xử lý upload file
const upload = multer({ dest: "uploads/" }); // Thư mục lưu trữ file

// Giải mã body (cho POST request)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Kết nối MongoDB (Nếu sử dụng MongoDB, thay thế bằng URL MongoDB của bạn)
mongoose.connect('mongodb://localhost/comics', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Đã kết nối với MongoDB"))
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

// Tạo schema cho Comic (Truyện tranh)
const comicSchema = new mongoose.Schema({
  title: String,
  author: String,
  category: String,
  description: String,
  coverImage: String, // Đường dẫn hình ảnh
});

const Comic = mongoose.model("Comic", comicSchema);

// API POST để đăng truyện
app.post("/v1/api/truyen-tranh", upload.single("cover_image"), (req, res) => {
  const { title, author, category, description } = req.body;
  const coverImage = req.file;

  // Lưu dữ liệu vào cơ sở dữ liệu MongoDB
  const newComic = new Comic({
    title,
    author,
    category,
    description,
    coverImage: coverImage.path, // Lưu đường dẫn file
  });

  newComic.save((err, comic) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi khi lưu truyện." });
    }
    res.status(200).json({ data: { item: comic } });
  });
});

// Chạy server tại cổng 3001
app.listen(3001, () => {
  console.log("Server đang chạy tại http://localhost:3001");
});
