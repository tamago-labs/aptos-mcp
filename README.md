# Aptos MCP

![NPM Version](https://img.shields.io/npm/v/@tamago-labs/aptos-mcp)

**Aptos MCP** is a Model Context Protocol (MCP) server implementation for the Aptos blockchain, compatible with MCP clients like Claude Desktop or Cursor.ai. It allows managing wallet operations and smart contract flows through the Aptos CLI.

## Features

- 30+ MCP tools covering account management, smart contract development, staking, token operations and DeFi integrations
- Token swaps on Mainnet via the Liquidswap DEX
- Native APT staking with validator insights from AI
- Aptos CLI integration for Move smart contract development and testing
- Real-time token price data integration
- Comprehensive account and resource management

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

### 1. DeFi Portfolio Management 
The agent connects to price oracles and external sources to help you:

- Monitor real-time cryptocurrency prices across multiple assets
- Compare prices across different platforms for optimal trading opportunities
- Execute token swaps via Liquidswap DEX
- Manage APT staking positions with validator analytics

### 2. Smart Contract Development & Testing Assistance
The agent integrates with the Aptos CLI to help developers:
- Analyze existing Move code and suggest improvements
- Generate comprehensive test cases for smart contracts
- Publish and upgrade packages directly through AI conversation
- Initialize new Move projects with best practices

### 3. Protocol Governance & Parameter Management
The agent assists DeFi protocol managers with:

- Checking external sources to determine optimal parameters based on current market conditions
- For example, in collateralization protocols, the agent can analyze asset prices to suggest better collateral ratio settings for smart contracts
- Then propose new governance parameters through AI conversations

## Available Tools

### Wallet Operations
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
| `aptos_get_token_details` | Get token information | "Get details for token 0x123..." |
| `aptos_get_token_price` | Get token price | "What's the current price of APT?" |

### Staking Operations
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_stake_apt` | Stake APT with a validator | "Stake 100 APT with validator 0x123..." |
| `aptos_unstake_apt` | Unstake APT from a validator | "Unstake 50 APT from validator 0x123..." |

### DeFi Operations
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_swap_tokens` | Swap tokens via Liquidswap | "Swap 10 APT for USDC" |

### Transaction Management
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_get_transaction` | Get transaction details | "Show transaction 0xabc..." |

### Aptos CLI Integration

#### Account Management
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_cli_create_account` | Create a new Aptos account | "Create a new account with name 'myaccount'" |
| `aptos_cli_fund_account` | Fund account with test APT | "Fund account 0x123... with 10 APT" |
| `aptos_cli_get_account_info` | Get account information | "Get info for account 0x123..." |
| `aptos_cli_list_accounts` | List all configured accounts | "Show all my accounts" |
| `aptos_cli_get_account_resources` | Get account resources | "Show resources for account 0x123..." |
| `aptos_cli_get_account_modules` | Get published modules | "Show modules published by 0x123..." |
| `aptos_cli_transfer_apt` | Transfer APT using CLI | "Transfer 5 APT to 0x456... via CLI" |

#### Move Package Management
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_cli_move_init` | Initialize a new Move package | "Create a new Move project called 'my_contract'" |
| `aptos_cli_move_compile` | Compile a Move package | "Compile the package in ./contracts/" |
| `aptos_cli_move_test` | Run Move package tests | "Run tests for my smart contract" |
| `aptos_cli_move_publish` | Publish Move package | "Deploy my contract to mainnet" |
| `aptos_cli_move_run` | Run a Move function | "Call function 0x1::coin::transfer with args [100, 0x456...]" |
| `aptos_cli_move_clean` | Clean build artifacts | "Clean build files for my project" |
| `aptos_cli_move_download` | Download dependencies | "Download dependencies for my Move project" |
| `aptos_cli_move_prove` | Formal verification | "Prove correctness of my Move code" |

#### Configuration & Network
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_cli_get_network` | Get current network configuration | "Which network am I connected to?" |
| `aptos_cli_set_network` | Set current network | "Switch to testnet" |
| `aptos_cli_init_config` | Initialize Aptos configuration | "Initialize CLI config for testnet" |
| `aptos_cli_list_profiles` | List all profiles | "Show all my CLI profiles" |
| `aptos_cli_switch_profile` | Switch to different profile | "Switch to profile 'testnet'" |
| `aptos_cli_show_global_config` | Show global config | "Show my global CLI configuration" |
| `aptos_cli_get_node_info` | Get node information | "Get current node info" |
| `aptos_cli_get_ledger_info` | Get ledger information | "Show current ledger state" |
| `aptos_cli_get_network_peers` | Get network peers | "Show network peer information" |

#### Query & Transactions
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `aptos_cli_get_transaction_by_hash` | Get transaction by hash | "Get transaction details for 0xabc..." |
| `aptos_cli_get_transaction_by_version` | Get transaction by version | "Get transaction at version 12345" |
| `aptos_cli_get_account_transactions` | Get account transaction history | "Show recent transactions for 0x123..." |
| `aptos_cli_simulate_transaction` | Simulate transaction | "Simulate calling function without executing" |
| `aptos_cli_get_events_by_creation_number` | Get events by creation number | "Get events with creation number 5" |
| `aptos_cli_get_events_by_handle` | Get events by handle | "Get coin transfer events" |

## Example Interactions

### Basic Wallet Operations
```
User: "What's my wallet address and APT balance?"
Agent: Uses aptos_get_address and aptos_get_balance tools to show current wallet info
```

### DeFi Operations
```
User: "Swap 10 APT for USDC and show me the transaction"
Agent: Uses aptos_swap_tokens to execute swap, then aptos_get_transaction to show details
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

### Staking Management
```
User: "Stake 100 APT with the best validator"
Agent: Uses aptos_stake_apt to stake with optimal validator selection
```

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
