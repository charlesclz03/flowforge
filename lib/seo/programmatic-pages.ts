// Programmatic SEO content map.
//
// Each entry renders a server-rendered, indexable page at /learn/[slug].
// Pages are grouped into translation clusters (same `cluster`, different `lang`)
// so the route can emit correct hreflang alternates. Adding a page = adding data
// here; no code changes needed.

export type PageLang = 'en' | 'fr' | 'pt'

export type PageCategory = 'getting-started' | 'technique' | 'cypher' | 'beats'

export const PAGE_LANGS: PageLang[] = ['en', 'fr', 'pt']

export const LANG_LABEL: Record<PageLang, string> = {
  en: 'English',
  fr: 'Français',
  pt: 'Português',
}

export const CATEGORY_LABEL: Record<PageCategory, string> = {
  'getting-started': 'Getting started',
  technique: 'Technique',
  cypher: 'Cypher',
  beats: 'Beats',
}

export interface ProgrammaticSection {
  heading: string
  body: string
}

export interface ProgrammaticFAQ {
  question: string
  answer: string
}

export interface ProgrammaticPage {
  slug: string
  lang: PageLang
  cluster: string
  category: PageCategory
  title: string
  h1: string
  description: string
  keywords: string[]
  intro: string
  sections: ProgrammaticSection[]
  faqs: ProgrammaticFAQ[]
  related: string[]
  updated: string
}

export const PROGRAMMATIC_PAGES: ProgrammaticPage[] = [
  {
    slug: 'freestyle-rap-practice-for-beginners',
    lang: 'en',
    cluster: 'beginners',
    category: 'getting-started',
    title: 'Freestyle Rap Practice for Beginners: Start in 10 Minutes',
    h1: 'Freestyle rap practice for beginners',
    description:
      'A beginner-friendly way to start freestyling: drop the fear of rhyming, talk on the beat, and use word prompts to keep going. Practice free in EN, FR, or PT.',
    keywords: [
      'freestyle rap practice',
      'how to freestyle for beginners',
      'learn to freestyle',
      'beginner rap practice',
    ],
    intro:
      'Everyone who can freestyle was once terrible at it. The only difference between you and them is reps. This guide gives you a beginner-friendly way to start today: no audience, no pressure, just you, a beat, and a few simple rules.',
    sections: [
      {
        heading: 'Stop trying to rhyme',
        body: 'The biggest beginner mistake is forcing rhymes. Instead, just talk on the beat: describe the room, your day, what you can see. Rhymes come naturally once your timing is locked. Flow first, rhymes second.',
      },
      {
        heading: 'Use word prompts so you never freeze',
        body: 'Blanking mid-bar is normal. A word prompt gives your brain something to grab. Practice with on-beat prompts so there is always a next word waiting, and you build the habit of continuing instead of stopping.',
      },
      {
        heading: 'Keep sessions short and daily',
        body: 'Two focused minutes a day beats one long session a week. Short reps lower the pressure and build the muscle. Track a streak so showing up becomes automatic.',
      },
    ],
    faqs: [
      {
        question: 'How do I start freestyling if I have never done it?',
        answer:
          'Pick an easy beat, set a slow word cadence, and just talk on rhythm. Do not aim for punchlines, aim to keep going for 16 bars without stopping.',
      },
      {
        question: 'Do I need to be good at rhyming?',
        answer:
          'No. Timing matters more than rhyme when you start. Lock into the beat first; rhymes get easier with reps.',
      },
      {
        question: 'How long until I get good?',
        answer:
          'Most people feel a noticeable difference after a few weeks of short daily practice. Consistency beats talent.',
      },
    ],
    related: ['how-to-freestyle-on-beat', 'freestyle-rap-exercises-and-drills'],
    updated: '2026-06-29',
  },
  {
    slug: 'pratique-du-freestyle-rap-pour-debutants',
    lang: 'fr',
    cluster: 'beginners',
    category: 'getting-started',
    title: 'Pratique du freestyle rap pour débutants : commence en 10 minutes',
    h1: 'Pratique du freestyle rap pour débutants',
    description:
      'Une méthode simple pour débuter le freestyle : arrête de chercher la rime, parle sur le rythme, et utilise des mots-guides pour ne jamais bloquer. Gratuit en EN, FR ou PT.',
    keywords: [
      'freestyle rap débutant',
      'comment freestyler',
      'apprendre le freestyle',
      'impro rap débutant',
    ],
    intro:
      'Tous ceux qui savent freestyler ont d’abord été mauvais. La seule différence entre toi et eux, c’est le nombre de répétitions. Ce guide te donne une méthode simple pour commencer aujourd’hui : sans public, sans pression, juste toi, un beat et quelques règles.',
    sections: [
      {
        heading: 'Arrête de chercher la rime',
        body: 'L’erreur classique du débutant, c’est de forcer les rimes. À la place, parle juste sur le beat : décris la pièce, ta journée, ce que tu vois. Les rimes viennent toutes seules quand ton timing est calé. Le flow d’abord, la rime ensuite.',
      },
      {
        heading: 'Utilise des mots-guides pour ne jamais bloquer',
        body: 'Bloquer en plein milieu, c’est normal. Un mot-guide donne à ton cerveau quelque chose à attraper. Entraîne-toi avec des mots qui tombent sur le rythme : il y a toujours un mot suivant qui t’attend, et tu prends l’habitude de continuer au lieu de t’arrêter.',
      },
      {
        heading: 'Des sessions courtes et quotidiennes',
        body: 'Deux minutes par jour valent mieux qu’une heure par semaine. Les répétitions courtes baissent la pression et construisent le muscle. Suis une série pour que t’entraîner devienne automatique.',
      },
    ],
    faqs: [
      {
        question: 'Comment commencer le freestyle quand on n’a jamais essayé ?',
        answer:
          'Choisis un beat facile, règle une cadence de mots lente, et parle simplement en rythme. Ne vise pas la punchline, vise 16 mesures sans t’arrêter.',
      },
      {
        question: 'Faut-il savoir bien rimer ?',
        answer:
          'Non. Au début, le timing compte plus que la rime. Cale-toi d’abord sur le beat ; les rimes viennent avec la pratique.',
      },
      {
        question: 'Combien de temps pour devenir bon ?',
        answer:
          'La plupart des gens sentent une vraie différence après quelques semaines de pratique courte et quotidienne. La régularité bat le talent.',
      },
    ],
    related: [
      'comment-freestyler-en-rythme',
      'exercices-de-freestyle-rap',
    ],
    updated: '2026-06-29',
  },
  {
    slug: 'pratica-de-freestyle-para-iniciantes',
    lang: 'pt',
    cluster: 'beginners',
    category: 'getting-started',
    title: 'Prática de freestyle para iniciantes: começa em 10 minutos',
    h1: 'Prática de freestyle para iniciantes',
    description:
      'Um jeito simples de começar a improvisar: para de caçar rima, fala no ritmo e usa palavras-guia pra nunca travar. Grátis em EN, FR ou PT.',
    keywords: [
      'freestyle iniciante',
      'como improvisar',
      'aprender freestyle',
      'rima de improviso',
    ],
    intro:
      'Todo mundo que sabe improvisar já foi ruim um dia. A única diferença entre tu e eles é a quantidade de repetição. Este guia te dá um jeito simples de começar hoje: sem plateia, sem pressão, só tu, um beat e algumas regras.',
    sections: [
      {
        heading: 'Para de caçar rima',
        body: 'O erro clássico do iniciante é forçar a rima. Em vez disso, só fala no beat: descreve o quarto, teu dia, o que tu vê. As rimas vêm sozinhas quando teu tempo está encaixado. Flow primeiro, rima depois.',
      },
      {
        heading: 'Usa palavras-guia pra nunca travar',
        body: 'Travar no meio do verso é normal. Uma palavra-guia dá ao teu cérebro algo pra segurar. Treina com palavras que caem no ritmo: sempre tem uma próxima palavra te esperando, e tu cria o hábito de continuar em vez de parar.',
      },
      {
        heading: 'Sessões curtas e diárias',
        body: 'Dois minutos por dia valem mais que uma hora por semana. Repetições curtas baixam a pressão e constroem o músculo. Acompanha uma sequência pra começar a virar automático.',
      },
    ],
    faqs: [
      {
        question: 'Como começar no freestyle se nunca fiz?',
        answer:
          'Escolhe um beat fácil, define uma cadência de palavras lenta e fala no ritmo. Não mira na punchline, mira em 16 compassos sem parar.',
      },
      {
        question: 'Preciso ser bom de rima?',
        answer:
          'Não. No começo, o tempo importa mais que a rima. Encaixa primeiro no beat; as rimas ficam fáceis com a prática.',
      },
      {
        question: 'Quanto tempo pra ficar bom?',
        answer:
          'A maioria sente diferença real depois de algumas semanas de prática curta e diária. Constância vence talento.',
      },
    ],
    related: ['como-improvisar-no-ritmo', 'exercicios-de-freestyle'],
    updated: '2026-06-29',
  },
  {
    slug: 'how-to-freestyle-on-beat',
    lang: 'en',
    cluster: 'on-beat',
    category: 'technique',
    title: 'How to Freestyle On Beat: Lock Into the Pocket',
    h1: 'How to freestyle on beat',
    description:
      'Staying on beat is what separates clean freestyles from messy ones. Learn to find the pocket, count bars, and let prompts land in time. Practice free.',
    keywords: [
      'how to freestyle on beat',
      'stay on beat rapping',
      'rap timing',
      'find the pocket',
    ],
    intro:
      'Flow beats rhymes. A simple line delivered in the pocket sounds better than a clever bar that is off-time. Here is how to lock your freestyle to the beat.',
    sections: [
      {
        heading: 'Find the pocket',
        body: 'The pocket is the comfortable space just behind the drums where vocals sit. Nod your head to the beat first, then start talking on that nod. If your head is on time, your bars will be too.',
      },
      {
        heading: 'Count in bars, not lines',
        body: 'Beats move in four-beat bars. Practice landing a thought every 2 or 4 bars instead of rushing. Counting bars gives your brain a rhythm to plan around.',
      },
      {
        heading: 'Let prompts land on the downbeat',
        body: 'Practicing with word prompts that drop in time trains you to start each bar on beat. Aim to hit the new word right on the count: it builds automatic timing.',
      },
    ],
    faqs: [
      {
        question: 'Why do I keep going off beat?',
        answer:
          'Usually you are rushing to fit words in. Slow down, use fewer words per bar, and let some space breathe. Space is on-beat too.',
      },
      {
        question: 'How do I practice staying on beat?',
        answer:
          'Nod to the beat, count bars out loud, and practice with on-beat prompts so you start each bar on the downbeat.',
      },
      {
        question: 'What BPM is easiest for beginners?',
        answer:
          'Around 80 to 90 BPM gives you room to think. Start slow, then speed up as your timing tightens.',
      },
    ],
    related: [
      'freestyle-rap-practice-for-beginners',
      'best-bpm-for-freestyle-practice',
    ],
    updated: '2026-06-29',
  },
  {
    slug: 'comment-freestyler-en-rythme',
    lang: 'fr',
    cluster: 'on-beat',
    category: 'technique',
    title: 'Comment freestyler en rythme : cale-toi dans le pocket',
    h1: 'Comment freestyler en rythme',
    description:
      'Rester en rythme, c’est ce qui sépare un freestyle propre d’un freestyle brouillon. Apprends à trouver le pocket, compter les mesures et poser tes mots à temps. Gratuit.',
    keywords: [
      'freestyler en rythme',
      'rester dans le tempo',
      'timing rap',
      'trouver le pocket',
    ],
    intro:
      'Le flow passe avant la rime. Une phrase simple posée dans le pocket sonne mieux qu’une punchline hors-temps. Voici comment caler ton freestyle sur le beat.',
    sections: [
      {
        heading: 'Trouve le pocket',
        body: 'Le pocket, c’est l’espace confortable juste derrière la batterie où la voix se pose. Hoche la tête sur le beat d’abord, puis commence à parler sur ce hochement. Si ta tête est à temps, tes phrases le seront aussi.',
      },
      {
        heading: 'Compte en mesures, pas en lignes',
        body: 'Les beats avancent par mesures de quatre temps. Entraîne-toi à poser une idée toutes les 2 ou 4 mesures au lieu de te précipiter. Compter les mesures donne à ton cerveau un rythme pour anticiper.',
      },
      {
        heading: 'Pose les mots sur le temps fort',
        body: 'T’entraîner avec des mots qui tombent sur le rythme t’apprend à démarrer chaque mesure à temps. Vise à dire le nouveau mot pile sur le compte : ça construit un timing automatique.',
      },
    ],
    faqs: [
      {
        question: 'Pourquoi je sors toujours du rythme ?',
        answer:
          'En général, tu te précipites pour caser des mots. Ralentis, mets moins de mots par mesure, et laisse respirer. Le silence aussi est dans le rythme.',
      },
      {
        question: 'Comment travailler le fait de rester en rythme ?',
        answer:
          'Hoche la tête sur le beat, compte les mesures à voix haute, et entraîne-toi avec des mots qui tombent sur le temps fort.',
      },
      {
        question: 'Quel BPM est le plus facile pour débuter ?',
        answer:
          'Autour de 80 à 90 BPM, tu as le temps de penser. Commence lentement, puis accélère quand ton timing se resserre.',
      },
    ],
    related: [
      'pratique-du-freestyle-rap-pour-debutants',
      'exercices-de-freestyle-rap',
    ],
    updated: '2026-06-29',
  },
  {
    slug: 'como-improvisar-no-ritmo',
    lang: 'pt',
    cluster: 'on-beat',
    category: 'technique',
    title: 'Como improvisar no ritmo: encaixa no compasso',
    h1: 'Como improvisar no ritmo',
    description:
      'Ficar no ritmo é o que separa um freestyle limpo de um bagunçado. Aprende a achar o compasso, contar os tempos e soltar as palavras na hora certa. Grátis.',
    keywords: [
      'improvisar no ritmo',
      'ficar no tempo',
      'timing no rap',
      'achar o compasso',
    ],
    intro:
      'Flow vem antes da rima. Um verso simples no compasso soa melhor que uma punchline fora do tempo. Veja como encaixar teu freestyle no beat.',
    sections: [
      {
        heading: 'Acha o compasso',
        body: 'O compasso é o espaço confortável logo atrás da bateria onde a voz se encaixa. Balança a cabeça no beat primeiro, depois começa a falar nesse balanço. Se a cabeça está no tempo, os versos também vão estar.',
      },
      {
        heading: 'Conta em compassos, não em linhas',
        body: 'Os beats andam em compassos de quatro tempos. Treina soltar uma ideia a cada 2 ou 4 compassos em vez de correr. Contar compassos dá ao cérebro um ritmo pra planejar.',
      },
      {
        heading: 'Solta as palavras no tempo forte',
        body: 'Treinar com palavras que caem no ritmo te ensina a começar cada compasso no tempo. Mira em dizer a palavra nova bem na contagem: isso constrói timing automático.',
      },
    ],
    faqs: [
      {
        question: 'Por que eu sempre saio do ritmo?',
        answer:
          'Normalmente tu está correndo pra encaixar palavra. Diminui, põe menos palavra por compasso e deixa respirar. O silêncio também está no ritmo.',
      },
      {
        question: 'Como treinar pra ficar no ritmo?',
        answer:
          'Balança a cabeça no beat, conta os compassos em voz alta e treina com palavras que caem no tempo forte.',
      },
      {
        question: 'Qual BPM é mais fácil pra começar?',
        answer:
          'Por volta de 80 a 90 BPM dá tempo de pensar. Começa devagar e acelera quando o timing apertar.',
      },
    ],
    related: [
      'pratica-de-freestyle-para-iniciantes',
      'exercicios-de-freestyle',
    ],
    updated: '2026-06-29',
  },
  {
    slug: 'freestyle-rap-exercises-and-drills',
    lang: 'en',
    cluster: 'drills',
    category: 'technique',
    title: 'Freestyle Rap Exercises and Drills That Actually Work',
    h1: 'Freestyle rap exercises and drills',
    description:
      'Practical freestyle drills (word association, the 3-word challenge, beat switches) to build flow, vocabulary, and timing. Practice free.',
    keywords: [
      'freestyle exercises',
      'rap drills',
      'freestyle practice routine',
      'improve freestyle',
    ],
    intro:
      'You do not get better by freestyling more, you get better by freestyling with intent. These drills target the specific skills that make freestyles sound effortless.',
    sections: [
      {
        heading: 'Word association',
        body: 'Take a random word, say it, then rap whatever it makes you think of, then the next word that triggers, and so on. This trains the association reflex that keeps you from blanking.',
      },
      {
        heading: 'The 3-word challenge',
        body: 'Generate three random words and tie all three into one bar. It forces creative connections and builds the muscle for working a prompt into a line on the fly.',
      },
      {
        heading: 'Beat switches and cadence drills',
        body: 'Switch beats mid-flow, or force yourself to change cadence every 4 bars. Adapting your flow on demand is what makes you sound versatile instead of stuck in one pattern.',
      },
    ],
    faqs: [
      {
        question: 'How often should I practice freestyle?',
        answer:
          'Short daily reps beat long weekly sessions. Even five focused minutes a day compounds fast.',
      },
      {
        question: 'What is the best drill for blanking?',
        answer:
          'Word association. It trains your brain to always have a next thought ready, so you stop freezing.',
      },
      {
        question: 'Can I do these drills alone?',
        answer:
          'Yes, all of these work solo with a beat and a word generator. Cyphers add pressure later.',
      },
    ],
    related: [
      'freestyle-rap-practice-for-beginners',
      'how-to-run-a-rap-cypher',
    ],
    updated: '2026-06-29',
  },
  {
    slug: 'exercices-de-freestyle-rap',
    lang: 'fr',
    cluster: 'drills',
    category: 'technique',
    title: 'Exercices de freestyle rap qui marchent vraiment',
    h1: 'Exercices de freestyle rap',
    description:
      'Des exercices concrets (association de mots, le défi des 3 mots, changements de beat) pour travailler le flow, le vocabulaire et le timing. Gratuit.',
    keywords: [
      'exercices freestyle',
      'entraînement rap',
      'routine freestyle',
      'progresser en freestyle',
    ],
    intro:
      'On ne progresse pas en freestylant plus, mais en freestylant avec intention. Ces exercices ciblent les compétences précises qui rendent un freestyle fluide.',
    sections: [
      {
        heading: 'Association de mots',
        body: 'Prends un mot au hasard, dis-le, puis enchaîne sur ce qu’il t’évoque, puis le mot suivant qu’il déclenche, et ainsi de suite. Ça entraîne le réflexe d’association qui t’empêche de bloquer.',
      },
      {
        heading: 'Le défi des 3 mots',
        body: 'Génère trois mots au hasard et relie-les dans une seule phrase. Ça force des connexions créatives et muscle ta capacité à intégrer un mot-guide à la volée.',
      },
      {
        heading: 'Changements de beat et de cadence',
        body: 'Change de beat en plein flow, ou oblige-toi à changer de cadence toutes les 4 mesures. Adapter ton flow à la demande, c’est ce qui te rend polyvalent au lieu d’être coincé dans un seul schéma.',
      },
    ],
    faqs: [
      {
        question: 'À quelle fréquence s’entraîner ?',
        answer:
          'Les répétitions courtes et quotidiennes battent les longues sessions hebdomadaires. Même cinq minutes par jour, ça paie vite.',
      },
      {
        question: 'Quel exercice contre le blocage ?',
        answer:
          'L’association de mots. Elle entraîne ton cerveau à toujours avoir une idée suivante prête.',
      },
      {
        question: 'Je peux faire ces exercices seul ?',
        answer:
          'Oui, tout marche en solo avec un beat et un générateur de mots. Le cypher ajoute la pression ensuite.',
      },
    ],
    related: [
      'pratique-du-freestyle-rap-pour-debutants',
      'comment-freestyler-en-rythme',
    ],
    updated: '2026-06-29',
  },
  {
    slug: 'exercicios-de-freestyle',
    lang: 'pt',
    cluster: 'drills',
    category: 'technique',
    title: 'Exercícios de freestyle que funcionam de verdade',
    h1: 'Exercícios de freestyle',
    description:
      'Exercícios práticos (associação de palavras, o desafio das 3 palavras, troca de beats) pra treinar flow, vocabulário e timing. Grátis.',
    keywords: [
      'exercícios freestyle',
      'treino de rima',
      'rotina de freestyle',
      'melhorar no freestyle',
    ],
    intro:
      'Tu não melhora improvisando mais, melhora improvisando com intenção. Estes exercícios miram nas habilidades exatas que deixam o freestyle solto.',
    sections: [
      {
        heading: 'Associação de palavras',
        body: 'Pega uma palavra aleatória, fala ela, depois emenda no que ela te lembra, depois na próxima palavra que surgir, e por aí vai. Treina o reflexo de associação que te impede de travar.',
      },
      {
        heading: 'O desafio das 3 palavras',
        body: 'Gera três palavras aleatórias e liga as três num verso só. Força conexões criativas e fortalece a habilidade de encaixar uma palavra-guia na hora.',
      },
      {
        heading: 'Troca de beats e de cadência',
        body: 'Troca de beat no meio do flow, ou se obriga a mudar a cadência a cada 4 compassos. Adaptar o flow na hora é o que te deixa versátil em vez de preso num padrão só.',
      },
    ],
    faqs: [
      {
        question: 'Com que frequência treinar?',
        answer:
          'Repetição curta e diária vence sessão longa semanal. Até cinco minutos por dia rende rápido.',
      },
      {
        question: 'Qual exercício contra travar?',
        answer:
          'Associação de palavras. Treina o cérebro a sempre ter a próxima ideia pronta.',
      },
      {
        question: 'Dá pra fazer sozinho?',
        answer:
          'Sim, tudo funciona solo com um beat e um gerador de palavras. O cypher adiciona pressão depois.',
      },
    ],
    related: [
      'pratica-de-freestyle-para-iniciantes',
      'como-improvisar-no-ritmo',
    ],
    updated: '2026-06-29',
  },
  {
    slug: 'how-to-run-a-rap-cypher',
    lang: 'en',
    cluster: 'cypher',
    category: 'cypher',
    title: 'How to Run a Rap Cypher (Pass-the-Phone Rules)',
    h1: 'How to run a rap cypher',
    description:
      'Everything you need to run a rap cypher with friends: rotation rules, how long each turn lasts, and how to keep the energy up. Try cypher mode free for 2 to 4 players.',
    keywords: [
      'rap cypher',
      'how to cypher',
      'freestyle cypher rules',
      'group freestyle',
    ],
    intro:
      'A cypher is where freestyle gets fun, and where you improve fastest, because there is pressure and an audience. Here is how to run one, even with just one phone.',
    sections: [
      {
        heading: 'Set the rotation',
        body: 'Decide the order and how many bars each person gets. Four or eight bars is standard. Keep turns short so the energy stays high and nobody overthinks.',
      },
      {
        heading: 'Pass the phone, keep the beat',
        body: 'With a pass-the-phone setup, one device runs the beat and the timer while players rotate. The timer ring shows whose turn it is so handoffs stay clean.',
      },
      {
        heading: 'Feed off each other',
        body: 'The best cyphers build on the last person’s bars: grab a word they used and flip it. Listening is half of cyphering.',
      },
    ],
    faqs: [
      {
        question: 'How many people do you need for a cypher?',
        answer:
          'Two is enough; three or four keeps the energy rolling. Cypher mode supports up to four players on one phone.',
      },
      {
        question: 'How long should each turn be?',
        answer:
          'Four to eight bars. Short turns keep momentum and give everyone more rounds.',
      },
      {
        question: 'Can I practice cyphering alone?',
        answer:
          'Run solo drills first, then bring them to a cypher. The skills transfer; the pressure is the new part.',
      },
    ],
    related: [
      'freestyle-rap-exercises-and-drills',
      'freestyle-rap-practice-for-beginners',
    ],
    updated: '2026-06-29',
  },
  {
    slug: 'best-bpm-for-freestyle-practice',
    lang: 'en',
    cluster: 'bpm',
    category: 'beats',
    title: 'The Best BPM for Freestyle Practice (and Why)',
    h1: 'The best BPM for freestyle practice',
    description:
      'What tempo should you freestyle over? A practical guide to BPM for beginners and beyond: when to go slow, when to speed up, and how to use beats to level up.',
    keywords: [
      'best bpm for freestyle',
      'freestyle beat tempo',
      'rap practice bpm',
      'what bpm to rap',
    ],
    intro:
      'Tempo changes everything about how a freestyle feels. Pick the wrong BPM and you will either rush or drag. Here is how to choose a tempo that matches your level.',
    sections: [
      {
        heading: 'Start at 80 to 90 BPM',
        body: 'Slower tempos give your brain time to find words and stay on beat. Most boom-bap sits here, which is why it is the classic freestyle training ground.',
      },
      {
        heading: 'Speed up to stress-test your flow',
        body: 'Once 85 BPM feels easy, jump to 100 to 120 BPM to pressure your timing. Trap and drill tempos force tighter, more economical bars.',
      },
      {
        heading: 'Match BPM to the skill you are drilling',
        body: 'Working on storytelling? Stay slow. Working on speed and breath control? Go faster. Tag your beats by BPM so you can train on purpose.',
      },
    ],
    faqs: [
      {
        question: 'What BPM is best for beginners?',
        answer:
          '80 to 90 BPM. It is slow enough to think and stay on beat while you build the habit.',
      },
      {
        question: 'Is faster harder?',
        answer:
          'Usually yes. Faster tempos leave less room to recover, so they expose timing and breath issues. Great for stress-testing.',
      },
      {
        question: 'How do I know a beat’s BPM?',
        answer:
          'Many practice beats are tagged with BPM. In the beat vault, tracks show tempo so you can pick on purpose.',
      },
    ],
    related: [
      'how-to-freestyle-on-beat',
      'freestyle-rap-exercises-and-drills',
    ],
    updated: '2026-06-29',
  },
]

export function getProgrammaticSlugs(): string[] {
  return PROGRAMMATIC_PAGES.map((page) => page.slug)
}

export function getProgrammaticPage(
  slug: string
): ProgrammaticPage | undefined {
  return PROGRAMMATIC_PAGES.find((page) => page.slug === slug)
}

// Sibling pages in the same translation cluster (for hreflang + language switch).
export function getProgrammaticTranslations(
  page: ProgrammaticPage
): ProgrammaticPage[] {
  return PROGRAMMATIC_PAGES.filter(
    (candidate) =>
      candidate.cluster === page.cluster && candidate.slug !== page.slug
  )
}

// Internal links: explicit `related` first, topped up with same-language pages.
export function getProgrammaticRelated(
  page: ProgrammaticPage,
  limit = 3
): ProgrammaticPage[] {
  const explicit = page.related
    .map((slug) => getProgrammaticPage(slug))
    .filter((candidate): candidate is ProgrammaticPage => Boolean(candidate))

  if (explicit.length >= limit) return explicit.slice(0, limit)

  const fillers = PROGRAMMATIC_PAGES.filter(
    (candidate) =>
      candidate.lang === page.lang &&
      candidate.slug !== page.slug &&
      !explicit.some((item) => item.slug === candidate.slug)
  )

  return [...explicit, ...fillers].slice(0, limit)
}
