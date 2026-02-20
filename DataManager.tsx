import React, { useState, useCallback } from 'react';
import { Save, Upload, Download, Trash2, X, AlertTriangle } from 'lucide-react';

interface DataManagerProps {
  onExport: () => Promise<string>;
  onImport: (data: string) => Promise<boolean>;
  onReset: () => Promise<void>;
  onClose: () => void;
}

export const DataManager: React.FC<DataManagerProps> = ({ 
  onExport, 
  onImport, 
  onReset,
  onClose 
}) => {
  const [importData, setImportData] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [exportedData, setExportedData] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    try {
      const data = await onExport();
      setExportedData(data);
      setMessage({ type: 'success', text: 'Data exported! Copy the code below.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to export data' });
    }
  }, [onExport]);

  const handleImport = useCallback(async () => {
    if (!importData.trim()) {
      setMessage({ type: 'error', text: 'Please paste save data' });
      return;
    }

    try {
      const success = await onImport(importData.trim());
      if (success) {
        setMessage({ type: 'success', text: 'Data imported successfully!' });
        setImportData('');
        setTimeout(() => onClose(), 1500);
      } else {
        setMessage({ type: 'error', text: 'Invalid save data' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to import data' });
    }
  }, [importData, onImport, onClose]);

  const handleReset = useCallback(async () => {
    try {
      await onReset();
      setMessage({ type: 'success', text: 'Game reset! Reloading...' });
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setMessage({ type: 'error', text: 'Failed to reset game' });
    }
  }, [onReset]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: 'success', text: 'Copied to clipboard!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to copy' });
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-green-500 max-w-md w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-sm text-green-400 uppercase tracking-wider flex items-center gap-2">
            <Save size={16} />
            Data Manager
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Message */}
          {message && (
            <div className={`p-2 text-xs ${
              message.type === 'success' 
                ? 'bg-green-900/50 text-green-400 border border-green-600' 
                : 'bg-red-900/50 text-red-400 border border-red-600'
            }`}>
              {message.text}
            </div>
          )}

          {/* Export Section */}
          <div className="border border-gray-700 p-3">
            <h3 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Download size={12} />
              Export Save Data
            </h3>
            <p className="text-[9px] text-gray-500 mb-2">
              Backup your pet data to transfer to another device
            </p>
            <button
              onClick={handleExport}
              className="w-full p-2 bg-green-600 text-white text-xs uppercase tracking-wider
                       hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={14} />
              Export Data
            </button>
            
            {exportedData && (
              <div className="mt-2">
                <textarea
                  readOnly
                  value={exportedData}
                  className="w-full h-20 bg-gray-800 border border-gray-700 p-2 text-[9px] 
                           text-gray-400 font-mono resize-none"
                />
                <button
                  onClick={() => copyToClipboard(exportedData)}
                  className="mt-1 w-full p-1 bg-gray-700 text-gray-300 text-[9px]
                           hover:bg-gray-600 transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>
            )}
          </div>

          {/* Import Section */}
          <div className="border border-gray-700 p-3">
            <h3 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Upload size={12} />
              Import Save Data
            </h3>
            <p className="text-[9px] text-gray-500 mb-2">
              Restore your pet from a backup
            </p>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste your save data here..."
              className="w-full h-20 bg-gray-800 border border-gray-700 p-2 text-[9px] 
                       text-white font-mono resize-none focus:border-green-500 focus:outline-none"
            />
            <button
              onClick={handleImport}
              disabled={!importData.trim()}
              className="mt-2 w-full p-2 bg-blue-600 text-white text-xs uppercase tracking-wider
                       hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500
                       disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={14} />
              Import Data
            </button>
          </div>

          {/* Reset Section */}
          <div className="border border-red-900/50 p-3">
            <h3 className="text-[10px] text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <AlertTriangle size={12} />
              Danger Zone
            </h3>
            
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full p-2 bg-red-900/50 text-red-400 text-xs uppercase tracking-wider
                         border border-red-800 hover:bg-red-900 transition-colors
                         flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                Reset Game
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-[9px] text-red-400">
                  This will permanently delete your pet and all progress. Are you sure?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 p-2 bg-red-600 text-white text-[9px] uppercase tracking-wider
                             hover:bg-red-500 transition-colors"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 p-2 bg-gray-700 text-gray-300 text-[9px] uppercase tracking-wider
                             hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <p className="text-[9px] text-gray-500 text-center">
            Data is automatically saved every minute
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataManager;
