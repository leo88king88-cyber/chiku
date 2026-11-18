import type { ReactNode } from 'react'
import { CompoundChart, CostBars, IndexVsActive, NavFormula, PoolDiagram, Riskometer, SipTable } from './visuals'

export interface Lesson {
  id: string
  title: string
  emoji: string
  minutes: number
  /** One line shown on the list. */
  blurb: string
  visual: () => ReactNode
  sections: { heading: string; body: string; callout?: boolean }[]
  takeaway: string
  check: { q: string; options: string[]; answer: number; why: string }
  tryIt: { label: string; to: string }
}

/** Plain-language lessons for the Learn tab. Numbers in examples are illustrations, not predictions. */
export const lessons: Lesson[] = [
  {
    id: 'what-is-a-mutual-fund',
    title: 'What is a mutual fund?',
    emoji: '🧺',
    minutes: 3,
    blurb: 'A shared basket of investments, run by a professional.',
    visual: PoolDiagram,
    sections: [
      { heading: 'Money from many people, invested together', body: 'A mutual fund collects money from lots of investors and invests it in things like company shares and bonds. A fund manager at a company called an AMC (asset management company) decides what to buy.' },
      { heading: 'You own units', body: "Your money buys units of the fund. If what the fund owns becomes worth more, each unit is worth more. If it falls, so does your unit's value." },
      { heading: 'Why people use them', body: 'You can start small, you get many companies in one go instead of betting on one, and someone professional is watching it. Mutual funds in India are regulated by SEBI.' },
      { heading: 'Not a guarantee', body: 'Mutual fund investments are subject to market risks. A fund can be worth less than you put in.', callout: true },
    ],
    takeaway: 'A mutual fund is a shared basket of investments run by a professional. You own a slice of it, and its value moves with the market.',
    check: {
      q: 'In an actively managed fund, who decides what the fund buys?',
      options: ['You do', 'The fund manager at the AMC', 'SEBI'],
      answer: 1,
      why: 'The fund manager chooses (an index fund just copies a list instead). SEBI makes the rules and keeps watch, but does not pick investments.',
    },
    tryIt: { label: 'See the funds in your practice list', to: '/c/invest/sim' },
  },
  {
    id: 'nav-and-units',
    title: 'NAV and units',
    emoji: '🔢',
    minutes: 3,
    blurb: 'How a fund is priced, and what you actually own.',
    visual: NavFormula,
    sections: [
      { heading: 'NAV is the price of one unit', body: "NAV stands for net asset value. It's worked out once a day, after the market closes: what the fund owns, minus its costs, divided by the number of units." },
      { heading: 'Your units stay the same', body: 'When you invest, you buy units at that day\'s NAV. ₹5,000 at a NAV of ₹100 gets you 50 units. You keep those 50 units. Only the NAV changes, and that is what makes your money grow or shrink.' },
      { heading: 'A low NAV is not "cheap"', body: "A fund with a NAV of ₹20 is not a better deal than one with a NAV of ₹200. What matters is how much the NAV changes in percent, not how big the number is." },
    ],
    takeaway: "NAV is the price of one unit. The units you already own don't change. The NAV is what moves.",
    check: {
      q: 'You invest ₹5,000 when the NAV is ₹100. How many units do you get?',
      options: ['5 units', '50 units', '500 units'],
      answer: 1,
      why: '₹5,000 ÷ ₹100 = 50 units.',
    },
    tryIt: { label: 'Open a fund and watch its price move', to: '/c/invest/fund/index' },
  },
  {
    id: 'sip',
    title: 'What is a SIP?',
    emoji: '🔁',
    minutes: 3,
    blurb: 'Investing a fixed amount every month.',
    visual: SipTable,
    sections: [
      { heading: 'A habit, not a bet', body: 'SIP stands for systematic investment plan. You invest a fixed amount on a fixed date every month, usually through an autopay. You can pause or stop anytime.' },
      { heading: 'Why it can help', body: 'When the NAV is low, your money buys more units. When it is high, it buys fewer. Over time that can smooth out the average price you pay. It is called rupee cost averaging.' },
      { heading: 'What a SIP does not do', body: 'A SIP does not guarantee a profit and does not protect you from falls. It just helps you stay regular without trying to guess the best day to invest.', callout: true },
    ],
    takeaway: 'A SIP turns investing into a monthly habit. It buys more units when prices are low and fewer when they are high, with no guarantee of profit.',
    check: {
      q: 'The NAV falls this month. Your ₹500 SIP buys...',
      options: ['More units than last month', 'Fewer units than last month', 'The same number of units'],
      answer: 0,
      why: 'A lower NAV means each unit costs less, so the same ₹500 buys more units.',
    },
    tryIt: { label: 'Ask for a real SIP when you are ready', to: '/c/invest/quiz' },
  },
  {
    id: 'index-vs-active',
    title: 'Index funds vs active funds',
    emoji: '⚖️',
    minutes: 3,
    blurb: 'Copy the market, or try to beat it?',
    visual: IndexVsActive,
    sections: [
      { heading: 'What an index is', body: 'An index is a list of companies that stands for the market. The Nifty 50 is made of 50 of the biggest listed companies in India. An index fund simply buys all of them.' },
      { heading: 'What active funds do', body: "An active fund's manager picks companies and tries to do better than the index. Some do, for a while. But they charge more, and over long periods many have not beaten a plain index fund after costs." },
      { heading: 'So which is better?', body: 'There is no sure answer. Index funds are simple and cheap, which is why many people start there. Whichever you choose, judge it over years, not weeks.' },
    ],
    takeaway: 'An index fund copies the market at low cost. An active fund tries to beat it at higher cost. Judge either one over years.',
    check: {
      q: 'What does an index fund do?',
      options: ['Picks the winners', 'Copies an index', 'Lends only to the government'],
      answer: 1,
      why: 'It holds the companies in an index, such as the Nifty 50, in the same proportions, so no one has to pick winners.',
    },
    tryIt: { label: 'Compare your picks with the index', to: '/c/invest/compare' },
  },
  {
    id: 'risk',
    title: 'Risk and the riskometer',
    emoji: '⚠️',
    minutes: 4,
    blurb: 'How bumpy the ride can be, and who it suits.',
    visual: Riskometer,
    sections: [
      { heading: 'Every fund shows a riskometer', body: 'SEBI makes each fund show a riskometer from Low to Very High, so you can see how bumpy the ride may be before you invest.' },
      { heading: 'Falls are normal', body: 'Funds that invest in shares can fall a lot. In early 2020 the Nifty 50 fell by more than a third in about two months, then climbed back over the following months. Nobody knows in advance when a fall will come.' },
      { heading: 'Time matters', body: "Money you will need within a year or two doesn't belong in share-based funds. A longer horizon, say five years or more, gives you more time to ride out falls, but there is no guarantee." },
      { heading: 'Know yourself', body: 'Your risk check answers help match you to a fund. If a big fall would make you panic and sell, pick a calmer fund.' },
    ],
    takeaway: 'Higher risk can mean bigger swings in both directions. Match the fund to how long you can wait, and how you would feel in a fall.',
    check: {
      q: 'You will need the money in 6 months. What fits best?',
      options: ['A Very High risk share fund', 'A lower-risk fund', 'Whatever is trending'],
      answer: 1,
      why: 'With a short time horizon you cannot wait out a fall, so a lower-risk fund is a better fit.',
    },
    tryIt: { label: 'Redo your risk check', to: '/c/invest/quiz' },
  },
  {
    id: 'costs',
    title: 'Costs: the expense ratio',
    emoji: '💸',
    minutes: 3,
    blurb: 'The small yearly fee that adds up.',
    visual: CostBars,
    sections: [
      { heading: 'What you pay', body: "Every fund charges a yearly fee called the expense ratio, shown as a percent of your money. It is taken out of the fund's value every day, so you never see a bill, but you feel it in your returns." },
      { heading: 'Small percentages add up', body: 'A fee of 1% on ₹10,000 is ₹100 a year, against ₹20 at 0.2%. Over many years, that gap can add up to a lot, as the illustration shows.' },
      { heading: 'Direct and regular plans', body: "Direct plans skip the distributor's commission, so they cost less than the regular plan of the same fund. Check which plan you are buying." },
    ],
    takeaway: 'Costs are certain, returns are not. Check the expense ratio before you invest, because small yearly fees add up over years.',
    check: {
      q: "A fund's expense ratio is 1%. You have ₹10,000 in it. About how much is the yearly fee?",
      options: ['₹10', '₹100', '₹1,000'],
      answer: 1,
      why: '1% of ₹10,000 is ₹100.',
    },
    tryIt: { label: 'Check the yearly cost of a fund', to: '/c/invest/fund/flexi' },
  },
  {
    id: 'time-and-compounding',
    title: 'Time and compounding',
    emoji: '⏳',
    minutes: 3,
    blurb: 'Why starting early matters.',
    visual: CompoundChart,
    sections: [
      { heading: 'Growth builds on growth', body: 'When your money earns something, that gain can start earning too. That is compounding. It works best over many years.' },
      { heading: 'An example', body: '₹500 a month for 10 years is ₹60,000 put in. At an assumed 10% a year it would be about ₹1,03,000. The extra, about ₹43,000, is growth. Real returns vary and can be negative.' },
      { heading: 'Why start early', body: 'The same ₹500 a month for just 5 years is ₹30,000 put in and about ₹39,000 at the same assumed rate. More time did far more than the extra money alone. These numbers are an illustration, not a prediction.', callout: true },
    ],
    takeaway: 'Time does a lot of the work in investing. Starting early, and staying steady, matters more than starting big.',
    check: {
      q: 'What helps compounding the most?',
      options: ['A lucky pick', 'Time', 'Checking your balance every day'],
      answer: 1,
      why: 'Compounding needs time. The longer gains stay invested, the more they can build on each other.',
    },
    tryIt: { label: 'Fast-forward your practice portfolio', to: '/c/invest/sim' },
  },
]

export const lessonById = (id: string) => lessons.find((l) => l.id === id)
