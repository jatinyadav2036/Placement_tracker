// import { useState, useRef, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Send, Zap, Bot, User, Trash2, Copy, CheckCheck } from 'lucide-react'
// import ReactMarkdown from 'react-markdown'
// import toast from 'react-hot-toast'
// import { aiAPI } from '../services/api'

// const SUGGESTIONS = [
//   'How do I improve my ATS score?',
//   'Give me a 4-week DSA study plan',
//   'How to crack Google SDE-2 interview?',
//   'What skills should I learn for product roles?',
//   'Review my elevator pitch',
//   'Tips for negotiating salary package',
// ]

// function TypingIndicator() {
//   return (
//     <div className="flex gap-1 items-center px-4 py-3">
//       {[0, 0.2, 0.4].map((d, i) => (
//         <div key={i} className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
//       ))}
//     </div>
//   )
// }

// function MessageBubble({ msg }) {
//   const [copied, setCopied] = useState(false)
//   const isUser = msg.role === 'user'

//   const copy = () => {
//     navigator.clipboard.writeText(msg.content)
//     setCopied(true)
//     setTimeout(() => setCopied(false), 2000)
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
//     >
//       <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-brand-500' : 'bg-gradient-to-br from-cyan-500 to-brand-600'}`}>
//         {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
//       </div>
//       <div className={`max-w-[78%] group relative`}>
//         <div className={`rounded-2xl px-4 py-3 ${isUser ? 'bg-brand-500/20 border border-brand-500/30 rounded-tr-sm' : 'glass-card rounded-tl-sm'}`}>
//           {isUser ? (
//             <p className="text-white text-sm leading-relaxed">{msg.content}</p>
//           ) : (
//             <div className="text-gray-200 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
//               <ReactMarkdown>{msg.content}</ReactMarkdown>
//             </div>
//           )}
//         </div>
//         <button onClick={copy}
//           className={`absolute ${isUser ? 'left-0 -translate-x-full pl-1' : 'right-0 translate-x-full pr-1'} top-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-300`}>
//           {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
//         </button>
//       </div>
//     </motion.div>
//   )
// }

// export default function Chatbot() {
//   const [messages, setMessages] = useState([
//     { role: 'assistant', content: `👋 Hey! I'm **PlaceIQ AI**, your smart placement assistant.\n\nI can help you with:\n- 📄 **Resume building** & ATS optimization\n- 🎯 **Interview preparation** & mock Q&A\n- 🗺️ **Skill roadmaps** for any role\n- 🏢 **Company-specific** prep tips\n- 💡 **DSA tips** and coding interview strategies\n\nWhat would you like to work on today?` }
//   ])
//   const [input, setInput] = useState('')
//   const [loading, setLoading] = useState(false)
//   const bottomRef = useRef(null)
//   const inputRef = useRef(null)

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages, loading])

//   const send = async (text) => {
//     const content = text || input.trim()
//     if (!content || loading) return
//     setInput('')
//     const newMessages = [...messages, { role: 'user', content }]
//     setMessages(newMessages)
//     setLoading(true)
//     try {
//       const res = await aiAPI.chat(newMessages.map(m => ({ role: m.role, content: m.content })))
//       setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }])
//     } catch (e) {
//       setMessages(prev => [...prev, { role: 'assistant', content: '❌ Sorry, I encountered an error. Please check your API key configuration.' }])
//     } finally {
//       setLoading(false)
//       inputRef.current?.focus()
//     }
//   }

//   const clear = () => {
//     setMessages([{ role: 'assistant', content: "Chat cleared! 🔄 How can I help you today?" }])
//   }

//   return (
//     <div className="flex flex-col h-screen p-6 pb-0">
//       {/* Header */}
//       <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-brand-600 flex items-center justify-center shadow-neon-cyan">
//             <Bot className="w-5 h-5 text-white" />
//           </div>
//           <div>
//             <h1 className="font-display text-xl font-bold text-white">PlaceIQ AI Assistant</h1>
//             <div className="flex items-center gap-1.5">
//               <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
//               <span className="text-green-400 text-xs">Online & Ready</span>
//             </div>
//           </div>
//         </div>
//         <button onClick={clear} className="btn-ghost flex items-center gap-2 text-sm">
//           <Trash2 className="w-4 h-4" /> Clear
//         </button>
//       </motion.div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
//         {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
//         {loading && (
//           <div className="flex gap-3">
//             <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-brand-600 flex items-center justify-center flex-shrink-0">
//               <Bot className="w-4 h-4 text-white" />
//             </div>
//             <div className="glass-card rounded-2xl rounded-tl-sm">
//               <TypingIndicator />
//             </div>
//           </div>
//         )}
//         <div ref={bottomRef} />
//       </div>

//       {/* Suggestions */}
//       {messages.length <= 1 && (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3">
//           <p className="text-gray-600 text-xs mb-2">Quick suggestions:</p>
//           <div className="flex flex-wrap gap-2">
//             {SUGGESTIONS.map((s, i) => (
//               <button key={i} onClick={() => send(s)}
//                 className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-brand-500/40 transition-all duration-200">
//                 {s}
//               </button>
//             ))}
//           </div>
//         </motion.div>
//       )}

//       {/* Input */}
//       <div className="pb-6 pt-2">
//         <div className="flex gap-3 glass-card p-2 pl-4">
//           <input
//             ref={inputRef}
//             value={input}
//             onChange={e => setInput(e.target.value)}
//             onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
//             className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
//             placeholder="Ask me anything about placements, resume, interviews..."
//             disabled={loading}
//           />
//           <motion.button
//             onClick={() => send()}
//             disabled={!input.trim() || loading}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center disabled:opacity-30 shadow-neon-blue flex-shrink-0"
//           >
//             <Send className="w-4 h-4 text-white" />
//           </motion.button>
//         </div>
//         <p className="text-center text-gray-700 text-xs mt-2">Powered by Google Gemini AI • Responses may not always be accurate</p>
//       </div>
//     </div>
//   )
// }
