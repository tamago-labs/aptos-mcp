import type { MoveStructId } from "@aptos-labs/ts-sdk";
import type { AptosAgent } from "../../agent";

/**
 * Add liquidity to Liquidswap pool
 * @param agent AptosAgent instance
 * @param mintX MoveStructId of the first token
 * @param mintY MoveStructId of the second token
 * @param mintXAmount Amount of the first token to add
 * @param mintYAmount Amount of the second token to add
 * @returns Transaction signature
 */
export async function addLiquidity(
    agent: AptosAgent,
    mintX: MoveStructId,
    mintY: MoveStructId,
    mintXAmount: number,
    mintYAmount: number
): Promise<string> {
    try {
        const transaction = await agent.aptos.transaction.build.simple({
            sender: agent.account.accountAddress,
            data: {
                function: "0x9dd974aea0f927ead664b9e1c295e4215bd441a9fb4e53e5ea0bf22f356c8a2b::router::add_liquidity_v05",
                typeArguments: [
                    mintX,
                    mintY,
                    "0x163df34fccbf003ce219d3f1d9e70d140b60622cb9dd47599c25fb2f797ba6e::curves::Uncorrelated",
                ],
                functionArguments: [
                    mintXAmount,
                    0, // coin_x_min (slippage protection)
                    mintYAmount,
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
            console.error(signedTransaction, "Add liquidity failed");
            throw new Error("Add liquidity failed");
        }

        return waitForTransaction.hash;
 
    } catch (error: any) {
        console.error(error, "Add liquidity failed");
        throw new Error(`Add liquidity failed: ${error.message}`);
    }
}
