import { z } from "zod";
import { AptosAgent } from "../../agent";
import { McpTool } from "../../types";
import {
  getCurrentNetwork,
  setNetwork,
  initConfig,
  listProfiles,
  switchProfile,
  showGlobalConfig,
  getNodeInfo,
  getLedgerInfo,
  getNetworkPeers
} from "../../tools/cli/config";

export const GetCurrentNetworkTool: McpTool = {
  name: "aptos_cli_get_network",
  description: "Get current network configuration",
  schema: {},
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await getCurrentNetwork();
    
    if (!result.success) {
      return {
        status: "error",
        message: result.stderr
      };
    }
    
    return {
      status: "success",
      output: result.stdout,
      parsed: result.parsed
    };
  },
};

export const SetNetworkTool: McpTool = {
  name: "aptos_cli_set_network",
  description: "Set the current network",
  schema: {
    network: z.string().describe("Network name (mainnet, testnet, devnet, or custom URL)"),
    profile: z.string().optional().describe("Optional profile name")
  },
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await setNetwork(input.network, input.profile);
    
    if (!result.success) {
      return {
        status: "error",
        message: result.stderr
      };
    }
    
    return {
      status: "success",
      output: result.stdout,
      parsed: result.parsed
    };
  },
};

export const InitConfigTool: McpTool = {
  name: "aptos_cli_init_config",
  description: "Initialize Aptos configuration",
  schema: {
    network: z.string().optional().describe("Network to connect to (default: testnet)"),
    profile: z.string().optional().describe("Profile name (default: default)"),
    privateKey: z.string().optional().describe("Optional private key")
  },
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await initConfig(
      input.network || 'testnet',
      input.profile || 'default',
      input.privateKey
    );
    
    if (!result.success) {
      return {
        status: "error",
        message: result.stderr
      };
    }
    
    return {
      status: "success",
      output: result.stdout,
      parsed: result.parsed
    };
  },
};

export const ListProfilesTool: McpTool = {
  name: "aptos_cli_list_profiles",
  description: "List all configured profiles",
  schema: {},
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await listProfiles();
    
    if (!result.success) {
      return {
        status: "error",
        message: result.stderr
      };
    }
    
    return {
      status: "success",
      output: result.stdout,
      parsed: result.parsed
    };
  },
};

export const SwitchProfileTool: McpTool = {
  name: "aptos_cli_switch_profile",
  description: "Switch to a different profile",
  schema: {
    profileName: z.string().describe("Profile name to switch to")
  },
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await switchProfile(input.profileName);
    
    if (!result.success) {
      return {
        status: "error",
        message: result.stderr
      };
    }
    
    return {
      status: "success",
      output: result.stdout,
      parsed: result.parsed
    };
  },
};

export const ShowGlobalConfigTool: McpTool = {
  name: "aptos_cli_show_global_config",
  description: "Show global configuration settings",
  schema: {},
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await showGlobalConfig();
    
    if (!result.success) {
      return {
        status: "error",
        message: result.stderr
      };
    }
    
    return {
      status: "success",
      output: result.stdout,
      parsed: result.parsed
    };
  },
};

export const GetNodeInfoTool: McpTool = {
  name: "aptos_cli_get_node_info",
  description: "Get node information including chain ID and version",
  schema: {
    nodeUrl: z.string().optional().describe("Optional node URL (uses configured network if not provided)")
  },
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await getNodeInfo(input.nodeUrl);
    
    if (!result.success) {
      return {
        status: "error",
        message: result.stderr
      };
    }
    
    return {
      status: "success",
      output: result.stdout,
      parsed: result.parsed
    };
  },
};

export const GetLedgerInfoTool: McpTool = {
  name: "aptos_cli_get_ledger_info",
  description: "Get current ledger information",
  schema: {},
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await getLedgerInfo();
    
    if (!result.success) {
      return {
        status: "error",
        message: result.stderr
      };
    }
    
    return {
      status: "success",
      output: result.stdout,
      parsed: result.parsed
    };
  },
};

export const GetNetworkPeersTool: McpTool = {
  name: "aptos_cli_get_network_peers",
  description: "Get network peers information",
  schema: {},
  handler: async (agent: AptosAgent, input: Record<string, any>) => {
    const result = await getNetworkPeers();
    
    if (!result.success) {
      return {
        status: "error",
        message: result.stderr
      };
    }
    
    return {
      status: "success",
      output: result.stdout,
      parsed: result.parsed
    };
  },
};
