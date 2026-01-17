import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowUpRight, Trash2 } from 'lucide-react';
import type { TemporaryWord } from '../types';

interface TempWordsProps {
  onUse: (word: string) => void;
}

export default function TempWords({ onUse }: TempWordsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tempWords, isLoading } = useQuery({
    queryKey: ['temp_words'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('temporary_words')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TemporaryWord[];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('temporary_words').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temp_words'] });
    }
  });

  const handleUse = (id: string, word: string) => {
    onUse(word);
    deleteMutation.mutate(id);
  };

  if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin text-indigo-500" /></div>;
  if (!tempWords?.length) return null;

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Temporary Words</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {tempWords.map((item) => (
          <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <span className="font-medium text-slate-700 truncate mr-2">{item.word}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleUse(item.id, item.word)}
                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                title="Use word"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteMutation.mutate(item.id)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
