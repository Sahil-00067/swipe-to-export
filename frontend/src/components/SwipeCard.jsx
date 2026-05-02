import { useState } from 'react';
import axios from 'axios';
import { X, Heart, TrendingUp, BrainCircuit, Loader2 } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function SwipeCard({ recommendation, onSwipe, token, userCountry }) {
  const x = useMotionValue(0);
  
  // Make rotation more dramatic
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const scale = useTransform(x, [-200, 0, 200], [0.9, 1, 0.9]);
  
  // Stamp opacities
  const likeOpacity = useTransform(x, [20, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -150], [0, 1]);
  
  const [advice, setAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  const getAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const res = await axios.post('http://localhost:5001/api/analyze-card', {
        user_country: userCountry,
        target_country: recommendation.target_country,
        commodity: recommendation.commodity,
        flow: recommendation.flow,
        score: recommendation.score
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdvice(res.data.analysis);
    } catch (err) {
      setAdvice("Error getting AI advice.");
    }
    setLoadingAdvice(false);
  };

  const formatCurrency = (val) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <motion.div
      style={{ x, rotate, scale }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-full max-w-sm h-[520px] bg-white rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col"
      whileTap={{ scale: 0.98 }}
    >
      {/* Dramatic Stamps */}
      <motion.div 
        style={{ opacity: nopeOpacity }} 
        className="absolute top-12 right-8 z-20 border-4 border-red-500 text-red-500 text-4xl font-black uppercase tracking-widest px-3 py-1 rounded-xl rotate-[15deg] pointer-events-none shadow-sm bg-white/50 backdrop-blur-sm"
      >
        NOPE
      </motion.div>
      <motion.div 
        style={{ opacity: likeOpacity }} 
        className="absolute top-12 left-8 z-20 border-4 border-[#4A7C59] text-[#4A7C59] text-4xl font-black uppercase tracking-widest px-3 py-1 rounded-xl -rotate-[15deg] pointer-events-none shadow-sm bg-white/50 backdrop-blur-sm"
      >
        LIKE
      </motion.div>

      <div className="h-40 bg-[#F5F1EB] flex items-center justify-center p-6 relative shrink-0 border-b border-gray-100 z-10">
        <h2 className="text-4xl font-bold text-[#1A1A1A] text-center tracking-tight">
          {recommendation.target_country}
        </h2>
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-semibold text-[#8B5A2B] shadow-sm border border-[#8B5A2B]/10">
          {recommendation.score > 1000000 ? 'High Match' : 'Potential'}
        </div>
      </div>
      
      <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-medium">{recommendation.flow} volume for</p>
          <p className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{recommendation.commodity}</p>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
              <p className="text-xs text-gray-500 mb-1 font-medium">Product Match</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#4A7C59] h-full" style={{ width: recommendation.metrics?.productMatch || '90%' }}></div>
                </div>
                <span className="text-sm font-bold text-[#4A7C59]">{recommendation.metrics?.productMatch || '90%'}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
              <p className="text-xs text-gray-500 mb-1 font-medium">Location Match</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#8B5A2B] h-full" style={{ width: recommendation.metrics?.locationBias || '75%' }}></div>
                </div>
                <span className="text-sm font-bold text-[#8B5A2B]">{recommendation.metrics?.locationBias || '75%'}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><TrendingUp size={12}/> Trade Volume / Intent</p>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(recommendation.score)}</p>
              </div>
            </div>
          </div>

          {!advice ? (
            <button 
              onClick={getAdvice}
              disabled={loadingAdvice}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#4A7C59]/5 text-[#4A7C59] font-medium hover:bg-[#4A7C59]/10 border border-[#4A7C59]/20 text-sm transition-colors"
            >
              {loadingAdvice ? <Loader2 className="animate-spin" size={16} /> : <BrainCircuit size={16} />}
              {loadingAdvice ? 'Analyzing...' : 'Ask AI Strategist'}
            </button>
          ) : (
            <div className="p-4 bg-[#4A7C59]/5 rounded-xl border border-[#4A7C59]/10 text-xs text-gray-700 leading-relaxed shadow-sm">
              <p className="text-[#4A7C59] font-bold mb-1.5 uppercase flex items-center gap-1">
                <BrainCircuit size={12} /> AI Strategist
              </p>
              {advice}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-6 pt-4 pb-2 mt-auto">
          <button 
            onClick={() => onSwipe('left')}
            className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm hover:scale-110"
          >
            <X size={28} />
          </button>
          <button 
            onClick={() => onSwipe('right')}
            className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#4A7C59] hover:bg-[#4A7C59]/10 hover:border-[#4A7C59]/20 transition-all shadow-sm hover:scale-110"
          >
            <Heart size={28} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
