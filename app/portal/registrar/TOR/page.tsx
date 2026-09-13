export default function GenerateTOR() {
  return (
    <div className="p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-bold text-center mb-6">Generate Transcript of Records</h2>
        <div className="space-y-4">
          <label className="block">Student ID:</label>
          <input type="text" className="w-full border p-2 rounded" />
          <button className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700">
             <i className="fas fa-file-pdf mr-2"></i> Export to PDF
          </button>
        </div>
      </div>
    </div>
  );
}