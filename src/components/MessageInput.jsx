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

    setMessages([
      ...updatedMessages,
      { role: "assistant", typing: true }
    ]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: textToSend })
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
      console.error(error);
    }

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
        className="w-full px-6 py-4 pr-16 rounded-3xl border shadow-md"
        placeholder="Message your assistant..."
      />

      <button
        onClick={sendMessage}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-full"
      >
        ➤
      </button>
    </div>
  );
});

export default MessageInput;
