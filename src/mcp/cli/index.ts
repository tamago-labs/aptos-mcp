import {
  CreateAccountTool, 
  GetAccountInfoTool,
  ListAccountsTool,
  GetAccountResourcesTool,
  GetAccountModulesTool
} from './account-tools';

import {
  InitMovePackageTool,
  CompileMovePackageTool,
  TestMovePackageTool,
  PublishMovePackageTool,
  RunMoveFunctionTool,
  CleanMovePackageTool,
  DownloadMoveDependenciesTool,
  ProveMovePackageTool
} from './move-tools';

import {
  GetCurrentNetworkTool,
  SetNetworkTool,
  InitConfigTool,
  ListProfilesTool,
  SwitchProfileTool,
  ShowGlobalConfigTool,
  GetNodeInfoTool,
  GetLedgerInfoTool,
  GetNetworkPeersTool
} from './config-tools';

import {
  GetTransactionByHashTool,
  GetTransactionByVersionTool,
  GetAccountTransactionsTool,
  SimulateTransactionTool,
  GetEventsByCreationNumberTool,
  GetEventsByHandleTool
} from './query-tools';

export const AptosCliTools = {
  // Account Management
  "CreateAccountTool": CreateAccountTool, 
  "GetAccountInfoTool": GetAccountInfoTool,
  "ListAccountsTool": ListAccountsTool,
  "GetAccountResourcesTool": GetAccountResourcesTool,
  "GetAccountModulesTool": GetAccountModulesTool,

  // Move Package Management
  "InitMovePackageTool": InitMovePackageTool,
  "CompileMovePackageTool": CompileMovePackageTool,
  "TestMovePackageTool": TestMovePackageTool,
  "PublishMovePackageTool": PublishMovePackageTool,
  "RunMoveFunctionTool": RunMoveFunctionTool,
  "CleanMovePackageTool": CleanMovePackageTool,
  "DownloadMoveDependenciesTool": DownloadMoveDependenciesTool,
  "ProveMovePackageTool": ProveMovePackageTool,

  // Configuration & Network
  "GetCurrentNetworkTool": GetCurrentNetworkTool,
  "SetNetworkTool": SetNetworkTool,
  "InitConfigTool": InitConfigTool,
  "ListProfilesTool": ListProfilesTool,
  "SwitchProfileTool": SwitchProfileTool,
  "ShowGlobalConfigTool": ShowGlobalConfigTool,
  "GetNodeInfoTool": GetNodeInfoTool,
  "GetLedgerInfoTool": GetLedgerInfoTool,
  "GetNetworkPeersTool": GetNetworkPeersTool,

  // Query & Transactions
  "GetTransactionByHashTool": GetTransactionByHashTool,
  "GetTransactionByVersionTool": GetTransactionByVersionTool,
  "GetAccountTransactionsTool": GetAccountTransactionsTool,
  "SimulateTransactionTool": SimulateTransactionTool,
  "GetEventsByCreationNumberTool": GetEventsByCreationNumberTool,
  "GetEventsByHandleTool": GetEventsByHandleTool,
};
