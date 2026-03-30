/**
 * 사용자가 제공한 상세 안전/보건관리자 배치(선임) 기준 반영
 */
export const calculateRequiredStaff = (site) => {
  const { totalAmount, subAmt, isSubProxy, type, isDemolition, startDate, endDate } = site;
  
  // 0. 기본 변수 설정
  const today = new Date('2026-03-30'); // 시스템 기준일 (현재 날짜)
  const start = new Date(startDate || '2026-01-01');
  const end = new Date(endDate || '2026-12-31');
  
  // 공사기간 계산 (일수 단위)
  const totalDays = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(0, (today - start) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(0, (end - today) / (1000 * 60 * 60 * 24));
  
  const isInitialPhase = elapsedDays <= totalDays * 0.15;
  const isFinalPhase = remainingDays <= totalDays * 0.15;
  const isReducedPhase = isInitialPhase || isFinalPhase;

  // 15% 시점 날짜 계산
  const fifteenPercentMs = totalDays * 0.15 * 24 * 60 * 60 * 1000;
  const initialPhaseEnd = new Date(start.getTime() + fifteenPercentMs);
  const finalPhaseStart = new Date(end.getTime() - fifteenPercentMs);

  // 6, 7, 8번 기준: 수급인 공사 금액 차감 로직
  // 수급인이 직접 선임하든 원도급사가 대리 선임하든, 원도급사 기준 금액에서는 해당 금액을 제외함
  const subAmtVal = Number(subAmt || 0);
  const netAmt = (subAmtVal > 0) ? totalAmount - subAmtVal : totalAmount;
  const subAppointmentType = site.subAppointmentType || (site.isSubProxy ? 'PROXY' : 'NONE');

  let safetyReq = 0;
  let seniorReq = 0;

  // 1 & 2. 공사 종류별 안전관리자 기본 인원 산정
  if (type === 'ARCH') { // 건축현장
    if (netAmt >= 3900) { safetyReq = 6; seniorReq = 2; }
    else if (netAmt >= 3000) { safetyReq = 5; seniorReq = 2; }
    else if (netAmt >= 2200) { safetyReq = 4; seniorReq = 1; }
    else if (netAmt >= 1500) { safetyReq = 3; seniorReq = 1; }
    else if (netAmt >= 800) { safetyReq = 2; seniorReq = 0; }
    else if (netAmt >= 120) { safetyReq = 1; seniorReq = 0; }
  } else { // 토목현장
    if (netAmt >= 800) { safetyReq = 2; seniorReq = 0; }
    else if (netAmt >= 150) { safetyReq = 1; seniorReq = 0; }
    // 토목현장 1,500억 이상 예시는 사용자 설명에 "3명 (7년 이상 경력자 1명 반드시 포함)"으로 되어 있음
    if (netAmt >= 1500) { safetyReq = 3; seniorReq = 1; }
  }

  // 3-①. 전후 15% 기간 50% 감면 (착공/준공 15% 시점)
  if (isReducedPhase) {
    safetyReq = Math.max(1, Math.ceil(safetyReq * 0.5)); // 최소 1명은 유지 (관례상)
    
    // 3-②, ③. 경력자(7년↑) 15% 기간 필수 포함 로직
    if (netAmt >= 1500 && netAmt < 3000) seniorReq = 1;
    else if (netAmt >= 3000) seniorReq = 1; // 3000억 이상 4900억 미만 50%(1명) 필수
  }

  // 5번 기준: 철거공사 포함 시 50% 감면
  if (isDemolition) {
    safetyReq = Math.max(1, Math.ceil(safetyReq * 0.5));
    seniorReq = Math.max(0, Math.ceil(seniorReq * 0.5));
  }

  // 8번 기준: 대리 선임 시 협력사 1명분을 가산
  let proxyReq = 0;
  if (subAppointmentType === 'PROXY') {
    proxyReq = 1;
    safetyReq += proxyReq;
  }

  // 보건관리자 기준
  let healthReq = 0;
  if (type === 'ARCH' && totalAmount >= 800) healthReq = 1;
  else if (type === 'CIVIL' && totalAmount >= 1000) healthReq = 1;

  return {
    safety: safetyReq,
    health: healthReq,
    senior: seniorReq,
    isReducedPhase,
    initialPhaseEnd: initialPhaseEnd.toISOString().split('T')[0],
    finalPhaseStart: finalPhaseStart.toISOString().split('T')[0],
    mainSafetyReq: safetyReq - proxyReq, // 원도급사 본분
    proxyReq: proxyReq, // 대리 선임분
    netAmt: netAmt
  };
};

/**
 * 날짜를 기준으로 현재 만 나이(또는 만 연차)를 계산 (전역 시스템 기준일 반영 가능)
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  
  const start = new Date(birthDate);
  const now = new Date('2026-03-30'); // 시스템 기준일 (현재 날짜)
  
  if (isNaN(start.getTime())) return 0;

  let age = now.getFullYear() - start.getFullYear();
  
  // 아직 해당 월/일이 지나지 않았으면 1세 차감
  if (now.getMonth() < start.getMonth() || (now.getMonth() === start.getMonth() && now.getDate() < start.getDate())) {
    age--;
  }
  
  return age > 0 ? age : 0;
};

/**
 * 입사일(경력 시작일)을 기준으로 현재 년차를 자동 계산 (만 계산 방식)
 */
export const calculateExperienceYears = (startDate) => {
  return calculateAge(startDate);
};

/**
 * 사용자가 정의한 '경력 7년차 이상(Senior)' 자격 충족 여부 판단
 * 1. 건설/산업안전기사: 7년 이상
 * 2. 산업안전지도사/건설안전기술사: 즉시 충족
 * 3. 건설/산업안전산업기사: 10년 이상
 */
export const isSeniorQualified = (staff) => {
  if (!staff || !staff.licenses) return false;
  
  const licenseList = Array.isArray(staff.licenses) ? staff.licenses : [];
  const exp = Number(staff.experience || 0);

  // 1. 기술사/지도사는 경력 무관 즉시 충족
  if (licenseList.some(l => l.includes('기술사') || l.includes('지도사'))) {
    return true;
  }

  // 2. 기사 급은 7년 이상
  if (licenseList.some(l => l.includes('기사') && !l.includes('산업기사'))) {
    return exp >= 7;
  }

  // 3. 산업기사 급은 10년 이상
  if (licenseList.some(l => l.includes('산업기사'))) {
    return exp >= 10;
  }

  // 4. 기타(기본 '건설안전' 등)는 7년 기준으로 처리
  return exp >= 7;
};
