'use client';

import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { PipelineTab } from '../components/PipelineTab';
import { BenchmarkTab } from '../components/BenchmarkTab';
import { SandboxTab } from '../components/SandboxTab';
import { TheoryTab } from '../components/TheoryTab';
import { PresentationTab } from '../components/PresentationTab';
import { Language } from '../lib/translations';
import { Github, ExternalLink, Activity, Sparkles, BookOpen } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('pipeline');
  const [lang, setLang] = useState<Language>('tr');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'pipeline' && <PipelineTab lang={lang} />}
        {activeTab === 'benchmark' && <BenchmarkTab lang={lang} />}
        {activeTab === 'sandbox' && <SandboxTab lang={lang} />}
        {activeTab === 'theory' && <TheoryTab lang={lang} />}
        {activeTab === 'presentation' && <PresentationTab lang={lang} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/60 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-semibold">ConfIC-RCA Interactive Web Platform</span>
            <span>•</span>
            <span>IEEE TMI / arXiv:2503.04522</span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://arxiv.org/abs/2503.04522"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 flex items-center space-x-1 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ArXiv Makalesi</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
            <a
              href="https://github.com/mcosarinsky/Conformal-In-Context-RCA"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 flex items-center space-x-1 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Resmi Kod Deposu</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
