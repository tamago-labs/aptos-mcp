import { AptosAgent } from '../agent';
import { getAptosConfig } from '../config';

describe('Aptos MCP Tests', () => {
  test('should validate environment', () => {
    // Mock environment variables
    process.env.APTOS_PRIVATE_KEY = '0x' + 'a'.repeat(64); // Mock private key
    process.env.APTOS_NETWORK = 'devnet';

    expect(() => {
      const config = getAptosConfig();
      expect(config.privateKey).toBeDefined();
      expect(config.network).toBe('devnet');
    }).not.toThrow();
  });

  test('should create agent with private key', () => {
    // Mock environment variables
    process.env.APTOS_PRIVATE_KEY = '0x' + 'a'.repeat(64);
    process.env.APTOS_NETWORK = 'devnet';

    expect(() => {
      const agent = new AptosAgent();
      expect(agent.account).toBeDefined();
      expect(agent.aptos).toBeDefined();
      expect(agent.network).toBe('devnet');
    }).not.toThrow();
  });

  test('should fail without private key', () => {
    // Clear env vars
    delete process.env.APTOS_PRIVATE_KEY;
    delete process.env.APTOS_NETWORK;

    const { validateEnvironment } = require('../config');
    
    expect(() => {
      validateEnvironment();
    }).toThrow('Missing required environment variable: APTOS_PRIVATE_KEY must be provided');
  });
});
