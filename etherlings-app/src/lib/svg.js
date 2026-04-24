// src/lib/svg.js
// Client-side port of EtherLingsHook._renderSVG — deterministic,
// matches on-chain output for the same seed inputs.

function h32(s) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return h >>> 0
}

export function packSeed({ block, time, prev, id, cumu, size, wallet, zeroForOne }) {
  const s = `${block}|${time}|${prev}|${id}|${cumu}|${size}|${wallet}|${zeroForOne}`
  const a = h32(s), b = h32(s+'|a'), c = h32(s+'|b'), d = h32(s+'|c')
  return {
    bits(shift, mod) {
      const r = shift < 32 ? a : shift < 64 ? b : shift < 96 ? c : d
      return ((r >>> (shift % 32)) >>> 0) % mod
    }
  }
}

const PAL = {
  bg:  [['#0a0f2c','#000000'],['#1a0933','#000000'],['#002233','#000814'],['#100820','#2d0052'],['#000000','#0a0a0a']],
  core:[['#00eaff','#0066ff'],['#ff4fd8','#7a00ff'],['#66ffb2','#00a86b'],['#ffd166','#ef476f'],['#b388ff','#3d5afe'],['#ffffff','#aaaaaa']],
  aura:['#00eaff','#ff4fd8','#7CFFB2','#FFD166','#B388FF','#FF6B6B','#4DF0C3','#FFFFFF'],
  glow:['0.4','0.8','1.2','1.8'],
}

export const TRAIT_NAMES = ['Body','Aura','Rune','Tail','Halo','Eyes','Accessory','Mouth','Background','Core Palette','Glow','Cosmic']
export const TRAIT_LABELS = [
  ['orb','winged','crowned','belted','starry','pointed'],
  ['cyan','magenta','mint','gold','violet','coral','teal','white'],
  ['dot','triangle','quad','vertical','none'],
  ['classic','flowy','long','split'],
  ['none','thin','crown','starlet','double'],
  ['open','sleepy','pupil','blush','slit','glowing'],
  ['none','top-hat','wings','crown','glasses','antenna'],
  ['dot','line','fangs','square'],
  ['deep-space','nebula','abyss','violet','void'],
  ['cyan','magenta','mint','gold-rose','violet','ghost'],
  ['subtle','soft','strong','radiant'],
  ['none','sparse','dense','axis'],
]

export function deriveTraits(seed) {
  return [
    seed.bits(0,6), seed.bits(8,8), seed.bits(16,5), seed.bits(24,4),
    seed.bits(32,5), seed.bits(40,6), seed.bits(48,6), seed.bits(56,4),
    seed.bits(64,5), seed.bits(72,6), seed.bits(80,4), seed.bits(88,4),
  ]
}

function sa(a) { return a ? String(a).toLowerCase().slice(0,6) : '0x0000' }
function fs(v) { return isFinite(v) && v > 0 ? Number(v).toFixed(4) : '0.0000' }

export function renderSVG(seed, id, owner, sizeEth) {
  const t = deriveTraits(seed)
  const [bgA,bgB] = PAL.bg[t[8] % PAL.bg.length]
  const [cA,cB]   = PAL.core[t[9] % PAL.core.length]
  const au = PAL.aura[t[1]], gl = PAL.glow[t[10]]
  const ci = `core${id}`, bi = `bg${id}`, gi = `glow${id}`

  let body = `<rect x="10" y="10" width="12" height="12" rx="6" fill="url(#${ci})"/>`
  const sh = t[0]
  if(sh===0) body+=`<rect x="9" y="12" width="2" height="8" fill="url(#${ci})"/><rect x="21" y="12" width="2" height="8" fill="url(#${ci})"/>`
  else if(sh===1) body+=`<rect x="11" y="9" width="10" height="2" fill="url(#${ci})"/>`
  else if(sh===2) body+=`<rect x="12" y="21" width="8" height="2" fill="url(#${ci})"/>`
  else if(sh===3) body+=`<rect x="9" y="15" width="14" height="2" fill="url(#${ci})"/>`
  else if(sh===4) body+=`<rect x="10" y="9" width="2" height="2" fill="url(#${ci})"/><rect x="20" y="9" width="2" height="2" fill="url(#${ci})"/>`
  else body+=`<rect x="15" y="8" width="2" height="2" fill="url(#${ci})"/>`

  const tl = t[3]
  if(tl===0) body+=`<rect x="15" y="22" width="2" height="3" fill="url(#${ci})" opacity="0.85"/><rect x="14" y="25" width="4" height="1" fill="url(#${ci})" opacity="0.6"/>`
  else if(tl===1) body+=`<rect x="13" y="22" width="6" height="1" fill="url(#${ci})"/><rect x="14" y="23" width="4" height="1" fill="url(#${ci})" opacity="0.7"/><rect x="15" y="24" width="2" height="1" fill="url(#${ci})" opacity="0.4"/>`
  else if(tl===2) body+=`<rect x="15" y="22" width="2" height="5" fill="url(#${ci})"/><rect x="14" y="27" width="4" height="1" fill="url(#${ci})"/>`
  else body+=`<rect x="14" y="22" width="1" height="3" fill="url(#${ci})"/><rect x="17" y="22" width="1" height="3" fill="url(#${ci})"/><rect x="15" y="23" width="2" height="2" fill="url(#${ci})" opacity="0.6"/>`

  const ar = `<rect x="8" y="10" width="1" height="12" fill="${au}" opacity="0.35"/><rect x="23" y="10" width="1" height="12" fill="${au}" opacity="0.35"/><rect x="10" y="8" width="12" height="1" fill="${au}" opacity="0.35"/><rect x="10" y="23" width="12" height="1" fill="${au}" opacity="0.35"/>`

  let ru = ''
  const rv = t[2]
  if(rv===0) ru=`<rect x="15" y="13" width="2" height="2" fill="${au}"/>`
  else if(rv===1) ru=`<rect x="13" y="16" width="1" height="1" fill="${au}"/><rect x="18" y="16" width="1" height="1" fill="${au}"/><rect x="15" y="19" width="2" height="1" fill="${au}"/>`
  else if(rv===2) ru=`<rect x="14" y="14" width="1" height="1" fill="${au}"/><rect x="17" y="14" width="1" height="1" fill="${au}"/><rect x="14" y="17" width="1" height="1" fill="${au}"/><rect x="17" y="17" width="1" height="1" fill="${au}"/>`
  else if(rv===3) ru=`<rect x="15" y="12" width="2" height="1" fill="${au}"/><rect x="15" y="20" width="2" height="1" fill="${au}"/>`

  let ha = ''
  const hv = t[4]
  if(hv===1) ha=`<rect x="11" y="6" width="10" height="1" fill="${au}"/>`
  else if(hv===2) ha=`<rect x="10" y="5" width="12" height="1" fill="${au}"/><rect x="11" y="6" width="1" height="1" fill="${au}"/><rect x="20" y="6" width="1" height="1" fill="${au}"/>`
  else if(hv===3) ha=`<rect x="9" y="4" width="1" height="1" fill="${au}"/><rect x="22" y="4" width="1" height="1" fill="${au}"/><rect x="15" y="3" width="2" height="1" fill="${au}"/>`
  else if(hv===4) ha=`<rect x="12" y="5" width="8" height="1" fill="${au}"/><rect x="14" y="3" width="4" height="1" fill="${au}" opacity="0.6"/>`

  let ey = ''
  const ev = t[5]
  if(ev===0) ey='<rect x="13" y="14" width="2" height="2" fill="#fff"/><rect x="17" y="14" width="2" height="2" fill="#fff"/>'
  else if(ev===1) ey='<rect x="13" y="15" width="2" height="1" fill="#fff"/><rect x="17" y="15" width="2" height="1" fill="#fff"/>'
  else if(ev===2) ey='<rect x="13" y="14" width="2" height="2" fill="#fff"/><rect x="17" y="14" width="2" height="2" fill="#fff"/><rect x="14" y="15" width="1" height="1" fill="#000"/><rect x="18" y="15" width="1" height="1" fill="#000"/>'
  else if(ev===3) ey='<rect x="13" y="14" width="2" height="1" fill="#fff"/><rect x="17" y="14" width="2" height="1" fill="#fff"/><rect x="13" y="15" width="2" height="1" fill="#f66"/><rect x="17" y="15" width="2" height="1" fill="#f66"/>'
  else if(ev===4) ey='<rect x="14" y="14" width="1" height="2" fill="#fff"/><rect x="18" y="14" width="1" height="2" fill="#fff"/>'
  else ey='<rect x="13" y="14" width="2" height="2" fill="#0ff"/><rect x="17" y="14" width="2" height="2" fill="#0ff"/>'

  const mv = t[7]
  let mo = ''
  if(mv===0) mo='<rect x="15" y="18" width="2" height="1" fill="#000"/>'
  else if(mv===1) mo='<rect x="14" y="18" width="4" height="1" fill="#000"/>'
  else if(mv===2) mo='<rect x="14" y="18" width="1" height="1" fill="#000"/><rect x="17" y="18" width="1" height="1" fill="#000"/>'
  else mo='<rect x="15" y="18" width="2" height="2" fill="#000"/>'

  const av = t[6]
  let ac = ''
  if(av===1) ac='<rect x="11" y="10" width="10" height="1" fill="#000"/><rect x="11" y="11" width="10" height="1" fill="#333"/>'
  else if(av===2) ac='<rect x="9" y="15" width="1" height="2" fill="#fff"/><rect x="22" y="15" width="1" height="2" fill="#fff"/>'
  else if(av===3) ac='<rect x="13" y="12" width="6" height="1" fill="#ffd700"/>'
  else if(av===4) ac='<rect x="12" y="14" width="2" height="1" fill="#fff"/><rect x="18" y="14" width="2" height="1" fill="#fff"/>'
  else if(av===5) ac='<rect x="15" y="9" width="2" height="2" fill="#ff4fd8"/>'

  const cv = t[11]
  let co = ''
  if(cv===1) co='<rect x="3" y="5" width="1" height="1" fill="#fff"/><rect x="28" y="8" width="1" height="1" fill="#fff"/><rect x="6" y="27" width="1" height="1" fill="#fff"/><rect x="26" y="24" width="1" height="1" fill="#fff"/>'
  else if(cv===2) co='<rect x="2" y="2" width="1" height="1" fill="#fff"/><rect x="29" y="3" width="1" height="1" fill="#fff"/><rect x="4" y="28" width="1" height="1" fill="#ff4fd8"/><rect x="27" y="26" width="1" height="1" fill="#00eaff"/><rect x="15" y="2" width="1" height="1" fill="#fff" opacity="0.6"/>'
  else if(cv===3) co='<rect x="2" y="16" width="1" height="1" fill="#fff"/><rect x="29" y="16" width="1" height="1" fill="#fff"/><rect x="16" y="2" width="1" height="1" fill="#fff"/><rect x="16" y="29" width="1" height="1" fill="#fff"/>'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
<defs>
<radialGradient id="${bi}" cx="50%" cy="50%" r="70%"><stop offset="0%" stop-color="${bgA}"/><stop offset="100%" stop-color="${bgB}"/></radialGradient>
<linearGradient id="${ci}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${cA}"/><stop offset="100%" stop-color="${cB}"/></linearGradient>
<filter id="${gi}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${gl}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="32" height="32" fill="url(#${bi})"/>
${co}
<g filter="url(#${gi})">${ar}${body}${ru}${ha}${ey}${mo}${ac}</g>
<text x="1" y="31" font-family="monospace" font-size="2" fill="#ffffff80">#${id}</text>
<text x="31" y="31" text-anchor="end" font-family="monospace" font-size="2" fill="#ffffff60">${sa(owner)}</text>
<text x="1" y="3" font-family="monospace" font-size="2" fill="#ffffff40">${fs(sizeEth)}</text>
</svg>`
}

export function randomAddr() {
  const hex = '0123456789abcdef'
  let s = '0x'
  for (let i = 0; i < 40; i++) s += hex[Math.floor(Math.random() * 16)]
  return s
}

export function randomSeed(id) {
  return packSeed({
    block: 1000 + Math.floor(Math.random() * 999000),
    time:  1700000000 + Math.floor(Math.random() * 10000000),
    prev:  Math.floor(Math.random() * 1e12),
    id, cumu: Math.floor(Math.random() * 1e6),
    size: Math.random() * 3 + 0.001,
    wallet: randomAddr(),
    zeroForOne: Math.random() < 0.5,
  })
}
