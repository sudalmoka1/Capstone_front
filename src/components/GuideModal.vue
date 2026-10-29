<template>
  <!-- 첫 방문 안내: 몇 장의 카드를 넘겨 보는 방식 (헤더의 ? 버튼으로 다시 열 수 있음) -->
  <Transition name="guide" :duration="{ enter: 400, leave: 250 }">
    <div
      v-if="open"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      @click.self="close"
    >
      <div
        class="guide-panel bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
      >
        <!-- 진행 표시 + 건너뛰기 -->
        <div class="flex items-center justify-between mb-5">
          <div class="flex gap-1.5" aria-hidden="true">
            <span
              v-for="(_, i) in steps"
              :key="i"
              :class="['h-1.5 rounded-full transition-all', i === step ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-200']"
            ></span>
          </div>
          <button
            v-if="!isLast"
            type="button"
            @click="close"
            class="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition"
          >
            건너뛰기
          </button>
        </div>

        <!-- 본문 -->
        <div class="min-h-[15rem] space-y-3">
          <p class="text-3xl" aria-hidden="true">{{ current.icon }}</p>
          <h2 id="guide-title" class="text-lg font-bold text-slate-900 leading-snug">{{ current.title }}</h2>

          <!-- 1. 사이트 소개 -->
          <template v-if="current.key === 'intro'">
            <p class="text-sm text-slate-600 leading-relaxed">
              네이버 뉴스의 증권 기사를 모아 <b class="text-slate-800">AI가 기사를 하나하나 읽고</b>,
              과장되거나 근거가 부족한 기사를 골라내는 사이트입니다.
            </p>
            <p class="text-sm text-slate-600 leading-relaxed">
              기사가 나온 뒤 실제 주가가 어떻게 움직였는지도 함께 보여 줍니다.
            </p>
          </template>

          <!-- 2. 점수 읽는 법 -->
          <template v-else-if="current.key === 'score'">
            <p class="text-sm text-slate-600 leading-relaxed">
              AI가 아래 4가지를 확인하고, 문제가 있는 항목마다 <b class="text-slate-800">25점씩 깎습니다</b> (100점 만점).
            </p>
            <ul class="grid grid-cols-2 gap-1.5 text-xs text-slate-700">
              <li class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">과장된 표현이 있는가</li>
              <li class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">구체적 근거가 있는가</li>
              <li class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">시장 데이터와 맞는가</li>
              <li class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">손실 위험을 알리는가</li>
            </ul>
            <div class="flex flex-wrap gap-1.5 pt-1 text-xs font-bold">
              <span class="px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200">75점 이상 · 양호</span>
              <span class="px-2.5 py-1 rounded-full border bg-amber-50 text-amber-600 border-amber-200">50~74점 · 주의</span>
              <span class="px-2.5 py-1 rounded-full border bg-rose-50 text-rose-600 border-rose-200">50점 미만 · 과장 의심</span>
            </div>
          </template>

          <!-- 3. 사용법 -->
          <template v-else-if="current.key === 'howto'">
            <ul class="space-y-2.5 text-sm text-slate-600 leading-relaxed">
              <li class="flex gap-2">
                <span class="shrink-0 font-bold text-indigo-600">①</span>
                <span><b class="text-slate-800">기사 카드를 누르면</b> AI 리포트와 관련 종목의 주가 차트가 나옵니다.</span>
              </li>
              <li class="flex gap-2">
                <span class="shrink-0 font-bold text-indigo-600">②</span>
                <span><b class="text-slate-800">과장 의심 기사만 보기</b>를 켜면 50점 미만 기사만 모아 볼 수 있습니다.</span>
              </li>
              <li class="flex gap-2">
                <span class="shrink-0 font-bold text-indigo-600">③</span>
                <span><b class="text-slate-800">분석 탭</b>에서는 많이 언급된 종목, 언론사별 통계, AI 판정이 얼마나 정확한지를 볼 수 있습니다.</span>
              </li>
            </ul>
          </template>

          <!-- 4. 주의 -->
          <template v-else>
            <p class="text-sm text-slate-600 leading-relaxed">
              이 사이트는 학업 목적의 졸업작품입니다. AI 판정은 <b class="text-slate-800">틀릴 수 있으며</b>,
              어떤 종목의 매수·매도도 권유하지 않습니다.
            </p>
            <p class="text-sm text-slate-600 leading-relaxed">
              기사 원문은 각 리포트의 "원문 보기"에서 확인하세요.
            </p>
            <p class="text-xs text-slate-400">이 안내는 오른쪽 위 <b>?</b> 버튼으로 다시 볼 수 있습니다.</p>
          </template>
        </div>

        <!-- 이동 버튼 -->
        <div class="flex gap-2 mt-6">
          <button
            v-if="step > 0"
            type="button"
            @click="step--"
            class="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition"
          >
            이전
          </button>
          <button
            type="button"
            @click="isLast ? close() : step++"
            class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition"
          >
            {{ isLast ? '시작하기' : '다음' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(['close']);

const steps = [
  { key: 'intro', icon: '📰', title: '증권 뉴스 해체 분석기에 오신 걸 환영합니다' },
  { key: 'score', icon: '🎯', title: 'AI 점수는 이렇게 읽어요' },
  { key: 'howto', icon: '👆', title: '이렇게 써 보세요' },
  { key: 'notice', icon: '⚠️', title: '꼭 알아 두세요' },
];

const step = ref(0);
const current = computed(() => steps[step.value]);
const isLast = computed(() => step.value === steps.length - 1);

// 다시 열 때는 항상 첫 장부터
watch(() => props.open, (open) => {
  if (open) step.value = 0;
});

const close = () => emit('close');

const onKeydown = (e) => {
  if (!props.open) return;
  if (e.key === 'Escape') close();
  else if (e.key === 'ArrowRight' && !isLast.value) step.value++;
  else if (e.key === 'ArrowLeft' && step.value > 0) step.value--;
};

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<style scoped>
.guide-enter-active,
.guide-leave-active {
  transition: opacity 0.25s ease;
}
.guide-enter-from,
.guide-leave-to {
  opacity: 0;
}

.guide-enter-active .guide-panel {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}
.guide-leave-active .guide-panel {
  transition: transform 0.25s ease-in, opacity 0.2s ease-in;
}
.guide-enter-from .guide-panel {
  transform: translateY(40px) scale(0.98);
  opacity: 0;
}
.guide-leave-to .guide-panel {
  transform: translateY(20px);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .guide-enter-active .guide-panel,
  .guide-leave-active .guide-panel {
    transition: opacity 0.2s ease;
  }
  .guide-enter-from .guide-panel,
  .guide-leave-to .guide-panel {
    transform: none;
  }
}
</style>
