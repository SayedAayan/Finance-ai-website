// StockBuzz Junior Engine - Paper Trading, Append-Only Ledger, Curriculum, and Safety Controls

export const DEFAULT_TRACKS = [
  {
    id: 'track-1',
    title: 'What is a Company?',
    description: 'Discover how everyday brands like Apple, Tata, and Nike make products and earn money.',
    targetAge: '8-12',
    icon: 'Building2',
    color: '#2F6FED',
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Meet Buzzy & The Candy Shop',
        summary: 'How a simple idea turns into a real company.',
        duration: '3 min',
        points: 50,
        content: [
          { type: 'text', value: 'Imagine your friend Mia wants to sell the crispiest homemade cookies in school. She needs flour, sugar, and an oven.' },
          { type: 'highlight', value: 'A Company is simply a team of people working together to create something helpful or fun for others!' },
          { type: 'quiz', question: 'What does a company do?', options: ['Makes products or services people love', 'Only plays video games', 'Hides cookies in a tree'], correctIndex: 0 }
        ]
      },
      {
        id: 'lesson-1-2',
        title: 'Where Does the Money Go?',
        summary: 'Understanding Revenue, Costs, and Profits.',
        duration: '4 min',
        points: 75,
        content: [
          { type: 'text', value: 'When customers buy cookies for ₹100, and it cost ₹60 to bake them, the remaining ₹40 is Profit!' },
          { type: 'highlight', value: 'Revenue - Costs = Profit 🎉' },
          { type: 'quiz', question: 'If you sell lemonade for ₹50 and lemons cost ₹20, what is your profit?', options: ['₹20', '₹30', '₹70'], correctIndex: 1 }
        ]
      }
    ]
  },
  {
    id: 'track-2',
    title: 'What is a Share?',
    description: 'Learn how companies divide ownership like slices of a giant pizza.',
    targetAge: '8-12',
    icon: 'PieChart',
    color: '#FFB020',
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'The Great Pizza Slice Secret',
        summary: 'A share is your personal slice of a company.',
        duration: '4 min',
        points: 100,
        interactive: 'PIZZA_SLICE',
        content: [
          { type: 'text', value: 'When a company grows big, it cuts its ownership into millions of tiny pieces called **Shares**.' },
          { type: 'highlight', value: 'When you own 1 share of a company, you are a co-owner of that company!' },
          { type: 'interactive_prompt', value: 'Slice the pizza below to see how owning 1, 2, or 5 slices makes you a co-owner!' },
          { type: 'quiz', question: 'When you buy 1 share of a company, you are a:', options: ['Customer only', 'Part-owner (Shareholder)', 'Security guard'], correctIndex: 1 }
        ]
      },
      {
        id: 'lesson-2-2',
        title: 'Why Do Share Prices Change?',
        summary: 'Supply, demand, and how popularity moves prices.',
        duration: '5 min',
        points: 100,
        content: [
          { type: 'text', value: 'If everyone suddenly wants Mia’s cookies because they are super tasty, more people want to buy her shares. The price goes UP!' },
          { type: 'highlight', value: 'More buyers than sellers = Price rises 📈. More sellers than buyers = Price dips 📉.' },
          { type: 'quiz', question: 'What happens to a stock price when many people want to buy it?', options: ['Price goes up', 'Price vanishes', 'Price turns green forever'], correctIndex: 0 }
        ]
      }
    ]
  },
  {
    id: 'track-3',
    title: 'First Steps in Paper Trading',
    description: 'Put on your Junior Investor cape and build your very first virtual portfolio.',
    targetAge: '8-17',
    icon: 'TrendingUp',
    color: '#12B76A',
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Rule #1: The Golden Egg Rule',
        summary: 'Never put all your eggs in one basket (Diversification).',
        duration: '4 min',
        points: 100,
        content: [
          { type: 'text', value: 'If you put all your virtual money into just 1 company and it has a bad day, your whole portfolio hurts. Smart investors spread their money across multiple great companies!' },
          { type: 'highlight', value: 'StockBuzz Guardian Rule: You cannot invest more than 25% of your money into a single company.' },
          { type: 'quiz', question: 'Why is diversification helpful?', options: ['It protects your money from big single drops', 'It makes your computer run faster', 'It guarantees 1000% profit in 1 day'], correctIndex: 0 }
        ]
      },
      {
        id: 'lesson-3-2',
        title: 'Your First Mission: Buy 1 Favorite Brand',
        summary: 'Pick a company you use and explain why you believe in it.',
        duration: '5 min',
        points: 150,
        missionId: 'first-trade',
        content: [
          { type: 'text', value: 'You have ₹1,00,000 in virtual funds! Head over to the Trade tab, pick a company you know (like Tata, Reliance, or Apple), and write your one-sentence reason.' }
        ]
      }
    ]
  }
];

export const JUNIOR_COMPANIES = [
  { symbol: 'TCS.NS', name: 'Tata Consultancy (TCS)', ticker: 'TCS', price: 3950, change: '+1.4%', market: 'IN', currency: '₹', category: 'Technology & Gaming', emoji: '💻', description: 'Builds smart computer software for banks and companies around the world.' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', ticker: 'RELIANCE', price: 2780, change: '+0.8%', market: 'IN', currency: '₹', category: 'Energy & Telecom', emoji: '📱', description: 'Connects millions of families with Jio mobile internet and stores.' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', ticker: 'HDFCBANK', price: 1680, change: '-0.3%', market: 'IN', currency: '₹', category: 'Piggy Bank & Finance', emoji: '🏦', description: 'Helps people save money, buy houses, and pay safely.' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', ticker: 'TATAMOTORS', price: 920, change: '+2.1%', market: 'IN', currency: '₹', category: 'Electric Cars & Trucks', emoji: '🚗', description: 'Creates cool electric cars and Jaguar Land Rover luxury vehicles.' },
  { symbol: 'INFY.NS', name: 'Infosys', ticker: 'INFY', price: 1820, change: '+1.1%', market: 'IN', currency: '₹', category: 'Tech & AI', emoji: '🤖', description: 'Helps businesses with artificial intelligence and digital apps.' },
  { symbol: 'AAPL', name: 'Apple Inc.', ticker: 'AAPL', price: 228, change: '+1.2%', market: 'US', currency: '$', category: 'Gadgets & Phones', emoji: '🍎', description: 'Makes iPhones, iPads, and MacBooks loved by millions globally.' },
  { symbol: 'MSFT', name: 'Microsoft', ticker: 'MSFT', price: 445, change: '+0.9%', market: 'US', currency: '$', category: 'Computers & Xbox', emoji: '🎮', description: 'Creators of Windows, Minecraft, and Xbox gaming consoles.' },
  { symbol: 'GOOGL', name: 'Google (Alphabet)', ticker: 'GOOGL', price: 178, change: '+1.8%', market: 'US', currency: '$', category: 'Search & YouTube', emoji: '🔍', description: 'Powers YouTube, Google Search, and Android smartphones.' },
  { symbol: 'DIS', name: 'The Walt Disney Co.', ticker: 'DIS', price: 112, change: '+0.5%', market: 'US', currency: '$', category: 'Movies & Theme Parks', emoji: '🏰', description: 'Makes superhero movies, Mickey Mouse, and magical Disney theme parks.' }
];

/**
 * Initializes default junior account state in database
 */
export function createDefaultJuniorAccount(nickname = 'Junior Champ', age = 10, mode = 'explorer', market = 'IN', avatar = 'rocket') {
  const isUS = market === 'US';
  const initialCash = isUS ? 1000 : 100000;
  const currencySymbol = isUS ? '$' : '₹';

  return {
    id: 'jr_' + Math.random().toString(36).substring(2, 9),
    nickname,
    avatar: avatar || 'rocket',
    age: parseInt(age, 10) || 10,
    mode: age >= 13 ? 'trader' : (mode || 'explorer'),
    market: isUS ? 'US' : 'IN',
    currency: isUS ? 'USD' : 'INR',
    currencySymbol,
    createdAt: new Date().toISOString(),
    streakDays: 1,
    totalPoints: 50,
    parentEmail: 'parent@stockbuzz.kids',
    parentConsentVerified: true,
    portfolio: {
      cash: initialCash,
      startingCash: initialCash,
      investedValue: 0,
      holdings: [] // { symbol, name, shares, avgPrice, totalCost, currentPrice }
    },
    ledger: [
      {
        id: 'tx_init',
        timestamp: new Date().toISOString(),
        type: 'DEPOSIT',
        amount: initialCash,
        currency: currencySymbol,
        note: 'Welcome Starter Funds from Buzzy 🎉'
      }
    ],
    completedLessons: ['lesson-1-1'],
    badges: [
      { id: 'b_welcome', name: 'Junior Pioneer', icon: 'Sparkles', unlockedAt: new Date().toISOString(), description: 'Joined StockBuzz Junior!' }
    ],
    parentControls: {
      dailyTradeLimit: 5,
      tradesToday: 0,
      requireParentNoteApproval: false,
      maxSingleStockPercent: 25 // Enforced diversification cap
    }
  };
}
