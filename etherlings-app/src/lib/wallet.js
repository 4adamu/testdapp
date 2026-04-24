'use client'
// src/lib/wallet.js
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { CONFIG, ELING_ABI, SALE_ABI, AIRDROP_ABI, isZero } from './config'

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  const [address, setAddress]       = useState(null)
  const [chainId, setChainId]       = useState(null)
  const [status, setStatus]         = useState('idle')   // idle | connecting | connected | wrong-chain
  const [error, setError]           = useState(null)
  const [ethers, setEthers]         = useState(null)
  const [provider, setProvider]     = useState(null)
  const [signer, setSigner]         = useState(null)
  // live data
  const [elingBalance, setElingBal] = useState(null)
  const [saleState, setSaleState]   = useState({ sold: 0n, remaining: 4000n * 10n**18n, paused: false, finalized: false })
  const [dropState, setDropState]   = useState({ remaining: 4000n * 10n**18n, totalClaimed: 0n })
  const [toast, setToast]           = useState(null)
  const toastTimer = useRef(null)

  // load ethers dynamically (avoids SSR issues)
  useEffect(() => {
    import('ethers').then(m => setEthers(m))
  }, [])

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }, [])

  const wrongChain = chainId !== null && chainId !== CONFIG.CHAIN_ID

  // ── read sale state ──────────────────────────────────────────
  const refreshSale = useCallback(async (prov) => {
    if (!prov || isZero(CONFIG.SALE_ADDRESS)) return
    try {
      const c = new (prov.constructor === Object ? ethers.Contract : (ethers?.Contract || window._ethers?.Contract))(
        CONFIG.SALE_ADDRESS, SALE_ABI, prov
      )
      // safer: use the passed provider directly
      const { ethers: e } = await import('ethers')
      const contract = new e.Contract(CONFIG.SALE_ADDRESS, SALE_ABI, prov)
      const [sold, remaining, paused, finalized] = await Promise.all([
        contract.sold(), contract.remainingTokens(), contract.paused(), contract.finalized()
      ])
      setSaleState({ sold, remaining, paused, finalized })
    } catch(e) { console.warn('refreshSale:', e.message) }
  }, [])

  const refreshDrop = useCallback(async (prov) => {
    if (!prov || isZero(CONFIG.AIRDROP_ADDRESS)) return
    try {
      const { ethers: e } = await import('ethers')
      const c = new e.Contract(CONFIG.AIRDROP_ADDRESS, AIRDROP_ABI, prov)
      const [remaining, totalClaimed] = await Promise.all([c.remaining(), c.totalClaimed()])
      setDropState({ remaining, totalClaimed })
    } catch(e) { console.warn('refreshDrop:', e.message) }
  }, [])

  const refreshBalance = useCallback(async (prov, addr) => {
    if (!prov || !addr || isZero(CONFIG.ELING_ADDRESS)) return
    try {
      const { ethers: e } = await import('ethers')
      const c = new e.Contract(CONFIG.ELING_ADDRESS, ELING_ABI, prov)
      const bal = await c.balanceOf(addr)
      setElingBal(bal)
    } catch(e) { console.warn('refreshBalance:', e.message) }
  }, [])

  // ── connect ──────────────────────────────────────────────────
  const connect = useCallback(async () => {
    if (typeof window === 'undefined') return
    if (!window.ethereum) {
      setError('MetaMask not found. Install it from metamask.io then refresh.')
      setStatus('idle')
      return
    }
    setStatus('connecting')
    setError(null)
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (!accounts?.length) throw new Error('No accounts returned')

      const addr = accounts[0]
      const chainHex = await window.ethereum.request({ method: 'eth_chainId' })
      const chain = parseInt(chainHex, 16)
      setChainId(chain)

      if (chain !== CONFIG.CHAIN_ID) {
        setStatus('wrong-chain')
        setAddress(addr)
        return
      }

      const { ethers: e } = await import('ethers')
      const prov = new e.providers.Web3Provider(window.ethereum, 'any')
      const sign = prov.getSigner()
      setProvider(prov)
      setSigner(sign)
      setAddress(addr)
      setStatus('connected')
      showToast(`Connected: ${addr.slice(0,6)}...${addr.slice(-4)}`, 'ok')

      await Promise.all([refreshSale(prov), refreshDrop(prov), refreshBalance(prov, addr)])
    } catch(e) {
      console.error('[connect]', e)
      setError(e.code === 4001 ? 'Rejected in MetaMask.' : (e.message || 'Connection failed'))
      setStatus('idle')
    }
  }, [showToast, refreshSale, refreshDrop, refreshBalance])

  // ── switch chain ─────────────────────────────────────────────
  const switchChain = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + CONFIG.CHAIN_ID.toString(16) }],
      })
      await connect()
    } catch(e) {
      showToast('Switch to Sepolia in MetaMask manually.', 'err')
    }
  }, [connect, showToast])

  // ── buy ──────────────────────────────────────────────────────
  const buy = useCallback(async (amountTokens) => {
    if (!signer) throw new Error('Not connected')
    const { ethers: e } = await import('ethers')
    const c = new e.Contract(CONFIG.SALE_ADDRESS, SALE_ABI, signer)
    const ethVal = e.utils.parseEther((amountTokens * 0.001).toFixed(18))
    const tx = await c.buy({ value: ethVal })
    showToast(`Tx sent: ${tx.hash.slice(0,10)}...`, 'info')
    await tx.wait()
    showToast(`✓ Bought ${amountTokens} $ELING!`, 'ok')
    const prov = new e.providers.Web3Provider(window.ethereum, 'any')
    await Promise.all([refreshSale(prov), refreshBalance(prov, address)])
  }, [signer, address, showToast, refreshSale, refreshBalance])

  // ── claim ────────────────────────────────────────────────────
  const claim = useCallback(async (path, proof) => {
    if (!signer) throw new Error('Not connected')
    const { ethers: e } = await import('ethers')
    const c = new e.Contract(CONFIG.AIRDROP_ADDRESS, AIRDROP_ABI, signer)
    const tx = path === 'merkle' ? await c.claimAsHolder(proof) : await c.claimAsV4User()
    showToast(`Tx sent: ${tx.hash.slice(0,10)}...`, 'info')
    await tx.wait()
    showToast('✓ Claimed 10 $ELING!', 'ok')
    const prov = new e.providers.Web3Provider(window.ethereum, 'any')
    await Promise.all([refreshDrop(prov), refreshBalance(prov, address)])
  }, [signer, address, showToast, refreshDrop, refreshBalance])

  // ── check eligibility ────────────────────────────────────────
  const checkEligibility = useCallback(async () => {
    if (!address || !provider) return { status: 'not-connected' }
    const { ethers: e } = await import('ethers')
    const c = new e.Contract(CONFIG.AIRDROP_ADDRESS, AIRDROP_ABI, provider)
    const [alreadyClaimed, whitelisted] = await Promise.all([
      c.claimed(address), c.v4HookWhitelist(address)
    ])
    if (alreadyClaimed) return { status: 'already-claimed' }
    if (whitelisted) return { status: 'eligible', path: 'whitelist' }
    // try merkle.json
    try {
      const res = await fetch('/merkle.json')
      if (res.ok) {
        const data = await res.json()
        const proof = data.proofs?.[address.toLowerCase()]
        if (proof) return { status: 'eligible', path: 'merkle', proof }
      }
    } catch(_) {}
    return { status: 'not-eligible' }
  }, [address, provider])

  // ── listen for account / chain changes ───────────────────────
  useEffect(() => {
    if (!window.ethereum) return
    const onAccounts = (accs) => {
      if (!accs?.length) { setAddress(null); setStatus('idle'); setProvider(null); setSigner(null) }
      else connect()
    }
    const onChain = () => { setProvider(null); setSigner(null); window.location.reload() }
    window.ethereum.on('accountsChanged', onAccounts)
    window.ethereum.on('chainChanged', onChain)
    return () => {
      window.ethereum.removeListener('accountsChanged', onAccounts)
      window.ethereum.removeListener('chainChanged', onChain)
    }
  }, [connect])

  const fmtEling = (wei) => {
    try {
      if (typeof wei === 'bigint') {
        return (Number(wei) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 })
      }
      return '0'
    } catch { return '0' }
  }

  return (
    <WalletContext.Provider value={{
      address, chainId, status, error, wrongChain,
      saleState, dropState, elingBalance,
      connect, switchChain, buy, claim, checkEligibility,
      refreshSale: () => provider && refreshSale(provider),
      refreshDrop: () => provider && refreshDrop(provider),
      fmtEling, toast, showToast,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}
