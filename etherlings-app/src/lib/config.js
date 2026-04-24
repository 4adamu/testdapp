// src/lib/config.js
// ★ Paste your Remix-deployed Sepolia addresses here ★
export const CONFIG = {
  ELING_ADDRESS:   process.env.NEXT_PUBLIC_ELING   || '0x0000000000000000000000000000000000000000',
  SALE_ADDRESS:    process.env.NEXT_PUBLIC_SALE     || '0x0000000000000000000000000000000000000000',
  AIRDROP_ADDRESS: process.env.NEXT_PUBLIC_AIRDROP  || '0x0000000000000000000000000000000000000000',
  CHAIN_ID: 11155111, // Sepolia
  CHAIN_NAME: 'Sepolia',
}

export const ELING_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
]

export const SALE_ABI = [
  'function buy() payable',
  'function sold() view returns (uint256)',
  'function remainingTokens() view returns (uint256)',
  'function paused() view returns (bool)',
  'function finalized() view returns (bool)',
]

export const AIRDROP_ABI = [
  'function claimAsV4User()',
  'function claimAsHolder(bytes32[] proof)',
  'function claimed(address) view returns (bool)',
  'function remaining() view returns (uint256)',
  'function totalClaimed() view returns (uint256)',
  'function v4HookWhitelist(address) view returns (bool)',
]

export const ZERO = '0x0000000000000000000000000000000000000000'
export const isZero = (a) => !a || a === ZERO
