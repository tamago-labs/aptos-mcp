/**
 * List all Thala pools (both DEX and staking)
 * @param aptosClient Aptos client instance
 * @returns Array of Thala pool information
 */
export async function listThalaPools(aptosClient: any): Promise<any> {
    try {
        const thalaAddress = "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af";
        
        // Get all resources from Thala
        const resources = await aptosClient.getAccountResources({
            accountAddress: thalaAddress
        });

        const pools: any[] = [];

        // Look for liquidity pools
        for (const resource of resources) {
            if (resource.type.includes("weighted_pool::WeightedPool")) {
                const poolData = resource.data as any;
                const typeParams = extractThalaTypeParameters(resource.type);
                
                pools.push({
                    type: "liquidity",
                    tokens: typeParams,
                    totalShares: poolData.total_shares || "0",
                    poolType: resource.type,
                    protocol: "thala-dex"
                });
            }
            
            if (resource.type.includes("staking")) {
                const poolData = resource.data as any;
                pools.push({
                    type: "staking",
                    stakingToken: extractThalaTypeParameters(resource.type)[0] || "unknown",
                    totalStaked: poolData.total_staked || "0",
                    poolType: resource.type,
                    protocol: "thala-staking"
                });
            }
        }

        return pools;
    } catch (error: any) {
        throw new Error(`Failed to list Thala pools: ${error.message}`);
    }
}

/**
 * Get available staking pools on Thala
 * @param aptosClient Aptos client instance
 * @returns Array of staking pool information
 */
export async function getThalaStakingPools(aptosClient: any): Promise<any> {
    try {
        const allPools = await listThalaPools(aptosClient);
        return allPools.filter((pool: any) => pool.type === "staking");
    } catch (error: any) {
        throw new Error(`Failed to get Thala staking pools: ${error.message}`);
    }
}

/**
 * Get Thala liquidity pools
 * @param aptosClient Aptos client instance
 * @returns Array of liquidity pool information
 */
export async function getThalaLiquidityPools(aptosClient: any): Promise<any> {
    try {
        const allPools = await listThalaPools(aptosClient);
        return allPools.filter((pool: any) => pool.type === "liquidity");
    } catch (error: any) {
        throw new Error(`Failed to get Thala liquidity pools: ${error.message}`);
    }
}

function extractThalaTypeParameters(resourceType: string): string[] {
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
