/**
 * 현재 시각 (테스트용 시간 고정 지원)
 *
 * 개발 서버(npm run dev)에서 .env.development.local 에
 *   VITE_TEST_NOW=2026-10-08T13:00:00
 * 처럼 지정하면 그 시각을 '지금'으로 사용합니다. (NEW 표시, "N분 전" 등)
 * 배포 빌드(npm run build)에서는 항상 실제 시각을 씁니다.
 */
const raw = import.meta.env.DEV ? import.meta.env.VITE_TEST_NOW : undefined;
const parsed = raw ? new Date(raw).getTime() : NaN;

export const testNow = isNaN(parsed) ? null : new Date(parsed);

export const now = () => (testNow ? testNow.getTime() : Date.now());
