import { useRef } from "react";
import Landing from "./Landing";
import MessageInput from "./MessageInput";
import menuIcon from "../assets/menu.png";

export default function ChatWindow({ messages, setMessages, toggleSidebar }) {

  const messageInputRef = useRef(null);

  // 🛡 Always protect against non-array
  const safeMessages = Array.isArray(messages) ? messages : [];

  const handleQuickAction = (text) => {
    messageInputRef.current?.sendExternalMessage(text);
  };

  const handleSendEmail = async (emailData) => {
    try {

      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      if (!backendUrl) {
        console.error("Backend URL missing");
        return;
      }

      const response = await fetch(
        `${backendUrl}/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Send failed");
      }

      // ✅ Safe state update
      setMessages(prev => {
        const arr = Array.isArray(prev) ? prev : [];
        return [
          ...arr,
          { role: "assistant", content: "✅ Email sent successfully!" }
        ];
      });

    } catch (error) {

      console.error("Send error:", error);

      setMessages(prev => {
        const arr = Array.isArray(prev) ? prev : [];
        return [
          ...arr,
          { role: "assistant", content: "❌ Email send failed." }
        ];
      });
    }
  };

  return (
    <div className="flex flex-col h-full">

      {/* TOP BAR */}
      <div className="flex items-center p-4 border-b bg-white">
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <img
            src={menuIcon}
            alt="menu"
            className="w-10 h-10 rounded-full object-cover shadow-sm"
          />
        </button>
        <h2 className="font-semibold text-gray-700">Chat</h2>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-100">

        {safeMessages.length === 0 ? (
          <Landing onQuickAction={handleQuickAction} />
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">

            {safeMessages.map((msg, i) => (

              <div
                key={i}
                className={
                  msg.type === "email"
                    ? "w-full flex justify-center"
                    : `px-4 py-3 rounded-2xl w-fit max-w-xl ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white ml-auto"
                          : "bg-white shadow"
                      }`
                }
              >

                {msg.type === "email" ? (

                  <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-5">

                    {/* TO */}
                    <div className="border-b pb-4">
                      <div className="text-sm text-gray-500">To</div>
                      <div className="font-medium text-gray-800">
                        {msg.emailData?.to}
                      </div>
                    </div>

                    {/* SUBJECT */}
                    <div>
                      <div className="text-sm text-gray-500">Subject</div>
                      <div className="font-semibold text-gray-900">
                        {msg.emailData?.subject}
                      </div>
                    </div>

                    {/* BODY (Editable) */}
                    <textarea
                      value={msg.emailData?.body || ""}
                      onChange={(e) => {
                        const updated = e.target.value;

                        setMessages(prev => {
                          const arr = Array.isArray(prev) ? [...prev] : [];
                          if (!arr[i]) return arr;

                          arr[i] = {
                            ...arr[i],
                            emailData: {
                              ...arr[i].emailData,
                              body: updated
                            }
                          };

                          return arr;
                        });
                      }}
                      className="w-full h-48 border rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                    />

                    {/* ACTIONS */}
                    <div className="flex gap-3 pt-2">

                      <button
                        type="button"
                        onClick={() => handleSendEmail(msg.emailData)}
                        className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition"
                      >
                        Send
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMessages(prev => {
                            const arr = Array.isArray(prev) ? prev : [];
                            return arr.filter((_, index) => index !== i);
                          });
                        }}
                        className="bg-red-200 px-5 py-2 rounded-xl hover:bg-red-300 transition"
                      >
                        Remove
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

      {/* INPUT */}
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