import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle2, Lock, Sparkles, ArrowRight, RotateCcw, Award, Zap, Coins, Check, HelpCircle } from 'lucide-react';
import BuzzyMascot from '../components/BuzzyMascot';
import PizzaShareWidget from '../components/PizzaShareWidget';

const DEFAULT_TRACKS = [
  {
    id: 'track-1',
    title: 'What is a Company?',
    description: 'Discover how everyday brands like Apple, Tata, and Nike make products and earn money.',
    targetAge: '8-12',
    icon: '🏢',
    color: '#2563EB',
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Meet Bully, Barry & The Candy Shop',
        summary: 'How a simple idea turns into a real company.',
        duration: '3 min',
        points: 50,
        content: [
          { type: 'text', value: 'Imagine your friend Mia wants to sell the crispiest homemade cookies in school. She needs flour, sugar, and an oven to start baking.' },
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
          { type: 'highlight', value: 'Revenue (Total Sales) - Costs = Profit 🎉' },
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
    icon: '🍕',
    color: '#F59E0B',
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'The Great Pizza Slice Secret',
        summary: 'A share is your personal slice of a company.',
        duration: '4 min',
        points: 100,
        interactive: 'PIZZA_SLICE',
        content: [
          { type: 'text', value: 'When a company grows big, it cuts its ownership into millions of tiny pieces called Shares.' },
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
    icon: '📈',
    color: '#10B981',
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
      }
    ]
  }
];

export default function JuniorLearn({ account, onUpdateAccount }) {
  const [tracks, setTracks] = useState(DEFAULT_TRACKS);
  const [activeLesson, setActiveLesson] = useState(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  useEffect(() => {
    fetch('/api/junior/tracks')
      .then(res => res.json())
      .then(data => {
        if (data.tracks && data.tracks.length > 0) setTracks(data.tracks);
      })
      .catch(err => console.error('Error fetching tracks:', err));
  }, []);

  const handleOpenLesson = (lesson) => {
    setActiveLesson(lesson);
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
    setLessonCompleted(account?.completedLessons?.includes(lesson.id) || false);
  };

  const handleCompleteLesson = async () => {
    if (!account || !activeLesson) return;
    try {
      const res = await fetch(`/api/junior/accounts/${account.id}/lessons/${activeLesson.id}/complete`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setLessonCompleted(true);
        if (onUpdateAccount && data.account) {
          onUpdateAccount(data.account);
        }
      } else {
        setLessonCompleted(true);
        if (onUpdateAccount) {
          onUpdateAccount({
            ...account,
            totalPoints: (account.totalPoints || 350) + (activeLesson.points || 50),
            completedLessons: [...(account.completedLessons || []), activeLesson.id]
          });
        }
      }
    } catch {
      setLessonCompleted(true);
      if (onUpdateAccount) {
        onUpdateAccount({
          ...account,
          totalPoints: (account.totalPoints || 350) + (activeLesson.points || 50),
          completedLessons: [...(account.completedLessons || []), activeLesson.id]
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 md:p-8 text-white shadow-[0_20px_50px_rgba(37,99,235,0.22)] border-2 border-white/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-blue-100 border border-white/20">
              Interactive Financial Academy
            </span>
            <h1 className="text-2xl md:text-3xl font-black junior-font-heading mt-2">
              Learning Tracks & Missions 📚
            </h1>
            <p className="text-blue-100 text-xs md:text-sm font-medium mt-1">
              Complete fun missions, test your smarts, and earn shiny investor badges!
            </p>
          </div>
          <BuzzyMascot size={74} mood="happy" />
        </div>
      </div>

      {/* Main Track List or Active Lesson Modal */}
      {!activeLesson ? (
        <div className="space-y-6">
          {tracks.map((track, trackIndex) => {
            const trackCompletedCount = track.lessons.filter(l => account?.completedLessons?.includes(l.id)).length;
            const isTrackFinished = trackCompletedCount === track.lessons.length;

            return (
              <div key={track.id} className="jr-glass-card p-6 md:p-8 bg-white border-2 border-slate-100 rounded-[32px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-md"
                      style={{ backgroundColor: track.color || '#2563EB' }}
                    >
                      {track.icon || trackIndex + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400">Track {trackIndex + 1}</span>
                        {isTrackFinished && (
                          <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Completed ✓
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg md:text-xl font-black text-slate-900 junior-font-heading mt-0.5">
                        {track.title}
                      </h2>
                    </div>
                  </div>

                  <span className="text-xs font-black text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-2xl self-start sm:self-auto">
                    {trackCompletedCount}/{track.lessons.length} Lessons Finished
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {track.lessons.map((lesson) => {
                    const isDone = account?.completedLessons?.includes(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleOpenLesson(lesson)}
                        className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 shadow-xs ${
                          isDone
                            ? 'border-emerald-200/90 bg-emerald-50/40 hover:bg-emerald-50/80 hover:border-emerald-300'
                            : 'border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isDone ? (
                                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                              ) : (
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                              )}
                              <span className="font-black text-sm text-slate-900">{lesson.title}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{lesson.summary}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-slate-400">⏱️ {lesson.duration || '3 min'}</span>
                          <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl shadow-xs">
                            <Sparkles size={13} className="text-amber-500" /> +{lesson.points} XP
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Active Lesson Player */
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="jr-glass-card p-6 md:p-8 bg-white border-2 border-blue-200 rounded-[32px]">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Interactive Learning Mission
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 junior-font-heading mt-2">
                {activeLesson.title}
              </h2>
            </div>
            <button
              onClick={() => setActiveLesson(null)}
              className="text-xs font-black text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-2xl transition-colors"
            >
              ← Back to Tracks
            </button>
          </div>

          {/* Lesson Content Blocks */}
          <div className="space-y-4 text-slate-800 text-sm leading-relaxed mb-6">
            {activeLesson.content?.map((block, idx) => {
              if (block.type === 'text') {
                return (
                  <p key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium">
                    {block.value}
                  </p>
                );
              }
              if (block.type === 'highlight') {
                return (
                  <div key={idx} className="bg-gradient-to-r from-amber-50 to-amber-100/50 border-l-4 border-amber-500 p-4 rounded-r-2xl text-amber-950 font-black text-sm">
                    💡 {block.value}
                  </div>
                );
              }
              if (block.type === 'interactive_prompt') {
                return (
                  <div key={idx} className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-blue-950 font-bold text-xs">
                    🎯 {block.value}
                  </div>
                );
              }
              if (block.type === 'quiz') {
                return (
                  <div key={idx} className="bg-indigo-50/60 border-2 border-indigo-200 rounded-3xl p-5 md:p-6 my-4">
                    <div className="flex items-center gap-2 mb-3">
                      <HelpCircle size={18} className="text-indigo-600" />
                      <h4 className="font-black text-sm text-indigo-950 junior-font-heading">
                        Check Your Understanding:
                      </h4>
                    </div>
                    <p className="font-black text-sm text-slate-900 mb-4">{block.question}</p>

                    <div className="space-y-2.5">
                      {block.options.map((opt, optIdx) => {
                        const isSelected = selectedQuizAnswer === optIdx;
                        const isCorrect = optIdx === block.correctIndex;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              setSelectedQuizAnswer(optIdx);
                              setQuizSubmitted(true);
                              if (isCorrect) handleCompleteLesson();
                            }}
                            className={`w-full text-left p-3.5 rounded-2xl text-xs font-black transition-all border ${
                              quizSubmitted
                                ? isCorrect
                                  ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                                  : isSelected
                                  ? 'bg-rose-100 border-rose-300 text-rose-950'
                                  : 'bg-white border-slate-100 text-slate-400 opacity-60'
                                : 'bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:bg-blue-50/50'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            })}

            {/* Interactive Widget Embed */}
            {activeLesson.interactive === 'PIZZA_SLICE' && (
              <PizzaShareWidget onComplete={handleCompleteLesson} />
            )}
          </div>

          {/* Completion Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <div>
              {lessonCompleted ? (
                <div className="flex items-center gap-2 text-emerald-800 font-black text-xs">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  Mission Finished! +{activeLesson.points} XP Points Added to your profile!
                </div>
              ) : (
                <div className="text-xs text-slate-400 font-bold">
                  Complete the activity & quiz above to claim points!
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveLesson(null)}
              className="junior-btn-primary text-xs py-3 px-6 w-full sm:w-auto"
            >
              Continue Next Mission →
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
