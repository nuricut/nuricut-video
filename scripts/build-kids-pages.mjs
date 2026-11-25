// nuricut kids 페이지 생성기: node scripts/build-kids-pages.mjs
// 한국어(/ko/kids/)는 아래 T.ko, 영어·중국어·일본어(/kids/, /zh/kids/, /ja/kids/)는 kids-texts-intl.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KIDS_INTL } from './kids-texts-intl.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://nuricut.video';

/* ---------- 도구 아이콘 (--c = 지금 고른 색. 색을 고르면 그린 자국·쏟아지는 물감 색이 바뀜) ---------- */
export const KID_ICONS = {
  // 첫 화면 카드 그림
  artStop: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="31" cy="56" rx="21" ry="3.5" fill="#24203a" opacity=".1"/><path d="M19 19l3.5-6h13l3.5 6" fill="#ffd27a" stroke="#24203a" stroke-width="2.2" stroke-linejoin="round"/><rect x="7" y="19" width="48" height="33" rx="10" fill="#7cc8ff" stroke="#24203a" stroke-width="2.4"/><path d="M11 26c0-3 2-4.5 5-4.5h6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/><rect x="42" y="23" width="9" height="5.5" rx="2.2" fill="#fff" stroke="#24203a" stroke-width="1.8"/><circle cx="29" cy="36" r="12" fill="#fff" stroke="#24203a" stroke-width="2.4"/><circle cx="29" cy="36.5" r="7.6" fill="#3a3550"/><circle cx="26.2" cy="33.6" r="2.7" fill="#fff"/><circle cx="31.6" cy="39" r="1.2" fill="#fff"/><ellipse cx="13.5" cy="44" rx="3.2" ry="2.1" fill="#ff9ec7"/><ellipse cx="46.5" cy="44" rx="3.2" ry="2.1" fill="#ff9ec7"/><path d="M10 4.5l1.5 3.4 3.6.4-2.7 2.4.8 3.5-3.2-1.9-3.2 1.9.8-3.5-2.7-2.4 3.6-.4z" fill="#ffe14d" stroke="#24203a" stroke-width="1.3" stroke-linejoin="round"/><g transform="rotate(12 54 12)"><rect x="47" y="5" width="14" height="11" rx="2" fill="#ff8fbf" stroke="#24203a" stroke-width="1.6"/><rect x="50" y="8" width="8" height="5" rx="1" fill="#fff"/></g></svg>`,
  artPixel: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="30" cy="60" rx="21" ry="3" fill="#24203a" opacity=".1"/><rect x="16.4" y="14.4" width="9.2" height="9.2" fill="#24203a"/><rect x="22.4" y="14.4" width="9.2" height="9.2" fill="#24203a"/><rect x="28.4" y="14.4" width="9.2" height="9.2" fill="#24203a"/><rect x="34.4" y="14.4" width="9.2" height="9.2" fill="#24203a"/><rect x="10.4" y="20.4" width="9.2" height="9.2" fill="#24203a"/><rect x="16.4" y="20.4" width="9.2" height="9.2" fill="#24203a"/><rect x="22.4" y="20.4" width="9.2" height="9.2" fill="#24203a"/><rect x="28.4" y="20.4" width="9.2" height="9.2" fill="#24203a"/><rect x="34.4" y="20.4" width="9.2" height="9.2" fill="#24203a"/><rect x="40.4" y="20.4" width="9.2" height="9.2" fill="#24203a"/><rect x="4.4" y="26.4" width="9.2" height="9.2" fill="#24203a"/><rect x="10.4" y="26.4" width="9.2" height="9.2" fill="#24203a"/><rect x="16.4" y="26.4" width="9.2" height="9.2" fill="#24203a"/><rect x="22.4" y="26.4" width="9.2" height="9.2" fill="#24203a"/><rect x="28.4" y="26.4" width="9.2" height="9.2" fill="#24203a"/><rect x="34.4" y="26.4" width="9.2" height="9.2" fill="#24203a"/><rect x="40.4" y="26.4" width="9.2" height="9.2" fill="#24203a"/><rect x="46.4" y="26.4" width="9.2" height="9.2" fill="#24203a"/><rect x="4.4" y="32.4" width="9.2" height="9.2" fill="#24203a"/><rect x="10.4" y="32.4" width="9.2" height="9.2" fill="#24203a"/><rect x="16.4" y="32.4" width="9.2" height="9.2" fill="#24203a"/><rect x="22.4" y="32.4" width="9.2" height="9.2" fill="#24203a"/><rect x="28.4" y="32.4" width="9.2" height="9.2" fill="#24203a"/><rect x="34.4" y="32.4" width="9.2" height="9.2" fill="#24203a"/><rect x="40.4" y="32.4" width="9.2" height="9.2" fill="#24203a"/><rect x="46.4" y="32.4" width="9.2" height="9.2" fill="#24203a"/><rect x="4.4" y="38.4" width="9.2" height="9.2" fill="#24203a"/><rect x="10.4" y="38.4" width="9.2" height="9.2" fill="#24203a"/><rect x="16.4" y="38.4" width="9.2" height="9.2" fill="#24203a"/><rect x="22.4" y="38.4" width="9.2" height="9.2" fill="#24203a"/><rect x="28.4" y="38.4" width="9.2" height="9.2" fill="#24203a"/><rect x="34.4" y="38.4" width="9.2" height="9.2" fill="#24203a"/><rect x="40.4" y="38.4" width="9.2" height="9.2" fill="#24203a"/><rect x="46.4" y="38.4" width="9.2" height="9.2" fill="#24203a"/><rect x="4.4" y="44.4" width="9.2" height="9.2" fill="#24203a"/><rect x="10.4" y="44.4" width="9.2" height="9.2" fill="#24203a"/><rect x="16.4" y="44.4" width="9.2" height="9.2" fill="#24203a"/><rect x="22.4" y="44.4" width="9.2" height="9.2" fill="#24203a"/><rect x="28.4" y="44.4" width="9.2" height="9.2" fill="#24203a"/><rect x="34.4" y="44.4" width="9.2" height="9.2" fill="#24203a"/><rect x="40.4" y="44.4" width="9.2" height="9.2" fill="#24203a"/><rect x="46.4" y="44.4" width="9.2" height="9.2" fill="#24203a"/><rect x="4.4" y="50.4" width="9.2" height="9.2" fill="#24203a"/><rect x="10.4" y="50.4" width="9.2" height="9.2" fill="#24203a"/><rect x="22.4" y="50.4" width="9.2" height="9.2" fill="#24203a"/><rect x="28.4" y="50.4" width="9.2" height="9.2" fill="#24203a"/><rect x="40.4" y="50.4" width="9.2" height="9.2" fill="#24203a"/><rect x="46.4" y="50.4" width="9.2" height="9.2" fill="#24203a"/><rect x="18" y="16" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="24" y="16" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="30" y="16" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="36" y="16" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="12" y="22" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="18" y="22" width="6.4" height="6.4" fill="#b6f0d9"/><rect x="24" y="22" width="6.4" height="6.4" fill="#b6f0d9"/><rect x="30" y="22" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="36" y="22" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="42" y="22" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="6" y="28" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="12" y="28" width="6.4" height="6.4" fill="#b6f0d9"/><rect x="18" y="28" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="24" y="28" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="30" y="28" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="36" y="28" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="42" y="28" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="48" y="28" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="6" y="34" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="12" y="34" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="18" y="34" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="24" y="34" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="30" y="34" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="36" y="34" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="42" y="34" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="48" y="34" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="6" y="40" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="12" y="40" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="18" y="40" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="24" y="40" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="30" y="40" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="36" y="40" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="42" y="40" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="48" y="40" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="6" y="46" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="12" y="46" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="18" y="46" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="24" y="46" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="30" y="46" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="36" y="46" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="42" y="46" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="48" y="46" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="6" y="52" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="12" y="52" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="24" y="52" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="30" y="52" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="42" y="52" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="48" y="52" width="6.4" height="6.4" fill="#5fd4a8"/><rect x="18" y="34" width="6" height="6" fill="#24203a"/><rect x="36" y="34" width="6" height="6" fill="#24203a"/><rect x="19" y="35" width="2" height="2" fill="#fff"/><rect x="37" y="35" width="2" height="2" fill="#fff"/><rect x="12" y="40" width="6" height="6" fill="#ff9ec7"/><rect x="42" y="40" width="6" height="6" fill="#ff9ec7"/><rect x="25" y="42" width="10" height="2.4" fill="#24203a"/><rect x="44" y="6" width="6" height="6" fill="#ff8fbf" stroke="#24203a" stroke-width="1.4"/><rect x="53" y="13" width="5" height="5" fill="#ffe14d" stroke="#24203a" stroke-width="1.4"/><rect x="4" y="5" width="5" height="5" fill="#b99bff" stroke="#24203a" stroke-width="1.4"/><g transform="rotate(35 54 34)"><rect x="51" y="18" width="6" height="22" rx="2" fill="#ffd27a" stroke="#24203a" stroke-width="1.8"/><path d="M51 40h6l-1 6c-.4 2-3.6 2-4 0z" fill="#ff6fae" stroke="#24203a" stroke-width="1.8" stroke-linejoin="round"/><rect x="51" y="36" width="6" height="4" fill="#c9c4d4" stroke="#24203a" stroke-width="1.6"/></g></svg>`,
  artBattle: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="59" rx="25" ry="3" fill="#24203a" opacity=".1"/><g><clipPath id="kb-board"><rect x="8" y="8" width="48" height="28" rx="6"/></clipPath><g clip-path="url(#kb-board)"><rect x="8" y="8" width="8" height="7" fill="#ff8fbf"/><rect x="16" y="8" width="8" height="7" fill="#ffb3d6"/><rect x="24" y="8" width="8" height="7" fill="#ff8fbf"/><rect x="32" y="8" width="8" height="7" fill="#a8dcff"/><rect x="40" y="8" width="8" height="7" fill="#6cc4ff"/><rect x="48" y="8" width="8" height="7" fill="#a8dcff"/><rect x="8" y="15" width="8" height="7" fill="#ffb3d6"/><rect x="16" y="15" width="8" height="7" fill="#ff8fbf"/><rect x="24" y="15" width="8" height="7" fill="#ffb3d6"/><rect x="32" y="15" width="8" height="7" fill="#6cc4ff"/><rect x="40" y="15" width="8" height="7" fill="#a8dcff"/><rect x="48" y="15" width="8" height="7" fill="#6cc4ff"/><rect x="8" y="22" width="8" height="7" fill="#ff8fbf"/><rect x="16" y="22" width="8" height="7" fill="#ffb3d6"/><rect x="24" y="22" width="8" height="7" fill="#ff8fbf"/><rect x="32" y="22" width="8" height="7" fill="#a8dcff"/><rect x="40" y="22" width="8" height="7" fill="#6cc4ff"/><rect x="48" y="22" width="8" height="7" fill="#a8dcff"/><rect x="8" y="29" width="8" height="7" fill="#ffb3d6"/><rect x="16" y="29" width="8" height="7" fill="#ff8fbf"/><rect x="24" y="29" width="8" height="7" fill="#ffb3d6"/><rect x="32" y="29" width="8" height="7" fill="#6cc4ff"/><rect x="40" y="29" width="8" height="7" fill="#a8dcff"/><rect x="48" y="29" width="8" height="7" fill="#6cc4ff"/></g><rect x="8" y="8" width="48" height="28" rx="6" fill="none" stroke="#24203a" stroke-width="2.2"/></g><path d="M6 54c0-9 4.5-15 11-15s11 6 11 15c0 2-1.4 3-3 3h-16c-1.6 0-3-1-3-3z" fill="#ff8fbf" stroke="#24203a" stroke-width="2.2" stroke-linejoin="round"/><circle cx="15" cy="47" r="1.9" fill="#24203a"/><circle cx="23" cy="47" r="1.9" fill="#24203a"/><path d="M12 43.4l4 -1.2M26 42.2l-4 1.2" stroke="#24203a" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="10" cy="51" rx="2.2" ry="1.4" fill="#fff" opacity=".55"/><path d="M17 51.5q2 1.4 4 0" fill="none" stroke="#24203a" stroke-width="1.6" stroke-linecap="round"/><path d="M36 54c0-9 4.5-15 11-15s11 6 11 15c0 2-1.4 3-3 3h-16c-1.6 0-3-1-3-3z" fill="#6cc4ff" stroke="#24203a" stroke-width="2.2" stroke-linejoin="round"/><circle cx="41" cy="47" r="1.9" fill="#24203a"/><circle cx="49" cy="47" r="1.9" fill="#24203a"/><path d="M38 42.2l4 1.2M52 43.4l-4 -1.2" stroke="#24203a" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="40" cy="51" rx="2.2" ry="1.4" fill="#fff" opacity=".55"/><path d="M43 51.5q2 1.4 4 0" fill="none" stroke="#24203a" stroke-width="1.6" stroke-linecap="round"/><path d="M32 30l3.4 4.6 5.4-1.4-2.6 5 4.4 3.4-5.6 1 0 5.6-4.4-3.4-4.4 3.4 0-5.6-5.6-1 4.4-3.4-2.6-5 5.4 1.4z" fill="#ffe14d" stroke="#24203a" stroke-width="1.8" stroke-linejoin="round"/><text x="32" y="43.6" text-anchor="middle" font-family="system-ui, sans-serif" font-size="7.4" font-weight="900" fill="#24203a">VS</text></svg>`,
  pencil: `<svg viewBox="0 0 48 48" class="ki"><path d="M5 41c4-1 6-6 10-5s3 5 8 3 5-7 9-6" fill="none" stroke="var(--c)" stroke-width="3.2" stroke-linecap="round"/>
    <g transform="rotate(45 30 18)"><rect x="25" y="2" width="10" height="26" rx="2" fill="#ffd27a" stroke="#24203a" stroke-width="2"/><rect x="25" y="2" width="10" height="6" rx="2" fill="#ff9ed2" stroke="#24203a" stroke-width="2"/>
    <path d="M25 28l5 9 5-9z" fill="#f6dcc0" stroke="#24203a" stroke-width="2" stroke-linejoin="round"/><path d="M28.4 34.2L30 37l1.6-2.8z" fill="var(--c)"/></g></svg>`,
  fill: `<svg viewBox="0 0 48 48" class="ki"><ellipse cx="30" cy="42" rx="13" ry="3.6" fill="var(--c)"/>
    <path d="M32.5 22c2 5 3 9 1.6 14.5" fill="none" stroke="var(--c)" stroke-width="4.5" stroke-linecap="round"/>
    <g transform="rotate(-35 18 18)"><path d="M7 11h22l-3 21H10z" fill="#9ad7ff" stroke="#24203a" stroke-width="2.2" stroke-linejoin="round"/><ellipse cx="18" cy="11" rx="11" ry="3.4" fill="var(--c)" stroke="#24203a" stroke-width="2.2"/>
    <path d="M8 13c-4-6 0-11 10-11s14 5 10 11" fill="none" stroke="#24203a" stroke-width="2"/></g></svg>`,
  eraser: `<svg viewBox="0 0 48 48" class="ki"><g transform="rotate(-35 24 24)"><rect x="8" y="16" width="32" height="16" rx="4" fill="#ff9ed2" stroke="#24203a" stroke-width="2.2"/><rect x="8" y="16" width="12" height="16" rx="4" fill="#fff" stroke="#24203a" stroke-width="2.2"/></g>
    <path d="M10 43h28" stroke="#c9c1d6" stroke-width="2.4" stroke-dasharray="3 4" stroke-linecap="round"/></svg>`,
  mirror: `<svg viewBox="0 0 48 48" class="ki"><path d="M24 5v38" stroke="#24203a" stroke-width="2.2" stroke-dasharray="3 3"/><path d="M20 12a10 12 0 0 0 0 24z" fill="var(--c)" stroke="#24203a" stroke-width="2.2"/><path d="M28 12a10 12 0 0 1 0 24z" fill="#fff" stroke="#24203a" stroke-width="2.2" stroke-dasharray="3 2"/></svg>`,
  undo: `<svg viewBox="0 0 48 48" class="ki"><path d="M18 12L8 21l10 9" fill="none" stroke="#24203a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 21h18a11 11 0 0 1 0 22h-6" fill="none" stroke="#24203a" stroke-width="3" stroke-linecap="round"/></svg>`,
  redo: `<svg viewBox="0 0 48 48" class="ki"><path d="M30 12l10 9-10 9" fill="none" stroke="#24203a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M39 21H21a11 11 0 0 0 0 22h6" fill="none" stroke="#24203a" stroke-width="3" stroke-linecap="round"/></svg>`,
  // 만드는 법 4단계
  s1: `<svg viewBox="0 0 48 48"><rect x="4" y="14" width="22" height="18" rx="4" fill="#9ad7ff" stroke="#24203a" stroke-width="2"/><circle cx="15" cy="23" r="5" fill="#fff" stroke="#24203a" stroke-width="2"/><rect x="9" y="11" width="7" height="4" rx="1.5" fill="#24203a"/>
    <g transform="translate(22 18)"><rect width="22" height="22" rx="4" fill="#fff" stroke="#24203a" stroke-width="2"/><rect x="4" y="4" width="5" height="5" fill="#ff6fae"/><rect x="9" y="4" width="5" height="5" fill="#ffd27a"/><rect x="4" y="9" width="5" height="5" fill="#5fd4a8"/><rect x="9" y="9" width="5" height="5" fill="#ff6fae"/><rect x="14" y="9" width="4" height="5" fill="#b99bff"/><rect x="9" y="14" width="5" height="4" fill="#6cc4ff"/></g></svg>`,
  s2: `<svg viewBox="0 0 48 48"><rect x="5" y="8" width="30" height="34" rx="4" fill="#fff" stroke="#24203a" stroke-width="2"/><path d="M10 32c4-6 7-6 9-1s5 4 8-3" fill="none" stroke="#ff6fae" stroke-width="3" stroke-linecap="round"/><path d="M10 16h16M10 22h10" stroke="#e2d8e6" stroke-width="2.5" stroke-linecap="round"/>
    <g transform="rotate(40 36 22)"><rect x="32" y="6" width="8" height="22" rx="2" fill="#ffd27a" stroke="#24203a" stroke-width="2"/><path d="M32 28l4 7 4-7z" fill="#f6dcc0" stroke="#24203a" stroke-width="2" stroke-linejoin="round"/></g></svg>`,
  s3: `<svg viewBox="0 0 48 48"><rect x="4" y="9" width="40" height="30" rx="6" fill="#5fd4a8" stroke="#24203a" stroke-width="2"/><g fill="#fff">${[0,1,2,3,4].map(i=>`<rect x="${8+i*7.5}" y="12" width="4" height="3" rx="1"/><rect x="${8+i*7.5}" y="33" width="4" height="3" rx="1"/>`).join("")}</g><path d="M20 18v12l10-6z" fill="#fff" stroke="#24203a" stroke-width="2" stroke-linejoin="round"/></svg>`,
  s4: `<svg viewBox="0 0 48 48"><path d="M8 30v8a3 3 0 0 0 3 3h26a3 3 0 0 0 3-3v-8" fill="none" stroke="#24203a" stroke-width="2.6" stroke-linecap="round"/><path d="M24 6v22M15 19l9 9 9-9" fill="none" stroke="#ff6fae" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M38 6l1.4 3 3 1.4-3 1.4L38 15l-1.4-3.2-3-1.4 3-1.4z" fill="#ffd27a" stroke="#24203a" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
  trash: `<svg viewBox="0 0 48 48" class="ki"><path d="M10 14h28M19 14V9h10v5M13 14l2 27h18l2-27" fill="none" stroke="#24203a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 21v13M27 21v13" stroke="#ff6fae" stroke-width="2.6" stroke-linecap="round"/></svg>`,
};

/* ---------- 소제목 아이콘 ---------- */
export const HEAD_ICONS = {
  palette: `<svg viewBox="0 0 32 32"><path d="M16 4C9 4 4 9 4 15.5 4 22 9 27 14.6 27c1.9 0 2.5-1.3 1.9-2.7-.7-1.6.4-3.1 2.2-3.1h3.2c3.6 0 6.1-2.5 6.1-6C28 8.9 22.6 4 16 4z" fill="#ffe7bf" stroke="#24203a" stroke-width="1.8" stroke-linejoin="round"/><circle cx="10" cy="14" r="2.4" fill="#ff6fae"/><circle cx="14.5" cy="9" r="2.4" fill="#ffd23f"/><circle cx="20.5" cy="9.5" r="2.4" fill="#5fd4a8"/><circle cx="24" cy="15" r="2.4" fill="#6cc4ff"/><circle cx="11" cy="20.5" r="2.4" fill="#b99bff"/></svg>`,
  toolbox: `<svg viewBox="0 0 32 32"><path d="M12 10V7.5A1.5 1.5 0 0 1 13.5 6h5A1.5 1.5 0 0 1 20 7.5V10" fill="none" stroke="#24203a" stroke-width="2"/><rect x="4" y="10" width="24" height="16" rx="3.5" fill="#ff8fbf" stroke="#24203a" stroke-width="1.8"/><path d="M4 16h24" stroke="#24203a" stroke-width="1.8"/><rect x="13.5" y="14" width="5" height="4.5" rx="1.2" fill="#ffd27a" stroke="#24203a" stroke-width="1.6"/><circle cx="10" cy="21" r="1.2" fill="#24203a"/><circle cx="22" cy="21" r="1.2" fill="#24203a"/><path d="M14.5 22.3q1.5 1.3 3 0" fill="none" stroke="#24203a" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  film: `<svg viewBox="0 0 32 32"><rect x="3" y="7" width="26" height="18" rx="3" fill="#5fd4a8" stroke="#24203a" stroke-width="1.8"/><g fill="#fff"><rect x="4.5" y="8.6" width="2.5" height="1.8" rx=".6"/><rect x="4.5" y="21.6" width="2.5" height="1.8" rx=".6"/><rect x="9.5" y="8.6" width="2.5" height="1.8" rx=".6"/><rect x="9.5" y="21.6" width="2.5" height="1.8" rx=".6"/><rect x="14.5" y="8.6" width="2.5" height="1.8" rx=".6"/><rect x="14.5" y="21.6" width="2.5" height="1.8" rx=".6"/><rect x="19.5" y="8.6" width="2.5" height="1.8" rx=".6"/><rect x="19.5" y="21.6" width="2.5" height="1.8" rx=".6"/><rect x="24.5" y="8.6" width="2.5" height="1.8" rx=".6"/><rect x="24.5" y="21.6" width="2.5" height="1.8" rx=".6"/></g><rect x="6" y="12" width="9" height="8" rx="1.5" fill="#fff" stroke="#24203a" stroke-width="1.4"/><rect x="17" y="12" width="9" height="8" rx="1.5" fill="#fff" stroke="#24203a" stroke-width="1.4"/><circle cx="9.5" cy="16.5" r="2" fill="#ff6fae"/><circle cx="22.5" cy="15" r="2" fill="#ff6fae"/></svg>`,
  tv: `<svg viewBox="0 0 32 32"><path d="M11 4l5 5 5-5" fill="none" stroke="#24203a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="9" width="26" height="18" rx="4" fill="#9ad7ff" stroke="#24203a" stroke-width="1.8"/><rect x="6" y="12" width="20" height="12" rx="2.5" fill="#fff"/><path d="M14 15v6l5-3z" fill="#ff6fae" stroke="#24203a" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
  save: `<svg viewBox="0 0 32 32"><path d="M5 15h22v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z" fill="#ffd27a" stroke="#24203a" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 15l3-4h16l3 4z" fill="#ffe7bf" stroke="#24203a" stroke-width="1.8" stroke-linejoin="round"/><path d="M16 2.5v10M12 8.5l4 4 4-4" fill="none" stroke="#ff6fae" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 25s-3.6-2.1-3.6-4.3a1.8 1.8 0 0 1 3.6-.6 1.8 1.8 0 0 1 3.6.6c0 2.2-3.6 4.3-3.6 4.3z" fill="#ff6fae"/></svg>`,
  bunny: `<svg viewBox="0 0 32 32"><ellipse cx="11.5" cy="8" rx="3" ry="6.5" fill="#fff" stroke="#24203a" stroke-width="1.7"/><ellipse cx="20.5" cy="8" rx="3" ry="6.5" fill="#fff" stroke="#24203a" stroke-width="1.7"/><ellipse cx="11.5" cy="8.5" rx="1.3" ry="4" fill="#ffb3d1"/><ellipse cx="20.5" cy="8.5" rx="1.3" ry="4" fill="#ffb3d1"/><circle cx="16" cy="20" r="9" fill="#fff" stroke="#24203a" stroke-width="1.7" stroke-dasharray="3 2.2"/><circle cx="12.6" cy="19" r="1.3" fill="#24203a"/><circle cx="19.4" cy="19" r="1.3" fill="#24203a"/><path d="M14.5 22.4q1.5 1.2 3 0" fill="none" stroke="#24203a" stroke-width="1.4" stroke-linecap="round"/><circle cx="10.5" cy="22" r="1.4" fill="#ffb3d1"/><circle cx="21.5" cy="22" r="1.4" fill="#ffb3d1"/></svg>`,
  photos: `<svg viewBox="0 0 32 32"><g transform="rotate(-10 12 16)"><rect x="4" y="7" width="15" height="17" rx="2" fill="#fff" stroke="#24203a" stroke-width="1.6"/><rect x="6" y="9" width="11" height="9" fill="#ffd27a"/></g><g transform="rotate(8 20 16)"><rect x="12" y="8" width="16" height="18" rx="2" fill="#fff" stroke="#24203a" stroke-width="1.7"/><rect x="14" y="10" width="12" height="10" fill="#9ad7ff"/><circle cx="21.5" cy="13.5" r="2" fill="#ff6fae"/><path d="M14 20l4-4 3 2.5 5-3.5V20z" fill="#5fd4a8"/></g></svg>`,
  speed: `<svg viewBox="0 0 32 32"><path d="M2.5 13h5M1.5 18h6M3.5 23h4" stroke="#b99bff" stroke-width="2" stroke-linecap="round"/><rect x="16" y="2.5" width="6" height="3" rx="1" fill="#24203a"/><circle cx="19" cy="18" r="11" fill="#fff" stroke="#24203a" stroke-width="1.8"/><circle cx="19" cy="18" r="8" fill="#fff7d6"/><path d="M19 18v-6M19 18l4 3" stroke="#ff6fae" stroke-width="2.2" stroke-linecap="round"/><circle cx="19" cy="18" r="1.4" fill="#24203a"/></svg>`,
  wand: `<svg viewBox="0 0 32 32"><path d="M5 27L18.5 13.5" stroke="#24203a" stroke-width="4.4" stroke-linecap="round"/><path d="M5 27L18.5 13.5" stroke="#b99bff" stroke-width="2.2" stroke-linecap="round"/><path d="M21 3.5l1.6 3.6 3.9.4-2.9 2.6.8 3.9-3.4-2-3.4 2 .8-3.9-2.9-2.6 3.9-.4z" fill="#ffd23f" stroke="#24203a" stroke-width="1.5" stroke-linejoin="round"/><path d="M27 16l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7zM9 6l.6 1.4 1.4.6-1.4.6L9 10l-.6-1.4L7 8l1.4-.6z" fill="#ff6fae"/></svg>`,
};
const hd = (icon, text) => `<h3 class="k-h"><span class="kh">${HEAD_ICONS[icon]}</span><span>${text}</span></h3>`;

const T = {
  ko: {
    home: '/ko/kids/', main: '/ko/', grown: ['어른용 도구', '동영상 편집', 'PDF 변환'],
    grownTips: [['동영상 편집으로 넘어갈까요?', '압축 · 쇼츠 · GIF · 썸네일'], ['PDF 변환으로 넘어갈까요?', '합치기 · 나누기 · 변환']],
    legal: ['개인정보처리방침', '이용약관'],
    nav: ['홈', '스톱모션', '픽셀아트'],
    battle: {"label":"대전","soon":"출시 예정","title":"⚔️ 픽셀 땅따먹기 대전","rules":["두 팀이 같은 그림판을 동시에 칠해요","상대 팀 칸도 덧칠해서 빼앗을 수 있어요","60초가 끝났을 때 칸이 더 많은 팀이 이겨요!"],"note":"친구끼리 방 코드로만 함께해요 · 채팅 없음","teams":["분홍 팀","하늘 팀"],"win":"{t} 승리!"},
    safe: '🔒 사진·그림은 내 기기에만',
    footer: '🔒 nuricut kids는 가입·광고·채팅이 없고, 사진과 그림을 서버로 보내지 않아요.<br />모든 작업은 지금 쓰는 기기 안에서만 이루어져요.',
    hub: {
      title: '누리컷 키즈 nuricut kids - 스톱모션·픽셀아트 만들기 놀이터',
      desc: '누리컷 키즈는 초등·중학생을 위한 무료 만들기 놀이터예요. 사진을 이어 스톱모션 애니메이션을 만들고, 픽셀아트 캐릭터를 그려 움직이는 GIF로 저장해요. 가입·광고 없음.',
      h1: ['내가 만든 그림이', '움직이기 시작해요!'],
      sub: '찰칵찰칵 사진을 이어 붙이거나, 네모 칸을 칠해서 나만의 움직이는 작품을 만들어 보세요.',
      starts: [['stopmotion.html', '📸 스톱모션 만들기', 'sky'], ['pixel.html', '👾 픽셀아트 그리기', 'mint']],
      cards: [
        ['stopmotion.html', '📸', '스톱모션 애니메이션', '레고·클레이를 조금씩 움직이며 찍으면 영상이 돼요', ['카메라', 'GIF·영상 저장'], 'sky'],
        ['pixel.html', '👾', '픽셀아트 공방', '네모 칸을 칠해서 캐릭터를 그리고 움직여요', ['마우스·손가락', '움직이는 그림 저장'], 'mint'],
      ],
      go: '시작하기 →',
      battleCard: ["픽셀아트 대전","친구와 팀을 나눠 같은 그림판을 칠하고, 칸을 더 많이 차지한 팀이 이겨요",["친구와 함께","방 코드"]],
      trust: ['🙅 가입·로그인 없음', '🚫 광고 없음', '🔒 서버로 보내지 않아요', '🆓 무료'],
      how: '이렇게 만들어요',
      steps: [['1', '도구 고르기', '스톱모션이나 픽셀아트를 골라요'], ['2', '만들기', '사진을 찍거나 칸을 칠해요'], ['3', '움직여 보기', '재생 버튼으로 바로 확인해요'], ['4', '저장하기', 'GIF나 영상으로 저장해서 자랑해요']],
    },
    pixel: {
      title: '픽셀아트 공방 - 움직이는 도트 그림 만들기 | 누리컷 키즈',
      desc: '네모 칸을 칠해서 픽셀아트 캐릭터를 그리고, 여러 장을 이어 움직이는 GIF로 저장해요. 무료, 가입 없음.',
      h1: '👾 픽셀아트 공방', sub: '네모 칸을 칠해서 나만의 캐릭터를 그리고 움직여 보세요',
      colors: '색 고르기', myColor: '원하는 색 만들기', rainbow: '무지개 붓 (칠할 때마다 색이 바뀌어요)', rainbowShort: '무지개 (칠할 때마다 바뀌어요)',
      colorNames: ['분홍', '연분홍', '살구', '노랑', '연노랑', '민트', '초록', '하늘', '파랑', '연보라', '보라', '갈색', '베이지', '하양', '연회색', '회색', '진회색', '검정'], pngBg: ['투명 배경', '흰 배경'],
      tools: '도구',
      pencil: ['연필', '한 칸씩 칠해요'], eraser: ['지우개', '칸을 지워요'], fill: ['채우기', '같은 색 칸을 한 번에'],
      mirror: ['좌우 대칭', '반만 그려도 양쪽에'], undo: ['되돌리기', ''], redo: ['다시하기', ''], clear: ['모두 지우기', ''],
      size: '칸 크기', onion: '앞 그림 비쳐 보기',
      frames: '그림 칸 <small>여러 장을 이어서 움직여요</small>', addFrame: '＋ 새 칸', dupFrame: '⧉ 복사', delFrame: '✕ 빼기',
      preview: '움직이는 모습', speed: ['느리게', '보통', '빠르게'],
      save: '저장하기', saveGif: '움직이는 GIF', savePng: '지금 그림 (PNG)',
      starters: '따라 그리기', starterNames: ['토끼', '하트', '별'],
      confirmClear: '지금 그림 칸을 모두 지울까요?',
      saved: '저장했어요!',
      undone: '↩ 한 번 되돌렸어요', redone: '↪ 다시 했어요', cleared: '🧽 모두 지웠어요', nothing: '더 되돌릴 게 없어요',
    },
    stop: {
      title: '스톱모션 애니메이션 만들기 - 사진을 이어서 영상으로 | 누리컷 키즈',
      desc: '카메라로 사진을 한 장씩 찍어 스톱모션 애니메이션을 만들고 GIF·영상으로 저장해요. 사진은 서버로 가지 않아요. 무료, 가입 없음.',
      h1: '📸 스톱모션 애니메이션', sub: '물건을 조금씩 움직이며 찍으면, 사진들이 이어져 움직이는 영상이 돼요',
      camOn: '📷 카메라 켜기', camHint: '카메라를 켜도 사진은 이 기기에만 저장돼요.', camSwitch: '🔄 카메라 바꾸기',
      orPhotos: '카메라가 없나요?', photos: '🖼️ 사진 파일로 만들기',
      shoot: '찰칵! (사진 찍기)', shootHint: '스페이스바를 눌러도 찍혀요',
      onion: '👻 전 사진 겹쳐 보기',
      frames: '찍은 사진', delFrame: '선택한 사진 빼기',
      play: '▶ 재생', stop: '■ 멈춤', backToCam: '📷 다시 찍기',
      speed: '빠르기', speeds: ['느리게', '보통', '빠르게'],
      effect: '효과', effects: ['없음', '흑백', '옛날 영화'],
      save: '저장하기', saveGif: 'GIF로 저장', saveMp4: '영상(MP4)으로 저장',
      engine: '처음 한 번은 만드는 프로그램(약 10MB)을 받아요…', making: '만드는 중… {p}%',
      needFrames: '사진을 2장 이상 찍어 주세요.', camFail: '카메라를 켤 수 없어요. 카메라 사용을 허락했는지 확인하거나, 사진 파일로 만들어 보세요.',
      count: '사진 {n}장', saved: '저장했어요!',
    },
  },
};

Object.assign(T, KIDS_INTL);
const HTML_LANG = { en: 'en', ko: 'ko', zh: 'zh-Hans', ja: 'ja' };
const LANG_HOME = { en: '/kids/', ko: '/ko/kids/', zh: '/zh/kids/', ja: '/ja/kids/' };

// 대전(출시 예정): 메뉴 옆 표시 + 말풍선(게임 방법 + 움직이는 미리보기)
const battleTip = (b) => `<span class="k-btip" role="tooltip"><b>${b.title}</b><span class="kb-demo"><canvas width="160" height="160" data-teams='${JSON.stringify(b.teams)}' data-win="${b.win}"></canvas><span class="kb-bar"><i class="p"></i><i class="s"></i></span><span class="kb-score"><span class="p">${b.teams[0]} <span>0</span></span><span class="kb-time">60</span><span class="s"><span>0</span> ${b.teams[1]}</span></span></span><ol>${b.rules.map((r) => `<li>${r}</li>`).join('')}</ol><small>${b.note}</small></span>`;
const battle = (b) => `<span class="k-battle" tabindex="0" role="button" aria-expanded="false" aria-label="${b.label} (${b.soon})">${b.label}<em>${b.soon}</em>${battleTip(b)}</span>`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function build(lang) {
  const t = T[lang];
  const outDir = path.join(root, lang === 'en' ? 'kids' : `${lang}/kids`);
  fs.mkdirSync(outDir, { recursive: true });
  const pages = [['index.html', 0], ['stopmotion.html', 1], ['pixel.html', 2]];
  const header = (active) => `<header class="k-head">
      <div class="k-wrap k-head-in">
        <a class="k-logo" href="${t.home}"><img src="/logo.svg" alt="" width="34" height="34" /><span class="k-word">nuricut<span class="k-dot">.</span><span class="k-kids">kids</span></span></a>
        <nav class="k-nav">${pages.map(([f, i]) => `<a href="${t.home}${f === 'index.html' ? '' : f}"${i === active ? ' class="on" aria-current="page"' : ''}>${t.nav[i]}</a>`).join('')}${battle(t.battle)}</nav>
        <span class="k-safe">${t.safe}</span>
      </div>
    </header>`;
  const footer = `<footer class="k-foot"><div class="k-wrap"><p>${t.footer}</p><p class="k-grown">${t.grown[0]}: ${[[t.main, t.grown[1], t.grownTips[0]], [t.main + 'pdf/', t.grown[2], t.grownTips[1]]].map(([u, l, [a, b]]) => `<a class="k-x" href="${u}">${l}<span class="k-xtip" role="tooltip"><b>${a}</b><small>${b}</small></span></a>`).join(' · ')}</p><p><a href="${t.main}privacy.html">${t.legal[0]}</a> · <a href="${t.main}terms.html">${t.legal[1]}</a></p></div></footer>`;
  const page = (file, active, { title, desc }, body, script) => {
    fs.writeFileSync(path.join(outDir, file), `<!doctype html>
<html lang="${HTML_LANG[lang]}">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" sizes="48x48" />
    <link rel="icon" type="image/svg+xml" href="/logo.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="theme-color" content="#fff8f3" />
    <link rel="stylesheet" href="/src/kids.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" />
    <link rel="canonical" href="${SITE}${t.home}${file === 'index.html' ? '' : file}" />
${Object.keys(T).map((l) => `    <link rel="alternate" hreflang="${HTML_LANG[l]}" href="${SITE}${LANG_HOME[l]}${file === 'index.html' ? '' : file}" />`).join('\n')}
    <link rel="alternate" hreflang="x-default" href="${SITE}/kids/${file === 'index.html' ? '' : file}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(desc)}" />
  </head>
  <body data-kid="${file.replace('.html', '')}">
    ${header(active)}
    <main class="k-wrap">
${body}
    </main>
    ${footer}
    <script type="module" src="/src/pages/${script}"></script>
  </body>
</html>
`);
  };

  /* ----- 첫 화면 ----- */
  const h = t.hub;
  const I = KID_ICONS;
  page('index.html', 0, h, `      <section class="k-hero">
        <div>
          <h1>${h.h1[0]}<br /><span class="k-rainbow">${h.h1[1]}</span></h1>
          <p>${h.sub}</p>
          <div class="k-hero-btns">${h.starts.map(([f, l, c]) => `<a class="k-btn ${c}" href="${f}">${l}</a>`).join('')}</div>
        </div>
        <div class="k-mascot"><img src="/logo.svg" alt="" /><span style="left:16%;top:18%">✨</span><span style="right:14%;top:22%">🎨</span><span style="right:22%;bottom:14%">📸</span></div>
      </section>
      <section id="tools" class="k-tools">
        ${h.cards.map(([f, emo, name, d, tags, color]) => `<a class="k-card k-tool" href="${f}"><span class="k-art ${color}">${{ '📸': I.artStop, '👾': I.artPixel }[emo] || emo}</span><span class="k-txt"><b>${name}</b><span class="k-d">${d}</span></span><span class="k-tags">${tags.map((x) => `<i>${x}</i>`).join('')}</span><span class="k-btn sm ${color} k-go">${h.go}</span></a>`).join('\n        ')}
        <div class="k-card k-tool soon k-battle-card" tabindex="0" role="button" aria-expanded="false" aria-label="${h.battleCard[0]} (${t.battle.soon})"><span class="k-art lilac">${I.artBattle}</span><span class="k-txt"><b>${h.battleCard[0]} <em class="k-soon">${t.battle.soon}</em></b><span class="k-d">${h.battleCard[1]}</span></span><span class="k-tags">${h.battleCard[2].map((x) => `<i>${x}</i>`).join('')}</span><span class="k-btn sm soon-btn k-go">🔜 ${t.battle.soon}</span>${battleTip(t.battle)}</div>
      </section>
      <section class="k-how"><h2>${h.how}</h2><ol>${h.steps.map(([n, a, b]) => `<li><span class="ks">${I['s' + n]}</span><b><em>${n}</em>${a}</b><span>${b}</span></li>`).join('')}</ol></section>
      <div class="k-trust">${h.trust.map((x) => `<span>${x}</span>`).join('')}</div>`, 'kids-hub.js');

  /* ----- 픽셀아트 ----- */
  const p = t.pixel;
  const tool = (id, icon, [a, b], extra = '') => `<button id="${id}" class="k-tool-btn" type="button"${extra}>${I[icon]}<span class="kt-l"><b>${a}</b>${b ? `<small>${b}</small>` : ''}</span></button>`;
  page('pixel.html', 2, p, `      <section class="k-title"><h1>${p.h1}</h1><p>${p.sub}</p></section>
      <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="kid-rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4f8b"/><stop offset=".25" stop-color="#ffb02e"/><stop offset=".45" stop-color="#ffe14d"/><stop offset=".65" stop-color="#3fc794"/><stop offset=".82" stop-color="#4fb3f6"/><stop offset="1" stop-color="#7d4fd6"/></linearGradient></defs></svg>
      <section class="px-app">
        <div class="k-card px-left">
          ${hd('palette', p.colors)}
          <div id="palette" class="px-pal"></div>
          <label class="px-mycolor"><input id="my-color" type="color" value="#ff6fae" /><span>${p.myColor}</span></label>
          ${hd('toolbox', p.tools)}
          <div class="px-tools">
            ${tool('t-pencil', 'pencil', p.pencil, ' data-tool="pencil" aria-pressed="true"')}
            ${tool('t-fill', 'fill', p.fill, ' data-tool="fill"')}
            ${tool('t-eraser', 'eraser', p.eraser, ' data-tool="eraser"')}
            ${tool('t-mirror', 'mirror', p.mirror, ' aria-pressed="false"')}
          </div>
          <div class="px-mini-tools">${tool('t-undo', 'undo', p.undo)}${tool('t-redo', 'redo', p.redo)}${tool('t-clear', 'trash', p.clear)}</div>
        </div>
        <div class="k-card px-center">
          <div class="px-top"><label>${p.size} <select id="grid-size"><option value="16" selected>16 × 16</option><option value="24">24 × 24</option><option value="32">32 × 32</option></select></label>
            <label class="k-check"><input id="onion" type="checkbox" checked /> ${p.onion}</label></div>
          <div class="px-board"><canvas id="board" width="512" height="512"></canvas></div>
          ${hd('film', p.frames)}
          <div class="px-frames"><div id="frames" class="px-frame-list"></div>
            <div class="px-frame-btns"><button id="f-add" class="k-btn sm ghost" type="button">${p.addFrame}</button><button id="f-dup" class="k-btn sm ghost" type="button">${p.dupFrame}</button><button id="f-del" class="k-btn sm ghost" type="button">${p.delFrame}</button></div></div>
        </div>
        <div class="px-right">
          <div class="k-card">${hd('tv', p.preview)}<canvas id="preview" class="px-preview" width="256" height="256"></canvas>
            <div class="k-seg" id="speed">${p.speed.map((s, i) => `<button type="button" data-ms="${[320, 160, 80][i]}"${i === 1 ? ' class="on"' : ''}>${s}</button>`).join('')}</div></div>
          <div class="k-card">${hd('save', p.save)}<button id="save-gif" class="k-btn mint full" type="button">${p.saveGif}</button><button id="save-png" class="k-btn ghost full" type="button">${p.savePng}</button><div class="k-seg px-save-bg" id="png-bg"><button type="button" data-bg="clear" class="on">${p.pngBg[0]}</button><button type="button" data-bg="white">${p.pngBg[1]}</button></div></div>
          <div class="k-card">${hd('bunny', p.starters)}<div class="k-seg" id="starters">${p.starterNames.map((n, i) => `<button type="button" data-starter="${i}">${n}</button>`).join('')}</div></div>
        </div>
      </section>
      <script>window.KIDS_TXT = ${JSON.stringify({ confirmClear: p.confirmClear, saved: p.saved, rainbow: p.rainbow, rainbowShort: p.rainbowShort, colorNames: p.colorNames, undone: p.undone, redone: p.redone, cleared: p.cleared, nothing: p.nothing })};</script>`, 'kids-pixel.js');

  /* ----- 스톱모션 ----- */
  const s = t.stop;
  page('stopmotion.html', 1, s, `      <section class="k-title"><h1>${s.h1}</h1><p>${s.sub}</p></section>
      <section class="sm-app">
        <div class="sm-main">
          <div id="viewport" class="sm-view">
            <video id="cam" playsinline muted></video>
            <canvas id="onion-layer" class="sm-onion"></canvas>
            <canvas id="player" class="sm-player" hidden></canvas>
            <div id="start-box" class="sm-start">
              <button id="cam-on" class="k-btn" type="button">${s.camOn}</button>
              <p>${s.camHint}</p>
              <p class="sm-or">${s.orPhotos} <label class="k-btn sm ghost">${s.photos}<input id="photos" type="file" accept="image/*" multiple hidden /></label></p>
            </div>
            <span id="count" class="sm-count" hidden></span>
            <button id="cam-switch" class="sm-switch" type="button" hidden>${s.camSwitch}</button>
            <div id="flash" class="sm-flash"></div>
          </div>
          <div class="sm-shoot-row"><button id="shoot" class="sm-shutter" type="button" aria-label="${s.shoot}" disabled></button><span class="sm-shoot-txt"><b>${s.shoot}</b><small>${s.shootHint}</small></span>
            <label class="k-check"><input id="onion" type="checkbox" checked /> ${s.onion}</label></div>
          <div class="k-card sm-strip-box">${hd('photos', s.frames)}<div id="strip" class="sm-strip"></div><button id="del-frame" class="k-btn sm ghost" type="button" disabled>${s.delFrame}</button></div>
        </div>
        <div class="sm-side">
          <div class="k-card"><button id="play" class="k-btn full" type="button" disabled>${s.play}</button><button id="back-cam" class="k-btn ghost full" type="button" hidden>${s.backToCam}</button></div>
          <div class="k-card">${hd('speed', s.speed)}<div class="k-seg" id="speed">${s.speeds.map((x, i) => `<button type="button" data-fps="${[4, 8, 12][i]}"${i === 1 ? ' class="on"' : ''}>${x}</button>`).join('')}</div></div>
          <div class="k-card">${hd('wand', s.effect)}<div class="k-seg" id="effect">${s.effects.map((x, i) => `<button type="button" data-fx="${['none', 'gray', 'old'][i]}"${i === 0 ? ' class="on"' : ''}>${x}</button>`).join('')}</div></div>
          <div class="k-card">${hd('save', s.save)}<button id="save-gif" class="k-btn mint full" type="button" disabled>${s.saveGif}</button><button id="save-mp4" class="k-btn ghost full" type="button" disabled>${s.saveMp4}</button>
            <div id="progress" class="k-progress" hidden><div class="k-bar"><i id="bar"></i></div><span id="progress-txt"></span></div></div>
        </div>
      </section>
      <script>window.KIDS_TXT = ${JSON.stringify({ engine: s.engine, making: s.making, needFrames: s.needFrames, camFail: s.camFail, count: s.count, saved: s.saved, play: s.play, stop: s.stop })};</script>`, 'kids-stopmotion.js');

  console.log(lang, 'kids 페이지 3개 생성 →', path.relative(root, outDir));
}

for (const lang of Object.keys(T)) build(lang);
