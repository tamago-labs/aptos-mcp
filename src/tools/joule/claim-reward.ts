import type { AptosAgent } from "../../agent";

/**
 * Claim lending rewards from Joule Finance
 * @param agent AptosAgent instance
 * @param positionId The position ID to claim rewards from
 * @returns Transaction signature
 */
export async function claimReward(agent: AptosAgent, positionId: string): Promise<string> {
    try {
        const transaction = await agent.aptos.transaction.build.simple({
            sender: agent.account.accountAddress,
            data: {
                function: "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6::pool::claim_reward",
                functionArguments: [positionId],
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
            console.error(signedTransaction, "Claim reward failed");
            throw new Error("Claim reward failed");
        }

        return waitForTransaction.hash; 
    } catch (error: any) {
        throw new Error(`Claim reward failed: ${error.message}`);
    }
}
