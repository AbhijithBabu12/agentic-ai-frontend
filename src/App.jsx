import { useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 transition-all duration-300">
          <Sidebar />
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 transition-all duration-300">
        <ChatWindow
          messages={messages}
          setMessages={setMessages}
          toggleSidebar={toggleSidebar}
        />
      </div>

    </div>
  );
}