import { useState, useRef } from 'react';
import { importAssociatesFromCSV } from '../utils/cretUtils';
import toast from 'react-hot-toast';

export default function CSVImport() {
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const parseCSV = (text) => {
    const lines = text.split('\n').filter((line) => line.trim());
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

    const badgeIdIndex = headers.findIndex((h) =>
      h.includes('badge') || h.includes('id')
    );
    const loginIndex = headers.findIndex((h) => h.includes('login') || h.includes('username'));
    const nameIndex = headers.findIndex((h) => h.includes('name'));

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());

      if (values.length >= 2) {
        const entry = {
          badge_id: badgeIdIndex >= 0 ? values[badgeIdIndex] : values[0],
          login: loginIndex >= 0 ? values[loginIndex] : values[1],
        };

        // Name is optional
        if (nameIndex >= 0 && values[nameIndex]) {
          entry.name = values[nameIndex];
        }

        if (entry.badge_id && entry.login) {
          data.push(entry);
        }
      }
    }

    return data;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    try {
      const text = await file.text();
      const data = parseCSV(text);

      if (data.length === 0) {
        toast.error('No valid data found in CSV file');
        return;
      }

      setPreview(data);
      setShowPreview(true);
      toast.success(`Parsed ${data.length} associates from CSV`);
    } catch (error) {
      toast.error('Failed to parse CSV file');
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) return;

    setImporting(true);

    try {
      const { data, error, count } = await importAssociatesFromCSV(preview);

      if (error) {
        toast.error('Import failed: ' + error.message);
      } else {
        toast.success(`Successfully imported ${count} associates!`);
        setShowPreview(false);
        setPreview([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      toast.error('Import failed: ' + error.message);
    }

    setImporting(false);
  };

  const downloadTemplate = () => {
    const csv = 'badge_id,login,name\n12345,jdoe,John Doe\n67890,asmith,Alice Smith\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'associates-template.csv';
    a.click();
    toast.success('Template downloaded');
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Import Associates</h2>
          <p className="text-gray-600">
            Upload a CSV file to bulk import associate data
          </p>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <svg
                className="w-12 h-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-primary-600 font-semibold hover:text-primary-700">
                Choose CSV file
              </span>
              <span className="text-sm text-gray-500 mt-1">or drag and drop</span>
            </label>
          </div>

          <div className="flex items-center justify-center">
            <button onClick={downloadTemplate} className="btn-secondary">
              <svg
                className="w-5 h-5 mr-2 inline-block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download CSV Template
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">CSV Format Requirements:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Required:</strong> badge_id, login</li>
            <li>• <strong>Optional:</strong> name (can be added later)</li>
            <li>• First row should contain headers</li>
            <li>• Columns can be in any order</li>
            <li>• Example: <code className="bg-blue-100 px-1 rounded">badge_id,login,name</code></li>
          </ul>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="card animate-slide-up">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Preview ({preview.length} associates)
          </h3>

          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="pb-3">Badge ID</th>
                  <th className="pb-3">Login</th>
                  <th className="pb-3">Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preview.slice(0, 10).map((assoc, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 font-mono text-sm">{assoc.badge_id}</td>
                    <td className="py-2 text-sm">{assoc.login}</td>
                    <td className="py-2 text-sm text-gray-600">
                      {assoc.name || <em className="text-gray-400">Not provided</em>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 10 && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                ... and {preview.length - 10} more
              </p>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowPreview(false);
                setPreview([]);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="btn-primary flex-1"
              disabled={importing}
            >
              {importing ? 'Importing...' : `Import ${preview.length} Associates`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
