import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import SentEmailsPanel from "./components/SentEmailsPanel";

export default function App() {
  const [showEmails, setShowEmails] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [chats, setChats] = useState([
    { id: 1, title: "New Chat", messages: [] }
  ]);

  const [activeChatId, setActiveChatId] = useState(1);

  // Safely get active chat with a fallback
  const activeChat = chats.find(chat => chat.id === activeChatId) || chats[0];

  // Update activeChatId if active chat is deleted
  useEffect(() => {
    if (!chats.find(chat => chat.id === activeChatId) && chats.length > 0) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId]);

  // ✅ Create New Chat
  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: []
    };
    setChats(prev => [...prev, newChat]);
    setActiveChatId(newChat.id);
  };

  // ✅ Update Messages + Auto Title
  const updateMessages = (newMessages) => {
    // Ensure newMessages is always an array
    const messagesArray = Array.isArray(newMessages) ? newMessages : [];
    
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === activeChatId) {
          let updatedTitle = chat.title;

          // Auto-generate title from first user message
          if (chat.title === "New Chat" && messagesArray.length > 0) {
            // Find the first user message
            const firstUserMessage = messagesArray.find(msg => msg.role === "user");
            if (firstUserMessage && firstUserMessage.content) {
              updatedTitle = firstUserMessage.content
                .split(" ")
                .slice(0, 5)
                .join(" ")
                .substring(0, 30); // Limit title length
            }
          }

          return {
            ...chat,
            title: updatedTitle,
            messages: messagesArray
          };
        }
        return chat;
      })
    );
  };

  // Delete chat
  const deleteChat = (chatId) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);

    if (updatedChats.length === 0) {
      const newChat = { id: Date.now(), title: "New Chat", messages: [] };
      setChats([newChat]);
      setActiveChatId(newChat.id);
    } else {
      setChats(updatedChats);
      setActiveChatId(updatedChats[0].id);
    }
  };

  // Rename chat
  const renameChat = (chatId, newTitle) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
          ? { ...chat, title: newTitle }
          : chat
      )
    );
  };

  // Debug logging
  console.log("Active Chat Messages:", activeChat?.messages);
  console.log("Is Array:", Array.isArray(activeChat?.messages));

  return (
    <div className="h-screen bg-gray-100 relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        chats={chats}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        createNewChat={createNewChat}
        deleteChat={deleteChat}
        renameChat={renameChat}
        setShowEmails={setShowEmails}
      />

      {/* Main Chat Area */}
      <div
        className={`h-full transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <ChatWindow
          key={activeChatId} // Force remount when switching chats
          messages={activeChat?.messages || []}
          setMessages={updateMessages}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      <SentEmailsPanel
        show={showEmails}
        onClose={() => setShowEmails(false)}
      />
    </div>
  );
}