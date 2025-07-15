#!/usr/bin/env node

import { AptosConfig } from './types';

import 'dotenv/config'

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

export function getAptosConfig(): AptosConfig {

    const args = getArgs();

    const currentEnv = {
        APTOS_PRIVATE_KEY: process.env.APTOS_PRIVATE_KEY || args?.aptos_private_key,
        APTOS_NETWORK: process.env.APTOS_NETWORK || args?.aptos_network,
    };

    return {
        privateKey: currentEnv.APTOS_PRIVATE_KEY!,
        network: (currentEnv.APTOS_NETWORK || 'mainnet') as 'mainnet' | 'testnet' | 'devnet',
    };
}
