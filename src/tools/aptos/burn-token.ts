import type { AptosAgent } from "../../agent";

/**
 * Burn tokens
 * @param agent AptosAgent instance
 * @param amount Amount to burn
 * @param mint Token type
 * @returns Transaction hash
 */
export async function burnToken(
    agent: AptosAgent,
    amount: number,
    mint: string
): Promise<string> {
    try {
        const transaction = await agent.aptos.transaction.build.simple({
            sender: agent.account.accountAddress,
            data: {
                function: "0x1::managed_coin::burn",
                typeArguments: [mint],
                functionArguments: [amount],
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
            console.error(waitForTransaction, "Token burning failed");
            throw new Error("Token burning failed");
        }

        return waitForTransaction.hash;
    } catch (error: any) {
        throw new Error(`Token burning failed: ${error.message}`);
    }
}
