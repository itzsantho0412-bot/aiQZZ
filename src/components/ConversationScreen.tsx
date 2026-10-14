import React, { useState } from 'react';
import {
  ArrowLeft,
  Send,
  Mic,
  Volume2,
  VolumeX,
  CheckCircle2,
  Circle,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import { ChatMessage, VoiceCostumeSettings } from '../types';

interface ConversationScreenProps {
  onBack: () => void;
  onOpenVoiceAssistant: () => void;
  activeCostume: VoiceCostumeSettings;
  onSpeakText: (text: string) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  initialQuery?: string;
}

export const ConversationScreen: React.FC<ConversationScreenProps> = ({
  onBack,
  onOpenVoiceAssistant,
  activeCostume,
  onSpeakText,
  isSpeaking,
  onStopSpeaking,
  initialQuery,
}) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'user',
      text: initialQuery || 'What should I do today?',
      timestamp: '9:41 AM',
    },
    {
      id: 'msg-2',
      sender: 'helios',
      text: "Alright Santosh! Here's your today's plan.",
      timestamp: '9:41 AM',
      checklist: [
        { label: 'Attend college (9:00 AM - 1:00 PM)', checked: true },
        { label: 'Work on 3D printing business (2:00 PM - 5:00 PM)', checked: false },
        { label: 'Gym / Workout (6:00 PM)', checked: false },
        { label: 'Call client Siva (7:00 PM)', checked: false },
        { label: 'Learn something new & Gita study (1 hour)', checked: false },
      ],
      quoteNote: "Remember, progress is better than perfection. Let's make it count!",
    },
  ]);

  const handleToggleCheck = (msgId: string, itemIdx: number) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId && msg.checklist) {
          const updated = [...msg.checklist];
          updated[itemIdx] = {
            ...updated[itemIdx],
            checked: !updated[itemIdx].checked,
          };
          return { ...msg, checklist: updated };
        }
        return msg;
      })
    );
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userText = inputText.trim();
    setInputText('');

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Just now',
    };

    // Generate intelligent growth response based on topic
    let replyText = "Understood, Santosh. I've logged this into your growth roadmap.";
    let checklist: { label: string; checked: boolean }[] | undefined;
    let quoteNote = "Stay disciplined today for freedom tomorrow.";

    const lower = userText.toLowerCase();
    if (lower.includes('gita') || lower.includes('sloka') || lower.includes('duty')) {
      replyText =
        'Chapter 2, Verse 47 guides you: "Karmanye vadhikaraste ma phaleshu kadachana". Focus fully on the craft, detach from anxious results.';
      quoteNote = 'Perform your work with serene detachment.';
    } else if (lower.includes('gym') || lower.includes('workout')) {
      replyText = 'Workout locked for 6:30 PM. Focus on consistent progressive overload today.';
      checklist = [
        { label: 'Pre-workout hydration & stretching', checked: true },
        { label: 'Main lifts (45 mins)', checked: false },
        { label: 'Cool-down & post-workout nutrition', checked: false },
      ];
    } else if (lower.includes('3d') || lower.includes('business') || lower.includes('client')) {
      replyText =
        'For your 3D printing business: client Siva expects the product review by 7:00 PM.';
      checklist = [
        { label: 'Inspect print bed temperature & nozzle', checked: true },
        { label: 'Prepare prototype photos for client Siva', checked: false },
        { label: 'Send invoice and delivery timeline', checked: false },
      ];
    }

    const aiMsg: ChatMessage = {
      id: `msg-ai-${Date.now()}`,
      sender: 'helios',
      text: replyText,
      timestamp: 'Just now',
      checklist,
      quoteNote,
    };

    setMessages((prev) => [...prev, newMsg, aiMsg]);

    // Automatically speak the response using the active voice costume!
    onSpeakText(replyText);
  };

  const handlePlayAiMessage = (msg: ChatMessage) => {
    if (isSpeaking) {
      onStopSpeaking();
    } else {
      const fullSpeech = `${msg.text}. ${msg.quoteNote || ''}`;
      onSpeakText(fullSpeech);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-between pb-20 text-white">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Back"
            className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border border-orange-500 bg-black flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              </div>
              <h2 className="text-sm font-bold tracking-wider text-white">HELIOZ AI</h2>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-emerald-400 font-medium">Online</span>
              <span className="text-zinc-600">·</span>
              <span className="text-[10px] text-amber-400 font-medium flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                {activeCostume.name}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenVoiceAssistant}
          className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 hover:bg-amber-500/20"
        >
          <Mic className="w-4 h-4" />
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 px-1">
                <span>{isUser ? 'You' : 'HELIOZ AI'}</span>
                <span>·</span>
                <span>{msg.timestamp}</span>
              </div>

              {isUser ? (
                // User Bubble
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-zinc-800 border border-zinc-700/60 px-4 py-2.5 text-xs text-zinc-100 font-medium leading-relaxed">
                  {msg.text}
                </div>
              ) : (
                // AI Response Card matching the image
                <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-zinc-950 border border-zinc-800/90 p-4 space-y-3.5 shadow-lg">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-zinc-100 leading-relaxed">
                      {msg.text}
                    </p>
                    <button
                      onClick={() => handlePlayAiMessage(msg)}
                      title="Speak with active voice costume"
                      className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 shrink-0"
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Checklist items */}
                  {msg.checklist && (
                    <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                      {msg.checklist.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleToggleCheck(msg.id, idx)}
                          className="w-full flex items-center gap-2.5 text-left text-xs py-1 group"
                        >
                          {item.checked ? (
                            <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 fill-orange-500/20" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-600 shrink-0 group-hover:text-zinc-400" />
                          )}
                          <span
                            className={`${
                              item.checked
                                ? 'line-through text-zinc-500'
                                : 'text-zinc-200 group-hover:text-white'
                            }`}
                          >
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quote note card */}
                  {msg.quoteNote && (
                    <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-3 text-[11px] text-zinc-300 italic border-l-2 border-l-orange-500">
                      "{msg.quoteNote}"
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Input Field matching the screenshot */}
      <div className="sticky bottom-16 z-20 bg-black/95 border-t border-zinc-800/80 p-3 max-w-lg mx-auto w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            aria-label="Attach file"
            className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
          />

          <button
            type="button"
            onClick={onOpenVoiceAssistant}
            aria-label="Voice Input"
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-black flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] shrink-0 active:scale-95"
          >
            <Mic className="w-4 h-4 text-black" />
          </button>

          {inputText.trim() && (
            <button
              type="submit"
              className="w-9 h-9 rounded-full bg-amber-500 text-black flex items-center justify-center shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
