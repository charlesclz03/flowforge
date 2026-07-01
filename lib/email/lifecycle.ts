import { Resend } from 'resend'

// Lifecycle email engine.
//
// Safe by construction: a no-op when RESEND_API_KEY is missing, and every send
// is wrapped so it can NEVER throw into the caller (signup/checkout must not break
// because an email failed). Strategy + full copy live in autonomy/LIFECYCLE_EMAILS.md;
// these are the production templates the app actually sends.

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM = process.env.RESEND_FROM_EMAIL || 'Freestyla <hello@freestyla.app>'

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://www.freestyla.app'

export type EmailLocale = 'en' | 'fr' | 'pt'

export type LifecycleSendResult = {
  sent: boolean
  skipped?: string
  error?: string
}

export type LifecycleEmailArgs = {
  to: string
  name?: string | null
  locale?: string | null
}

function normalizeLocale(input?: string | null): EmailLocale {
  const value = (input || '').trim().slice(0, 2).toLowerCase()
  return value === 'fr' || value === 'pt' ? (value as EmailLocale) : 'en'
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function firstName(name: string | null | undefined, locale: EmailLocale): string {
  const candidate = (name || '').trim().split(/\s+/)[0]
  if (candidate) return candidate
  return locale === 'fr' ? 'toi' : locale === 'pt' ? 'você' : 'there'
}

function utm(path: string, campaign: string): string {
  return `${APP_URL}${path}?utm_source=email&utm_medium=lifecycle&utm_campaign=${campaign}`
}

function render(text: string, ctaLabel: string, ctaUrl: string): string {
  const paragraphs = text
    .split('\n\n')
    .map((p) => `<p style="margin:0 0 16px">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('')

  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111;max-width:520px">
${paragraphs}
<p style="margin:24px 0"><a href="${ctaUrl}" style="display:inline-block;background:#7D7AFF;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">${escapeHtml(ctaLabel)}</a></p>
<p style="color:#888;font-size:12px;margin-top:24px">Freestyla — freestyle rap practice. <a href="${APP_URL}" style="color:#888">freestyla.app</a></p>
</div>`
}

async function deliver(
  to: string,
  subject: string,
  text: string,
  ctaLabel: string,
  ctaUrl: string
): Promise<LifecycleSendResult> {
  if (!resend) return { sent: false, skipped: 'RESEND_API_KEY not set' }
  if (!to || !to.includes('@')) return { sent: false, skipped: 'invalid recipient' }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      text: `${text}\n\n${ctaLabel}: ${ctaUrl}`,
      html: render(text, ctaLabel, ctaUrl),
    })
    if (error) return { sent: false, error: String(error) }
    return { sent: true }
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : 'send failed',
    }
  }
}

// 1. Onboarding welcome — on first profile completion.
export async function sendWelcomeEmail(
  args: LifecycleEmailArgs
): Promise<LifecycleSendResult> {
  const locale = normalizeLocale(args.locale)
  const name = firstName(args.name, locale)
  const url = utm('/howitworks', 'onboard_welcome')

  const content: Record<EmailLocale, { subject: string; text: string; cta: string }> = {
    en: {
      subject: 'Welcome to Freestyla — your first bars start now',
      text: `Yo ${name},\n\nWelcome to Freestyla. The whole idea: pick a beat, and word prompts drop in time while you freestyle. No setup, no pressure.\n\nYour first session, three taps: pick a beat, set your language and difficulty, then talk on the beat — don't force rhymes, just keep going.\n\nPractice is free, forever. See you in the booth.`,
      cta: 'Start your first freestyle',
    },
    fr: {
      subject: 'Bienvenue sur Freestyla — tes premières barres, maintenant',
      text: `Yo ${name},\n\nBienvenue sur Freestyla. Le principe : tu choisis un beat, et des mots tombent sur le rythme pendant que tu freestyles. Zéro prise de tête.\n\nTa première session, trois taps : choisis un beat, règle ta langue et la difficulté, puis parle sur le beat — force pas les rimes, continue.\n\nLa pratique est gratuite, pour toujours. À tout de suite.`,
      cta: 'Lance ton premier freestyle',
    },
    pt: {
      subject: 'Bem-vindo à Freestyla — tuas primeiras barras, agora',
      text: `Yo ${name},\n\nBem-vindo à Freestyla. A ideia é simples: escolhe um beat e as palavras caem no compasso enquanto tu improvisa. Sem complicação.\n\nTua primeira sessão, três toques: escolhe um beat, define a língua e a dificuldade, depois fala no beat — não força a rima, só continua.\n\nA prática é grátis, para sempre. Até já.`,
      cta: 'Começa teu primeiro freestyle',
    },
  }

  const c = content[locale]
  return deliver(args.to, c.subject, c.text, c.cta, url)
}

// 2. Free -> Pro welcome — after a successful upgrade.
export async function sendProWelcomeEmail(
  args: LifecycleEmailArgs
): Promise<LifecycleSendResult> {
  const locale = normalizeLocale(args.locale)
  const name = firstName(args.name, locale)
  const url = utm('/recordings', 'pro_welcome')

  const content: Record<EmailLocale, { subject: string; text: string; cta: string }> = {
    en: {
      subject: `You're Pro — keep every take`,
      text: `${name}, you're in.\n\nPro unlocks saving, replaying, and downloading your recordings, the premium beat vault, your own beat uploads, and full stats and streak history.\n\nGo make something worth keeping.`,
      cta: 'Open your recordings',
    },
    fr: {
      subject: 'Tu es Pro — garde chaque prise',
      text: `${name}, c'est bon.\n\nPro débloque la sauvegarde, la réécoute et le téléchargement de tes enregistrements, le Beat Vault premium, l'upload de tes propres beats, et tout ton historique de stats et de séries.\n\nVa créer quelque chose à garder.`,
      cta: 'Ouvre tes enregistrements',
    },
    pt: {
      subject: 'Tu é Pro — guarda cada take',
      text: `${name}, tá dentro.\n\nO Pro libera salvar, reescutar e baixar tuas gravações, o Beat Vault premium, upload dos teus próprios beats, e todo o histórico de estatísticas e sequência.\n\nVai criar algo pra guardar.`,
      cta: 'Abre tuas gravações',
    },
  }

  const c = content[locale]
  return deliver(args.to, c.subject, c.text, c.cta, url)
}

// 3. Day-3 nudge — for a scheduled task (signup + no recent session).
export async function sendDay3NudgeEmail(
  args: LifecycleEmailArgs
): Promise<LifecycleSendResult> {
  const locale = normalizeLocale(args.locale)
  const name = firstName(args.name, locale)
  const url = utm('/difficultyselection', 'nudge_day3')

  const content: Record<EmailLocale, { subject: string; text: string; cta: string }> = {
    en: {
      subject: `${name}, your flow needs reps`,
      text: `Hey ${name},\n\nFreestyle is a muscle. The people who get scary-good aren't gifted — they just put in daily reps.\n\nTwo minutes today: one beat, one session. That's it. Start a streak and watch your bars tighten up.`,
      cta: 'Run a quick session',
    },
    fr: {
      subject: `${name}, ton flow a besoin de reps`,
      text: `Hey ${name},\n\nLe freestyle, c'est un muscle. Ceux qui deviennent monstrueux ne sont pas des génies — ils font des reps tous les jours.\n\nDeux minutes aujourd'hui : un beat, une session. C'est tout. Démarre une série et regarde tes barres se resserrer.`,
      cta: 'Lance une session',
    },
    pt: {
      subject: `${name}, teu flow precisa de reps`,
      text: `Hey ${name},\n\nFreestyle é músculo. Quem fica absurdo de bom não é dom — é rep diária.\n\nDois minutos hoje: um beat, uma sessão. Só isso. Começa uma sequência e vê tuas barras afiarem.`,
      cta: 'Manda uma sessão',
    },
  }

  const c = content[locale]
  return deliver(args.to, c.subject, c.text, c.cta, url)
}

// 4. Winback — for a scheduled task (cancelled/lapsed or inactive).
export async function sendWinbackEmail(
  args: LifecycleEmailArgs
): Promise<LifecycleSendResult> {
  const locale = normalizeLocale(args.locale)
  const name = firstName(args.name, locale)
  const url = utm('/difficultyselection', 'winback')

  const content: Record<EmailLocale, { subject: string; text: string; cta: string }> = {
    en: {
      subject: `${name}, your booth is still warm`,
      text: `${name}, haven't seen you in the booth lately. No guilt trip — just a nudge.\n\nYour progress is saved, the beat vault has been growing, and one short session is all it takes to get the flow back.`,
      cta: 'Jump back in',
    },
    fr: {
      subject: `${name}, ta cabine est encore chaude`,
      text: `${name}, on t'a pas vu en cabine ces temps-ci. Pas de culpabilité — juste un petit rappel.\n\nTa progression est sauvegardée, le Beat Vault s'est agrandi, et une session courte suffit à retrouver le flow.`,
      cta: 'Reviens',
    },
    pt: {
      subject: `${name}, tua cabine ainda tá quente`,
      text: `${name}, faz um tempo que tu não aparece na cabine. Sem cobrança — só um lembrete.\n\nTeu progresso tá salvo, o Beat Vault cresceu, e uma sessão curta já basta pra recuperar o flow.`,
      cta: 'Volta pra dentro',
    },
  }

  const c = content[locale]
  return deliver(args.to, c.subject, c.text, c.cta, url)
}
