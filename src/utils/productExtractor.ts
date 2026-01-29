/**
 * Utility to extract product information from assistant messages
 */

/**
 * Extracts part numbers from text (e.g., "PS11752778", "PS 11752778")
 */
export function extractPartNumbersFromText(text: string): string[] {
    const partNumberPattern = /(?:PS|ps|part\s*)?(\d{5,10})/gi;
    const matches = text.match(partNumberPattern);
    if (matches) {
        return matches
            .map(m => {
                const digits = m.replace(/[^\d]/g, '');
                if (digits.length >= 5 && digits.length <= 10) {
                    return `PS${digits}`;
                }
                return null;
            })
            .filter(Boolean) as string[];
    }
    return [];
}

/**
 * Constructs PartSelect product image URL from part number
 * PartSelect image URLs typically follow: https://www.partselect.com/Images/PartSelect/PS/PS12345678.jpg
 */
export function getProductImageUrl(partNumber: string): string {
    const cleanPartNumber = partNumber.replace(/^PS/i, '');
    return `https://www.partselect.com/Images/PartSelect/PS/PS${cleanPartNumber}.jpg`;
}

/**
 * Extracts product URLs from text
 */
export function extractProductUrls(text: string): string[] {
    const urlPattern = /https?:\/\/www\.partselect\.com\/[^\s\)]+/gi;
    const matches = text.match(urlPattern);
    return matches || [];
}
