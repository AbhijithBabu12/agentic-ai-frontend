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

  // 🔥 Allow Landing to trigger message
  useImperativeHandle(ref, () => ({
    sendExternalMessage: (text) => {
      sendMessage(text);
    }
  }));

  const sendMessage = async (externalText = null) => {
    const textToSend = externalText || input;

    if (!textToSend.trim() || isGenerating) return;

    const userMessage = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsGenerating(true);

    // Show typing bubble immediately
    setMessages([
      ...updatedMessages,
      { role: "assistant", typing: true }
    ]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message: textToSend }),
          signal: controller.signal
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: `⚠️ ${errorData.error}` }
        ]);
        setIsGenerating(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        assistantMessage += decoder.decode(value, { stream: true });

        setMessages([
          ...updatedMessages,
          { role: "assistant", content: assistantMessage }
        ]);
      }

    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Streaming error:", error);
      }
    }

    setIsGenerating(false);
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setMessages(prev => prev.filter(msg => !msg.typing));
    setIsGenerating(false);
  };

  return (
    <div className="relative w-full">

      <input
        value={input}
        disabled={isGenerating}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
        className={`w-full px-6 py-4 pr-16 rounded-3xl border shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
          isGenerating ? "bg-gray-100 cursor-not-allowed" : "bg-white"
        }`}
        placeholder={
          isGenerating
            ? "Assistant is thinking..."
            : "Message your assistant..."
        }
      />
      {!isGenerating ? (
        <button
  onClick={sendMessage}
  className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-full shadow hover:bg-indigo-700 transition"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
  </svg>
</button>
      ) : (
        <button
  onClick={stopGeneration}
  className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-full shadow hover:bg-indigo-700 transition"
>
  <svg
    className="w-4 h-4 animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
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
