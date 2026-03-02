export default function SentEmailsPanel({ show, onClose, sentEmails }) {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl border-l transform transition-transform duration-300 ${
        show ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-6 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold">📧 Sent Emails</h2>
        <button onClick={onClose}>✖</button>
      </div>

      <div className="p-6 space-y-4 overflow-y-auto h-full">

        {sentEmails.length === 0 ? (
          <div className="text-gray-400">No emails sent yet.</div>
        ) : (
          sentEmails.map(email => (
            <div
              key={email.id}
              className="border rounded-xl p-4 bg-gray-50"
            >
              <div className="text-sm text-gray-500">
                {email.date}
              </div>

              <div className="font-semibold mt-1">
                {email.subject}
              </div>

              <div className="text-sm text-gray-600 mt-1">
                To: {email.to}
              </div>

              <div className="text-sm mt-2 whitespace-pre-wrap">
                {email.body}
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
}