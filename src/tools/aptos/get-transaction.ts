import type { AptosAgent } from "../../agent";

/**
 * Get transaction details
 * @param agent AptosAgent instance
 * @param hash Transaction hash
 * @returns Transaction details
 */
export async function getTransaction(agent: AptosAgent, hash: string): Promise<any> {
    try {
        const transaction = await agent.aptos.getTransactionByHash({
            transactionHash: hash,
        });

        return transaction;
    } catch (error: any) {
        throw new Error(`Failed to get transaction: ${error.message}`);
    }
}
