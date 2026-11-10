'use client';

import React from 'react';
import { Activity, BarChart2, ShieldAlert, BookOpen, GraduationCap, Globe } from 'lucide-react';
import { Language, TRANSLATIONS } from '../lib/translations';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, lang, setLang }) => {
  const t = TRANSLATIONS[lang];

  const navItems = [
    { id: 'pipeline', label: t.tabs.pipeline, icon: Activity },
    { id: 'benchmark', label: t.tabs.benchmark, icon: BarChart2 },
    { id: 'sandbox', label: t.tabs.sandbox, icon: ShieldAlert },
    { id: 'theory', label: t.tabs.theory, icon: BookOpen },
    { id: 'presentation', label: t.tabs.presentation, icon: GraduationCap, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
              <Activity className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-white tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  ConfIC-RCA
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  IEEE TMI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate max-w-md">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                    isActive
                      ? item.highlight
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                        : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : item.highlight
                      ? 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? (item.highlight ? 'text-amber-400' : 'text-cyan-400') : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Language Switcher */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
              title="Dili Değiştir / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold">{lang === 'tr' ? 'TR 🇹🇷' : 'EN 🇬🇧'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-800/80 space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
