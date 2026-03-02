import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect
} from "react";


const MessageInput = forwardRef(({ setMessages, messages }, ref) => {

  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    sendExternalMessage: (text) => sendMessage(text)
  }));

  const sendMessage = async (externalText = null) => {

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const textToSend = externalText || input;
    if (!textToSend.trim() || isGenerating) return;

    const userMessage = { role: "user", content: textToSend };
    const baseMessages = [...messages, userMessage];

    setMessages(baseMessages);
    setInput("");
    setIsGenerating(true);

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

      const contentType = response.headers.get("content-type") || "";

      // 🔥 EMAIL DRAFT
      if (contentType.includes("application/json")) {

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

          setIsGenerating(false);
          return;
        }

        if (data.type === "error") {
          setMessages([
            ...baseMessages,
            { role: "assistant", content: data.message }
          ]);
          setIsGenerating(false);
          return;
        }
      }

      // 🔥 STREAM CHAT
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

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
          { role: "assistant", content: assistantMessage, typing: false }
        ]);
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("Generation stopped");
      } else {
        console.error(error);
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

      {!isGenerating ? (
        <button
          type="button"
          onClick={() => sendMessage()}
          disabled={!input.trim()}
          className={`
    absolute right-3 top-1/2 -translate-y-1/2
    p-3 rounded-full shadow-md transition-all duration-200
    flex items-center justify-center
    ${
      input.trim()
        ? "bg-indigo-600 hover:bg-indigo-700 text-white scale-100 active:scale-95"
        : "bg-gray-300 text-gray-500 cursor-not-allowed scale-95"
    }
  `}
>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 19V5m0 0l-7 7m7-7l7 7"
            />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={stopGeneration}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-full shadow"
        >
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