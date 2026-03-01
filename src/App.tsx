import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search, Plus, Download, User, Menu, X, ChevronRight, LayoutGrid, List, Filter, ArrowLeft, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import type { Mod } from './types';

// --- Components ---

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                <LayoutGrid className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">CraftUp</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Browse</Link>
              <Link to="/publish" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Publish</Link>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search mods..." 
                className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all w-64"
              />
            </div>
            <button className="p-2 text-white/60 hover:text-white transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-white/60">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0a] border-b border-white/5"
          >
            <div className="px-4 py-4 space-y-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-white/60 hover:text-white">Browse</Link>
              <Link to="/publish" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-white/60 hover:text-white">Publish</Link>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Search mods..." 
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ModCard = ({ mod }: { mod: Mod }) => {
  return (
    <Link to={`/mod/${mod.id}`} className="group block">
      <motion.div 
        whileHover={{ y: -4 }}
        className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all"
      >
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={mod.imageUrl} 
            alt={mod.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
            {mod.category}
          </div>
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">{mod.name}</h3>
            <span className="text-xs text-white/40 font-mono">{mod.version}</span>
          </div>
          <p className="text-sm text-white/60 line-clamp-2 mb-4 h-10">{mod.description}</p>
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <User className="w-3 h-3" />
              <span>{mod.author}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
              <Download className="w-3 h-3" />
              <span>{(mod.downloads / 1000).toFixed(1)}k</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// --- Pages ---

const HomePage = () => {
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ["Optimization", "Map", "Utility", "World Gen", "Magic", "Tech"];

  useEffect(() => {
    const fetchMods = async () => {
      try {
        const url = new URL('/api/mods', window.location.origin);
        if (search) url.searchParams.append('search', search);
        if (selectedCategory) url.searchParams.append('category', selectedCategory);
        
        const res = await fetch(url.toString());
        const data = await res.json();
        setMods(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchMods, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
        >
          Elevate Your <span className="text-amber-500">Minecraft</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-white/60 max-w-2xl mx-auto"
        >
          Discover the most popular and innovative mods created by the community. 
          Fast, secure, and always up to date.
        </motion.p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              !selectedCategory ? "bg-amber-500 text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
            )}
          >
            All Mods
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                selectedCategory === cat ? "bg-amber-500 text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search mods..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-amber-500/50 transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-[#141414] border border-white/5 rounded-2xl h-[340px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {mods.map(mod => (
            <ModCard key={mod.id} mod={mod} />
          ))}
        </div>
      )}

      {!loading && mods.length === 0 && (
        <div className="text-center py-20">
          <p className="text-white/40 text-lg">No mods found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

const ModDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mod, setMod] = useState<Mod | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchMod = async () => {
      try {
        const res = await fetch(`/api/mods/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setMod(data);
      } catch (err) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchMod();
  }, [id, navigate]);

  const handleDownload = async () => {
    if (!mod) return;
    setDownloading(true);
    try {
      await fetch(`/api/mods/${mod.id}/download`, { method: 'POST' });
      setMod({ ...mod, downloads: mod.downloads + 1 });
      // Simulate file download
      const blob = new Blob(["Mock mod file content"], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${mod.name.replace(/\s+/g, '_')}_v${mod.version}.jar`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!mod) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to browse
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <img 
              src={mod.imageUrl} 
              alt={mod.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="bg-[#141414] border border-white/5 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Description</h2>
            <div className="prose prose-invert max-w-none prose-amber">
              <Markdown>{mod.longDescription || mod.description}</Markdown>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#141414] border border-white/5 rounded-3xl p-8 sticky top-24">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-white mb-2">{mod.name}</h1>
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <span>by</span>
                <span className="text-amber-500 font-medium">{mod.author}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-white/40 text-sm">Version</span>
                <span className="text-white font-mono text-sm">{mod.version}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-white/40 text-sm">Category</span>
                <span className="text-white text-sm">{mod.category}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-white/40 text-sm">Downloads</span>
                <span className="text-white text-sm font-medium">{mod.downloads.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-white/40 text-sm">Released</span>
                <span className="text-white text-sm">{new Date(mod.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <button 
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              {downloading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PublishPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    version: '1.20.1',
    author: 'Steve',
    category: 'Utility',
    imageUrl: '',
    adminPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/mods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        navigate('/');
      } else {
        setError(data.error || 'Failed to publish mod');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-4">Publish Your Mod</h1>
        <p className="text-white/60">Share your creation with millions of players worldwide. <span className="text-amber-500 font-bold">(Admin Only)</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-[#141414] border border-white/5 rounded-3xl p-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">Mod Name</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
              placeholder="e.g. Super Craft"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">Version</label>
            <input 
              required
              type="text" 
              value={formData.version}
              onChange={e => setFormData({...formData, version: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
              placeholder="1.20.1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/60">Short Description</label>
          <input 
            required
            type="text" 
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
            placeholder="A brief summary of what your mod does"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/60">Long Description (Markdown supported)</label>
          <textarea 
            required
            rows={8}
            value={formData.longDescription}
            onChange={e => setFormData({...formData, longDescription: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all resize-none"
            placeholder="# About this mod..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">Category</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all appearance-none"
            >
              <option value="Optimization">Optimization</option>
              <option value="Map">Map</option>
              <option value="Utility">Utility</option>
              <option value="World Gen">World Gen</option>
              <option value="Magic">Magic</option>
              <option value="Tech">Tech</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">Cover Image URL</label>
            <input 
              type="url" 
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500/50 transition-all"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-500">Admin Password</label>
            <input 
              required
              type="password" 
              value={formData.adminPassword}
              onChange={e => setFormData({...formData, adminPassword: e.target.value})}
              className="w-full bg-amber-500/5 border border-amber-500/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500 transition-all"
              placeholder="Enter password to publish"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={submitting}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Publish Mod
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-amber-500/30">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mod/:id" element={<ModDetailsPage />} />
            <Route path="/publish" element={<PublishPage />} />
          </Routes>
        </main>
        
        <footer className="border-t border-white/5 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4 text-black" />
                </div>
                <span className="font-bold tracking-tight text-white/80">CraftUp</span>
              </div>
              <p className="text-xs text-white/40">
                Created by <a href="https://www.facebook.com/anis.ighalloun.5" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">Anis ighalloun</a>
              </p>
            </div>
            <div className="flex gap-8 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
            </div>
            <p className="text-xs text-white/20">© 2024 CraftUp. Not an official Minecraft product.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
