import sent2 from "../assets/sent2.png";
export default function SentEmailsPanel({ show, onClose, sentEmails }) {
  return (
    <div
      className={`
        fixed top-0 right-0 h-full w-96 bg-white shadow-xl border-l
        transform transition-transform duration-300 z-50
        ${show ? "translate-x-0" : "translate-x-full"}
      `}
    >
      {/* Header */}
    <div className="p-6 flex justify-between items-center border-b">

  {/* Left Side (Icon + Title) */}
  <div className="flex items-center gap-3">

    <button
      onClick={onClose}
      className="
        w-12 h-12
        bg-white shadow-md
        rounded-full
        flex items-center justify-center
        transition-all duration-200
        hover:bg-indigo-600 hover:scale-105
        group
      "
    >
      <img
        src={sent2}
        alt="Sent Emails"
        className="w-8 h-8 transition-all duration-200 group-hover:invert"
      />
    </button>

    <span className="font-medium text-gray-700 text-3x1">
      Emails
    </span>

  </div>

  {/* Close X */}
  <button onClick={onClose} className="text-lg hover:text-red-500 transition">
    ✖
  </button>

</div>

      {/* Scrollable Content */}
      <div className="h-[calc(100%-80px)] overflow-y-auto p-6 space-y-4">

        {sentEmails.length === 0 ? (
          <div className="text-gray-400">No emails sent yet.</div>
        ) : (
          sentEmails.map((mail) => (
            <div
              key={mail.id}
              className="border rounded-xl p-4 bg-gray-50"
            >
              <div className="text-sm text-gray-500">{mail.date}</div>
              <div className="font-semibold">{mail.subject}</div>
              <div className="text-sm text-gray-500">To: {mail.to}</div>
              <div className="whitespace-pre-wrap mt-2 text-sm">
                {mail.body}
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
}