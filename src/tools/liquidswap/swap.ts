import { type MoveStructId } from "@aptos-labs/ts-sdk";
import type { AptosAgent } from "../../agent";

/**
 * Swap tokens in liquidswap
 * @param agent AptosAgent instance
 * @param mintX Token to swap from
 * @param mintY Token to swap to
 * @param swapAmount Amount to swap
 * @param minCoinOut Minimum amount to receive
 * @returns Transaction hash
 */
export async function swapTokens(
    agent: AptosAgent,
    mintX: MoveStructId,
    mintY: MoveStructId,
    swapAmount: number,
    minCoinOut = 0
): Promise<string> {
    try {
        const transaction = await agent.aptos.transaction.build.simple({
            sender: agent.account.accountAddress,
            data: {
                function: "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::scripts_v2::swap",
                typeArguments: [
                    mintX,
                    mintY,
                    "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::curves::Uncorrelated",
                ],
                functionArguments: [swapAmount, minCoinOut],
            },
        });

        const signedTransaction = agent.aptos.transaction.sign({
            signer: agent.account,
            transaction,
        });

        const submittedTransaction = await agent.aptos.transaction.submit.simple({
            transaction,
            senderAuthenticator: signedTransaction,
        });

        const waitForTransaction = await agent.aptos.waitForTransaction({
            transactionHash: submittedTransaction.hash,
        });

        if (!waitForTransaction.success) {
            console.error(waitForTransaction, "Swap failed");
            throw new Error("Swap failed");
        }

        return waitForTransaction.hash;
    } catch (error: any) {
        throw new Error(`Swap failed: ${error.message}`);
    }
}
