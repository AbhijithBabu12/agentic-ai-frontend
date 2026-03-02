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
        <h2 className="text-xl font-semibold">📧 Sent Emails</h2>
        <button onClick={onClose} className="text-lg">✖</button>
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