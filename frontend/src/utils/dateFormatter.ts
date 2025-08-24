/**
 * Checks if a value can be converted to a valid date in DD/MM/YYYY format
 */
export function isValidDate(value: unknown): boolean {
  if (!value) return false;

  // Check for Excel serial number format
  const parsedNum = Number(value);
  if (!isNaN(parsedNum)) {
    return parsedNum >= 10000 && parsedNum <= 60000;
  }
  
  // Check for DD/MM/YYYY string format
  if (typeof value === 'string') {
    // Test for explicit DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())) {
      const [day, month, year] = value.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && 
             date.getMonth() === month - 1 && 
             date.getDate() === day;
    }

    // Test for other date formats that can be parsed
    const parsedDate = new Date(value);
    return !isNaN(parsedDate.getTime());
  }

  return false;
}

/**
 * Converts Excel serial number to DD/MM/YYYY format.
 */
export function excelSerialToDateString(serial: number): string {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel base date
  const days = Number(serial);

  if (isNaN(days) || days < 1) return '';

  const msOffset = days * 24 * 60 * 60 * 1000;
  const parsed = new Date(excelEpoch.getTime() + msOffset);

  if (isNaN(parsed.getTime())) return '';

  const day = String(parsed.getUTCDate()).padStart(2, '0');
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const year = parsed.getUTCFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Normalize any raw CSV date value to DD/MM/YYYY format.
 */
export function normalizeToDateString(raw: any): string {
  if (!raw) return '';

  // If number or string like "45387"
  const parsedNum = Number(raw);
  if (!isNaN(parsedNum) && parsedNum >= 10000 && parsedNum <= 60000) {
    return excelSerialToDateString(parsedNum);
  }

  // If already DD/MM/YYYY
  if (typeof raw === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(raw.trim())) {
    return raw.trim();
  }

  // Try parsing other date formats like ISO
  const parsedDate = new Date(raw);
  if (!isNaN(parsedDate.getTime())) {
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return '';
}