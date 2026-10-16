import React, { useState } from 'react';
import { QuestionItem } from '../data/questionsData';
import { MathView, TextWithMath } from './MathView';
import { 
  CheckCircle, 
  XCircle, 
  Bookmark, 
  BookmarkCheck, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  BookOpen, 
  Zap, 
  HelpCircle,
  FileText
} from 'lucide-react';

interface QuestionCardProps {
  question: QuestionItem;
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
  defaultExpanded?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isBookmarked,
  onToggleBookmark,
  defaultExpanded = false
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState<boolean>(defaultExpanded);
  const [showFullSteps, setShowFullSteps] = useState<boolean>(defaultExpanded);
  const [showEnOriginal, setShowEnOriginal] = useState<boolean>(true);

  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === question.correctAnswer;

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setShowSolution(true);
  };

  const difficultyColors = {
    'Dễ': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'Trung bình': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'Khá': 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-lg hover:shadow-indigo-500/5 transition-all overflow-hidden backdrop-blur-sm">
      {/* CARD HEADER */}
      <div className="px-5 py-4 border-b border-slate-700/60 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-3 py-1 rounded-lg bg-indigo-600 font-extrabold text-white text-sm tracking-wide shadow-sm">
            Câu {question.id}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-700/80 text-slate-300 font-medium">
            Trang {question.page} (PDF)
          </span>
          <span className="text-xs px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
            {question.subtopic}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${difficultyColors[question.difficulty]}`}>
            {question.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleBookmark(question.id)}
            title={isBookmarked ? 'Bỏ lưu câu hỏi' : 'Lưu câu hỏi để ôn lại'}
            className={`p-2 rounded-xl transition-colors border ${
              isBookmarked
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* QUESTION BODY */}
      <div className="p-5 space-y-4">
        {/* Vietnamese Translation (Main) */}
        <div className="text-base text-slate-100 font-medium leading-relaxed">
          <TextWithMath text={question.questionVi} />
        </div>

        {/* English Original */}
        {showEnOriginal && (
          <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 text-xs sm:text-sm text-slate-400 font-serif italic">
            <span className="font-semibold text-slate-300 not-italic mr-1.5 font-sans text-xs uppercase tracking-wide">
              Đề gốc tiếng Anh:
            </span>
            <TextWithMath text={question.questionEn} />
          </div>
        )}

        {/* OPTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {question.options.map((opt) => {
            const isThisSelected = selectedOption === opt.id;
            const isThisCorrect = opt.id === question.correctAnswer;
            
            let btnStyle = 'bg-slate-900/70 border-slate-700/80 text-slate-200 hover:border-slate-500 hover:bg-slate-900';
            
            if (showSolution) {
              if (isThisCorrect) {
                btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50';
              } else if (isThisSelected && !isThisCorrect) {
                btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-200 ring-1 ring-rose-500/50';
              }
            } else if (isThisSelected) {
              btnStyle = 'bg-indigo-950/80 border-indigo-500 text-indigo-100';
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${btnStyle}`}
              >
                <span
                  className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                    showSolution && isThisCorrect
                      ? 'bg-emerald-500 text-slate-950'
                      : showSolution && isThisSelected && !isThisCorrect
                      ? 'bg-rose-500 text-white'
                      : isThisSelected
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-700/80 text-slate-300'
                  }`}
                >
                  {opt.id}
                </span>
                <div className="pt-0.5 text-sm flex-1 font-mono">
                  <TextWithMath text={opt.text} />
                </div>
                {showSolution && isThisCorrect && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 self-center" />
                )}
                {showSolution && isThisSelected && !isThisCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 self-center" />
                )}
              </button>
            );
          })}
        </div>

        {/* INTERACTIVE CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {!showSolution ? (
              <button
                onClick={() => setShowSolution(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Zap className="w-4 h-4" /> Xem đáp án & Lời giải
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="text-slate-400">Đáp án đúng:</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 text-sm">
                  {question.correctAnswer}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFullSteps(!showFullSteps)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 border border-slate-600/50"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {showFullSteps ? 'Thu gọn các bước' : 'Hướng dẫn chi tiết'}
              {showFullSteps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* SHORT SOLUTION */}
        {showSolution && (
          <div className="mt-4 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Lời giải vắn tắt (Tóm tắt nhanh)</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              <TextWithMath text={question.shortSolution} />
            </div>
          </div>
        )}

        {/* DETAILED STEPS */}
        {showFullSteps && (
          <div className="mt-4 p-5 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider pb-2 border-b border-slate-800">
              <BookOpen className="w-4 h-4" />
              <span>Hướng dẫn chi tiết từng bước</span>
            </div>

            <div className="space-y-4">
              {question.detailedSteps.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="font-semibold text-xs text-indigo-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 inline-flex items-center justify-center text-[11px] font-bold">
                      {idx + 1}
                    </span>
                    {step.title}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300">
                    <TextWithMath text={step.content} />
                  </div>
                  {step.math && (
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-700/50">
                      <MathView math={step.math} block={true} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Formula & Tip */}
            {(question.tip || question.formula) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {question.formula && (
                  <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/30 space-y-1">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                      Công thức then chốt:
                    </span>
                    <MathView math={question.formula} block={true} />
                  </div>
                )}
                {question.tip && (
                  <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 space-y-1">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5" /> Mẹo & Lưu ý tránh bẫy:
                    </span>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      {question.tip}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
