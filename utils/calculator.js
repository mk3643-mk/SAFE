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

  // 6번 & 8번 기준: 수급인 차감 로직 적용 금액
  // 원도급사는 (전체 - 수급인) 금액으로 기준 인원 산정
  const netAmt = isSubProxy ? totalAmount - (subAmt || 0) : totalAmount;

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

  // 8번 기준: 대리 선임 시 협력사 1명분을 원도급사 관리 인원에서 별도로 보지 않고, 
  // 원도급사 인원 + 대리 선임 1명으로 총합 계산
  if (isSubProxy) {
    safetyReq += 1;
  }

  // 보건관리자 기준
  let healthReq = 0;
  if (type === 'ARCH' && totalAmount >= 800) healthReq = 1;
  else if (type === 'CIVIL' && totalAmount >= 1000) healthReq = 1;

  return {
    safety: safetyReq,
    health: healthReq,
    senior: seniorReq,
    isReducedPhase
  };
};

/**
 * 입사일(경력 시작일)을 기준으로 현재 년차를 자동 계산 (만 나이와 동일한 방식 연산)
 */
export const calculateExperienceYears = (startDate) => {
  if (!startDate) return 0;
  
  const start = new Date(startDate);
  const now = new Date();
  
  // 유효하지 않은 날짜 처리
  if (isNaN(start.getTime())) return 0;

  let years = now.getFullYear() - start.getFullYear();
  
  // 아직 입사월/일이 지나지 않았으면 1년 차감 (만 연차 기준)
  if (now.getMonth() < start.getMonth() || (now.getMonth() === start.getMonth() && now.getDate() < start.getDate())) {
    years--;
  }
  
  // 최소 0년차, 혹은 본사 기준 +1년차 처리 시 여기서 변경 가능 (현재는 만 계산)
  return years > 0 ? years : 0;
};
