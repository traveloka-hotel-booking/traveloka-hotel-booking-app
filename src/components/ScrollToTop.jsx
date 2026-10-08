import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Tự động cuộn cửa sổ trình duyệt lên đầu trang (top = 0) mỗi khi chuyển trang (route/pathname thay đổi).
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // Nếu chuyển trang không có hash neo (#id), lập tức cuộn lên đầu trang
    if (!hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname, search, hash]);

  return null;
}
