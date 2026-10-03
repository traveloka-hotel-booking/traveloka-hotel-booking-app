/**
 * Utility hàm chuẩn hóa và làm sạch thông báo lỗi,
 * đảm bảo không bao giờ để lộ Exception, Stacktrace hoặc lỗi kỹ thuật Java/JS ra giao diện người dùng.
 */

const TECHNICAL_PATTERNS = [
  /exception/i,
  /stack\s*trace/i,
  /io\.jsonwebtoken/i,
  /serviceloader/i,
  /serializer/i,
  /java\./i,
  /javax\./i,
  /jakarta\./i,
  /org\.springframework/i,
  /hibernate/i,
  /sql/i,
  /nullpointer/i,
  /failed to fetch/i,
  /networkerror/i,
  /typeerror/i,
  /econnrefused/i,
  /internal server error/i,
  /syntaxerror/i,
  /cannot read/i,
  /undefined/i
];

/**
 * Lọc chuỗi thông báo lỗi, loại bỏ hoàn toàn các lỗi kỹ thuật/exception.
 * @param {string|Error} error
 * @param {string} fallbackMsg
 * @returns {string} Thông báo thân thiện với người dùng
 */
export const sanitizeErrorMessage = (error, fallbackMsg = 'Đã có lỗi xảy ra, vui lòng thử lại sau!') => {
  if (!error) return fallbackMsg;

  let msg = '';
  if (typeof error === 'string') {
    msg = error;
  } else if (error instanceof Error) {
    msg = error.message || '';
  } else if (typeof error === 'object') {
    msg = error.message || error.errors || '';
  }

  if (!msg || typeof msg !== 'string') {
    return fallbackMsg;
  }

  // Bắt các lỗi mất kết nối máy chủ
  if (/failed to fetch|networkerror|econnrefused/i.test(msg)) {
    return 'Không thể kết nối đến máy chủ! Vui lòng kiểm tra lại kết nối mạng.';
  }

  // Bắt các lỗi kỹ thuật / Exception backend
  if (TECHNICAL_PATTERNS.some((pattern) => pattern.test(msg))) {
    return 'Hệ thống đang gặp sự cố, vui lòng thử lại sau!';
  }

  return msg.trim() || fallbackMsg;
};

/**
 * Trích xuất thông báo lỗi thân thiện từ Response hoặc Data trả về của Backend.
 * @param {any} data
 * @param {string} [fallbackMsg]
 * @returns {string}
 */
export const getFriendlyErrorMessage = (data, fallbackMsg = 'Đã có lỗi xảy ra, vui lòng thử lại sau!') => {
  if (!data) return fallbackMsg;

  // Nếu là Error object
  if (data instanceof Error) {
    return sanitizeErrorMessage(data.message, fallbackMsg);
  }

  // Nếu là string
  if (typeof data === 'string') {
    return sanitizeErrorMessage(data, fallbackMsg);
  }

  // Nếu là object response của Backend (ApiResponse hoặc Map)
  let rawMsg = '';
  if (data.result && typeof data.result === 'object') {
    rawMsg = data.result.errors || data.result.message;
  } else if (typeof data.result === 'string') {
    rawMsg = data.result;
  }

  if (!rawMsg) {
    rawMsg = data.errors || data.message;
  }

  return sanitizeErrorMessage(rawMsg, fallbackMsg);
};
