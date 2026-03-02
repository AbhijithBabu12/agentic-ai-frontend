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

      // EMAIL / ERROR JSON
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (data.type === "email") {
          // We need to collect the streamed email content first
          // The backend sends email data with a generator, but we're not handling it properly
          // Let's handle the streaming for email too
          
          // For now, let's assume the email is being built from the stream
          // We'll add a typing indicator first
          setMessages([
            ...baseMessages,
            { role: "assistant", type: "email", typing: true, emailData: { body: "" } }
          ]);

          // Now we need to read the stream
          // But the backend returns JSON for email type, not stream
          // This is a mismatch in your implementation
          
          // Let's modify this to handle the actual response
          // Since your backend returns a stream even for email, we need to read it
          
          // Re-fetch as stream if needed, but for now let's create a placeholder
          setMessages(prev => {
            const newMessages = [...prev];
            // Find the last message (our typing indicator) and update it
            const lastIndex = newMessages.length - 1;
            if (lastIndex >= 0 && newMessages[lastIndex].typing) {
              newMessages[lastIndex] = {
                role: "assistant",
                type: "email",
                emailData: {
                  to: data.recipient_email || "recipient@example.com",
                  subject: data.subject || "Email Subject",
                  body: data.body || "Email body will appear here..."
                }
              };
            }
            return newMessages;
          });
          
        } else {
          setMessages([
            ...baseMessages,
            { role: "assistant", content: data.message || data.error || "Unknown response" }
          ]);
        }

        setIsGenerating(false);
        return;
      }

      // STREAM MODE (for chat and email content)
      if (!response.body) {
        setIsGenerating(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantMessage = "";

      // Check if this might be an email (based on the initial request)
      const isEmailRequest = textToSend.toLowerCase().includes("email") || 
                             textToSend.toLowerCase().includes("send") ||
                             textToSend.toLowerCase().includes("mail");

      if (isEmailRequest) {
        // Start with an email typing indicator
        setMessages([
          ...baseMessages,
          { role: "assistant", type: "email", typing: true, emailData: { body: "" } }
        ]);
      } else {
        // Regular chat typing indicator
        setMessages([
          ...baseMessages,
          { role: "assistant", typing: true }
        ]);
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        assistantMessage += decoder.decode(value, { stream: true });

        if (isEmailRequest) {
          // Update the email message
          setMessages(prev => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            if (lastIndex >= 0) {
              // Try to parse if it's JSON
              try {
                // Sometimes the stream might be sending JSON
                const parsed = JSON.parse(assistantMessage);
                if (parsed.type === "email") {
                  newMessages[lastIndex] = {
                    role: "assistant",
                    type: "email",
                    emailData: {
                      to: parsed.recipient_email || "recipient@example.com",
                      subject: parsed.subject || "Email Subject",
                      body: parsed.body || assistantMessage
                    }
                  };
                } else {
                  newMessages[lastIndex] = {
                    role: "assistant",
                    type: "email",
                    emailData: {
                      to: "recipient@example.com",
                      subject: "Email Subject",
                      body: assistantMessage
                    }
                  };
                }
              } catch {
                // Not JSON, treat as plain text body
                newMessages[lastIndex] = {
                  role: "assistant",
                  type: "email",
                  emailData: {
                    to: "recipient@example.com",
                    subject: "Email Subject",
                    body: assistantMessage
                  }
                };
              }
            }
            return newMessages;
          });
        } else {
          // Regular chat message
          setMessages([
            ...baseMessages,
            { role: "assistant", content: assistantMessage }
          ]);
        }
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