import { useState } from 'react'
import { LogoMark } from '../components/Logo'
import { supabase } from '../lib/supabase'

const ERRORS: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'Confirme seu e-mail pelo link que enviamos antes de entrar.',
  'User already registered': 'Já existe uma conta com esse e-mail. Use "Entrar".',
}

export function Login({ onDemo }: { onDemo: () => void }) {
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supabase) return
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email') || '').trim()
    const password = String(f.get('password') || '')
    if (password.length < 8) return setError('A senha precisa ter pelo menos 8 caracteres.')
    setBusy(true)
    setError('')
    setInfo('')
    const res =
      mode === 'in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
    setBusy(false)
    if (res.error) return setError(ERRORS[res.error.message] ?? res.error.message)
    if (mode === 'up' && !res.data.session) setInfo(`Enviamos um link de confirmação para ${email}. Abra o e-mail e depois entre aqui.`)
  }

  async function google() {
    if (!supabase) return
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
    if (error) setError(error.message === 'Unsupported provider: provider is not enabled' ? 'O login com Google ainda não foi ativado neste projeto.' : error.message)
  }

  return (
    <main className="auth">
      <section className="auth__card panel" aria-labelledby="auth-title">
        <div className="auth__brand">
          <LogoMark size={44} />
          <span className="logo__word">
            Wish<b>List</b>
          </span>
        </div>
        <h1 id="auth-title">{mode === 'in' ? 'Entre na sua lista' : 'Crie sua conta'}</h1>
        <p className="muted">Seus desejos, depósitos e simulações salvos em qualquer aparelho.</p>

        <button className="btn btn--block btn--google" onClick={google} type="button">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          Continuar com Google
        </button>

        <div className="auth__or">
          <span>ou com e-mail</span>
        </div>

        <form className="auth__form" onSubmit={submit}>
          <label className="field">
            <span>E-mail</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label className="field">
            <span>Senha</span>
            <input name="password" type="password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} minLength={8} required />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {info && (
            <p className="form-info" role="status">
              {info}
            </p>
          )}
          <button className="btn btn--accent btn--block" disabled={busy}>
            {busy ? 'Aguarde…' : mode === 'in' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="small auth__switch">
          {mode === 'in' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
          <button className="link-btn" onClick={() => (setMode(mode === 'in' ? 'up' : 'in'), setError(''), setInfo(''))}>
            {mode === 'in' ? 'Criar conta' : 'Entrar'}
          </button>
        </p>
        <hr className="auth__rule" />
        <button className="btn btn--block" onClick={onDemo}>
          Ver demonstração sem conta
        </button>
      </section>
    </main>
  )
}
