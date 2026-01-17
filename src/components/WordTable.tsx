import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, Star, Trash2, Edit2, Search, Filter } from 'lucide-react';
import type { VocabularyItem } from '../types';

export default function WordTable() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterPos, setFilterPos] = useState('all');
  const [editingWord, setEditingWord] = useState<VocabularyItem | null>(null);

  const { data: words, isLoading } = useQuery({
    queryKey: ['vocabulary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as VocabularyItem[];
    },
    enabled: !!user,
  });

  const toggleStarMutation = useMutation({
    mutationFn: async ({ id, star }: { id: string; star: boolean }) => {
      const { error } = await supabase.from('vocabulary').update({ star }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vocabulary'] })
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedItem: VocabularyItem) => {
      const { error } = await supabase
        .from('vocabulary')
        .update({
          word: updatedItem.word,
          meaning: updatedItem.meaning,
          chinese: updatedItem.chinese,
          notes: updatedItem.notes,
          pos: updatedItem.pos
        })
        .eq('id', updatedItem.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
      setEditingWord(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm('Are you sure you want to delete this word?')) return;
      const { error } = await supabase.from('vocabulary').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vocabulary'] })
  });

  const filteredWords = words?.filter(w => {
    const matchesSearch = w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.meaning.toLowerCase().includes(search.toLowerCase()) ||
      w.chinese.includes(search);
    const matchesPos = filterPos === 'all' || w.pos === filterPos;
    return matchesSearch && matchesPos;
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search words..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <select
            value={filterPos}
            onChange={e => setFilterPos(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-white appearance-none min-w-[150px]"
          >
            <option value="all">All Types</option>
            <option value="noun">noun</option>
            <option value="verb">verb</option>
            <option value="adjective">adjective</option>
            <option value="adverb">adverb</option>
            <option value="idiom">idiom</option>
            <option value="phrase">phrase</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600 w-12 text-center">★</th>
                <th className="p-4 font-semibold text-slate-600">Word</th>
                <th className="p-4 font-semibold text-slate-600">Meaning</th>
                <th className="p-4 font-semibold text-slate-600">Chinese</th>
                <th className="p-4 font-semibold text-slate-600">Type</th>
                <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWords?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No words found</td>
                </tr>
              ) : (
                filteredWords?.map(word => (
                  <tr key={word.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleStarMutation.mutate({ id: word.id, star: !word.star })}
                        className={`transition-all hover:scale-110 ${word.star ? 'text-yellow-400' : 'text-slate-200 hover:text-yellow-200'}`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    </td>
                    <td className="p-4 font-medium text-slate-800">{word.word}</td>
                    <td className="p-4 text-slate-600">{word.meaning}</td>
                    <td className="p-4 text-slate-600">{word.chinese}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold">
                        {word.pos}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingWord(word)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(word.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800">Edit Word</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Word</label>
                <input
                  value={editingWord.word}
                  onChange={e => setEditingWord({ ...editingWord, word: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Meaning</label>
                  <input
                    value={editingWord.meaning}
                    onChange={e => setEditingWord({ ...editingWord, meaning: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chinese</label>
                  <input
                    value={editingWord.chinese}
                    onChange={e => setEditingWord({ ...editingWord, chinese: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={editingWord.pos}
                  onChange={e => setEditingWord({ ...editingWord, pos: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                >
                  <option value="noun">noun</option>
                  <option value="verb">verb</option>
                  <option value="adjective">adjective</option>
                  <option value="adverb">adverb</option>
                  <option value="idiom">idiom</option>
                  <option value="phrase">phrase</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={editingWord.notes}
                  onChange={e => setEditingWord({ ...editingWord, notes: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 h-24 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => setEditingWord(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateMutation.mutate(editingWord)}
                disabled={updateMutation.isPending}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
