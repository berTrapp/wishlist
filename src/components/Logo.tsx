import { useId } from 'react'

/** Marca C: carrinho em W cuja última perna vira a seta de alta */
export function LogoMark({ size = 32, title }: { size?: number; title?: string }) {
  const gid = useId()
  return (
    <svg width={size} height={size * 0.86} viewBox="-4 -4 116 100" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="10" y1="60" x2="106" y2="14">
          <stop offset="0" stopColor="var(--data)" />
          <stop offset=".52" stopColor="var(--data)" />
          <stop offset=".66" stopColor="#ff8a5c" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#${gid})`} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 14 H18 L32 70 L48 36 L64 70 L102 18" />
        <path d="M84 16 H104 V36" />
      </g>
      <circle cx="34" cy="86" r="6.5" fill="var(--data)" />
      <circle cx="62" cy="86" r="6.5" fill="var(--data)" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark size={30} />
      <span className="logo__word">
        Wish<b>List</b>
      </span>
    </span>
  )
}
