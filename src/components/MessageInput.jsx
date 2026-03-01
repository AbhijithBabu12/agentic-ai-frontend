import { useState } from "react";

export default function MessageInput({ setMessages, messages }) {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const sendMessage = async () => {
  if (!input.trim() || isGenerating) return;

  const userMessage = { role: "user", content: input };
  const updatedMessages = [...messages, userMessage];

  setMessages(updatedMessages);
  setInput("");
  setIsGenerating(true);

  // Add typing placeholder
  const withTyping = [
    ...updatedMessages,
    { role: "assistant", typing: true }
  ];
  setMessages(withTyping);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: input })
      }
    );

    const data = await response.json();

    const finalMessages = withTyping.map(msg =>
      msg.typing
        ? { role: "assistant", content: data.reply }
        : msg
    );

    setMessages(finalMessages);
  } catch (error) {
    console.error(error);
  }

  setIsGenerating(false);
};
  const stopGeneration = () => {
    setIsGenerating(false);

    // Remove typing message
    const filtered = messages.filter(msg => !msg.typing);
    setMessages(filtered);
  };

  return (
    <div className="relative w-full">

      <input
        value={input}
        disabled={isGenerating}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
        className={`w-full px-5 py-4 pr-14 rounded-2xl border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          isGenerating ? "bg-gray-100 cursor-not-allowed" : "bg-white"
        }`}
        placeholder={
          isGenerating
            ? "Assistant is generating..."
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
}