import { AccountAddress, type InputGenerateTransactionPayloadData, type MoveStructId } from "@aptos-labs/ts-sdk";

/**
 * Create profile on Aries Finance
 * @param aptosClient Aptos client instance
 * @param account User account
 * @returns Transaction hash
 */
export async function createAriesProfile(aptosClient: any, account: any): Promise<string> {
    try {
        const transaction = await aptosClient.transaction.build.simple({
            sender: account.getAddress(),
            data: {
                function: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::user::init_user",
                functionArguments: []
            }
        });

        const committedTransactionHash = await account.sendTransaction(transaction);
        
        const signedTransaction = await aptosClient.waitForTransaction({
            transactionHash: committedTransactionHash,
        });

        if (!signedTransaction.success) {
            throw new Error("Profile creation failed");
        }

        return signedTransaction.hash;
    } catch (error: any) {
        throw new Error(`Failed to create Aries profile: ${error.message}`);
    }
}

/**
 * Lend tokens on Aries Finance
 * @param aptosClient Aptos client instance
 * @param account User account
 * @param amount Amount to lend
 * @param mint Token to lend
 * @returns Transaction hash
 */
export async function lendOnAries(
    aptosClient: any,
    account: any,
    amount: number,
    mint: MoveStructId
): Promise<string> {
    try {
        const transaction = await aptosClient.transaction.build.simple({
            sender: account.getAddress(),
            data: {
                function: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::controller::supply",
                typeArguments: [mint.toString()],
                functionArguments: [amount]
            }
        });

        const committedTransactionHash = await account.sendTransaction(transaction);
        
        const signedTransaction = await aptosClient.waitForTransaction({
            transactionHash: committedTransactionHash,
        });

        if (!signedTransaction.success) {
            throw new Error("Lending failed");
        }

        return signedTransaction.hash;
    } catch (error: any) {
        throw new Error(`Failed to lend on Aries: ${error.message}`);
    }
}

/**
 * Borrow tokens on Aries Finance
 * @param aptosClient Aptos client instance
 * @param account User account
 * @param amount Amount to borrow
 * @param mint Token to borrow
 * @returns Transaction hash
 */
export async function borrowOnAries(
    aptosClient: any,
    account: any,
    amount: number,
    mint: MoveStructId
): Promise<string> {
    try {
        const transaction = await aptosClient.transaction.build.simple({
            sender: account.getAddress(),
            data: {
                function: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::controller::borrow",
                typeArguments: [mint.toString()],
                functionArguments: [amount]
            }
        });

        const committedTransactionHash = await account.sendTransaction(transaction);
        
        const signedTransaction = await aptosClient.waitForTransaction({
            transactionHash: committedTransactionHash,
        });

        if (!signedTransaction.success) {
            throw new Error("Borrowing failed");
        }

        return signedTransaction.hash;
    } catch (error: any) {
        throw new Error(`Failed to borrow on Aries: ${error.message}`);
    }
}

/**
 * Repay tokens on Aries Finance
 * @param aptosClient Aptos client instance
 * @param account User account
 * @param amount Amount to repay
 * @param mint Token to repay
 * @returns Transaction hash
 */
export async function repayOnAries(
    aptosClient: any,
    account: any,
    amount: number,
    mint: MoveStructId
): Promise<string> {
    try {
        const transaction = await aptosClient.transaction.build.simple({
            sender: account.getAddress(),
            data: {
                function: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::controller::repay",
                typeArguments: [mint.toString()],
                functionArguments: [amount]
            }
        });

        const committedTransactionHash = await account.sendTransaction(transaction);
        
        const signedTransaction = await aptosClient.waitForTransaction({
            transactionHash: committedTransactionHash,
        });

        if (!signedTransaction.success) {
            throw new Error("Repayment failed");
        }

        return signedTransaction.hash;
    } catch (error: any) {
        throw new Error(`Failed to repay on Aries: ${error.message}`);
    }
}

/**
 * Withdraw tokens from Aries Finance
 * @param aptosClient Aptos client instance
 * @param account User account
 * @param amount Amount to withdraw
 * @param mint Token to withdraw
 * @returns Transaction hash
 */
export async function withdrawFromAries(
    aptosClient: any,
    account: any,
    amount: number,
    mint: MoveStructId
): Promise<string> {
    try {
        const transaction = await aptosClient.transaction.build.simple({
            sender: account.getAddress(),
            data: {
                function: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::controller::redeem",
                typeArguments: [mint.toString()],
                functionArguments: [amount]
            }
        });

        const committedTransactionHash = await account.sendTransaction(transaction);
        
        const signedTransaction = await aptosClient.waitForTransaction({
            transactionHash: committedTransactionHash,
        });

        if (!signedTransaction.success) {
            throw new Error("Withdrawal failed");
        }

        return signedTransaction.hash;
    } catch (error: any) {
        throw new Error(`Failed to withdraw from Aries: ${error.message}`);
    }
}
