import { useState} from "react";
import menuIcon from "./assets/menu.png";

export default function ChatWindow({ messages, setMessages, toggleSidebar }) {
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const newMessages = [
      ...(Array.isArray(messages) ? messages : []),
      { role: "user", content: input },
      { role: "assistant", content: "Echo: " + input }
    ];
    
    setMessages(newMessages);
    setInput("");
  };

  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b bg-white">
        <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-100">
          <img src={menuIcon} alt="menu" className="w-10 h-10" />
        </button>
        <h2 className="font-semibold ml-2">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
        {safeMessages.length === 0 ? (
          <div className="text-center mt-20">
            <h1 className="text-4xl font-bold">Your AI Assistant</h1>
            <p className="text-gray-500 mt-4">Ask me anything!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {safeMessages.map((msg, i) => (
              <div key={i} className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white ml-auto' : 'bg-white'}`}>
                {msg.content}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 p-2 border rounded-lg"
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}