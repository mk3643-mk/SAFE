'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore.js';
import { calculateExperienceYears, calculateAge, calculateDuration } from '../utils/calculator.js';

export default function StaffRegistrationModal({ isOpen, onClose }) {
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

  const addWorkHistory = () => {
    setFormData({
      ...formData,
      workHistory: [...formData.workHistory, { type: 'OTHER', siteName: '', startDate: '', endDate: '', duration: '' }]
    });
  };

  const removeWorkHistory = (index) => {
    const newHistory = [...formData.workHistory];
    newHistory.splice(index, 1);
    setFormData({ ...formData, workHistory: newHistory });
  };

  const updateWorkHistory = (index, field, value) => {
    const newHistory = [...formData.workHistory];
    const item = { ...newHistory[index], [field]: value };
    
    if (field === 'startDate' || field === 'endDate') {
      const s = field === 'startDate' ? value : item.startDate;
      const e = field === 'endDate' ? value : item.endDate;
      item.duration = calculateDuration(s, e);
    }
    
    newHistory[index] = item;
    setFormData({ ...formData, workHistory: newHistory });
  };

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

          // 아주 가벼운 JPEG로 압축 변환 (DB 용량 초과 방지)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setFormData({ ...formData, photo: compressedBase64 });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // 자격증 문자열을 배열로 파싱
    const parsedLicenses = formData.licenses ? formData.licenses.split(',').map(l => l.trim()).filter(Boolean) : [];
    
    addStaff({
      name: formData.name,
      rank: formData.rank,
      age: Number(formData.age),
      birthDate: formData.birthDate,
      phone: formData.phone,
      experience: Number(formData.experience),
      licenses: parsedLicenses.length > 0 ? parsedLicenses : ['없음'],
      residence: formData.residence,
      empType: formData.empType,
      licenseType: formData.licenseType,
      photo: formData.photo,
      careerStartDate: formData.careerStartDate,
      university: formData.university,
      major: formData.major,
      maritalStatus: formData.maritalStatus,
      workHistory: formData.workHistory
    });
    
    onClose();
    setFormData({
      name: '',
      rank: '주임',
      birthDate: '',
      age: 0,
      phone: '',
      licenses: '',
      experience: '',
      careerStartDate: '',
      residence: '',
      empType: 'REGULAR',
      licenseType: 'SAFETY',
      photo: null,
      university: '',
      major: '',
      maritalStatus: 'SINGLE',
      workHistory: []
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">신규 인력 등록</h3>
            <p className="text-sm text-gray-500 mt-1">새로운 안전/보건 전문 인력을 인력풀에 등록합니다.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* 사진 업로드 섹션 */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer mb-2">
              <div className="w-24 h-24 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center relative">
                {formData.photo ? (
                  <img src={formData.photo} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-10 h-10 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handlePhotoUpload}
              />
            </div>
            <p className="text-xs text-gray-400 font-bold">얼굴 사진 등록 (선택)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 기본 정보 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">이름</label>
              <input
                required
                type="text"
                placeholder="예: 홍길동"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">직급</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
              >
                <option>주임</option>
                <option>대리</option>
                <option>과장</option>
                <option>부장</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">생년월일</label>
              <input
                required
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={formData.birthDate}
                onChange={(e) => {
                  const birth = e.target.value;
                  const calcAge = birth ? calculateAge(birth) : 0;
                  setFormData({ ...formData, birthDate: birth, age: calcAge });
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">만나이</label>
              <input
                readOnly
                type="number"
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 transition-all outline-none cursor-not-allowed font-bold"
                value={formData.age}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">휴대폰</label>
              <input
                type="text"
                placeholder="예: 010-1234-5678"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="col-span-full grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">대학교</label>
                <input
                  type="text"
                  placeholder="대학교명 입력"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">전공</label>
                <input
                  type="text"
                  placeholder="전공 입력"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                />
              </div>
            </div>

            <div className="col-span-full grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">거주지</label>
                <input
                  type="text"
                  placeholder="예: 서울시 강남구 역삼동"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  value={formData.residence}
                  onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">혼인 여부</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, maritalStatus: 'SINGLE' })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      formData.maritalStatus === 'SINGLE' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    미혼
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, maritalStatus: 'MARRIED' })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      formData.maritalStatus === 'MARRIED' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    기혼
                  </button>
                </div>
              </div>
            </div>

            <div className="col-span-full grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">경력 시작일</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  value={formData.careerStartDate || ''}
                  onChange={(e) => {
                    const dateVal = e.target.value;
                    const calcExp = dateVal ? calculateExperienceYears(dateVal) : formData.experience;
                    setFormData({...formData, careerStartDate: dateVal, experience: calcExp});
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">경력 (년차)</label>
                <input
                  required
                  type="number"
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  value={formData.experience !== undefined ? formData.experience : ''}
                  onChange={(e) => {
                    const years = Number(e.target.value);
                    const currentYear = new Date().getFullYear();
                    const autoStartDate = new Date(currentYear - years, 0, 2).toISOString().split('T')[0];
                    setFormData({...formData, experience: years, careerStartDate: autoStartDate});
                  }}
                />
              </div>
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-bold text-gray-700 mb-2">자격증</label>
              <input
                type="text"
                placeholder="예: 건설안전기사, 산업위생관리산업기사 (쉼표로 구분)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={formData.licenses}
                onChange={(e) => setFormData({ ...formData, licenses: e.target.value })}
              />
            </div>

            {/* 근무 이력 섹션 */}
            <div className="col-span-full border-t border-gray-100 pt-6 mt-2">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-bold text-gray-700">근무 이력</label>
                <button 
                  type="button" 
                  onClick={addWorkHistory}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  항목 추가
                </button>
              </div>

              {formData.workHistory.map((history, idx) => (
                <div key={idx} className="bg-gray-50/50 rounded-2xl p-4 mb-4 border border-gray-100 relative group">
                  <button 
                    type="button" 
                    onClick={() => removeWorkHistory(idx)}
                    className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-500 rounded-full p-1.5 shadow-sm border border-gray-100 hover:border-red-100 transition-colors z-10"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">구분</label>
                      <select 
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white text-xs font-bold"
                        value={history.type}
                        onChange={(e) => updateWorkHistory(idx, 'type', e.target.value)}
                      >
                        <option value="OTHER">타사</option>
                        <option value="OUR">당사</option>
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">현장명</label>
                      <input 
                        type="text" 
                        placeholder="현장명 입력" 
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-xs"
                        value={history.siteName}
                        onChange={(e) => updateWorkHistory(idx, 'siteName', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">시작일</label>
                      <input 
                        type="date" 
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-[10px]"
                        value={history.startDate}
                        onChange={(e) => updateWorkHistory(idx, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">종료일</label>
                      <input 
                        type="date" 
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-[10px]"
                        value={history.endDate}
                        onChange={(e) => updateWorkHistory(idx, 'endDate', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">근무기간 (자동)</label>
                      <input 
                        readOnly 
                        type="text" 
                        placeholder="-" 
                        className="w-full px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-gray-500 transition-all outline-none cursor-not-allowed font-bold text-xs"
                        value={history.duration}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {formData.workHistory.length === 0 && (
                <div className="p-10 border-2 border-dashed border-gray-100 rounded-3xl text-center">
                  <p className="text-sm text-gray-400">근무 이력이 없습니다. '항목 추가'를 눌러 등록해 주세요.</p>
                </div>
              )}
            </div>

            {/* 자격 구분 및 고용 형태 */}
            <div className="col-span-full border-t border-gray-100 pt-6 mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">자격 구분 (배치 가능 분야)</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, licenseType: 'SAFETY' })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      formData.licenseType === 'SAFETY' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    안전
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, licenseType: 'HEALTH' })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      formData.licenseType === 'HEALTH' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    보건
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, licenseType: 'DUAL' })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      formData.licenseType === 'DUAL' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    안전/보건
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">고용 형태</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, empType: 'REGULAR' })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      formData.empType === 'REGULAR' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    정규직
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, empType: 'PROJECT' })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      formData.empType === 'PROJECT' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    프로젝트직
                  </button>
                </div>
              </div>
            </div>

          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-[2] py-4 rounded-xl font-bold text-white bg-gray-900 hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]"
            >
              인력 등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
