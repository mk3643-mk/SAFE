'use client';

import React, { useState } from 'react';
import SiteDashboard from '../components/SiteDashboard.jsx';
import HRPoolManager from '../components/HRPoolManager.jsx';

export default function Page() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">KOSHA SAFE</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">HR Pool Integration</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              현장 대시보드
            </button>
            <button 
              onClick={() => setActiveTab('hr-pool')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'hr-pool' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              인력풀 관리
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900">관리자님</p>
              <p className="text-[10px] text-gray-500">본사 안전보건팀</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
               <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="max-w-[1600px] mx-auto px-8 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {activeTab === 'dashboard' ? '🏗️ 현장별 인력 현황' : '👥 전사 전문 인력풀'}
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              {activeTab === 'dashboard' 
                ? '실시간 공사비 기준 법정 인원과 현재 배치 현황을 비교 분석합니다.' 
                : '구성원별 자격사항 및 현재 배치 상태를 통합 관리합니다.'}
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Today</span>
              <span className="text-sm font-black text-gray-900 uppercase">2026. 03. 17</span>
            </div>
            <div className="w-px h-8 bg-gray-100"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
              <span className="text-sm font-black text-green-600 uppercase">Connected</span>
            </div>
          </div>
        </div>

        {/* Dynamic Component */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'dashboard' ? <SiteDashboard /> : <HRPoolManager />}
        </div>
      </div>
    </main>
  );
}
