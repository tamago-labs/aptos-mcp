/**
 * MerkleTrade integration for perpetual trading
 */

export interface MerklePosition {
    id: string;
    market: string;
    side: "long" | "short";
    size: number;
    collateral: number;
    avgPrice: number;
    markPrice: number;
    pnl: number;
    marginRatio: number;
    liquidationPrice: number;
}

export interface MerkleOrderParams {
    market: string;
    side: "long" | "short";
    size: number;
    price?: number; // For limit orders
    reduceOnly?: boolean;
    stopLoss?: number;
    takeProfit?: number;
}

/**
 * Place a market order on MerkleTrade
 * @param aptosClient Aptos client instance
 * @param account User account
 * @param params Order parameters
 * @returns Transaction hash
 */
export async function placeMerkleMarketOrder(
    aptosClient: any,
    account: any,
    params: MerkleOrderParams
): Promise<string> {
    try {
        const transaction = await aptosClient.transaction.build.simple({
            sender: account.getAddress(),
            data: {
                function: "0x5ae6789dd2fec1a9ec9cccfb3acaf12e93d432f0a3a42c92fe1a9d490b7bbc06::trading::place_market_order",
                functionArguments: [
                    params.market,
                    params.side === "long" ? 0 : 1,
                    params.size,
                    params.reduceOnly || false
                ]
            }
        });

        const committedTransactionHash = await account.sendTransaction(transaction);
        
        const signedTransaction = await aptosClient.waitForTransaction({
            transactionHash: committedTransactionHash,
        });

        if (!signedTransaction.success) {
            throw new Error("Market order failed");
        }

        return signedTransaction.hash;
    } catch (error: any) {
        throw new Error(`Failed to place market order: ${error.message}`);
    }
}

/**
 * Place a limit order on MerkleTrade
 * @param aptosClient Aptos client instance
 * @param account User account
 * @param params Order parameters
 * @returns Transaction hash
 */
export async function placeMerkleLimitOrder(
    aptosClient: any,
    account: any,
    params: MerkleOrderParams
): Promise<string> {
    try {
        if (!params.price) {
            throw new Error("Price is required for limit orders");
        }

        const transaction = await aptosClient.transaction.build.simple({
            sender: account.getAddress(),
            data: {
                function: "0x5ae6789dd2fec1a9ec9cccfb3acaf12e93d432f0a3a42c92fe1a9d490b7bbc06::trading::place_limit_order",
                functionArguments: [
                    params.market,
                    params.side === "long" ? 0 : 1,
                    params.size,
                    params.price,
                    params.reduceOnly || false
                ]
            }
        });

        const committedTransactionHash = await account.sendTransaction(transaction);
        
        const signedTransaction = await aptosClient.waitForTransaction({
            transactionHash: committedTransactionHash,
        });

        if (!signedTransaction.success) {
            throw new Error("Limit order failed");
        }

        return signedTransaction.hash;
    } catch (error: any) {
        throw new Error(`Failed to place limit order: ${error.message}`);
    }
}

/**
 * Close a position on MerkleTrade
 * @param aptosClient Aptos client instance
 * @param account User account
 * @param positionId Position ID to close
 * @param size Size to close (optional, closes full position if not specified)
 * @returns Transaction hash
 */
export async function closeMerklePosition(
    aptosClient: any,
    account: any,
    positionId: string,
    size?: number
): Promise<string> {
    try {
        const transaction = await aptosClient.transaction.build.simple({
            sender: account.getAddress(),
            data: {
                function: "0x5ae6789dd2fec1a9ec9cccfb3acaf12e93d432f0a3a42c92fe1a9d490b7bbc06::trading::close_position",
                functionArguments: [
                    positionId,
                    size || 0 // 0 means close full position
                ]
            }
        });

        const committedTransactionHash = await account.sendTransaction(transaction);
        
        const signedTransaction = await aptosClient.waitForTransaction({
            transactionHash: committedTransactionHash,
        });

        if (!signedTransaction.success) {
            throw new Error("Position close failed");
        }

        return signedTransaction.hash;
    } catch (error: any) {
        throw new Error(`Failed to close position: ${error.message}`);
    }
}

/**
 * Get all positions for a user on MerkleTrade
 * @param aptosClient Aptos client instance
 * @param userAddress User address
 * @returns Array of positions
 */
export async function getMerklePositions(
    aptosClient: any,
    userAddress: string
): Promise<MerklePosition[]> {
    try {
        const result = await aptosClient.view({
            payload: {
                function: "0x5ae6789dd2fec1a9ec9cccfb3acaf12e93d432f0a3a42c92fe1a9d490b7bbc06::trading::get_user_positions",
                functionArguments: [userAddress]
            }
        });

        if (!result || !Array.isArray(result[0])) {
            return [];
        }

        return result[0].map((position: any) => ({
            id: position.id,
            market: position.market,
            side: position.side === 0 ? "long" : "short",
            size: Number(position.size) / 1e6, // Assuming 6 decimals
            collateral: Number(position.collateral) / 1e6,
            avgPrice: Number(position.avg_price) / 1e10, // Assuming 10 decimals for price
            markPrice: Number(position.mark_price) / 1e10,
            pnl: Number(position.pnl) / 1e6,
            marginRatio: Number(position.margin_ratio) / 1e4, // Assuming 4 decimals for percentage
            liquidationPrice: Number(position.liquidation_price) / 1e10
        }));
    } catch (error: any) {
        throw new Error(`Failed to get positions: ${error.message}`);
    }
}
