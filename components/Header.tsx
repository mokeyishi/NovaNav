
import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('早上好');
    else if (hours < 18) setGreeting('下午好');
    else setGreeting('晚上好');
  }, []);

  return (
    <header className="pt-12 pb-8 px-6 text-left">
      <div className="mb-2">
        <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight text-slate-900">
          {greeting}，<span className="gradient-text">探索者</span>。
        </h1>
        <p className="text-slate-500 text-base">欢迎回来，今天想开启哪项任务？</p>
      </div>
    </header>
  );
};

export default Header;
