import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./InforPage.css";

const InforPage = () => {
  const { slug } = useParams();
  const [comic, setComic] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const removeHtmlTags = (htmlString) => {
    return htmlString.replace(/<[^>]*>?/gm, "");
  };

  useEffect(() => {
    const fetchComicDetail = async () => {
      try {
        const response = await axios.get(
          `https://otruyenapi.com/v1/api/truyen-tranh/${slug}`
        );
        const comicData = response.data.data.item;
        const allChapters = comicData.chapters.flatMap((chapter) => chapter.server_data);

        setComic(comicData);
        setChapters(allChapters);
      } catch (err) {
        console.error("Lỗi khi gọi API:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComicDetail();
  }, [slug]);

  const handleChapterClick = (chapter, index) => {
    navigate(`/chapter/${chapter.chapter_name}`, {
      state: {
        chapters: chapters, // Truyền tất cả các chương
        currentChapterIndex: index, // Truyền chỉ số chương hiện tại
        chapterApiUrl: chapter.chapter_api_data, // Truyền URL API của chương
      },
    });
  };

  // Thêm hàm để điều hướng đến chương 1
  const handleReadFirstChapter = () => {
    if (chapters.length > 0) {
      const firstChapter = chapters[0]; // Lấy chương 1
      navigate(`/chapter/${firstChapter.chapter_name}`, {
        state: {
          chapters: chapters,
          currentChapterIndex: 0, // Chỉ số chương 1 là 0
          chapterApiUrl: firstChapter.chapter_api_data,
        },
      });
    }
  };

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div>Có lỗi xảy ra: {error}</div>;
  }

  return (
    <div className="infor-container">
      <h1 className="infor-header">{comic.name}</h1>
      <div className="infor-details">
        <img
          src={`https://img.otruyenapi.com/uploads/comics/${comic.thumb_url}`}
          alt={comic.name}
          className="infor-image"
        />
        <div className="infor-author-category">
          <p><strong>Tác giả:</strong> {comic.author && comic.author.join(", ")}</p>
          <p><strong>Thể loại:</strong> {comic.category && comic.category.map((cat) => cat.name).join(", ")}</p>
          <p><strong>Mô tả:</strong> {removeHtmlTags(comic.content)}</p>

          {/* Đặt nút "Đọc truyện" dưới phần mô tả */}
          {chapters.length > 0 && (
            <button
              className="read-comic-button"
              onClick={handleReadFirstChapter}
            >
              Đọc truyện
            </button>
          )}
        </div>
      </div>

      <div className="infor-chapters">
        <h2>Danh sách chương</h2>
        <ul className="infor-chapter-list">
          {chapters.map((chapter, index) => (
            <li key={index} className="infor-chapter-item">
              <button
                onClick={() => handleChapterClick(chapter, index)}
                className="infor-chapter-button"
              >
                Chương {chapter.chapter_name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InforPage;