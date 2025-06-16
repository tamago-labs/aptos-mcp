import type { AptosAgent } from "../../agent";

/**
 * Stake APT tokens in Thala to get thAPT
 * @param agent AptosAgent instance
 * @param amount Amount of APT to stake
 * @returns Transaction signature
 */
export async function stakeTokenWithThala(agent: AptosAgent, amount: number): Promise<string> {
    try {
        const transaction = await agent.aptos.transaction.build.simple({
            sender: agent.account.accountAddress,
            data: {
                function: "0xfaf4e633ae9eb31366c9ca24214231760926576c7b625313b3688b5e900731f6::scripts::stake_APT_and_thAPT",
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
            console.error(signedTransaction, "Stake APT failed");
            throw new Error("Stake APT failed");
        }

        return waitForTransaction.hash;
    } catch (error: any) {
        throw new Error(`Stake APT failed: ${error.message}`);
    }
}
