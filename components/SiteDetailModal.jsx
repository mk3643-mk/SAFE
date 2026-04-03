import React, { useState, useEffect } from 'react';
import { calculateRequiredStaff } from '../utils/calculator.js';
import { useStore } from '../store/useStore.js';

export default function SiteDetailModal({ isOpen, onClose, site, hrPool }) {
  const { updateSite } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (site) {
      setFormData(site);
      setIsEditing(false);
    }
  }, [site, isOpen]);

  if (!isOpen || !site) return null;

  const requirements = calculateRequiredStaff(site);
  const assignedSafety = hrPool.filter(h => h.assignedSiteId === site.id && (h.licenseType === 'SAFETY' || h.licenseType === 'DUAL'));
  const assignedHealth = hrPool.filter(h => h.assignedSiteId === site.id && h.licenseType === 'HEALTH');

  const handleSave = (e) => {
    e.preventDefault();
    updateSite(site.id, {
      ...formData,
      totalAmount: Number(formData.totalAmount),
      subDirectAmt: Number(formData.subDirectAmt || 0),
      subProxyAmt: Number(formData.subProxyAmt || 0)
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">{isEditing ? '현장 정보 수정' : site.name}</h2>
            {!isEditing && (
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="text-sm font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">{site.region}</span>
                <span className="text-sm font-bold bg-gray-50 text-gray-600 px-3 py-1 rounded-full border border-gray-200">{site.type === 'ARCH' ? '건축' : '토목'}</span>
                {site.subAppointmentType === 'PROXY' && <span className="text-sm font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">원도급 대리 선임</span>}
                {site.subAppointmentType === 'DIRECT' && <span className="text-sm font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">협력사 직접 선임</span>}
                {site.managerName && <span className="text-sm font-bold bg-gray-900 text-white px-3 py-1 rounded-full">{site.managerName} 소장</span>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition-colors tooltip relative group" title="수정하기">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {isEditing ? (
            <form id="edit-site-form" onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">현장명</label>
                  <input type="text" required className="w-full px-3 py-2 border rounded-xl" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">현장 소장</label>
                  <input type="text" required className="w-full px-3 py-2 border rounded-xl" value={formData.managerName || ''} onChange={e => setFormData({...formData, managerName: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">권역</label>
                  <select className="w-full px-3 py-2 border rounded-xl" value={formData.region || '수도권'} onChange={e => setFormData({...formData, region: e.target.value})}>
                    <option>서울권</option>
                    <option>경기권</option>
                    <option>강원권</option>
                    <option>충남권</option>
                    <option>영남권</option>
                    <option>호남권</option>
                    <option>제주권</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">공사 유형</label>
                  <select className="w-full px-3 py-2 border rounded-xl" value={formData.type || 'ARCH'} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="ARCH">건축</option>
                    <option value="CIVIL">토목</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">총 공사 금액 (억 원)</label>
                  <input type="number" required min="1" className="w-full px-3 py-2 border rounded-xl" value={formData.totalAmount || ''} onChange={e => setFormData({...formData, totalAmount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">하도급 금액 (억 원)</label>
                  <input type="number" min="0" className="w-full px-3 py-2 border rounded-xl" value={formData.subAmt || ''} onChange={e => setFormData({...formData, subAmt: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase">본공사 기간</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">착공일</label>
                    <input type="date" required className="w-full px-3 py-1.5 border rounded-lg text-sm" value={formData.mainStartDate || ''} onChange={e => setFormData({...formData, mainStartDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">준공 예정일</label>
                    <input type="date" required className="w-full px-3 py-1.5 border rounded-lg text-sm" value={formData.mainEndDate || ''} onChange={e => setFormData({...formData, mainEndDate: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="col-span-full bg-red-50/50 p-4 rounded-2xl border border-red-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-red-900">철거공사 포함</label>
                  <input type="checkbox" checked={formData.isDemolition || false} onChange={e => setFormData({...formData, isDemolition: e.target.checked})} className="w-4 h-4 text-red-600 rounded" />
                </div>
                {formData.isDemolition && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1">
                    <div>
                      <label className="block text-[10px] font-bold text-red-800 mb-1">철거 착공</label>
                      <input type="date" className="w-full px-3 py-1.5 border border-red-200 rounded-lg text-sm" value={formData.demoStartDate || ''} onChange={e => setFormData({...formData, demoStartDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-red-800 mb-1">철거 종료</label>
                      <input type="date" className="w-full px-3 py-1.5 border border-red-200 rounded-lg text-sm" value={formData.demoEndDate || ''} onChange={e => setFormData({...formData, demoEndDate: e.target.value})} />
                    </div>
                  </div>
                )}
              </div>
              <div className="col-span-full bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                  <label className="block text-xs font-black text-blue-900">협력사(수급인) 선임 금액 설정</label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-blue-800 ml-1">협력사 직접 선임 합계 (억)</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm bg-white font-bold" 
                      value={formData.subDirectAmt || 0} 
                      onChange={e => setFormData({...formData, subDirectAmt: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-indigo-800 ml-1">원도급 대리 선임 합계 (억)</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-indigo-200 rounded-xl text-sm bg-white font-bold" 
                      value={formData.subProxyAmt || 0} 
                      onChange={e => setFormData({...formData, subProxyAmt: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="p-3 bg-white/50 rounded-xl border border-blue-100/50">
                  <p className="text-[10px] text-blue-600 leading-relaxed font-bold">
                    * 대리 선임 시 2개 이상의 협력사가 포함된 경우 모든 대상 협력사의 공사금액 합계를 입력하세요.
                  </p>
                </div>
              </div>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase">총 공사 금액</p>
                  <p className="text-xl font-black text-gray-900 mt-1">{site.totalAmount.toLocaleString()}억 원</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase">하도급 금액</p>
                  <p className="text-xl font-black text-gray-900 mt-1">{site.subAmt ? `${site.subAmt.toLocaleString()}억 원` : '해당없음'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 col-span-2">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase">본공사 착공</p>
                    <p className="text-sm font-black text-gray-900 mt-1">{site.mainStartDate || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase">본공사 준공</p>
                    <p className="text-sm font-black text-gray-900 mt-1">{site.mainEndDate || '-'}</p>
                  </div>
                  {site.isDemolition && (
                    <div className="col-span-2 bg-red-50/50 p-3 rounded-xl border border-red-100">
                      <p className="text-[10px] font-bold text-red-600 uppercase mb-1">철거공사 기간</p>
                      <p className="text-xs font-black text-red-900">{site.demoStartDate} ~ {site.demoEndDate}</p>
                    </div>
                  )}
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4 mt-1">
                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">본공사 초기 15% 감면</p>
                    <p className="text-[11px] font-black text-blue-900">{site.mainStartDate} ~ {requirements.initialPhaseEnd}</p>
                  </div>
                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">본공사 말기 15% 감면</p>
                    <p className="text-[11px] font-black text-blue-900">{requirements.finalPhaseStart} ~ {site.mainEndDate}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">법정 선임 현황</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-100 p-3 rounded-xl">
                    <p className="text-xs text-gray-500 font-bold mb-1">안전관리자</p>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-black text-blue-600">
                        {assignedSafety.length} <span className="text-sm text-gray-400 font-normal">/ {requirements.safety}명</span>
                      </span>
                      {requirements.proxyReq > 0 && (
                        <p className="text-xs text-blue-500 font-bold mt-1">
                          (원도급 {requirements.mainSafetyReq} + 대리 {requirements.proxyReq})
                        </p>
                      )}
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
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 mt-auto">
          {isEditing ? (
            <>
              <button type="button" onClick={() => { setFormData(site); setIsEditing(false); }} className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors">
                취소
              </button>
              <button form="edit-site-form" type="submit" className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md">
                저장하기
              </button>
            </>
          ) : (
            <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md">
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
