/**
 * RAG Service Tests
 * 
 * Note: These are unit tests that mock the vector store.
 * For integration tests, you'd need ChromaDB running.
 */

// Mock the vectorStore module
jest.mock('../vectorStore', () => ({
    searchProducts: jest.fn(),
}));

const { searchProducts } = require('../vectorStore');
const { getRelevantContext } = require('../ragService');

describe('ragService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getRelevantContext', () => {
        it('returns formatted context when products are found', async () => {
            const mockProducts = [
                {
                    partNumber: 'PS12345',
                    name: 'Test Part',
                    category: 'Refrigerator Parts',
                    brand: 'Whirlpool',
                    url: 'https://example.com/part',
                    description: 'A test part',
                    symptoms: ['Not cooling'],
                    replacementParts: ['AP123'],
                    compatibleModels: ['Model1'],
                },
            ];
            searchProducts.mockResolvedValue(mockProducts);

            const result = await getRelevantContext('I need a refrigerator part');

            expect(result).toContain('PS12345');
            expect(result).toContain('Test Part');
            expect(result).toContain('Whirlpool');
            expect(searchProducts).toHaveBeenCalledWith('I need a refrigerator part', 10);
        });

        it('returns null when no products are found', async () => {
            searchProducts.mockResolvedValue([]);

            const result = await getRelevantContext('random query');

            expect(result).toBeNull();
        });

        it('returns null on error', async () => {
            searchProducts.mockRejectedValue(new Error('DB error'));

            const result = await getRelevantContext('test query');

            expect(result).toBeNull();
        });

        it('includes symptoms in context when available', async () => {
            const mockProducts = [
                {
                    partNumber: 'PS99999',
                    name: 'Ice Maker',
                    category: 'Refrigerator Parts',
                    brand: 'Samsung',
                    url: 'https://example.com',
                    symptoms: ['Not making ice', 'Leaking'],
                },
            ];
            searchProducts.mockResolvedValue(mockProducts);

            const result = await getRelevantContext('ice maker not working');

            expect(result).toContain('Not making ice');
            expect(result).toContain('Leaking');
        });
    });
});
