'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useA2UI } from '@/hooks/useA2UI';
import { A2UIRenderer } from '@/components/a2ui/A2UIRenderer';
import { A2UIAction, A2UIMessage } from '@/lib/a2ui/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  a2uiMessages?: A2UIMessage[];
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // A2UI 상태 관리
  const { surfaces, processMessages, handleDataChange, clearSurfaces } = useA2UI();

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, surfaces]);

  // 메시지 전송
  const sendMessage = useCallback(
    async (userMessage: string, action?: A2UIAction) => {
      if (!userMessage.trim() && !action) return;

      const newUserMessage: ChatMessage = {
        role: 'user',
        content: userMessage || `[액션: ${action?.actionId}]`,
      };

      setMessages((prev) => [...prev, newUserMessage]);
      setInput('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, newUserMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            action,
          }),
        });

        const data = await response.json();

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.content,
          a2uiMessages: data.a2uiMessages,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // A2UI 메시지 처리
        if (data.a2uiMessages && data.a2uiMessages.length > 0) {
          processMessages(data.a2uiMessages);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, processMessages]
  );

  // 액션 핸들링
  const handleAction = useCallback(
    (action: A2UIAction) => {
      console.log('Action triggered:', action);
      sendMessage('', action);
    },
    [sendMessage]
  );

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // 대화 초기화
  const handleClear = () => {
    setMessages([]);
    clearSurfaces();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Enhans</h1>
        <p className="text-sm text-gray-500 mb-6">
          A2UI 기반 AI 쇼핑 어시스턴트
        </p>
        <button
          onClick={handleClear}
          className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          새 대화 시작
        </button>

        <div className="mt-8">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            추천 질문
          </h3>
          <div className="space-y-2">
            {[
              '두바이 쫀득 쿠키 보여줘',
              '인기 상품 추천해줘',
              '선물용 세트 있어?',
            ].map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 메인 영역 */}
      <main className="flex-1 flex flex-col">
        {/* 헤더 */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            AI 쇼핑 어시스턴트
          </h2>
          <p className="text-sm text-gray-500">
            두바이 쫀득 쿠키를 주문해보세요!
          </p>
        </header>

        {/* 대화 영역 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍪</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  안녕하세요!
                </h3>
                <p className="text-gray-500">
                  두바이 쫀득 쿠키에 대해 물어보세요.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2'
                      : 'bg-white'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p>{message.content}</p>
                  ) : (
                    <div className="space-y-4">
                      {/* 텍스트 응답 표시 */}
                      {message.content && (
                        <p className="text-gray-700">{message.content}</p>
                      )}
                      {/* A2UI Surface가 있으면 렌더링 */}
                      {message.a2uiMessages &&
                      message.a2uiMessages.length > 0 && (
                        <A2UIRenderer
                          surfaces={surfaces}
                          onAction={handleAction}
                          onDataChange={handleDataChange}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 입력 영역 */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                전송
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}