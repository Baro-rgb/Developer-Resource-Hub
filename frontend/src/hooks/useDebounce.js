// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Custom Hook: useDebounce
 * Debounce một giá trị sau một khoảng thời gian
 * 
 * Sử dụng: Ngăn chặn search API được gọi quá thường xuyên
 * 
 * @param {*} value - Giá trị cần debounce
 * @param {number} delay - Delay (ms)
 * @returns {*} Giá trị debounced
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timer nếu value thay đổi trước delay hết
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
