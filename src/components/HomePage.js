import React, { useState, useEffect, useRef } from 'react'; 
import axios from 'axios'; 
import './HomePage.css'; 
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [comics, setComics] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [page, setPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(500); 
  const [searchKeyword, setSearchKeyword] = useState(''); 
  const [searchResults, setSearchResults] = useState([]); 
  const searchInputRef = useRef(null); 
  const navigate = useNavigate(); 

  // Fetch search results based on keyword
  const fetchSearchResults = async () => {
    if (searchKeyword.trim() === '') {
      setSearchResults([]); // Không tìm kiếm nếu từ khóa rỗng
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `https://otruyenapi.com/v1/api/tim-kiem?keyword=${searchKeyword}&page=${page}&limit=30`
      );

      console.log("Response from API:", response.data);

      const results = response.data.data.items || [];
      setSearchResults(results); 

      const totalCount = response.data.data?.totalCount || 0;
      setTotalPages(Math.ceil(totalCount / 30));

    } catch (err) {
      console.error("Error fetching search results:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };  

  // Handle Enter key to search
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setPage(1); // Reset trang về 1 khi tìm kiếm
      fetchSearchResults(); // Thực hiện tìm kiếm khi nhấn Enter
    }
  };

  // Fetch comics data when page changes (if not searching)
  useEffect(() => {
    if (!searchKeyword.trim()) {
      const fetchComics = async () => {
        setLoading(true);
        try {
          const response = await axios.get(
            `https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=${page}&limit=30`
          );
          setComics(response.data.data.items || []);
          setTotalPages(Math.min(response.data.data.totalPages || 500, 500));
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchComics();
    } 
  }, [page, searchKeyword]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleLogoClick = () => {
    setPage(1);
    setSearchKeyword('');
    setSearchResults([]); 
    setTotalPages(500); 
    navigate('/');
  };

  const displayedComics = searchKeyword ? searchResults : comics;

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>Có lỗi xảy ra: {error}</div>;

  // Handle pagination display range
  const maxPagesToShow = 5;
  const pageNumbers = [];

  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="homepage-container">
      <div className="homepage-header" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <div className="homepage-logo" title="Nhấn để trở về trang đầu">Comic HEHE</div>
      </div>

      <h1 className="homepage-title">Danh sách truyện tranh</h1>

      <div className="search-container">
        <input
          ref={searchInputRef}
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)} 
          onKeyDown={handleKeyDown} 
          placeholder="Tìm kiếm truyện..."
          className="search-input"
        />
      </div>

      <div className="container">
        {displayedComics.map((comic) => (
          <div key={comic._id} className="comic-item">
            <img
              src={`https://otruyenapi.com//uploads/comics/${comic.thumb_url}`}
              alt={comic.name}
            />
            <h3>{comic.name}</h3>
            <div className="comic-detail-link">
              <a href={`/comic/${comic.slug}`}>Xem chi tiết</a>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => handlePageChange(1)}
          disabled={page === 1}
        >
          &lt;&lt; Trang đầu
        </button>
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Trang trước
        </button>
        {pageNumbers.map(num => (
          <button
            key={num}
            className={num === page ? 'active' : ''}
            onClick={() => handlePageChange(num)}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          Trang sau
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={page === totalPages}
        >
          Trang cuối &gt;&gt;
        </button>
      </div>
    </div>
  );
};

export default HomePage