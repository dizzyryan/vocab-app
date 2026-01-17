import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Download, Upload, AlertCircle, FileJson } from 'lucide-react';
import type { VocabularyItem, NewVocabularyItem } from '../types';

export default function BackupRestore() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: words } = useQuery({
    queryKey: ['vocabulary'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vocabulary').select('*').eq('user_id', user?.id);
      if (error) throw error;
      return data as VocabularyItem[];
    },
    enabled: !!user,
  });

  const importMutation = useMutation({
    mutationFn: async (items: NewVocabularyItem[]) => {
      const { error } = await supabase.from('vocabulary').insert(
        items.map(item => ({ ...item, user_id: user?.id }))
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
      alert('Import successful!');
    },
    onError: (err) => alert('Import failed: ' + err.message)
  });

  const handleExport = () => {
    if (!words) return;
    const dataStr = JSON.stringify({
      version: "2.0",
      date: new Date().toISOString(),
      items: words
    }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocab_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const items = Array.isArray(json.items) ? json.items : [];
        // Filter out IDs to create new entries
        const newItems = items.map(({ id, created_at, user_id, ...rest }: any) => rest);
        if (confirm(`Found ${newItems.length} items. Import them?`)) {
          importMutation.mutate(newItems);
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <FileJson className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Backup & Restore</h2>
            <p className="text-slate-500 text-sm">Manage your data locally</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors group">
            <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-500" />
              Export
            </h3>
            <p className="text-sm text-slate-500 mb-4 h-10">
              Download a JSON copy of your entire vocabulary list.
            </p>
            <button
              onClick={handleExport}
              disabled={!words?.length}
              className="w-full bg-white text-indigo-600 border border-slate-200 font-semibold py-3 px-4 rounded-xl shadow-sm hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download Backup
            </button>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors group">
            <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-500" />
              Import
            </h3>
            <p className="text-sm text-slate-500 mb-4 h-10">
              Restore words from a previously exported JSON file.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              Select File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>

        <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 text-amber-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>
            <span className="font-semibold">Note:</span> Import will allow duplicates if you import the same file twice. We recommend only importing if you have lost data or are migrating.
          </p>
        </div>
      </div>
    </div>
  );
}
