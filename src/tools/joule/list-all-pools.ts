import axios from "axios";

/**
 * List all available pools from Joule Finance
 * @returns Array of pool information
 */
export async function listAllJoulePools(): Promise<any> {
    try {
        const response = await axios.get("https://price-api.joule.finance/api/market");
        
        if (!response.data || !response.data.data) {
            throw new Error("Invalid response from Joule API");
        }

        return response.data.data.map((pool: any) => ({
            assetName: pool.asset.assetName,
            tokenAddress: pool.asset.type,
            ltv: pool.ltv,
            decimals: pool.asset.decimals,
            marketSize: Number(pool.marketSize) / Math.pow(10, pool.asset.decimals),
            totalBorrowed: Number(pool.totalBorrowed) / Math.pow(10, pool.asset.decimals),
            depositApy: pool.depositApy,
            extraDepositApy: pool.extraAPY?.depositAPY || 0,
            borrowApy: pool.borrowApy,
            price: pool.priceInfo?.price || 0,
            utilization: pool.utilization || 0,
            available: (Number(pool.marketSize) - Number(pool.totalBorrowed)) / Math.pow(10, pool.asset.decimals)
        }));
    } catch (error: any) {
        throw new Error(`Failed to list Joule pools: ${error.message}`);
    }
}

/**
 * Get available tokens on Joule Finance
 * @returns Array of supported tokens
 */
export async function getAvailableJouleTokens(): Promise<any> {
    try {
        const pools = await listAllJoulePools();
        return pools.map((pool: any) => ({
            name: pool.assetName,
            address: pool.tokenAddress,
            decimals: pool.decimals,
            price: pool.price
        }));
    } catch (error: any) {
        throw new Error(`Failed to get available tokens: ${error.message}`);
    }
}
