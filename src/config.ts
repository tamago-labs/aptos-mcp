#!/usr/bin/env node

import * as dotenv from 'dotenv';
import { AptosConfig } from './types';

dotenv.config();

const getArgs = () =>
    process.argv.reduce((args: any, arg: any) => {
        // long arg
        if (arg.slice(0, 2) === "--") {
            const longArg = arg.split("=");
            const longArgFlag = longArg[0].slice(2);
            const longArgValue = longArg.length > 1 ? longArg[1] : true;
            args[longArgFlag] = longArgValue;
        }
        // flags
        else if (arg[0] === "-") {
            const flags = arg.slice(1).split("");
            flags.forEach((flag: any) => {
                args[flag] = true;
            });
        }
        return args;
    }, {});

export function validateEnvironment(): void {
    const args = getArgs();

    // Check if private key is provided
    const hasPrivateKey = !!(args?.aptos_private_key || process.env.APTOS_PRIVATE_KEY);

    if (!hasPrivateKey) {
        throw new Error(
            'Missing required environment variable: APTOS_PRIVATE_KEY must be provided'
        );
    }

    // Network is required
    const hasAptosNetwork = !!(args?.aptos_network || process.env.APTOS_NETWORK);
    if (!hasAptosNetwork) {
        throw new Error('Missing required environment variable: APTOS_NETWORK');
    }
}

export function getAptosConfig(): AptosConfig {
    validateEnvironment();

    const args = getArgs();

    const currentEnv = {
        APTOS_PRIVATE_KEY: args?.aptos_private_key || process.env.APTOS_PRIVATE_KEY,
        APTOS_NETWORK: args?.aptos_network || process.env.APTOS_NETWORK,
    };

    return {
        privateKey: currentEnv.APTOS_PRIVATE_KEY!,
        network: (currentEnv.APTOS_NETWORK || 'mainnet') as 'mainnet' | 'testnet' | 'devnet',
    };
}
