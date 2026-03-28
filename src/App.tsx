/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Info, 
  Users, 
  Cpu, 
  BookOpen, 
  MessageSquare, 
  X, 
  Send, 
  ChevronRight, 
  ExternalLink,
  RefreshCw,
  Newspaper,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { verifyNews, chatWithAI, NewsVerificationResult } from './services/geminiService';

// --- Constants & Mock Data ---

const DUMMY_NEWS_SAMPLES = [
  "NASA discovers a new planet made entirely of diamonds in a nearby star system.",
  "Scientists have successfully reversed aging in mice using a new gene therapy.",
  "A small town in Italy is offering houses for $1 to attract new residents.",
  "World leaders agree on a global ban of all single-use plastics by 2030.",
  "New study suggests that drinking coffee can increase your lifespan by 10 years."
];

const EXAMPLE_NEWS = [
  {
    type: "Real",
    headline: "India's ISRO successfully launches 36 satellites into orbit.",
    body: "The Indian Space Research Organisation (ISRO) has successfully placed 36 satellites of the OneWeb constellation into their intended orbits using its heaviest rocket, the LVM3.",
    category: "Science & Tech"
  },
  {
    type: "Fake",
    headline: "Drinking hot water with lemon cures COVID-19 instantly.",
    body: "A viral message claims that drinking hot water with lemon can kill the coronavirus and cure the infection immediately. This claim has no scientific basis and is not recommended by health experts.",
    category: "Health"
  },
  {
    type: "Real",
    headline: "Global temperatures reach record high in 2023.",
    body: "NASA and NOAA have confirmed that 2023 was the warmest year on record since global records began in 1880, primarily due to human-induced climate change and the El Niño weather pattern.",
    category: "Environment"
  },
  {
    type: "Fake",
    headline: "Free iPhones being distributed by major tech company to celebrate anniversary.",
    body: "A social media post claims that a leading tech giant is giving away 10,000 free iPhones to anyone who shares their post and clicks on a suspicious link. This is a common phishing scam.",
    category: "Technology"
  }
];

const LATEST_NEWS_MOCK = [
  { source: "The Hindu", title: "Supreme Court stays implementation of new farm laws.", link: "#" },
  { source: "TOI", title: "India's GDP growth projected at 7.2% for the current fiscal year.", link: "#" },
  { source: "The Telegraph", title: "New archaeological discovery in West Bengal reveals ancient trade routes.", link: "#" },
  { source: "CNN", title: "Global leaders gather for climate summit in Glasgow.", link: "#" },
  { source: "News-18", title: "Major breakthrough in cancer research using AI technology.", link: "#" }
];

const DEVELOPERS = [
  { name: "Arpan Choudhury", role: "MTech-CSAI, Vidyasagar University" },
  { name: "Ritwik Acharya", role: "MTech-CSAI, Vidyasagar University" },
  { name: "Ujjal Das", role: "MCA, Vidyasagar University" }
];

const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// --- Components ---

const FloatingAlphabets = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="floating-alphabet"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 2 + 1}rem`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 5}s`
          }}
        >
          {ALPHABETS[Math.floor(Math.random() * ALPHABETS.length)]}
        </div>
      ))}
    </div>
  );
};

const NavBar = () => {
  return (
    <div className="w-full bg-sea-green/10 backdrop-blur-md border-b border-sea-green/20 py-2 overflow-hidden sticky top-0 z-50">
      <div className="flex whitespace-nowrap animate-marquee hover:pause">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="mx-8 text-sea-green font-bold tracking-widest uppercase text-xs">
            Authentic Samachar AI • Real-Time News Verification • Powered by Gemini Flash • Stay Informed • Fight Fake News •
          </span>
        ))}
      </div>
    </div>
  );
};

const ChatBot = ({ context }: { context?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hello! I'm your Authentic Samachar AI assistant. How can I help you verify news today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const aiResponse = await chatWithAI(userMsg, context);
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col border border-sea-green/20 mb-4 overflow-hidden"
          >
            <div className="bg-sea-green p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <MessageSquare size={20} />
                <span className="font-bold">AI Support</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
                <X size={20} />
              </button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-light-sea-green/30">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm",
                    msg.role === 'user' ? "bg-sea-green text-white rounded-tr-none" : "bg-white text-gray-800 shadow-sm rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-sea-green rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-sea-green rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-sea-green rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-2 bg-white">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sea-green/50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-sea-green text-white p-2 rounded-full hover:bg-sea-green/90 disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-sea-green text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
      >
        <MessageSquare />
      </button>
    </div>
  );
};

export default function App() {
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<NewsVerificationResult | null>(null);
  const [dummyIndex, setDummyIndex] = useState(0);
  const [placeholder, setPlaceholder] = useState("");

  // Rotating dummy news in placeholder
  useEffect(() => {
    let charIndex = 0;
    const currentNews = DUMMY_NEWS_SAMPLES[dummyIndex];
    
    const typingInterval = setInterval(() => {
      if (charIndex <= currentNews.length) {
        setPlaceholder("Example: " + currentNews.substring(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setDummyIndex((prev) => (prev + 1) % DUMMY_NEWS_SAMPLES.length);
        }, 2000);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [dummyIndex]);

  const handleVerify = async () => {
    if (!headline.trim() && !body.trim()) return;
    setIsVerifying(true);
    setResult(null);
    try {
      const res = await verifyNews(headline, body);
      setResult(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const useExample = (ex: typeof EXAMPLE_NEWS[0]) => {
    setHeadline(ex.headline);
    setBody(ex.body);
    setResult(null);
  };

  return (
    <div className="relative z-10">
      <FloatingAlphabets />
      <NavBar />
      <ChatBot context={result ? `The news being verified is: ${headline}. AI classified it as ${result.isReal ? 'Real' : 'Fake'}. Reasoning: ${result.reasoning}` : undefined} />

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-sea-green tracking-tighter"
          >
            AUTHENTIC SAMACHAR AI
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Empowering you with AI-driven truth. Verify any news instantly using our advanced deep-thinking models.
          </motion.p>
        </section>

        {/* Verification Section */}
        <section id="verify" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50 space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-sea-green uppercase tracking-wider">News Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-light-sea-green/50 border border-sea-green/20 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-sea-green/50 transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-bold text-sea-green uppercase tracking-wider">News Body / Content</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  placeholder="Paste the full news content here for better analysis..."
                  className="w-full bg-light-sea-green/50 border border-sea-green/20 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-sea-green/50 transition-all resize-none"
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={isVerifying || (!headline.trim() && !body.trim())}
                className="w-full bg-reddish-brown text-white font-bold py-5 rounded-xl hover:bg-reddish-brown/90 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="animate-spin" />
                    Verifying with AI Intelligence...
                  </>
                ) : (
                  <>
                    <ShieldCheck />
                    Verify News Authenticity
                  </>
                )}
              </button>
            </div>

            {/* Result Section */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "rounded-3xl p-8 shadow-2xl border-4",
                    result.isReal ? "bg-green-50 border-green-500/30" : "bg-red-50 border-red-500/30"
                  )}
                >
                  <div className="flex items-start gap-6">
                    <div className={cn(
                      "p-4 rounded-2xl",
                      result.isReal ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    )}>
                      {result.isReal ? <ShieldCheck size={40} /> : <ShieldAlert size={40} />}
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="flex justify-between items-center">
                        <h2 className={cn(
                          "text-3xl font-black uppercase tracking-tighter",
                          result.isReal ? "text-green-700" : "text-red-700"
                        )}>
                          {result.isReal ? "Likely Real News" : "Likely Fake News"}
                        </h2>
                        <span className="text-sm font-bold px-3 py-1 bg-white/50 rounded-full border border-black/5">
                          Confidence: {(result.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="prose prose-sm max-w-none text-gray-700">
                        <div className="markdown-body">
                          <ReactMarkdown>{result.reasoning}</ReactMarkdown>
                        </div>
                      </div>
                      {result.sources && result.sources.length > 0 && (
                        <div className="pt-4 border-t border-black/5">
                          <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Recommended Sources for Verification:</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.sources.map((s, i) => (
                              <span key={i} className="text-xs bg-white px-3 py-1 rounded-full border border-black/5 text-gray-600 flex items-center gap-1">
                                <ExternalLink size={10} /> {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar: Latest News & Examples */}
          <div className="space-y-8">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/50">
              <h3 className="text-lg font-bold text-sea-green mb-4 flex items-center gap-2">
                <Newspaper size={20} /> Latest News Feed
              </h3>
              <div className="space-y-4">
                {LATEST_NEWS_MOCK.map((news, i) => (
                  <div key={i} className="group cursor-pointer">
                    <span className="text-[10px] font-bold text-reddish-brown uppercase">{news.source}</span>
                    <p className="text-sm font-medium group-hover:text-sea-green transition-colors line-clamp-2">{news.title}</p>
                    <div className="h-px bg-gray-100 mt-3" />
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-xs font-bold text-sea-green hover:underline flex items-center justify-center gap-1">
                View More News <ChevronRight size={14} />
              </button>
            </div>

            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/50">
              <h3 className="text-lg font-bold text-sea-green mb-4 flex items-center gap-2">
                <BookOpen size={20} /> Test Examples
              </h3>
              <div className="space-y-3">
                {EXAMPLE_NEWS.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => useExample(ex)}
                    className="w-full text-left p-3 rounded-xl bg-light-sea-green/30 hover:bg-light-sea-green/50 transition-all border border-transparent hover:border-sea-green/20"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        ex.type === "Real" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {ex.type}
                      </span>
                      <span className="text-[10px] text-gray-400">{ex.category}</span>
                    </div>
                    <p className="text-xs font-semibold line-clamp-1">{ex.headline}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Model Architecture Section */}
        <section className="space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-black text-sea-green uppercase tracking-tighter">Model Architecture</h2>
            <p className="text-gray-500">How Authentic Samachar AI processes your news</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-sea-green/10 text-center space-y-3">
              <div className="w-12 h-12 bg-sea-green/10 text-sea-green rounded-full flex items-center justify-center mx-auto">
                <Search />
              </div>
              <h4 className="font-bold text-sm">Input Layer</h4>
              <p className="text-xs text-gray-500">Headline & Body text ingestion</p>
            </div>
            <div className="hidden md:flex justify-center text-sea-green">
              <ChevronRight />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-sea-green/10 text-center space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 bg-sea-green text-white text-[8px] font-bold uppercase">Gemini Flash</div>
              <div className="w-12 h-12 bg-sea-green/10 text-sea-green rounded-full flex items-center justify-center mx-auto">
                <Cpu />
              </div>
              <h4 className="font-bold text-sm">Processing Engine</h4>
              <p className="text-xs text-gray-500">Deep-Thinking LLM Analysis & Fact-Checking</p>
            </div>
            <div className="hidden md:flex justify-center text-sea-green">
              <ChevronRight />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-sea-green/10 text-center space-y-3">
              <div className="w-12 h-12 bg-sea-green/10 text-sea-green rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck />
              </div>
              <h4 className="font-bold text-sm">Output Layer</h4>
              <p className="text-xs text-gray-500">Classification & Detailed Reasoning</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-sea-green text-white rounded-[3rem] p-12 shadow-2xl space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-black uppercase tracking-tighter">Why Authentic Samachar AI?</h2>
            <p className="text-sea-green-100 opacity-80">Our advantages over SOTA and existing research models</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle2 />
              </div>
              <h4 className="text-xl font-bold">Real-Time Analysis</h4>
              <p className="text-sm opacity-80">Unlike static models, we use Gemini's live intelligence to cross-reference with the latest global events.</p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <AlertTriangle />
              </div>
              <h4 className="text-xl font-bold">Explainable AI (XAI)</h4>
              <p className="text-sm opacity-80">We don't just give a label; we provide a deep-thinking reasoning process that explains WHY news is flagged.</p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Users />
              </div>
              <h4 className="text-xl font-bold">Zero-Cost Scalability</h4>
              <p className="text-sm opacity-80">Optimized for high-volume requests using Gemini Flash, ensuring unlimited free usage for the community.</p>
            </div>
          </div>
        </section>

        {/* User Guide Section */}
        <section className="space-y-8">
          <h2 className="text-3xl font-black text-sea-green text-center uppercase tracking-tighter">User Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Input News", desc: "Copy and paste the headline and body of the news you want to verify." },
              { step: "02", title: "Click Verify", desc: "Hit the reddish-brown 'Verify News' button to start the AI analysis." },
              { step: "03", title: "Review Reason", desc: "Read the detailed reasoning and check the suggested sources for confirmation." }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <span className="text-4xl font-black text-sea-green/20">{item.step}</span>
                <h4 className="text-xl font-bold text-gray-800">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Developer Section */}
        <section className="text-center space-y-8">
          <h2 className="text-3xl font-black text-sea-green uppercase tracking-tighter">Meet the Developers</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {DEVELOPERS.map((dev, i) => (
              <div key={i} className="bg-white/40 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-sm min-w-[250px]">
                <h4 className="text-xl font-bold text-reddish-brown">{dev.name}</h4>
                <p className="text-sm text-gray-600">{dev.role}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-white/50 backdrop-blur-md py-12 border-t border-sea-green/10">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
          <p className="text-sea-green font-black text-2xl tracking-tighter">AUTHENTIC SAMACHAR AI</p>
          <p className="text-xs text-gray-400">© 2026 Vidyasagar University CSAI Team. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-gray-400">
            <a href="#" className="hover:text-sea-green transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-sea-green transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-sea-green transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
