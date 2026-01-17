export interface VocabularyItem {
  id: string;
  user_id: string;
  word: string;
  meaning: string;
  chinese: string;
  notes: string;
  pos: string;
  star: boolean;
  created_at: string;
}

export interface TemporaryWord {
  id: string;
  user_id: string;
  word: string;
  created_at: string;
}

export type NewVocabularyItem = Omit<VocabularyItem, 'id' | 'created_at' | 'user_id'>;
