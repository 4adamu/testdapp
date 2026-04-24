'use client'
// src/app/page.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { useWallet } from '../lib/wallet'
import { renderSVG, packSeed, deriveTraits, randomAddr, randomSeed, TRAIT_NAMES, TRAIT_LABELS } from '../lib/svg'
import { CONFIG } from '../lib/config'

// ── tiny Logo SVG ────────────────────────────────────────────────────────────
function Logo() {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" shapeRendering="crispEdges">
      <defs>
        <linearGradient id="logoG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00eaff"/><stop offset="1" stopColor="#ff4fd8"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" fill="#05060c"/>
      <rect x="10" y="10" width="12" height="12" rx="6" fill="url(#logoG)"/>
      <rect x="13" y="14" width="2" height="2" fill="#fff"/>
      <rect x="17" y="14" width="2" height="2" fill="#fff"/>
      <rect x="15" y="18" width="2" height="1" fill="#000"/>
      <rect x="11" y="6"  width="10" height="1" fill="#00eaff"/>
    </svg>
  )
}

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null
  return <div className={`toast ${toast.type}`}>{toast.msg}</div>
}

// ── Navbar ───────────────────────────────────────────────────────────────────
function Nav({ page, setPage }) {
  const { address, status, wrongChain, connect, switchChain, elingBalance, fmtEling } = useWallet()
  const routes = ['home','preview','sale','airdrop','liquidity','docs']

  const btnLabel = () => {
    if (status === 'connecting') return 'Connecting...'
    if (wrongChain) return 'Wrong network'
    if (address) {
      const bal = elingBalance ? ` · ${fmtEling(elingBalance)} ELING` : ''
      return `${address.slice(0,6)}...${address.slice(-4)}${bal}`
    }
    return 'Connect Wallet'
  }

  const onConnect = () => wrongChain ? switchChain() : connect()

  return (
    <header style={{ borderBottom: '1px solid var(--hair)', position: 'relative', zIndex: 2 }}>
      <div className="wrap topbar">
        <button onClick={() => setPage('home')} style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Logo/>
          <div>
            <div className="logo-text-n">EtherLings</div>
            <div className="tag mt-2" style={{ marginTop:2 }}>$ELING · v4 hook experiment</div>
          </div>
        </button>
        <nav className="nav">
          {routes.map(r => (
            <button key={r} className={page === r ? 'active' : ''} onClick={() => setPage(r)}>
              {r}
            </button>
          ))}
        </nav>
        <button
          className={`connect-pill ${status === 'connected' && !wrongChain ? 'ok' : ''}`}
          onClick={onConnect}
          style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          <span className={`ticker-dot ${wrongChain ? 'red' : ''}`}/>
          <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {btnLabel()}
          </span>
        </button>
      </div>
      {wrongChain && (
        <div className="chain-banner">
          ⚠ Switch MetaMask to Sepolia —{' '}
          <button onClick={switchChain} style={{ textDecoration:'underline', cursor:'pointer', fontWeight:700 }}>
            click to switch
          </button>
        </div>
      )}
    </header>
  )
}

// ── EtherLing art component ──────────────────────────────────────────────────
function EtherLingArt({ seed, id, owner, size, className = '' }) {
  const svg = renderSVG(seed, id || 1, owner || randomAddr(), size || 0.5)
  return (
    <div
      className={className}
      style={{ width:'100%', height:'100%' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

// ── Home page ────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const [heroSeed, setHeroSeed]   = useState(null)
  const [heroOwner, setHeroOwner] = useState('')
  const [heroSize, setHeroSize]   = useState(1)
  const [heroId, setHeroId]       = useState(1)
  const [gallery, setGallery]     = useState([])

  const newHero = useCallback(() => {
    const id = Math.floor(Math.random()*9999)+1
    const owner = randomAddr()
    const size = Math.random()*2+0.01
    setHeroId(id); setHeroOwner(owner); setHeroSize(size)
    setHeroSeed(packSeed({ block:id, time:Date.now(), prev:id*7, id, cumu:id*13, size, wallet:owner, zeroForOne:true }))
  }, [])

  const newGallery = useCallback(() => {
    setGallery(Array.from({length:12}, (_,i) => {
      const id = i+1, owner = randomAddr(), size = Math.random()*3+0.001
      return { id, owner, size, seed: randomSeed(id) }
    }))
  }, [])

  useEffect(() => { newHero(); newGallery() }, [])
  useEffect(() => { const t = setInterval(newHero, 3000); return () => clearInterval(t) }, [newHero])

  return (
    <div className="wrap page-section grid-bg">

      {/* hero */}
      <div className="cols-12" style={{ alignItems:'end' }}>
        <div className="col-7">
          <div className="tag" style={{ marginBottom:16 }}>Vol. 01 · Genesis · Fully on-chain 32×32</div>
          <h1 className="hero-title">
            spirits<br/>of the<br/>
            <span className="alt">chain<span className="c-cyan">.</span></span>
          </h1>
          <p className="mt-8 op-80" style={{ maxWidth:560, lineHeight:1.6 }}>
            Every swap in the <span className="c-white">ELING/ETH</span> pool summons a 32×32 pixel spirit — generated and stored entirely on-chain by a Uniswap v4 hook, permanently tagged with the wallet and swap size that birthed it.
          </p>
          <div className="flex-wrap-gap mt-8">
            <button className="btn btn-accent" onClick={() => setPage('preview')}>▸ Preview yours</button>
            <button className="btn" onClick={() => setPage('sale')}>Buy $ELING</button>
            <button className="btn" onClick={() => setPage('airdrop')}>Check airdrop</button>
          </div>
          <div className="mt-8">
            <span className="chip">We Inspired By UniPeg</span>
            <span className="chip">Experiment project</span>
            <span className="chip">LP locked · UniCrypt · 2030</span>
          </div>
        </div>
        <div className="col-5">
          <div className="hero-art-wrap">
            <div className="hero-art-ring"/>
            {heroSeed && (
              <div className="hero-art">
                <EtherLingArt seed={heroSeed} id={heroId} owner={heroOwner} size={heroSize}/>
              </div>
            )}
          </div>
          <div className="text-center tag mt-4">Live preview · seed rotates every 3s</div>
        </div>
      </div>

      {/* strip */}
      <div className="strip mt-16">
        <div><div className="tag">Total supply</div><div className="strip-v">10,000</div><div className="strip-s">$ELING · fixed · renounced</div></div>
        <div><div className="tag">Sale price</div><div className="strip-v">0.001 <span style={{fontSize:20,opacity:.6}}>ETH</span></div><div className="strip-s">per $ELING · 4,000 on sale</div></div>
        <div><div className="tag">Airdrop</div><div className="strip-v">10 <span style={{fontSize:20,opacity:.6}}>each</span></div><div className="strip-s">FCFS · 400 slots · 4,000 total</div></div>
        <div><div className="tag">LP lock until</div><div className="strip-v">2030</div><div className="strip-s">on UniCrypt · 2,000 $ELING + raise</div></div>
      </div>

      {/* why different */}
      <div className="cols-12 mt-20">
        <div className="col-4">
          <div className="tag">§01 — how we differ</div>
          <h2 className="big-2 mt-3">Inspired,<br/>not copied.</h2>
          <p className="mt-6 op-80 sm" style={{ lineHeight:1.7 }}>
            UniPeg cracked open a beautiful idea: hook-native collectibles. We took that spark and pushed every dial — canvas, entropy, traits, preview, permanence.
          </p>
        </div>
        <div className="col-8">
          <div className="why-grid">
            {[
              ['Canvas','32 × 32','UniPeg was 24×24. Room for halos, tails, runes, and cosmic overlays.'],
              ['Traits','12+ layers','Body, aura, runes, tail, halo, eyes, accessory, mouth, bg, palette, glow, cosmic.'],
              ['Entropy','Evolving','Seed mixes swap count & cumulative pool volume — the collection drifts with the pool.'],
              ['Preview','Before you swap','See exactly what you\'d summon — on-chain SVG, live from the hook.'],
              ['Permanence','Owner + size','The wallet AND the swap size that birthed each EtherLing is encoded forever.'],
              ['Render','Glow SVG','Radial backgrounds, gaussian-blur glow filters, gradient cores, cosmic stars.'],
            ].map(([tag, big, sub]) => (
              <div key={tag} className="card">
                <div className="tag">{tag}</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:22, marginTop:8 }}>{big}</div>
                <div className="sm op-60 mt-2">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* gallery */}
      <div className="mt-20">
        <div className="flex-between" style={{ alignItems:'flex-end' }}>
          <div>
            <div className="tag">§02 — specimens</div>
            <h2 className="big-2 mt-3">A bestiary<br/>of little ghosts.</h2>
          </div>
          <button className="btn" onClick={newGallery}>↻ Reshuffle</button>
        </div>
        <div className="gallery mt-6">
          {gallery.map(({ id, owner, size, seed }) => (
            <div key={id} className="gallery-card">
              <div style={{ aspectRatio:'1/1' }}>
                <EtherLingArt seed={seed} id={id} owner={owner} size={size}/>
              </div>
              <div className="gallery-meta">
                <span>#{String(id).padStart(4,'0')}</span>
                <span>{size.toFixed(3)} Ξ</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

// ── Preview page ─────────────────────────────────────────────────────────────
function PreviewPage() {
  const { address } = useWallet()
  const [wallet, setWallet] = useState('')
  const [size, setSize]     = useState('0.25')
  const [count, setCount]   = useState('142')
  const [cumu, setCumu]     = useState('37.5')
  const [seed, setSeed]     = useState(null)
  const [id, setId]         = useState(143)
  const [traits, setTraits] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { if (address && !wallet) setWallet(address) }, [address])

  const run = useCallback(() => {
    const w   = wallet.trim() || randomAddr()
    const sz  = parseFloat(size) || 0
    const cnt = parseInt(count) || 0
    const cu  = parseFloat(cumu) || 0
    const pid = cnt + 1
    setId(pid)
    const s = packSeed({ block:19000000, time:Math.floor(Date.now()/1000), prev:Math.floor(Math.sin(cnt*13)*1e9), id:pid, cumu:cu+sz, size:sz, wallet:w, zeroForOne:true })
    setSeed(s)
    setTraits(deriveTraits(s))
  }, [wallet, size, count, cumu])

  useEffect(() => { run() }, [])

  const copySVG = () => {
    if (!seed) return
    const svg = renderSVG(seed, id, wallet || randomAddr(), parseFloat(size)||0)
    navigator.clipboard?.writeText(svg).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1200) })
  }

  return (
    <div className="wrap page-section">
      <div className="tag">§04 — preview</div>
      <h1 className="hero-title mt-3">see your<br/><span className="alt">EtherLing first<span className="c-magenta">.</span></span></h1>
      <p className="mt-6 op-80 sm" style={{ maxWidth:720, lineHeight:1.7 }}>
        Enter a wallet and swap size. The preview uses the same deterministic seed pipeline the hook runs at <code style={{ color:'var(--cyan)' }}>afterSwap</code>.
      </p>

      <div className="cols-12 mt-8">
        <div className="col-5 card">
          <label className="tag">Wallet</label>
          <input value={wallet} onChange={e => setWallet(e.target.value)} placeholder="0x… or leave empty for random" style={{ marginTop:6 }}/>
          <label className="tag mt-5" style={{ display:'block', marginTop:20 }}>Swap size (ETH)</label>
          <input type="number" value={size} onChange={e => setSize(e.target.value)} step="0.001" min="0" style={{ marginTop:6 }}/>
          <label className="tag" style={{ display:'block', marginTop:20 }}>Swaps so far</label>
          <input type="number" value={count} onChange={e => setCount(e.target.value)} style={{ marginTop:6 }}/>
          <button className="btn btn-accent btn-full mt-5" onClick={run}>▸ Summon preview</button>
          <button className="btn btn-full" style={{ marginTop:8 }} onClick={copySVG}>{copied ? '✓ copied' : '⎘ Copy SVG'}</button>
          <p className="xs op-60" style={{ marginTop:20, lineHeight:1.7, borderTop:'1px solid var(--hair)', paddingTop:12 }}>
            Real mints use block entropy at swap time, so different blocks produce different EtherLings even for identical inputs.
          </p>
        </div>
        <div className="col-7">
          <div className="preview-art-wrap">
            <div className="hero-art-ring" style={{ background:'radial-gradient(circle, rgba(0,234,255,.2), transparent 65%)' }}/>
            <div className="preview-art-inner hero-art-static">
              {seed && <EtherLingArt seed={seed} id={id} owner={wallet || randomAddr()} size={parseFloat(size)||0}/>}
            </div>
          </div>
          <div className="card mt-5">
            <div className="tag">Trait breakdown</div>
            <div className="trait-grid mt-3">
              {traits && TRAIT_NAMES.map((name, i) => (
                <div key={name} className="trait-row">
                  <span className="tag">{name}</span>
                  <span className="xs">{TRAIT_LABELS[i][traits[i] % TRAIT_LABELS[i].length]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sale page ────────────────────────────────────────────────────────────────
function SalePage() {
  const { status, saleState, buy, showToast } = useWallet()
  const [amount, setAmount]   = useState('100')
  const [buying, setBuying]   = useState(false)
  const [btnTxt, setBtnTxt]   = useState('▸ Buy $ELING')

  const cost = (parseFloat(amount)||0) * 0.001
  const sold = saleState?.sold ?? 0n
  const soldN = Number(sold) / 1e18
  const pct   = Math.min(100, (soldN / 4000) * 100)

  const doBuy = async () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { showToast('Enter an amount', 'err'); return }
    if (status !== 'connected') { showToast('Connect wallet first', 'err'); return }
    setBuying(true)
    try {
      setBtnTxt('Confirm in MetaMask...')
      await buy(amt)
      setBtnTxt('▸ Buy $ELING')
    } catch(e) {
      showToast(e.reason || e.message || 'Transaction failed', 'err')
      setBtnTxt('▸ Buy $ELING')
    }
    setBuying(false)
  }

  return (
    <div className="wrap page-section">
      <div className="tag">§05 — sale</div>
      <h1 className="hero-title mt-3">0.001 ETH.<br/><span className="alt">flat<span className="c-gold">.</span></span></h1>
      <div className="cols-12 mt-8">
        <div className="col-7 card card-lg">
          <div className="flex-between" style={{ alignItems:'flex-start' }}>
            <div>
              <div className="tag">Sale progress</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:36, marginTop:4 }}>
                {Math.floor(soldN).toLocaleString()} <span className="op-40" style={{ fontSize:18 }}>/ 4,000</span>
              </div>
            </div>
            <div className="text-right">
              <div className="tag">Price</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:24, marginTop:4 }}>0.001 ETH</div>
            </div>
          </div>
          <div className="progress mt-4"><div className="progress-bar" style={{ width:`${pct}%` }}/></div>

          <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:16, alignItems:'end', marginTop:24 }}>
            <div>
              <label className="tag" style={{ display:'block', marginBottom:6 }}>Amount of $ELING</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} step="1" min="1"/>
            </div>
            <div>
              <label className="tag" style={{ display:'block', marginBottom:6 }}>You pay</label>
              <input readOnly value={`${cost.toFixed(4)} ETH`}/>
            </div>
          </div>

          <button
            className="btn btn-accent btn-full"
            style={{ marginTop:24 }}
            onClick={doBuy}
            disabled={buying || saleState?.finalized || saleState?.paused}
          >
            {saleState?.finalized ? 'Sale ended' : saleState?.paused ? 'Sale paused' : btnTxt}
          </button>
          <p className="xs op-60" style={{ marginTop:12, lineHeight:1.6 }}>
            Excess ETH is refunded automatically. Raised ETH seeds the 2,000-token LP on UniCrypt, locked until 2030.
          </p>
        </div>

        <div className="col-5 card card-lg">
          <div className="tag">After the sale</div>
          <ol style={{ listStyle:'none', padding:0, margin:'12px 0 0', display:'flex', flexDirection:'column', gap:12 }}>
            {['Sale closes or caps at 4,000 $ELING.','Owner withdraws ~4 ETH.','Pair with 2,000 $ELING into v4 LP.','Lock LP NFT on UniCrypt until 1 Jan 2030.','Renounce token ownership.'].map((s,i) => (
              <li key={i} className="sm">
                <span className="display c-cyan" style={{ fontSize:18 }}>0{i+1}.</span> {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

// ── Airdrop page ─────────────────────────────────────────────────────────────
function AirdropPage() {
  const { status, dropState, claim, checkEligibility, showToast } = useWallet()
  const [checking, setChecking]   = useState(false)
  const [claiming, setClaiming]   = useState(false)
  const [eligResult, setEligResult] = useState(null)

  const rem  = dropState?.remaining ?? 4000n * 10n**18n
  const remN = Number(rem) / 1e18
  const slots = Math.floor(remN / 10)
  const pct   = Math.min(100, (remN / 4000) * 100)

  const check = async () => {
    if (status !== 'connected') { showToast('Connect wallet first', 'err'); return }
    setChecking(true)
    try { setEligResult(await checkEligibility()) }
    catch(e) { showToast(e.message, 'err') }
    setChecking(false)
  }

  const doClaim = async () => {
    if (!eligResult || eligResult.status !== 'eligible') return
    setClaiming(true)
    try {
      await claim(eligResult.path, eligResult.proof)
      setEligResult({ status: 'already-claimed' })
    } catch(e) {
      showToast(e.reason || e.message || 'Claim failed', 'err')
    }
    setClaiming(false)
  }

  const statusLabel = () => {
    if (!eligResult) return <span className="op-70">Connect wallet &amp; click check</span>
    if (eligResult.status === 'already-claimed')  return <span className="c-lime">✓ Already claimed</span>
    if (eligResult.status === 'eligible')          return <span className="c-lime">✓ Eligible — {eligResult.path === 'merkle' ? 'uPEG holder' : 'v4 hook user'}</span>
    if (eligResult.status === 'not-eligible')      return <span className="c-dim">Not eligible this round</span>
    if (eligResult.status === 'not-connected')     return <span className="c-dim">Connect wallet to check</span>
    return null
  }

  return (
    <div className="wrap page-section">
      <div className="tag">§06 — airdrop</div>
      <h1 className="hero-title mt-3">10 each.<br/><span className="alt">first come<span className="c-lime">.</span></span></h1>
      <p className="mt-6 op-80 sm" style={{ maxWidth:720, lineHeight:1.7 }}>
        uPEG holders at snapshot or Uniswap v4 hook users are eligible for exactly <span className="c-white">10 $ELING</span>. 400 slots, FCFS. Unclaimed tokens go to a community-voted destination.
      </p>
      <div className="cols-12 mt-8">
        <div className="col-7 card card-lg">
          <div className="flex-between" style={{ alignItems:'flex-start' }}>
            <div>
              <div className="tag">Airdrop remaining</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:36, marginTop:4 }}>
                {Math.floor(remN).toLocaleString()} <span className="op-40" style={{ fontSize:18 }}>/ 4,000</span>
              </div>
            </div>
            <div className="text-right">
              <div className="tag">Slots</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:24, marginTop:4 }}>{slots}</div>
            </div>
          </div>
          <div className="progress mt-4"><div className="progress-bar" style={{ width:`${pct}%` }}/></div>
          <div style={{ marginTop:24 }}>
            <div className="tag">Your status</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:22, marginTop:8 }}>{statusLabel()}</div>
            <div className="flex-wrap-gap mt-5">
              <button className="btn" onClick={check} disabled={checking}>
                {checking ? 'Checking...' : '⌕ Check eligibility'}
              </button>
              <button
                className="btn btn-accent"
                onClick={doClaim}
                disabled={claiming || !eligResult || eligResult.status !== 'eligible'}
              >
                {claiming ? 'Confirm in MetaMask...' : '▸ Claim 10 $ELING'}
              </button>
            </div>
          </div>
        </div>
        <div className="col-5 card card-lg">
          <div className="tag">Eligibility sources</div>
          <div style={{ display:'flex', flexDirection:'column', gap:16, marginTop:16 }}>
            <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', marginTop:8, background:'var(--cyan)', flexShrink:0 }}/>
              <div className="sm"><b>uPEG holders</b> at snapshot block — proven via Merkle proof from <code className="xs op-60">/merkle.json</code>.</div>
            </div>
            <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', marginTop:8, background:'var(--magenta)', flexShrink:0 }}/>
              <div className="sm"><b>v4 hook users</b> — on-chain whitelist, crawled from recent Uniswap v4 activity.</div>
            </div>
          </div>
          <p className="xs op-60" style={{ marginTop:20, borderTop:'1px solid var(--hair)', paddingTop:12, lineHeight:1.7 }}>
            Unclaimed tokens after the deadline are NOT kept by the team. Community votes on the destination.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Liquidity page ────────────────────────────────────────────────────────────
function LiquidityPage() {
  const { showToast } = useWallet()
  const steps = [
    ['Withdraw sale ETH', 'Owner calls sale.withdrawETH(deployer). Expect ≈ 4 ETH if sale caps.'],
    ['Mint full-range v4 LP', '2,000 $ELING + raised ETH into the ELING/ETH pool. Full-range so the hook fires for any swap.'],
    ['Lock the LP NFT on UniCrypt', 'Unlock time: 1893456000 (Jan 1 2030 UTC). Lock URL posted in footer the instant it\'s live.'],
    ['Renounce', 'eling.renounceOwnership(). Fixed supply, no admin keys, no upgrades.'],
  ]
  return (
    <div className="wrap page-section">
      <div className="tag">§07 — liquidity</div>
      <h1 className="hero-title mt-3">seed &amp; lock.<br/><span className="alt">until 2030<span className="c-magenta">.</span></span></h1>
      <div className="cols-12 mt-8">
        <div className="col-7 card card-lg">
          <ol style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:24 }}>
            {steps.map(([title, desc], i) => (
              <li key={i} style={{ display:'flex', gap:20 }}>
                <div className="display c-cyan" style={{ fontSize:48, fontStyle:'italic', lineHeight:1 }}>{i+1}</div>
                <div>
                  <div className="display" style={{ fontSize:20 }}>{title}</div>
                  <div className="sm op-60 mt-2">{desc}</div>
                </div>
              </li>
            ))}
          </ol>
          <button className="btn btn-accent btn-full" style={{ marginTop:32 }} onClick={() => showToast('Owner-only action — call via Remix or Etherscan write tab.','info')}>
            ▸ One-click seed (owner only)
          </button>
        </div>
        <div className="col-5 card card-lg">
          <div className="tag">Lock parameters</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:16 }}>
            {[['Pair','$ELING / ETH'],['Pool fee','0.30%'],['Range','Full range'],['Token amount','2,000 $ELING'],['ETH amount','~ 4 ETH'],['Lock venue','UniCrypt'],['Unlock','Jan 1, 2030 UTC']].map(([k,v]) => (
              <div key={k} className="flex-between sm"><span className="op-60">{k}</span><span>{v}</span></div>
            ))}
          </div>
          <a href="https://app.unicrypt.network/" target="_blank" rel="noopener noreferrer" className="btn btn-full" style={{ marginTop:24 }}>↗ Open UniCrypt</a>
        </div>
      </div>
    </div>
  )
}

// ── Docs page ─────────────────────────────────────────────────────────────────
function DocsPage() {
  const folds = [
    ['How the hook works', true, <>
      <p>Uniswap v4 hooks are contracts whose address bits encode which callbacks they want. <code>EtherLingsHook</code> registers only <code>afterSwap</code> — it doesn't touch swap math, charge fees, or return a custom delta.</p>
      <p>Inside <code>afterSwap</code> we take <code>|amountSpecified|</code>, bump a counter, add to cumulative volume, then mix it all with <code>block.number</code>, <code>block.timestamp</code>, <code>prevrandao</code>, the swapper address, and swap direction into a 256-bit seed. Traits are derived from the seed every time the SVG is rendered.</p>
    </>],
    ['Why 32×32 and not 24×24', false, <p>A 32×32 canvas is 78% more pixels than 24×24 — enough for a glowing core, aura ring, runes, a tail, halo, accessories, expressive eyes, AND cosmic overlay, all while keeping elements readable.</p>],
    ['Why include swap count & cumulative volume in the seed', false, <p>Block data alone makes every mint feel random. Adding pool state makes the collection <em>evolve</em>: early EtherLings are drawn from low-volume entropy, later ones from high-volume. The visual distribution reflects the pool's entire trading history.</p>],
    ['Why encode the swap size permanently', false, <p>An EtherLing isn't just "you traded once" — it's "you did a 0.0142 ETH swap at block 18,942,013". That number renders in the top-left of every piece and is stored in the struct. A receipt that doubles as art.</p>],
    ['What could go wrong', false, <p>Hooks are new. <code>prevrandao</code> can be influenced by validators on the margin. We are not audited. Tiny swaps may round to zero tokens. Nothing here is investment advice. This is an <b>experiment project</b>.</p>],
    ['Contract addresses', false, (
      <div style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>
        {[['ELING', CONFIG.ELING_ADDRESS],['Sale', CONFIG.SALE_ADDRESS],['Airdrop', CONFIG.AIRDROP_ADDRESS]].map(([k,v]) => (
          <div key={k} className="flex-between mt-2"><span className="op-60">{k}</span><span style={{ wordBreak:'break-all' }}>{v}</span></div>
        ))}
      </div>
    )],
  ]
  return (
    <div className="wrap page-section" style={{ maxWidth:960 }}>
      <div className="tag">§08 — docs</div>
      <h1 className="hero-title mt-3">the long<br/><span className="alt">read<span className="c-cyan">.</span></span></h1>
      <article style={{ marginTop:32, fontSize:15, lineHeight:1.85, opacity:.9 }}>
        <p className="dropcap">EtherLings are little ghosts that live inside a Uniswap v4 pool. Every time a trade happens in the official ELING/ETH pool, a hook contract wakes up, reads the pool's entropy and your swap, and writes a brand new 32×32 spirit into storage — owned by you, forever.</p>
        <p style={{ marginTop:16 }}>The idea isn't new. <b>UniPeg</b> pioneered hook-native collectibles with 24×24 unicorns. We are inspired by UniPeg — different project, different art, different entropy, but we wouldn't exist without the spark they lit.</p>
        {folds.map(([title, open, content]) => (
          <details key={title} className="fold" open={open}>
            <summary>
              <span style={{ fontFamily:'var(--font-display)', fontSize:20 }}>{title}</span>
              <span className="chev">▸</span>
            </summary>
            <div className="fold-body">{content}</div>
          </details>
        ))}
      </article>
    </div>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{ borderTop:'1px solid var(--hair)', position:'relative', zIndex:2 }}>
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="display-italic" style={{ fontSize:28 }}>EtherLings</div>
            <div className="tag mt-2">spirits of the chain · v4 hook</div>
            <div className="xs op-70" style={{ marginTop:20, lineHeight:1.8 }}>
              <div>⚠ <b>It's an experiment project.</b></div>
              <div>✨ <b>We Inspired By UniPeg.</b></div>
              <div>🔒 Liquidity locked on UniCrypt until 2030.</div>
            </div>
          </div>
          <div>
            <div className="tag">Navigate</div>
            <ul>
              {['home','preview','sale','airdrop','liquidity','docs'].map(r => (
                <li key={r}><button onClick={() => setPage(r)}>{r[0].toUpperCase()+r.slice(1)}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="tag">Contracts</div>
            <ul style={{ fontFamily:'var(--font-mono)', fontSize:11, opacity:.8 }}>
              <li>ELING · <span className="op-60">{CONFIG.ELING_ADDRESS.slice(0,10)}…</span></li>
              <li>Sale · <span className="op-60">{CONFIG.SALE_ADDRESS.slice(0,10)}…</span></li>
              <li>Airdrop · <span className="op-60">{CONFIG.AIRDROP_ADDRESS.slice(0,10)}…</span></li>
            </ul>
          </div>
          <div>
            <div className="tag">Social</div>
            <ul>
              <li><a href="#" target="_blank" rel="noopener">X / Twitter ↗</a></li>
              <li><a href="#" target="_blank" rel="noopener">Farcaster ↗</a></li>
              <li><a href="#" target="_blank" rel="noopener">Etherscan ↗</a></li>
              <li><a href="https://app.unicrypt.network/" target="_blank" rel="noopener">UniCrypt lock ↗</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div style={{ borderTop:'1px solid var(--hair)' }}>
        <div className="wrap footer-bottom">
          <span>© EtherLings 2026 · MIT · Not audited · Not financial advice.</span>
          <span>Built as an experiment · Inspired by UniPeg.</span>
        </div>
      </div>
    </footer>
  )
}

// ── Root page ─────────────────────────────────────────────────────────────────
export default function Page() {
  const [page, setPage] = useState('home')
  const { toast } = useWallet()

  const pages = { home: HomePage, preview: PreviewPage, sale: SalePage, airdrop: AirdropPage, liquidity: LiquidityPage, docs: DocsPage }
  const PageComponent = pages[page] || HomePage

  return (
    <>
      {/* status marquee */}
      <div className="marquee-wrap">
        <div className="marquee">
          <span>★ We Inspired By UniPeg ★ It's an Experiment Project ★ Liquidity Locked on UniCrypt until 2030 ★ 10,000 $ELING supply ★ 40% sale · 20% LP · 40% airdrop ★ 32×32 on-chain SVG ★ Uniswap v4 hook ★</span>
          <span>★ We Inspired By UniPeg ★ It's an Experiment Project ★ Liquidity Locked on UniCrypt until 2030 ★ 10,000 $ELING supply ★ 40% sale · 20% LP · 40% airdrop ★ 32×32 on-chain SVG ★ Uniswap v4 hook ★</span>
        </div>
      </div>

      <Nav page={page} setPage={setPage}/>
      <main>
        <PageComponent setPage={setPage}/>
      </main>
      <Footer setPage={setPage}/>
      <Toast toast={toast}/>
    </>
  )
}
