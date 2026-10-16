import React, { useState } from 'react';
import { CHEATSHEET_DATA, FormulaCard } from '../data/cheatsheetData';
import { MathView, TextWithMath } from './MathView';
import { BookMarked, Search, Filter, ExternalLink } from 'lucide-react';

interface CheatsheetViewProps {
  onSelectQuestion: (questionId: number) => void;
}

export const CheatsheetView: React.FC<CheatsheetViewProps> = ({ onSelectQuestion }) => {
  const [filterCat, setFilterCat] = useState<'All' | 'Calculus' | 'Linear Algebra'>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredFormulas = CHEATSHEET_DATA.filter((item) => {
    const matchCat = filterCat === 'All' || item.category === filterCat;
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* HEADER & FILTERS */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5 border-b border-slate-700/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Sổ Tay Công Thức Trọng Tâm MAE101</h2>
              <p className="text-xs sm:text-sm text-slate-400">Toàn bộ công thức, định lý then chốt và ghi chú tránh bẫy thi cử</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-700/60 text-xs sm:text-sm">
            {(['All', 'Calculus', 'Linear Algebra'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterCat === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'All' ? 'Tất cả' : cat === 'Calculus' ? 'Vi tích phân' : 'Đại số tuyến tính'}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm công thức (ví dụ: Newton, Đạo hàm ẩn, Hình thang, Định thức, Khoảng cách...)"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* FORMULAS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFormulas.map((card, idx) => (
          <div
            key={idx}
            className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3.5 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs px-2.5 py-0.5 rounded-md font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {card.category === 'Calculus' ? 'Vi tích phân' : 'Đại số tuyến tính'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Áp dụng: {card.relatedQuestions.map(q => `Câu ${q}`).join(', ')}
                </span>
              </div>

              <h3 className="font-bold text-white text-base leading-snug">
                {card.title}
              </h3>

              <div className="my-3 p-3 rounded-xl bg-slate-900/90 border border-slate-700/60 text-center">
                <MathView math={card.math} block={true} />
              </div>

              <div className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                <TextWithMath text={card.notes} />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs">
              <span className="text-slate-400">Xem câu hỏi tương ứng:</span>
              <div className="flex gap-1.5">
                {card.relatedQuestions.map((qId) => (
                  <button
                    key={qId}
                    onClick={() => onSelectQuestion(qId)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 font-semibold transition-all inline-flex items-center gap-1"
                  >
                    Câu {qId} <ExternalLink className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
