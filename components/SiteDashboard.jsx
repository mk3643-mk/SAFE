'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { calculateRequiredStaff } from '../utils/calculator.js';
import { validateAssignment } from '../utils/validator.js';
import AssignmentModal from './AssignmentModal.jsx';
import SiteRegistrationModal from './SiteRegistrationModal.jsx';

export default function SiteDashboard() {
  const { hrPool, sites, unassignStaff } = useStore();
  const [modal, setModal] = useState({ open: false, siteId: null, roleType: null });
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);

  const handleUnassign = (staff, site) => {
    const validation = validateAssignment(staff, site, 'UNASSIGN');
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
    unassignStaff(staff.id);
  };

  return (
    <div className="space-y-8">
      {/* 등록 버튼 섹션 */}
      <div className="flex justify-end">
        <button 
          onClick={() => setIsRegModalOpen(true)}
          className="group flex items-center gap-2 bg-white text-gray-900 px-6 py-4 rounded-2xl font-bold shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span>현장 개요 신규 등록</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {sites.map(site => {
          const requirements = calculateRequiredStaff(site);
          const assignedSafety = hrPool.filter(h => h.assignedSiteId === site.id && (h.licenseType === 'SAFETY' || h.licenseType === 'DUAL'));
          const assignedHealth = hrPool.filter(h => h.assignedSiteId === site.id && h.licenseType === 'HEALTH');
          
          const needSafety = Math.max(0, requirements.safety - assignedSafety.length);
          const needHealth = Math.max(0, requirements.health - assignedHealth.length);

          return (
            <div key={site.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-8 border-b border-gray-50 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 group flex items-center gap-2">
                    {site.name}
                    <span className="text-xs font-normal bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{site.region}</span>
                  </h2>
                  <p className="text-gray-500 mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    총 공사비 {site.totalAmount.toLocaleString()}억 원
                  </p>
                </div>
                {site.isSubProxy && (
                  <span className="bg-amber-50 text-amber-700 text-[11px] font-bold px-3 py-1 rounded-full ring-1 ring-amber-100">대리 선임 차감 적용</span>
                )}
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50">
                {/* 안전관리자 섹션 */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm font-bold text-gray-700">안전관리자 현황</p>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">법정: {requirements.safety}명</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all" 
                        style={{ width: `${(assignedSafety.length / requirements.safety) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{assignedSafety.length} / {requirements.safety}</span>
                  </div>
                  {needSafety > 0 && (
                    <p className="text-red-500 font-bold text-xs mb-3 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                      {needSafety}명 추가 배치 필요
                    </p>
                  )}
                  <button 
                    onClick={() => setModal({open: true, siteId: site.id, roleType: 'SAFETY'})} 
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                  >
                    인력풀에서 찾기
                  </button>
                </div>

                {/* 보건관리자 섹션 */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm font-bold text-gray-700">보건관리자 현황</p>
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">법정: {requirements.health}명</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all" 
                        style={{ width: `${(assignedHealth.length / requirements.health) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{assignedHealth.length} / {requirements.health}</span>
                  </div>
                  {needHealth > 0 && (
                    <p className="text-red-500 font-bold text-xs mb-3 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                      {needHealth}명 추가 배치 필요
                    </p>
                  )}
                  <button 
                    onClick={() => setModal({open: true, siteId: site.id, roleType: 'HEALTH'})} 
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                  >
                    인력풀에서 찾기
                  </button>
                </div>
              </div>

              <div className="p-8 pt-0">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">현재 배치 완료 인원</p>
                <div className="space-y-2">
                  {[...assignedSafety, ...assignedHealth].length > 0 ? (
                    [...assignedSafety, ...assignedHealth].map(staff => (
                      <div key={staff.id} className="flex justify-between items-center bg-white border border-gray-100 px-4 py-3 rounded-xl shadow-sm hover:border-gray-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs">
                            {staff.name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-800">{staff.name}</span>
                              <span className="text-[10px] text-gray-400 font-medium">{staff.rank}</span>
                              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase font-medium">
                                {staff.licenseType}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {staff.empType === 'PROJECT' ? '프로젝트직' : '정규직'} · {staff.experience}년차
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {staff.empType === 'PROJECT' && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                              이동불가
                            </div>
                          )}
                          <button 
                            onClick={() => handleUnassign(staff, site)} 
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic text-center py-4">배치된 인원이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AssignmentModal 
        isOpen={modal.open} 
        onClose={() => setModal({open: false, siteId: null, roleType: null})}
        siteId={modal.siteId}
        roleType={modal.roleType}
      />

      <SiteRegistrationModal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
      />
    </div>
  );
}
