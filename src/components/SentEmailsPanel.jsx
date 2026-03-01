export default function SentEmailsPanel({ show, onClose }) {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl border-l transform transition-transform duration-300 ${
        show ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-6 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold">
          📧 Sent Emails
        </h2>
        <button onClick={onClose}>
          ✖
        </button>
      </div>

      <div className="p-6 text-gray-400">
        No emails sent yet.
      </div>
    </div>
  );
}