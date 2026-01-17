import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, Search, Plus, Save, BookOpen } from 'lucide-react';
import type { NewVocabularyItem } from '../types';
import TempWords from './TempWords';

export default function AddWord() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NewVocabularyItem>({
    word: '',
    meaning: '',
    chinese: '',
    notes: '',
    pos: 'noun',
    star: false,
  });

  // Dictionary API Mutation
  const fetchDefinition = async (word: string) => {
    if (!word) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const entry = data[0];
        const def = entry.meanings[0]?.definitions[0]?.definition || '';
        const pos = entry.meanings[0]?.partOfSpeech || 'noun';
        setFormData(prev => ({ ...prev, meaning: def, pos }));
      }
    } catch (err) {
      console.error('Failed to fetch definition', err);
    } finally {
      setLoading(false);
    }
  };

  // Add Word Mutation
  const addWordMutation = useMutation({
    mutationFn: async (newItem: NewVocabularyItem) => {
      const { error } = await supabase.from('vocabulary').insert([{ ...newItem, user_id: user?.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
      setFormData({
        word: '',
        meaning: '',
        chinese: '',
        notes: '',
        pos: 'noun',
        star: false,
      });
      alert('Word added successfully!');
    },
    onError: (error) => {
      alert(`Error adding word: ${error.message}`);
    }
  });

  // Add Temporary Word Mutation
  const addTempMutation = useMutation({
    mutationFn: async (word: string) => {
      const { error } = await supabase.from('temporary_words').insert([{ word, user_id: user?.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temp_words'] });
      setFormData(prev => ({ ...prev, word: '' }));
      alert('Added to temporary list');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.word) return;
    addWordMutation.mutate(formData);
  };

  const handleUseTempWord = (word: string) => {
    setFormData(prev => ({ ...prev, word }));
    fetchDefinition(word);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/40">
        <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Add New Word
        </h2>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Word"
              value={formData.word}
              onChange={e => setFormData({ ...formData, word: e.target.value })}
              className="w-full text-lg font-medium p-4 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-white/80"
            />
            <button
              onClick={() => fetchDefinition(formData.word)}
              disabled={loading || !formData.word}
              className="absolute right-3 top-3 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Auto-fetch definition"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="English meaning"
              value={formData.meaning}
              onChange={e => setFormData({ ...formData, meaning: e.target.value })}
              className="p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
            <input
              type="text"
              placeholder="Chinese translation"
              value={formData.chinese}
              onChange={e => setFormData({ ...formData, chinese: e.target.value })}
              className="p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.pos}
              onChange={e => setFormData({ ...formData, pos: e.target.value })}
              className="p-3 rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            >
              <option value="noun">noun</option>
              <option value="verb">verb</option>
              <option value="adjective">adjective</option>
              <option value="adverb">adverb</option>
              <option value="idiom">idiom</option>
              <option value="phrase">phrase</option>
            </select>
          </div>

          <textarea
            placeholder="Personal notes"
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all h-24 resize-none"
          />

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={addWordMutation.isPending || !formData.word}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              {addWordMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Word
            </button>
            <button
              onClick={() => addTempMutation.mutate(formData.word)}
              disabled={addTempMutation.isPending || !formData.word}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              {addTempMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Save Temp
            </button>
          </div>
        </div>
      </div>

      <TempWords onUse={handleUseTempWord} />
    </div>
  );
}
