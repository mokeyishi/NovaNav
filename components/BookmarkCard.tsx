
import React from 'react';
import { Bookmark } from '../types';

interface BookmarkCardProps {
  bookmark: Bookmark;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark }) => {
  return (
    <a
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass group flex items-start p-4 rounded-[1.25rem] transition-all duration-300 border border-black/[0.05] hover:border-blue-500 hover:shadow-[0_8px_30px_rgb(59,130,246,0.15)]"
    >
      {/* 左侧图标容器 */}
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-500 shadow-sm mr-4">
        <img 
          src={bookmark.icon} 
          alt={bookmark.name} 
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${bookmark.name}&background=random&color=fff&size=128`;
          }}
        />
      </div>

      {/* 右侧文本内容容器 */}
      <div className="flex-1 min-w-0 flex flex-col pt-0.5">
        <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-500 transition-colors mb-1">
          {bookmark.name}
        </h3>
        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 opacity-100 transition-opacity">
          {bookmark.description}
        </p>
      </div>
    </a>
  );
};

export default BookmarkCard;
