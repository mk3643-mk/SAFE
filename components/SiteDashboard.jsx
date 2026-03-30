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
  const assignedSafety = hrPool.filter(h => h.assignedSiteId === site.id && (h.licenseType === 'SAFETY' || h.licenseType === 'DUAL'));
  const assignedHealth = hrPool.filter(h => h.assignedSiteId === site.id && h.licenseType === 'HEALTH');
  const assignedSeniors = assignedSafety.filter(h => isSeniorQualified(h));
  
  const needSafety = Math.max(0, requirements.safety - assignedSafety.length);
  const needHealth = Math.max(0, requirements.health - assignedHealth.length);
  const needSenior = Math.max(0, requirements.senior - assignedSeniors.length);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white rounded-3xl shadow-sm border ${isDragging ? 'border-blue-500 shadow-xl scale-[1.02] opacity-90' : 'border-gray-100'} overflow-hidden hover:shadow-md transition-all`}
    >
      <div className="p-8 border-b border-gray-50 flex justify-between items-start group">
        <div className="flex gap-4">
          <div {...attributes} {...listeners} className="mt-1 flex-shrink-0 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing hover:bg-gray-50 p-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500" title="드래그하여 순서 변경">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
          </div>
          <div className="cursor-pointer group-hover/click:text-blue-600 transition-colors" onClick={() => onSiteClick(site)}>
            <h2 className="text-2xl font-bold text-gray-900 group-hover/click:text-gray-900 flex items-center gap-2 hover:text-blue-600">
              {site.name}
              <svg className="w-5 h-5 text-gray-300 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-normal bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{site.region}</span>
            </h2>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              총 공사비 {site.totalAmount.toLocaleString()}억 원
            </p>
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
          {site.isSubProxy && (
            <span className="bg-amber-50 text-amber-700 text-[11px] font-bold px-3 py-1 rounded-full ring-1 ring-amber-100 mt-1 mr-2 inline-block">대리 선임 차감 적용</span>
          )}
          {requirements.isReducedPhase && (
            <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-3 py-1 rounded-full ring-1 ring-blue-100 mt-1 inline-block text-center mr-2">공정 초기/말기 (50% 감면)</span>
          )}
        </div>
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
                style={{ width: `${Math.min(100, (assignedSafety.length / requirements.safety) * 100)}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold text-blue-600">{assignedSafety.length} / {requirements.safety}</span>
          </div>

          {/* 경력직(Senior) 배치 현황 추가 */}
          {requirements.safety > 0 && requirements.senior > 0 && (
            <div className="mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold text-indigo-700">필수 경력직 (7년↑)</span>
                <span className="text-[11px] font-bold text-indigo-700">{assignedSeniors.length} / {requirements.senior}</span>
              </div>
              <div className="h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all" 
                  style={{ width: `${Math.min(100, (assignedSeniors.length / requirements.senior) * 100)}%` }}
                ></div>
              </div>
              {needSenior > 0 && (
                <p className="text-[10px] text-indigo-600 mt-1.5 font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                  7년 이상 경력자 {needSenior}명 추가 필요
                </p>
              )}
            </div>
          )}

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
              <div 
                key={staff.id} 
                className="flex justify-between items-center bg-white border border-gray-100 px-4 py-3 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => onStaffClick(staff)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs overflow-hidden">
                    {staff.photo ? (
                      <img src={staff.photo} alt={staff.name} className="w-full h-full object-cover" />
                    ) : (
                      staff.name[0]
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">{staff.name}</span>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnassign(staff, site);
                    }} 
                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors z-10 relative"
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
}

export default function SiteDashboard() {
  const { hrPool, sites, siteDirectoryPdf, setSiteDirectoryPdf, unassignStaff, removeSite, reorderSites } = useStore();
  const [modal, setModal] = useState({ open: false, siteId: null, roleType: null });
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  
  const [siteDetailModal, setSiteDetailModal] = useState(null);
  const [staffDetailModal, setStaffDetailModal] = useState(null);

  const handlePdfUpload = (e) => {
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
        setSiteDirectoryPdf(reader.result);
        setIsPdfModalOpen(true); // 업로드 성공 시 바로 열람
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
      {/* 상단 버튼 섹션 */}
      <div className="flex justify-end items-center gap-4">
        {/* 현장주소록 열람/업로드 영역 */}
        <div className="flex gap-2 relative">
          {siteDirectoryPdf && (
            <button 
              onClick={() => setIsPdfModalOpen(true)}
              className="group flex items-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all active:scale-95"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>주소록 열람 (PDF)</span>
            </button>
          )}

          <div className="relative">
            <input 
              type="file" 
              accept=".pdf" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handlePdfUpload}
              title="현장주소록 PDF 업로드"
              value=""
            />
            <button 
              className={`group flex items-center gap-2 ${siteDirectoryPdf ? 'bg-white text-gray-600 px-4 py-4 border-gray-200' : 'bg-white text-gray-900 px-6 py-4 border-gray-100'} rounded-2xl font-bold border hover:border-emerald-500 hover:shadow-md transition-all active:scale-95`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform ${siteDirectoryPdf ? 'bg-gray-100 text-gray-500 group-hover:bg-emerald-50' : 'bg-emerald-600 text-white group-hover:scale-110'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {siteDirectoryPdf 
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />}
                </svg>
              </div>
              <span>{siteDirectoryPdf ? '파일 변경' : '현장주소록 업로드'}</span>
            </button>
          </div>
        </div>

        {/* 신규 등록 버튼 */}
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

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={sites.map(s => s.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {sites.map((site) => (
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
      {isPdfModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 lg:p-10 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full h-full max-w-6xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-900 text-white">
              <h3 className="font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                현장 주소록 열람
              </h3>
              <button 
                onClick={() => setIsPdfModalOpen(false)} 
                className="text-gray-400 hover:text-white p-1 rounded-full transition-colors hover:bg-white/10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 w-full bg-gray-100">
              <iframe 
                src={siteDirectoryPdf} 
                className="w-full h-full border-none"
                title="현장 주소록 PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
