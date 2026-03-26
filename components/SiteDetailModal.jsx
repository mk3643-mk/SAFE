import React from 'react';
import { calculateRequiredStaff } from '../utils/calculator.js';

export default function SiteDetailModal({ isOpen, onClose, site, hrPool }) {
  if (!isOpen || !site) return null;

  const requirements = calculateRequiredStaff(site);
  const assignedSafety = hrPool.filter(h => h.assignedSiteId === site.id && (h.licenseType === 'SAFETY' || h.licenseType === 'DUAL'));
  const assignedHealth = hrPool.filter(h => h.assignedSiteId === site.id && h.licenseType === 'HEALTH');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">{site.name}</h2>
            <div className="flex gap-2 mt-2">
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{site.region}</span>
              <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{site.type === 'ARCH' ? '건축' : '토목'}</span>
              {site.isSubProxy && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">대리 선임 적용</span>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-gray-400 uppercase">총 공사 금액</p>
              <p className="text-lg font-black text-gray-900 mt-1">{site.totalAmount.toLocaleString()}억 원</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-gray-400 uppercase">하도급 금액</p>
              <p className="text-lg font-black text-gray-900 mt-1">{site.subAmt ? `${site.subAmt.toLocaleString()}억 원` : '해당없음'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase">준공 예정일</p>
              <p className="text-lg font-black text-gray-900 mt-1">{site.endDate || '미정'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">법정 선임 현황</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-100 p-3 rounded-xl">
                <p className="text-xs text-gray-500 font-bold mb-1">안전관리자</p>
                <div className="flex justify-between items-end">
                  <span className="text-xl font-black text-blue-600">{assignedSafety.length} <span className="text-sm text-gray-400 font-normal">/ {requirements.safety}명</span></span>
                </div>
              </div>
              <div className="border border-gray-100 p-3 rounded-xl">
                <p className="text-xs text-gray-500 font-bold mb-1">보건관리자</p>
                <div className="flex justify-between items-end">
                  <span className="text-xl font-black text-emerald-600">{assignedHealth.length} <span className="text-sm text-gray-400 font-normal">/ {requirements.health}명</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
