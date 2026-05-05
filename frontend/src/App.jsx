import { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, LayoutDashboard, Search, BrainCircuit, Home, MessageSquare } from 'lucide-react';
import LandingPage from './components/LandingPage';
import SwipeCard from './components/SwipeCard';
import XAIDashboard from './components/XAIDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ProfileSettings from './components/ProfileSettings';
import DecisionPanel from './components/DecisionPanel';
import SkipFeedback from './components/SkipFeedback';
import AuthModal from './components/AuthModal';
import OutreachDashboard from './components/OutreachDashboard';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [view, setView] = useState(() => localStorage.getItem('swipe_view') || 'landing');
  const [metadata, setMetadata] = useState({ countries: [], commodities: [] });
  const [formData, setFormData] = useState({ country: '', commodity: '', flow: 'Export' });
  const [recommendations, setRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showCountries, setShowCountries] = useState(false);
  const [showCommodities, setShowCommodities] = useState(false);
  const [aiRanking, setAiRanking] = useState('');
  const [rankingLoading, setRankingLoading] = useState(false);
  const [user, setUser] = useState(() => localStorage.getItem('username') || null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showSkipFeedback, setShowSkipFeedback] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Dynamically determines if we hit localhost or the live Vercel backend
  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : `https://${window.location.hostname}`;

  useEffect(() => {
    localStorage.setItem('swipe_view', view);
  }, [view]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('username', user);
    } else {
      localStorage.removeItem('username');
    }
  }, [user]);

  // Environment-aware metadata fetch to prevent 404s
  useEffect(() => {
    axios.get(`${API_BASE}/api/metadata`)
      .then(res => setMetadata(res.data))
      .catch(err => console.error("Metadata fetch error:", err));
  }, [API_BASE]);

  const startMatchmaking = async () => {
    if (!formData.country || !formData.commodity) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/onboarding`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const res = await axios.post(`${API_BASE}/api/match`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecommendations(res.data);
      setCurrentIndex(0);
      setView('swipe');
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSwipe = async (direction) => {
    if (currentIndex >= recommendations.length) return;
    const currentRec = recommendations[currentIndex];
    setCurrentIndex(prev => prev + 1);

    if (direction === 'right') {
      setSelectedLead(currentRec);
      setShowSkipFeedback(false);
    } else if (direction === 'left') {
      setShowSkipFeedback(true);
      setSelectedLead(null);
    }
    
    try {
      await axios.post(`${API_BASE}/api/swipe`, {
        user_country: formData.country,
        target_country: currentRec.target_country,
        commodity: formData.commodity,
        flow: formData.flow,
        score: currentRec.score,
        status: direction === 'right' ? 'liked' : 'disliked'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getAiHelp = async () => {
    if (!formData.commodity) return;
    setRankingLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/rank`, {
        commodity: formData.commodity,
        flow: formData.flow
      });
      setAiRanking(res.data.ranking);
    } catch (err) {
      console.error(err);
      setAiRanking("Error fetching AI ranking.");
    }
    setRankingLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[var(--color-cream)] text-[var(--color-ink)]">
      {view !== 'landing' && (
        <nav className="w-full glass p-4 flex justify-between items-center sticky top-0 z-50 border-b border-[var(--color-ink)]/10">
          <h1 
            className="text-2xl font-bold font-playfair text-[var(--color-ink)] flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setView('landing')}
          >
            <RefreshCw className="text-[var(--color-purple-500)]" /> Swipe<span className="text-[var(--color-purple-500)]">to</span>Export
          </h1>
          <div className="flex gap-4 items-center">
            <button onClick={() => setView('landing')} className="text-[var(--color-ink)]/50 hover:text-[var(--color-ink)]"><Home size={24} /></button>
            <button onClick={() => setView('setup')} className={`${view === 'setup' ? 'text-[var(--color-purple-500)]' : 'text-[var(--color-ink)]/50 hover:text-[var(--color-purple-500)]'}`}><Search size={24} /></button>
            <button onClick={() => setView('dashboard')} className={`${view === 'dashboard' ? 'text-[var(--color-pink-400)]' : 'text-[var(--color-ink)]/50 hover:text-[var(--color-pink-400)]'}`}><LayoutDashboard size={24} /></button>
            {user && (
              <>
                <button onClick={() => setView('messages')} className={`${view === 'messages' ? 'text-[var(--color-purple-500)]' : 'text-[var(--color-ink)]/50 hover:text-[var(--color-purple-500)]'}`}><MessageSquare size={24} /></button>
                <button onClick={() => setView('analytics')} className={`${view === 'analytics' ? 'text-[var(--color-gold)]' : 'text-[var(--color-ink)]/50 hover:text-[var(--color-gold)]'}`}>
                   <LayoutDashboard size={24} />
                </button>
              </>
            )}
            {!user && <button onClick={() => setShowAuthModal(true)} className="bg-[var(--color-purple-500)] text-white px-4 py-2 rounded-xl font-bold text-sm">Login</button>}
          </div>
        </nav>
      )}

      <main className={`flex-1 w-full flex flex-col items-center justify-center ${view === 'landing' ? '' : 'max-w-6xl p-6'}`}>
        {view === 'landing' && <LandingPage onLogin={() => token ? setView('setup') : setShowAuthModal(true)} />}
        
        {view === 'setup' && (
          <div className="glass p-8 rounded-3xl w-full max-w-md card-shadow">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Step {onboardingStep} of 3</h2>
            </div>
            {onboardingStep === 1 && (
              <div>
                <input 
                  className="w-full p-4 rounded-xl bg-gray-50/50 border border-gray-200"
                  value={formData.country}
                  onChange={e => setFormData({...formData, country: e.target.value})}
                />
                <button onClick={() => setOnboardingStep(2)} disabled={!formData.country} className="w-full mt-4 py-4 rounded-xl bg-[#1A1A1A] text-white">Continue</button>
              </div>
            )}
            {/* ... other steps ... */}
          </div>
        )}

        {view === 'swipe' && currentIndex < recommendations.length && (
          <SwipeCard recommendation={recommendations[currentIndex]} onSwipe={handleSwipe} token={token} userCountry={formData.country} />
        )}

        {view === 'dashboard' && <XAIDashboard userCountry={formData.country} token={token} />}
        {view === 'analytics' && <AnalyticsDashboard token={token} />}
        {view === 'messages' && <OutreachDashboard token={token} />}
        {view === 'settings' && <ProfileSettings username={user} onLogout={() => { setUser(null); setToken(null); setView('landing'); }} />}
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
         onAuthSuccess={(data) => {
  setToken(data.token);
  // This ensures 'user' is a string, which React can render.
  const nameOnly = typeof data.username === 'object' ? data.username.username : data.username;
  setUser(nameOnly);
  setView('setup');
}}
        />
      </main>
    </div>
  );
}

export default App;
