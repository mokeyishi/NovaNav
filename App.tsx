
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Header from './components/Header';
import BookmarkCard from './components/BookmarkCard';
import { CATEGORIES as INITIAL_CAT, INITIAL_BOOKMARKS } from './constants';
import { Icons } from './components/Icons';
import { Category, Bookmark } from './types';

const ADMIN_PASSWORD = 'Zz1158705239.';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 分钟

const App: React.FC = () => {
  // --- 状态管理与持久化 ---
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('novanav_categories');
    return saved ? JSON.parse(saved) : INITIAL_CAT;
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('novanav_bookmarks');
    return saved ? JSON.parse(saved) : INITIAL_BOOKMARKS;
  });

  // 安全与锁定逻辑
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInput, setAuthInput] = useState('');
  
  const [failedAttempts, setFailedAttempts] = useState(() => 
    Number(localStorage.getItem('novanav_failed_attempts') || 0)
  );
  const [lockoutUntil, setLockoutUntil] = useState(() => 
    Number(localStorage.getItem('novanav_lockout_until') || 0)
  );
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  
  // 拖拽状态
  const [draggedCatIndex, setDraggedCatIndex] = useState<number | null>(null);
  const [draggedBookmarkId, setDraggedBookmarkId] = useState<string | null>(null);

  // 弹窗状态
  const [showAddSite, setShowAddSite] = useState(false);
  const [showAddCat, setShowAddCat] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [newSite, setNewSite] = useState({ name: '', url: '', description: '', icon: '', categoryId: '' });
  const [newCat, setNewCat] = useState({ name: '', iconType: 'misc' as Category['iconType'] });

  // 维护锁定倒计时
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('novanav_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('novanav_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const isLocked = lockoutUntil > currentTime;
  const remainingTime = isLocked ? Math.ceil((lockoutUntil - currentTime) / 1000) : 0;

  // --- 权限逻辑 ---
  const handleToggleEdit = () => {
    if (isEditMode) {
      setIsEditMode(false);
      return;
    }
    if (isAuthorized) {
      setIsEditMode(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    if (authInput === ADMIN_PASSWORD) {
      setIsAuthorized(true);
      setIsEditMode(true);
      setShowAuthModal(false);
      setFailedAttempts(0);
      setLockoutUntil(0);
      localStorage.removeItem('novanav_failed_attempts');
      localStorage.removeItem('novanav_lockout_until');
    } else {
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);
      localStorage.setItem('novanav_failed_attempts', newCount.toString());

      if (newCount >= MAX_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_DURATION;
        setLockoutUntil(lockTime);
        localStorage.setItem('novanav_lockout_until', lockTime.toString());
      }
    }
    setAuthInput('');
  };

  // --- 拖拽逻辑 ---
  const handleCatDragStart = (index: number) => {
    if (!isEditMode) return;
    setDraggedCatIndex(index);
  };

  const handleCatDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedCatIndex === null || draggedCatIndex === index) return;
    const newCats = [...categories];
    const draggedItem = newCats[draggedCatIndex];
    newCats.splice(draggedCatIndex, 1);
    newCats.splice(index, 0, draggedItem);
    setCategories(newCats);
    setDraggedCatIndex(index);
  };

  const handleBookmarkDragStart = (id: string) => {
    if (!isEditMode) return;
    setDraggedBookmarkId(id);
  };

  const handleBookmarkDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedBookmarkId === null || draggedBookmarkId === targetId) return;
    const sourceIdx = bookmarks.findIndex(b => b.id === draggedBookmarkId);
    const targetIdx = bookmarks.findIndex(b => b.id === targetId);
    if (bookmarks[sourceIdx].categoryId !== bookmarks[targetIdx].categoryId) return;
    const newBookmarks = [...bookmarks];
    const draggedItem = newBookmarks[sourceIdx];
    newBookmarks.splice(sourceIdx, 1);
    newBookmarks.splice(targetIdx, 0, draggedItem);
    setBookmarks(newBookmarks);
  };

  // --- 基础增删改逻辑 ---
  const openAddSiteModal = (categoryId: string = '') => {
    setEditingSiteId(null);
    setNewSite({ name: '', url: '', description: '', icon: '', categoryId });
    setShowAddSite(true);
  };

  const openEditSiteModal = (site: Bookmark) => {
    setEditingSiteId(site.id);
    setNewSite({ 
      name: site.name, 
      url: site.url, 
      description: site.description, 
      icon: site.icon, 
      categoryId: site.categoryId 
    });
    setShowAddSite(true);
  };

  const handleSaveSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.name || !newSite.url || !newSite.categoryId) return;
    
    let iconUrl = newSite.icon.trim();
    if (!iconUrl) {
      try { 
        iconUrl = `${new URL(newSite.url).origin}/favicon.ico`; 
      } catch { 
        iconUrl = ''; 
      }
    }

    if (editingSiteId) {
      // 编辑逻辑
      setBookmarks(bookmarks.map(b => b.id === editingSiteId ? {
        ...b,
        name: newSite.name,
        url: newSite.url,
        description: newSite.description,
        icon: iconUrl,
        categoryId: newSite.categoryId
      } : b));
    } else {
      // 新增逻辑
      const site: Bookmark = { 
        id: Date.now().toString(),
        name: newSite.name,
        url: newSite.url,
        description: newSite.description,
        icon: iconUrl,
        categoryId: newSite.categoryId
      };
      setBookmarks([...bookmarks, site]);
    }

    setNewSite({ name: '', url: '', description: '', icon: '', categoryId: '' });
    setEditingSiteId(null);
    setShowAddSite(false);
  };

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name) return;
    const cat: Category = { id: 'cat_' + Date.now().toString(), name: newCat.name, iconType: newCat.iconType };
    setCategories([...categories, cat]);
    setNewCat({ name: '', iconType: 'misc' });
    setShowAddCat(false);
  };

  const deleteBookmark = (id: string) => {
    if (confirm('确定要删除这个站点吗？')) setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const deleteCategory = (id: string) => {
    if (confirm('确定要删除整个分类及其站点吗？')) {
      setCategories(categories.filter(c => c.id !== id));
      setBookmarks(bookmarks.filter(b => b.categoryId !== id));
      if (activeCategoryId === id) setActiveCategoryId(null);
    }
  };

  const CategoryIcon = ({ type, className }: { type: string; className?: string }) => {
    switch (type) {
      case 'tools': return <Icons.Tools className={className} />;
      case 'media': return <Icons.Media className={className} />;
      case 'resources': return <Icons.Resources className={className} />;
      case 'misc': return <Icons.Misc className={className} />;
      default: return <Icons.All className={className} />;
    }
  };

  const localSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return bookmarks.filter(b => b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || b.url.toLowerCase().includes(q));
  }, [searchQuery, bookmarks]);

  return (
    <div className="min-h-screen flex">
      <div className="mesh-gradient"></div>
      
      {/* Sidebar */}
      <aside className="w-72 glass hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 border-r border-black/5 overflow-hidden">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Icons.Prod className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">NovaNav</span>
          </div>

          <div className="mb-8 px-2">
            <div className="relative group">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索站点..." className="w-full h-12 bg-black/5 border border-black/5 rounded-2xl px-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-900 group-hover:bg-black/10" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {searchQuery ? <Icons.X className="h-4 w-4 cursor-pointer" onClick={() => setSearchQuery('')} /> : <Icons.Search className="h-4 w-4" />}
              </div>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            <div className="pb-3 px-4 flex items-center justify-between group/nav">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigation</span>
              {isEditMode && (
                <button onClick={() => setShowAddCat(true)} className="p-1 hover:bg-black/5 rounded-md text-slate-400 hover:text-blue-500">
                  <Icons.X className="w-3 h-3 rotate-45" />
                </button>
              )}
            </div>
            <button onClick={() => { setActiveCategoryId(null); setSearchQuery(''); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-sm font-medium ${!activeCategoryId && !searchQuery ? 'sidebar-item-active' : 'text-slate-500 hover:bg-black/5 hover:text-slate-900'}`}>
              <Icons.All className="w-5 h-5" />
              <span>全部站点</span>
            </button>
            {categories.map((cat, idx) => (
              <div key={cat.id} draggable={isEditMode} onDragStart={() => handleCatDragStart(idx)} onDragOver={(e) => handleCatDragOver(e, idx)} onDragEnd={() => setDraggedCatIndex(null)} className={`group relative flex items-center transition-all ${draggedCatIndex === idx ? 'opacity-30 scale-95' : 'opacity-100'}`}>
                <button onClick={() => { setActiveCategoryId(cat.id); setSearchQuery(''); }} className={`flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-sm font-medium ${activeCategoryId === cat.id && !searchQuery ? 'sidebar-item-active' : 'text-slate-500 hover:bg-black/5 hover:text-slate-900'}`}>
                  <CategoryIcon type={cat.iconType} className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate pr-4">{cat.name}</span>
                </button>
                {isEditMode && (
                  <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icons.Grip className="w-3 h-3 text-slate-300 cursor-grab active:cursor-grabbing" />
                    <button onClick={() => deleteCategory(cat.id)} className="p-1 text-red-400 hover:text-red-600"><Icons.X className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-6 space-y-3">
            {isEditMode && (
              <button onClick={() => openAddSiteModal()} className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all">
                <Icons.X className="w-4 h-4 rotate-45" /> 新增站点
              </button>
            )}
            <button onClick={handleToggleEdit} className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${isEditMode ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-100' : 'bg-black/5 text-slate-400 hover:bg-black/10'}`}>
              {isEditMode ? <Icons.Unlock className="w-4 h-4" /> : <Icons.Lock className="w-4 h-4" />}
              {isEditMode ? '锁定布局' : '管理模式'}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        <Header />
        <main className="px-6 pb-24 max-w-[1400px] w-full flex-1">
          {searchQuery ? (
            <div className="animate-in grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {localSearchResults.map(bookmark => <BookmarkCard key={bookmark.id} bookmark={bookmark} />)}
            </div>
          ) : (
            <div className="space-y-20 animate-in">
              {activeCategoryId ? (
                <section>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><CategoryIcon type={categories.find(c => c.id === activeCategoryId)?.iconType || 'all'} className="w-8 h-8" /></div>
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">{categories.find(c => c.id === activeCategoryId)?.name}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {bookmarks.filter(b => b.categoryId === activeCategoryId).map(bookmark => (
                      <div key={bookmark.id} draggable={isEditMode} onDragStart={() => handleBookmarkDragStart(bookmark.id)} onDragOver={(e) => handleBookmarkDragOver(e, bookmark.id)} onDragEnd={() => setDraggedBookmarkId(null)} className={`relative group transition-all ${draggedBookmarkId === bookmark.id ? 'opacity-20 scale-95' : 'opacity-100'}`}>
                        <BookmarkCard bookmark={bookmark} />
                        {isEditMode && (
                          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                            <button onClick={() => openEditSiteModal(bookmark)} className="w-6 h-6 bg-white border border-slate-200 text-slate-500 rounded-full flex items-center justify-center hover:text-blue-500 shadow-md"><Icons.Edit className="w-3 h-3" /></button>
                            <div className="w-6 h-6 bg-white border border-slate-200 text-slate-300 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing"><Icons.Grip className="w-3 h-3"/></div>
                            <button onClick={() => deleteBookmark(bookmark.id)} className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"><Icons.X className="w-3 h-3" /></button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                categories.map(cat => {
                  const catBookmarks = bookmarks.filter(b => b.categoryId === cat.id);
                  if (catBookmarks.length === 0 && !isEditMode) return null;
                  return (
                    <section key={cat.id}>
                      <div className="flex items-center gap-3 mb-8 group">
                        <CategoryIcon type={cat.iconType} className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <h2 className="text-lg font-bold text-slate-800 tracking-wide uppercase">{cat.name}</h2>
                        <div className="h-[2px] bg-gradient-to-r from-black/5 to-transparent flex-1 ml-4 rounded-full"></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {catBookmarks.map(bookmark => (
                          <div key={bookmark.id} draggable={isEditMode} onDragStart={() => handleBookmarkDragStart(bookmark.id)} onDragOver={(e) => handleBookmarkDragOver(e, bookmark.id)} onDragEnd={() => setDraggedBookmarkId(null)} className={`relative group transition-all ${draggedBookmarkId === bookmark.id ? 'opacity-20 scale-95' : 'opacity-100'}`}>
                            <BookmarkCard bookmark={bookmark} />
                            {isEditMode && (
                              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                                <button onClick={() => openEditSiteModal(bookmark)} className="w-6 h-6 bg-white border border-slate-200 text-slate-500 rounded-full flex items-center justify-center hover:text-blue-500 shadow-md"><Icons.Edit className="w-3 h-3" /></button>
                                <div className="w-6 h-6 bg-white border border-slate-200 text-slate-300 rounded-full flex items-center justify-center cursor-grab"><Icons.Grip className="w-3 h-3"/></div>
                                <button onClick={() => deleteBookmark(bookmark.id)} className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"><Icons.X className="w-3 h-3" /></button>
                              </div>
                            )}
                          </div>
                        ))}
                        {isEditMode && (
                          <button onClick={() => openAddSiteModal(cat.id)} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-[1.25rem] text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all min-h-[92px] group">
                            <Icons.X className="w-5 h-5 rotate-45 group-hover:scale-110" />
                          </button>
                        )}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          )}
        </main>
      </div>

      {/* --- Auth Modal with Anti-Brute Force --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => !isLocked && setShowAuthModal(false)}></div>
          <div className="glass w-full max-w-sm rounded-[2.5rem] p-10 relative animate-in shadow-2xl">
            <form onSubmit={handleAuth} className="space-y-6 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isLocked ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                {isLocked ? <Icons.Lock className="w-8 h-8 text-red-500" /> : <Icons.Unlock className="w-8 h-8 text-blue-500" />}
              </div>
              
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-900">
                  {isLocked ? '账户已锁定' : '解锁管理权限'}
                </h3>
                <p className="text-slate-500 text-sm">
                  {isLocked ? '由于尝试次数过多，请稍后再试' : '请输入管理员密码以继续操作'}
                </p>
              </div>

              {isLocked ? (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <span className="text-red-600 font-bold text-lg tabular-nums">
                    {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
                  </span>
                  <p className="text-red-400 text-[10px] mt-1 uppercase tracking-wider font-bold">锁定倒计时</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <input 
                    type="password" autoFocus required placeholder="••••••••" 
                    className="w-full h-14 bg-black/5 border-none rounded-2xl px-6 text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={authInput} onChange={e => setAuthInput(e.target.value)} 
                  />
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">尝试次数</span>
                    <span className={`text-[10px] font-bold uppercase ${failedAttempts >= 4 ? 'text-red-500' : 'text-blue-500'}`}>
                      {MAX_ATTEMPTS - failedAttempts} / {MAX_ATTEMPTS} 剩余
                    </span>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLocked}
                className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${isLocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}`}
              >
                {isLocked ? '系统锁定中' : '验证并解锁'}
              </button>
              
              {!isLocked && (
                <button type="button" onClick={() => setShowAuthModal(false)} className="text-slate-400 text-xs hover:text-slate-600 transition-colors">取消</button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* --- Save Site Modal (Shared for Add & Edit) --- */}
      {(showAddSite || showAddCat) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setShowAddSite(false); setShowAddCat(false); setEditingSiteId(null); }}></div>
          <div className="glass w-full max-w-md rounded-[2.5rem] p-8 relative animate-in shadow-2xl">
            <button onClick={() => { setShowAddSite(false); setShowAddCat(false); setEditingSiteId(null); }} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900"><Icons.X className="w-5 h-5" /></button>
            {showAddSite ? (
              <form onSubmit={handleSaveSite} className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900">{editingSiteId ? '编辑站点' : '新增站点'}</h3>
                <div className="space-y-4">
                  <input required placeholder="名称 (如: Google)" className="w-full h-12 bg-black/5 border-none rounded-2xl px-5 text-sm" value={newSite.name} onChange={e => setNewSite({...newSite, name: e.target.value})} />
                  <input required type="url" placeholder="网址 (如: https://google.com)" className="w-full h-12 bg-black/5 border-none rounded-2xl px-5 text-sm" value={newSite.url} onChange={e => setNewSite({...newSite, url: e.target.value})} />
                  <input placeholder="图标 URL (可选，留空自动获取)" className="w-full h-12 bg-black/5 border-none rounded-2xl px-5 text-sm" value={newSite.icon} onChange={e => setNewSite({...newSite, icon: e.target.value})} />
                  <input placeholder="简短描述" className="w-full h-12 bg-black/5 border-none rounded-2xl px-5 text-sm" value={newSite.description} onChange={e => setNewSite({...newSite, description: e.target.value})} />
                  <select required className="w-full h-12 bg-black/5 border-none rounded-2xl px-5 text-sm appearance-none" value={newSite.categoryId} onChange={e => setNewSite({...newSite, categoryId: e.target.value})} >
                    <option value="">所属分类</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">
                  {editingSiteId ? '保存更改' : '确定新增'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAddCat} className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900">新建分类</h3>
                <div className="space-y-4">
                  <input required placeholder="分类名称" className="w-full h-12 bg-black/5 border-none rounded-2xl px-5 text-sm" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} />
                  <div className="grid grid-cols-4 gap-3">
                    {['tools', 'media', 'resources', 'misc'].map((type) => (
                      <button key={type} type="button" onClick={() => setNewCat({...newCat, iconType: type as any})} className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${newCat.iconType === type ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-transparent bg-black/5 text-slate-400'}`} >
                        <CategoryIcon type={type} className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold uppercase">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">保存分类</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
