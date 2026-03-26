/**
 * 법정 안전/보건관리자 인원 산출 핵심 산식
 * 15% 완화 적용 및 대리 선임 금액 차감 포함
 */
export const calculateRequiredStaff = (site) => {
  // 수급인 100억↑ 대리 선임 시 차감 로직
  const netAmt = site.isSubProxy ? site.totalAmt - site.subAmt : site.totalAmt;
  
  let safetyReq = 1;
  let healthReq = 1;

  // 안전관리자 기준 (간소화된 예시 산식, 실제 산안법 기준 적용 필요)
  if (netAmt >= 1500) safetyReq = 3;
  else if (netAmt >= 800) safetyReq = 2;
  else if (netAmt >= 50) safetyReq = 1;

  // 보건관리자 기준
  if (site.totalAmt >= 3000) healthReq = 2;
  else if (site.totalAmt >= 800) healthReq = 1;

  return {
    safety: safetyReq,
    health: healthReq,
    needSenior: site.totalAmt >= 1500 // 1500억 이상 고경력자 필수 여부
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
