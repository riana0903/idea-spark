/**
 * Date Formatter Utility
 * A collection of utility functions for date formatting and manipulation
 */

/**
 * Format a date to a human-readable string
 * 
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Formatting options
 * @param {string} options.format - Predefined format (short, medium, long, full)
 * @param {boolean} options.includeTime - Whether to include time in the formatted string
 * @param {string} options.locale - Locale for formatting (default: browser locale)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  // Convert to Date object if string or number
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to formatDate:', date);
    return 'Invalid date';
  }
  
  const { 
    format = 'medium', 
    includeTime = false,
    locale = navigator.language || 'ja-JP'
  } = options;
  
  try {
    // Predefined format options
    const formatOptions = {
      short: { year: 'numeric', month: 'numeric', day: 'numeric' },
      medium: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    };
    
    // Add time options if requested
    const dateTimeOptions = includeTime 
      ? { ...formatOptions[format], hour: '2-digit', minute: '2-digit' }
      : formatOptions[format];
      
    return new Intl.DateTimeFormat(locale, dateTimeOptions).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    // Fallback formatting
    return dateObj.toLocaleDateString();
  }
};

/**
 * Format a date in Japanese style (original formatDate from the first file)
 * 
 * @param {Date|string|number} dateString - The date to format
 * @returns {string} Formatted date string in Japanese style
 */
export const formatJapaneseDate = (dateString) => {
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date provided to formatJapaneseDate:', dateString);
    return 'Invalid date';
  }
  
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Format a date as a relative time (e.g., "2 days ago", "in 3 hours")
 * 
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Formatting options
 * @param {string} options.locale - Locale for formatting (default: browser locale)
 * @param {Date} options.now - Reference date for "now" (default: current time)
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date, options = {}) => {
  if (!date) return '';
  
  // Convert to Date object if string or number
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to formatRelativeTime:', date);
    return 'Invalid date';
  }
  
  const { 
    locale = navigator.language || 'en-US',
    now = new Date()
  } = options;
  
  const nowTime = now.getTime();
  const dateTime = dateObj.getTime();
  
  // Calculate difference in seconds
  const diffInSeconds = Math.floor((dateTime - nowTime) / 1000);
  const absSeconds = Math.abs(diffInSeconds);
  
  try {
    // Choose appropriate time unit
    let unit, value;
    
    if (absSeconds < 60) {
      unit = 'second';
      value = absSeconds;
    } else if (absSeconds < 3600) {
      unit = 'minute';
      value = Math.floor(absSeconds / 60);
    } else if (absSeconds < 86400) {
      unit = 'hour';
      value = Math.floor(absSeconds / 3600);
    } else if (absSeconds < 2592000) {
      unit = 'day';
      value = Math.floor(absSeconds / 86400);
    } else if (absSeconds < 31536000) {
      unit = 'month';
      value = Math.floor(absSeconds / 2592000);
    } else {
      unit = 'year';
      value = Math.floor(absSeconds / 31536000);
    }
    
    // Handle special cases for more natural language
    if (absSeconds < 5) {
      return locale.startsWith('ja') ? 'たった今' : 'just now';
    }
    
    // Use Intl.RelativeTimeFormat for formatting
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    // Negative sign for past times (now > date)
    const sign = diffInSeconds < 0 ? -1 : 1;
    
    return formatter.format(sign * value, unit);
  } catch (error) {
    console.error('Error formatting relative time:', error);
    // Fall back to timeAgo for Japanese locale
    if (locale.startsWith('ja')) {
      return timeAgo(dateObj);
    }
    // Fallback formatting
    return formatDate(date, options);
  }
};

/**
 * Format time ago in Japanese style (from the first file)
 * 
 * @param {Date|string|number} dateString - The date to format
 * @returns {string} Formatted time ago in Japanese
 */
export const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date provided to timeAgo:', dateString);
    return 'Invalid date';
  }
  
  const seconds = Math.floor((now - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return `${interval}年前`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return `${interval}ヶ月前`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return `${interval}日前`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return `${interval}時間前`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return `${interval}分前`;
  }
  
  return `${Math.floor(seconds)}秒前`;
};

/**
 * Format a date range between two dates
 * 
 * @param {Date|string|number} startDate - The start date
 * @param {Date|string|number} endDate - The end date
 * @param {Object} options - Formatting options
 * @param {string} options.format - Predefined format (short, medium, long)
 * @param {boolean} options.includeTime - Whether to include time
 * @param {string} options.locale - Locale for formatting
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate, options = {}) => {
  if (!startDate || !endDate) return '';
  
  // Convert to Date objects if needed
  const startDateObj = startDate instanceof Date ? startDate : new Date(startDate);
  const endDateObj = endDate instanceof Date ? endDate : new Date(endDate);
  
  // Check if dates are valid
  if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
    console.error('Invalid date(s) provided to formatDateRange:', startDate, endDate);
    return 'Invalid date range';
  }
  
  const { 
    format = 'medium', 
    includeTime = false,
    locale = navigator.language || 'ja-JP'
  } = options;
  
  // Check if dates are on the same day
  const sameDay = startDateObj.toDateString() === endDateObj.toDateString();
  
  // Format options based on specified format
  let dateFormatOptions;
  
  switch (format) {
    case 'short':
      dateFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
      break;
    case 'long':
      dateFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      break;
    case 'medium':
    default:
      dateFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      break;
  }
  
  // Add time if requested
  const timeOptions = includeTime ? { hour: '2-digit', minute: '2-digit' } : {};
  
  try {
    if (sameDay) {
      // Same day formatting
      const dateFormatter = new Intl.DateTimeFormat(locale, dateFormatOptions);
      const dateStr = dateFormatter.format(startDateObj);
      
      if (includeTime) {
        const timeFormatter = new Intl.DateTimeFormat(locale, timeOptions);
        return `${dateStr}, ${timeFormatter.format(startDateObj)} - ${timeFormatter.format(endDateObj)}`;
      }
      
      return dateStr;
    } else {
      // Different days formatting
      const formatter = new Intl.DateTimeFormat(locale, { ...dateFormatOptions, ...timeOptions });
      return `${formatter.format(startDateObj)} - ${formatter.format(endDateObj)}`;
    }
  } catch (error) {
    console.error('Error formatting date range:', error);
    // Fallback formatting
    return `${startDateObj.toLocaleDateString()} - ${endDateObj.toLocaleDateString()}`;
  }
};

/**
 * Get the start and end of a time period
 * 
 * @param {string} period - The time period (day, week, month, year)
 * @param {Date|string|number} date - Reference date (default: current date)
 * @returns {Object} Object with start and end dates
 */
export const getTimePeriod = (period, date = new Date()) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to getTimePeriod:', date);
    return { start: null, end: null };
  }
  
  const start = new Date(dateObj);
  const end = new Date(dateObj);
  
  switch (period.toLowerCase()) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'week':
      // Set to beginning of week (Sunday)
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      
      // Set to end of week (Saturday)
      end.setDate(end.getDate() + (6 - dayOfWeek));
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      
      // Set to last day of month
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
      
    default:
      console.error('Invalid period provided to getTimePeriod:', period);
      return { start: null, end: null };
  }
  
  return { start, end };
};

/**
 * Check if a date is between two other dates
 * 
 * @param {Date|string|number} date - Date to check
 * @param {Date|string|number} startDate - Start of range
 * @param {Date|string|number} endDate - End of range
 * @param {boolean} inclusive - Whether to include the start and end dates (default: true)
 * @returns {boolean} True if date is within range
 */
export const isDateInRange = (date, startDate, endDate, inclusive = true) => {
  if (!date || !startDate || !endDate) return false;
  
  // Convert to Date objects
  const dateObj = date instanceof Date ? date : new Date(date);
  const startObj = startDate instanceof Date ? startDate : new Date(startDate);
  const endObj = endDate instanceof Date ? endDate : new Date(endDate);
  
  // Check if dates are valid
  if (isNaN(dateObj.getTime()) || isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
    console.error('Invalid date(s) provided to isDateInRange:', date, startDate, endDate);
    return false;
  }
  
  // Get timestamps for comparison
  const dateTime = dateObj.getTime();
  const startTime = startObj.getTime();
  const endTime = endObj.getTime();
  
  if (inclusive) {
    return dateTime >= startTime && dateTime <= endTime;
  } else {
    return dateTime > startTime && dateTime < endTime;
  }
};