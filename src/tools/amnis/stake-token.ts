import type { AptosAgent } from "../../agent";

/**
 * Stake APT with Amnis Finance for liquid staking
 * @param agent AptosAgent instance
 * @param amount Amount of APT to stake
 * @returns Transaction signature
 */
export async function stakeTokenWithAmnis(agent: AptosAgent, amount: number): Promise<string> {
    try {
        const transaction = await agent.aptos.transaction.build.simple({
            sender: agent.account.accountAddress,
            data: {
                function: "0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4146c8bb7f8ab4cea2e5a01::router::stake",
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
            console.error(waitForTransaction, "Amnis stake failed");
            throw new Error("Amnis stake failed");
        }

        return waitForTransaction.hash;
    } catch (error: any) {
        throw new Error(`Amnis stake failed: ${error.message}`);
    }
}
