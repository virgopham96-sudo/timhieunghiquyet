import { useState } from 'react';
import { questions, Question } from './data/questions';
import { Trophy, CheckCircle2, AlertCircle, Clock, ArrowLeft, Home } from 'lucide-react';

type AppState = 'setup' | 'quiz' | 'result' | 'leaderboard';

interface QuizResult {
  id: string;
  teamName: string;
  score: number;
  totalQuestions: number;
  submittedAt: number;
}

const LOCAL_STORAGE_KEY = 'quiz_results_v1';

// Hàm xáo trộn mảng (Fisher-Yates shuffle)
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function App() {
  const [appState, setAppState] = useState<AppState>('setup');
  const [teamName, setTeamName] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<QuizResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const startQuiz = () => {
    if (!teamName.trim()) {
      setError('Vui lòng nhập tên đội của bạn');
      return;
    }
    setError('');
    setAnswers({});
    
    // Lấy ngẫu nhiên 15 câu hỏi từ bộ đề 25 câu
    const shuffled = shuffleArray(questions);
    setCurrentQuestions(shuffled.slice(0, 15));
    
    setAppState('quiz');
  };

  const handleAnswer = (questionId: number, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const submitQuiz = () => {
    // Kiểm tra xem đã trả lời đủ 15 câu chưa
    if (Object.keys(answers).length < currentQuestions.length) {
      const missing = currentQuestions.length - Object.keys(answers).length;
      setError(`Vui lòng hoàn thành bài thi. Bạn còn thiếu ${missing} câu hỏi chưa trả lời.`);
      
      // Cuộn lên đầu trang để người dùng thấy thông báo lỗi
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setError('');

    let calculatedScore = 0;
    currentQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);

    const newResult: QuizResult = {
      id: Math.random().toString(36).substring(2, 9),
      teamName: teamName.trim(),
      score: calculatedScore,
      totalQuestions: currentQuestions.length,
      submittedAt: Date.now()
    };

    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      existing.push(newResult);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
      setAppState('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setError('Có lỗi xảy ra khi lưu kết quả.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchLeaderboard = () => {
    try {
      const existing: QuizResult[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const sorted = existing.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.submittedAt - b.submittedAt; // Nếu bằng điểm, ai nộp sớm hơn xếp trên
      });
      setLeaderboard(sorted);
      setAppState('leaderboard');
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  const resetToSetup = () => {
    setAppState('setup');
    setTeamName('');
    setAnswers({});
    setError('');
    setCurrentQuestions([]);
  };

  const handleReturnHome = () => {
    if (appState === 'quiz') {
      setShowConfirmModal(true);
    } else {
      resetToSetup();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-blue-700 text-white shadow-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 cursor-pointer" onClick={handleReturnHome}>
            <Trophy className="w-6 h-6 text-yellow-400" />
            Hội thi cán bộ đoàn giỏi và Tuyên truyền viên trẻ trong Thanh niên Công ty năm 2026
          </h1>
          
          {appState === 'quiz' && (
            <button 
              onClick={handleReturnHome}
              className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              title="Về trang chủ"
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Trang chủ</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận thoát</h3>
              <p className="text-slate-600 mb-6">Bạn có chắc chắn muốn thoát? Kết quả làm bài hiện tại sẽ bị mất.</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => {
                    setShowConfirmModal(false);
                    resetToSetup();
                  }}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors"
                >
                  Thoát
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm flex items-start gap-3 sticky top-24 z-10">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {appState === 'setup' && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Đăng ký dự thi</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-slate-700 mb-1">
                  Tên đội thi / Người dự thi
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && startQuiz()}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Nhập tên đội của bạn..."
                  maxLength={100}
                />
              </div>
              <button 
                onClick={startQuiz}
                className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Bắt đầu làm bài (15 câu)
              </button>
              <button 
                onClick={fetchLeaderboard}
                className="w-full bg-slate-100 text-slate-700 font-medium py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Xem bảng xếp hạng
              </button>
            </div>
          </div>
        )}

        {appState === 'quiz' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-20 z-10 flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Đội thi</p>
                <p className="font-bold text-lg text-blue-700">{teamName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Tiến độ</p>
                <p className="font-bold text-lg text-slate-800">
                  {Object.keys(answers).length} / {currentQuestions.length}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {currentQuestions.map((q, index) => (
                <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-medium text-slate-800 mb-4">
                    <span className="font-bold text-blue-600 mr-2">Câu {index + 1}:</span>
                    {q.text}
                  </h3>
                  <div className="space-y-3">
                    {q.options.map((opt) => (
                      <label 
                        key={opt.id} 
                        className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                          answers[q.id] === opt.id 
                            ? 'border-blue-500 bg-blue-50 shadow-sm' 
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name={`question-${q.id}`} 
                          value={opt.id}
                          checked={answers[q.id] === opt.id}
                          onChange={() => handleAnswer(q.id, opt.id)}
                          className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-3 text-slate-700">
                          <span className="font-semibold mr-2">{opt.id}.</span>
                          {opt.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-6 pb-12">
              <button 
                onClick={submitQuiz}
                disabled={isSubmitting}
                className="bg-blue-600 text-white font-bold text-lg py-4 px-12 rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài thi'}
                {!isSubmitting && <CheckCircle2 className="w-6 h-6" />}
              </button>
            </div>
          </div>
        )}

        {appState === 'result' && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-lg mx-auto text-center mt-10">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Hoàn thành!</h2>
            <p className="text-slate-600 mb-8">Cảm ơn đội <span className="font-semibold text-blue-700">{teamName}</span> đã tham gia thi.</p>
            
            <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
              <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Điểm số của bạn</p>
              <p className="text-5xl font-black text-blue-600">
                {score} <span className="text-2xl text-slate-400 font-medium">/ {currentQuestions.length}</span>
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button 
                onClick={resetToSetup}
                className="bg-slate-100 text-slate-700 font-medium py-3 px-6 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Về trang chủ
              </button>
              <button 
                onClick={fetchLeaderboard}
                className="bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Xem bảng xếp hạng
              </button>
            </div>
          </div>
        )}

        {appState === 'leaderboard' && (
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Trophy className="w-7 h-7 text-yellow-500" />
                Bảng xếp hạng
              </h2>
              <button 
                onClick={resetToSetup}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </button>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Chưa có kết quả nào được ghi nhận trên máy này.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-4 px-4 font-semibold text-slate-600 w-16 text-center">Hạng</th>
                      <th className="py-4 px-4 font-semibold text-slate-600">Tên đội</th>
                      <th className="py-4 px-4 font-semibold text-slate-600 text-center">Điểm số</th>
                      <th className="py-4 px-4 font-semibold text-slate-600 text-right">Thời gian nộp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((result, index) => (
                      <tr key={result.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 text-center">
                          {index === 0 ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-700 rounded-full font-bold">1</span>
                          ) : index === 1 ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-200 text-slate-700 rounded-full font-bold">2</span>
                          ) : index === 2 ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-800 rounded-full font-bold">3</span>
                          ) : (
                            <span className="text-slate-500 font-medium">{index + 1}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-medium text-slate-800">{result.teamName}</td>
                        <td className="py-4 px-4 text-center font-bold text-blue-600">{result.score}/{result.totalQuestions}</td>
                        <td className="py-4 px-4 text-right text-sm text-slate-500 flex items-center justify-end gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(result.submittedAt).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
