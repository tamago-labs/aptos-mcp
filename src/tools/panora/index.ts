import axios from "axios";

/**
 * Swap tokens using Panora DEX aggregator
 * @param aptosClient Aptos client instance
 * @param account User account
 * @param fromToken Token to swap from
 * @param toToken Token to swap to
 * @param amount Amount to swap
 * @param toWalletAddress Destination wallet (optional)
 * @param apiKey Panora API key
 * @returns Transaction hash
 */
export async function swapWithPanora(
    aptosClient: any,
    account: any,
    fromToken: string,
    toToken: string,
    amount: number,
    toWalletAddress?: string,
    apiKey?: string
): Promise<string> {
    try {
        if (!apiKey) {
            throw new Error("Panora API key is required");
        }

        const panoraParameters = {
            fromTokenAddress: fromToken,
            toTokenAddress: toToken,
            fromTokenAmount: amount.toString(),
            toWalletAddress: toWalletAddress || account.getAddress().toString()
        };

        const url = `https://api.panora.exchange/swap?${new URLSearchParams(panoraParameters).toString()}`;

        const response = await axios.post(url, {}, {
            headers: {
                "x-api-key": apiKey
            }
        });

        if (!response.data || !response.data.quotes || response.data.quotes.length === 0) {
            throw new Error("No quotes available from Panora");
        }

        const transactionData = response.data.quotes[0].txData;

        const transaction = await aptosClient.transaction.build.simple({
            sender: account.getAddress(),
            data: {
                function: transactionData.function,
                typeArguments: transactionData.type_arguments || [],
                functionArguments: transactionData.arguments
            }
        });

        const committedTransactionHash = await account.sendTransaction(transaction);
        
        const signedTransaction = await aptosClient.waitForTransaction({
            transactionHash: committedTransactionHash,
        });

        if (!signedTransaction.success) {
            throw new Error("Panora swap failed");
        }

        return signedTransaction.hash;
    } catch (error: any) {
        throw new Error(`Failed to swap with Panora: ${error.message}`);
    }
}

/**
 * Get swap quote from Panora
 * @param fromToken Token to swap from
 * @param toToken Token to swap to
 * @param amount Amount to swap
 * @param apiKey Panora API key
 * @returns Quote information
 */
export async function getPanoraQuote(
    fromToken: string,
    toToken: string,
    amount: number,
    apiKey: string
): Promise<any> {
    try {
        const panoraParameters = {
            fromTokenAddress: fromToken,
            toTokenAddress: toToken,
            fromTokenAmount: amount.toString()
        };

        const url = `https://api.panora.exchange/quote?${new URLSearchParams(panoraParameters).toString()}`;

        const response = await axios.get(url, {
            headers: {
                "x-api-key": apiKey
            }
        });

        if (!response.data || !response.data.quotes || response.data.quotes.length === 0) {
            throw new Error("No quotes available from Panora");
        }

        return response.data.quotes[0];
    } catch (error: any) {
        throw new Error(`Failed to get Panora quote: ${error.message}`);
    }
}
