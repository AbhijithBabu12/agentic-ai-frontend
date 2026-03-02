import { useRef, useState, useEffect } from "react";
import Landing from "./Landing";
import MessageInput from "./MessageInput";
import menuIcon from "../assets/menu.png";

export default function ChatWindow({ messages, setMessages, toggleSidebar, setSentEmails}) {

  const messageInputRef = useRef(null);
  const [editingDraftId, setEditingDraftId] = useState(null);
  const bottomRef = useRef(null);

  const safeMessages = Array.isArray(messages) ? messages : [];
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth'});
  }, [safeMessages]);

  const handleQuickAction = (text) => {
    messageInputRef.current?.sendExternalMessage(text);
  };

  const handleEmailAction = async (draftId, action) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const response = await fetch(
        backendUrl + "/email-action",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            draft_id: draftId,
            action: action
          })
        }
      );

      const data = await response.json();
      if (action == 'send' && data.type == 'success') {
        const draft = safeMessages.find(m => m.draftId == draftId);

        if (draft) {
          setSentEmails(prev => [
            {
              id: draftId,
              to: draft.emailData.to,
              subject: draft.emailData.subject,
              body: draft.emailData.body,
              date: new Date().toLocaleString()
            },
            ...prev
          ]);
        }
      }
      const updatedMessages = [
        ...safeMessages,
        { role: "assistant", content: data.message }
      ];

      setMessages(updatedMessages);

    } catch (error) {
      console.error(error);
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

              <div key={i}>

                {msg.type === "email" ? (

                  <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 space-y-5 mx-auto">

                    <div>
                      <div className="text-sm text-gray-500">To</div>
                      <div className="font-medium">{msg.emailData.to}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Subject</div>
                      <div className="font-semibold">{msg.emailData.subject}</div>
                    </div>

                    {editingDraftId === msg.draftId ? (

                      <textarea
                        value={msg.emailData.body}
                        onChange={(e) => {
                          const updatedBody = e.target.value;

                          const updatedMessages = safeMessages.map(m =>
                            m.draftId === msg.draftId
                              ? {
                                  ...m,
                                  emailData: {
                                    ...m.emailData,
                                    body: updatedBody
                                  }
                                }
                              : m
                          );

                          setMessages(updatedMessages);
                        }}
                        className="w-full h-48 border rounded-xl p-4 resize-none bg-white"
                      />

                    ) : (

                      <div className="whitespace-pre-wrap border rounded-xl p-4 bg-gray-50">
                        {msg.emailData.body}
                      </div>

                    )}

                    <div className="flex gap-3">

                      {editingDraftId === msg.draftId ? (

                        <button
                          onClick={() => setEditingDraftId(null)}
                          className="bg-green-600 text-white px-4 py-2 rounded-xl"
                        >
                          Save
                        </button>

                      ) : (

                        <button
                          onClick={() => setEditingDraftId(msg.draftId)}
                          className="bg-gray-200 px-4 py-2 rounded-xl"
                        >
                          Edit
                        </button>

                      )}

                      <button
                        onClick={() => handleEmailAction(msg.draftId, "send")}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
                      >
                        Send
                      </button>

                      <button
                        onClick={() => handleEmailAction(msg.draftId, "cancel")}
                        className="bg-red-200 px-4 py-2 rounded-xl"
                      >
                        Cancel
                      </button>

                    </div>

                  </div>

                ) : (

                  <div
                    className={`px-4 py-3 rounded-2xl w-fit max-w-xl ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white ml-auto"
                        : "bg-white shadow"
                    }`}
                  >
                    {msg.typing ? (
                      <div className="flex gap-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />
                      </div>
                   ) : (
                    msg.content
                   )}
                  </div>

                )}

              </div>

            ))}
            <div ref={bottomRef} />

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