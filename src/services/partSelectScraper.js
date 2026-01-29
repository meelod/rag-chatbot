const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { SCRAPE_CONFIG, SCRAPE_URLS } = require('../constants/scraper');

/**
 * PartSelect Scraper
 * 
 * Two modes:
 * - TEST: 3 brands, 5 products each = ~15 products (fast testing)
 * - FULL: All brands, 10 products each = ~690 products
 */

const BASE_URL = 'https://www.partselect.com';

const MODE = {
    TEST: { maxBrands: 3, maxProductsPerBrand: 5 },
    FULL: { maxBrands: Infinity, maxProductsPerBrand: 10 }
};


function normalizeUrl(url) {
    if (!url) return null;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return `${BASE_URL}${url}`;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}/${url}`;
}

async function setupBrowser() {
    const browser = await puppeteer.launch({
        headless: SCRAPE_CONFIG.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });
    return { browser, page };
}

async function loadPage(page, url, waitMs = 1000) {
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: SCRAPE_CONFIG.timeout });
        await new Promise(r => setTimeout(r, waitMs));
        const title = await page.title();
        return !title.toLowerCase().includes('access denied') && !title.toLowerCase().includes('blocked');
    } catch {
        return false;
    }
}

async function findBrandPages(page, categoryUrl, category) {
    if (!await loadPage(page, categoryUrl)) return [];

    const brandPages = await page.evaluate((category) => {
        const links = Array.from(document.querySelectorAll('a[href*="-Parts.htm"]'));
        const results = [];
        const seen = new Set();

        for (const link of links) {
            const href = link.getAttribute('href');
            if (!href || seen.has(href)) continue;

            const match = href.match(/\/([A-Za-z]+)-([A-Za-z]+)-Parts\.htm$/);
            if (match && match[1] !== 'Refrigerator' && match[1] !== 'Dishwasher') {
                seen.add(href);
                results.push({ url: href, brand: match[1], category: `${match[1]} ${match[2]} Parts` });
            }
        }
        return results;
    }, category);

    return brandPages.map(bp => ({ ...bp, url: normalizeUrl(bp.url) }));
}

async function collectProductsFromBrandPage(page, brandUrl, maxProducts) {
    if (!await loadPage(page, brandUrl)) return [];

    // Scroll to load lazy content
    for (let i = 0; i < 5; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(r => setTimeout(r, 800));
    }

    // Collect product URLs (same logic as browser script)
    const products = await page.evaluate((maxProducts) => {
        const links = Array.from(document.querySelectorAll('a[href*="/PS"]'));
        const results = [];
        const seen = new Set();

        for (const link of links) {
            if (results.length >= maxProducts) break;

            const href = link.getAttribute('href');
            if (!href) continue;

            const match = href.match(/PS\d{5,}/);
            if (!match || seen.has(match[0])) continue;

            seen.add(match[0]);
            results.push({ partNumber: match[0], url: href });
        }
        return results;
    }, maxProducts);

    return products.map(p => ({ ...p, url: normalizeUrl(p.url) }));
}

async function scrapeProductDetail(page, productUrl, category) {
    if (!await loadPage(page, productUrl, 800)) return null;

    const html = await page.content();
    const $ = cheerio.load(html);

    // Extract basic info
    const partNumber = $('span[itemprop="sku"]').text().trim() ||
        productUrl.match(/PS\d{5,}/)?.[0] || '';
    const name = $('h1').first().text().trim() || `Part ${partNumber}`;
    const description = $('meta[name="description"]').attr('content') ||
        $('.pd__description').text().trim() || '';
    const imageUrl = $('img.pd__main-image').attr('src') ||
        $('img[itemprop="image"]').attr('src') || '';

    // Manufacturer info
    const manufacturerPartNumber = $('.pd__mfr-part-number').text().replace(/Manufacturer Part Number/i, '').trim() ||
        $('span:contains("Manufacturer Part Number")').next().text().trim() || '';

    let manufacturedBy = '';
    let manufacturedFor = [];
    const mfgText = $('.pd__manufactured').text() || $('*:contains("Manufactured by")').first().text();
    if (mfgText) {
        const byMatch = mfgText.match(/Manufactured by\s+(\w+)/i);
        if (byMatch) manufacturedBy = byMatch[1];
        const forMatch = mfgText.match(/for\s+(.+?)(?:\.|$)/i);
        if (forMatch) manufacturedFor = forMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    }

    // Symptoms (troubleshooting)
    const symptoms = [];
    $('.pd__symptom, .symptom-item, [class*="symptom"]').each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 3 && text.length < 100) symptoms.push(text);
    });
    $('*:contains("This part fixes")').next('ul').find('li').each((_, el) => {
        symptoms.push($(el).text().trim());
    });

    // Product type
    const productType = $('*:contains("This part works with")').first().text().match(/works with.*?:\s*(\w+)/i)?.[1] ||
        category.split(' ')[1] || '';

    // Replacement parts
    const replacementParts = [];
    const replacesText = $('*:contains("replaces these")').text() || $('*:contains("Replaces:")').text();
    if (replacesText) {
        const matches = replacesText.match(/[A-Z0-9]{5,}/g) || [];
        replacementParts.push(...matches.filter(p => !p.startsWith('PS')));
    }

    // Compatible models
    const compatibleModels = [];
    $('.pd__crossref__list .row, .pd__crossref__list tr').each((_, row) => {
        const cells = $(row).find('td, .col, span, div').map((_, c) => $(c).text().trim()).get();
        if (cells.length >= 2) {
            const brand = cells[0];
            const modelNumber = cells[1];
            // Validate model number (must have digits, not generic words)
            if (modelNumber && /\d/.test(modelNumber) && modelNumber.length >= 5 &&
                !['MODELS', 'MODEL', 'BRAND', 'DESCRIPTION'].includes(modelNumber.toUpperCase())) {
                compatibleModels.push({
                    brand: brand || 'Unknown',
                    modelNumber,
                    description: cells[2] || ''
                });
            }
        }
    });

    // Extract brand from URL or page
    const urlBrand = productUrl.match(/partselect\.com\/PS\d+-(\w+)-/)?.[1] || '';
    const brand = urlBrand || manufacturedBy || 'Various';

    return {
        partNumber,
        name,
        description,
        category,
        brand,
        manufacturerPartNumber,
        manufacturedBy,
        manufacturedFor,
        symptoms: [...new Set(symptoms)].slice(0, 10),
        productType,
        replacementParts: [...new Set(replacementParts)].slice(0, 20),
        compatibleModels: compatibleModels.slice(0, 50),
        url: productUrl,
        imageUrl: normalizeUrl(imageUrl)
    };
}

async function scrapePartSelect(testMode = false) {
    const config = testMode ? MODE.TEST : MODE.FULL;
    console.log(`\n[SCRAPER] Starting PartSelect scraper (${testMode ? 'TEST' : 'FULL'} mode)`);
    console.log(`   Max brands: ${config.maxBrands === Infinity ? 'ALL' : config.maxBrands}`);
    console.log(`   Max products per brand: ${config.maxProductsPerBrand}\n`);

    const { browser, page } = await setupBrowser();
    const allProducts = [];

    try {
        // Step 1: Find all brand pages
        let allBrandPages = [];
        for (const { url, category } of SCRAPE_URLS) {
            console.log(`[SCRAPER] Finding brand pages for: ${category}`);
            const brandPages = await findBrandPages(page, url, category);
            allBrandPages.push(...brandPages);
            console.log(`   Found ${brandPages.length} brand pages`);
        }

        // Limit brands in test mode
        if (config.maxBrands < allBrandPages.length) {
            allBrandPages = allBrandPages.slice(0, config.maxBrands);
            console.log(`   (Limited to ${config.maxBrands} brands for testing)`);
        }

        // Step 2: Collect product URLs from each brand page
        console.log(`\n[SCRAPER] Collecting products from ${allBrandPages.length} brand pages...\n`);
        const productQueue = [];

        for (let i = 0; i < allBrandPages.length; i++) {
            const { url, brand, category } = allBrandPages[i];
            console.log(`[${i + 1}/${allBrandPages.length}] ${brand}`);

            const products = await collectProductsFromBrandPage(page, url, config.maxProductsPerBrand);
            productQueue.push(...products.map(p => ({ ...p, category })));

            console.log(`   ${products.length} products: ${products.slice(0, 5).map(p => p.partNumber).join(', ')}${products.length > 5 ? '...' : ''}`);
            await new Promise(r => setTimeout(r, 300));
        }

        console.log(`\n[SCRAPER] Collected ${productQueue.length} product URLs\n`);

        // Step 3: Scrape each product detail page
        console.log(`[SCRAPER] Scraping product details (${productQueue.length} products)...\n`);

        for (let i = 0; i < productQueue.length; i++) {
            const { url, partNumber, category } = productQueue[i];

            if (i % 10 === 0 || i === productQueue.length - 1) {
                console.log(`   [${i + 1}/${productQueue.length}] ${((i + 1) / productQueue.length * 100).toFixed(0)}%`);
            }

            const productData = await scrapeProductDetail(page, url, category);
            if (productData) {
                allProducts.push(productData);

                // Show sample data for first few products
                if (i < 3) {
                    console.log(`      ${partNumber}: ${productData.name.substring(0, 50)}...`);
                    if (productData.symptoms.length) console.log(`        Symptoms: ${productData.symptoms.slice(0, 2).join(', ')}`);
                    if (productData.replacementParts.length) console.log(`        Replaces: ${productData.replacementParts.slice(0, 3).join(', ')}`);
                    if (productData.compatibleModels.length) console.log(`        Models: ${productData.compatibleModels.length} compatible`);
                }
            }

            await new Promise(r => setTimeout(r, 200));
        }

    } finally {
        await browser.close();
    }

    console.log(`\n[SCRAPER] Scraping complete!`);
    console.log(`   Total products: ${allProducts.length}`);

    // Summary
    const withSymptoms = allProducts.filter(p => p.symptoms.length > 0).length;
    const withModels = allProducts.filter(p => p.compatibleModels.length > 0).length;
    const withReplacements = allProducts.filter(p => p.replacementParts.length > 0).length;
    console.log(`   With symptoms: ${withSymptoms}`);
    console.log(`   With compatible models: ${withModels}`);
    console.log(`   With replacement parts: ${withReplacements}`);

    return allProducts;
}


function formatProductsForChromaDB(products) {
    return products.map(p => ({
        id: p.partNumber.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        partNumber: p.partNumber,
        name: p.name,
        description: p.description,
        category: p.category,
        brand: p.brand,
        manufacturerPartNumber: p.manufacturerPartNumber || '',
        manufacturedBy: p.manufacturedBy || '',
        manufacturedFor: p.manufacturedFor || [],
        symptoms: p.symptoms || [],
        productType: p.productType || '',
        compatibleModels: p.compatibleModels || [],
        replacementParts: p.replacementParts || [],
        url: p.url,
        imageUrl: p.imageUrl || '',
        scraped: true
    }));
}

module.exports = {
    scrapePartSelect,
    formatProductsForChromaDB
};
