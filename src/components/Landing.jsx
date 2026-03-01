import logo from "../assets/logo.png";
export default function Landing({ setMessages }) {

  const quickActions = [
    "What can you do?",
    "Send an email",
    "Tell me a fun fact"
  ];

  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center">

      {/* LOGO */}

      <img
        src = {logo}
        alt = 'logo'
        className="w-24 h-24 mb-0 object-contain"
      />

      <h1 className="text-4xl font-bold mb-4">
        Your AI Assistant
      </h1>

      <p className="text-gray-500 mb-6">
        Ask me anything or have me send emails for you.
      </p>

      <div className="flex gap-4">
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() =>
              setMessages([{ role: "user", content: action }])
            }
            className="px-4 py-2 bg-white shadow rounded-lg"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}