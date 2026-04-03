'use client';

import React, { useState } from 'react';
import { useStore } from '../../store/useStore.js';

export default function MobileSiteJoinPage() {
  const { addSite } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    region: '서울권',
    type: 'ARCH',
    totalAmount: '',
    subDirectAmt: 0,
    subProxyAmt: 0,
    demoStartDate: '',
    demoEndDate: '',
    mainStartDate: '2026-03-01',
    mainEndDate: '',
    isDemolition: false,
    managerName: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    addSite({
      ...formData,
      totalAmount: Number(formData.totalAmount),
      subDirectAmt: Number(formData.subDirectAmt || 0),
      subProxyAmt: Number(formData.subProxyAmt || 0),
      status: 'PENDING' // QR 등록은 승인대기 상태로 저장
    });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">현장 등록 제출 완료</h1>
        <p className="text-gray-500 font-bold mb-8">
          현장 개요 정보가 정상적으로 제출되었습니다.<br />
          본사 관리자 승인 후 대시보드에 활성화됩니다.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full max-w-xs py-4 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-xl"
        >
          확인
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-indigo-600 p-8 rounded-b-[40px] shadow-lg mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">신규 현장 개요 등록</h1>
        </div>
        <p className="text-indigo-100 font-bold">새로운 프로젝트의 기본 정보와 공사 규모를 입력해 주세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 pb-20 space-y-8">
        <section className="space-y-4">
          <h3 className="text-lg font-black text-gray-900 border-l-4 border-indigo-600 pl-3">현장 기본 정보</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">현장명</label>
              <input required type="text" placeholder="예: 경기 C 데이터센터 현장" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 outline-none transition-all" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">현장 소장명</label>
              <input required type="text" placeholder="이름 입력" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 outline-none transition-all" value={formData.managerName} onChange={(e) => setFormData({ ...formData, managerName: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">권역 구분</label>
                <select className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 outline-none transition-all appearance-none" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })}>
                  {['서울권', '경기권', '강원권', '충남권', '영남권', '호남권', '제주권'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">공사 타입</label>
                <div className="flex gap-2">
                  {['ARCH', 'CIVIL'].map(t => (
                    <button key={t} type="button" onClick={() => setFormData({ ...formData, type: t })} className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all ${formData.type === t ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                      {t === 'ARCH' ? '건축' : '토목'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">총 공사금액 (억 원)</label>
              <input required type="number" placeholder="0" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 outline-none transition-all" value={formData.totalAmount} onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })} />
            </div>

            <div className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100/50 space-y-6 shadow-inner mt-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-indigo-600 rounded-full"></div>
                <label className="text-sm font-black text-gray-900 leading-none">협력사(수급인) 선임 금액</label>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-indigo-400 ml-1">협력사 직접 선임 합계 (억)</label>
                  <input
                    type="number"
                    placeholder="대상 금액 (없으면 0)"
                    className="w-full px-5 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 outline-none shadow-sm"
                    value={formData.subDirectAmt}
                    onChange={(e) => setFormData({ ...formData, subDirectAmt: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-indigo-400 ml-1">원도급 대리 선임 합계 (억)</label>
                  <input
                    type="number"
                    placeholder="대상 금액 (없으면 0)"
                    className="w-full px-5 py-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 outline-none shadow-sm"
                    value={formData.subProxyAmt}
                    onChange={(e) => setFormData({ ...formData, subProxyAmt: e.target.value })}
                  />
                </div>

                <div className="p-4 bg-white/80 rounded-2xl border border-indigo-100 flex items-start gap-2.5 shadow-sm">
                  <svg className="w-4 h-4 text-indigo-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-[10px] text-indigo-600 font-black leading-relaxed">
                    * 대리 선임 시 2개 이상의 협력사가 있다면 해당 협력사들의 공사금액 합계를 입력해주세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-black text-gray-900 border-l-4 border-indigo-600 pl-3">공사 기간 및 특이사항</h3>
          
          <div className="space-y-5">
             <div className="bg-red-50 p-5 rounded-3xl border border-red-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-black text-red-900">철거공사 포함</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formData.isDemolition} onChange={(e) => setFormData({ ...formData, isDemolition: e.target.checked })} />
                    <div className="w-11 h-6 bg-red-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                <p className="text-[10px] text-red-600 font-bold">철거 기간 중 안전관리 선임 50% 감면 혜택이 적용됩니다. (종료 시 미체크)</p>
                
                {formData.isDemolition && (
                  <div className="grid grid-cols-2 gap-3 mt-4 animate-in slide-in-from-top-2">
                    <input type="date" className="px-3 py-3 rounded-xl bg-white border-none font-black text-[10px]" value={formData.demoStartDate} onChange={e => setFormData({...formData, demoStartDate: e.target.value})} />
                    <input type="date" className="px-3 py-3 rounded-xl bg-white border-none font-black text-[10px]" value={formData.demoEndDate} onChange={e => setFormData({...formData, demoEndDate: e.target.value})} />
                  </div>
                )}
             </div>

             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">본공사 착공일</label>
                    <input required type="date" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 outline-none transition-all" value={formData.mainStartDate} onChange={(e) => setFormData({ ...formData, mainStartDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">본공사 준공일</label>
                    <input required type="date" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 outline-none transition-all" value={formData.mainEndDate} onChange={(e) => setFormData({ ...formData, mainEndDate: e.target.value })} />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-bold px-1">* 준공 전후 기간 50% 고용 기준이 자동 적용됩니다.</p>
             </div>
          </div>
        </section>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-100 z-50">
          <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-2xl active:scale-[0.98] transition-all">
            현장 등록 제출하기
          </button>
        </div>
      </form>
    </div>
  );
}
