import { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, Star, ArrowRight, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import type { VocabularyItem } from '../types';

export default function ReviewMode() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { data: words, isLoading } = useQuery({
    queryKey: ['vocabulary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', user?.id);
      if (error) throw error;
      return data as VocabularyItem[];
    },
    enabled: !!user,
  });

  const shuffleOrderRef = useRef<string[]>([]);

  const shuffledWords = useMemo(() => {
    if (!words || words.length === 0) return [];
    
    // If we already have a shuffle order, maintain it
    if (shuffleOrderRef.current.length === words.length) {
      const orderedWords = shuffleOrderRef.current
        .map(id => words.find(w => w.id === id))
        .filter(Boolean) as VocabularyItem[];
      return orderedWords;
    }
    
    // Create new shuffle order
    const shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Store the shuffle order
    shuffleOrderRef.current = shuffled.map(w => w.id);
    return shuffled;
  }, [words]);

  const toggleStarMutation = useMutation({
    mutationFn: async ({ id, star }: { id: string; star: boolean }) => {
      const { error } = await supabase.from('vocabulary').update({ star }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      // Update cache without invalidating to prevent reshuffle
      queryClient.setQueryData(['vocabulary'], (oldData: VocabularyItem[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(word => 
          word.id === currentWord.id ? { ...word, star: !word.star } : word
        );
      });
    }
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /></div>;

  if (!shuffledWords || shuffledWords.length === 0) {
    return (
      <div className="text-center p-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/40">
        <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-700">No words to review</h3>
        <p className="text-slate-500 mt-2">Add some words to your vocabulary first!</p>
      </div>
    );
  }

  const currentWord = shuffledWords[index];

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setFlipped(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % shuffledWords.length);
      setIsTransitioning(false);
    }, 300);
  };

  const handleFlip = () => {
    if (isTransitioning) return;
    setFlipped(!flipped);
  };

  return (
    <div className="max-w-md mx-auto perspective-1000">
      <div className="relative h-96 w-full cursor-pointer group" onClick={handleFlip}>
        <motion.div
          className="w-full h-full relative preserve-3d"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-white to-indigo-50/50">
            <h3 className="text-4xl font-bold text-slate-800 mb-2">{currentWord.word}</h3>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Click to flip</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 backface-hidden bg-indigo-600 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-center text-white"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">{currentWord.meaning}</h3>
                {currentWord.chinese && <p className="text-indigo-200 text-lg">{currentWord.chinese}</p>}
              </div>
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-md">
                {currentWord.pos}
              </div>
              {currentWord.notes && (
                <p className="text-sm text-indigo-100 italic border-t border-white/20 pt-4 mt-2">
                  "{currentWord.notes}"
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleStarMutation.mutate({ id: currentWord.id, star: !currentWord.star });
          }}
          className={`p-4 rounded-full shadow-lg transition-all active:scale-95 ${currentWord.star
            ? 'bg-yellow-400 text-white hover:bg-yellow-500'
            : 'bg-white text-slate-300 hover:text-yellow-400'
            }`}
        >
          <Star className={`w-6 h-6 ${currentWord.star ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={handleNext}
          className="flex-1 bg-white text-indigo-600 font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          Next Word <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center mt-6 text-sm text-slate-400 font-medium">
        Card {index + 1} of {shuffledWords.length}
      </div>
    </div>
  );
}
