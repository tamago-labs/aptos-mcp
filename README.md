# Aptos MCP

![NPM Version](https://img.shields.io/npm/v/@tamago-labs/aptos-mcp)

**Aptos MCP** is a comprehensive Model Context Protocol (MCP) server implementation for the Aptos blockchain, compatible with MCP clients like Claude Desktop or Cursor.ai. It provides a complete DeFi toolkit covering major Aptos protocols including lending, DEX operations, liquid staking, and smart contract development through the Aptos CLI.

## Features

- **25+ MCP tools** covering the complete Aptos DeFi ecosystem
- **Complete DEX integration** - Liquidswap with swapping, liquidity management, and pool creation
- **Professional lending protocols** - Joule Finance with full lending/borrowing workflow
- **Liquid staking options** - Thala Finance and Amnis Finance integrations
- **Stablecoin operations** - MOD minting and redemption through Thala
- **Native APT staking** with validator insights from AI 

## Using with Claude Desktop

1. Install Claude Desktop if you haven't already
2. Open Claude Desktop settings
3. Add the Aptos MCP client to your configuration:

```json
{
  "mcpServers": {
    "aptos-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@tamago-labs/aptos-mcp",
        "--aptos_private_key=YOUR_PRIVATE_KEY", 
        "--aptos_network=mainnet"
      ],
      "disabled": false
    }
  }
}
```

This Private Key mode is recommended for advanced users who can securely manage their private keys. The MCP client handles transactions locally without exposing any data to external servers.

## Use Cases

### 1. Complete DeFi Portfolio Management 
The agent connects to price oracles and major DeFi protocols to help you:

- **Monitor and analyze** real-time cryptocurrency prices across multiple assets
- **Execute complex DeFi strategies** across lending, borrowing, and liquidity provision
- **Manage liquid staking positions** with Thala and Amnis protocols
- **Trade and provide liquidity** on Liquidswap DEX with advanced pool management
- **Track lending positions** across Joule Finance with automated reward claiming
- **Mint and manage stablecoins** through Thala's MOD protocol

### 2. Advanced DeFi Protocol Management
The agent assists DeFi protocol managers and power users with:

- **Multi-protocol position management** across lending platforms
- **Liquidity optimization** strategies across different DEX pools
- **Yield farming** and reward optimization across protocols
- **Risk management** through diversified staking and lending
- **Parameter optimization** based on real-time market conditions

## Available Tools

### Core Wallet Operations
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_get_address` | Retrieve your wallet address | "What's my wallet address?" |
| `aptos_get_balance` | Get APT or token balance | "Show my APT balance" |
| `aptos_transfer_token` | Transfer tokens to another address | "Transfer 10 APT to 0x123..." |

### Token Management
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_create_token` | Create a new token on Aptos | "Create a token named MyToken with symbol MTK" |
| `aptos_mint_token` | Mint tokens to an address | "Mint 1000 MTK tokens to 0x456..." |
| `aptos_burn_token` | Burn tokens from your account | "Burn 100 MTK tokens" |
| `aptos_get_token_price` | Get token price | "What's the current price of APT?" |

### Liquidswap DEX Operations
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_swap_tokens` | Swap tokens via Liquidswap | "Swap 10 APT for USDC" |
| `aptos_add_liquidity` | Add liquidity to earn fees | "Add 100 APT and 500 USDC to the pool" |
| `aptos_remove_liquidity` | Remove liquidity from pools | "Remove 50 LP tokens from APT/USDC pool" |
| `aptos_create_pool` | Create new trading pools | "Create a new pool for APT/USDT trading" |

### Joule Finance - Complete Lending Protocol
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_joule_lend` | Lend tokens to earn interest | "Lend 100 APT to Joule Finance" |
| `aptos_joule_borrow` | Borrow tokens against collateral | "Borrow 50 USDC using my APT collateral" |
| `aptos_joule_repay` | Repay borrowed tokens | "Repay 25 USDC to my lending position" |
| `aptos_joule_withdraw` | Withdraw lent tokens | "Withdraw 50 APT from my lending position" |
| `aptos_joule_get_position` | Get specific position details | "Show details for position pos_123" |
| `aptos_joule_get_all_positions` | Get all lending positions | "Show all my Joule Finance positions" |
| `aptos_joule_claim_reward` | Claim lending rewards | "Claim rewards from my lending positions" |

### Thala Finance - Liquid Staking & Stablecoin
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_thala_stake` | Stake APT for thAPT (liquid staking) | "Stake 200 APT with Thala for thAPT" |
| `aptos_thala_unstake` | Unstake thAPT back to APT | "Unstake 100 thAPT tokens" |
| `aptos_thala_mint_mod` | Mint MOD stablecoin | "Mint 150 MOD using thAPT as collateral" |
| `aptos_thala_redeem_mod` | Redeem MOD for collateral | "Redeem 75 MOD tokens for thAPT" |

### Native Staking Operations
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_stake_apt` | Stake APT with a validator | "Stake 100 APT with validator 0x123..." |
| `aptos_unstake_apt` | Unstake APT from a validator | "Unstake 50 APT from validator 0x123..." |

### Transaction Management
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_get_transaction` | Get transaction details | "Show transaction 0xabc..." |

## Example Interactions

### Advanced DeFi Portfolio Management
```
User: "Help me optimize my DeFi portfolio: Check my balances, stake some APT with Thala, 
       lend the rest to Joule Finance, and add liquidity to the APT/USDC pool"

Agent: 
1. Uses aptos_get_balance to check current holdings
2. Uses aptos_thala_stake to stake 50% of APT for thAPT
3. Uses aptos_joule_lend to lend remaining APT for yield
4. Uses aptos_add_liquidity to provide liquidity on Liquidswap
5. Shows portfolio summary with expected yields
```

### Complete Lending Workflow
```
User: "I want to use my APT as collateral to borrow USDC, then track my position"

Agent:
1. Uses aptos_joule_lend to deposit APT as collateral
2. Uses aptos_joule_borrow to borrow USDC against collateral
3. Uses aptos_joule_get_position to show health ratio and details
4. Sets up monitoring for liquidation risk
```

### Advanced Liquidswap Operations
```
User: "Create a new trading pool for my token, add initial liquidity, 
       then show me the pool statistics"

Agent:
1. Uses aptos_create_pool to create the trading pair
2. Uses aptos_add_liquidity to provide initial liquidity
3. Shows pool statistics and fee earning potential
4. Provides ongoing pool management recommendations
```

### Move Development Workflow
```
User: "Create a new Move project called 'my_defi_protocol'"
Agent: Uses aptos_cli_move_init to create project structure

User: "Compile and test my contract in ./contracts/"
Agent: Uses aptos_cli_move_compile and aptos_cli_move_test to build and validate code

User: "Deploy to testnet with named address myaddr=0x123..."
Agent: Uses aptos_cli_move_publish with proper configuration
```

### Comprehensive Staking Strategy
```
User: "What are the best staking options for my 1000 APT?"

Agent:
1. Compares native staking vs liquid staking options
2. Shows yields for Thala liquid staking vs native validators
3. Recommends diversified approach using multiple protocols
4. Executes chosen strategy across different platforms
```

## Protocol Integrations

### Liquidswap DEX
- **Complete trading functionality** with optimal routing
- **Advanced liquidity management** with fee optimization
- **Pool creation and management** for new trading pairs
- **Real-time price monitoring** and arbitrage detection

### Joule Finance
- **Professional lending platform** with competitive rates
- **Multi-asset collateral support** for borrowing
- **Automated reward claiming** and compound strategies
- **Risk management** with health ratio monitoring

### Thala Finance
- **Liquid staking** - Keep liquidity while earning staking rewards
- **MOD stablecoin** - Collateralized debt position management
- **Yield optimization** through liquid staking derivatives
- **Advanced DeFi composability** with other protocols

### Native Aptos Staking
- **Validator selection** with AI-driven recommendations
- **Staking optimization** based on performance metrics
- **Automated management** of staking positions

## Troubleshooting

If you're using Ubuntu or another Linux environment with NVM, you'll need to manually configure the path. Follow these steps:

1. Install the Aptos MCP under your current NVM-managed Node.js version.

```bash
npm install -g @tamago-labs/aptos-mcp
```

2. Due to how NVM installs libraries, you may need to use absolute paths in your config. Replace the example values below with your actual username and Node version:

```json
{
  "mcpServers": {
    "aptos-mcp": {
      "command": "/home/YOUR_NAME/.nvm/versions/node/YOUR_NODE_VERSION/bin/node",
      "args": [
        "/home/YOUR_NAME/.nvm/versions/node/YOUR_NODE_VERSION/bin/@tamago-labs/aptos-mcp",
        "--aptos_private_key=YOUR_PRIVATE_KEY",
        "--aptos_network=mainnet"
      ]
    }
  }
}
```

3. Restart Claude Desktop and it should work now.

## Work with Local Files

When working with local files especially when using Aptos CLI tools for smart contract development to create, build, and test a Move package on your machine—you'll need to import an additional MCP server library of `filesystem` made by Claude team. Use with:

```json
"filesystem": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "${workspaceFolder}"
  ],
  "disabled": false
}
```

`workspaceFolder` refers to your working directory. You can provide more than one argument. Subfolders or specific files can then be referenced in your AI prompt.

If you're using Linux and encounter issues during setup, please refer to the troubleshooting section.

## License
This project is licensed under the MIT License.
