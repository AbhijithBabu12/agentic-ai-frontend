import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import SentEmailsPanel from "./components/SentEmailsPanel";

export default function App() {
  const [sentEmails, setSentEmails] = useState([]);
  const [showEmails, setShowEmails] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [chats, setChats] = useState([
    { id: 1, title: "New Chat", messages: [] }
  ]);

  const [activeChatId, setActiveChatId] = useState(1);

  const activeChat =
  chats.find(chat => chat.id === activeChatId) || chats[0];

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
  const updateMessages = (messages) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === activeChatId) {

          let updatedTitle = chat.title;

          // Auto-generate title from first message
          if (chat.title === "New Chat" && messages.length > 0) {
            const firstMessage = messages[0].content;
            updatedTitle = firstMessage
              .split(" ")
              .slice(0, 5)
              .join(" ");
          }

          return {
            ...chat,
            title: updatedTitle,
            messages
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
  const renameChat = (chatId, newTitle) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
        ? { ...chat, title: newTitle }
        : chat
      )
    );
  };
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
          messages={activeChat?.messages || []}
          setMessages={updateMessages}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          setSentEmails = {setSentEmails}
        />
      </div>

      <SentEmailsPanel
        show={showEmails}
        onClose={() => setShowEmails(false)}
        sentEmails = {sentEmails}
      />
    </div>
  );
}