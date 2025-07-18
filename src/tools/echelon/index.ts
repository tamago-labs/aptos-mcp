import { Aptos } from "@aptos-labs/ts-sdk";
import { resolveCoinNameWithConfidence, resolveCoinNames } from "../../utils/coin-resolver";

// Echelon contract address on Aptos mainnet
const ECHELON_CONTRACT_ADDRESS = "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba";

/**
 * List all available markets on Echelon Finance using direct contract calls only
 * No SDK dependencies required
 */
export async function listEchelonMarkets(aptosClient: Aptos): Promise<any> {
    try {
        console.log("🔍 Fetching Echelon markets...");
        
        // Get all market objects using the correct module name
        const marketsResult = await aptosClient.view({
            payload: {
                function: `${ECHELON_CONTRACT_ADDRESS}::lending::market_objects`,
                functionArguments: [],
                typeArguments: []
            }
        });

        if (!marketsResult || !Array.isArray(marketsResult[0])) {
            throw new Error("Failed to fetch markets from Echelon");
        }

        // Extract market addresses from the result
        const markets = (marketsResult[0] as { inner: string }[]).map(m => m.inner);
        console.log(`Found ${markets.length} markets to process`);
        
        const marketDetails = [];

        // Get details for each market
        for (const marketId of markets) {
            try {
                console.log(`Processing market: ${marketId}`);

                // Get market data using parallel requests for better performance
                const [supplyAprResult, borrowAprResult, priceResult, coinResult] = await Promise.all([
                    aptosClient.view({
                        payload: {
                            function: `${ECHELON_CONTRACT_ADDRESS}::lending::supply_interest_rate`,
                            functionArguments: [marketId],
                            typeArguments: []
                        }
                    }),
                    aptosClient.view({
                        payload: {
                            function: `${ECHELON_CONTRACT_ADDRESS}::lending::borrow_interest_rate`,
                            functionArguments: [marketId],
                            typeArguments: []
                        }
                    }),
                    aptosClient.view({
                        payload: {
                            function: `${ECHELON_CONTRACT_ADDRESS}::lending::asset_price`,
                            functionArguments: [marketId],
                            typeArguments: []
                        }
                    }),
                    aptosClient.view({
                        payload: {
                            function: `${ECHELON_CONTRACT_ADDRESS}::lending::market_coin`,
                            functionArguments: [marketId],
                            typeArguments: []
                        }
                    })
                ]);

                // Get additional market statistics
                const [statsResult, totalCashResult, totalLiabilityResult] = await Promise.all([
                    aptosClient.view({
                        payload: {
                            function: `${ECHELON_CONTRACT_ADDRESS}::lending::market_statistics`,
                            functionArguments: [marketId],
                            typeArguments: []
                        }
                    }),
                    aptosClient.view({
                        payload: {
                            function: `${ECHELON_CONTRACT_ADDRESS}::lending::market_total_cash`,
                            functionArguments: [marketId],
                            typeArguments: []
                        }
                    }),
                    aptosClient.view({
                        payload: {
                            function: `${ECHELON_CONTRACT_ADDRESS}::lending::market_total_liability`,
                            functionArguments: [marketId],
                            typeArguments: []
                        }
                    })
                ]);

                // Convert FP64 fixed-point values to readable numbers
                const supplyApr = convertFp64ToFloat((supplyAprResult[0] as any).v);
                const borrowApr = convertFp64ToFloat((borrowAprResult[0] as any).v);
                const price = convertFp64ToFloat((priceResult[0] as any).v);

                // Extract coin type name
                const coinAddress = coinResult[0] as string;
                
                // Extract statistics
                const stats = statsResult as number[];
                const totalCash = Number(totalCashResult[0]);
                const totalLiability = Number(totalLiabilityResult[0]);

                marketDetails.push({
                    marketId: marketId,
                    coinAddress: coinAddress,
                    supplyApr: supplyApr,
                    borrowApr: borrowApr,
                    price: price,
                    totalCash: totalCash,
                    totalLiability: totalLiability,
                    utilization: totalCash > 0 ? totalLiability / (totalCash + totalLiability) : 0,
                    protocol: "echelon",
                    implementation: "direct_calls"
                });

                console.log(`✓ Successfully processed market ${marketId}`);

            } catch (error) {
                console.warn(`Failed to get details for market ${marketId}:`, error);
                // Add basic market info even if details fail
                marketDetails.push({
                    marketId: marketId,
                    coinAddress: "unknown",
                    supplyApr: 0,
                    borrowApr: 0,
                    price: 0,
                    totalCash: 0,
                    totalLiability: 0,
                    utilization: 0,
                    protocol: "echelon",
                    implementation: "direct_calls",
                    error: "Failed to fetch market details"
                });
            }
        }

        console.log(`Successfully processed ${marketDetails.length} markets`);
        
        // Resolve coin names for all markets
        console.log("🔍 Resolving coin names...");
        const coinAddresses = marketDetails.map(m => m.coinAddress).filter(addr => addr && addr !== "unknown");
        const resolvedNames = await resolveCoinNames(aptosClient, coinAddresses);
        
        // Update market details with resolved names
        marketDetails.forEach(market => {
            if (market.coinAddress && resolvedNames[market.coinAddress]) {
                market.coinName = resolvedNames[market.coinAddress];
                market.coinDisplayName = resolvedNames[market.coinAddress];
            } else {
                const resolved = resolveCoinNameWithConfidence(market.coinAddress);
                market.coinName = resolved.name;
                market.coinDisplayName = `${resolved.name} (${resolved.confidence})`;
                market.coinConfidence = resolved.confidence;
            }
        });
        
        console.log(`✅ Resolved ${Object.keys(resolvedNames).length} coin names`);
        return marketDetails;

    } catch (error: any) {
        console.error("Error in listEchelonMarkets:", error);
        throw new Error(`Failed to list Echelon markets: ${error.message}`);
    }
}

/**
 * Get user positions on Echelon Finance using direct contract calls only
 */
export async function getEchelonUserPosition(
    aptosClient: Aptos,
    userAddress: string,
    market: string
): Promise<any> {
    try {
        console.log(`Getting position for user ${userAddress} in market ${market}`);

        // Get all position data using parallel requests
        const [supplyResult, liabilityResult, borrowableResult, withdrawableResult] = await Promise.all([
            aptosClient.view({
                payload: {
                    function: `${ECHELON_CONTRACT_ADDRESS}::lending::account_coins`,
                    functionArguments: [userAddress, market],
                    typeArguments: []
                }
            }),
            aptosClient.view({
                payload: {
                    function: `${ECHELON_CONTRACT_ADDRESS}::lending::account_liability`,
                    functionArguments: [userAddress, market],
                    typeArguments: []
                }
            }),
            aptosClient.view({
                payload: {
                    function: `${ECHELON_CONTRACT_ADDRESS}::lending::account_borrowable_coins`,
                    functionArguments: [userAddress, market],
                    typeArguments: []
                }
            }),
            aptosClient.view({
                payload: {
                    function: `${ECHELON_CONTRACT_ADDRESS}::lending::account_withdrawable_coins`,
                    functionArguments: [userAddress, market],
                    typeArguments: []
                }
            })
        ]);

        const position = {
            market: market,
            userAddress: userAddress,
            supplied: Number(supplyResult[0]),
            borrowed: Number(liabilityResult[0]),
            borrowable: Number(borrowableResult[0]),
            withdrawable: Number(withdrawableResult[0]),
            protocol: "echelon",
            implementation: "direct_calls"
        };

        console.log(`✓ Successfully retrieved position for ${userAddress}`);
        return position;

    } catch (error: any) {
        console.error(`Error getting position for ${userAddress}:`, error);
        throw new Error(`Failed to get Echelon user position: ${error.message}`);
    }
}

/**
 * Get basic market information for a single market
 */
export async function getEchelonMarketInfo(
    aptosClient: Aptos,
    marketId: string
): Promise<any> {
    try {
        const [supplyAprResult, borrowAprResult, priceResult, coinResult] = await Promise.all([
            aptosClient.view({
                payload: {
                    function: `${ECHELON_CONTRACT_ADDRESS}::lending::supply_interest_rate`,
                    functionArguments: [marketId],
                    typeArguments: []
                }
            }),
            aptosClient.view({
                payload: {
                    function: `${ECHELON_CONTRACT_ADDRESS}::lending::borrow_interest_rate`,
                    functionArguments: [marketId],
                    typeArguments: []
                }
            }),
            aptosClient.view({
                payload: {
                    function: `${ECHELON_CONTRACT_ADDRESS}::lending::asset_price`,
                    functionArguments: [marketId],
                    typeArguments: []
                }
            }),
            aptosClient.view({
                payload: {
                    function: `${ECHELON_CONTRACT_ADDRESS}::lending::market_coin`,
                    functionArguments: [marketId],
                    typeArguments: []
                }
            })
        ]);

        return {
            marketId: marketId,
            coinAddress: coinResult[0] as string,
            supplyApr: convertFp64ToFloat((supplyAprResult[0] as any).v),
            borrowApr: convertFp64ToFloat((borrowAprResult[0] as any).v),
            price: convertFp64ToFloat((priceResult[0] as any).v),
            protocol: "echelon"
        };
    } catch (error: any) {
        throw new Error(`Failed to get market info for ${marketId}: ${error.message}`);
    }
}

/**
 * Convert FP64 fixed-point format to float using the same algorithm as Echelon SDK
 * This implementation matches the one used in the official SDK
 */
function convertFp64ToFloat(fp64Value: string): number {
    try {
        const a = BigInt(fp64Value);
        
        // Check for too large values (same as SDK)
        const ZERO = BigInt(0);
        const ONE = BigInt(1);
        let mask = BigInt("0xffffffff000000000000000000000000");
        if ((a & mask) != ZERO) {
            throw new Error("FP64 value too large");
        }

        // Integer part
        mask = BigInt("0x10000000000000000");
        let base = 1;
        let result = 0;
        for (let i = 0; i < 32; ++i) {
            if ((a & mask) != ZERO) {
                result += base;
            }
            base *= 2;
            mask = mask << ONE;
        }

        // Fractional part
        mask = BigInt("0x8000000000000000");
        base = 0.5;
        for (let i = 0; i < 32; ++i) {
            if ((a & mask) != ZERO) {
                result += base;
            }
            base /= 2;
            mask = mask >> ONE;
        }
        
        return result;
    } catch (error) {
        console.warn(`Failed to convert FP64 value ${fp64Value}:`, error);
        return 0;
    }
}

/**
 * Utility function to format APR as percentage
 */
export function formatAprAsPercentage(apr: number): string {
    return `${(apr * 100).toFixed(2)}%`;
}

/**
 * Utility function to format price with appropriate decimals
 */
export function formatPrice(price: number): string {
    if (price < 0.01) {
        return `$${price.toFixed(6)}`;
    } else if (price < 1) {
        return `$${price.toFixed(4)}`;
    } else {
        return `$${price.toFixed(2)}`;
    }
}

// Export the main service object
export const EchelonMarketService = {
    listMarkets: listEchelonMarkets,
    getUserPosition: getEchelonUserPosition,
    getMarketInfo: getEchelonMarketInfo,
    formatApr: formatAprAsPercentage,
    formatPrice: formatPrice,
    contractAddress: ECHELON_CONTRACT_ADDRESS
};
