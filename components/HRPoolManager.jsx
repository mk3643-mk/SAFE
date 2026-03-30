'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import StaffRegistrationModal from './StaffRegistrationModal.jsx';
import StaffDetailModal from './StaffDetailModal.jsx';
import { calculateAge } from '../utils/calculator.js';

export default function HRPoolManager() {
  const { hrPool, sites, removeStaff } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModalStaff, setDetailModalStaff] = useState(null);

  const getSiteName = (id) => sites.find(s => s.id === id)?.name || '미배치';

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">전사 인력풀 현황</h2>
          <p className="text-gray-500 mt-1">총 {hrPool.length}명의 전문 인력이 등록되어 있습니다.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm"
        >
          신규 인력 등록
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="px-8 py-4">성명 / 경력</th>
              <th className="px-8 py-4">구분 / 자격</th>
              <th className="px-8 py-4">현재 소속 현장</th>
              <th className="px-8 py-4">상태 / 관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {hrPool.map(staff => (
              <tr 
                key={staff.id} 
                className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                onClick={() => setDetailModalStaff(staff)}
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-700 overflow-hidden shadow-sm">
                      {staff.photo ? (
                        <img src={staff.photo} alt={staff.name} className="w-full h-full object-cover" />
                      ) : (
                        staff.name[0]
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {staff.name} <span className="text-xs font-medium text-gray-400 ml-1">{staff.rank}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {staff.birthDate ? `만 ${calculateAge(staff.birthDate)}세` : (staff.age ? `만 ${staff.age}세` : '-')} · 경력 {staff.experience}년차
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                      staff.empType === 'REGULAR' ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'
                    }`}>
                      {staff.empType === 'REGULAR' ? '정규직' : '프로젝트직'}
                    </span>
                    <p className="text-sm text-gray-600">{staff.licenses.join(', ')}</p>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${staff.assignedSiteId ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <span className={`text-sm ${staff.assignedSiteId ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                      {getSiteName(staff.assignedSiteId)}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      staff.assignedSiteId ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {staff.assignedSiteId ? '배치중' : '가용'}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`${staff.name} 님의 인력 정보를 완전 삭제하시겠습니까?`)) {
                          removeStaff(staff.id);
                        }
                      }}
                      className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                      title="인력 정보 삭제"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StaffRegistrationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
      <StaffDetailModal 
        isOpen={!!detailModalStaff} 
        onClose={() => setDetailModalStaff(null)} 
        staff={detailModalStaff}
        sites={sites}
      />
    </div>
  );
}
