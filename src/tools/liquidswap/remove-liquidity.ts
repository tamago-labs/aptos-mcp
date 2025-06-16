import type { MoveStructId } from "@aptos-labs/ts-sdk";
import type { AptosAgent } from "../../agent";

/**
 * Remove liquidity from Liquidswap pool
 * @param agent AptosAgent instance
 * @param mintX MoveStructId of the first token
 * @param mintY MoveStructId of the second token
 * @param lpAmount Amount of LP tokens to burn
 * @returns Transaction signature
 */
export async function removeLiquidity(
    agent: AptosAgent,
    mintX: MoveStructId,
    mintY: MoveStructId,
    lpAmount: number
): Promise<string> {
    try {
        const transaction = await agent.aptos.transaction.build.simple({
            sender: agent.account.accountAddress,
            data: {
                function: "0x9dd974aea0f927ead664b9e1c295e4215bd441a9fb4e53e5ea0bf22f356c8a2b::router::remove_liquidity_v05",
                typeArguments: [
                    mintX,
                    mintY,
                    "0x163df34fccbf003ce219d3f1d9e70d140b60622cb9dd47599c25fb2f797ba6e::curves::Uncorrelated",
                ],
                functionArguments: [
                    lpAmount,
                    0, // coin_x_min (slippage protection)
                    0, // coin_y_min (slippage protection)
                ],
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
            console.error(signedTransaction, "Remove liquidity failed");
            throw new Error("Remove liquidity failed");
        }

        return waitForTransaction.hash;
    } catch (error: any) {
        console.error(error, "Remove liquidity failed");
        throw new Error(`Remove liquidity failed: ${error.message}`);
    }
}
