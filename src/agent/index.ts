import { 
    Account, 
    AccountAddress, 
    Aptos, 
    AptosConfig as AptosSDKConfig, 
    Ed25519PrivateKey, 
    Network,
    PrivateKey,
    PrivateKeyVariants,
    MoveStructId
} from "@aptos-labs/ts-sdk";
import { getAptosConfig } from "../config";
import { TokenBalance, TransactionResponse, TokenInfo } from "../types";
import { getBalance } from "../tools/aptos/balance";
import { transferTokens } from "../tools/aptos/transfer-token";
import { createToken } from "../tools/aptos/create-token";
import { mintToken } from "../tools/aptos/mint-token";
import { burnToken } from "../tools/aptos/burn-token";
import { getTokenDetails } from "../tools/aptos/get-token-details";
import { getTokenPrice } from "../tools/aptos/get-token-price";
import { getTransaction } from "../tools/aptos/get-transaction";
import { swapTokens } from "../tools/liquidswap/swap";
import { stakeAPT, unstakeAPT } from "../tools/staking/stake";

export class AptosAgent {
    public account: Account;
    public aptos: Aptos;
    public network: 'mainnet' | 'testnet' | 'devnet';

    constructor() {
        const config = getAptosConfig();
        
        // Map network string to Network enum
        let networkEnum: Network;
        switch (config.network) {
            case 'mainnet':
                networkEnum = Network.MAINNET;
                break;
            case 'testnet':
                networkEnum = Network.TESTNET;
                break;
            case 'devnet':
                networkEnum = Network.DEVNET;
                break;
            default:
                networkEnum = Network.MAINNET;
        }

        this.network = config.network;

        // Initialize Aptos client
        const aptosConfig = new AptosSDKConfig({ network: networkEnum });
        this.aptos = new Aptos(aptosConfig);

        // Initialize account from private key
        const privateKey = new Ed25519PrivateKey(
            PrivateKey.formatPrivateKey(config.privateKey, PrivateKeyVariants.Ed25519)
        );
        
        this.account = Account.fromPrivateKey({ privateKey });
    }

    async getAddress(): Promise<string> {
        return this.account.accountAddress.toString();
    }

    async getBalance(mint?: string | MoveStructId): Promise<TokenBalance> {
        const balance = await getBalance(this, mint);
        return {
            type: mint || "0x1::aptos_coin::AptosCoin",
            amount: balance,
            symbol: mint ? undefined : "APT",
            name: mint ? undefined : "Aptos",
            decimals: mint ? undefined : 8
        };
    }

    async stakeAPT(
        validatorAddress: string,
        amount: number
    ): Promise<TransactionResponse> {
        const hash = await stakeAPT(this, validatorAddress, amount);
        return {
            hash,
            success: true
        };
    }

    async unstakeAPT(
        validatorAddress: string,
        amount: number
    ): Promise<TransactionResponse> {
        const hash = await unstakeAPT(this, validatorAddress, amount);
        return {
            hash,
            success: true
        };
    }

    async transferToken(
        to: string,
        amount: number,
        mint: string = "0x1::aptos_coin::AptosCoin"
    ): Promise<TransactionResponse> {
        const toAddress = AccountAddress.fromString(to);
        const hash = await transferTokens(this, toAddress, amount, mint);
        return {
            hash,
            success: true
        };
    }

    async createToken(
        name: string,
        symbol: string,
        iconURI: string = "",
        projectURI: string = ""
    ): Promise<TransactionResponse> {
        const hash = await createToken(this, name, symbol, iconURI, projectURI);
        return {
            hash,
            success: true
        };
    }

    async mintToken(
        to: string,
        mint: string,
        amount: number
    ): Promise<TransactionResponse> {
        const toAddress = AccountAddress.fromString(to);
        const hash = await mintToken(this, toAddress, mint, amount);
        return {
            hash,
            success: true
        };
    }

    async burnToken(
        amount: number,
        mint: string
    ): Promise<TransactionResponse> {
        const hash = await burnToken(this, amount, mint);
        return {
            hash,
            success: true
        };
    }

    async getTokenDetails(tokenAddress: string): Promise<TokenInfo> {
        return getTokenDetails(tokenAddress);
    }

    async getTokenPrice(query: string): Promise<{ price: number; symbol: string }> {
        return getTokenPrice(query);
    }

    async getTransaction(hash: string): Promise<any> {
        return getTransaction(this, hash);
    }

    async swapTokens(
        mintX: MoveStructId,
        mintY: MoveStructId,
        swapAmount: number,
        minCoinOut: number = 0
    ): Promise<TransactionResponse> {
        const hash = await swapTokens(this, mintX, mintY, swapAmount, minCoinOut);
        return {
            hash,
            success: true
        };
    }
}
