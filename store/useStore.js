import { create } from 'zustand';

const INITIAL_HR_POOL = [
  // 을지로4가 오피스(13지구) - 1,321억
  { id: 'H1', name: '유명철', rank: '부장', empType: 'REGULAR', licenseType: 'SAFETY', experience: 25, licenses: ['건설안전'], assignedSiteId: 'S1' },
  { id: 'H2', name: '홍성천', rank: '차장', empType: 'REGULAR', licenseType: 'SAFETY', experience: 18, licenses: ['산업안전'], assignedSiteId: 'S1' },
  { id: 'H3', name: '유상종', rank: '주임', empType: 'REGULAR', licenseType: 'SAFETY', experience: 4, licenses: ['산업안전'], assignedSiteId: 'S1' },
  { id: 'H4', name: '이현우', rank: '주임', empType: 'REGULAR', licenseType: 'HEALTH', experience: 3, licenses: ['산업위생'], assignedSiteId: 'S1' },
  
  // 을지로(15지구) - 1,024억
  { id: 'H5', name: '이상률', rank: '부장', empType: 'REGULAR', licenseType: 'SAFETY', experience: 22, licenses: ['산업안전'], assignedSiteId: 'S2' },
  { id: 'H6', name: '전준혁', rank: '주임', empType: 'REGULAR', licenseType: 'SAFETY', experience: 2, licenses: ['산업안전'], assignedSiteId: 'S2' },
  { id: 'H7', name: '민성호', rank: '주임', empType: 'PROJECT', licenseType: 'HEALTH', experience: 5, licenses: ['산업위생'], assignedSiteId: 'S2' },

  // 파주운정6차 - 1,118억
  { id: 'H8', name: '한용준', rank: '부장', empType: 'REGULAR', licenseType: 'SAFETY', experience: 20, licenses: ['건설안전'], assignedSiteId: 'S3' },
  { id: 'H9', name: '최주형', rank: '대리', empType: 'REGULAR', licenseType: 'SAFETY', experience: 8, licenses: ['산업안전'], assignedSiteId: 'S3' },
  { id: 'H10', name: '이승준', rank: '대리', empType: 'REGULAR', licenseType: 'SAFETY', experience: 9, licenses: ['산업안전'], assignedSiteId: 'S3' },

  // 고양풍동 - 1,388억
  { id: 'H11', name: '고용구', rank: '차장', empType: 'REGULAR', licenseType: 'SAFETY', experience: 16, licenses: ['산업안전'], assignedSiteId: 'S4' },

  // 김포북변 재개발 - 2,454억
  { id: 'H12', name: '임형석', rank: '부장', empType: 'REGULAR', licenseType: 'SAFETY', experience: 21, licenses: ['산업안전'], assignedSiteId: 'S5' },
  { id: 'H13', name: '이승엽', rank: '과장', empType: 'REGULAR', licenseType: 'SAFETY', experience: 14, licenses: ['산업안전'], assignedSiteId: 'S5' },
  { id: 'H14', name: '이현우', rank: '주임', empType: 'REGULAR', licenseType: 'SAFETY', experience: 5, licenses: ['산업안전'], assignedSiteId: 'S5' },
  { id: 'H15', name: '김대우', rank: '주임', empType: 'REGULAR', licenseType: 'SAFETY', experience: 4, licenses: ['산업안전'], assignedSiteId: 'S5' },
  { id: 'H16', name: '한상윤', rank: '주임', empType: 'REGULAR', licenseType: 'SAFETY', experience: 3, licenses: ['산업안전'], assignedSiteId: 'S5' },
  { id: 'H17', name: '김인수', rank: '주임', empType: 'REGULAR', licenseType: 'SAFETY', experience: 2, licenses: ['산업안전'], assignedSiteId: 'S5' },

  // 남원주역세권1차 - 2,458억
  { id: 'H18', name: '황준식', rank: '부장', empType: 'REGULAR', licenseType: 'SAFETY', experience: 19, licenses: ['건설안전'], assignedSiteId: 'S6' },
  { id: 'H19', name: '유수영', rank: '대리', empType: 'REGULAR', licenseType: 'HEALTH', experience: 7, licenses: ['간호사'], assignedSiteId: 'S6' },
  { id: 'H20', name: '김은혜', rank: '주임', empType: 'REGULAR', licenseType: 'SAFETY', experience: 4, licenses: ['산업안전'], assignedSiteId: 'S6' },

  // 울산다운1차 - 3,255억
  { id: 'H21', name: '이정길', rank: '부장', empType: 'REGULAR', licenseType: 'SAFETY', experience: 26, licenses: ['건설안전'], assignedSiteId: 'S7' },
  { id: 'H22', name: '조광오', rank: '주임', empType: 'REGULAR', licenseType: 'SAFETY', experience: 6, licenses: ['산업안전'], assignedSiteId: 'S7' },
  { id: 'H23', name: '김성욱', rank: '주임', empType: 'REGULAR', licenseType: 'HEALTH', experience: 4, licenses: ['인간공학'], assignedSiteId: 'S7' },

  // 가용 인력풀 (미배치 전문 인력)
  { id: 'H24', name: '박건설', rank: '차장', empType: 'REGULAR', licenseType: 'DUAL', experience: 15, licenses: ['건설안전기사', '대기환경기사'], assignedSiteId: null },
  { id: 'H25', name: '최보건', rank: '과장', empType: 'REGULAR', licenseType: 'HEALTH', experience: 12, licenses: ['산업위생관리기사', '환경기사'], assignedSiteId: null },
  { id: 'H26', name: '이사원', rank: '주임', empType: 'PROJECT', licenseType: 'SAFETY', experience: 3, licenses: ['산업안전기사'], assignedSiteId: null },
  { id: 'H27', name: '김전문', rank: '부장', empType: 'REGULAR', licenseType: 'SAFETY', experience: 22, licenses: ['건설안전기술사'], assignedSiteId: null },
];

const INITIAL_SITES = [
  { id: 'S1', name: '을지로4가 오피스(13지구)', region: '서울권', type: 'ARCH', totalAmount: 1321, subAmt: 0, isSubProxy: false, endDate: '2026-12-31' },
  { id: 'S2', name: '을지로(15지구)', region: '서울권', type: 'ARCH', totalAmount: 1024, subAmt: 0, isSubProxy: false, endDate: '2027-06-30' },
  { id: 'S3', name: '파주운정6차', region: '경기권', type: 'ARCH', totalAmount: 1118, subAmt: 0, isSubProxy: false, endDate: '2026-10-15' },
  { id: 'S4', name: '고양풍동', region: '경기권', type: 'ARCH', totalAmount: 1388, subAmt: 0, isSubProxy: false, endDate: '2028-03-20' },
  { id: 'S5', name: '김포북변 재개발', region: '경기권', type: 'ARCH', totalAmount: 2454, subAmt: 220, isSubProxy: true, endDate: '2027-11-10' },
  { id: 'S6', name: '남원주역세권1차', region: '강원권', type: 'ARCH', totalAmount: 2458, subAmt: 0, isSubProxy: false, endDate: '2026-08-15' },
  { id: 'S7', name: '울산다운1차', region: '영남권', type: 'ARCH', totalAmount: 3255, subAmt: 310, isSubProxy: true, endDate: '2028-05-22' },
  { id: 'S8', name: '광주운암산3단지', region: '호남권', type: 'ARCH', totalAmount: 2493, subAmt: 0, isSubProxy: false, endDate: '2027-09-30' },
];

export const useStore = create((set, get) => ({
  hrPool: INITIAL_HR_POOL,
  sites: INITIAL_SITES,
  siteDirectoryPdf: null,
  isLoaded: false,
  
  setInitialData: (data) => set({
    hrPool: data.hrPool || INITIAL_HR_POOL,
    sites: data.sites || INITIAL_SITES,
    siteDirectoryPdf: data.siteDirectoryPdf || null,
    isLoaded: true
  }),
  
  setSiteDirectoryPdf: (pdfData) => set({ siteDirectoryPdf: pdfData }),
  
  assignStaff: (staffId, siteId) => set((state) => ({
    hrPool: state.hrPool.map((staff) => 
      staff.id === staffId ? { ...staff, assignedSiteId: siteId } : staff
    )
  })),

  unassignStaff: (staffId) => set((state) => ({
    hrPool: state.hrPool.map((staff) => 
      staff.id === staffId ? { ...staff, assignedSiteId: null } : staff
    )
  })),

  addStaff: (staff) => set((state) => ({
    hrPool: [...state.hrPool, { ...staff, id: `HR_${Date.now()}`, assignedSiteId: null }]
  })),

  removeStaff: (staffId) => set((state) => ({
    hrPool: state.hrPool.filter((staff) => staff.id !== staffId)
  })),

  updateStaff: (staffId, updatedData) => set((state) => ({
    hrPool: state.hrPool.map((staff) => staff.id === staffId ? { ...staff, ...updatedData } : staff)
  })),

  addSite: (site) => set((state) => ({
    sites: [...state.sites, { ...site, id: `S_${Date.now()}` }]
  })),

  removeSite: (siteId) => set((state) => ({
    sites: state.sites.filter((site) => site.id !== siteId),
    hrPool: state.hrPool.map((staff) => 
      staff.assignedSiteId === siteId ? { ...staff, assignedSiteId: null } : staff
    )
  })),

  updateSite: (siteId, updatedData) => set((state) => ({
    sites: state.sites.map((site) => site.id === siteId ? { ...site, ...updatedData } : site)
  })),

  moveSite: (siteId, direction) => set((state) => {
    const index = state.sites.findIndex(s => s.id === siteId);
    if (index < 0) return state;
    
    const newSites = [...state.sites];
    if (direction === 'up' && index > 0) {
      [newSites[index - 1], newSites[index]] = [newSites[index], newSites[index - 1]];
    } else if (direction === 'down' && index < newSites.length - 1) {
      [newSites[index + 1], newSites[index]] = [newSites[index], newSites[index + 1]];
    }
    return { sites: newSites };
  }),

  reorderSites: (oldIndex, newIndex) => set((state) => {
    const newSites = [...state.sites];
    const [movedItem] = newSites.splice(oldIndex, 1);
    newSites.splice(newIndex, 0, movedItem);
    return { sites: newSites };
  }),
}));

// Sync with Vercel KV API
if (typeof window !== 'undefined') {
  // Load initial data
    fetch('/api/data', { cache: 'no-store' })
      .then((res) => res.json())
    .then((data) => {
      if (!data.isNull && !data.error) {
        useStore.getState().setInitialData(data);
      } else {
        useStore.setState({ isLoaded: true });
      }
    })
    .catch((err) => {
      console.error('Failed to load data from KV:', err);
      useStore.setState({ isLoaded: true });
    });

  // Subscribe and save changes to KV
  let saveTimeout;
  useStore.subscribe((state, prevState) => {
    if (!state.isLoaded) return;
    
    // Only save if actual data changed (ignore isLoaded flag changes)
    if (state.hrPool === prevState.hrPool && state.sites === prevState.sites && state.siteDirectoryPdf === prevState.siteDirectoryPdf) return;
    
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hrPool: state.hrPool,
          sites: state.sites,
          siteDirectoryPdf: state.siteDirectoryPdf
        }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('KV POST Server Error:', data.error);
          alert('데이터베이스 저장 중 오류가 발생했습니다. (파일 용량 초과 등)\n에러: ' + data.error);
        }
      })
      .catch(err => {
        console.error('Failed to save to KV:', err);
        alert('네트워크 연결 오류 또는 서버 오류로 저장이 실패했습니다.');
      });
    }, 500); // 0.5초 딜레이 후 쾌속 저장
  });
}
