import { ref } from 'vue';

/**
 * 사용자가 열어 본 기사 id 목록 (NEW 표시 숨김용)
 * 브라우저 localStorage에 저장 → 새로고침해도 유지되고, 사용자(브라우저)마다 따로 관리됨
 */
const STORAGE_KEY = 'readArticleIds';
const MAX_IDS = 2000; // 오래 쓰면서 무한히 쌓이지 않도록 최근 것만 보관

const load = () => {
  try {
    const ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(ids) ? ids : [];
  } catch {
    return []; // 시크릿 모드 등 저장소 접근 불가 시에도 화면은 정상 동작
  }
};

const readIds = ref(new Set(load()));

export const isRead = (id) => readIds.value.has(id);

export const markRead = (id) => {
  if (readIds.value.has(id)) return;
  const next = new Set(readIds.value);
  next.add(id);
  readIds.value = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next].slice(-MAX_IDS)));
  } catch {
    // 저장 실패해도 이번 접속 동안은 메모리 기준으로 숨김 유지
  }
};
