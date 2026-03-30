import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore.js';
import { calculateExperienceYears, calculateAge } from '../utils/calculator.js';

export default function StaffDetailModal({ isOpen, onClose, staff, sites }) {
  const { updateStaff } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (staff) {
      setFormData({
        ...staff,
        licensesString: staff.licenses ? staff.licenses.join(', ') : ''
      });
      setIsEditing(false);
    }
  }, [staff, isOpen]);

  if (!isOpen || !staff) return null;

  const assignedSiteName = staff.assignedSiteId 
    ? sites.find(s => s.id === staff.assignedSiteId)?.name || '알 수 없는 현장'
    : '미배치 (가용 인력)';

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 250;
          const MAX_HEIGHT = 250;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setFormData({ ...formData, photo: compressedBase64 });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const parsedLicenses = formData.licensesString.split(',').map(l => l.trim()).filter(Boolean);
    
    updateStaff(staff.id, {
      ...formData,
      experience: Number(formData.experience),
      licenses: parsedLicenses.length > 0 ? parsedLicenses : ['없음']
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 text-left">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4 relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-2xl shadow-inner overflow-hidden flex-shrink-0 relative group">
              {(isEditing ? formData.photo : staff.photo) ? (
                <img src={isEditing ? formData.photo : staff.photo} alt={staff.name} className="w-full h-full object-cover" />
              ) : (
                staff.name[0]
              )}
              {isEditing && (
                <>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs text-white">
                    변경
                  </div>
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handlePhotoUpload} />
                </>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">{isEditing ? '인력 정보 수정' : staff.name} {!isEditing && <span className="text-lg font-bold text-gray-500">{staff.rank}</span>}</h2>
              {!isEditing && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${staff.empType === 'REGULAR' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                  {staff.empType === 'REGULAR' ? '정규직' : '프로젝트직'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 self-start pt-1">
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition-colors tooltip group" title="수정하기">
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

        <div className="p-6 space-y-5 overflow-y-auto">
          {isEditing ? (
            <form id="edit-staff-form" onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">이름</label>
                  <input type="text" required className="w-full px-3 py-2 border rounded-xl" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">직급</label>
                  <select className="w-full px-3 py-2 border rounded-xl" value={formData.rank || '사원'} onChange={e => setFormData({...formData, rank: e.target.value})}>
                    <option>사원</option>
                    <option>주임</option>
                    <option>대리</option>
                    <option>과장</option>
                    <option>차장</option>
                    <option>부장</option>
                    <option>임원</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1">경력 시작일</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border rounded-xl" 
                    value={formData.careerStartDate || ''} 
                    onChange={e => {
                      const dateVal = e.target.value;
                      const calcExp = dateVal ? calculateExperienceYears(dateVal) : formData.experience;
                      setFormData({...formData, careerStartDate: dateVal, experience: calcExp});
                    }} 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">총 경력 (년차)</label>
                  <input 
                    type="number" 
                    required min="0" 
                    className="w-full px-3 py-2 border rounded-xl" 
                    value={formData.experience !== undefined ? formData.experience : ''} 
                    onChange={e => {
                      const years = Number(e.target.value);
                      const currentYear = new Date().getFullYear();
                      const autoStartDate = new Date(currentYear - years, 0, 2).toISOString().split('T')[0];
                      setFormData({...formData, experience: years, careerStartDate: autoStartDate});
                    }} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">생년월일</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border rounded-xl" 
                    value={formData.birthDate || ''} 
                    onChange={e => {
                      const birth = e.target.value;
                      const calcAge = birth ? calculateAge(birth) : 0;
                      setFormData({...formData, birthDate: birth, age: calcAge});
                    }} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">만나이</label>
                  <input readOnly type="number" className="w-full px-3 py-2 border rounded-xl bg-gray-50 text-gray-500 font-bold" value={formData.age || 0} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">연락처</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-xl" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">거주지</label>
                <input type="text" className="w-full px-3 py-2 border rounded-xl" value={formData.residence || ''} onChange={e => setFormData({...formData, residence: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">고용 형태</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setFormData({...formData, empType: 'REGULAR'})} className={`flex-1 py-2 text-sm font-bold rounded-xl border ${formData.empType === 'REGULAR' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}>정규직</button>
                  <button type="button" onClick={() => setFormData({...formData, empType: 'PROJECT'})} className={`flex-1 py-2 text-sm font-bold rounded-xl border ${formData.empType === 'PROJECT' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-gray-200 text-gray-500'}`}>프로젝트직</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">직무 분야</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setFormData({...formData, licenseType: 'SAFETY'})} className={`flex-1 py-2 text-sm font-bold rounded-xl border ${formData.licenseType === 'SAFETY' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}>안전</button>
                  <button type="button" onClick={() => setFormData({...formData, licenseType: 'HEALTH'})} className={`flex-1 py-2 text-sm font-bold rounded-xl border ${formData.licenseType === 'HEALTH' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-500'}`}>보건</button>
                  <button type="button" onClick={() => setFormData({...formData, licenseType: 'DUAL'})} className={`flex-1 py-2 text-sm font-bold rounded-xl border ${formData.licenseType === 'DUAL' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-gray-200 text-gray-500'}`}>겸직</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">자격증 현황 (쉼표로 구분)</label>
                <textarea className="w-full px-3 py-2 border rounded-xl" rows={2} value={formData.licensesString || ''} onChange={e => setFormData({...formData, licensesString: e.target.value})} />
              </div>
            </form>
          ) : (
            <>
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
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">만 나이</p>
                  <p className="text-base font-black text-gray-900">{staff.birthDate ? `${calculateAge(staff.birthDate)}세` : (staff.age ? `${staff.age}세` : '-')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100/50 p-3 rounded-xl border border-dashed border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">생년월일</p>
                  <p className="text-sm font-bold text-gray-800">{staff.birthDate || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">현재 상태</p>
                  <p className={`text-base font-black ${staff.assignedSiteId ? 'text-blue-600' : 'text-emerald-600'}`}>
                    {staff.assignedSiteId ? '배치중' : '배치가능'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">연락처</p>
                  <p className="text-sm font-bold text-gray-900">{staff.phone || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">거주지</p>
                  <p className="text-sm font-bold text-gray-900">{staff.residence || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">보유 자격증</p>
                <div className="flex flex-wrap gap-2">
                  {staff.licenses && staff.licenses.map((license, idx) => (
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
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 mt-auto">
          {isEditing ? (
            <>
              <button type="button" onClick={() => { setFormData({...staff, licensesString: staff.licenses ? staff.licenses.join(', ') : ''}); setIsEditing(false); }} className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors">
                취소
              </button>
              <button form="edit-staff-form" type="submit" className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md">
                저장하기
              </button>
            </>
          ) : (
            <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md">
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
