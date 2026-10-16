import React, { useRef, useState } from 'react';
import { QuestionItem } from '../data/questionsData';
import { LOCAL_QUESTIONS_JSON, LOCAL_CHEATSHEET_JSON } from '../data/jsonLoader';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  FileJson, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Terminal, 
  HardDrive,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface DataManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuestions: QuestionItem[];
  onUpdateQuestions: (newQuestions: QuestionItem[]) => void;
}

export const DataManagerModal: React.FC<DataManagerModalProps> = ({
  isOpen,
  onClose,
  currentQuestions,
  onUpdateQuestions
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  // Export questions.json
  const exportQuestionsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentQuestions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "mae101_questions.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setNotification({
      type: 'success',
      message: `Đã xuất thành công ${currentQuestions.length} câu hỏi ra file mae101_questions.json!`
    });
  };

  // Export cheatsheet.json
  const exportCheatsheetJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(LOCAL_CHEATSHEET_JSON, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "mae101_cheatsheet.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setNotification({
      type: 'success',
      message: 'Đã xuất thành công file công thức mae101_cheatsheet.json!'
    });
  };

  // Import JSON from local PC
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].questionVi) {
          onUpdateQuestions(parsed);
          localStorage.setItem('mae101_custom_questions', JSON.stringify(parsed));
          setNotification({
            type: 'success',
            message: `Nạp thành công ${parsed.length} câu hỏi từ file "${file.name}"!`
          });
        } else {
          setNotification({
            type: 'error',
            message: 'File JSON không đúng định dạng câu hỏi MAE101 (cần mảng các object câu hỏi).'
          });
        }
      } catch (err: any) {
        setNotification({
          type: 'error',
          message: `Lỗi đọc file JSON: ${err?.message || 'Định dạng JSON không hợp lệ'}`
        });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // Reset to original PDF
  const handleResetToDefault = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục lại 30 câu hỏi gốc ban đầu từ PDF?')) {
      onUpdateQuestions(LOCAL_QUESTIONS_JSON);
      localStorage.removeItem('mae101_custom_questions');
      setNotification({
        type: 'success',
        message: 'Đã khôi phục 30 câu hỏi gốc ban đầu từ PDF!'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Quản Lý Dữ Liệu & Xuất Bản Độc Lập</h3>
              <p className="text-xs text-slate-400">Hoạt động 100% bằng dữ liệu JSON cục bộ • Không dùng API Key AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Notification Alert */}
          {notification && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs sm:text-sm ${
                notification.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{notification.message}</span>
            </div>
          )}

          {/* Zero API Key Guarantee */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              <strong className="text-emerald-300 block mb-0.5">Xác nhận Độc Lập (Zero External API Keys):</strong>
              Ứng dụng không thực hiện bất kỳ lệnh gọi API hoặc truyền dữ liệu ra ngoài. Toàn bộ 30 câu hỏi, thuật toán giải bước và công thức toán học đều nằm trong các file JSON trên máy của bạn.
            </div>
          </div>

          {/* Actions Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Tải Xuất & Nhập File Dữ Liệu JSON
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export Questions */}
              <button
                onClick={exportQuestionsJSON}
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-all flex items-start gap-3 group"
              >
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Xuất file questions.json</div>
                  <div className="text-xs text-slate-400">Tải bộ 30 câu hỏi đầy đủ về máy</div>
                </div>
              </button>

              {/* Export Cheatsheet */}
              <button
                onClick={exportCheatsheetJSON}
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-all flex items-start gap-3 group"
              >
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <FileJson className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Xuất file cheatsheet.json</div>
                  <div className="text-xs text-slate-400">Tải toàn bộ công thức toán học</div>
                </div>
              </button>

              {/* Import JSON */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-all flex items-start gap-3 group"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Nạp file JSON từ máy tính</div>
                  <div className="text-xs text-slate-400">Chọn file .json tùy chỉnh để tải lên</div>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Reset to Default */}
              <button
                onClick={handleResetToDefault}
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-all flex items-start gap-3 group"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Khôi phục 30 câu gốc</div>
                  <div className="text-xs text-slate-400">Quay lại dữ liệu ban đầu từ PDF</div>
                </div>
              </button>
            </div>
          </div>

          {/* Standalone Run Guide */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-indigo-400" />
              Cách Đóng Gói Và Chạy Độc Lập Trên Máy Cá Nhân
            </h4>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs text-slate-300 font-mono">
              <p className="text-slate-400 font-sans">
                Chỉ cần 2 bước trong terminal để chạy ứng dụng độc lập trên bất kỳ máy tính nào:
              </p>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-indigo-300">
                # Bước 1: Biên dịch ra HTML, CSS & JS tĩnh<br />
                <span className="text-white font-bold">npm run build</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-indigo-300">
                # Bước 2: Chạy trực tiếp thư mục dist mà không cần internet<br />
                <span className="text-white font-bold">npx serve dist</span>
              </div>
              <p className="text-slate-400 font-sans text-[11px] pt-1">
                Toàn bộ mã nguồn và dữ liệu JSON sẽ được đóng gói vào thư mục <code className="text-indigo-300">dist/</code>. Bạn có thể copy thư mục này lên USB hoặc deploy lên GitHub Pages / Cloudflare Pages hoàn toàn miễn phí.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
