import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle2, Lock, Sparkles, ArrowRight, RotateCcw, Award } from 'lucide-react';
import BuzzyMascot from '../components/BuzzyMascot';
import PizzaShareWidget from '../components/PizzaShareWidget';

export default function JuniorLearn({ account, onUpdateAccount }) {
  const [tracks, setTracks] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  useEffect(() => {
    fetch('/api/junior/tracks')
      .then(res => res.json())
      .then(data => {
        if (data.tracks) setTracks(data.tracks);
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
      }
    } catch (err) {
      console.error('Error marking lesson complete:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            Junior Financial Academy
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 junior-font-heading mt-2">
            Learning Tracks & Missions 📚
          </h1>
          <p className="text-xs md:text-sm text-slate-600">
            Complete fun missions, test your smarts, and earn shiny investor badges!
          </p>
        </div>
        <BuzzyMascot size={64} mood="happy" />
      </div>

      {/* Main Track List or Active Lesson Modal */}
      {!activeLesson ? (
        <div className="space-y-6">
          {tracks.map((track, trackIndex) => (
            <div key={track.id} className="junior-card p-6 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm"
                  style={{ backgroundColor: track.color || '#2F6FED' }}
                >
                  {trackIndex + 1}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 junior-font-heading">
                    {track.title}
                  </h2>
                  <p className="text-xs text-slate-500">{track.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {track.lessons.map((lesson) => {
                  const isDone = account?.completedLessons?.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleOpenLesson(lesson)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isDone
                          ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                          : 'border-slate-200 bg-slate-50/70 hover:border-blue-400 hover:bg-blue-50/30'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {isDone ? (
                            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                          )}
                          <span className="font-bold text-sm text-slate-900">{lesson.title}</span>
                        </div>
                        <p className="text-xs text-slate-500">{lesson.summary}</p>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-white px-2.5 py-1 rounded-xl shadow-xs border border-slate-100 flex-shrink-0 ml-3">
                        <Sparkles size={13} /> +{lesson.points}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Active Lesson Player */
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="junior-card p-6 md:p-8 bg-white border-2 border-amber-200">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                Interactive Lesson
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 junior-font-heading mt-1">
                {activeLesson.title}
              </h2>
            </div>
            <button
              onClick={() => setActiveLesson(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-full"
            >
              ← Back to Tracks
            </button>
          </div>

          {/* Lesson Content Blocks */}
          <div className="space-y-4 text-slate-800 text-sm leading-relaxed mb-6">
            {activeLesson.content?.map((block, idx) => {
              if (block.type === 'text') {
                return (
                  <p key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {block.value}
                  </p>
                );
              }
              if (block.type === 'highlight') {
                return (
                  <div key={idx} className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl text-amber-950 font-bold text-sm">
                    💡 {block.value}
                  </div>
                );
              }
              if (block.type === 'interactive_prompt') {
                return (
                  <div key={idx} className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {block.value}
                  </div>
                );
              }
              if (block.type === 'quiz') {
                return (
                  <div key={idx} className="bg-blue-50/70 border-2 border-blue-200 rounded-2xl p-5 mt-4">
                    <span className="text-xs font-extrabold uppercase text-blue-800 tracking-wider">
                      🎯 Check Your Knowledge
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-1 mb-3">{block.question}</h3>

                    <div className="space-y-2">
                      {block.options.map((opt, optIdx) => {
                        const isChosen = selectedQuizAnswer === optIdx;
                        const isCorrect = optIdx === block.correctIndex;
                        let btnStyle = 'border-slate-200 bg-white hover:border-blue-300';
                        if (quizSubmitted) {
                          if (isCorrect) btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                          else if (isChosen) btnStyle = 'border-rose-500 bg-rose-50 text-rose-900';
                        } else if (isChosen) {
                          btnStyle = 'border-blue-600 bg-blue-50 font-bold text-blue-900';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => !quizSubmitted && setSelectedQuizAnswer(optIdx)}
                            className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isCorrect && <CheckCircle2 size={18} className="text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>

                    {!quizSubmitted && (
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        disabled={selectedQuizAnswer === null}
                        className="mt-4 junior-btn-primary text-xs py-2 px-4 disabled:opacity-50"
                      >
                        Submit Answer
                      </button>
                    )}
                  </div>
                );
              }
              return null;
            })}

            {/* If lesson has interactive Pizza Slice Widget */}
            {activeLesson.interactive === 'PIZZA_SLICE' && (
              <PizzaShareWidget onComplete={() => setLessonCompleted(true)} />
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {lessonCompleted ? (
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm">
                <CheckCircle2 size={20} className="text-emerald-600" />
                Lesson Completed! +{activeLesson.points} pts earned 🎉
              </div>
            ) : (
              <button
                onClick={handleCompleteLesson}
                className="junior-btn-gold text-sm font-extrabold flex items-center gap-2"
              >
                <Sparkles size={16} /> Complete & Claim Reward
              </button>
            )}

            <button
              onClick={() => setActiveLesson(null)}
              className="junior-btn-primary text-xs py-2.5 px-4"
            >
              Done
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
