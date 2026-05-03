import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Building2, MapPin, Tag, CheckCircle2, AlertCircle, Clock, 
  Send, Copy, Edit2, X, Bookmark, ExternalLink, Mail, Zap, Loader2 
} from 'lucide-react';

export default function DecisionPanel({ lead, token, onClose, onSave }) {
  const [emailTone, setEmailTone] = useState('Formal');
  const [copied, setCopied] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    generateEmail('Formal');
  }, []);

  const generateEmail = async (tone) => {
    setLoadingEmail(true);
    setEmailTone(tone);
    try {
      const res = await axios.post('http://localhost:5001/api/generate-outreach', {
        target_country: lead.target_country,
        commodity: lead.commodity,
        flow: lead.flow,
        score: lead.score,
        tone: tone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmailContent(res.data.email);
    } catch (err) {
      setEmailContent("Error generating email. Please try again.");
    }
    setLoadingEmail(false);
  };

  const handleSendOutreach = async () => {
    setSending(true);
    try {
      await axios.post('http://localhost:5001/api/send-outreach', {
        target_country: lead.target_country,
        commodity: lead.commodity,
        messageContent: emailContent,
        tone: emailTone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to send outreach.');
    }
    setSending(false);
  };

  // Mock derived data based on lead
  const priorityScore = lead.metrics?.productMatch ? parseInt(lead.metrics.productMatch) : 85;
  const companyName = `Apex Imports ${lead.target_country}`;
  
  let priorityLabel = "Low Priority Lead";
  let priorityColor = "text-red-500";
  let priorityBg = "bg-red-50";
  let priorityRing = "text-red-500";
  let actionMessage = "Monitor Opportunity";

  if (priorityScore >= 80) {
    priorityLabel = "High Priority";
    priorityColor = "text-[var(--color-purple-500)]";
    priorityBg = "bg-[var(--color-purple-500)]/10";
    priorityRing = "text-[var(--color-purple-500)]";
    actionMessage = "Contact Immediately";
  } else if (priorityScore >= 50) {
    priorityLabel = "Medium Priority";
    priorityColor = "text-amber-500";
    priorityBg = "bg-amber-50";
    priorityRing = "text-amber-500";
    actionMessage = "Warm Outreach";
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(emailContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 sm:p-6"
    >
      <motion.div 
        initial={{ y: 50, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl bg-[var(--color-cream)] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Section */}
        <div className="bg-white p-6 pb-8 rounded-b-[32px] shadow-sm relative z-10 shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{companyName}</h2>
                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-semibold flex items-center gap-1 border border-blue-100">
                  <Zap size={12} /> Active Importer
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><MapPin size={16} /> {lead.target_country}</span>
                <span className="flex items-center gap-1.5"><Tag size={16} /> {lead.commodity}</span>
              </div>
            </div>
            
            {/* Circular Progress */}
            <div className="flex flex-col items-center mr-8">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className={priorityRing}
                    strokeDasharray={`${priorityScore}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
                <span className="absolute text-lg font-bold text-gray-900">{priorityScore}</span>
              </div>
              <span className={`text-xs font-bold mt-2 ${priorityColor} uppercase tracking-wide`}>{priorityLabel}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Recommendation */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{actionMessage}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <CheckCircle2 size={18} className="text-[var(--color-green-400)] shrink-0 mt-0.5" />
                <span>Consistent import activity in last 6 months indicating sustained demand.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <CheckCircle2 size={18} className="text-[var(--color-green-400)] shrink-0 mt-0.5" />
                <span>Strong match with your product category ({lead.commodity}).</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <CheckCircle2 size={18} className="text-[var(--color-green-400)] shrink-0 mt-0.5" />
                <span>High demand regional trends currently align with your export capacity.</span>
              </li>
            </ul>
          </div>

          {/* Outreach Strategy */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Suggested Tone</p>
              <div className="flex flex-wrap gap-2">
                {['Formal', 'Friendly', 'Direct'].map(tone => (
                  <button 
                    key={tone}
                    onClick={() => generateEmail(tone)}
                    disabled={loadingEmail}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${emailTone === tone ? 'bg-[var(--color-gold)] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50'}`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Best Time to Contact</p>
              <div className="flex items-center gap-3 text-gray-800 font-medium">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <Clock size={20} />
                </div>
                <div>
                  <p>10:00 AM</p>
                  <p className="text-xs text-gray-500 font-normal">Local Time ({lead.target_country})</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Generation */}
          <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100/50 overflow-hidden">
            <div className="bg-gray-50 p-3 flex items-center justify-between border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                AI Drafted Email
              </p>
              <div className="flex items-center gap-2">
                <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-white text-gray-500 transition-colors shadow-sm border border-transparent hover:border-gray-200" title="Copy">
                  {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
                <button className="p-1.5 rounded-md hover:bg-white text-gray-500 transition-colors shadow-sm border border-transparent hover:border-gray-200" title="Edit">
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-4 bg-white relative">
              {loadingEmail && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[var(--color-gold)]" size={24} />
                </div>
              )}
              <textarea 
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                className="w-full h-40 text-sm text-gray-600 resize-none outline-none leading-relaxed bg-transparent"
                placeholder="Drafting email..."
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white p-5 border-t border-gray-100 flex items-center gap-4 shrink-0 shadow-[0_-4px_20px_rgb(0,0,0,0.02)]">
          <button className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition-colors border border-gray-200">
            <Bookmark size={18} />
            Save Lead
          </button>
          <button 
            onClick={handleSendOutreach}
            disabled={sending || !emailContent}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--color-ink)] text-white font-semibold hover:bg-black disabled:opacity-50 transition-colors shadow-md"
          >
            {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {sending ? 'Sending...' : 'Generate & Send Outreach'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
