import { listAllJoulePools, getAvailableJouleTokens } from "./joule/list-all-pools";
import { listLiquidswapPools, getLiquidswapPoolInfo } from "./liquidswap/list-pools";
import { listThalaPools, getThalaStakingPools } from "./thala/list-pools";

export const COMMON_TOKENS = [
    {
        name: "APT",
        address: "0x1::aptos_coin::AptosCoin",
        decimals: 8,
        symbol: "APT"
    },
    {
        name: "USDT",
        address: "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
        decimals: 6,
        symbol: "USDT"
    },
    {
        name: "USDC", 
        address: "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T",
        decimals: 6,
        symbol: "USDC"
    },
    {
        name: "WETH",
        address: "0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb::coin::T",
        decimals: 6,
        symbol: "WETH"
    }
];

/**
 * Get all supported tokens across all protocols
 * @returns Array of token information
 */
export async function listAllSupportedTokens(): Promise<any> {
    try {
        const tokens = new Map();

        // Add common tokens
        COMMON_TOKENS.forEach(token => {
            tokens.set(token.address, token);
        });

        // Add Joule tokens
        try {
            const jouleTokens = await getAvailableJouleTokens();
            jouleTokens.forEach((token: any) => {
                if (!tokens.has(token.address)) {
                    tokens.set(token.address, {
                        name: token.name,
                        address: token.address,
                        decimals: token.decimals,
                        symbol: token.name,
                        protocols: ["joule"]
                    });
                } else {
                    const existing = tokens.get(token.address);
                    existing.protocols = [...(existing.protocols || []), "joule"];
                }
            });
        } catch (error) {
            console.warn("Failed to get Joule tokens:", error);
        }

        return Array.from(tokens.values());
    } catch (error: any) {
        throw new Error(`Failed to list all supported tokens: ${error.message}`);
    }
}

/**
 * Search tokens by name or symbol
 * @param query Search query
 * @returns Array of matching tokens
 */
export async function searchTokens(query: string): Promise<any> {
    try {
        const allTokens = await listAllSupportedTokens();
        const searchTerm = query.toLowerCase();
        
        return allTokens.filter((token: any) => 
            token.name.toLowerCase().includes(searchTerm) ||
            token.symbol.toLowerCase().includes(searchTerm) ||
            token.address.toLowerCase().includes(searchTerm)
        );
    } catch (error: any) {
        throw new Error(`Failed to search tokens: ${error.message}`);
    }
}

/**
 * Get all available liquidity pools across all DEXes
 * @param aptosClient Aptos client instance
 * @returns Array of pool information from all DEXes
 */
export async function getAllLiquidityPools(aptosClient: any): Promise<any> {
    const allPools: any[] = [];

    try {
        // Get Liquidswap pools
        const liquidswapPools = await listLiquidswapPools(aptosClient);
        allPools.push(...liquidswapPools.map((pool: any) => ({
            ...pool,
            protocol: "liquidswap",
            type: "liquidity"
        })));
    } catch (error) {
        console.warn("Failed to get Liquidswap pools:", error);
    }

    try {
        // Get Thala liquidity pools
        const thalaPools = await listThalaPools(aptosClient);
        const thalaLiquidityPools = thalaPools.filter((pool: any) => pool.type === "liquidity");
        allPools.push(...thalaLiquidityPools.map((pool: any) => ({
            ...pool,
            protocol: "thala"
        })));
    } catch (error) {
        console.warn("Failed to get Thala pools:", error);
    }

    return allPools;
}

/**
 * Get best lending rates across all protocols
 * @returns Array of rate comparisons
 */
export async function getBestLendingRates(): Promise<any> {
    try {
        const rates: any[] = [];

        // Get Joule rates
        try {
            const joulePools = await listAllJoulePools();
            joulePools.forEach((pool: any) => {
                rates.push({
                    protocol: "joule",
                    token: pool.assetName,
                    tokenAddress: pool.tokenAddress,
                    depositApy: pool.depositApy,
                    borrowApy: pool.borrowApy,
                    utilization: pool.utilization,
                    available: pool.available,
                    marketSize: pool.marketSize
                });
            });
        } catch (error) {
            console.warn("Failed to get Joule rates:", error);
        }

        // Sort by deposit APY for best lending rates
        return rates.sort((a, b) => b.depositApy - a.depositApy);
    } catch (error: any) {
        throw new Error(`Failed to get best lending rates: ${error.message}`);
    }
}
