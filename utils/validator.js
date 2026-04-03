import { isSeniorQualified } from './calculator.js';
/**
 * 인력 이동 및 배치 제한 검증 로직
 */
export const validateAssignment = (staff, site, action = 'ASSIGN') => {
  const today = new Date(); // 현재 실시간 기준일
  
  if (action === 'UNASSIGN') {
    // 1. 프로젝트직 이동 불가 고지 (경고로만 처리)
    if (staff.empType === 'PROJECT') {
      return {
        valid: true,
        warning: true,
        message: "⚠️ [안내] 해당 인력은 [프로젝트직]으로 계약되어 원칙적으로 현장 준공 시까지 이동/해제가 불가합니다.\n\n강제 해제 시 본사 승인이 필요할 수 있습니다. 계속하시겠습니까?"
      };
    }

    // 2. 대형 현장 필수 고경력자 이동 제한 (경고로만 처리)
    if (site.totalAmount >= 1500 && isSeniorQualified(staff)) {
      return {
        valid: true,
        warning: true,
        message: "⚠️ [안내] 1,500억 이상 대형 현장의 필수 고경력자(기술사/지도사/년차 충족 기사)는 법정 선임 유지의무로 인해 이동이 제한됩니다.\n\n대체 인력이 확보된 경우에만 진행해 주세요. 계속하시겠습니까?"
      };
    }
  }

  return { valid: true };
};
