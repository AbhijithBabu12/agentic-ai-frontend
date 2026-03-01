import { useState, useRef } from "react";

export default function MessageInput({ setMessages, messages }) {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const userText = input;

    const userMessage = { role: "user", content: userText };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsGenerating(true);

    // Show thinking bubble immediately
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
          body: JSON.stringify({ message: userText }),
          signal: controller.signal
        }
      );

      // 🔥 Handle backend JSON errors
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
      let hasStartedStreaming = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        assistantMessage += chunk;

        // Replace typing bubble on first token
        if (!hasStartedStreaming) {
          hasStartedStreaming = true;
        }

        setMessages(prev =>
          prev.map(msg =>
            msg.typing
              ? { role: "assistant", content: assistantMessage }
              : msg
          )
        );
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

    // Remove typing bubble if still present
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
          disabled={!input.trim()}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-200 ${
            input.trim()
              ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
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
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-full shadow-lg transition-all duration-200"
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
}
