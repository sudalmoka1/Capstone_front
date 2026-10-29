<template>
  <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
    <div>
      <h2 class="font-bold text-slate-900">AI 판정, 얼마나 믿을 수 있나</h2>
      <p class="text-xs text-slate-500 mt-1 break-keep">
        사람 {{ study.raters }}명이 기사 {{ study.articles }}건을 직접 판정한 결과와 AI 판정을 비교했습니다.
        <b>AI 막대가 '사람끼리' 막대에 가까울수록</b> AI가 사람 한 명만큼 판단한다는 뜻입니다.
        같은 기사를 대형 모델 <b>{{ study.gpt.model }}</b>에도 같은 프롬프트로 판정시켜 함께 비교했습니다.
      </p>
    </div>

    <!-- 종합 점수 -->
    <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <p class="text-xs font-semibold text-indigo-700">종합 신뢰도 점수 일치도 (상관계수)</p>
        <p class="text-sm text-indigo-900 mt-0.5 break-keep">
          AI 점수는 <b>사람끼리 점수가 맞는 정도와 비슷하게</b> 사람 점수와 맞습니다.
        </p>
      </div>
      <div class="flex gap-4 shrink-0">
        <div class="text-right">
          <p class="text-[11px] text-slate-600 flex items-center justify-end gap-1"><span :class="['w-2 h-2 rounded-sm', colors.human]"></span>사람끼리</p>
          <p class="text-xl font-extrabold text-slate-900">{{ study.score.human.toFixed(2) }}</p>
        </div>
        <div class="text-right">
          <p class="text-[11px] text-slate-600 flex items-center justify-end gap-1"><span :class="['w-2 h-2 rounded-sm', colors.ai]"></span>우리 AI</p>
          <p class="text-xl font-extrabold text-slate-900">{{ study.score.ai.toFixed(2) }}</p>
        </div>
        <div class="text-right">
          <p class="text-[11px] text-slate-600 flex items-center justify-end gap-1"><span :class="['w-2 h-2 rounded-sm', colors.gpt]"></span>GPT</p>
          <p class="text-xl font-extrabold text-slate-900">{{ study.score.gpt.toFixed(2) }}</p>
        </div>
      </div>
    </div>

    <!-- 항목별 일치도 -->
    <div class="space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 class="text-xs font-bold text-slate-500">항목별 일치도 (Cohen's κ, 1에 가까울수록 일치)</h3>
        <div class="flex items-center gap-3 text-[11px] text-slate-600 whitespace-nowrap shrink-0">
          <span class="flex items-center gap-1"><span :class="['w-2.5 h-2.5 rounded-sm', colors.human]"></span>사람끼리</span>
          <span class="flex items-center gap-1"><span :class="['w-2.5 h-2.5 rounded-sm', colors.ai]"></span>우리 AI</span>
          <span class="flex items-center gap-1"><span :class="['w-2.5 h-2.5 rounded-sm', colors.gpt]"></span>GPT</span>
        </div>
      </div>

      <ul class="space-y-3">
        <li v-for="item in study.items" :key="item.key" class="flex items-center gap-3">
          <div class="w-24 sm:w-28 shrink-0">
            <p class="text-sm font-semibold text-slate-800">{{ item.label }}</p>
            <span :class="['inline-block mt-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded border', verdicts[item.verdict].style]">
              {{ verdicts[item.verdict].label }}
            </span>
          </div>
          <div class="flex-1 min-w-0 space-y-1.5">
            <div v-for="row in rows" :key="row.key" class="flex items-center gap-2" :title="`${row.label} κ ${item[row.key].toFixed(2)}`">
              <div class="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div :class="['h-full rounded-full', colors[row.key]]" :style="{ width: barWidth(item[row.key]) }"></div>
              </div>
              <span class="w-10 text-right text-xs font-semibold text-slate-700 tabular-nums">{{ item[row.key].toFixed(2) }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- 해석과 한계 -->
    <ul class="text-xs text-slate-500 space-y-1.5 leading-relaxed break-keep border-t border-slate-100 pt-4">
      <li>
        <b class="text-slate-700">과장 표현</b>은 AI(7B 로컬 모델)가 대부분 놓쳐서(κ {{ study.exaggeration.before.toFixed(2) }})
        자극적 표현 사전으로 제목을 한 번 더 검사합니다. 사전을 만들 때 참고하지 않은
        <b>새 기사 {{ study.holdout.articles }}건</b>에서도 {{ study.holdout.before.toFixed(2) }} → {{ study.holdout.after.toFixed(2) }}로
        개선됐습니다 (사람끼리 {{ study.holdout.human.toFixed(2) }}).
        사전 없이 비교하면 {{ study.gpt.model }}도 κ {{ itemOf('exaggeration').gpt.toFixed(2) }}로, 대형 모델에게도 어려운 항목입니다.
      </li>
      <li>
        <b class="text-slate-700">데이터 부합</b>은 사람끼리도 판단이 크게 엇갈립니다(κ {{ itemOf('data_based').human.toFixed(2) }}).
        AI보다 항목 기준 자체를 더 명확히 해야 하는 부분입니다.
        GPT는 판정 시점({{ study.gpt.date }})의 주가 데이터를 받아 우리 AI와 입력이 달라서, 이 항목은 직접 비교하기 어렵습니다.
      </li>
      <li>
        <b class="text-slate-700">GPT 비교</b>: {{ study.gpt.model }}에 우리 AI와 같은 프롬프트를 쓰고 자극적 표현 사전은 적용하지 않았습니다.
        7B 로컬 모델인 우리 AI가 투자 근거·점수 상관에서는 GPT와 비슷하거나 높고, 리스크 설명은 GPT가 조금 더 사람에 가깝습니다.
      </li>
      <li class="text-slate-400">
        검증: {{ study.date }} · 라벨러 {{ study.raters }}명 · 표본이 작아 수치는 ±0.1 정도 흔들릴 수 있습니다.
      </li>
    </ul>
  </section>
</template>

<script setup>
// 검증 결과 (Capstone_back/evaluation 으로 계산한 값, 판정 기준을 바꾸면 다시 계산해서 갱신)
// - 사람 4명 × 기사 100건 (result_4인_규칙적용.md), 과장 사전 검증은 새 기사 50건 (result_new50_rule_title.md)
// - GPT: 같은 100건을 evaluation/run_api.py로 판정 (result_4인_gpt-5-mini.md, 사전 규칙 없음)
const study = {
  date: '2026-10-15',
  raters: 4,
  articles: 100,
  score: { human: 0.39, ai: 0.43, gpt: 0.38 },
  items: [
    { key: 'exaggeration', label: '과장 표현', human: 0.55, ai: 0.58, gpt: 0.34, verdict: 'human' },
    { key: 'investment_basis', label: '투자 근거', human: 0.33, ai: 0.38, gpt: 0.26, verdict: 'human' },
    { key: 'data_based', label: '데이터 부합', human: 0.21, ai: 0.19, gpt: -0.01, verdict: 'unclear' },
    { key: 'risk_explanation', label: '리스크 설명', human: 0.62, ai: 0.51, gpt: 0.57, verdict: 'lower' },
  ],
  exaggeration: { before: 0.29 },
  holdout: { articles: 50, human: 0.2, before: 0.0, after: 0.25 },
  gpt: { model: 'GPT-5 mini', date: '2026-10-29' },
};

const verdicts = {
  human: { label: '사람 수준', style: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  lower: { label: '사람보다 낮음', style: 'bg-amber-50 text-amber-600 border-amber-200' },
  unclear: { label: '기준 모호', style: 'bg-slate-50 text-slate-500 border-slate-200' },
};

// 막대 색 (색약 구분 검사 통과: dataviz validate_palette). 사람끼리는 기준선이라 일부러 무채색
const colors = { human: 'bg-[#475569]', ai: 'bg-[#2a78d6]', gpt: 'bg-[#eb6834]' };
const rows = [
  { key: 'human', label: '사람끼리' },
  { key: 'ai', label: '우리 AI' },
  { key: 'gpt', label: 'GPT' },
];

const barWidth = (k) => `${Math.max(2, Math.min(1, k) * 100)}%`;
const itemOf = (key) => study.items.find((i) => i.key === key);
</script>
