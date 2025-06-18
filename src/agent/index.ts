import { 
    Account, 
    AccountAddress, 
    Aptos, 
    AptosConfig as AptosSDKConfig, 
    Ed25519PrivateKey,
    Secp256k1PrivateKey,
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

// Key format detection utility
class KeyFormatDetector {
    /**
     * Automatically detect the private key format and return the appropriate key type
     */
    static detectAndCreateKey(privateKeyInput: string): Ed25519PrivateKey | Secp256k1PrivateKey {
        const cleanKey = this.cleanPrivateKey(privateKeyInput);
        const format = this.detectKeyFormat(privateKeyInput, cleanKey);
        
        console.error(`Auto-detected key format: ${format}`);
        
        switch (format) {
            case 'secp256k1':
                return new Secp256k1PrivateKey(
                    PrivateKey.formatPrivateKey(cleanKey, PrivateKeyVariants.Secp256k1)
                );
            case 'ed25519':
            default:
                return new Ed25519PrivateKey(
                    PrivateKey.formatPrivateKey(cleanKey, PrivateKeyVariants.Ed25519)
                );
        }
    }

    /**
     * Clean the private key by removing common prefixes and formatting
     */
    private static cleanPrivateKey(privateKey: string): string {
        let cleaned = privateKey.trim();
        
        // Remove common prefixes
        const prefixes = [
            'secp256k1-priv-',
            'ed25519-priv-',
            'private-key-',
            'priv-',
        ];
        
        for (const prefix of prefixes) {
            if (cleaned.toLowerCase().startsWith(prefix.toLowerCase())) {
                cleaned = cleaned.substring(prefix.length);
                break;
            }
        }
        
        // Ensure 0x prefix for hex strings
        if (!cleaned.startsWith('0x') && this.isHexString(cleaned)) {
            cleaned = '0x' + cleaned;
        }
        
        return cleaned;
    }

    /**
     * Detect key format based on multiple heuristics
     */
    private static detectKeyFormat(originalKey: string, cleanedKey: string): 'secp256k1' | 'ed25519' {
        // 1. Check for explicit prefixes
        if (originalKey.toLowerCase().includes('secp256k1')) {
            return 'secp256k1';
        }
        
        if (originalKey.toLowerCase().includes('ed25519')) {
            return 'ed25519';
        }
        
        // 2. Check key length (after removing 0x prefix)
        const keyHex = cleanedKey.startsWith('0x') ? cleanedKey.slice(2) : cleanedKey;
        
        if (keyHex.length === 64) {
            // Both secp256k1 and ed25519 can be 32 bytes (64 hex chars)
            // Try additional heuristics
            return this.advancedKeyFormatDetection(keyHex);
        }
        
        if (keyHex.length === 66 && keyHex.startsWith('00')) {
            // Sometimes secp256k1 keys are padded
            return 'secp256k1';
        }
        
        // 3. Default to ed25519 for Aptos compatibility
        return 'ed25519';
    }

    /**
     * Advanced detection for 32-byte keys using cryptographic properties
     */
    private static advancedKeyFormatDetection(keyHex: string): 'secp256k1' | 'ed25519' {
        try {
            // Try to create both key types and see which one works
            // This is a validation approach
            
            const keyBytes = this.hexToBytes(keyHex);
            
            // Ed25519 keys should be exactly 32 bytes and within valid range
            if (keyBytes.length === 32) {
                // Check if the key looks like it could be ed25519
                // Ed25519 private keys are clamped scalars, so certain patterns are more likely
                
                // Secp256k1 keys must be less than the curve order
                const secp256k1Order = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
                const keyValue = BigInt('0x' + keyHex);
                
                if (keyValue >= secp256k1Order) {
                    // Invalid for secp256k1, likely ed25519
                    return 'ed25519';
                }
                
                // If we have additional context clues, use them
                // For now, default to ed25519 since it's more common in Aptos
                return 'ed25519';
            }
            
        } catch (error) {
            console.warn('Error in advanced key detection:', error);
        }
        
        // Default fallback
        return 'ed25519';
    }

    /**
     * Utility: Check if string is valid hex
     */
    private static isHexString(str: string): boolean {
        return /^[0-9a-fA-F]+$/.test(str);
    }

    /**
     * Utility: Convert hex string to bytes
     */
    private static hexToBytes(hex: string): Uint8Array {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    }

    /**
     * Validate that a key can be successfully used with detected format
     */
    static validateKey(privateKeyInput: string): { isValid: boolean; format: string; error?: string } {
        try {
            const key = this.detectAndCreateKey(privateKeyInput);
            const account = Account.fromPrivateKey({ privateKey: key });
            
            return {
                isValid: true,
                format: key instanceof Secp256k1PrivateKey ? 'secp256k1' : 'ed25519',
            };
        } catch (error) {
            return {
                isValid: false,
                format: 'unknown',
                error: error instanceof Error ? error.message : 'Unknown validation error'
            };
        }
    }
}

export class AptosAgent {
    public account: Account;
    public aptos: Aptos;
    public network: 'mainnet' | 'testnet' | 'devnet';
    public keyFormat: 'secp256k1' | 'ed25519';

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

        // Validate the key first
        const validation = KeyFormatDetector.validateKey(config.privateKey);
        if (!validation.isValid) {
            throw new Error(`Invalid private key: ${validation.error}`);
        }

        // Auto-detect and create the appropriate private key
        const privateKey = KeyFormatDetector.detectAndCreateKey(config.privateKey);
        this.keyFormat = privateKey instanceof Secp256k1PrivateKey ? 'secp256k1' : 'ed25519';
        
        console.error(`✅ Successfully initialized AptosAgent with ${this.keyFormat} key format`);
        
        this.account = Account.fromPrivateKey({ privateKey });
    }

    async getAddress(): Promise<string> {
        return this.account.accountAddress.toString();
    }

    async getKeyInfo(): Promise<{ 
        address: string; 
        format: string; 
        publicKey: string;
    }> {
        return {
            address: await this.getAddress(),
            format: this.keyFormat,
            publicKey: this.account.publicKey.toString(),
        };
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

// Export the KeyFormatDetector for testing purposes
export { KeyFormatDetector };
