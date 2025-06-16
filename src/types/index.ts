import { z } from "zod";

export interface AptosConfig {
    privateKey: string;
    network: 'mainnet' | 'testnet' | 'devnet';
}

export interface McpTool {
    name: string;
    description: string;
    schema: any;
    handler: any;
}

export interface TokenBalance {
    type: string;
    amount: number;
    symbol?: string;
    name?: string;
    decimals?: number;
}

export interface TransactionResponse {
    hash: string;
    success: boolean;
    version?: string;
    gasUsed?: string;
}

export interface TokenInfo {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    supply?: string;
}

export interface StakeInfo {
    operator: string;
    pool: string;
    amount: number;
    rewards?: number;
}
