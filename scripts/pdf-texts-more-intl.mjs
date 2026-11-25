// PDF 추가 도구 7종 페이지 문구: 영어 / 중국어(간체) / 일본어. 구조는 pdf-texts-more.mjs 의 한국어(MORE.ko)와 같음.
export const MORE_INTL = {
  /* ───────────────────────── English ───────────────────────── */
  en: {
    page: {
      text: { title: 'Extract Text from PDF - save as TXT | nuricut.video', desc: 'Pull the text out of a PDF and save it as a TXT file or copy it right away. Pick only the pages you need. Free, no upload.', h1: 'Extract text', sub: 'Pull just the text out of a PDF, as TXT' },
      number: { title: 'Add Page Numbers to PDF - choose position & style | nuricut.video', desc: 'Number every page of a PDF automatically. Choose from 6 positions, styles like "1 / 10" and a starting number. Free, no upload.', h1: 'Page numbers', sub: 'Number every page automatically' },
      watermark: { title: 'Add a Watermark to PDF - text or logo | nuricut.video', desc: 'Stamp text like "CONFIDENTIAL" or a logo image onto your PDF as a watermark. Choose color, opacity and layout. Free, no upload.', h1: 'Watermark', sub: 'Add text or a logo, subtly' },
      sign: { title: 'Sign a PDF - draw a signature or add a stamp | nuricut.video', desc: 'Draw your signature or load a stamp image and place it anywhere on your PDF. White backgrounds are removed automatically. Free, no upload.', h1: 'Sign & stamp', sub: 'Draw or load it, then place it anywhere' },
      crop: { title: 'Crop PDF Margins - automatic or manual | nuricut.video', desc: 'Trim the extra margins from PDF pages, automatically to fit the content or by exact millimeters. Free, no upload.', h1: 'Crop margins', sub: 'Trim extra margins automatically or by hand' },
      compress: { title: 'Compress PDF - reduce file size for free | nuricut.video', desc: 'Shrink a PDF by recompressing the images inside it. Text stays sharp. Free, right in your browser, no upload.', h1: 'Compress PDF', sub: 'Lighter images, text untouched' },
      clean: { title: 'Remove PDF Metadata - delete author & software info | nuricut.video', desc: 'See the hidden author, software and date information inside a PDF and remove it in one click. Free, no upload.', h1: 'Remove metadata', sub: 'Delete hidden info like author and software' },
    },
    text: { sep: 'Add a divider between pages (--- Page 1 ---)', hint: 'Tap the pages to extract from. If none are selected, all pages are used.', start: 'Extract text', copy: 'Copy all', copied: '✓ Copied' },
    number: { pos: 'Position', tl: 'Top left', tc: 'Top center', tr: 'Top right', bl: 'Bottom left', bc: 'Bottom center', br: 'Bottom right', format: 'Style', start: 'Start at', size: 'Text size', s1: 'Small', s2: 'Medium', s3: 'Large', skip: "Don't number the first page (cover)", preview: 'Preview', go: 'Add page numbers' },
    watermark: { kind: 'Type', text: ['Text', 'CONFIDENTIAL, DRAFT…'], image: ['Image', 'Logo or stamp'], textLabel: 'Watermark text', textDefault: 'CONFIDENTIAL', imgLabel: 'Choose an image', color: 'Color', gray: 'Gray', red: 'Red', blue: 'Blue', opacity: 'Strength', o1: 'Light', o2: 'Medium', o3: 'Strong', layout: 'Layout', diag: ['Diagonal', 'Centered'], horiz: ['Horizontal', 'Centered'], tile: ['Tiled', 'Repeated'], size: 'Size', s1: 'Small', s2: 'Medium', s3: 'Large', preview: 'Preview (page 1)', go: 'Add watermark' },
    sign: { draw: ['Draw it', 'Mouse or finger'], upload: ['Load an image', 'Stamp or signature photo'], pen: 'Pen color', black: 'Black', blue: 'Blue', red: 'Red', clear: 'Clear', padHint: 'Draw your signature in the box above.', imgLabel: 'Choose an image', white: 'Remove white background', place: 'Where to place it', add: '＋ Add to this page', allPages: 'Same spot on every page', placeHint: 'Drag a signature to move it, and drag its bottom-right corner to resize.', prev: 'Previous page', next: 'Next page', go: 'Save PDF' },
    crop: { mode: 'How to crop', auto: ['Automatic', 'Fit the content'], manual: ['Manual', 'In millimeters'], top: 'Top', bottom: 'Bottom', left: 'Left', right: 'Right', pad: 'Space around content', preview: 'Preview (page 1) — the dark area is cut off', go: 'Crop margins' },
    compress: { level: 'Compression', l1: ['Light', 'Best quality'], l2: ['Medium', 'Recommended'], l3: ['Strong', 'Smallest file'], raster: "Maximum: turn every page into an image (text can't be selected or searched)", info: 'PDFs with lots of photos shrink the most. Text-heavy PDFs may only get a little smaller.', go: 'Compress PDF' },
    clean: { fields: 'Document info found in this PDF', go: 'Remove all document info', note: 'Page content stays the same — only the hidden info in the file is removed.' },
    guide: {
      text: { steps: ['Choose the PDF you want text from.', 'To extract only some pages, tap them to select. If none are selected, every page is used.', 'Press <b>Extract text</b> to see the result on screen. Use <b>Copy all</b> to paste it right away, or <b>Download</b> to get a TXT file.'], tip: "Scanned paper documents, where the text is part of an image, can't be extracted." },
      number: { steps: ['Choose the PDF to number.', 'Pick a position (6 spots), a style (1 / 1 / 10 / - 1 -), a starting number and a text size. The preview updates right away.', 'If the PDF has a cover, turn on <b>Don\'t number the first page</b>.', 'Press <b>Add page numbers</b> and download.'], tip: 'If the main text starts on page 3, change the starting number to match.' },
      watermark: { steps: ['Choose the PDF to watermark.', 'Pick <b>Text</b> (e.g. CONFIDENTIAL, DRAFT) or <b>Image</b> (a logo).', 'Choose the color, strength, layout (diagonal, horizontal, tiled) and size — the preview shows it right away.', 'Press <b>Add watermark</b> and download.'], tip: 'For documents you want to protect from copying or leaks, the tiled layout works best.' },
      sign: { steps: ['Choose the PDF to sign.', 'Use <b>Draw it</b> to draw a signature, or <b>Load an image</b> to pick a stamp or signature photo. White backgrounds are removed automatically.', 'Go to the page to sign, press <b>＋ Add to this page</b>, then drag to position it and drag the corner to resize.', 'Press <b>Save PDF</b> and download.'], tip: 'To put it in the same spot on several pages, press <b>Same spot on every page</b>.' },
      crop: { steps: ['Choose the PDF to crop.', '<b>Automatic</b> fits each page tightly to its content; <b>Manual</b> cuts the top, bottom, left and right by the millimeters you set.', 'In the preview, the dark area is the part that will be cut off.', 'Press <b>Crop margins</b> and download.'], tip: 'Great for reading scanned documents with wide borders on a phone.' },
      compress: { steps: ['Choose the PDF to compress.', 'Pick a compression level. <b>Medium</b> is recommended.', 'If you need it even smaller, turn on <b>Maximum</b>. Every page becomes an image, so text can no longer be selected.', 'Press <b>Compress PDF</b> to see the new size and download it.'], tip: 'If an email attachment is too large, try Medium first.' },
      clean: { steps: ['Choose the PDF to clean.', 'The author, software, dates and other info stored in the file are shown in a table.', 'Press <b>Remove all document info</b> and download.'], tip: 'Use it so your work computer name or author name isn\'t left in documents you send out.' },
    },
  },

  /* ───────────────────────── 中文(简体) ───────────────────────── */
  zh: {
    page: {
      text: { title: 'PDF 提取文字 - 保存为 TXT | nuricut.video', desc: '提取 PDF 中的文字，保存为 TXT 文件或直接复制。可以只选需要的页面。免费，无需上传。', h1: '提取文字', sub: '只把 PDF 里的文字提取为 TXT' },
      number: { title: 'PDF 添加页码 - 选择位置和样式 | nuricut.video', desc: '为 PDF 自动添加页码。可选择 6 个位置、"1 / 10" 等样式和起始页码。免费，无需上传。', h1: '添加页码', sub: '为每一页自动编号' },
      watermark: { title: 'PDF 添加水印 - 文字或标志 | nuricut.video', desc: '在 PDF 上添加"机密"等文字或标志图片作为水印。可选择颜色、透明度和排列方式。免费，无需上传。', h1: '水印', sub: '淡淡地加上文字或标志' },
      sign: { title: 'PDF 签名・盖章 - 手写或使用图片 | nuricut.video', desc: '直接手写签名或导入印章图片，放到 PDF 的任意位置。自动去除白色背景。免费，无需上传。', h1: '签名・盖章', sub: '手写或导入后放到任意位置' },
      crop: { title: 'PDF 裁剪页边距 - 自动或手动 | nuricut.video', desc: '裁掉 PDF 页面多余的边距，可按内容自动裁剪，也可按毫米手动设置。免费，无需上传。', h1: '裁剪页边距', sub: '自动或手动裁掉多余的边距' },
      compress: { title: 'PDF 压缩 - 免费减小文件大小 | nuricut.video', desc: '重新压缩 PDF 中的图片来减小文件大小，文字保持清晰。免费，在浏览器中完成，无需上传。', h1: 'PDF 压缩', sub: '图片变轻，文字不变' },
      clean: { title: '删除 PDF 文档信息 - 清除作者和软件信息 | nuricut.video', desc: '查看 PDF 中隐藏的作者、制作软件、日期等文档信息，并一键删除。免费，无需上传。', h1: '删除文档信息', sub: '删除作者、软件等隐藏信息' },
    },
    text: { sep: '在每页之间加分隔线（--- 第 1 页 ---）', hint: '点击选择要提取文字的页面。不选则提取全部页面。', start: '提取文字', copy: '全部复制', copied: '✓ 已复制' },
    number: { pos: '位置', tl: '左上', tc: '上方居中', tr: '右上', bl: '左下', bc: '下方居中', br: '右下', format: '样式', start: '起始页码', size: '字号', s1: '小', s2: '中', s3: '大', skip: '第一页（封面）不加页码', preview: '预览', go: '添加页码' },
    watermark: { kind: '类型', text: ['文字', '机密、DRAFT 等'], image: ['图片', '标志或印章'], textLabel: '水印文字', textDefault: '机密', imgLabel: '选择图片', color: '颜色', gray: '灰色', red: '红色', blue: '蓝色', opacity: '浓度', o1: '淡', o2: '中', o3: '浓', layout: '排列', diag: ['斜向', '居中'], horiz: ['横向', '居中'], tile: ['平铺', '重复'], size: '大小', s1: '小', s2: '中', s3: '大', preview: '预览（第 1 页）', go: '添加水印' },
    sign: { draw: ['手写', '鼠标或手指'], upload: ['导入图片', '印章或签名照片'], pen: '笔的颜色', black: '黑色', blue: '蓝色', red: '红色', clear: '清除', padHint: '请在上方框内写下签名。', imgLabel: '选择图片', white: '去除白色背景', place: '放置位置', add: '＋ 放到这一页', allPages: '所有页同一位置', placeHint: '拖动签名可以移动，拖动右下角可以调整大小。', prev: '上一页', next: '下一页', go: '保存 PDF' },
    crop: { mode: '裁剪方式', auto: ['自动', '按内容裁剪'], manual: ['手动', '以毫米为单位'], top: '上', bottom: '下', left: '左', right: '右', pad: '内容周围留白', preview: '预览（第 1 页）— 暗色部分会被裁掉', go: '裁剪页边距' },
    compress: { level: '压缩强度', l1: ['弱', '画质优先'], l2: ['中', '推荐'], l3: ['强', '体积优先'], raster: '最大压缩：把每页都转成图片（文字将无法选择和搜索）', info: '图片越多的 PDF 压缩效果越明显。以文字为主的 PDF 可能只会小一点。', go: '压缩 PDF' },
    clean: { fields: '这个 PDF 中的文档信息', go: '删除全部文档信息', note: '页面内容保持不变，只删除文件中隐藏的信息。' },
    guide: {
      text: { steps: ['选择要提取文字的 PDF。', '只想提取部分页面时，点击选择页面。不选则提取全部。', '点击<b>提取文字</b>，结果会显示在屏幕上。用<b>全部复制</b>直接粘贴，或用<b>下载</b>保存为 TXT 文件。'], tip: '扫描的纸质文档等文字是图片的 PDF 无法提取文字。' },
      number: { steps: ['选择要添加页码的 PDF。', '选择位置（6 处）、样式（1 / 1 / 10 / - 1 -）、起始页码和字号，预览会立即更新。', '有封面时，请打开<b>第一页不加页码</b>。', '点击<b>添加页码</b>并下载。'], tip: '正文从第 3 页开始时，可以修改起始页码来对应。' },
      watermark: { steps: ['选择要加水印的 PDF。', '选择<b>文字</b>（如：机密、DRAFT）或<b>图片</b>（标志）。', '选择颜色、浓度、排列（斜向・横向・平铺）和大小，预览会立即显示。', '点击<b>添加水印</b>并下载。'], tip: '想防止复制或外泄的文档，使用平铺排列效果最好。' },
      sign: { steps: ['选择要签名的 PDF。', '用<b>手写</b>写下签名，或用<b>导入图片</b>选择印章・签名照片。白色背景会自动去除。', '翻到要签名的页面，点击<b>＋ 放到这一页</b>，拖动调整位置，拖动角落调整大小。', '点击<b>保存 PDF</b>并下载。'], tip: '想在多页的同一位置放置时，请点击<b>所有页同一位置</b>。' },
      crop: { steps: ['选择要裁剪边距的 PDF。', '<b>自动</b>按每页内容紧密裁剪，<b>手动</b>按设定的毫米数裁掉上下左右。', '预览中暗色的部分就是会被裁掉的部分。', '点击<b>裁剪页边距</b>并下载。'], tip: '用手机查看边框很宽的扫描文档时特别好用。' },
      compress: { steps: ['选择要压缩的 PDF。', '选择压缩强度，推荐使用<b>中</b>。', '需要更小时请打开<b>最大压缩</b>。每页都会变成图片，文字将无法选择。', '点击<b>压缩 PDF</b>，会显示压缩后的大小，然后即可下载。'], tip: '邮件附件超过大小限制时，先试试"中"。' },
      clean: { steps: ['选择要删除信息的 PDF。', '文件中保存的作者、制作软件、日期等信息会以表格显示。', '点击<b>删除全部文档信息</b>并下载。'], tip: '用于避免对外发送的文档中留下公司电脑名或作者名。' },
    },
  },

  /* ───────────────────────── 日本語 ───────────────────────── */
  ja: {
    page: {
      text: { title: 'PDFテキスト抽出 - 文字だけをTXTで保存 | nuricut.video', desc: 'PDFの中の文字を抜き出してTXTファイルで保存、またはすぐにコピーできます。必要なページだけ選べます。アップロード不要、無料。', h1: 'テキスト抽出', sub: 'PDFの文字だけをTXTで' },
      number: { title: 'PDFにページ番号を追加 - 位置・形式を選択 | nuricut.video', desc: 'PDFにページ番号を自動で入れます。6か所の位置、「1 / 10」などの形式、開始番号を選べます。アップロード不要、無料。', h1: 'ページ番号', sub: 'すべてのページに番号を自動で' },
      watermark: { title: 'PDFに透かしを追加 - 文字・ロゴ | nuricut.video', desc: 'PDFに「社外秘」などの文字やロゴ画像を透かしとして入れます。色・透明度・配置を選べます。アップロード不要、無料。', h1: '透かし', sub: '文字やロゴをさりげなく入れる' },
      sign: { title: 'PDFに署名・印鑑 - 手書きまたは画像で | nuricut.video', desc: 'PDFに署名を手書きするか、印鑑画像を読み込んで好きな位置に入れます。白い背景は自動で消えます。アップロード不要、無料。', h1: '署名・印鑑', sub: '描くか読み込んで、好きな位置に' },
      crop: { title: 'PDFの余白カット - 自動・手動 | nuricut.video', desc: 'PDFページの余分な余白をカットします。内容に合わせて自動で、またはmm単位で手動で。アップロード不要、無料。', h1: '余白カット', sub: '余分な余白を自動または手動でカット' },
      compress: { title: 'PDF圧縮 - 無料でファイルサイズを小さく | nuricut.video', desc: 'PDF内の写真を再圧縮してファイルサイズを小さくします。文字はそのまま。ブラウザで無料、アップロード不要。', h1: 'PDF圧縮', sub: '写真は軽く、文字はそのまま' },
      clean: { title: 'PDFの文書情報を削除 - 作成者・ソフト名を消す | nuricut.video', desc: 'PDFに隠れている作成者、作成ソフト、日付などの文書情報を確認して一度に削除します。アップロード不要、無料。', h1: '文書情報の削除', sub: '作成者・ソフト名などの隠れた情報を削除' },
    },
    text: { sep: 'ページごとに区切り線を入れる（--- 1ページ ---）', hint: '文字を抜き出すページをタップして選んでください。選ばなければ全ページから抜き出します。', start: 'テキストを抽出', copy: 'すべてコピー', copied: '✓ コピーしました' },
    number: { pos: '位置', tl: '左上', tc: '中央上', tr: '右上', bl: '左下', bc: '中央下', br: '右下', format: '形式', start: '開始番号', size: '文字サイズ', s1: '小', s2: '中', s3: '大', skip: '1ページ目（表紙）には番号を入れない', preview: 'プレビュー', go: 'ページ番号を入れる' },
    watermark: { kind: '種類', text: ['文字', '社外秘・DRAFTなど'], image: ['画像', 'ロゴ・印鑑'], textLabel: '透かしの文字', textDefault: '社外秘', imgLabel: '画像を選ぶ', color: '色', gray: 'グレー', red: '赤', blue: '青', opacity: '濃さ', o1: '薄く', o2: '普通', o3: '濃く', layout: '配置', diag: ['斜め', '中央'], horiz: ['横', '中央'], tile: ['タイル', '繰り返し'], size: 'サイズ', s1: '小', s2: '中', s3: '大', preview: 'プレビュー（1ページ目）', go: '透かしを入れる' },
    sign: { draw: ['手書き', 'マウス・指'], upload: ['画像を読み込む', '印鑑・署名の写真'], pen: 'ペンの色', black: '黒', blue: '青', red: '赤', clear: '消す', padHint: '上の枠に署名を書いてください。', imgLabel: '画像を選ぶ', white: '白い背景を消す', place: '入れる位置', add: '＋ このページに入れる', allPages: '全ページの同じ位置に', placeHint: '署名をドラッグして移動し、右下の角をドラッグしてサイズを変えます。', prev: '前のページ', next: '次のページ', go: 'PDFを保存' },
    crop: { mode: 'カット方法', auto: ['自動', '内容に合わせる'], manual: ['手動', 'mm単位'], top: '上', bottom: '下', left: '左', right: '右', pad: '内容まわりの余裕', preview: 'プレビュー（1ページ目）— 暗い部分がカットされます', go: '余白をカット' },
    compress: { level: '圧縮の強さ', l1: ['弱く', '画質優先'], l2: ['普通', 'おすすめ'], l3: ['強く', 'サイズ優先'], raster: '最大圧縮：すべてのページを画像にする（文字の選択・検索ができなくなります）', info: '写真が多いPDFほど小さくなります。文字中心のPDFは少ししか小さくならない場合があります。', go: 'PDFを圧縮' },
    clean: { fields: 'このPDFに含まれる文書情報', go: '文書情報をすべて削除', note: 'ページの内容はそのままで、ファイル内の隠れた情報だけを削除します。' },
    guide: {
      text: { steps: ['文字を抜き出すPDFを選びます。', '一部のページだけ抜き出すときは、ページをタップして選びます。選ばなければ全ページから抜き出します。', '<b>テキストを抽出</b>を押すと画面に結果が出ます。<b>すべてコピー</b>ですぐ貼り付けるか、<b>ダウンロード</b>でTXTファイルを保存します。'], tip: 'スキャンした紙の文書など、文字が画像になっているPDFからは抜き出せません。' },
      number: { steps: ['ページ番号を入れるPDFを選びます。', '位置（6か所）、形式（1 / 1 / 10 / - 1 -）、開始番号、文字サイズを選びます。プレビューにすぐ反映されます。', '表紙がある場合は<b>1ページ目には番号を入れない</b>をオンにします。', '<b>ページ番号を入れる</b>を押してダウンロードします。'], tip: '本文が3ページ目から始まる場合は、開始番号を変えて合わせられます。' },
      watermark: { steps: ['透かしを入れるPDFを選びます。', '<b>文字</b>（例：社外秘、DRAFT）または<b>画像</b>（ロゴ）を選びます。', '色、濃さ、配置（斜め・横・タイル）、サイズを選ぶと、プレビューにすぐ表示されます。', '<b>透かしを入れる</b>を押してダウンロードします。'], tip: 'コピーや流出を防ぎたい文書には、タイル配置が効果的です。' },
      sign: { steps: ['署名するPDFを選びます。', '<b>手書き</b>で署名を書くか、<b>画像を読み込む</b>で印鑑・署名の写真を選びます。白い背景は自動で消えます。', '署名するページに移動して<b>＋ このページに入れる</b>を押し、ドラッグで位置を、角のドラッグでサイズを合わせます。', '<b>PDFを保存</b>を押してダウンロードします。'], tip: '複数のページの同じ位置に入れるには<b>全ページの同じ位置に</b>を押します。' },
      crop: { steps: ['余白をカットするPDFを選びます。', '<b>自動</b>はページごとに内容ぴったりに、<b>手動</b>は上・下・左・右をmmで決めてカットします。', 'プレビューで暗い部分がカットされる部分です。', '<b>余白をカット</b>を押してダウンロードします。'], tip: 'スキャンして枠が広く残った文書をスマホで見るときに特に便利です。' },
      compress: { steps: ['圧縮するPDFを選びます。', '圧縮の強さを選びます。<b>普通</b>がおすすめです。', 'さらに小さくしたいときは<b>最大圧縮</b>をオンにします。すべてのページが画像になり、文字は選択できなくなります。', '<b>PDFを圧縮</b>を押すと小さくなったサイズが表示され、ダウンロードできます。'], tip: 'メール添付のサイズ制限に引っかかるときは、まず「普通」で試してください。' },
      clean: { steps: ['情報を削除するPDFを選びます。', 'ファイルに入っている作成者、作成ソフト、日付などが表で表示されます。', '<b>文書情報をすべて削除</b>を押してダウンロードします。'], tip: '社外に送る文書に会社PCの名前や作成者が残らないようにするときに使います。' },
    },
  },
};
