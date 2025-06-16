import axios from "axios";

/**
 * Get token price
 * @param query Token symbol or name
 * @returns Price information
 */
export async function getTokenPrice(query: string): Promise<{ price: number; symbol: string }> {
    try {
        // Simple price fetching - in practice you'd use a proper price API
        if (query.toLowerCase() === 'apt' || query.toLowerCase() === 'aptos') {
            const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=aptos&vs_currencies=usd');
            return {
                price: response.data.aptos?.usd || 0,
                symbol: 'APT'
            };
        }
        
        return {
            price: 0,
            symbol: query.toUpperCase()
        };
    } catch (error: any) {
        throw new Error(`Failed to get token price: ${error.message}`);
    }
}
