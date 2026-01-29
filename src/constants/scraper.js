/**
 * Configuration constants for PartSelect scraper
 */

const SCRAPE_CONFIG = {
    maxProductsPerCategory: 500, // Limit to avoid overwhelming the system
    timeout: 20000, // Reduced from 30s to 20s for faster scraping
    headless: true,
    waitForSelector: '.product-item, .part-item, [data-part-number]', // Common selectors
    scrapeDetailPages: true, // Whether to scrape individual product detail pages for replacement parts
    maxDetailPagesPerBatch: 100, // Increased from 50 to scrape more products per run
};

/**
 * Product selectors to try when scraping
 */

/**
 * Name selectors to try when extracting product names
 */
const NAME_SELECTORS = [
    '.nf__part__detail h2',
    '.nf__part__detail h3',
    '.nf__part__detail h4',
    '.nf__part__detail .title',
    '.nf__part__detail a[href*="/PS"]',
    'h2, h3, h4'
];

/**
 * Patterns to skip when extracting product names
 */
const SKIP_PATTERNS = [
    /^(videos?|read more|see more|\.\.\.|unknown part)$/i,
    /^videos?$/i, // Just "Videos" or "Video"
    /★★★★★/,
    /^\d+\s+reviews?$/i,
    /instructions|troubleshooting|customer review/i,
    /^[★\s]+$/, // Only stars/spaces
    /^#/, // Anchor links
    /^videos!\s*$/i // "Videos!" with optional spaces
];

/**
 * Common appliance brands
 */
const BRANDS = [
    'Whirlpool',
    'Frigidaire',
    'GE',
    'Samsung',
    'LG',
    'KitchenAid',
    'Maytag',
    'Bosch'
];

/**
 * PartSelect category URLs to scrape
 */
const SCRAPE_URLS = [
    { url: 'https://www.partselect.com/Refrigerator-Parts.htm', category: 'Refrigerator Parts' },
    { url: 'https://www.partselect.com/Dishwasher-Parts.htm', category: 'Dishwasher Parts' }
];

module.exports = {
    SCRAPE_CONFIG,
    NAME_SELECTORS,
    SKIP_PATTERNS,
    BRANDS,
    SCRAPE_URLS
};
