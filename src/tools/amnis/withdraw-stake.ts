import type { AptosAgent } from "../../agent";

/**
 * Withdraw staked tokens from Amnis Finance
 * @param agent AptosAgent instance
 * @param amount Amount to withdraw
 * @returns Transaction signature
 */
export async function withdrawStakeFromAmnis(agent: AptosAgent, amount: number): Promise<string> {
    try {
        const transaction = await agent.aptos.transaction.build.simple({
            sender: agent.account.accountAddress,
            data: {
                function: "0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4146c8bb7f8ab4cea2e5a01::router::withdraw_stake",
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
            console.error(signedTransaction, "Amnis withdraw failed");
            throw new Error("Amnis withdraw failed");
        }

        return waitForTransaction.hash;
    } catch (error: any) {
        throw new Error(`Amnis withdraw failed: ${error.message}`);
    }
}
