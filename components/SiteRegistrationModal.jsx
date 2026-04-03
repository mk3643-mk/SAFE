'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';

export default function SiteRegistrationModal({ isOpen, onClose }) {
  const { addSite } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    region: '서울권',
    type: 'ARCH',
    totalAmount: 0,
    subDirectAmt: 0,
    subProxyAmt: 0,
    demoStartDate: '',
    demoEndDate: '',
    mainStartDate: '2026-03-01',
    mainEndDate: '',
    isDemolition: false,
    managerName: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    addSite({
      ...formData,
      totalAmount: Number(formData.totalAmount),
      subDirectAmt: Number(formData.subDirectAmt || 0),
      subProxyAmt: Number(formData.subProxyAmt || 0)
    });
    onClose();
    setFormData({
      name: '',
      region: '서울권',
      type: 'ARCH',
      totalAmount: 0,
      subAmt: 0,
      subAppointmentType: 'NONE',
      demoStartDate: '',
      demoEndDate: '',
      mainStartDate: '2026-03-01',
      mainEndDate: '',
      isDemolition: false,
      managerName: '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">신규 현장 개요 등록</h3>
            <p className="text-sm text-gray-500 mt-1">현장의 기본 정보와 공사 규모를 입력해 주세요.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form id="site-reg-form" onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">현장명</label>
              <input
                required
                type="text"
                placeholder="예: 경기 C 데이터센터 현장"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">현장 소장</label>
              <input
                required
                type="text"
                placeholder="예: 홍길동"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">권역</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              >
                <option>서울권</option>
                <option>경기권</option>
                <option>강원권</option>
                <option>충남권</option>
                <option>영남권</option>
                <option>호남권</option>
                <option>제주권</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">공사 구분</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'ARCH' })}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                    formData.type === 'ARCH' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  건축
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'CIVIL' })}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                    formData.type === 'CIVIL' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  토목
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">총 공사금액 (억 원)</label>
              <input
                required
                type="number"
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              />
            </div>

            <div className="md:col-span-full border-t border-gray-100 pt-6">
              <div className="bg-blue-50/30 p-6 rounded-[32px] border border-blue-100/50 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                  <h4 className="text-sm font-black text-gray-900 leading-none">협력사(수급인) 관리자 선임 정보</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-500 ml-1">협력사 직접 선임 금액 합계 (억 원)</label>
                    <input
                      type="number"
                      placeholder="대상 금액 입력 (없으면 0)"
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white font-bold text-sm shadow-sm"
                      value={formData.subDirectAmt || 0}
                      onChange={(e) => setFormData({ ...formData, subDirectAmt: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-500 ml-1">원도급 대리 선임 금액 합계 (억 원)</label>
                    <input
                      type="number"
                      placeholder="대상 금액 입력 (없으면 0)"
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white font-bold text-sm shadow-sm"
                      value={formData.subProxyAmt || 0}
                      onChange={(e) => setFormData({ ...formData, subProxyAmt: e.target.value })}
                    />
                  </div>
                </div>

                <div className="bg-white/60 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-[11px] text-blue-700 font-bold leading-relaxed">
                    * 원도급 대리 선임 시 2개 이상의 협력사를 대리하는 경우에는 해당 협력사들의 공사금액 합계를 입력해 주세요.<br />
                    * 직접 선임과 대리 선임이 동시에 발생하는 경우 각각의 합계 금액을 모두 입력해 주시기 바랍니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-full border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between bg-red-50/50 p-4 rounded-2xl border border-red-100 mb-6">
                <div>
                  <p className="text-sm font-bold text-red-900">철거공사 포함 여부</p>
                  <p className="text-xs text-red-600 mt-1">철거공사가 있는 경우 해당 기간 동안 50% 감면이 적용됩니다. (종료 시 미체크)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.isDemolition}
                    onChange={(e) => setFormData({ ...formData, isDemolition: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {formData.isDemolition && (
                <div className="grid grid-cols-2 gap-4 p-5 bg-red-50/20 rounded-2xl border border-dashed border-red-200 mb-6 animate-in slide-in-from-top-2">
                  <div className="col-span-full text-xs font-bold text-red-800 mb-2">철거공사 기간 설정</div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">철거 착공일</label>
                    <input type="date" className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.demoStartDate} onChange={e => setFormData({...formData, demoStartDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">철거 종료일</label>
                    <input type="date" className="w-full px-4 py-2 rounded-xl border border-gray-200" value={formData.demoEndDate} onChange={e => setFormData({...formData, demoEndDate: e.target.value})} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <div className="col-span-full text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">본공사 기간 설정</div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">본공사 착공일</label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    value={formData.mainStartDate}
                    onChange={(e) => setFormData({ ...formData, mainStartDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">본공사 준공일</label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    value={formData.mainEndDate}
                    onChange={(e) => setFormData({ ...formData, mainEndDate: e.target.value })}
                  />
                </div>
                <p className="col-span-full text-[10px] text-gray-400 mt-1 italic">* 입력하신 본공사 기간의 전후 15% 시점에 50% 선임 기준이 자동 적용됩니다.</p>
              </div>
            </div>
          </div>

          </form>
        </div>
        
        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-3 mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            form="site-reg-form"
            type="submit"
            className="flex-[2] py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98] shadow-blue-200"
          >
            현장 등록 완료
          </button>
        </div>
      </div>
    </div>
  );
}
