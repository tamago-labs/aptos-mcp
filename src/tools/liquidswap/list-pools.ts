import { AccountAddress } from "@aptos-labs/ts-sdk";

export const LIQUIDSWAP_POOLS_REGISTRY = "0x05a97986a9d031c4567e15b797be516910cfcb4156312482efc6a19c0a30c948::lp_coin::LP";

/**
 * List available liquidity pools on Liquidswap
 * @param aptosClient Aptos client instance
 * @returns Array of liquidity pool information
 */
export async function listLiquidswapPools(aptosClient: any): Promise<any> {
    try {
        // Get pool resources from the registry
        const poolResources = await aptosClient.getAccountResources({
            accountAddress: "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12"
        });

        const pools: any[] = [];
        
        // Filter and process pool resources
        for (const resource of poolResources) {
            if (resource.type.includes("liquidity_pool::LiquidityPool")) {
                const poolData = resource.data as any;
                
                // Extract token types from the resource type
                const typeParams = extractTypeParameters(resource.type);
                if (typeParams.length >= 2) {
                    pools.push({
                        coinX: typeParams[0],
                        coinY: typeParams[1],
                        reserveX: poolData.coin_x_reserve?.value || "0",
                        reserveY: poolData.coin_y_reserve?.value || "0",
                        lpTokenSupply: poolData.lp_coin_supply?.value || "0",
                        poolType: resource.type
                    });
                }
            }
        }

        return pools;
    } catch (error: any) {
        throw new Error(`Failed to list Liquidswap pools: ${error.message}`);
    }
}

/**
 * Get pool information for specific token pair
 * @param aptosClient Aptos client instance
 * @param tokenA First token address
 * @param tokenB Second token address
 * @returns Pool information
 */
export async function getLiquidswapPoolInfo(aptosClient: any, tokenA: string, tokenB: string): Promise<any> {
    try {
        const poolType = `0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::liquidity_pool::LiquidityPool<${tokenA}, ${tokenB}, 0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::curves::Uncorrelated>`;
        
        const resource = await aptosClient.getAccountResource({
            accountAddress: "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12",
            resourceType: poolType
        });

        const poolData = resource.data as any;
        
        return {
            coinX: tokenA,
            coinY: tokenB,
            reserveX: poolData.coin_x_reserve?.value || "0",
            reserveY: poolData.coin_y_reserve?.value || "0",
            lpTokenSupply: poolData.lp_coin_supply?.value || "0",
            poolType: poolType,
            exists: true
        };
    } catch (error: any) {
        // Try reverse order
        try {
            const reversePoolType = `0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::liquidity_pool::LiquidityPool<${tokenB}, ${tokenA}, 0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::curves::Uncorrelated>`;
            
            const resource = await aptosClient.getAccountResource({
                accountAddress: "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12",
                resourceType: reversePoolType
            });

            const poolData = resource.data as any;
            
            return {
                coinX: tokenB,
                coinY: tokenA,
                reserveX: poolData.coin_x_reserve?.value || "0",
                reserveY: poolData.coin_y_reserve?.value || "0",
                lpTokenSupply: poolData.lp_coin_supply?.value || "0",
                poolType: reversePoolType,
                exists: true
            };
        } catch (reverseError: any) {
            return {
                coinX: tokenA,
                coinY: tokenB,
                exists: false,
                error: `Pool not found for pair ${tokenA}/${tokenB}`
            };
        }
    }
}

function extractTypeParameters(resourceType: string): string[] {
    const match = resourceType.match(/<(.+)>/);
    if (!match) return [];
    
    const params = match[1];
    const result: string[] = [];
    let depth = 0;
    let current = "";
    
    for (const char of params) {
        if (char === '<') {
            depth++;
            current += char;
        } else if (char === '>') {
            depth--;
            current += char;
        } else if (char === ',' && depth === 0) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    
    if (current.trim()) {
        result.push(current.trim());
    }
    
    return result;
}
