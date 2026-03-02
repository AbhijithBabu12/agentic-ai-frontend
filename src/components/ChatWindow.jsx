import { useRef } from "react";
import Landing from "./Landing";
import MessageInput from "./MessageInput";
import menuIcon from "../assets/menu.png";

export default function ChatWindow({ messages, setMessages, toggleSidebar }) {

  const messageInputRef = useRef(null);

  const handleQuickAction = (text) => {
    messageInputRef.current?.sendExternalMessage(text);
  };

  const handleSendEmail = async (emailData) => {

    try {

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailData)
        }
      );

      if (!response.ok) {
        throw new Error("Send failed");
      }

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "✅ Email sent successfully!" }
      ]);

    } catch (error) {

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "❌ Email send failed." }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full">

      {/* TOP BAR */}
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
        <h2 className="font-semibold text-gray-700">Chat</h2>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-100">

        {messages.length === 0 ? (
          <Landing onQuickAction={handleQuickAction} />
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">

            {messages.map((msg, i) => (

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

                    <div className="border-b pb-4">
                      <div className="text-sm text-gray-500">To</div>
                      <div className="font-medium text-gray-800">
                        {msg.emailData.to}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Subject</div>
                      <div className="font-semibold text-gray-900">
                        {msg.emailData.subject}
                      </div>
                    </div>

                    <textarea
                      value={msg.emailData.body}
                      onChange={(e) => {
                        const updated = e.target.value;
                        setMessages(prev => {
                          const copy = [...prev];
                          copy[i] = {
                            ...copy[i],
                            emailData: {
                              ...copy[i].emailData,
                              body: updated
                            }
                          };
                          return copy;
                        });
                      }}
                      className="w-full h-48 border rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                    />

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
    setMessages(prev =>
      prev.filter((_, index) => index !== i)
    );
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
          messages={messages}
        />
      </div>

    </div>
  );
}