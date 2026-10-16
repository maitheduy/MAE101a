import React, { useState, useEffect } from 'react';
import { QuestionItem, QUESTIONS_DATA } from '../data/questionsData';
import { QuestionCard } from './QuestionCard';
import { TextWithMath } from './MathView';
import { 
  Trophy, 
  Clock, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Filter,
  Award
} from 'lucide-react';

interface ExamModeProps {
  onBackToStudy: () => void;
  bookmarks: number[];
  onToggleBookmark: (id: number) => void;
  questions?: QuestionItem[];
}

export const ExamMode: React.FC<ExamModeProps> = ({
  onBackToStudy,
  bookmarks,
  onToggleBookmark,
  questions = QUESTIONS_DATA
}) => {
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [examFinished, setExamFinished] = useState<boolean>(false);
  const [questionCount, setQuestionCount] = useState<number>(30);
  const [timerMinutes, setTimerMinutes] = useState<number>(45);
  const [timeLeft, setTimeLeft] = useState<number>(45 * 60);
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'correct'>('all');

  // Start Exam
  const startExam = (count: number, minutes: number) => {
    let pool = [...questions];
    if (count < pool.length) {
      // Pick random questions
      pool = pool.sort(() => 0.5 - Math.random()).slice(0, count);
    }
    setSelectedQuestions(pool);
    setUserAnswers({});
    setMarkedForReview(new Set());
    setCurrentIndex(0);
    setTimeLeft(minutes * 60);
    setExamStarted(true);
    setExamFinished(false);
  };

  // Timer effect
  useEffect(() => {
    if (!examStarted || examFinished || timerMinutes === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setExamFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examFinished, timerMinutes]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qId: number, optId: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optId
    }));
  };

  const toggleMarkReview = (qId: number) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const currentQ = selectedQuestions[currentIndex];

  // Calculate score
  const score = selectedQuestions.reduce((acc, q) => {
    return userAnswers[q.id] === q.correctAnswer ? acc + 1 : acc;
  }, 0);

  const percentage = selectedQuestions.length > 0 ? Math.round((score / selectedQuestions.length) * 100) : 0;

  if (!examStarted) {
    return (
      <div className="max-w-2xl mx-auto bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Chế Độ Thi Thử Trắc Nghiệm MAE101</h2>
          <p className="text-sm text-slate-400">
            Làm bài trắc nghiệm tính giờ với các câu hỏi từ đề ôn tập thực tế, có chấm điểm và xem lại lời giải chi tiết.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Số lượng câu hỏi:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[10, 20, 30].map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all ${
                    questionCount === count
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {count} câu
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Thời gian làm bài:
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { min: 15, label: '15 phút' },
                { min: 30, label: '30 phút' },
                { min: 45, label: '45 phút' },
                { min: 0, label: 'Không giới hạn' }
              ].map((item) => (
                <button
                  key={item.min}
                  onClick={() => setTimerMinutes(item.min)}
                  className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                    timerMinutes === item.min
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => startExam(questionCount, timerMinutes)}
            className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" /> Bắt đầu làm bài thi
          </button>
          <button
            onClick={onBackToStudy}
            className="py-3.5 px-6 bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-xl transition-all"
          >
            Quay lại ôn tập
          </button>
        </div>
      </div>
    );
  }

  // EXAM RESULTS SCREEN
  if (examFinished) {
    const filteredQuestions = selectedQuestions.filter((q) => {
      const isRight = userAnswers[q.id] === q.correctAnswer;
      if (reviewFilter === 'wrong') return !isRight;
      if (reviewFilter === 'correct') return isRight;
      return true;
    });

    return (
      <div className="space-y-6">
        {/* SCORE SUMMARY CARD */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm text-center space-y-5">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Kết Quả Bài Thi</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {percentage >= 80 ? 'Xuất sắc! Bạn nắm rất vững kiến thức MAE101!' : percentage >= 50 ? 'Khá tốt! Hãy ôn lại các câu chưa làm đúng bên dưới.' : 'Cần ôn tập thêm! Xem kỹ lời giải chi tiết bên dưới.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700">
              <span className="text-xs text-slate-400 block">Số câu đúng</span>
              <span className="text-2xl font-bold text-emerald-400">{score}/{selectedQuestions.length}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700">
              <span className="text-xs text-slate-400 block">Tỷ lệ chính xác</span>
              <span className="text-2xl font-bold text-indigo-400">{percentage}%</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700">
              <span className="text-xs text-slate-400 block">Số câu sai</span>
              <span className="text-2xl font-bold text-rose-400">{selectedQuestions.length - score}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700">
              <span className="text-xs text-slate-400 block">Đã làm</span>
              <span className="text-2xl font-bold text-slate-200">{Object.keys(userAnswers).length}/{selectedQuestions.length}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => startExam(questionCount, timerMinutes)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" /> Làm lại đề này
            </button>
            <button
              onClick={() => setExamStarted(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all"
            >
              Cấu hình đề thi khác
            </button>
            <button
              onClick={onBackToStudy}
              className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-600 hover:border-slate-500 text-slate-300 font-semibold text-sm transition-all"
            >
              Về chế độ Tra Cứu
            </button>
          </div>
        </div>

        {/* REVIEW FILTER */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-400" />
            Xem lại bài thi & Hướng dẫn giải chi tiết
          </h3>

          <div className="flex items-center gap-2 p-1 bg-slate-800/90 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                reviewFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả ({selectedQuestions.length})
            </button>
            <button
              onClick={() => setReviewFilter('wrong')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                reviewFilter === 'wrong' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Câu sai ({selectedQuestions.length - score})
            </button>
            <button
              onClick={() => setReviewFilter('correct')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                reviewFilter === 'correct' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Câu đúng ({score})
            </button>
          </div>
        </div>

        {/* QUESTIONS DETAILED LIST */}
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const chosen = userAnswers[q.id];
            const isRight = chosen === q.correctAnswer;
            return (
              <div key={q.id} className="relative">
                <div className="absolute top-4 right-14 z-10">
                  {chosen ? (
                    isRight ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                        <CheckCircle className="w-3.5 h-3.5" /> Bạn chọn: {chosen} (Đúng)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30">
                        <XCircle className="w-3.5 h-3.5" /> Bạn chọn: {chosen} (Sai)
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                      <AlertCircle className="w-3.5 h-3.5" /> Chưa trả lời
                    </span>
                  )}
                </div>
                <QuestionCard
                  question={q}
                  isBookmarked={bookmarks.includes(q.id)}
                  onToggleBookmark={onToggleBookmark}
                  defaultExpanded={true}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ACTIVE EXAM QUESTION INTERFACE
  return (
    <div className="space-y-6">
      {/* EXAM STATUS BAR */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white">
            Câu {currentIndex + 1} / {selectedQuestions.length}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
            Đã làm: {Object.keys(userAnswers).length}/{selectedQuestions.length}
          </span>
        </div>

        {timerMinutes > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200">
            <Clock className={`w-4 h-4 ${timeLeft < 300 ? 'text-rose-400 animate-pulse' : 'text-indigo-400'}`} />
            <span className={`font-mono text-sm font-bold ${timeLeft < 300 ? 'text-rose-400' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}

        <button
          onClick={() => {
            if (window.confirm('Bạn có chắc muốn nộp bài thi sớm để xem điểm và lời giải chi tiết?')) {
              setExamFinished(true);
            }
          }}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20"
        >
          Nộp bài thi
        </button>
      </div>

      {/* QUESTION NAVIGATOR GRID */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-wrap gap-1.5">
        {selectedQuestions.map((q, idx) => {
          const isAnswered = userAnswers[q.id] !== undefined;
          const isMarked = markedForReview.has(q.id);
          const isCurrent = idx === currentIndex;

          let btnClass = 'bg-slate-900/60 border-slate-700 text-slate-400';
          if (isCurrent) btnClass = 'bg-indigo-600 border-indigo-400 text-white ring-2 ring-indigo-400';
          else if (isMarked) btnClass = 'bg-amber-500/20 border-amber-500/50 text-amber-300';
          else if (isAnswered) btnClass = 'bg-emerald-600/30 border-emerald-500/40 text-emerald-300';

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${btnClass}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* QUESTION DISPLAY */}
      {currentQ && (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold text-sm">
                Câu {currentIndex + 1} (Gốc: Câu {currentQ.id})
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {currentQ.subtopic}
              </span>
            </div>

            <button
              onClick={() => toggleMarkReview(currentQ.id)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                markedForReview.has(currentQ.id)
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {markedForReview.has(currentQ.id) ? 'Đã đánh dấu xem lại' : 'Đánh dấu xem lại'}
            </button>
          </div>

          <div className="text-base text-slate-100 font-medium leading-relaxed">
            <TextWithMath text={currentQ.questionVi} />
          </div>

          <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 text-xs sm:text-sm text-slate-400 italic">
            <span className="font-semibold text-slate-300 not-italic mr-1.5 font-sans uppercase text-[11px]">
              Original:
            </span>
            <TextWithMath text={currentQ.questionEn} />
          </div>

          {/* OPTIONS SELECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.options.map((opt) => {
              const isSelected = userAnswers[currentQ.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-500 text-white ring-1 ring-indigo-500'
                      : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-900'
                  }`}
                >
                  <span
                    className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <div className="text-sm font-mono pt-0.5">
                    <TextWithMath text={opt.text} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* PREV / NEXT NAVIGATION */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/60">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className={`px-4 py-2 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                currentIndex === 0
                  ? 'opacity-40 cursor-not-allowed border-slate-700 text-slate-500'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Câu trước
            </button>

            {currentIndex < selectedQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(selectedQuestions.length - 1, prev + 1))}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all"
              >
                Câu tiếp theo <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setExamFinished(true)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
              >
                Hoàn thành & Nộp bài
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
