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
import { addLiquidity } from "../tools/liquidswap/add-liquidity";
import { removeLiquidity } from "../tools/liquidswap/remove-liquidity";
import { createPool } from "../tools/liquidswap/create-pool";
import { stakeAPT, unstakeAPT } from "../tools/staking/stake";
import { lendToken } from "../tools/joule/lend";
import { borrowToken } from "../tools/joule/borrow";
import { repayToken } from "../tools/joule/repay";
import { withdrawToken } from "../tools/joule/withdraw";
import { getUserPosition } from "../tools/joule/user-position";
import { getUserAllPositions } from "../tools/joule/user-all-positions";
import { claimReward } from "../tools/joule/claim-reward";
import { stakeTokenWithThala } from "../tools/thala/stake";
import { unstakeTokenWithThala } from "../tools/thala/unstake";
import { mintMod } from "../tools/thala/mint-mod";
import { redeemMod } from "../tools/thala/redeem-mod";

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

    // Enhanced Liquidswap methods
    async addLiquidity(
        mintX: MoveStructId,
        mintY: MoveStructId,
        mintXAmount: number,
        mintYAmount: number
    ): Promise<string> {
        return addLiquidity(this, mintX, mintY, mintXAmount, mintYAmount);
    }

    async removeLiquidity(
        mintX: MoveStructId,
        mintY: MoveStructId,
        lpAmount: number
    ): Promise<string> {
        return removeLiquidity(this, mintX, mintY, lpAmount);
    }

    async createPool(
        mintX: MoveStructId,
        mintY: MoveStructId
    ): Promise<string> {
        return createPool(this, mintX, mintY);
    }

    // Joule Finance methods
    async jouleLend(
        amount: number,
        mint: MoveStructId,
        positionId: string,
        newPosition: boolean,
        fungibleAsset: boolean = false
    ): Promise<{ hash: string; positionId: string }> {
        return lendToken(this, amount, mint, positionId, newPosition, fungibleAsset);
    }

    async jouleBorrow(
        amount: number,
        mint: MoveStructId,
        positionId: string,
        fungibleAsset: boolean = false
    ): Promise<string> {
        return borrowToken(this, amount, mint, positionId, fungibleAsset);
    }

    async jouleRepay(
        amount: number,
        mint: MoveStructId,
        positionId: string,
        fungibleAsset: boolean = false
    ): Promise<string> {
        return repayToken(this, amount, mint, positionId, fungibleAsset);
    }

    async jouleWithdraw(
        amount: number,
        mint: MoveStructId,
        positionId: string,
        fungibleAsset: boolean = false
    ): Promise<string> {
        return withdrawToken(this, amount, mint, positionId, fungibleAsset);
    }

    async jouleGetPosition(positionId: string): Promise<any> {
        return getUserPosition(this, positionId);
    }

    async jouleGetAllPositions(): Promise<any[]> {
        return getUserAllPositions(this);
    }

    async jouleClaimReward(positionId: string): Promise<string> {
        return claimReward(this, positionId);
    }

    // Thala Finance methods
    async thalaStake(amount: number): Promise<string> {
        return stakeTokenWithThala(this, amount);
    }

    async thalaUnstake(amount: number): Promise<string> {
        return unstakeTokenWithThala(this, amount);
    }

    async thalaMintMod(
        collateralType: MoveStructId,
        collateralAmount: number,
        modAmount: number
    ): Promise<string> {
        return mintMod(this, collateralType, collateralAmount, modAmount);
    }

    async thalaRedeemMod(
        collateralType: MoveStructId,
        modAmount: number
    ): Promise<string> {
        return redeemMod(this, collateralType, modAmount);
    }
}
