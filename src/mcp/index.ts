import { GetBalanceTool } from "./aptos/get-balance-tool";
import { GetAddressTool } from "./aptos/get-address-tool";
import { TransferTokenTool } from "./aptos/transfer-token-tool";
import { CreateTokenTool } from "./aptos/create-token-tool";
import { MintTokenTool } from "./aptos/mint-token-tool";
import { BurnTokenTool } from "./aptos/burn-token-tool";
import { GetTokenDetailsTool } from "./aptos/get-token-details-tool";
import { GetTokenPriceTool } from "./aptos/get-token-price-tool";
import { GetTransactionTool } from "./aptos/get-transaction-tool";
import { SwapTokensTool } from "./liquidswap/swap-tokens-tool";
import { StakeAPTTool, UnstakeAPTTool } from "./staking/stake-tools";
import { AptosCliTools } from "./cli";

export const AptosMcpTools = {
    "GetBalanceTool": GetBalanceTool,
    "GetAddressTool": GetAddressTool,
    "TransferTokenTool": TransferTokenTool,
    "CreateTokenTool": CreateTokenTool,
    "MintTokenTool": MintTokenTool,
    "BurnTokenTool": BurnTokenTool,
    "GetTokenDetailsTool": GetTokenDetailsTool,
    "GetTokenPriceTool": GetTokenPriceTool,
    "GetTransactionTool": GetTransactionTool,
    "SwapTokensTool": SwapTokensTool,
    "StakeAPTTool": StakeAPTTool,
    "UnstakeAPTTool": UnstakeAPTTool,
    ...AptosCliTools,
}
