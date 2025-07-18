import axios from "axios";

/**
 * List all available pools from Joule Finance
 * Following the exact same approach as move-agent-kit
 * @returns Array of pool information
 */
export async function listAllJoulePools(): Promise<any> {
    try {
        console.log("Fetching Joule Finance market data...");
        const response = await axios.get("https://price-api.joule.finance/api/market", {
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; Aptos-MCP-Client/1.0)'
            }
        });
        
        if (!response.data || !response.data.data) {
            throw new Error("Invalid response from Joule API");
        }

        console.log(`Processing ${response.data.data.length} pools...`);

        // Log first pool for debugging
        if (response.data.data.length > 0) {
            console.log("Sample raw pool data:");
            const sample = response.data.data[0];
            console.log({
                assetName: sample.asset?.assetName,
                marketSize: sample.marketSize,
                decimals: sample.asset?.decimals,
                depositApy: sample.depositApy,
                borrowApy: sample.borrowApy,
                ltv: sample.ltv,
                priceInfo: sample.priceInfo
            });
        }

        return response.data.data.map((pool: any, index: number) => {
            try {
                // Extract basic values
                const marketSizeRaw = Number(pool.marketSize) || 0;
                const totalBorrowedRaw = Number(pool.totalBorrowed) || 0;
                const decimals = Number(pool.asset?.decimals) || 6; // Default to 6 for most tokens
                
                // Follow move-agent-kit approach: divide by decimals directly, not Math.pow(10, decimals)
                const marketSize = decimals > 0 ? marketSizeRaw / Math.pow(10, decimals) : marketSizeRaw;
                const totalBorrowed = decimals > 0 ? totalBorrowedRaw / Math.pow(10, decimals) : totalBorrowedRaw;
                const available = Math.max(0, marketSize - totalBorrowed);
                
                // Handle APY values - these appear to be in percentage format (340 = 3.4%)
                const depositApy = (Number(pool.depositApy) || 0) / 100; // Convert percentage to decimal
                const borrowApy = (Number(pool.borrowApy) || 0) / 100; // Convert percentage to decimal
                
                // Handle extra APY
                let extraDepositApy = 0;
                if (pool.extraAPY && typeof pool.extraAPY === 'object' && pool.extraAPY.depositAPY) {
                    extraDepositApy = Number(pool.extraAPY.depositAPY) / 100; // Also in percentage
                }
                
                // Handle LTV - test different formats to see what makes sense
                let ltv = Number(pool.ltv) || 0;
                // If LTV > 100, it's likely in basis points or wrong format
                if (ltv > 100) {
                    ltv = ltv / 10000; // Try basis points first
                    if (ltv > 1) {
                        ltv = ltv / 100; // If still > 1, try percentage
                    }
                } else if (ltv > 1) {
                    ltv = ltv / 100; // Convert percentage to decimal
                }
                
                // Handle price
                const price = Number(pool.priceInfo?.price || pool.price) || 0;
                
                // Calculate utilization
                const utilization = marketSize > 0 ? totalBorrowed / marketSize : 0;
                
                const result = {
                    assetName: pool.asset?.assetName || `Unknown-${index}`,
                    tokenAddress: pool.asset?.type || "unknown",
                    ltv: ltv,
                    decimals: decimals,
                    marketSize: marketSize,
                    totalBorrowed: totalBorrowed,
                    depositApy: depositApy,
                    extraDepositApy: extraDepositApy,
                    borrowApy: borrowApy,
                    price: price,
                    utilization: utilization,
                    available: available
                };
                
                // Log first few pools for debugging
                if (index < 2) {
                    console.log(`Pool ${index + 1} (${result.assetName}):`, {
                        depositApy: `${(result.depositApy * 100).toFixed(2)}%`,
                        borrowApy: `${(result.borrowApy * 100).toFixed(2)}%`,
                        ltv: `${(result.ltv * 100).toFixed(0)}%`,
                        marketSize: result.marketSize.toFixed(2),
                        price: `$${result.price.toFixed(4)}`
                    });
                }
                
                return result;
                
            } catch (poolError) {
                console.warn(`Error processing pool ${index}:`, poolError);
                return {
                    assetName: `Error-${index}`,
                    tokenAddress: "error",
                    ltv: 0,
                    decimals: 6,
                    marketSize: 0,
                    totalBorrowed: 0,
                    depositApy: 0,
                    extraDepositApy: 0,
                    borrowApy: 0,
                    price: 0,
                    utilization: 0,
                    available: 0,
                    error: poolError instanceof Error ? poolError.message : String(poolError)
                };
            }
        });
    } catch (error: any) {
        console.error("Joule API Error:", error.message);
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response headers:", error.response.headers);
        }
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
        return pools.filter((pool: any) => !pool.error).map((pool: any) => ({
            name: pool.assetName,
            address: pool.tokenAddress,
            decimals: pool.decimals,
            price: pool.price
        }));
    } catch (error: any) {
        throw new Error(`Failed to get available tokens: ${error.message}`);
    }
}

/**
 * Get a specific pool by token address (following move-agent-kit pattern exactly)
 * @param mint Token address to search for
 * @returns Pool details
 */
export async function getJoulePoolDetails(mint: string): Promise<any> {
    try {
        const response = await axios.get("https://price-api.joule.finance/api/market");
        
        if (!response.data || !response.data.data) {
            throw new Error("Invalid response from Joule API");
        }

        const poolDetail = response.data.data.find((pool: any) => 
            pool.asset?.type?.includes(mint) || pool.asset?.type === mint
        );

        if (!poolDetail) {
            throw new Error(`Pool not found for token: ${mint}`);
        }

        // Follow move-agent-kit approach exactly - they divide by decimals, not Math.pow
        // But this seems wrong for token amounts, so let's use the correct approach
        const marketSizeRaw = Number(poolDetail.marketSize) || 0;
        const totalBorrowedRaw = Number(poolDetail.totalBorrowed) || 0;
        const decimals = Number(poolDetail.asset?.decimals) || 6;
        
        return {
            assetName: poolDetail.asset?.assetName,
            tokenAddress: mint,
            ltv: (Number(poolDetail.ltv) || 0) / 10000, // Convert from basis points
            decimals: decimals,
            marketSize: marketSizeRaw / Math.pow(10, decimals), // Use proper decimal conversion
            totalBorrowed: totalBorrowedRaw / Math.pow(10, decimals),
            depositApy: (Number(poolDetail.depositApy) || 0) / 100, // Convert from percentage
            extraDepositApy: (Number(poolDetail.extraAPY?.depositAPY) || 0) / 100,
            borrowApy: (Number(poolDetail.borrowApy) || 0) / 100,
            price: Number(poolDetail.priceInfo?.price) || 0,
        };
    } catch (error: any) {
        throw new Error(`Failed to get pool details: ${error.message}`);
    }
}
