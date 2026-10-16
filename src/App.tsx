import React, { useState, useMemo, useEffect } from 'react';
import { QuestionItem } from './data/questionsData';
import { LOCAL_QUESTIONS_JSON } from './data/jsonLoader';
import { QuestionCard } from './components/QuestionCard';
import { CheatsheetView } from './components/CheatsheetView';
import { Calculators } from './components/Calculators';
import { ExamMode } from './components/ExamMode';
import { DataManagerModal } from './components/DataManagerModal';
import { 
  BookOpen, 
  Trophy, 
  BookMarked, 
  Calculator, 
  Search, 
  Bookmark, 
  Sparkles, 
  GraduationCap, 
  Eye, 
  EyeOff, 
  Printer,
  HelpCircle,
  HardDrive,
  Download
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'study' | 'exam' | 'cheatsheet' | 'calculators'>('study');
  
  // Dynamic questions state initialized from local questions.json or localStorage
  const [questions, setQuestions] = useState<QuestionItem[]>(() => {
    try {
      const saved = localStorage.getItem('mae101_custom_questions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return LOCAL_QUESTIONS_JSON;
  });

  const [isDataManagerOpen, setIsDataManagerOpen] = useState<boolean>(false);

  // Filters for study mode
  const [selectedTopic, setSelectedTopic] = useState<'All' | 'Calculus' | 'Linear' | 'Page1' | 'Page2' | 'Page3' | 'Bookmarks'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('mae101_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [expandAll, setExpandAll] = useState<boolean>(false);
  const [highlightQuestionId, setHighlightQuestionId] = useState<number | null>(null);

  // Save bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('mae101_bookmarks', JSON.stringify(bookmarks));
    } catch {
      // ignore
    }
  }, [bookmarks]);

  const toggleBookmark = (id: number) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Jump to specific question from cheatsheet or search
  const handleSelectQuestion = (qId: number) => {
    setActiveTab('study');
    setSelectedTopic('All');
    setSearchQuery('');
    setHighlightQuestionId(qId);
    
    setTimeout(() => {
      const el = document.getElementById(`question-${qId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Topic filter
      if (selectedTopic === 'Calculus' && q.topic !== 'Vi tích phân (Calculus)') return false;
      if (selectedTopic === 'Linear' && q.topic !== 'Đại số tuyến tính (Linear Algebra)') return false;
      if (selectedTopic === 'Page1' && q.page !== 1) return false;
      if (selectedTopic === 'Page2' && q.page !== 2) return false;
      if (selectedTopic === 'Page3' && q.page !== 3) return false;
      if (selectedTopic === 'Bookmarks' && !bookmarks.includes(q.id)) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchNumber = q.id.toString() === query || `câu ${q.id}`.includes(query);
        const matchEn = q.questionEn.toLowerCase().includes(query);
        const matchVi = q.questionVi.toLowerCase().includes(query);
        const matchSubtopic = q.subtopic.toLowerCase().includes(query);
        const matchSteps = q.shortSolution.toLowerCase().includes(query);
        return matchNumber || matchEn || matchVi || matchSubtopic || matchSteps;
      }

      return true;
    });
  }, [questions, selectedTopic, searchQuery, bookmarks]);

  const calculusCount = useMemo(() => questions.filter(q => q.topic === 'Vi tích phân (Calculus)').length, [questions]);
  const linearCount = useMemo(() => questions.filter(q => q.topic === 'Đại số tuyến tính (Linear Algebra)').length, [questions]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                    ÔN TẬP MAE101
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline-block">
                    Toán Cao Cấp
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden md:inline-block">
                    100% JSON • Không Dùng API
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Dữ liệu máy cục bộ • Lời giải vắn tắt & Chi tiết từng bước
                </p>
              </div>
            </div>

            {/* Navigation Tabs & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <nav className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs sm:text-sm">
                <button
                  onClick={() => setActiveTab('study')}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'study'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Bài Tập ({questions.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('exam')}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'exam'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Luyện Thi</span>
                  <span className="sm:hidden">Thi</span>
                </button>

                <button
                  onClick={() => setActiveTab('cheatsheet')}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'cheatsheet'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <BookMarked className="w-4 h-4" />
                  <span className="hidden md:inline">Sổ Tay Công Thức</span>
                  <span className="md:hidden">Công thức</span>
                </button>

                <button
                  onClick={() => setActiveTab('calculators')}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'calculators'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  <span className="hidden lg:inline">Máy Tính Nhanh</span>
                  <span className="lg:hidden">Tool</span>
                </button>
              </nav>

              {/* Data Manager Trigger */}
              <button
                onClick={() => setIsDataManagerOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-indigo-300 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
                title="Quản lý file JSON & Hướng dẫn chạy độc lập"
              >
                <HardDrive className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Dữ Liệu JSON</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <section className="bg-gradient-to-b from-indigo-950/40 via-slate-900/20 to-slate-950 border-b border-slate-800/80 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hoạt động độc lập bằng JSON nội bộ • 100% không cần API Key AI</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Giải Chi Tiết Toàn Bộ 30 Câu Hỏi Ôn Tập MAE101
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Tài liệu giải mã các câu hỏi trắc nghiệm Toán giải tích (Calculus) và Đại số tuyến tính (Linear Algebra). Bao gồm phương pháp giải vắn tắt, các bước tính chi tiết, mẹo làm bài trắc nghiệm và khả năng xuất/nhập JSON tùy chỉnh.
              </p>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Tổng số</span>
                <span className="text-lg font-black text-indigo-400">{questions.length} Câu</span>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Vi tích phân</span>
                <span className="text-lg font-black text-blue-400">{calculusCount} Câu</span>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Đại số TT</span>
                <span className="text-lg font-black text-purple-400">{linearCount} Câu</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TAB 1: STUDY MODE */}
        {activeTab === 'study' && (
          <div className="space-y-6">
            {/* FILTER & SEARCH TOOLBAR */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo số câu (VD: 13), khái niệm (Newton, tiệm cận, ma trận, hình thang...)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                {/* View Controls */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => setExpandAll(!expandAll)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    {expandAll ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{expandAll ? 'Thu gọn lời giải' : 'Mở rộng tất cả lời giải'}</span>
                  </button>

                  <button
                    onClick={() => setIsDataManagerOpen(true)}
                    className="px-3 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 text-xs font-semibold text-indigo-200 transition-all flex items-center gap-1.5"
                    title="Xuất file JSON hoặc nạp file JSON từ máy"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Xuất / Nhập JSON</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                    title="In tài liệu hoặc xuất PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">In / PDF</span>
                  </button>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 text-xs mr-1 font-medium shrink-0">Lọc theo:</span>
                {[
                  { key: 'All', label: `Tất cả (${questions.length} câu)` },
                  { key: 'Calculus', label: `Vi tích phân (${calculusCount} câu)` },
                  { key: 'Linear', label: `Đại số tuyến tính (${linearCount} câu)` },
                  { key: 'Page1', label: 'Trang 1 (PDF)' },
                  { key: 'Page2', label: 'Trang 2 (PDF)' },
                  { key: 'Page3', label: 'Trang 3 (PDF)' },
                  { key: 'Bookmarks', label: `Đã lưu (${bookmarks.length})` }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSelectedTopic(item.key as any)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all border ${
                      selectedTopic === item.key
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* RESULTS COUNTER */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                Hiển thị <strong className="text-indigo-400">{filteredQuestions.length}</strong> / {questions.length} bài tập
              </span>
              {bookmarks.length > 0 && (
                <span className="flex items-center gap-1 text-amber-400">
                  <Bookmark className="w-3.5 h-3.5 fill-amber-400" />
                  Bạn đã đánh dấu {bookmarks.length} câu để ôn tập
                </span>
              )}
            </div>

            {/* QUESTIONS LIST */}
            {filteredQuestions.length > 0 ? (
              <div className="space-y-6">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    id={`question-${q.id}`}
                    className={`transition-all rounded-2xl ${
                      highlightQuestionId === q.id
                        ? 'ring-2 ring-indigo-500 ring-offset-4 ring-offset-slate-950 scale-[1.01]'
                        : ''
                    }`}
                  >
                    <QuestionCard
                      question={q}
                      isBookmarked={bookmarks.includes(q.id)}
                      onToggleBookmark={toggleBookmark}
                      defaultExpanded={expandAll}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
                <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-slate-300">Không tìm thấy bài tập nào</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hãy thử đổi từ khóa tìm kiếm hoặc bấm &quot;Tất cả&quot; để hiển thị lại toàn bộ câu hỏi.
                </p>
                <button
                  onClick={() => {
                    setSelectedTopic('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-500 transition-all"
                >
                  Hiển thị tất cả câu hỏi
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXAM MODE */}
        {activeTab === 'exam' && (
          <ExamMode
            onBackToStudy={() => setActiveTab('study')}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
            questions={questions}
          />
        )}

        {/* TAB 3: CHEATSHEET */}
        {activeTab === 'cheatsheet' && (
          <CheatsheetView onSelectQuestion={handleSelectQuestion} />
        )}

        {/* TAB 4: CALCULATORS */}
        {activeTab === 'calculators' && (
          <Calculators />
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Tài liệu ôn tập và hướng dẫn giải môn MAE101 (Calculus & Linear Algebra) • Chạy hoàn toàn trên máy cục bộ.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>{questions.length} Câu hỏi</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">0% API Key Ngoài</span>
            <span>•</span>
            <button
              onClick={() => setIsDataManagerOpen(true)}
              className="text-indigo-400 hover:underline cursor-pointer"
            >
              Xuất / Nhập JSON
            </button>
          </div>
        </div>
      </footer>

      {/* DATA MANAGER MODAL */}
      <DataManagerModal
        isOpen={isDataManagerOpen}
        onClose={() => setIsDataManagerOpen(false)}
        currentQuestions={questions}
        onUpdateQuestions={(newQuestions) => setQuestions(newQuestions)}
      />
    </div>
  );
}
