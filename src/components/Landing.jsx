import logo from "../assets/logo.png";

export default function Landing({ onQuickAction }) {

  const quickActions = [
    "What can you do?",
    "Tell me a fun fact"
  ];

  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center">

      <img
        src={logo}
        alt="logo"
        className="w-[120px] h-[120px] object-contain"
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
            onClick={() => onQuickAction(action)}
            className="px-4 py-2 bg-white shadow rounded-lg hover:shadow-md transition"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
