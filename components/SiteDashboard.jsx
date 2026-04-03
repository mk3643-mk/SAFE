'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { calculateRequiredStaff, isSeniorQualified } from '../utils/calculator.js';
import { validateAssignment } from '../utils/validator.js';
import AssignmentModal from './AssignmentModal.jsx';
import SiteRegistrationModal from './SiteRegistrationModal.jsx';
import SiteDetailModal from './SiteDetailModal.jsx';
import StaffDetailModal from './StaffDetailModal.jsx';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function StaffRow({ staff, site, onStaffClick, handleUnassign, handleRoleToggle }) {
  return (
    <div 
      className="flex justify-between items-center bg-white border border-gray-100 px-6 py-4 rounded-2xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onStaffClick(staff)}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-base overflow-hidden shadow-sm">
          {staff.photo ? (
            <img src={staff.photo} alt={staff.name} className="w-full h-full object-cover" />
          ) : (
            staff.name[0]
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-black text-xl text-gray-900 group-hover:text-blue-600 transition-colors whitespace-nowrap">{staff.name}</span>
            <span className="text-lg text-gray-500 font-black whitespace-nowrap">{staff.rank}</span>
            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black border shadow-sm ${
                staff.empType === 'PROJECT' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
              }`}>
                {staff.empType === 'PROJECT' ? '프로젝트직' : '정규직'}
              </span>
              <span className="text-base font-black text-gray-400">
                {staff.experience}년차
              </span>
              {staff.experience >= 7 && (
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-black border border-amber-200/50 shadow-sm whitespace-nowrap">7년↑</span>
              )}
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black border shadow-sm ${
                staff.licenseType === 'SAFETY' ? 'bg-blue-50 border-blue-100 text-blue-700' : 
                staff.licenseType === 'HEALTH' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                'bg-purple-50 border-purple-100 text-purple-700'
              }`}>
                {staff.licenseType === 'SAFETY' ? '안전' : staff.licenseType === 'HEALTH' ? '보건' : '안전/보건'}
              </span>
              {staff.licenseType === 'DUAL' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRoleToggle(staff);
                  }}
                  className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg font-black border border-purple-200 hover:bg-purple-200 transition-colors shadow-sm"
                  title="직무 변경 (안전 <-> 보건)"
                >
                  직무전환
                </button>
              )}
            </div>
          </div>
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
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`${staff.name} 님을 이 현장에서 배치 해제하시겠습니까?`)) {
              handleUnassign(staff, site);
            }
          }} 
          className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors z-10 relative"
          title="배치 해제"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SortableSiteCard({ site, hrPool, removeSite, handleUnassign, setModal, onSiteClick, onStaffClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: site.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative',
  };

  const requirements = calculateRequiredStaff(site);
  // assignedRole이 명시되지 않은 기존 데이터를 위해 보정 로직 추가
  const assignedSafety = hrPool.filter(h => 
    h.assignedSiteId === site.id && 
    (h.assignedRole === 'SAFETY' || (!h.assignedRole && (h.licenseType === 'SAFETY' || h.licenseType === 'DUAL')))
  );

  // 선임 방식별 그룹화
  const safetyMain = assignedSafety.filter(h => h.assignmentType === 'MAIN');
  const safetyProxy = assignedSafety.filter(h => h.assignmentType === 'PROXY');
  const safetyDirect = assignedSafety.filter(h => h.assignmentType === 'DIRECT');
  const legacySafety = assignedSafety.filter(h => !h.assignmentType || (h.assignmentType !== 'MAIN' && h.assignmentType !== 'PROXY' && h.assignmentType !== 'DIRECT'));

  const assignedHealth = hrPool.filter(h => 
    h.assignedSiteId === site.id && 
    (h.assignedRole === 'HEALTH' || (!h.assignedRole && h.licenseType === 'HEALTH'))
  );
  const assignedSeniors = assignedSafety.filter(h => isSeniorQualified(h));
  
  const needSafety = Math.max(0, requirements.safety - assignedSafety.length);
  const needHealth = Math.max(0, requirements.health - assignedHealth.length);
  const needSenior = Math.max(0, requirements.senior - assignedSeniors.length);

  const { updateStaff } = useStore();

  const handleRoleToggle = (staff) => {
    if (staff.licenseType !== 'DUAL') return;
    const nextRole = staff.assignedRole === 'SAFETY' ? 'HEALTH' : 'SAFETY';
    if (window.confirm(`${staff.name} 님의 직무를 ${nextRole === 'SAFETY' ? '안전관리자' : '보건관리자'}로 변경하시겠습니까?`)) {
      updateStaff(staff.id, { assignedRole: nextRole });
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white rounded-3xl shadow-sm border ${isDragging ? 'border-blue-500 shadow-xl scale-[1.02] opacity-90' : 'border-gray-100'} overflow-hidden hover:shadow-md transition-all`}
    >
      <div className="p-8 border-b border-gray-50 flex justify-between items-start group">
        <div className="flex gap-4">
          <div 
            {...attributes} 
            {...listeners} 
            className="flex-shrink-0 cursor-grab active:cursor-grabbing bg-gray-50 border border-gray-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 p-2.5 px-3 rounded-xl transition-all shadow-sm group/handle flex flex-col items-center gap-1.5" 
            title="드래그하여 순서 변경"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover/handle:scale-110 transition-transform">
              <circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="19" r="1.5"/>
              <circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
            </svg>
            <span className="text-[11px] font-black leading-none group-hover/handle:text-blue-600">이동</span>
          </div>
          <div className="cursor-pointer group-hover/click:text-blue-600 transition-colors" onClick={() => onSiteClick(site)}>
            <h2 className="text-2xl font-bold text-gray-900 group-hover/click:text-gray-900 flex items-center gap-2 hover:text-blue-600">
              {site.name}
              <svg className="w-5 h-5 text-gray-300 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {site.endDate && (
                <span className="text-sm font-black text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 flex items-center gap-1 shadow-sm">
                  <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  준공: {site.endDate}
                </span>
              )}
              <span className="text-sm font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">{site.region}</span>
            </h2>
            <p className="text-gray-500 mt-3 flex flex-wrap items-center gap-y-2 gap-x-3">
              {site.managerName && (
                <span className="flex items-center gap-2.5 bg-gray-100/80 px-4 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-base font-black text-gray-700">{site.managerName} 소장</span>
                </span>
              )}
              <span className="flex items-center gap-2.5 bg-gray-50 px-4 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                <span className="text-base font-black text-gray-800 font-sans">총 공사비 {site.totalAmount.toLocaleString()}억 원</span>
              </span>
              {Number(site.subAmt) > 0 && (
                <span className="text-sm text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-sm">
                  기준 금액: {requirements.netAmt.toLocaleString()}억 원 (협력사 {site.subAmt}억 차감)
                </span>
              )}
            </p>
            {requirements.currentPhase !== 'NONE' && (
              <div className="mt-3">
                <span className={`text-base font-black px-4 py-1.5 rounded-xl border shadow-sm inline-block ${requirements.isReducedPhase ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-indigo-100 text-indigo-800 border-indigo-200'}`}>
                  {requirements.phaseLabel} {requirements.isReducedPhase ? '(50% 감면)' : '(100% 선임)'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => {
              if (window.confirm(`${site.name} 현장을 삭제하시겠습니까?`)) {
                removeSite(site.id);
              }
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="현장 삭제"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          {site.subAppointmentType === 'PROXY' && (
            <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1.5 rounded-full border border-amber-200 shadow-sm mt-1 mr-1.5 inline-block">원도급 대리</span>
          )}
          {site.subAppointmentType === 'DIRECT' && (
            <span className="bg-purple-100 text-purple-800 text-xs font-black px-3 py-1.5 rounded-full border border-purple-200 shadow-sm mt-1 mr-1.5 inline-block">협력사 직접</span>
          )}
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50">
        {/* 안전관리자 섹션 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <p className="text-base font-black text-gray-800">안전관리자 현황</p>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-black border border-blue-100 shadow-sm">법정: {requirements.safety}명</span>
                {requirements.proxyReq > 0 && (
                  <span className="text-xs text-blue-500 font-bold">(원도급 {requirements.mainSafetyReq} + 대리 {requirements.proxyReq})</span>
                )}
              </div>
            </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-3 flex-1 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-blue-500 transition-all shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                style={{ width: `${Math.min(100, (assignedSafety.length / requirements.safety) * 100)}%` }}
              ></div>
            </div>
            <span className="text-base font-black text-blue-600">{assignedSafety.length} / {requirements.safety}</span>
          </div>

          {/* 경력직(Senior) 배치 현황 추가 */}
          {requirements.safety > 0 && requirements.senior > 0 && (
            <div className="mb-5 p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 shadow-sm">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-base font-black text-indigo-800 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  필수 경력직 (7년↑)
                </span>
                <span className="text-lg font-black text-indigo-900">{assignedSeniors.length} / {requirements.senior}</span>
              </div>
              <div className="h-2.5 w-full bg-indigo-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-indigo-600 transition-all shadow-[0_0_8px_rgba(79,70,229,0.5)]" 
                  style={{ width: `${Math.min(100, (assignedSeniors.length / requirements.senior) * 100)}%` }}
                ></div>
              </div>
              {needSenior > 0 && (
                <p className="text-xs text-indigo-600 mt-2.5 font-black flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg w-fit border border-indigo-100 shadow-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                  7년 이상 경력자 {needSenior}명 추가 필요
                </p>
              )}
            </div>
          )}

          {needSafety > 0 && (
            <div className="bg-red-50 border border-red-100 px-4 py-3 rounded-xl mb-5 flex items-center gap-2.5 animate-pulse shadow-sm">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-black text-base">
                {needSafety}명 추가 배치 필요
              </p>
            </div>
          )}
          <button 
            onClick={() => setModal({open: true, siteId: site.id, roleType: 'SAFETY'})} 
            className="w-full py-4 rounded-xl text-base font-black bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-md active:scale-[0.98]"
          >
            인력풀에서 찾기
          </button>
        </div>

        {/* 보건관리자 섹션 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-5">
            <p className="text-base font-black text-gray-800">보건관리자 현황</p>
            <span className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-black border border-emerald-100 shadow-sm">법정: {requirements.health}명</span>
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-3 flex-1 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-emerald-500 transition-all shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                style={{ width: `${(assignedHealth.length / requirements.health) * 100}%` }}
              ></div>
            </div>
            <span className="text-base font-black text-emerald-600">{assignedHealth.length} / {requirements.health}</span>
          </div>
          {needHealth > 0 && (
            <div className="bg-red-50 border border-red-100 px-4 py-3 rounded-xl mb-5 flex items-center gap-2.5 animate-pulse shadow-sm">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-black text-base">
                {needHealth}명 추가 배치 필요
              </p>
            </div>
          )}
          <button 
            onClick={() => setModal({open: true, siteId: site.id, roleType: 'HEALTH'})} 
            className="w-full py-4 rounded-xl text-base font-black bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-md active:scale-[0.98]"
          >
            인력풀에서 찾기
          </button>
        </div>
      </div>

      <div className="p-8 pt-0 space-y-6">
        {/* 안전관리자 명단 */}
        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50">
          <div className="space-y-4">
            {/* 원도급사분 */}
            {(safetyMain.length > 0 || (assignedSafety.length > 0 && requirements.mainSafetyReq > 0)) && (
              <div>
                <p className="text-base flex items-center gap-1.5 font-black text-blue-600 mb-3 bg-blue-100/80 px-4 py-2 rounded-xl w-fit shadow-sm border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                  원도급사 선임 ({safetyMain.length} / {requirements.mainSafetyReq})
                </p>
                <div className="space-y-2">
                  {safetyMain.map(staff => (
                    <StaffRow 
                      key={staff.id} staff={staff} site={site} 
                      onStaffClick={onStaffClick} handleUnassign={handleUnassign} handleRoleToggle={handleRoleToggle}
                    />
                  ))}
                  {safetyMain.length === 0 && requirements.mainSafetyReq > 0 && (
                    <p className="text-sm text-gray-400 font-bold italic px-3 py-1">배치 대기 중...</p>
                  )}
                </div>
              </div>
            )}
            
            {/* 대리선임분 */}
            {(safetyProxy.length > 0 || requirements.proxyReq > 0) && (
              <div>
                <p className="text-base flex items-center gap-1.5 font-black text-amber-700 mb-3 bg-amber-100/80 px-4 py-2 rounded-xl w-fit shadow-sm border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                  협력사 대리선임 ({safetyProxy.length} / {requirements.proxyReq})
                </p>
                <div className="space-y-2">
                  {safetyProxy.map(staff => (
                    <StaffRow 
                      key={staff.id} staff={staff} site={site} 
                      onStaffClick={onStaffClick} handleUnassign={handleUnassign} handleRoleToggle={handleRoleToggle}
                    />
                  ))}
                  {safetyProxy.length === 0 && (
                    <p className="text-sm text-gray-400 font-bold italic px-3 py-1">배치가 필요한 대리 선임분입니다.</p>
                  )}
                </div>
              </div>
            )}

            {/* 직접선임분 */}
            {safetyDirect.length > 0 && (
              <div>
                <p className="text-base flex items-center gap-1.5 font-black text-purple-700 mb-3 bg-purple-100/80 px-4 py-2 rounded-xl w-fit shadow-sm border border-purple-200">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
                  협력사 직접선임 ({safetyDirect.length})
                </p>
                <div className="space-y-2">
                  {safetyDirect.map(staff => (
                    <StaffRow 
                      key={staff.id} staff={staff} site={site} 
                      onStaffClick={onStaffClick} handleUnassign={handleUnassign} handleRoleToggle={handleRoleToggle}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 미분류 (기존 데이터) */}
            {legacySafety.length > 0 && (
              <div>
                <p className="text-base flex items-center gap-1.5 font-black text-gray-700 mb-3 bg-gray-200/80 px-4 py-2 rounded-xl w-fit shadow-sm border border-gray-300">
                  <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                  미분류 데이터 ({legacySafety.length})
                </p>
                <div className="space-y-2">
                  {legacySafety.map(staff => (
                    <StaffRow 
                      key={staff.id} staff={staff} site={site} 
                      onStaffClick={onStaffClick} handleUnassign={handleUnassign} handleRoleToggle={handleRoleToggle}
                    />
                  ))}
                </div>
              </div>
            )}

            {assignedSafety.length === 0 && (
              <p className="text-xs text-gray-400 italic py-2 px-2">배치된 안전관리자가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 보건관리자 명단 */}
        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
          <p className="text-base font-black text-emerald-800 uppercase tracking-wider mb-4 flex items-center gap-2 bg-emerald-100/80 px-4 py-2 rounded-xl w-fit shadow-sm border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            보건관리자 배치 명단 ({assignedHealth.length})
          </p>
          <div className="space-y-2">
            {assignedHealth.length > 0 ? (
              assignedHealth.map(staff => (
                <StaffRow 
                  key={staff.id} 
                  staff={staff} 
                  site={site} 
                  onStaffClick={onStaffClick} 
                  handleUnassign={handleUnassign} 
                  handleRoleToggle={handleRoleToggle}
                />
              ))
            ) : (
              <p className="text-xs text-gray-400 italic py-2 px-2">배치된 보건관리자가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SiteDashboard() {
  const { hrPool, sites, siteDirectoryPdf, setSiteDirectoryPdf, safetyStandardsPdf, setSafetyStandardsPdf, unassignStaff, removeSite, reorderSites, approveSite } = useStore();
  const [modal, setModal] = useState({ open: false, siteId: null, roleType: null });
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [pdfModal, setPdfModal] = useState({ open: false, data: null, title: '' });
  const [selectedRegion, setSelectedRegion] = useState('전체');
  
  const regions = ['전체', '서울권', '경기권', '강원권', '충남권', '영남권', '호남권'];

  // 충청권 -> 충남권 매핑 고려 (사용자 요청에 맞춤)
  const filteredSites = selectedRegion === '전체' 
    ? sites 
    : sites.filter(site => {
        if (selectedRegion === '충남권' && site.region === '충청권') return true;
        return site.region === selectedRegion;
      });

  const [siteDetailModal, setSiteDetailModal] = useState(null);
  const [staffDetailModal, setStaffDetailModal] = useState(null);

  const handlePdfUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('PDF 파일만 업로드 가능합니다.');
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        alert('PDF 파일 크기는 최대 3MB 이하여야 합니다.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'DIRECTORY') {
          setSiteDirectoryPdf(reader.result);
          setPdfModal({ open: true, data: reader.result, title: '현장 주소록 열람' });
        } else {
          setSafetyStandardsPdf(reader.result);
          setPdfModal({ open: true, data: reader.result, title: '안전관리자 배치기준 열람' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = sites.findIndex((site) => site.id === active.id);
      const newIndex = sites.findIndex((site) => site.id === over.id);
      reorderSites(oldIndex, newIndex);
    }
  };

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
      {/* 권역 필터 섹션 */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100/50 rounded-2xl w-fit border border-gray-100">
        {regions.map(region => {
          const count = region === '전체' 
            ? sites.length 
            : sites.filter(s => {
                if (region === '충남권' && s.region === '충청권') return true;
                return s.region === region;
              }).length;

          return (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-8 py-3 rounded-xl text-base font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                selectedRegion === region 
                ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' 
                : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              {region}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                selectedRegion === region ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 상단 버튼 섹션 */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            {selectedRegion === '전체' ? '전체 현장 현황' : `${selectedRegion} 현장 현황`}
          </p>
          <div className="flex items-center gap-2 text-gray-500 bg-gray-100/50 px-3 py-1.5 rounded-lg w-fit border border-gray-100">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-bold">
              {selectedRegion === '전체' ? '현장을 드래그하여 자유롭게 순서를 변경할 수 있습니다.' : '권역 필터 활성화 시에는 순서 변경이 제한됩니다.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 안전관리자 배치기준 열람/업로드 영역 */}
          <div className="flex gap-2 relative">
            {safetyStandardsPdf && (
              <button 
                onClick={() => setPdfModal({ open: true, data: safetyStandardsPdf, title: '안전관리자 배치기준 열람' })}
                className="group flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-xs font-black">배치기준 열람</span>
                  <span className="text-[10px] opacity-80">(PDF)</span>
                </div>
              </button>
            )}

            <div className="relative">
              <input 
                type="file" 
                accept=".pdf" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => handlePdfUpload(e, 'STANDARDS')}
                title="안전관리자 배치기준 PDF 업로드"
                value=""
              />
              <button 
                className={`group flex items-center gap-2 ${safetyStandardsPdf ? 'bg-white text-gray-600 px-3 py-3 border-gray-200' : 'bg-white text-gray-900 px-5 py-3 border-gray-100'} rounded-2xl font-bold border hover:border-blue-500 hover:shadow-md transition-all active:scale-95`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform ${safetyStandardsPdf ? 'bg-gray-100 text-gray-500 group-hover:bg-blue-50' : 'bg-blue-600 text-white group-hover:scale-110'}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {safetyStandardsPdf 
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
                  </svg>
                </div>
                <span>{safetyStandardsPdf ? '변경' : '배치기준 업로드'}</span>
              </button>
            </div>
          </div>

          {/* 현장주소록 열람/업로드 영역 */}
          <div className="flex gap-2 relative">
            {siteDirectoryPdf && (
              <button 
                onClick={() => setPdfModal({ open: true, data: siteDirectoryPdf, title: '현장 주소록 열람' })}
                className="group flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all active:scale-95"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-xs font-black">주소록 열람</span>
                  <span className="text-[10px] opacity-80">(PDF)</span>
                </div>
              </button>
            )}

            <div className="relative">
              <input 
                type="file" 
                accept=".pdf" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => handlePdfUpload(e, 'DIRECTORY')}
                title="현장주소록 PDF 업로드"
                value=""
              />
              <button 
                className={`group flex items-center gap-2 ${siteDirectoryPdf ? 'bg-white text-gray-600 px-3 py-3 border-gray-200' : 'bg-white text-gray-900 px-5 py-3 border-gray-100'} rounded-2xl font-bold border hover:border-emerald-500 hover:shadow-md transition-all active:scale-95`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform ${siteDirectoryPdf ? 'bg-gray-100 text-gray-500 group-hover:bg-emerald-50' : 'bg-emerald-600 text-white group-hover:scale-110'}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {siteDirectoryPdf 
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />}
                  </svg>
                </div>
                <span>{siteDirectoryPdf ? '변경' : '주소록 업로드'}</span>
              </button>
            </div>
          </div>

          {/* 큐알 등록 버튼 */}
          <button 
            onClick={() => setIsQrModalOpen(true)}
            className="group flex items-center gap-2 bg-white text-gray-900 px-5 py-3 rounded-2xl font-bold shadow-sm border border-gray-100 hover:border-indigo-500 hover:shadow-md transition-all active:scale-95"
            title="모바일 사이트로 현장 등록용 QR코드 열기"
          >
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M5 8V7a3 3 0 013-3h10a3 3 0 013 3v1" />
              </svg>
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs font-black">현장 등록</span>
              <span className="text-[10px] opacity-60">QR 코드</span>
            </div>
          </button>

          {/* 신규 등록 버튼 */}
          <button 
            onClick={() => setIsRegModalOpen(true)}
            className="group flex items-center gap-2 bg-white text-gray-900 px-5 py-3 rounded-2xl font-bold shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs font-black">현장 개요</span>
              <span className="text-[10px] opacity-60">신규 등록</span>
            </div>
          </button>
        </div>
      </div>

      {/* 승인 대기 중인 현장 목록 (펜딩 섹션) */}
      {sites.some(s => s.status === 'PENDING') && (
        <div className="bg-indigo-50/50 p-8 rounded-[32px] border-2 border-dashed border-indigo-200">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2.5 h-6 bg-indigo-600 rounded-full"></span>
            <h3 className="text-xl font-black text-indigo-900">현장 승인 대기 목록 ({sites.filter(s => s.status === 'PENDING').length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.filter(s => s.status === 'PENDING').map(site => (
              <div key={site.id} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm relative group overflow-hidden">
                <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-bl-xl shadow-md">승인 대기</div>
                <h4 className="text-lg font-black text-gray-900 mb-2 truncate pr-16">{site.name}</h4>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-400">권역</span>
                    <span className="text-gray-700">{site.region}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-400">현장 소장</span>
                    <span className="text-gray-700">{site.managerName}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-400">공사 금액</span>
                    <span className="text-gray-700">{site.totalAmount}억 원</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => approveSite(site.id)}
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                  >
                    승인
                  </button>
                  <button 
                    onClick={() => removeSite(site.id)}
                    className="px-3 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-black text-sm hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={selectedRegion === '전체' ? handleDragEnd : undefined}
      >
        <SortableContext 
          items={filteredSites.filter(s => s.status === 'APPROVED').map(s => s.id)}
          strategy={rectSortingStrategy}
          disabled={selectedRegion !== '전체'}
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {filteredSites.filter(s => s.status === 'APPROVED').map((site) => (
              <SortableSiteCard
                key={site.id}
                site={site}
                hrPool={hrPool}
                removeSite={removeSite}
                handleUnassign={handleUnassign}
                setModal={setModal}
                onSiteClick={setSiteDetailModal}
                onStaffClick={setStaffDetailModal}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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

      <SiteDetailModal 
        isOpen={!!siteDetailModal} 
        onClose={() => setSiteDetailModal(null)} 
        site={siteDetailModal} 
        hrPool={hrPool}
      />

      <StaffDetailModal 
        isOpen={!!staffDetailModal} 
        onClose={() => setStaffDetailModal(null)} 
        staff={staffDetailModal}
        sites={sites}
      />

      {/* PDF 열람 모달 */}
      {pdfModal.open && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 lg:p-10 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full h-full max-w-6xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-900 text-white">
              <h3 className="font-bold flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                {pdfModal.title}
              </h3>
              <button 
                onClick={() => setPdfModal({ ...pdfModal, open: false })} 
                className="text-gray-400 hover:text-white p-1 rounded-full transition-colors hover:bg-white/10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 w-full bg-gray-100">
              <iframe 
                src={pdfModal.data} 
                className="w-full h-full border-none"
                title={pdfModal.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* 현장 등록 QR 모달 */}
      {isQrModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 pb-4 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900">현장 등록용 QR 코드</h3>
              <button 
                onClick={() => setIsQrModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-full transition-all"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-10 flex flex-col items-center gap-8">
              <div className="p-6 bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + '/join-site')}`} 
                  alt="QR Code" 
                  className="w-56 h-56"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-black text-gray-900">스마트폰으로 스캔하세요</p>
                <p className="text-sm font-bold text-gray-400 leading-relaxed">
                  현장 소장님이 직접 현장 정보를<br />
                  입력하고 등록 신청을 보낼 수 있습니다.
                </p>
              </div>
            </div>
            <div className="p-8 pt-0">
              <button 
                onClick={() => setIsQrModalOpen(false)}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-gray-200 active:scale-95 transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
