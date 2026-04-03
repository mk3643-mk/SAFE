'use client';

import React, { useState } from 'react';
import { useStore } from '../../store/useStore.js';
import { calculateExperienceYears, calculateAge, calculateDuration } from '../../utils/calculator.js';

export default function MobileJoinPage() {
  const { addStaff } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    rank: '주임',
    empType: 'REGULAR',
    licenseType: 'SAFETY',
    experience: '',
    careerStartDate: '',
    licenses: '',
    phone: '',
    residence: '',
    photo: null,
    birthDate: '',
    age: 0,
    university: '',
    major: '',
    maritalStatus: 'SINGLE',
    workHistory: []
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const addWorkHistory = () => {
    setFormData({
      ...formData,
      workHistory: [...formData.workHistory, { type: 'OTHER', siteName: '', startDate: '', endDate: '', duration: '' }]
    });
  };

  const updateWorkHistory = (index, field, value) => {
    const newHistory = [...formData.workHistory];
    const item = { ...newHistory[index], [field]: value };
    if (field === 'startDate' || field === 'endDate') {
      item.duration = calculateDuration(field === 'startDate' ? value : item.startDate, field === 'endDate' ? value : item.endDate);
    }
    newHistory[index] = item;
    setFormData({ ...formData, workHistory: newHistory });
  };

  const removeWorkHistory = (index) => {
    const newHistory = [...formData.workHistory];
    newHistory.splice(index, 1);
    setFormData({ ...formData, workHistory: newHistory });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedLicenses = formData.licenses ? formData.licenses.split(',').map(l => l.trim()).filter(Boolean) : [];
    
    addStaff({
      ...formData,
      licenses: parsedLicenses.length > 0 ? parsedLicenses : ['없음'],
      status: 'PENDING' // QR 등록은 승인대기 상태로 저장
    });
    
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">제출 완료</h1>
        <p className="text-gray-500 font-bold mb-8">
          개인정보 입력이 정상적으로 완료되었습니다.<br />
          관리자 승인 후 인력풀에 정식 등록됩니다.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full max-w-xs py-4 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-xl"
        >
          확인
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-blue-600 p-8 rounded-b-[40px] shadow-lg mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">신규 인원 등록</h1>
        </div>
        <p className="text-blue-100 font-bold">KOSHA SAFE 시스템 등록을 위해 본인의 정보를 빠짐없이 입력해 주세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 pb-20 space-y-8">
        {/* 사진 업로드 */}
        <div className="flex flex-col items-center">
          <div className="relative group cursor-pointer mb-2">
            <div className="w-32 h-32 rounded-3xl border-4 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center relative shadow-sm">
              {formData.photo ? (
                <img src={formData.photo} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handlePhotoUpload} />
          </div>
          <p className="text-sm text-gray-400 font-black uppercase tracking-wider">본인 사진 등록</p>
        </div>

        <section className="space-y-4">
          <h3 className="text-lg font-black text-gray-900 border-l-4 border-blue-600 pl-3">기본 인적사항</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">이름</label>
              <input required type="text" placeholder="홍길동" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 outline-none transition-all" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">생년월일</label>
                <input required type="date" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 outline-none transition-all" value={formData.birthDate} onChange={(e) => {
                  const birth = e.target.value;
                  setFormData({ ...formData, birthDate: birth, age: birth ? calculateAge(birth) : 0 });
                }} />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">직급</label>
                <select className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 outline-none transition-all appearance-none" value={formData.rank} onChange={(e) => setFormData({ ...formData, rank: e.target.value })}>
                  <option>주임</option>
                  <option>대리</option>
                  <option>과장</option>
                  <option>부장</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">휴대폰 번호</label>
              <input required type="text" placeholder="010-1234-5678" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 outline-none transition-all" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">대학교</label>
                <input type="text" placeholder="대학교명" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 outline-none transition-all" value={formData.university} onChange={(e) => setFormData({ ...formData, university: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">전공</label>
                <input type="text" placeholder="전공명" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 outline-none transition-all" value={formData.major} onChange={(e) => setFormData({ ...formData, major: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">혼인 여부</label>
                <div className="flex gap-2">
                  {['SINGLE', 'MARRIED'].map(status => (
                    <button key={status} type="button" onClick={() => setFormData({ ...formData, maritalStatus: status })} className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all ${formData.maritalStatus === status ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                      {status === 'SINGLE' ? '미혼' : '기혼'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">거주지</label>
                <input required type="text" placeholder="예: 서울시 강남구" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 outline-none transition-all" value={formData.residence} onChange={(e) => setFormData({ ...formData, residence: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">자격 구분</label>
              <div className="flex gap-2">
                {['SAFETY', 'HEALTH', 'DUAL'].map(type => (
                  <button key={type} type="button" onClick={() => setFormData({ ...formData, licenseType: type })} className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${formData.licenseType === type ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                    {type === 'SAFETY' ? '안전' : type === 'HEALTH' ? '보건' : '공통'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">보유 자격증</label>
              <input type="text" placeholder="건설안전기사, 산업위생기사 등" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 outline-none transition-all" value={formData.licenses} onChange={(e) => setFormData({ ...formData, licenses: e.target.value })} />
              <p className="mt-2 text-[10px] text-gray-400 ml-1 font-bold">* 여러개인 경우 쉼표(,)로 구분해 주세요.</p>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-400 mb-1.5 ml-1">경력 시작일 (최초 선임일)</label>
              <input required type="date" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 outline-none transition-all" value={formData.careerStartDate} onChange={(e) => {
                const dateVal = e.target.value;
                setFormData({ ...formData, careerStartDate: dateVal, experience: dateVal ? calculateExperienceYears(dateVal) : '' });
              }} />
              <p className="mt-2 text-[10px] text-gray-400 ml-1 font-bold">* 안전/보건관리자로 최초 선임된 날짜를 입력해 주세요.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center pr-1 border-l-4 border-blue-600 pl-3">
            <h3 className="text-lg font-black text-gray-900">근무 이력</h3>
            <button type="button" onClick={addWorkHistory} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-black">+ 추가</button>
          </div>
          
          <div className="space-y-4">
            {formData.workHistory.map((history, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 relative slide-in-from-right-4 animate-in duration-300">
                <button type="button" onClick={() => removeWorkHistory(idx)} className="absolute -top-2 -right-2 bg-white text-red-500 w-7 h-7 rounded-full shadow-md flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <select className="px-3 py-2.5 rounded-xl bg-white border-none font-black text-xs outline-none" value={history.type} onChange={(e) => updateWorkHistory(idx, 'type', e.target.value)}>
                    <option value="OTHER">타사</option>
                    <option value="OUR">당사</option>
                  </select>
                  <input type="text" placeholder="현장명" className="px-3 py-2.5 rounded-xl bg-white border-none font-black text-xs outline-none" value={history.siteName} onChange={(e) => updateWorkHistory(idx, 'siteName', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" className="px-3 py-2.5 rounded-xl bg-white border-none font-black text-[10px] outline-none" value={history.startDate} onChange={(e) => updateWorkHistory(idx, 'startDate', e.target.value)} />
                  <input type="date" className="px-3 py-2.5 rounded-xl bg-white border-none font-black text-[10px] outline-none" value={history.endDate} onChange={(e) => updateWorkHistory(idx, 'endDate', e.target.value)} />
                </div>
              </div>
            ))}
            {formData.workHistory.length === 0 && (
              <div className="py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                <p className="text-sm font-bold text-gray-400">등록된 이력이 없습니다.</p>
              </div>
            )}
          </div>
        </section>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-100 z-50">
          <button type="submit" className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-2xl active:scale-[0.98] transition-all">
            개인정보 제출하기
          </button>
        </div>
      </form>
    </div>
  );
}
