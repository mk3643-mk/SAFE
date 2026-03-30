'use client';

import React from 'react';
import { useStore } from '../store/useStore.js';
import { isSeniorQualified } from '../utils/calculator.js';

export default function AssignmentModal({ isOpen, onClose, siteId, roleType }) {
  const { hrPool, assignStaff } = useStore();
  const [assignmentType, setAssignmentType] = React.useState('MAIN');

  React.useEffect(() => {
    setAssignmentType('MAIN');
  }, [roleType, isOpen]);

  if (!isOpen) return null;

  const availableStaff = hrPool.filter(staff => 
    staff.assignedSiteId === null && 
    (staff.licenseType === roleType || staff.licenseType === 'DUAL')
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-800">
            가용 인력풀 조회 <span className="text-blue-600">({roleType === 'SAFETY' ? '안전' : '보건'})</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {roleType === 'SAFETY' && (
          <div className="px-6 py-4 border-b border-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">선임 구분 선택</p>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setAssignmentType('MAIN')} 
                className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${assignmentType === 'MAIN' ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                원도급사
              </button>
              <button 
                onClick={() => setAssignmentType('PROXY')} 
                className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${assignmentType === 'PROXY' ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                협력사(대리)
              </button>
              <button 
                onClick={() => setAssignmentType('DIRECT')} 
                className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${assignmentType === 'DIRECT' ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                협력사(직접)
              </button>
            </div>
          </div>
        )}

        <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
          {availableStaff.length > 0 ? (
            availableStaff.map(staff => (
              <div key={staff.id} className="group flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-shrink-0 items-center justify-center font-bold text-white text-sm shadow-inner overflow-hidden">
                    {staff.photo ? (
                      <img src={staff.photo} alt={staff.name} className="w-full h-full object-cover" />
                    ) : (
                      staff.name[0]
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800">{staff.name}</p>
                      <span className="text-xs text-gray-400">{staff.rank}</span>
                      {staff.licenseType === 'DUAL' && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">중복자격</span>
                      )}
                      {isSeniorQualified(staff) && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-black border border-indigo-200">고경력자</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      경력 {staff.experience}년 · {staff.empType === 'PROJECT' ? '프로젝트직' : '정규직'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    assignStaff(staff.id, siteId, roleType, assignmentType);
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
