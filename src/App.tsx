import { useState, useEffect, useRef } from 'react';
import { questions, Question } from './data/questions';
import { Trophy, CheckCircle2, AlertCircle, Clock, ArrowLeft, Home, Calendar, HelpCircle, FileText, Users, QrCode, ChevronRight, ChevronLeft, ZoomOut, ZoomIn, List, Edit, Loader2, Trash2 } from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

type AppState = 'setup' | 'quiz' | 'result' | 'leaderboard';

interface QuizResult {
  id: string;
  teamName: string;
  score: number;
  totalQuestions: number;
  submittedAt: number;
  timeTaken?: number;
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
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [saveToLeaderboard, setSaveToLeaderboard] = useState(true);
  const [clearPassword, setClearPassword] = useState('');
  const [clearPasswordError, setClearPasswordError] = useState('');

  const submitQuizRef = useRef<((isAutoSubmit?: boolean | React.MouseEvent) => void) | null>(null);

  useEffect(() => {
    if (appState === 'quiz' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (appState === 'quiz' && timeLeft === 0 && !isSubmitting) {
      if (submitQuizRef.current) {
        submitQuizRef.current(true);
      }
    }
  }, [appState, timeLeft, isSubmitting]);

  const handleStartClick = () => {
    setShowNameModal(true);
  };

  const confirmStartQuiz = () => {
    if (!teamName.trim()) {
      setError('Vui lòng nhập tên đăng ký dự thi');
      return;
    }
    setError('');
    setAnswers({});
    
    // Lấy ngẫu nhiên 15 câu hỏi từ bộ đề 25 câu
    const shuffled = shuffleArray(questions);
    setCurrentQuestions(shuffled.slice(0, 15));
    
    setTimeLeft(15 * 60);
    setAppState('quiz');
    setShowNameModal(false);
  };

  const handleAnswer = (questionId: number, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const submitQuiz = async (isAutoSubmit?: boolean | React.MouseEvent) => {
    const isAuto = typeof isAutoSubmit === 'boolean' ? isAutoSubmit : false;
    // Kiểm tra xem đã trả lời đủ 15 câu chưa
    if (!isAuto && Object.keys(answers).length < currentQuestions.length) {
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

    const timeTaken = (15 * 60) - timeLeft;

    const newResult = {
      uid: `anon_${Math.random().toString(36).substring(2, 9)}`,
      teamName: teamName.trim(),
      score: calculatedScore,
      totalQuestions: currentQuestions.length,
      submittedAt: Date.now(),
      timeTaken: timeTaken
    };

    try {
      if (saveToLeaderboard) {
        await addDoc(collection(db, 'results'), newResult);
      }
      
      setAppState('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setError('Có lỗi xảy ra khi lưu kết quả lên hệ thống.');
    } finally {
      setIsSubmitting(false);
    }
  };

  submitQuizRef.current = submitQuiz;

  const fetchLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    try {
      const q = query(collection(db, 'results'), orderBy('score', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const results: QuizResult[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        results.push({
          id: doc.id,
          teamName: data.teamName,
          score: data.score,
          totalQuestions: data.totalQuestions,
          submittedAt: data.submittedAt,
          timeTaken: data.timeTaken
        });
      });

      const sorted = results.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        // Nếu bằng điểm, ai nộp sớm hơn xếp trên (thời gian nộp),
        // hoặc nếu có timeTaken, ai làm nhanh hơn xếp trên
        if (a.timeTaken && b.timeTaken && a.timeTaken !== b.timeTaken) {
            return a.timeTaken - b.timeTaken;
        }
        return a.submittedAt - b.submittedAt;
      });
      setLeaderboard(sorted);
      setAppState('leaderboard');
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Không thể tải bảng xếp hạng, vui lòng thử lại sau.');
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const processClearHistory = async () => {
    if (clearPassword !== '12345678@') {
      setClearPasswordError('Mật khẩu không chính xác.');
      return;
    }
    setClearPasswordError('');
    setIsClearingHistory(true);
    setShowClearConfirmModal(false);
    try {
      const q = query(collection(db, 'results'));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(document => deleteDoc(doc(db, 'results', document.id)));
      await Promise.all(deletePromises);
      setLeaderboard([]);
      // Instead of alert, just setting state is fine or show a local toast. Let's just clear errors.
      setError('');
    } catch (err) {
      console.error('Error clearing history:', err);
      setError('Có lỗi xảy ra khi xoá lịch sử thi.');
    } finally {
      setIsClearingHistory(false);
    }
  };

  const clearHistoryClick = () => {
    setClearPassword('');
    setClearPasswordError('');
    setShowClearConfirmModal(true);
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

  const formatTimeTaken = (seconds?: number) => {
    if (seconds === undefined) return 'Đang cập nhật';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} phút ${s} giây`;
  };

  return (
    <div className={`min-h-screen font-sans text-slate-900 ${appState === 'quiz' ? 'bg-[#f4f6f9]' : 'bg-slate-50'}`}>
      {appState !== 'quiz' && (
        <header className="bg-blue-700 text-white shadow-md sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 cursor-pointer" onClick={handleReturnHome}>
              <Trophy className="w-6 h-6 text-yellow-400" />
              Hội thi cán bộ đoàn giỏi và Tuyên truyền viên trẻ trong Thanh niên Công ty 790
            </h1>
          </div>
        </header>
      )}

      {appState === 'quiz' && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="mx-auto px-4 lg:px-8 py-3 flex flex-wrap gap-4 justify-between items-center">
            <button 
              onClick={handleReturnHome}
              className="flex items-center gap-1 text-slate-600 border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </button>
            
            <div className="font-medium text-slate-800 text-[15px] hidden md:block">
              Thí sinh: <span className="font-semibold">{teamName}</span>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-[15px]">
                <Clock className="w-5 h-5 text-slate-600" />
                <span className={timeLeft < 60 ? 'text-red-600' : ''}>
                  00 : {Math.floor(timeLeft / 60).toString().padStart(2, '0')} : {(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <button className="p-1.5 border border-slate-200 rounded hover:bg-slate-100 text-slate-500 transition-colors">
                  <ZoomOut className="w-[18px] h-[18px]" />
                </button>
                <button className="p-1.5 border border-slate-200 rounded hover:bg-slate-100 text-slate-500 transition-colors">
                  <ZoomIn className="w-[18px] h-[18px]" />
                </button>
                <button className="p-1.5 border border-slate-200 rounded hover:bg-slate-100 text-slate-500 transition-colors">
                  <List className="w-[18px] h-[18px]" />
                </button>
              </div>
              <button 
                onClick={() => submitQuiz()}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-[#2d4b8e] hover:bg-[#203a73] text-white px-5 py-2 rounded font-semibold text-[15px] transition-colors"
              >
                <Edit className="w-4 h-4" /> Nộp bài
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={appState === 'quiz' ? "mx-auto px-4 lg:px-8 py-6 max-w-[1440px]" : "max-w-4xl mx-auto px-4 py-8"}>
        {showNameModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Nhập thông tin dự thi</h3>
              <div className="mb-6">
                <label htmlFor="teamName" className="block text-sm font-medium text-slate-700 mb-2">
                  Họ tên / Tên đội thi
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && confirmStartQuiz()}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ea580c] focus:border-[#ea580c] outline-none transition-all"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  maxLength={100}
                />
              </div>
              <div className="mb-6 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="saveLeaderboard" 
                  checked={saveToLeaderboard}
                  onChange={(e) => setSaveToLeaderboard(e.target.checked)}
                  className="w-4 h-4 text-[#ea580c] focus:ring-[#ea580c] rounded border-slate-300"
                />
                <label htmlFor="saveLeaderboard" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Lưu kết quả lên bảng xếp hạng
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowNameModal(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={confirmStartQuiz}
                  className="px-5 py-2.5 bg-[#ea580c] text-white hover:bg-orange-700 rounded-lg font-medium transition-colors"
                >
                  Bắt đầu làm bài
                </button>
              </div>
            </div>
          </div>
        )}

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
                  className="px-5 py-2.5 bg-[#ea580c] text-white hover:bg-orange-700 rounded-lg font-medium transition-colors"
                >
                  Thoát
                </button>
              </div>
            </div>
          </div>
        )}

        {showClearConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-red-600 mb-2">Xoá lịch sử thi</h3>
              <p className="text-slate-600 mb-4">Bạn có chắc chắn muốn xoá toàn bộ lịch sử thi trên hệ thống không? Hành động này không thể hoàn tác.</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu xác nhận</label>
                <input 
                  type="password"
                  value={clearPassword}
                  onChange={(e) => setClearPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      processClearHistory();
                    }
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="Nhập mật khẩu để xoá"
                />
                {clearPasswordError && (
                  <p className="text-red-500 text-sm mt-2">{clearPasswordError}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowClearConfirmModal(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={processClearHistory}
                  className="px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2 relative min-w-[120px] justify-center"
                  disabled={isClearingHistory}
                >
                  {isClearingHistory ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xoá vĩnh viễn'}
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
          <div className="max-w-2xl mx-auto mt-6">
            <div className="bg-white p-8 md:p-10 rounded-lg shadow-sm border border-slate-200">
              <h2 className="text-xl md:text-2xl font-semibold text-center mb-10 text-slate-800 leading-snug">
                Hội thi cán bộ đoàn giỏi và Tuyên truyền viên trẻ trong Thanh niên Công ty 790
              </h2>

              <div className="space-y-0 text-[15px]">
                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Clock className="w-[18px] h-[18px] text-slate-600" />
                    <span>Thời gian làm bài</span>
                  </div>
                  <span className="font-semibold text-slate-800">15 phút</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Calendar className="w-[18px] h-[18px] text-slate-600" />
                    <span>Thời gian vào thi</span>
                  </div>
                  <span className="font-semibold text-slate-800">Không thời hạn</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <HelpCircle className="w-[18px] h-[18px] text-slate-600" />
                    <span>Số lượng câu hỏi</span>
                  </div>
                  <span className="font-semibold text-slate-800">15</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <FileText className="w-[18px] h-[18px] text-slate-600" />
                    <span>Loại đề</span>
                  </div>
                  <span className="font-semibold text-slate-800">Trắc nghiệm</span>
                </div>
              </div>

              <button 
                onClick={handleStartClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded transition-colors flex justify-center items-center gap-2 text-base shadow-sm mt-6"
              >
                Bắt đầu thi <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center mt-6">
              <button 
                onClick={fetchLeaderboard}
                disabled={isLoadingLeaderboard}
                className="bg-[#f8fafc] border border-slate-200 text-slate-700 font-medium py-2.5 px-6 rounded hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-70"
              >
                {isLoadingLeaderboard ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xem lịch sử làm bài'}
              </button>
            </div>
          </div>
        )}

        {appState === 'quiz' && (
          <div className="flex flex-col lg:flex-row gap-6 relative items-start">
            {/* Left: Questions column */}
            <div className="flex-1 space-y-6 min-w-0">
              {currentQuestions.map((q, index) => (
                <div key={q.id} id={`question-${q.id}`} className="bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-6">
                    <h3 className="font-bold text-slate-800 mb-1 text-base">Câu {index + 1}</h3>
                    <p className="text-slate-800 font-medium mb-6 text-[15px]">{q.text}</p>

                    <div className="space-y-4">
                      {q.options.map((opt) => (
                        <label 
                          key={opt.id} 
                          className="flex items-center gap-4 cursor-pointer group"
                        >
                          <div className={`w-10 h-10 rounded-full border flex flex-shrink-0 items-center justify-center transition-colors ${
                            answers[q.id] === opt.id 
                              ? 'border-[#2d4b8e] bg-[#2d4b8e] text-white' 
                              : 'border-slate-300 text-slate-700 bg-white group-hover:border-slate-400'
                          }`}>
                            {opt.id}
                          </div>
                          <div className={`flex-1 border rounded-md py-3 px-4 transition-colors ${
                            answers[q.id] === opt.id 
                              ? 'border-[#2d4b8e] text-[#2d4b8e] bg-[#f0f4fb] shadow-sm font-medium' 
                              : 'border-slate-300 text-slate-700 bg-white group-hover:border-slate-400'
                          }`}>
                            {opt.text}
                          </div>
                          <input 
                            type="radio" 
                            name={`question-${q.id}`} 
                            value={opt.id}
                            checked={answers[q.id] === opt.id}
                            onChange={() => handleAnswer(q.id, opt.id)}
                            className="hidden"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Navigation column */}
            <div className="lg:w-80 shrink-0 lg:sticky lg:top-20 z-10 w-full mb-8 lg:mb-0">
              <div className="bg-white rounded border border-slate-200 p-5 shadow-sm">
                <h3 className="font-medium text-slate-800 mb-4 text-[15px]">Danh sách câu hỏi</h3>
                <div className="grid grid-cols-5 gap-2">
                  {currentQuestions.map((q, index) => {
                    const isAnswered = !!answers[q.id];
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          const el = document.getElementById(`question-${q.id}`);
                          if (el) {
                            const offset = 80;
                            const bodyRect = document.body.getBoundingClientRect().top;
                            const elementRect = el.getBoundingClientRect().top;
                            const elementPosition = elementRect - bodyRect;
                            const offsetPosition = elementPosition - offset;
                            window.scrollTo({
                              top: offsetPosition,
                              behavior: 'smooth'
                            });
                          }
                        }}
                        className={`py-2 text-[13px] text-center border rounded transition-colors ${
                          isAnswered 
                            ? 'border-[#2b4491] text-slate-800 font-medium' 
                            : 'border-slate-200 text-slate-600 hover:border-slate-400 bg-white'
                        }`}
                      >
                        {(index + 1).toString().padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
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
              <div className="flex items-center gap-4">
                <button 
                  onClick={clearHistoryClick}
                  disabled={isClearingHistory}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                  title="Xoá toàn bộ lịch sử thi"
                >
                  {isClearingHistory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Xoá lịch sử
                </button>
                <button 
                  onClick={resetToSetup}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại
                </button>
              </div>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Chưa có kết quả nào được ghi nhận.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-4 px-4 font-semibold text-slate-600 w-16 text-center">Hạng</th>
                      <th className="py-4 px-4 font-semibold text-slate-600">Tên đội</th>
                      <th className="py-4 px-4 font-semibold text-slate-600 text-center">Điểm số</th>
                      <th className="py-4 px-4 font-semibold text-slate-600 text-right">Lượng thời gian làm bài</th>
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
                        <td className="py-4 px-4 text-right text-sm text-slate-500 font-medium flex items-center justify-end gap-1.5">
                          <Clock className="w-4 h-4" />
                          {formatTimeTaken(result.timeTaken)}
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
