export function HexMark({ className = 'h-16 w-16', filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Hexagon mark">
      <polygon points="32,5 55,18.5 55,45.5 32,59 9,45.5 9,18.5" fill={filled ? 'var(--color-gold)' : 'none'} stroke="var(--color-gold)" strokeWidth="3" strokeLinejoin="round" />
      <text x="32" y="38" textAnchor="middle" fontFamily="Inter Variable, Inter, sans-serif" fontWeight="800" fontSize="16" fill={filled ? 'var(--color-on-gold)' : 'var(--color-gold)'}>RS</text>
    </svg>
  );
}
