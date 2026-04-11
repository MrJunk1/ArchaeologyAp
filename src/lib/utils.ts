// Utility functions

export const generatePassportId = (): string => {
  const year = new Date().getFullYear();
  // Generate random 4-digit hex string
  const randomStr = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0').toUpperCase();
  return `ARC-${year}-${randomStr}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
