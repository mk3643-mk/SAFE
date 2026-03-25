'use client';

import React from 'react';
import { useStore } from '../store/useStore.js';

export default function AssignmentModal({ isOpen, onClose, siteId, roleType }) {
  const { hrPool, assignStaff } = useStore();

  if (!isOpen) return null;

  const availableStaff = hrPool.filter(staff => 
    staff.assignedSiteId === null && 
    (staff.licenseType === roleType || staff.licenseType === 'DUAL')
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">
            가용 인력풀 조회 <span className="text-blue-600">({roleType === 'SAFETY' ? '안전' : '보건'})</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
          {availableStaff.length > 0 ? (
            availableStaff.map(staff => (
              <div key={staff.id} className="group flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800">{staff.name}</p>
                    <span className="text-xs text-gray-400">{staff.rank}</span>
                    {staff.licenseType === 'DUAL' && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">중복자격</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    경력 {staff.experience}년 · {staff.empType === 'PROJECT' ? '프로젝트직' : '정규직'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    assignStaff(staff.id, siteId);
                    onClose();
                  }}
                  className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
                >
                  배치하기
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <div className="bg-gray-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-500">조건에 맞는 가용 인력이 없습니다.</p>
              <p className="text-sm text-gray-400 mt-1">신규 채용이 필요합니다.</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={onClose} 
            className="w-full bg-white border border-gray-200 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
