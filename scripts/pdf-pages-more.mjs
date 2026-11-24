// PDF 추가 도구 7종의 작업 화면 HTML. build-pdf-pages.mjs에서 불러 씀.
export function buildMore({ more: x, toolPage, head, radio }) {
  const btn = (id, label) => `<button id="${id}" class="btn-primary" type="button">${label}</button>`;
  const seg = (name, items, cols) => `<div class="seg"${cols ? ` style="grid-template-columns:repeat(${cols},1fr)"` : ''} role="radiogroup">${items.map(([v, l, on]) => radio(name, v, Array.isArray(l) ? l : [l], on)).join('')}</div>`;

  // 텍스트 추출
  toolPage('text', { kind: 'pdf', many: false, work: `${head(false)}
          <div class="options" style="margin-top:0">
            <label class="check"><input id="sep" type="checkbox" checked /> ${x.text.sep}</label>
            <p class="hint">${x.text.hint}</p>
            <div id="pages" class="pages"></div>
            ${btn('start', x.text.start)}
          </div>` });

  // 쪽 번호
  const n = x.number;
  toolPage('number', { kind: 'pdf', many: false, work: `${head(false)}
          <div class="options two-col" style="margin-top:0">
            <div class="opt-col">
              <div class="field"><span class="label">${n.pos}</span>
                <div class="posgrid" role="radiogroup">${[['tl', n.tl], ['tc', n.tc], ['tr', n.tr], ['bl', n.bl], ['bc', n.bc, true], ['br', n.br]].map(([v, l, on]) => `<label title="${l}"><input type="radio" name="pos" value="${v}"${on ? ' checked' : ''} /><span>${l}</span></label>`).join('')}</div>
              </div>
              <div class="field"><span class="label">${n.format}</span>${seg('fmt', [['n', '1', true], ['nt', '1 / 10'], ['dash', '- 1 -']])}</div>
              <div class="row2">
                <div class="field"><label class="label" for="start-no">${n.start}</label><input id="start-no" class="text-input" type="number" min="0" value="1" /></div>
                <div class="field"><span class="label">${n.size}</span>${seg('size', [['9', n.s1], ['11', n.s2, true], ['14', n.s3]])}</div>
              </div>
              <label class="check"><input id="skip-first" type="checkbox" /> ${n.skip}</label>
            </div>
            <div class="opt-col"><span class="label">${n.preview}</span><div id="preview" class="pv"></div></div>
          </div>
          <div class="options">${btn('start', n.go)}</div>` });

  // 워터마크
  const w = x.watermark;
  toolPage('watermark', { kind: 'pdf', many: false, work: `${head(false)}
          <div class="options two-col" style="margin-top:0">
            <div class="opt-col">
              <div class="field"><span class="label">${w.kind}</span>${seg('kind', [['text', w.text, true], ['image', w.image]], 2)}</div>
              <div id="text-field" class="field"><label class="label" for="wm-text">${w.textLabel}</label><input id="wm-text" class="text-input" type="text" value="${w.textDefault}" maxlength="40" /></div>
              <div id="img-field" class="field" hidden><label class="label" for="wm-img">${w.imgLabel}</label><input id="wm-img" class="text-input" type="file" accept="image/*" /></div>
              <div class="row2">
                <div id="color-field" class="field"><span class="label">${w.color}</span>${seg('color', [['gray', w.gray, true], ['red', w.red], ['blue', w.blue]])}</div>
                <div class="field"><span class="label">${w.opacity}</span>${seg('opacity', [['0.12', w.o1], ['0.22', w.o2, true], ['0.4', w.o3]])}</div>
              </div>
              <div class="field"><span class="label">${w.layout}</span>${seg('layout', [['diag', w.diag, true], ['horiz', w.horiz], ['tile', w.tile]])}</div>
              <div class="field"><span class="label">${w.size}</span>${seg('scale', [['0.35', w.s1], ['0.55', w.s2, true], ['0.8', w.s3]])}</div>
            </div>
            <div class="opt-col"><span class="label">${w.preview}</span><div id="preview" class="pv"></div></div>
          </div>
          <div class="options">${btn('start', w.go)}</div>` });

  // 서명·도장
  const s = x.sign;
  toolPage('sign', { kind: 'pdf', many: false, work: `${head(false)}
          <div class="options" style="margin-top:0">
            ${seg('src', [['draw', s.draw, true], ['upload', s.upload]], 2)}
            <div id="draw-box" class="field">
              <canvas id="pad" class="sign-pad" width="1200" height="400"></canvas>
              <div class="pad-tools"><span class="label">${s.pen}</span>${seg('pen', [['#111111', s.black, true], ['#1d4ed8', s.blue], ['#c81e1e', s.red]], 3)}<button id="pad-clear" class="btn-small" type="button">${s.clear}</button></div>
              <p class="hint">${s.padHint}</p>
            </div>
            <div id="upload-box" class="field" hidden>
              <label class="label" for="sign-img">${s.imgLabel}</label><input id="sign-img" class="text-input" type="file" accept="image/*" />
              <label class="check"><input id="rm-white" type="checkbox" checked /> ${s.white}</label>
              <div id="img-preview" class="sign-img-pv"></div>
            </div>
            <div class="field">
              <span class="label">${s.place}</span>
              <div class="place-bar"><button id="prev" class="btn-small" type="button" aria-label="${s.prev}">◀</button><span id="page-no"></span><button id="next" class="btn-small" type="button" aria-label="${s.next}">▶</button>
                <button id="add" class="btn-small" type="button">${s.add}</button><button id="all" class="btn-small" type="button">${s.allPages}</button></div>
              <div id="stage" class="stage"></div>
              <p class="hint">${s.placeHint}</p>
            </div>
            ${btn('start', s.go)}
          </div>` });

  // 여백 자르기
  const c = x.crop;
  toolPage('crop', { kind: 'pdf', many: false, work: `${head(false)}
          <div class="options two-col" style="margin-top:0">
            <div class="opt-col">
              <div class="field"><span class="label">${c.mode}</span>${seg('mode', [['auto', c.auto, true], ['manual', c.manual]], 2)}</div>
              <div id="auto-field" class="field"><label class="label" for="pad-mm">${c.pad} (mm)</label><input id="pad-mm" class="text-input" type="number" min="0" max="50" value="5" /></div>
              <div id="manual-field" class="mm-grid" hidden>
                ${[['top', c.top], ['bottom', c.bottom], ['left', c.left], ['right', c.right]].map(([k, l]) => `<label class="field"><span class="label">${l} (mm)</span><input id="mm-${k}" class="text-input" type="number" min="0" max="200" value="15" /></label>`).join('')}
              </div>
            </div>
            <div class="opt-col"><span class="label">${c.preview}</span><div id="preview" class="pv"></div></div>
          </div>
          <div class="options">${btn('start', c.go)}</div>` });

  // 용량 줄이기
  const z = x.compress;
  toolPage('compress', { kind: 'pdf', many: false, work: `${head(false)}
          <div class="options" style="margin-top:0">
            <div class="field"><span class="label">${z.level}</span>${seg('level', [['1', z.l1], ['2', z.l2, true], ['3', z.l3]])}</div>
            <label class="check"><input id="raster" type="checkbox" /> ${z.raster}</label>
            <p class="notice">${z.info}</p>
            ${btn('start', z.go)}
          </div>` });

  // 문서 정보 지우기
  const k = x.clean;
  toolPage('clean', { kind: 'pdf', many: false, work: `${head(false)}
          <div class="options" style="margin-top:0">
            <div class="field"><span class="label">${k.fields}</span><div id="meta" class="meta-table"></div></div>
            <p class="hint">${k.note}</p>
            ${btn('start', k.go)}
          </div>` });
}
