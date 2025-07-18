/**
 * Echelon Finance integration for Aptos
 * Uses EchelonClient SDK for market interactions
 */

export const ECHELON_CONTRACT_ADDRESS = "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba";

/**
 * List all available markets on Echelon Finance
 * @param aptosClient Aptos client instance
 * @returns Array of market information with APY data
 */
export async function listEchelonMarkets(aptosClient: any): Promise<any> {
    try {
        // Note: This requires @echelonmarket/echelon-sdk to be installed
        // For now, we'll implement using direct contract calls
        
        // Get all markets using view function
        const marketsResult = await aptosClient.view({
            payload: {
                function: `${ECHELON_CONTRACT_ADDRESS}::market::get_all_markets`,
                functionArguments: []
            }
        });

        if (!marketsResult || !Array.isArray(marketsResult[0])) {
            throw new Error("Failed to fetch markets from Echelon");
        }

        const markets = marketsResult[0];
        const marketDetails = [];

        // Get details for each market
        for (const marketId of markets) {
            try {
                // Get coin address for the market
                const coinResult = await aptosClient.view({
                    payload: {
                        function: `${ECHELON_CONTRACT_ADDRESS}::market::get_market_coin`,
                        functionArguments: [marketId]
                    }
                });

                // Get supply APR
                const supplyAprResult = await aptosClient.view({
                    payload: {
                        function: `${ECHELON_CONTRACT_ADDRESS}::market::get_supply_apr`,
                        functionArguments: [marketId]
                    }
                });

                // Get borrow APR
                const borrowAprResult = await aptosClient.view({
                    payload: {
                        function: `${ECHELON_CONTRACT_ADDRESS}::market::get_borrow_apr`,
                        functionArguments: [marketId]
                    }
                });

                // Get coin price
                const priceResult = await aptosClient.view({
                    payload: {
                        function: `${ECHELON_CONTRACT_ADDRESS}::market::get_coin_price`,
                        functionArguments: [marketId]
                    }
                });

                marketDetails.push({
                    marketId: marketId,
                    coinAddress: coinResult[0],
                    supplyApr: Number(supplyAprResult[0]) / 10000, // Convert from basis points
                    borrowApr: Number(borrowAprResult[0]) / 10000, // Convert from basis points
                    price: Number(priceResult[0]) / 1e8, // Assuming 8 decimal price format
                    protocol: "echelon"
                });
            } catch (error) {
                console.warn(`Failed to get details for market ${marketId}:`, error);
                // Add basic market info even if details fail
                marketDetails.push({
                    marketId: marketId,
                    coinAddress: "unknown",
                    supplyApr: 0,
                    borrowApr: 0,
                    price: 0,
                    protocol: "echelon",
                    error: "Failed to fetch market details"
                });
            }
        }

        return marketDetails;
    } catch (error: any) {
        throw new Error(`Failed to list Echelon markets: ${error.message}`);
    }
}

/**
 * Supply (lend) tokens to Echelon Finance
 * @param aptosClient Aptos client instance
 * @param account User account
 * @param coinAddress Token address to supply
 * @param market Market identifier
 * @param amount Amount to supply
 * @returns Transaction hash
 */
export async function supplyToEchelon(
    aptosClient: any,
    account: any,
    coinAddress: string,
    market: string,
    amount: number
): Promise<string> {
    try {
        const transaction = await aptosClient.transaction.build.simple({
            sender: account.getAddress(),
            data: {
                function: `${ECHELON_CONTRACT_ADDRESS}::market::supply`,
                typeArguments: [coinAddress],
                functionArguments: [market, amount]
            }
        });

        const committedTransactionHash = await account.sendTransaction(transaction);
        
        const signedTransaction = await aptosClient.waitForTransaction({
            transactionHash: committedTransactionHash,
        });

        if (!signedTransaction.success) {
            throw new Error("Supply transaction failed");
        }

        return signedTransaction.hash;
    } catch (error: any) {
        throw new Error(`Failed to supply to Echelon: ${error.message}`);
    }
}

/**
 * Borrow tokens from Echelon Finance
 * @param aptosClient Aptos client instance
 * @param account User account
 * @param coinAddress Token address to borrow
 * @param market Market identifier
 * @param amount Amount to borrow
 * @returns Transaction hash
 */
export async function borrowFromEchelon(
    aptosClient: any,
    account: any,
    coinAddress: string,
    market: string,
    amount: number
): Promise<string> {
    try {
        const transaction = await aptosClient.transaction.build.simple({
            sender: account.getAddress(),
            data: {
                function: `${ECHELON_CONTRACT_ADDRESS}::market::borrow`,
                typeArguments: [coinAddress],
                functionArguments: [market, amount]
            }
        });

        const committedTransactionHash = await account.sendTransaction(transaction);
        
        const signedTransaction = await aptosClient.waitForTransaction({
            transactionHash: committedTransactionHash,
        });

        if (!signedTransaction.success) {
            throw new Error("Borrow transaction failed");
        }

        return signedTransaction.hash;
    } catch (error: any) {
        throw new Error(`Failed to borrow from Echelon: ${error.message}`);
    }
}

/**
 * Repay borrowed tokens to Echelon Finance
 * @param aptosClient Aptos client instance
 * @param account User account
 * @param coinAddress Token address to repay
 * @param market Market identifier
 * @param amount Amount to repay
 * @returns Transaction hash
 */
export async function repayToEchelon(
    aptosClient: any,
    account: any,
    coinAddress: string,
    market: string,
    amount: number
): Promise<string> {
    try {
        const transaction = await aptosClient.transaction.build.simple({
            sender: account.getAddress(),
            data: {
                function: `${ECHELON_CONTRACT_ADDRESS}::market::repay`,
                typeArguments: [coinAddress],
                functionArguments: [market, amount]
            }
        });

        const committedTransactionHash = await account.sendTransaction(transaction);
        
        const signedTransaction = await aptosClient.waitForTransaction({
            transactionHash: committedTransactionHash,
        });

        if (!signedTransaction.success) {
            throw new Error("Repay transaction failed");
        }

        return signedTransaction.hash;
    } catch (error: any) {
        throw new Error(`Failed to repay to Echelon: ${error.message}`);
    }
}

/**
 * Withdraw supplied tokens from Echelon Finance
 * @param aptosClient Aptos client instance
 * @param account User account
 * @param coinAddress Token address to withdraw
 * @param market Market identifier
 * @param share Share amount to withdraw (use convertAmountToShare)
 * @returns Transaction hash
 */
export async function withdrawFromEchelon(
    aptosClient: any,
    account: any,
    coinAddress: string,
    market: string,
    share: number
): Promise<string> {
    try {
        const transaction = await aptosClient.transaction.build.simple({
            sender: account.getAddress(),
            data: {
                function: `${ECHELON_CONTRACT_ADDRESS}::market::withdraw`,
                typeArguments: [coinAddress],
                functionArguments: [market, share]
            }
        });

        const committedTransactionHash = await account.sendTransaction(transaction);
        
        const signedTransaction = await aptosClient.waitForTransaction({
            transactionHash: committedTransactionHash,
        });

        if (!signedTransaction.success) {
            throw new Error("Withdraw transaction failed");
        }

        return signedTransaction.hash;
    } catch (error: any) {
        throw new Error(`Failed to withdraw from Echelon: ${error.message}`);
    }
}

/**
 * Get user positions on Echelon Finance
 * @param aptosClient Aptos client instance
 * @param userAddress User address
 * @param market Market identifier
 * @returns User position information
 */
export async function getEchelonUserPosition(
    aptosClient: any,
    userAddress: string,
    market: string
): Promise<any> {
    try {
        // Get supply amount
        const supplyResult = await aptosClient.view({
            payload: {
                function: `${ECHELON_CONTRACT_ADDRESS}::market::get_account_supply`,
                functionArguments: [userAddress, market]
            }
        });

        // Get liability (borrowed) amount
        const liabilityResult = await aptosClient.view({
            payload: {
                function: `${ECHELON_CONTRACT_ADDRESS}::market::get_account_liability`,
                functionArguments: [userAddress, market]
            }
        });

        // Get borrowable amount
        const borrowableResult = await aptosClient.view({
            payload: {
                function: `${ECHELON_CONTRACT_ADDRESS}::market::get_account_borrowable`,
                functionArguments: [userAddress, market]
            }
        });

        // Get withdrawable amount
        const withdrawableResult = await aptosClient.view({
            payload: {
                function: `${ECHELON_CONTRACT_ADDRESS}::market::get_account_withdrawable`,
                functionArguments: [userAddress, market]
            }
        });

        return {
            market: market,
            supplied: Number(supplyResult[0]),
            borrowed: Number(liabilityResult[0]),
            borrowable: Number(borrowableResult[0]),
            withdrawable: Number(withdrawableResult[0]),
            protocol: "echelon"
        };
    } catch (error: any) {
        throw new Error(`Failed to get Echelon user position: ${error.message}`);
    }
}
