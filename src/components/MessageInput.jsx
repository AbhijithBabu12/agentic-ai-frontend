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
          onClick={() => sendMessage()}
          disabled={!input.trim()}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-200 ${
            input.trim()
              ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          ➤
        </button>
      ) : (
        <button
          onClick={stopGeneration}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-full shadow-lg"
        >
          ⏹
        </button>
      )}
    </div>
  );
});

export default MessageInput;