import { Link, NavLink } from 'react-router'
import { Logo } from './Logo'

interface Props {
  onAdd: () => void
  email?: string
  onSignIn?: () => void
  onSignOut?: () => void
}

export function Header({ onAdd, email, onSignIn, onSignOut }: Props) {
  return (
    <>
      <header className="topbar">
        <div className="topbar__inner">
          <Link to="/" className="topbar__brand" aria-label="WishList, ir para a lista">
            <Logo />
          </Link>
          <nav className="topbar__nav" aria-label="Principal">
            <NavLink to="/" end>
              Lista
            </NavLink>
            <Link to={{ pathname: '/', hash: 'linha-do-tempo' }}>Planejamento</Link>
            <Link to={{ pathname: '/', hash: 'alertas' }}>Alertas</Link>
            <NavLink to="/botao">Botão Salvar</NavLink>
          </nav>
          <div className="topbar__actions">
            <button className="btn btn--accent topbar__add" onClick={onAdd}>
              <span aria-hidden="true">+</span> Adicionar desejo
            </button>
            {email && onSignOut && (
              <details className="account">
                <summary aria-label={`Conta: ${email}`}>{email.slice(0, 1).toUpperCase()}</summary>
                <div className="account__menu">
                  <span className="small muted">{email}</span>
                  <button className="btn btn--block" onClick={onSignOut}>
                    Sair
                  </button>
                </div>
              </details>
            )}
            {onSignIn && (
              <button className="btn" onClick={onSignIn}>
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      <nav className="tabbar" aria-label="Navegação do celular">
        <NavLink to="/" end>
          <TabIcon d="M4 6h16M4 12h16M4 18h10" />
          Lista
        </NavLink>
        <Link to={{ pathname: '/', hash: 'linha-do-tempo' }}>
          <TabIcon d="M3 18l5-7 4 4 4-8 5 11" />
          Plano
        </Link>
        <Link to={{ pathname: '/', hash: 'alertas' }}>
          <TabIcon d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 20h4" />
          Alertas
        </Link>
      </nav>
      <button className="fab" onClick={onAdd} aria-label="Adicionar desejo">
        +
      </button>
    </>
  )
}

function TabIcon({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}
