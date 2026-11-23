// 영어/한국어/중국어(간체)/일본어 문구 사전. 페이지의 <html lang="..."> 값으로 언어를 정합니다.
// 영어: 사이트 루트(/), 한국어: /ko/, 중국어: /zh/, 일본어: /ja/

const htmlLang = document.documentElement.lang.toLowerCase();
export const lang = htmlLang.startsWith('ko')
  ? 'ko'
  : htmlLang.startsWith('zh')
    ? 'zh'
    : htmlLang.startsWith('ja')
      ? 'ja'
      : 'en';

const dict = {
  // 공통
  onlyVideo: {
    en: 'Please choose a video file.',
    ko: '동영상 파일만 선택할 수 있어요.',
    zh: '请选择视频文件。',
    ja: '動画ファイルを選択してください。',
  },
  over25gb: {
    en: 'Over 2.5GB — this may fail. Trimming to a shorter clip is recommended',
    ko: '2.5GB가 넘어 실패할 수 있어요. 구간을 잘라서 처리하는 걸 추천해요',
    zh: '超过2.5GB，可能会失败。建议剪成较短的片段',
    ja: '2.5GBを超えているため失敗する可能性があります。短くトリミングすることをおすすめします',
  },
  over1gb: {
    en: 'Large file — this may take a while (lower the resolution or trim to speed up)',
    ko: '큰 파일이라 시간이 오래 걸릴 수 있어요 (해상도를 낮추거나 구간을 자르면 빨라져요)',
    zh: '文件较大，可能需要较长时间（降低分辨率或剪辑可加快速度）',
    ja: '大きなファイルのため時間がかかる場合があります（解像度を下げるかトリミングすると速くなります）',
  },
  processing: { en: 'Processing… {pct}%', ko: '처리 중… {pct}%', zh: '处理中… {pct}%', ja: '処理中… {pct}%' },
  loadingEngine: {
    en: 'Loading the engine… (first time only)',
    ko: '엔진 불러오는 중… (처음 한 번만)',
    zh: '正在加载引擎…（仅首次）',
    ja: 'エンジンを読み込み中…（初回のみ）',
  },
  failed: {
    en: 'Something went wrong. Please try another file or a lower resolution.',
    ko: '처리에 실패했어요. 다른 파일이나 낮은 해상도로 다시 시도해 주세요.',
    zh: '处理失败。请换一个文件或降低分辨率后重试。',
    ja: '処理に失敗しました。別のファイルか低い解像度でもう一度お試しください。',
  },
  trimInvalid: {
    en: 'The end time must be after the start time.',
    ko: '끝 시간이 시작 시간보다 뒤여야 해요.',
    zh: '结束时间必须晚于开始时间。',
    ja: '終了時間は開始時間より後にしてください。',
  },
  trimRange: {
    en: 'Selected: {start} – {end} ({len}s)',
    ko: '선택 구간: {start} ~ {end} ({len}초)',
    zh: '已选片段：{start} – {end}（{len}秒）',
    ja: '選択範囲：{start} – {end}（{len}秒）',
  },

  // 압축
  targetInvalid: {
    en: 'Please enter a target size in MB.',
    ko: '목표 용량을 MB 단위로 입력해 주세요.',
    zh: '请输入以MB为单位的目标大小。',
    ja: '目標サイズをMB単位で入力してください。',
  },
  alreadySmall: {
    en: 'This file is already under {mb}MB. Lower the target to make it even smaller.',
    ko: '이미 {mb}MB보다 작은 파일이에요. 더 작게 하려면 목표 용량을 낮춰 주세요.',
    zh: '该文件已小于{mb}MB。如需更小，请降低目标大小。',
    ja: 'このファイルはすでに{mb}MB未満です。さらに小さくするには目標サイズを下げてください。',
  },
  compressing: { en: 'Compressing… {pct}%', ko: '압축 중… {pct}%', zh: '压缩中… {pct}%', ja: '圧縮中… {pct}%' },
  retrying: {
    en: 'Slightly over target, adjusting ({n}/3)… {pct}%',
    ko: '목표보다 조금 커서 다시 맞추는 중 ({n}/3)… {pct}%',
    zh: '略超目标大小，正在重新调整（{n}/3）… {pct}%',
    ja: '目標より少し大きいため再調整中（{n}/3）… {pct}%',
  },
  targetTooSmall: {
    en: 'This video is too long to fit in {mb}MB. Trim it or choose a larger target.',
    ko: '영상이 길어서 {mb}MB로는 너무 작아요. 구간을 자르거나 목표 용량을 늘려 주세요.',
    zh: '视频太长，无法压缩到{mb}MB。请剪辑视频或选择更大的目标。',
    ja: '動画が長すぎて{mb}MBには収まりません。トリミングするか目標サイズを大きくしてください。',
  },
  targetOk: {
    en: '✓ Under {mb}MB ({pct}% smaller)',
    ko: '✓ 목표 {mb}MB 이하로 맞췄어요 ({pct}% 감소)',
    zh: '✓ 已压缩到{mb}MB以内（减小{pct}%）',
    ja: '✓ {mb}MB以下に収まりました（{pct}%削減）',
  },
  targetMissed: {
    en: "Couldn't get it under {mb}MB. Try trimming or a lower resolution.",
    ko: '목표 {mb}MB에 맞추지 못했어요. 구간을 자르거나 해상도를 낮춰 다시 시도해 주세요.',
    zh: '未能压缩到{mb}MB以内。请尝试剪辑或降低分辨率。',
    ja: '{mb}MB以下にできませんでした。トリミングするか解像度を下げてお試しください。',
  },
  savedPct: { en: '{pct}% smaller!', ko: '{pct}% 줄었어요!', zh: '减小了{pct}%！', ja: '{pct}%小さくなりました！' },
  notSmaller: {
    en: 'This file is already well compressed. Try a lower resolution.',
    ko: '이미 잘 압축된 파일이라 더 줄지 않았어요. 해상도를 낮춰 보세요.',
    zh: '该文件已经压缩得很好，无法再减小。请尝试降低分辨率。',
    ja: 'すでに十分圧縮されたファイルのため、これ以上小さくなりませんでした。解像度を下げてみてください。',
  },

  // 쇼츠
  converting: { en: 'Converting… {pct}%', ko: '변환 중… {pct}%', zh: '转换中… {pct}%', ja: '変換中… {pct}%' },
  shortsDone: {
    en: '✓ {w}×{h} vertical video ready ({size})',
    ko: '✓ {w}×{h} 세로 영상 완성 ({size})',
    zh: '✓ {w}×{h} 竖屏视频已完成（{size}）',
    ja: '✓ {w}×{h}の縦型動画が完成しました（{size}）',
  },

  // GIF
  makingGif: { en: 'Making GIF… {pct}%', ko: 'GIF 만드는 중… {pct}%', zh: '正在制作GIF… {pct}%', ja: 'GIFを作成中… {pct}%' },
  gifDone: {
    en: '✓ GIF ready ({size}, {sec}s)',
    ko: '✓ GIF 완성 ({size}, {sec}초)',
    zh: '✓ GIF已完成（{size}，{sec}秒）',
    ja: '✓ GIFが完成しました（{size}、{sec}秒）',
  },

  // 썸네일
  unplayable: {
    en: "Your browser can't play this format, so thumbnails can't be extracted. Convert it to MP4 with the video compressor first.",
    ko: '이 형식은 브라우저에서 재생되지 않아 썸네일을 뽑을 수 없어요. 동영상 압축 메뉴에서 MP4로 바꾼 뒤 시도해 주세요.',
    zh: '浏览器无法播放此格式，无法提取封面。请先用视频压缩工具转换为MP4。',
    ja: 'この形式はブラウザで再生できないため、サムネイルを抽出できません。動画圧縮ツールでMP4に変換してからお試しください。',
  },
  autoFirst: { en: '✨ {n} smart picks', ko: '✨ 추천 썸네일 {n}장', zh: '✨ 智能推荐{n}张', ja: '✨ おすすめ{n}枚' },
  autoMore: { en: '🔄 {n} more picks', ko: '🔄 다른 추천 {n}장 더', zh: '🔄 再推荐{n}张', ja: '🔄 別のおすすめ{n}枚' },
  analyzing: {
    en: 'Analyzing frames… {pct}%',
    ko: '장면 분석 중… {pct}%',
    zh: '正在分析画面… {pct}%',
    ja: '場面を分析中… {pct}%',
  },
  makingImages: {
    en: 'Creating images… {i}/{n}',
    ko: '이미지 만드는 중… {i}/{n}',
    zh: '正在生成图片… {i}/{n}',
    ja: '画像を作成中… {i}/{n}',
  },
  noMoreScenes: {
    en: 'No more new good frames. Pause on the moment you want and use "Capture this frame".',
    ko: '더 이상 새로운 좋은 장면이 없어요. 원하는 장면에 멈추고 "이 장면 캡처"를 써 보세요.',
    zh: '没有更多新的好画面了。请在想要的画面暂停，然后使用“截取当前画面”。',
    ja: '新しい良い場面はもうありません。好きな場面で一時停止して「この場面をキャプチャ」を使ってください。',
  },
  groupTitle: {
    en: '✨ Smart picks — {n} sharp, good-looking frames',
    ko: '✨ 추천 장면 — 선명하고 보기 좋은 장면 {n}장',
    zh: '✨ 智能推荐 — {n}张清晰好看的画面',
    ja: '✨ おすすめ — 鮮明で見栄えの良い場面{n}枚',
  },
  groupTitleMore: {
    en: '✨ More picks — {n} sharp, good-looking frames',
    ko: '✨ 추천 장면 (추가) — 선명하고 보기 좋은 장면 {n}장',
    zh: '✨ 更多推荐 — {n}张清晰好看的画面',
    ja: '✨ 追加のおすすめ — 鮮明で見栄えの良い場面{n}枚',
  },
  groupFiltered: {
    en: ' (blurry or dark frames were skipped)',
    ko: ' (흐릿하거나 어두운 장면은 뺐어요)',
    zh: '（已跳过模糊或过暗的画面）',
    ja: '（ぼやけた場面や暗い場面は除外しました）',
  },
  manualCapture: { en: 'Manual', ko: '직접 캡처', zh: '手动截图', ja: '手動' },
  frameAlt: { en: 'Frame at {time}', ko: '{time} 장면', zh: '{time} 的画面', ja: '{time}の場面' },
  save: { en: 'Save', ko: '저장', zh: '保存', ja: '保存' },
};

/** 문구 가져오기. {이름} 부분은 vars 값으로 바뀝니다. */
export function t(key, vars = {}) {
  const s = dict[key]?.[lang] ?? dict[key]?.en ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? '').toString());
}

/* ---------- 언어 선택 기억 ----------
   사용자가 상단 언어 버튼을 누르면 기억해 두고, 다음 방문 때 그 언어 페이지로 자동 이동합니다.
   (검색엔진 로봇은 기억이 없으므로 항상 원래 페이지를 그대로 봅니다) */
const KEY = 'nuricut-lang';

export function initLanguage() {
  // 언어 드롭다운: 바깥을 누르거나 Esc를 누르면 닫힘
  const menu = document.querySelector('.lang-menu');
  if (menu) {
    document.addEventListener('click', (e) => {
      if (menu.open && !menu.contains(e.target)) menu.open = false;
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary')?.focus();
      }
    });
  }

  const links = document.querySelectorAll('.lang-switch a[data-lang]');
  links.forEach((a) =>
    a.addEventListener('click', () => {
      try {
        localStorage.setItem(KEY, a.dataset.lang);
      } catch {}
    })
  );
  let pref = null;
  try {
    pref = localStorage.getItem(KEY);
  } catch {}
  if (pref && pref !== lang) {
    const target = [...links].find((a) => a.dataset.lang === pref);
    if (target) location.replace(target.href);
  }
}

/* ---------- 후원 버튼 ----------
   하단과 결과 화면의 후원 버튼을 Ko-fi 페이지로 연결합니다.
   다른 주소로 바꾸려면 .env 파일에 VITE_SUPPORT_URL=새주소 를 넣으면 됩니다. */
const DEFAULT_SUPPORT_URL = 'https://ko-fi.com/nuricut';

export function initSupport() {
  const url = import.meta.env.VITE_SUPPORT_URL || DEFAULT_SUPPORT_URL;
  if (!url || !/^https:\/\//.test(url)) return;
  document.querySelectorAll('[data-support]').forEach((a) => {
    a.href = url;
    a.hidden = false;
  });
}
