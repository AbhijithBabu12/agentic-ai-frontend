import { useRef, useCallback } from "react";
import Landing from "./Landing";
import MessageInput from "./MessageInput";
import menuIcon from "../assets/menu.png";

export default function ChatWindow({ messages, setMessages, toggleSidebar }) {

  const messageInputRef = useRef(null);

  const handleQuickAction = (text) => {
    messageInputRef.current?.sendExternalMessage(text);
  };

  const handleCancel = useCallback((messageId) => {
    // Remove the email message from the chat using a unique identifier
    setMessages(prev => prev.filter((_, index) => index !== messageId));
  }, [setMessages]);

  const handleSend = useCallback(async (emailData, messageIndex) => {
    try {
      // Validate email data
      const recipient = emailData.to || emailData.recipient_email;
      if (!recipient) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "❌ No recipient email address found" }
        ]);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: recipient,
            subject: emailData.subject || "No Subject",
            body: emailData.body || ""
          })
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: `❌ Send failed: ${responseData.error || response.statusText}` }
        ]);
        return;
      }

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "✅ Email sent successfully!" }
      ]);
    } catch (error) {
      console.error("Send error:", error);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "❌ Send failed: Network error. Please check your connection." }
      ]);
    }
  }, [setMessages]);

  const handleImprove = useCallback(async (emailData, messageIndex) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/edit-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            original_body: emailData.body || "",
            edit_instruction: "Improve this email and make it more polished",
            tone: "professional"
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: `❌ Edit failed: ${errorData.error || response.statusText}` }
        ]);
        return;
      }

      if (!response.body) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "❌ Edit failed: No response from server" }
        ]);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let updated = "";

      // Show typing indicator while improving
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[messageIndex] = {
          ...newMessages[messageIndex],
          improving: true
        };
        return newMessages;
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        updated += decoder.decode(value, { stream: true });

        // Update the specific email message
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[messageIndex]) {
            newMessages[messageIndex] = {
              ...newMessages[messageIndex],
              emailData: {
                ...newMessages[messageIndex].emailData,
                body: updated
              },
              improving: false
            };
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Edit error:", error);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "❌ Edit failed: Network error" }
      ]);
    }
  }, [setMessages]);

  // Helper function to safely render email content
  const renderEmailContent = (msg, index) => {
    if (!msg.emailData) {
      return <div className="text-red-500">Error: Invalid email data</div>;
    }

    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-500">
          To: {msg.emailData.to || msg.emailData.recipient_email || "No recipient specified"}
        </p>

        <p className="font-semibold">
          Subject: {msg.emailData.subject || "No subject"}
        </p>

        <div className="whitespace-pre-wrap text-gray-700">
          {msg.emailData.body || "No content"}
        </div>

        {msg.improving && (
          <div className="flex items-center gap-2 text-sm text-indigo-600">
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
            Improving email...
          </div>
        )}

        <div className="flex gap-3 pt-3">
          <button
            onClick={() => handleSend(msg.emailData, index)}
            disabled={msg.improving}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>

          <button
            onClick={() => handleImprove(msg.emailData, index)}
            disabled={msg.improving}
            className="bg-gray-200 px-4 py-2 rounded-xl hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Improve
          </button>

          <button
            onClick={() => handleCancel(index)}
            disabled={msg.improving}
            className="bg-red-100 text-red-600 px-4 py-2 rounded-xl hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    );
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
        <h2 className="font-semibold text-gray-700 ml-2">
          Chat
        </h2>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
        {messages.length === 0 ? (
          <Landing onQuickAction={handleQuickAction} />
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg, index) => (
              <div
                key={`msg-${index}-${msg.role}`}
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
                  renderEmailContent(msg, index)
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
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