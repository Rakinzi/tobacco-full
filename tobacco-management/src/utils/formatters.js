/**
 * Format a date string to a more readable format
 * @param {string} dateString - The date string to format
 * @param {boolean} includeTime - Whether to include time in the formatted date
 * @returns {string} The formatted date string
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';

  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return new Intl.DateTimeFormat('en-GB', options).format(date);
};

export const formatWeight = (weight) => {
  if (weight === null || weight === undefined) return 'N/A';

  return `${Number(weight).toLocaleString()} kg`;
};



export const getStatusStyles = (status) => {
  switch (status) {
    case 'pending':
      return {
        bgColor: 'bg-yellow-500/10',
        textColor: 'text-yellow-400'
      };
    case 'approved':
      return {
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-400'
      };
    case 'rejected':
      return {
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-400'
      };
    case 'sold':
      return {
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-400'
      };
    default:
      return {
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-400'
      };
  }
};

export const formatTobaccoType = (type) => {
  switch (type) {
    case 'flue_cured':
      return 'Flue Cured';
    case 'burley':
      return 'Burley';
    case 'dark_fired':
      return 'Dark Fired';
    default:
      return type;
  }
};

export const getStorageImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Use the correct base URL for your environment
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${baseUrl}/storage/${imagePath}`;
};

/**
 * Format a business type string to a more readable format
 * @param {string} type - The business type to format
 * @returns {string} The formatted business type
 */
export const formatBusinessType = (type) => {
  if (!type) return 'N/A';

  const types = {
    'auction_floor': 'Auction Floor',
    'contractor': 'Contractor',
    'merchant': 'Merchant',
  };

  return types[type] || type.replace('_', ' ');
};

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return 'N/A';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a phone number to a more readable format
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} The formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return 'N/A';

  // This is a simple formatter that adds spaces for readability
  // You can customize this based on your specific phone format needs
  return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
};