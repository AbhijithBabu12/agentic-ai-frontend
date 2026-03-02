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
      console.log("Sending message:", textToSend);
      
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: textToSend }),
          signal: controller.signal
        }
      );

      console.log("Response status:", response.status);
      console.log("Content-Type:", response.headers.get("content-type"));

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        // Handle JSON response
        const data = await response.json();
        console.log("JSON response:", data);
        
        // Add a simple assistant message
        setMessages(prev => [
          ...prev,
          { 
            role: "assistant", 
            content: typeof data === 'string' ? data : JSON.stringify(data) 
          }
        ]);
        
        setIsGenerating(false);
        return;
      }

      // Handle stream response
      if (!response.body) {
        console.error("No response body");
        setIsGenerating(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      // Add a temporary message
      setMessages(prev => [
        ...prev,
        { role: "assistant", typing: true }
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        assistantMessage += decoder.decode(value, { stream: true });
        console.log("Stream chunk:", assistantMessage);

        // Update the message
        setMessages(prev => {
          const newMessages = [...prev];
          // Replace the last message (typing indicator) with the actual content
          newMessages[newMessages.length - 1] = { 
            role: "assistant", 
            content: assistantMessage 
          };
          return newMessages;
        });
      }

    } catch (error) {
      console.error("Error in sendMessage:", error);
      if (error.name !== "AbortError") {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: `Error: ${error.message}` }
        ]);
      }
    } finally {
      setIsGenerating(false);
    }
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
          onClick={sendMessage}
          disabled={!input.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow"
        >
          ➤
        </button>
      ) : (
        <button
          onClick={stopGeneration}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-full shadow"
        >
          <svg
            className="w-4 h-4 animate-spin"
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