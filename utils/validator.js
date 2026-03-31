import { isSeniorQualified } from './calculator.js';
/**
 * 인력 이동 및 배치 제한 검증 로직
 */
export const validateAssignment = (staff, site, action = 'ASSIGN') => {
  const today = new Date(); // 현재 실시간 기준일
  
  if (action === 'UNASSIGN') {
    // 1. (제거된 로직) 프로젝트직 이동 불가 로직 - 시각적 배지만 유지하고 기능적으로는 해제 허용
    /* 
    if (staff.empType === 'PROJECT') {
      const endDate = new Date(site.endDate);
      if (today < endDate) {
        return {
          valid: false,
          message: "⚠️ 프로젝트직은 현장 준공 시까지 이동/해제할 수 없습니다."
        };
      }
    }
    */

    // 2. 대형 현장 필수 고경력자 이동 제한
    if (site.totalAmount >= 1500 && isSeniorQualified(staff)) {
      // 실제로는 대체 인력이 있어야 하지만, 여기서는 기본 제한으로 처리
      return {
        valid: false,
        message: "⚠️ 1,500억 이상 대형 현장의 필수 고경력자(기술사/지도사/년차 충족 기사)는 이동이 제한됩니다."
      };
    }
  }

  return { valid: true };
};
