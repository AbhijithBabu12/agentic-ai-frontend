import sent from "../assets/sent.png";
export default function Sidebar({
  isOpen,
  toggleSidebar,
  chats,
  activeChatId,
  setActiveChatId,
  createNewChat,
  deleteChat,
  renameChat,
  setShowEmails
}) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-white border-r p-5 flex flex-col justify-between transform transition-transform duration-300 z-20 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div>
        <button
          onClick={createNewChat}
          className="w-full bg-indigo-600 text-white py-2 rounded-xl font-medium shadow hover:bg-indigo-700 transition"
        >
          + New Chat
        </button>

        <div className="mt-8">
          <p className="text-xs text-gray-400 mb-2">CONVERSATIONS</p>

          <div className="space-y-2">
            {chats.map(chat => (
              <div
                key={chat.id}
                className={`group flex items-center justify-between p-2 rounded-lg text-sm ${
                  chat.id === activeChatId
                    ? "bg-indigo-100 text-indigo-600"
                    : "hover:bg-gray-100"
                }`}
              >
                <span
                onClick={() => setActiveChatId(chat.id)}
                onDoubleClick={() => {
                  const newName = prompt("Rename chat:", chat.title);
                  if (newName) renameChat(chat.id, newName);
                  }}
                  className="cursor-pointer flex-1 truncate"
                >
                  {chat.title}
                </span>
                <button
                  onClick={() => deleteChat(chat.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 text-xs ml-2"
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="fixed bottom-6 left-6 flex items-center gap-3">

  {/* Circular Button */}
  <button
    onClick={() => setShowEmails(true)}
    className="
      w-14 h-14
      bg-white shadow-lg
      rounded-full
      flex items-center justify-center
      transition-all duration-200
      hover:bg-indigo-600 hover:scale-105
      group
    "
  >
    <img
      src={sent}
      alt="Sent Emails"
      className="w-10 h-10 transition-all duration-200 group-hover:invert"
    />
  </button>

  {/* Text Outside Button */}
  <span className="font-medium text-gray-700">
    Emails
  </span>

</div>
    </div>
  );
}