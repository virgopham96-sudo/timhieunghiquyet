import { useState, useEffect } from 'react';
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { questions } from './data/questions';
import { Trophy, LogOut, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

type AppState = 'auth' | 'quiz' | 'result' | 'leaderboard';

interface QuizResult {
  id?: string;
  uid: string;
  teamName: string;
  score: number;
  totalQuestions: number;
  submittedAt: Timestamp;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [appState, setAppState] = useState<AppState>('auth');
  const [teamName, setTeamName] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<QuizResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && appState === 'auth') {
        // Stay on auth to enter team name
      }
    });
    return () => unsubscribe();
  }, [appState]);

  const handleLogin = async () => {
    try {
      setError('');
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setAppState('auth');
    setTeamName('');
    setAnswers({});
  };

  const startQuiz = () => {
    if (!teamName.trim()) {
      setError('Vui lòng nhập tên đội của bạn');
      return;
    }
    setError('');
    setAppState('quiz');
  };

  const handleAnswer = (questionId: number, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const submitQuiz = async () => {
    if (!user) return;
    
    // Check if all questions are answered
    if (Object.keys(answers).length < questions.length) {
      setError('Vui lòng trả lời tất cả các câu hỏi trước khi nộp bài');
      return;
    }

    setIsSubmitting(true);
    setError('');

    let calculatedScore = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);

    try {
      await addDoc(collection(db, 'results'), {
        uid: user.uid,
        teamName: teamName.trim(),
        score: calculatedScore,
        totalQuestions: questions.length,
        submittedAt: serverTimestamp()
      });
      setAppState('result');
    } catch (err: any) {
      console.error(err);
      setError('Có lỗi xảy ra khi lưu kết quả. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const q = query(collection(db, 'results'), orderBy('score', 'desc'), orderBy('submittedAt', 'asc'));
      const querySnapshot = await getDocs(q);
      const results: QuizResult[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as QuizResult);
      });
      setLeaderboard(results);
      setAppState('leaderboard');
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-blue-700 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Hội thi tìm hiểu Nghị quyết Đại hội XIV
          </h1>
          {user && (
            <div className="flex items-center gap-4">
              <span className="hidden md:inline text-sm bg-blue-800 px-3 py-1 rounded-full">
                {user.displayName}
              </span>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-blue-800 rounded-full transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {appState === 'auth' && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Đăng ký dự thi</h2>
            
            {!user ? (
              <div className="text-center">
                <p className="text-slate-600 mb-6">Vui lòng đăng nhập bằng tài khoản Google để bắt đầu.</p>
                <button 
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 font-medium py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Đăng nhập với Google
                </button>
              </div>
            ) : (
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Nhập tên đội của bạn..."
                    maxLength={100}
                  />
                </div>
                <button 
                  onClick={startQuiz}
                  className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Bắt đầu làm bài
                </button>
                <button 
                  onClick={fetchLeaderboard}
                  className="w-full bg-slate-100 text-slate-700 font-medium py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Xem bảng xếp hạng
                </button>
              </div>
            )}
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
                  {Object.keys(answers).length} / {questions.length}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((q, index) => (
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
                {score} <span className="text-2xl text-slate-400 font-medium">/ {questions.length}</span>
              </p>
            </div>

            <div className="flex gap-4 justify-center">
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
                onClick={() => setAppState('auth')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Quay lại
              </button>
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
                          {result.submittedAt ? new Date(result.submittedAt.toDate()).toLocaleString('vi-VN') : 'Đang cập nhật...'}
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
