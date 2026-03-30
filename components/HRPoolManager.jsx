'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import StaffRegistrationModal from './StaffRegistrationModal.jsx';
import StaffDetailModal from './StaffDetailModal.jsx';
import { calculateAge, isSeniorQualified } from '../utils/calculator.js';

export default function HRPoolManager() {
  const { hrPool, sites, removeStaff } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModalStaff, setDetailModalStaff] = useState(null);
  
  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    rank: 'ALL',
    job: 'ALL',
    status: 'ALL',
    site: 'ALL',
    experience: 'ALL',
    empType: 'ALL'
  });

  const getSiteName = (id) => sites.find(s => s.id === id)?.name || '미배치';

  // 필터링 로직
  const filteredPool = hrPool.filter(staff => {
    // 1. 텍스트 검색 (이름, 자격증)
    const matchesSearch = 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.licenses.some(l => l.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // 2. 직급 필터
    const matchesRank = filters.rank === 'ALL' || staff.rank === filters.rank;
    
    // 3. 직무 필터
    const matchesJob = filters.job === 'ALL' || staff.licenseType === filters.job;
    
    // 4. 상태 필터
    const isAssigned = !!staff.assignedSiteId;
    const matchesStatus = 
      filters.status === 'ALL' || 
      (filters.status === 'ASSIGNED' && isAssigned) || 
      (filters.status === 'AVAILABLE' && !isAssigned);
    
    // 5. 현장 필터
    const matchesSite = filters.site === 'ALL' || staff.assignedSiteId === filters.site;

    // 6. 경력 필터 (7년 이상)
    const matchesExperience = filters.experience === 'ALL' || (filters.experience === 'OVER_7' && staff.experience >= 7);

    // 7. 고용 형태 필터
    const matchesEmpType = filters.empType === 'ALL' || staff.empType === filters.empType;

    return matchesSearch && matchesRank && matchesJob && matchesStatus && matchesSite && matchesExperience && matchesEmpType;
  });

  const ranks = ['주임', '대리', '과장', '부장'];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
      <div className="p-8 border-b border-gray-100 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">전사 인력풀 현황</h2>
            <p className="text-gray-500 mt-1 text-sm font-medium">총 {hrPool.length}명의 전문 인력이 등록되어 있습니다.</p>
          </div>

          <div className="flex items-center gap-12 bg-gray-50 px-12 py-5 rounded-3xl border border-gray-100 shadow-inner">
            <div className="text-center">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">전체</p>
              <p className="text-3xl font-black text-gray-900 leading-none">{hrPool.length}</p>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <p className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-1">배치</p>
              <p className="text-3xl font-black text-blue-600 leading-none">{hrPool.filter(s => s.assignedSiteId).length}</p>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-1">가용</p>
              <p className="text-3xl font-black text-emerald-600 leading-none">{hrPool.filter(s => !s.assignedSiteId).length}</p>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-gray-800 transition-all shadow-xl active:scale-[0.96] flex items-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 4v16m8-8H4" />
            </svg>
            신규 인력 등록
          </button>
        </div>

        {/* 필터 바 */}
        <div className="flex flex-wrap items-center gap-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
          <div className="flex-1 min-w-[300px] relative">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="이름 또는 자격증 검색..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-black text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="px-5 py-4 bg-white border border-gray-200 rounded-2xl text-base font-black text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
            value={filters.rank}
            onChange={(e) => setFilters({...filters, rank: e.target.value})}
          >
            <option value="ALL">직급 전체</option>
            {ranks.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select 
            className="px-5 py-4 bg-white border border-gray-200 rounded-2xl text-base font-black text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
            value={filters.job}
            onChange={(e) => setFilters({...filters, job: e.target.value})}
          >
            <option value="ALL">직무 전체</option>
            <option value="SAFETY">안전</option>
            <option value="HEALTH">보건</option>
            <option value="DUAL">안전/보건</option>
          </select>

          <select 
            className="px-5 py-4 bg-white border border-gray-200 rounded-2xl text-base font-black text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="ALL">상태 전체</option>
            <option value="ASSIGNED">배치중</option>
            <option value="AVAILABLE">가용인력</option>
          </select>

          <select 
            className="px-5 py-4 bg-white border border-gray-200 rounded-2xl text-base font-black text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
            value={filters.experience}
            onChange={(e) => setFilters({...filters, experience: e.target.value})}
          >
            <option value="ALL">경력 전체</option>
            <option value="OVER_7">7년차 이상</option>
          </select>

          <select 
            className="px-5 py-4 bg-white border border-gray-200 rounded-2xl text-base font-black text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
            value={filters.empType}
            onChange={(e) => setFilters({...filters, empType: e.target.value})}
          >
            <option value="ALL">고용 형태 전체</option>
            <option value="REGULAR">정규직</option>
            <option value="PROJECT">계약직(P직)</option>
          </select>

          <select 
            className="px-5 py-4 bg-white border border-gray-200 rounded-2xl text-base font-black text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all max-w-[220px] cursor-pointer shadow-sm"
            value={filters.site}
            onChange={(e) => setFilters({...filters, site: e.target.value})}
          >
            <option value="ALL">소속 현장 전체</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          {(searchTerm || Object.values(filters).some(v => v !== 'ALL')) && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilters({rank:'ALL', job:'ALL', status:'ALL', site:'ALL', experience:'ALL', empType:'ALL'});
              }}
              className="px-4 py-3 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4l16 16m0-16L4 20" />
              </svg>
              필터 초기화
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100/80 text-base font-black text-gray-700 tracking-tight">
            <tr>
              <th className="px-8 py-5">성명 / 경력</th>
              <th className="px-8 py-5">고용형태</th>
              <th className="px-8 py-5">직무</th>
              <th className="px-8 py-5">자격</th>
              <th className="px-8 py-5">현재 소속 현장</th>
              <th className="px-8 py-5">상태 / 관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredPool.length > 0 ? filteredPool.map(staff => (
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
                      <p className="font-black text-xl text-gray-900">
                        {staff.name} <span className="text-sm font-bold text-gray-400 ml-1">{staff.rank}</span>
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-sm font-bold text-gray-600">
                          {staff.birthDate ? `만 ${calculateAge(staff.birthDate)}세` : (staff.age ? `만 ${staff.age}세` : '-')} · 경력 {staff.experience}년차
                        </p>
                        {staff.experience >= 7 && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-black border border-amber-200/50 shadow-sm whitespace-nowrap">7년↑</span>
                        )}
                        {isSeniorQualified(staff) && staff.experience < 7 && (
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-black border border-indigo-200/50 shadow-sm tooltip whitespace-nowrap" title="자격증 기준 경력 인정">경력인정</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`text-base font-black px-4 py-2 rounded-xl border ${
                    staff.empType === 'REGULAR' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                  }`}>
                    {staff.empType === 'REGULAR' ? '정규직' : '프로젝트직'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1.5 rounded-lg text-base font-black border ${
                    staff.licenseType === 'SAFETY' ? 'bg-blue-50 border-blue-100 text-blue-700' : 
                    staff.licenseType === 'HEALTH' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                    'bg-purple-50 border-purple-100 text-purple-700'
                  }`}>
                    {staff.licenseType === 'SAFETY' ? '안전' : staff.licenseType === 'HEALTH' ? '보건' : '안전/보건'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <p className="text-base font-bold text-gray-700">{staff.licenses.join(', ')}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${staff.assignedSiteId ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-gray-300'}`}></div>
                    <span className={`text-base font-black ${staff.assignedSiteId ? 'text-gray-900' : 'text-gray-400'}`}>
                      {getSiteName(staff.assignedSiteId)}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-between gap-6">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-black ${
                      staff.assignedSiteId ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
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
            )) : (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 font-bold">검색 결과가 없습니다.</p>
                    <button onClick={() => {setSearchTerm(''); setFilters({rank:'ALL', job:'ALL', status:'ALL', site:'ALL', experience:'ALL', empType:'ALL'})}} className="text-blue-600 text-sm font-black hover:underline mt-2">필터 초기화</button>
                  </div>
                </td>
              </tr>
            )}
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
