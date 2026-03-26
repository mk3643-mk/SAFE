import React from 'react';

export default function StaffDetailModal({ isOpen, onClose, staff, sites }) {
  if (!isOpen || !staff) return null;

  const assignedSiteName = staff.assignedSiteId 
    ? sites.find(s => s.id === staff.assignedSiteId)?.name || '알 수 없는 현장'
    : '미배치 (가용 인력)';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-2xl shadow-inner overflow-hidden flex-shrink-0">
              {staff.photo ? (
                <img src={staff.photo} alt={staff.name} className="w-full h-full object-cover" />
              ) : (
                staff.name[0]
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">{staff.name} <span className="text-lg font-bold text-gray-500">{staff.rank}</span></h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${staff.empType === 'REGULAR' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                {staff.empType === 'REGULAR' ? '정규직' : '프로젝트직'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 self-start">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">직무 분야</p>
            <p className="text-sm font-bold text-gray-900">
              {staff.licenseType === 'SAFETY' ? '안전관리자' : staff.licenseType === 'HEALTH' ? '보건관리자' : '안전/보건 겸직 가능'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">총 경력</p>
              <p className="text-base font-black text-gray-900">{staff.experience}년차</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">현재 상태</p>
              <p className={`text-base font-black ${staff.assignedSiteId ? 'text-blue-600' : 'text-emerald-600'}`}>
                {staff.assignedSiteId ? '배치중' : '배치가능'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">보유 자격증</p>
            <div className="flex flex-wrap gap-2">
              {staff.licenses.map((license, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200">
                  {license}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">소속 현장</p>
            <div className={`p-3 rounded-xl border ${staff.assignedSiteId ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
              <p className={`text-sm font-bold ${staff.assignedSiteId ? 'text-blue-900' : 'text-gray-500'}`}>
                {assignedSiteName}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
