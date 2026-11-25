// 문서 정보 지우기: 작성자·만든 프로그램·날짜·XMP 같은 숨은 정보 삭제 (쪽 내용은 그대로)
import { $, m, createPdfTool, openForEdit, getPdfLib, bytesOf, toBlob, baseName } from '../lib/pdf.js';

const FIELDS = [
  ['metaTitle', (d) => d.getTitle()],
  ['metaAuthor', (d) => d.getAuthor()],
  ['metaSubject', (d) => d.getSubject()],
  ['metaKeywords', (d) => d.getKeywords()],
  ['metaCreator', (d) => d.getCreator()],
  ['metaProducer', (d) => d.getProducer()],
  ['metaCreated', (d) => fmtDate(d.getCreationDate())],
  ['metaModified', (d) => fmtDate(d.getModificationDate())],
];
const fmtDate = (dt) => (dt instanceof Date && !isNaN(dt) ? dt.toLocaleString(document.documentElement.lang || undefined) : ''); // 페이지 언어로 날짜 표시
let found = 0;

const tool = createPdfTool({
  kind: 'pdf',
  multiple: false,
  onFiles: async ([file]) => {
    const { PDFName } = await getPdfLib();
    const doc = await openForEdit(await bytesOf(file), file.name);
    const rows = FIELDS.map(([k, get]) => { let v = ''; try { v = get(doc) || ''; } catch {} return [m(k), v]; });
    const xmp = !!doc.catalog.get(PDFName.of('Metadata'));
    rows.push([m('metaXmp'), xmp ? m('metaYes') : '']);
    found = rows.filter(([, v]) => v).length;
    $('meta').innerHTML = rows.map(([k, v]) => `<div class="mt-row${v ? ' has' : ''}"><span>${k}</span><b></b></div>`).join('');
    $('meta').querySelectorAll('b').forEach((el, i) => (el.textContent = rows[i][1] || m('metaNone')));
    $('work-title').textContent = m('fileTitle', { name: file.name, n: doc.getPageCount() });
    $('start').disabled = !found;
    if (!found) tool.showError(m('metaEmpty'));
  },
});

$('start').addEventListener('click', async () => {
  const file = tool.files[0];
  tool.begin(m('working'));
  try {
    const { PDFName } = await getPdfLib();
    const doc = await openForEdit(await bytesOf(file), file.name);
    // 문서 정보 사전(Info)의 항목을 모두 비우고, 숨은 XMP 정보도 삭제
    const info = doc.getInfoDict();
    for (const key of info.keys()) info.delete(key);
    doc.catalog.delete(PDFName.of('Metadata'));
    const blob = await toBlob(doc);
    tool.done({ blob, name: `${baseName(file.name)}${m('sfxClean')}.pdf`, info: m('cleanInfo', { n: found }), pdf: true });
  } catch (e) {
    tool.fail(e);
  }
});
