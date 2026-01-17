import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, PlusCircle, BookOpen, List, Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddWord from '../components/AddWord';
import ReviewMode from '../components/ReviewMode';
import WordTable from '../components/WordTable';
import BackupRestore from '../components/BackupRestore';

type Tab = 'add' | 'review' | 'table' | 'backup';

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('add');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'add', label: 'Add Words', icon: PlusCircle },
    { id: 'review', label: 'Review', icon: BookOpen },
    { id: 'table', label: 'Vocabulary', icon: List },
    { id: 'backup', label: 'Backup', icon: Shield },
  ];

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-b-[40px] shadow-lg z-0" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-40 right-20 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 text-white">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Vocabulary</h1>
            <p className="opacity-80 text-sm">Welcome back, {user?.email}</p>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
            <button
              onClick={signOut}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-md transition-all text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </header>

        {/* Navigation Tabs (Desktop) */}
        <div className="hidden md:flex justify-center mb-8">
          <div className="flex bg-white p-1.5 rounded-2xl shadow-lg shadow-purple-900/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab.id
                    ? 'text-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-indigo-50 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-24 left-4 right-4 bg-white rounded-2xl shadow-2xl p-4 z-50 origin-top"
            >
              <div className="flex flex-col gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as Tab)}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 font-medium'
                      }`}
                  >
                    <tab.icon className="w-5 h-5" /> {tab.label}
                  </button>
                ))}
                <div className="h-px bg-slate-100 my-2" />
                <button
                  onClick={signOut}
                  className="flex items-center gap-3 p-4 rounded-xl text-red-500 hover:bg-red-50 font-medium transition-all"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'add' && <AddWord />}
              {activeTab === 'review' && <ReviewMode />}
              {activeTab === 'table' && <WordTable />}
              {activeTab === 'backup' && <BackupRestore />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
