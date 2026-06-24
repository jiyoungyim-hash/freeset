export default function Header({ logoSrc }: { logoSrc: string }) {
  return (
    <header className="header">
      <div className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="LA ROSÉE PARIS" className="brand-logo" />
      </div>
      <div className="header-badge">KOREA</div>
    </header>
  )
}
