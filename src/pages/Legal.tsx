import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Logo } from '../components/Logo'

const UPDATED = '26/11/2026'
const CONTACT = 'https://github.com/berTrapp/wishlist/issues'

function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="legal-wrap">
      <header className="legal-top">
        <Link to="/" aria-label="WishList, ir para o início">
          <Logo />
        </Link>
      </header>
      <main className="page legal">
        <article className="panel">
          <p className="eyebrow">Atualizado em {UPDATED}</p>
          <h1>{title}</h1>
          {children}
        </article>
        <LegalLinks />
      </main>
    </div>
  )
}

export function LegalLinks() {
  return (
    <nav className="legal-links small" aria-label="Documentos">
      <Link to="/privacidade">Privacidade</Link>
      <Link to="/termos">Termos de uso</Link>
    </nav>
  )
}

export function Privacy() {
  return (
    <LegalPage title="Política de privacidade">
      <p>
        A WishList é um projeto pessoal e de portfólio que ajuda você a planejar compras: mostra quanto um produto pesa na sua sobra do mês, quando dá
        para comprar e em qual loja sai mais barato. Esta página explica quais dados o app usa e por quê, seguindo a Lei Geral de Proteção de Dados
        (LGPD).
      </p>

      <h2>Quais dados coletamos</h2>
      <ul>
        <li>
          <b>Conta:</b> seu email e, se você entrar com o Google, o nome e a foto de perfil que o Google compartilha. A senha, quando usada, fica
          guardada de forma criptografada pelo serviço de autenticação, e ninguém do projeto tem acesso a ela.
        </li>
        <li>
          <b>Sua lista:</b> os desejos que você cadastra (nome, categoria, prioridade, preços, lojas e notas), a sobra mensal que você informa, a
          porcentagem que quer guardar e os depósitos que registra.
        </li>
        <li>
          <b>No navegador:</b> no modo demonstração, a lista fica salva só no seu navegador (localStorage). O app também guarda a sessão de login para
          você não precisar entrar de novo. Não usamos cookies de propaganda nem ferramentas de rastreamento.
        </li>
      </ul>

      <h2>Para que usamos</h2>
      <p>
        Só para fazer o app funcionar: entrar na sua conta, mostrar a sua lista em qualquer aparelho e calcular prazos e comparações. Não vendemos,
        alugamos nem compartilhamos seus dados para publicidade.
      </p>

      <h2>Onde os dados ficam</h2>
      <p>
        Os dados da conta e da lista ficam no Supabase, em servidores em São Paulo, com regras que deixam cada pessoa ver só os próprios dados. O
        site é hospedado pela Vercel. Se você entrar com o Google, o login passa pelo Google, que segue a própria política de privacidade.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir a qualquer momento para ver, corrigir ou apagar seus dados e a sua conta. Os desejos e depósitos podem ser editados no próprio
        app. Para apagar a conta inteira, abra um pedido no{' '}
        <a href={CONTACT} target="_blank" rel="noreferrer">
          repositório do projeto no GitHub
        </a>{' '}
        e ele é atendido em até 15 dias.
      </p>

      <h2>Mudanças</h2>
      <p>Se esta política mudar, a data no topo da página é atualizada. Mudanças importantes também são avisadas no app.</p>
    </LegalPage>
  )
}

export function Terms() {
  return (
    <LegalPage title="Termos de uso">
      <p>Ao usar a WishList você concorda com estes termos. Eles são curtos porque o app é simples.</p>

      <h2>O que é o app</h2>
      <p>
        A WishList é um projeto pessoal e de portfólio, gratuito, para organizar desejos de compra e planejar quanto guardar por mês. Ela não é um
        serviço financeiro, não vende produtos e não faz pagamentos.
      </p>

      <h2>Preços e cálculos</h2>
      <p>
        Preços, fretes, parcelas e prazos são estimativas e podem estar desatualizados. Confira sempre o valor na loja antes de comprar. Os cálculos de
        juros e de sobra do mês servem para planejar e não são recomendação financeira.
      </p>

      <h2>Links de lojas</h2>
      <p>
        Alguns links para lojas podem ser links de afiliado. Se você comprar por eles, o projeto pode receber uma pequena comissão, sem custo extra para
        você.
      </p>

      <h2>Sua conta</h2>
      <p>
        Você é responsável pelo que cadastra e por manter sua senha em segredo. Não use o app para nada ilegal ou para atrapalhar o serviço. Contas
        usadas assim podem ser removidas.
      </p>

      <h2>Disponibilidade</h2>
      <p>
        O app é oferecido como está, sem garantia de que vai funcionar sempre ou sem erros. Ele pode mudar ou sair do ar. Se isso acontecer, avisamos
        com antecedência sempre que possível para você poder anotar seus dados.
      </p>

      <h2>Privacidade</h2>
      <p>
        O uso dos seus dados está descrito na <Link to="/privacidade">política de privacidade</Link>.
      </p>

      <h2>Contato</h2>
      <p>
        Dúvidas ou pedidos podem ser enviados pelo{' '}
        <a href={CONTACT} target="_blank" rel="noreferrer">
          repositório do projeto no GitHub
        </a>
        . Estes termos seguem as leis do Brasil.
      </p>
    </LegalPage>
  )
}
