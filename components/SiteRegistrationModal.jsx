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
    subAmt: 0,
    isSubProxy: false,
    endDate: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    addSite({
      ...formData,
      totalAmount: Number(formData.totalAmount),
      subAmt: Number(formData.subAmt)
    });
    onClose();
    setFormData({
      name: '',
      region: '서울권',
      type: 'ARCH',
      totalAmount: 0,
      subAmt: 0,
      isSubProxy: false,
      endDate: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
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

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
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

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">권역</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              >
                <option>서울권</option>
                <option>경기권</option>
                <option>영남권</option>
                <option>호남권</option>
                <option>충청권</option>
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

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">준공 예정일</label>
              <input
                required
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <div className="col-span-full bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-blue-900">수급인 대리 선임 조건</p>
                  <p className="text-xs text-blue-600 mt-1">100억 이상의 수급인 공사 금액이 있는 경우 대리 선임 차감이 적용됩니다.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.isSubProxy}
                    onChange={(e) => setFormData({ ...formData, isSubProxy: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {formData.isSubProxy && (
                <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-bold text-blue-800 mb-2">대상 수급인 공사 금액 (억 원)</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                    value={formData.subAmt}
                    onChange={(e) => setFormData({ ...formData, subAmt: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-[2] py-4 rounded-xl font-bold text-white bg-gray-900 hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]"
            >
              현장 등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
