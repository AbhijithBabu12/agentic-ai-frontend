import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle
} from "react";

const MessageInput = forwardRef(({ setMessages, messages }, ref) => {

  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    sendExternalMessage: (text) => sendMessage(text)
  }));

  const sendMessage = async (externalText = null) => {

    const textToSend = externalText || input;
    if (!textToSend.trim() || isGenerating) return;

    const userMessage = { role: "user", content: textToSend };
    const baseMessages = [...messages, userMessage];

    setMessages(baseMessages);
    setInput("");
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: textToSend }),
          signal: controller.signal
        }
      );

      const contentType = response.headers.get("content-type");

      // ✅ EMAIL DRAFT (NO STREAMING)
      if (contentType && contentType.includes("application/json")) {

        const data = await response.json();

        if (data.type === "email_draft") {
          setMessages([
            ...baseMessages,
            {
              role: "assistant",
              type: "email",
              draftId: data.draft_id,
              emailData: {
                to: data.to,
                subject: data.subject,
                body: data.body
              }
            }
          ]);
        } else {
          setMessages([
            ...baseMessages,
            { role: "assistant", content: data.message }
          ]);
        }

        setIsGenerating(false);
        return;
      }

      // ✅ CHAT STREAMING
      if (!response.body) {
        setIsGenerating(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantMessage = "";

      // Show typing indicator first
      setMessages([
        ...baseMessages,
        { role: "assistant", typing: true }
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        assistantMessage += decoder.decode(value, { stream: true });

        setMessages([
          ...baseMessages,
          { role: "assistant", content: assistantMessage }
        ]);
      }

    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error:", error);
      }
    }

    setIsGenerating(false);
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
  };

  return (
    <div className="relative w-full">

      <input
        value={input}
        disabled={isGenerating}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        className="w-full px-6 py-4 pr-16 rounded-3xl border shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        placeholder={
          isGenerating ? "Assistant is thinking..." : "Message your assistant..."
        }
      />

      {/* SEND BUTTON */}
      {!isGenerating ? (
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow transition"
        >
          {/* Arrow SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14M13 5l7 7-7 7"
            />
          </svg>
        </button>
      ) : (
        <button
          onClick={stopGeneration}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-full shadow"
        >
          {/* Rotating Pause/Stop */}
          <svg
            className="w-5 h-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            />
            <path
              d="M4 12a8 8 0 018-8"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-75"
            />
          </svg>
        </button>
      )}

    </div>
  );
});

export default MessageInput;