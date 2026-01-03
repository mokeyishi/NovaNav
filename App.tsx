
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import BookmarkCard from './components/BookmarkCard';
import { CATEGORIES, INITIAL_BOOKMARKS } from './constants';
import { Icons } from './components/Icons';

const App: React.FC = () => {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const CategoryIcon = ({ type, className }: { type: string; className?: string }) => {
    switch (type) {
      case 'tools': return <Icons.Tools className={className} />;
      case 'media': return <Icons.Media className={className} />;
      case 'resources': return <Icons.Resources className={className} />;
      case 'misc': return <Icons.Misc className={className} />;
      default: return <Icons.All className={className} />;
    }
  };

  const filteredBookmarks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let list = INITIAL_BOOKMARKS;
    if (q) {
      list = list.filter(b => 
        b.name.toLowerCase().includes(q) || 
        b.description.toLowerCase().includes(q)
      );
    }
    if (activeCategoryId) {
      list = list.filter(b => b.categoryId === activeCategoryId);
    }
    return list;
  }, [searchQuery, activeCategoryId]);

  return (
    <div className="min-h-screen flex">
      <div className="mesh-gradient"></div>
      
      {/* Sidebar */}
      <aside className="w-72 glass hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 border-r border-black/5">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Icons.Prod className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">NovaNav</span>
          </div>

          <div className="mb-8 px-2">
            <div className="relative group">
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="搜索站点..." 
                className="w-full h-12 bg-black/5 border border-black/5 rounded-2xl px-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-900 group-hover:bg-black/10" 
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {searchQuery ? <Icons.X className="h-4 w-4 cursor-pointer" onClick={() => setSearchQuery('')} /> : <Icons.Search className="h-4 w-4" />}
              </div>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            <div className="pb-3 px-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">分类导航</span>
            </div>
            <button 
              onClick={() => { setActiveCategoryId(null); setSearchQuery(''); }} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-sm font-medium ${!activeCategoryId && !searchQuery ? 'sidebar-item-active' : 'text-slate-500 hover:bg-black/5 hover:text-slate-900'}`}
            >
              <Icons.All className="w-5 h-5" />
              <span>全部站点</span>
            </button>
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => { setActiveCategoryId(cat.id); setSearchQuery(''); }} 
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-sm font-medium ${activeCategoryId === cat.id && !searchQuery ? 'sidebar-item-active' : 'text-slate-500 hover:bg-black/5 hover:text-slate-900'}`}
              >
                <CategoryIcon type={cat.iconType} className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        <Header />
        <main className="px-6 pb-24 max-w-[1400px] w-full flex-1">
          {activeCategoryId || searchQuery ? (
            <div className="space-y-10 animate-in">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">
                  {searchQuery ? `搜索结果: ${searchQuery}` : CATEGORIES.find(c => c.id === activeCategoryId)?.name}
                </h2>
                <span className="text-sm text-slate-400 font-medium">{filteredBookmarks.length} 个结果</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredBookmarks.map(bookmark => (
                  <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
              {filteredBookmarks.length === 0 && (
                <div className="py-20 text-center">
                  <div className="text-slate-300 mb-4 flex justify-center"><Icons.Search className="w-12 h-12" /></div>
                  <p className="text-slate-500">未找到相关站点</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-16 animate-in">
              {CATEGORIES.map(cat => {
                const catBookmarks = INITIAL_BOOKMARKS.filter(b => b.categoryId === cat.id);
                if (catBookmarks.length === 0) return null;
                return (
                  <section key={cat.id}>
                    <div className="flex items-center gap-3 mb-6 group">
                      <CategoryIcon type={cat.iconType} className="w-5 h-5 text-slate-400" />
                      <h2 className="text-base font-bold text-slate-800 tracking-wide uppercase">{cat.name}</h2>
                      <div className="h-[1px] bg-black/5 flex-1 ml-4"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {catBookmarks.map(bookmark => (
                        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
