import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// TypeScript Interfaces
interface UserProfile {
  firstName: string;
  lastName: string;
  birthdate: string;
  nationality: string;
  targetCity: string;
  visaStatus: string;
  relocationDate: string;
}

interface SubStep {
  id: string;
  title: string;
  completed: boolean;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  priority: string;
  completed: boolean;
  subSteps: SubStep[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ProfileResponse {
  profile: UserProfile;
  steps: ChecklistItem[];
  recommendations: {
    summary: string;
    tips: string[];
  };
}

// Inline SVGs for elegant visual design
const IconSparkles = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sparkle-icon">
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
  </svg>
);

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const IconUnlock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 019.9-1" />
  </svg>
);

const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconChevron = ({ isOpen }: { isOpen: boolean }) => (
  <svg 
    width="14" 
    height="14" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function App() {
  // App State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [recommendations, setRecommendations] = useState<{ summary: string; tips: string[] } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Payment State
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    birthdate: '1995-06-15',
    nationality: 'United States',
    targetCity: 'Berlin',
    visaStatus: 'Employment',
    relocationDate: '2026-09-01',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle Profile Submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.nationality) {
      alert('Please fill in your name and nationality.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit profile');

      const data = (await response.json()) as ProfileResponse;
      setProfile(data.profile);
      setChecklist(data.steps);
      setRecommendations(data.recommendations);
      
      // Seed initial welcoming message
      setMessages([
        {
          role: 'assistant',
          content: `### Willkommen, ${data.profile.firstName}! 🇩🇪\n\n${data.recommendations.summary}\n\nI have generated your interactive **Relocation Checklist** in the panel on your right. Ask me anything about address registration (*Anmeldung*), getting health insurance, or finding an apartment in **${data.profile.targetCity}**!`
        }
      ]);
    } catch (error) {
      console.error('Error submitting profile:', error);
      alert('Could not connect to the backend server. Make sure it is running on http://localhost:3001');
    }
  };

  // Handle sending chat message (Streaming SSE)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !profile) return;

    const userQuery = chatInput;
    setChatInput('');
    
    // Append user message
    const updatedMessages: ChatMessage[] = [...messages, { role: 'user', content: userQuery }];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          profile: profile,
        }),
      });

      if (!response.ok) throw new Error('Chat API error');
      if (!response.body) throw new Error('No streaming body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partialChunk = '';
      
      // Initialize assistant bubble
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      setIsTyping(false);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = (partialChunk + chunk).split('\n\n');
        partialChunk = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      content: updated[lastIdx].content + data.text
                    };
                  }
                  return updated;
                });
              }
            } catch (e) {
              console.error('SSE JSON parse error', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '⚠️ **Communication failure**: I am having trouble connecting to the backend. Please check your network and make sure the server is online.' }
      ]);
    }
  };

  // Toggle checklist item completed
  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // Toggle sub-step completed
  const toggleSubStep = (itemId: string, subId: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const newSubs = item.subSteps.map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
      const allDone = newSubs.every(s => s.completed);
      return { ...item, subSteps: newSubs, completed: allDone };
    }));
  };

  // Toggle checklist item expanded/collapsed
  const toggleExpandedStep = (id: string) => {
    setExpandedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Simulated USDC Payment Verification
  const handleSimulatePayment = async () => {
    setIsVerifyingPayment(true);
    try {
      const response = await fetch('http://localhost:3001/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('') }),
      });

      if (!response.ok) throw new Error('Payment verification failed');
      const data = await response.json();

      if (data.success) {
        setPaymentToken(data.paymentToken);
        setPaymentVerified(true);
        // Automatically check off temporary housing and registration steps or give encouragement
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `🎉 **Simulated USDC payment verified successfully!** Your personalized Relocation Pack is now unlocked. You can now download your pre-filled administrative form in the panel on your right!` }
        ]);
      }
    } catch (e) {
      console.error(e);
      alert('Error verifying simulated transaction.');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  // Download filled PDF
  const handleDownloadPDF = async () => {
    if (!paymentToken || !profile) return;
    setDownloading(true);

    try {
      const response = await fetch('http://localhost:3001/api/form/fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentToken,
          profile,
        }),
      });

      if (!response.ok) throw new Error('Form filling endpoint failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Anmeldung_${profile.firstName}_${profile.lastName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to generate and download PDF document.');
    } finally {
      setDownloading(false);
    }
  };

  // Inline payment card rendered inside a chat bubble
  const InlinePaymentWidget = () => {
    if (paymentVerified) {
      return (
        <div className="inline-payment-card">
          <div className="unlocked-banner-inline">
            <div className="unlocked-text"><IconUnlock /> Relocation Pack Unlocked</div>
            <button onClick={handleDownloadPDF} className="btn btn-success btn-sm" disabled={downloading}>
              {downloading ? <div className="spinner" /> : <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconDownload /> Download PDF</span>}
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="inline-payment-card">
        <div className="premium-content-inline">
          <div className="premium-title" style={{ fontSize: '14px' }}>
            <IconLock /> Unlock Pre-filled Anmeldung PDF
          </div>
          <div className="premium-desc">Instantly generate and download your personalized address registration form.</div>
        </div>
        <div className="premium-action-row">
          <div className="usdc-price" style={{ fontSize: '18px' }}>
            1.00 <span className="usdc-logo">$</span>
          </div>
          <button onClick={handleSimulatePayment} className="btn btn-premium btn-sm" disabled={isVerifyingPayment}>
            {isVerifyingPayment ? <div className="spinner" /> : 'Simulate 1 USDC'}
          </button>
        </div>
      </div>
    );
  };

  // Parse markdown-like content to HTML for assistant bubbles
  const renderMessageContent = (content: string) => {
    // Split on [PAYMENT_WIDGET] token to interleave the widget
    const segments = content.split('[PAYMENT_WIDGET]');
    return segments.flatMap((segment, segIdx) => {
      const lines = segment.split('\n').map((line, idx) => {
        const key = `${segIdx}-${idx}`;
        if (line.startsWith('### ')) return <h3 key={key}>{line.replace('### ', '')}</h3>;
        if (line.includes('**')) {
          const parts = line.split('**');
          return <p key={key}>{parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}</p>;
        }
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return <li key={key}>{line.trim().replace(/^[-*]\s+/, '')}</li>;
        }
        if (/^\d+\.\s+/.test(line.trim())) {
          return <li key={key} style={{ listStyleType: 'decimal' }}>{line.trim().replace(/^\d+\.\s+/, '')}</li>;
        }
        return line.trim() ? <p key={key}>{line}</p> : <div key={key} style={{ height: '8px' }} />;
      });
      // After every segment except the last, insert payment widget
      if (segIdx < segments.length - 1) {
        lines.push(<InlinePaymentWidget key={`widget-${segIdx}`} />);
      }
      return lines;
    });
  };

  // Progress percentage calculation
  const completedCount = checklist.filter(i => i.completed).length;
  const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  // 1. Render Welcome Profile form if profile is not set
  if (!profile) {
    return (
      <div className="welcome-container">
        <h2 className="welcome-title">🇩🇪 ReloGate AI</h2>
        <p className="welcome-subtitle">
          Your intelligent assistant for relocating to Germany. Seamlessly manage your paperwork, check off bureaucratic milestones, and pre-fill address registration forms with secure mock USDC commerce.
        </p>

        <form onSubmit={handleProfileSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Jane"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-input"
                value={formData.birthdate}
                onChange={e => setFormData({ ...formData, birthdate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nationality</label>
              <input
                type="text"
                className="form-input"
                value={formData.nationality}
                onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                placeholder="United States"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Target City in Germany</label>
              <select
                className="form-input"
                value={formData.targetCity}
                onChange={e => setFormData({ ...formData, targetCity: e.target.value })}
              >
                <option value="Berlin">Berlin</option>
                <option value="Munich">Munich</option>
                <option value="Frankfurt">Frankfurt</option>
                <option value="Hamburg">Hamburg</option>
                <option value="Düsseldorf">Düsseldorf</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Visa Category</label>
              <select
                className="form-input"
                value={formData.visaStatus}
                onChange={e => setFormData({ ...formData, visaStatus: e.target.value })}
              >
                <option value="Employment">Employment (Worker)</option>
                <option value="EU Blue Card">EU Blue Card (High Income)</option>
                <option value="Student">Student Visa</option>
                <option value="Job Seeker">Job Seeker</option>
                <option value="Freelance">Freelance / Self-employed</option>
                <option value="EU Citizen">EU Citizen (No Visa Required)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Planned Relocation Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.relocationDate}
              onChange={e => setFormData({ ...formData, relocationDate: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '12px' }}>
            Initialize Relocation Workspace
          </button>
        </form>
      </div>
    );
  }

  // 2. Render Main Split Screen Layout
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          ReloGate AI
          <span className="logo-badge">Amoy Mock USDC</span>
        </div>
        <div className="header-status">
          <span className="status-dot active"></span>
          Assistant Online
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="app-layout">
        
        {/* LEFT PANEL: Chat Assistant */}
        <section className="chat-panel">
          <div className="chat-header">
            <div className="agent-avatar"><IconSparkles /></div>
            <div>
              <div className="agent-name">ReloGate Assistant</div>
              <div className="agent-role">Tavily Grounded &bull; Gemini 2.5</div>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-bubble ${msg.role}`}>
                <div className="message-content">
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-bubble assistant">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-bar">
            <div className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder={`Ask about registration, health insurance, or renting in ${profile.targetCity}...`}
                disabled={isTyping}
              />
            </div>
            <button type="submit" className="chat-submit-btn" disabled={isTyping}>
              <IconSend />
            </button>
          </form>
        </section>

        {/* RIGHT PANEL: Workspace checklist & Commerce */}
        <section className="workspace-panel">
          
          {/* Profile Card */}
          <div className="panel-card">
            <div className="card-header">
              <h3 className="card-title">
                <IconUser />
                Relocation Profile
              </h3>
            </div>
            <div className="profile-pill-container">
              <span className="profile-pill">Name: <strong>{profile.firstName} {profile.lastName}</strong></span>
              <span className="profile-pill">From: <strong>{profile.nationality}</strong></span>
              <span className="profile-pill">Destination: <strong>{profile.targetCity}</strong></span>
              <span className="profile-pill">Visa: <strong>{profile.visaStatus}</strong></span>
              <span className="profile-pill">Date: <strong>{profile.relocationDate}</strong></span>
            </div>
          </div>

          {/* Payment status strip — only shows after payment, compact reminder */}
          {paymentVerified && (
            <div className="unlocked-banner" style={{ margin: '0' }}>
              <div className="unlocked-text"><IconUnlock /> Anmeldung Pack Unlocked</div>
              <button onClick={handleDownloadPDF} className="btn btn-success btn-sm" disabled={downloading}>
                {downloading ? <div className="spinner" /> : <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconDownload /> Download PDF</span>}
              </button>
            </div>
          )}

          {/* Relocation Checklist — collapsible with sub-steps */}
          <div className="panel-card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <h3 className="card-title">Checklist Progress</h3>
              <span className="logo-badge">{progressPercent}% Done</span>
            </div>

            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>

            <div className="checklist-list" style={{ overflowY: 'auto', flex: 1, marginTop: '12px' }}>
              {checklist.map(item => {
                const isExpanded = !!expandedSteps[item.id];
                return (
                  <div key={item.id} className={`checklist-item ${item.completed ? 'completed' : ''}`} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>
                    <div className="checklist-item-header">
                      <div className="checklist-item-header-left">
                        <div
                          className={`checklist-checkbox ${item.completed ? 'checked' : ''}`}
                          onClick={() => toggleChecklistItem(item.id)}
                        >
                          {item.completed && <IconCheck />}
                        </div>
                        <div className="checklist-item-content">
                          <span className="checklist-item-title">{item.title}</span>
                          <span className="checklist-item-desc">{item.description}</span>
                        </div>
                      </div>
                      <div className="checklist-chevron" onClick={() => toggleExpandedStep(item.id)}>
                        <IconChevron isOpen={isExpanded} />
                      </div>
                    </div>

                    {isExpanded && item.subSteps && item.subSteps.length > 0 && (
                      <div className="checklist-item-body">
                        <div className="substeps-list">
                          {item.subSteps.map(sub => (
                            <div key={sub.id} className={`substep-item ${sub.completed ? 'completed' : ''}`}>
                              <div
                                className={`substep-checkbox ${sub.completed ? 'checked' : ''}`}
                                onClick={() => toggleSubStep(item.id, sub.id)}
                              >
                                {sub.completed && <IconCheck />}
                              </div>
                              {sub.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expert Tips */}
          {recommendations && (
            <div className="panel-card">
              <h3 className="card-title">Expert Tips for Germany</h3>
              <ul className="tips-list">
                {recommendations.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

        </section>

      </main>
    </div>
  );
}
