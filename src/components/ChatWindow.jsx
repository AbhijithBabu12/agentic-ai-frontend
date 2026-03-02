import { useRef } from "react";
import Landing from "./Landing";
import MessageInput from "./MessageInput";
import menuIcon from "../assets/menu.png";

export default function ChatWindow({ messages, setMessages, toggleSidebar }) {

  const messageInputRef = useRef(null);

  const handleQuickAction = (text) => {
    messageInputRef.current?.sendExternalMessage(text);
  };

  // Safely handle messages - ensure it's an array
  const safeMessages = Array.isArray(messages) ? messages : [];
  
  // Also ensure setMessages is a function (for debugging)
  if (typeof setMessages !== 'function') {
    console.error('setMessages is not a function:', setMessages);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center p-4 border-b bg-white">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <img
            src={menuIcon}
            alt="menu"
            className="w-10 h-10 rounded-full object-cover shadow-sm"
          />
        </button>
        <h2 className="font-semibold text-gray-700 ml-2">
          Chat
        </h2>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
        {safeMessages.length === 0 ? (
          <Landing onQuickAction={handleQuickAction} />
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {safeMessages.map((msg, index) => (
              <div
                key={index}
                className={`px-4 py-3 rounded-2xl w-fit max-w-xl ${
                  msg && msg.role === "user"
                    ? "bg-indigo-600 text-white ml-auto"
                    : "bg-white shadow"
                }`}
              >
                {msg && msg.typing ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></span>
                    <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
                    <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-300"></span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">
                    {msg && msg.content ? 
                      (typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)) 
                      : 'No content'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t">
        <MessageInput
          ref={messageInputRef}
          setMessages={setMessages}
          messages={safeMessages}
        />
      </div>
    </div>
  );
}