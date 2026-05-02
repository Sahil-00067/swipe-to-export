import { useState } from 'react';
import axios from 'axios';
import { Globe2, ArrowRight, ShieldCheck, Zap, Lock, User, Loader2, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function LandingPage({ onLogin }) {
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    try {
      const res = await axios.post(`http://localhost:5001${endpoint}`, formData);
      onLogin({ token: res.data.token, username: res.data.username });
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[80vh] animate-fade-in px-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        
        {/* Hero Section */}
        <div className="space-y-6 mb-16 pt-8">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-[#8B5A2B]/10 rounded-full mb-2">
            <span className="text-[#8B5A2B] font-bold text-sm tracking-wide uppercase">AI-Powered Trade Matchmaking</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900">
            Find Global Buyers <span className="text-[#8B5A2B]">Smarter</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Stop guessing and start exporting. Swipe through highly-qualified global partners matched to your commodities using real historical trade data and AI insights.
          </p>
        </div>

        {/* Problem & Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 text-left">
          <div className="bg-[#1A1A1A] p-10 rounded-3xl text-white relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/20 rounded-full blur-2xl group-hover:bg-red-500/30 transition-all"></div>
            <AlertTriangle className="text-red-400 mb-6" size={36} />
            <h3 className="text-2xl font-bold mb-4">The Old Way is Broken</h3>
            <p className="text-gray-400 leading-relaxed font-medium">
              Finding reliable B2B buyers overseas takes months of cold emailing, expensive trade shows, and guessing which markets actually need your product. You waste time on unqualified leads and dead ends.
            </p>
          </div>

          <div className="bg-[#F5F1EB] p-10 rounded-3xl border border-gray-200 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#4A7C59]/20 rounded-full blur-2xl group-hover:bg-[#4A7C59]/30 transition-all"></div>
            <CheckCircle2 className="text-[#4A7C59] mb-6" size={36} />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">The Swipe to Export Way</h3>
            <p className="text-gray-700 leading-relaxed font-medium">
              Our AI analyzes millions of historical EXIM records to find exact buyers who are actively importing your commodity. We rank them, explain why they match, and even draft the cold email for you.
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 pb-12">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-[#8B5A2B]/30 transition-colors text-left card-shadow">
            <div className="bg-[#8B5A2B]/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <Globe2 className="text-[#8B5A2B]" size={28}/>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Global Reach</h3>
            <p className="text-gray-600 font-medium">Connect with over 150+ countries. Filter by commodities to find precise matches for your business needs.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-[#4A7C59]/30 transition-colors text-left card-shadow">
            <div className="bg-[#4A7C59]/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="text-[#4A7C59]" size={28}/>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Swipes</h3>
            <p className="text-gray-600 font-medium">A seamless, Tinder-style interface. Swipe right to express interest, swipe left to pass.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-gray-300 transition-colors text-left card-shadow">
            <div className="bg-gray-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="text-gray-700" size={28}/>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Creative AI Insights</h3>
            <p className="text-gray-600 font-medium">Powered by Gemini. Every successful match comes with creative, data-driven reasoning.</p>
          </div>
        </div>

        {/* Auth Section */}
        {!showAuth ? (
          <button 
            onClick={() => setShowAuth(true)}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 font-bold text-white bg-[#1A1A1A] rounded-full hover:bg-black transition-all duration-300 shadow-xl hover:-translate-y-1"
          >
            <span className="text-lg tracking-wide">Login to Start Matchmaking</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <div className="max-w-md mx-auto bg-white p-10 rounded-3xl border border-gray-100 card-shadow relative animate-fade-in">
            <button onClick={() => setShowAuth(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-50 p-2 rounded-full transition-colors"><X size={20}/></button>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            
            {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="text" 
                  required
                  placeholder="Username" 
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#8B5A2B] focus:ring-1 focus:ring-[#8B5A2B] transition-all"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="password" 
                  required
                  placeholder="Password" 
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#8B5A2B] focus:ring-1 focus:ring-[#8B5A2B] transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-[#8B5A2B] rounded-xl font-bold text-white hover:bg-[#6b4521] transition-colors flex justify-center items-center gap-2 shadow-md"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Login' : 'Sign Up')}
              </button>
            </form>
            
            <div className="mt-8 text-sm text-gray-500 font-medium">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-[#8B5A2B] hover:text-[#6b4521] font-bold underline decoration-transparent hover:decoration-[#6b4521] transition-all underline-offset-4"
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
