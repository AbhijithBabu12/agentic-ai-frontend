import { useRef } from "react";
import Landing from "./Landing";
import MessageInput from "./MessageInput";
import menuIcon from "../assets/menu.png";

export default function ChatWindow({ messages, setMessages, toggleSidebar }) {

  const messageInputRef = useRef(null);

  const handleQuickAction = (text) => {
    messageInputRef.current?.sendExternalMessage(text);
  };

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
        <h2 className="font-semibold text-gray-700">
          Chat
        </h2>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-100">

        {messages.length === 0 ? (
          <Landing onQuickAction={handleQuickAction} />
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`px-4 py-3 rounded-2xl w-fit max-w-xl ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white ml-auto"
                    : "bg-white shadow"
                }`}
              >
                {msg.typing ? (
  <div className="flex items-center gap-2">
    <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></span>
    <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
    <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-300"></span>
  </div>

  ) : msg.type === "email" ? (
  <div className="space-y-3">

    <p className="text-sm text-gray-500">
      To: {msg.emailData.to}
    </p>

    <p className="font-semibold">
      Subject: {msg.emailData.subject}
    </p>

    <div className="whitespace-pre-wrap text-gray-700">
      {msg.emailData.body}
    </div>

    <div className="flex gap-3 pt-3">

      {/* SEND */}
      <button
        onClick={async () => {

          await fetch(`${import.meta.env.VITE_BACKEND_URL}/send-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: msg.emailData.to,
              subject: msg.emailData.subject,
              body: msg.emailData.body
            })
          });

          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: "✅ Email sent successfully!"
            }
          ]);

        }}
        className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700"
      >
        Send
      </button>

      {/* EDIT */}
      <button
        onClick={async () => {

          setMessages(prev => [
            ...prev,
            { role: "assistant", typing: true }
          ]);

          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/edit-email`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                original_body: msg.emailData.body,
                edit_instruction: "Improve this email and make it more polished"
              })
            }
          );

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          let updated = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            updated += decoder.decode(value, { stream: true });

            setMessages(prev => [
              ...prev.slice(0, -1),
              {
                role: "assistant",
                type: "email",
                emailData: {
                  ...msg.emailData,
                  body: updated
                }
              }
            ]);
          }

        }}
        className="bg-gray-200 px-4 py-2 rounded-xl hover:bg-gray-300"
      >
        Improve
      </button>

    </div>
  </div>

) : (
  msg.content
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
          messages={messages}
        />
      </div>

    </div>
  );
}
