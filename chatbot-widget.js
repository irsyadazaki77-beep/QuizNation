(() => {
	if (window.__quizNationChatbotInitialized) return;
	window.__quizNationChatbotInitialized = true;

	const STORAGE_KEY = 'qn_chatbot_history_v1';
	const PREFS_KEY = 'qn_chatbot_prefs_v1';
	const MAX_HISTORY = 30;
	const BOT_NAME = 'QuizNation Care';
	const SESSION_START = Date.now();
	const BASE_QUICK_ACTIONS = [
		{ label: 'Cara login', prompt: 'Bagaimana cara login?' },
		{ label: 'Cari materi', prompt: 'Carikan materi tentang grammar dasar' },
		{ label: 'Progress saya', prompt: 'Bagaimana cara melihat progres saya?' },
		{ label: 'Mulai belajar', prompt: 'Saya baru mulai belajar, sebaiknya dari mana?' },
		{ label: 'Rencana 7 hari', prompt: 'Buatkan rencana belajar 7 hari untuk saya' },
		{ label: 'Naikkan skor', prompt: 'Bagaimana cara menaikkan skor saya?' },
		{ label: 'Mode fokus', prompt: 'Bagaimana cara memakai mode fokus dan pomodoro?' },
		{ label: 'Data hilang', prompt: 'Bagaimana jika progres atau data saya hilang?' },
		{ label: 'FAQ cepat', prompt: 'FAQ lengkap' },
		{ label: 'Hubungi admin', prompt: 'Bagaimana cara menghubungi customer service?' }
	];

	const PAGE_TIPS = {
		'index.html': 'Di beranda ini, Anda bisa mulai dari level Bahasa Inggris, Smart Tools, dan kartu SNBT.',
		'evaluasi.html': 'Di halaman evaluasi, Anda bisa memilih soal dan memantau progres pengerjaan.',
		'materi.html': 'Di halaman materi, Anda bisa membuka topik belajar dan membaca panduan tiap subbab.',
		'library.html': 'Di halaman library, Anda bisa menelusuri kumpulan referensi dan materi tambahan.',
		'statistik.html': 'Di halaman statistik, Anda bisa melihat skor, progres, dan performa belajar Anda.',
		'pengaturan.html': 'Di halaman pengaturan, Anda bisa menyesuaikan preferensi akun dan tampilan aplikasi.',
		'feedback.html': 'Di halaman feedback, Anda bisa mengirim kritik, saran, atau kendala langsung ke admin.',
		'pencapaian.html': 'Di halaman pencapaian, Anda bisa melihat badge, progres, dan target belajar yang sudah dibuka.',
		'login.html': 'Di halaman login, Anda bisa masuk, daftar, atau melanjutkan penggunaan akun.',
		'snbt.html': 'Di halaman SNBT, Anda bisa fokus ke strategi, latihan, dan informasi kampus atau passing grade.'
	};

	const PAGE_ACTIONS = {
		'index.html': [
			{ label: 'Cek fitur', prompt: 'Fitur utama QuizNation apa saja?' },
			{ label: 'Tips belajar', prompt: 'Ada tips agar saya lebih konsisten belajar?' },
			{ label: 'Cari materi', prompt: 'Carikan materi tentang grammar dasar' }
		],
		'evaluasi.html': [
			{ label: 'Tips evaluasi', prompt: 'Ada tips agar lebih siap mengerjakan evaluasi SNBT?' },
			{ label: 'Strategi SNBT', prompt: 'Strategi cepat mengerjakan soal SNBT bagaimana?' }
		],
		'statistik.html': [
			{ label: 'Arti statistik', prompt: 'Bagaimana cara membaca statistik saya?' },
			{ label: 'Cek skor', prompt: 'Skor dan bintang saya sekarang berapa?' },
			{ label: 'Naikkan skor', prompt: 'Bagaimana cara menaikkan skor saya?' }
		],
		'pencapaian.html': [
			{ label: 'Tambah bintang', prompt: 'Bagaimana cara menambah bintang dan streak?' },
			{ label: 'Belajar hari ini', prompt: 'Hari ini enaknya saya belajar apa dulu?' }
		],
		'login.html': [
			{ label: 'Bantuan login', prompt: 'Bagaimana cara login atau reset akses?' },
			{ label: 'Mode tamu', prompt: 'Apa bedanya mode tamu dan akun login?' }
		],
		'snbt.html': [
			{ label: 'Rencana SNBT', prompt: 'Buatkan rencana belajar SNBT 7 hari untuk saya' },
			{ label: 'Naikkan akurasi', prompt: 'Bagaimana cara meningkatkan akurasi mengerjakan soal?' }
		],
		'pengaturan.html': [
			{ label: 'Atur akun', prompt: 'Bagaimana cara mengatur akun dan preferensi saya?' },
			{ label: 'Ubah tema', prompt: 'Bagaimana cara mengganti tema dan musik?' }
		],
		'materi.html': [
			{ label: 'Pilih materi', prompt: 'Materi mana yang sebaiknya saya pelajari dulu?' },
			{ label: 'Cari topik', prompt: 'Carikan materi tentang tenses' }
		],
		'library.html': [
			{ label: 'Gunakan library', prompt: 'Bagaimana cara memakai library dengan efektif?' },
			{ label: 'Cari referensi', prompt: 'Carikan materi tentang penalaran logis' }
		],
		'feedback.html': [
			{ label: 'Kirim kendala', prompt: 'Kalau ada bug, info apa saja yang harus saya kirim ke admin?' }
		]
	};

	const FAQ_GROUPS = {
		akun: [
			'cara login atau daftar akun',
			'mode tamu vs akun login',
			'kendala lupa password / reset akses'
		],
		belajar: [
			'mulai belajar dari mana',
			'pilih materi atau level yang cocok',
			'tips belajar efektif dan konsisten'
		],
		evaluasi: [
			'cara mulai evaluasi SNBT',
			'strategi mengerjakan soal',
			'cara membaca hasil evaluasi'
		],
		progres: [
			'cek skor, bintang, streak, dan statistik',
			'arti progress dan pencapaian',
			'cara backup / restore data'
		],
		teknis: [
			'sidebar, tampilan mobile, atau bug loading',
			'pengaturan tema, musik, dan focus mode',
			'cara menghubungi admin lewat feedback'
		]
	};

	const PAGE_FAQ_FALLBACKS = {
		'index.html': {
			title: 'Bantuan cepat beranda',
			items: [
				'mulai dari level yang sesuai lalu cek Smart Tools',
				'gunakan saya untuk cari materi atau strategi SNBT',
				'pantau progres lewat Statistik dan Pencapaian'
			],
			prompts: ['mulai belajar dari mana', 'carikan materi grammar dasar', 'cara cek passing grade']
		},
		'evaluasi.html': {
			title: 'Bantuan cepat evaluasi',
			items: [
				'pilih kategori soal yang paling ingin dikuasai',
				'minta strategi manajemen waktu atau tips evaluasi',
				'cek hasil Anda lagi di Statistik setelah selesai'
			],
			prompts: ['tips evaluasi', 'strategi SNBT', 'cara membaca hasil evaluasi']
		},
		'materi.html': {
			title: 'Bantuan cepat materi',
			items: [
				'minta saya carikan topik grammar, reading, atau numerik',
				'pilih materi dari dasar dulu lalu lanjut latihan',
				'gabungkan materi dengan evaluasi agar hasilnya lebih stabil'
			],
			prompts: ['carikan materi tentang tenses', 'materi untuk pemula', 'topik grammar apa yang cocok']
		},
		'library.html': {
			title: 'Bantuan cepat library',
			items: [
				'cari referensi sesuai topik yang ingin dipelajari',
				'gunakan kata kunci seperti geometri, vocab, atau penalaran',
				'buka halaman yang paling relevan dari hasil pencarian'
			],
			prompts: ['carikan materi penalaran logis', 'referensi vocabulary context', 'materi geometri']
		},
		'statistik.html': {
			title: 'Bantuan cepat statistik',
			items: [
				'cek skor total, bintang, dan streak belajar Anda',
				'minta bantuan membaca arti statistik dan progres',
				'gunakan hasil statistik untuk menentukan materi berikutnya'
			],
			prompts: ['arti statistik saya', 'skor saya sekarang', 'cara naikkan progres']
		},
		'pengaturan.html': {
			title: 'Bantuan cepat pengaturan',
			items: [
				'atur tema, musik, dan preferensi tampilan',
				'backup data sebelum reset atau pindah perangkat',
				'cek login akun bila progres terasa tidak sinkron'
			],
			prompts: ['cara ganti tema', 'backup data progres', 'pengaturan akun saya']
		},
		'feedback.html': {
			title: 'Bantuan cepat feedback',
			items: [
				'kirim nama halaman, perangkat, dan langkah sebelum bug muncul',
				'jelaskan kendala secara singkat agar admin cepat paham',
				'sertakan screenshot jika diperlukan'
			],
			prompts: ['cara lapor bug', 'info yang perlu dikirim ke admin', 'customer service']
		},
		default: {
			title: 'Bantuan cepat untuk halaman ini',
			items: [
				'tanya saya tentang login, progres, evaluasi, atau materi',
				'minta saya carikan halaman belajar yang relevan',
				'laporkan bug atau kendala lewat Feedback bila perlu'
			],
			prompts: ['cara login', 'carikan materi yang relevan', 'progress saya']
		}
	};

	const SEARCHABLE_PAGE_PATHS = [
		'materi.html',
		'library.html',
		'evaluasi.html',
		'snbt.html',
		'tenses.html',
		'materi-adjectives-adverbs.html',
		'materi-advanceread.html',
		'materi-berbicara.html',
		'materi-direct-indirect-speech.html',
		'materi-email-formal.html',
		'materi-essay-artikel.html',
		'materi-kosakata.html',
		'materi-listening-mendengarkan.html',
		'materi-membacateks.html',
		'materi-menulis-kalimat.html',
		'materi-modal-verbs.html',
		'materi-nouns-pronouns.html',
		'materi-passive-voice.html',
		'materi-pengenalan-kalimat.html',
		'materi-prepositions-conjunctions.html',
		'materi-readcom.html',
		'materi-temakhusus.html',
		'materi-vocab-bisnis.html',
		'lib-aljabar.html',
		'lib-analisis-argumen.html',
		'lib-aritmatika.html',
		'lib-asumsi-evaluasi-argumen.html',
		'lib-ejaan-tanda-baca.html',
		'lib-fungsi-kuadrat-optimasi.html',
		'lib-geometri.html',
		'lib-grammar-structure.html',
		'lib-inference-main-idea.html',
		'lib-kalimat-efektif.html',
		'lib-memahami-teks.html',
		'lib-penalaran-analitis.html',
		'lib-penalaran-induktif.html',
		'lib-penalaran-kausal.html',
		'lib-penalaran-keruangan.html',
		'lib-penalaran-logis.html',
		'lib-pk-kombinatorika-peluang.html',
		'lib-pk-logika-kuantitatif.html',
		'lib-pk-numerik.html',
		'lib-pk-persen-bunga.html',
		'lib-pk-rasio-proporsi.html',
		'lib-pk-tabel-grafik.html',
		'lib-pu-strategi-logika.html',
		'lib-reading-comprehension.html',
		'lib-ringkasan-parafrase.html',
		'lib-statistika.html',
		'lib-text-structure-reference.html',
		'lib-vocabulary-context.html'
	];

	const SEARCH_STOP_WORDS = new Set([
		'yang', 'dan', 'atau', 'untuk', 'dengan', 'tentang', 'materi', 'halaman', 'tolong',
		'dong', 'saya', 'aku', 'ingin', 'mau', 'cari', 'carikan', 'search', 'apa', 'ada',
		'bisa', 'lebih', 'lagi', 'nih', 'ya'
	]);

	const searchCache = new Map();
	let voiceAvailable = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
	let speechSynth = window.speechSynthesis || null;

	const els = {};
	const state = {
		typingTimer: null,
		sidebarRefreshQueued: false,
		unreadCount: 0,
		minimized: false,
		soundEnabled: false,
		sessionSeconds: 0,
		sessionTimer: null
	};

	// Load saved preferences
	function loadPrefs() {
		try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); } catch { return {}; }
	}
	function savePrefs(data) {
		try { localStorage.setItem(PREFS_KEY, JSON.stringify({ ...loadPrefs(), ...data })); } catch { }
	}

	function escapeHtml(value) {
		return String(value || '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function getCurrentPage() {
		const path = (window.location.pathname || '').split('/').pop();
		return path || 'index.html';
	}

	function makeLink(href, label) {
		return `<a class="qn-chatbot-link" href="${href}">${label}</a>`;
	}

	function getTimeGreeting() {
		const hour = new Date().getHours();
		if (hour < 11) return 'Selamat pagi';
		if (hour < 15) return 'Selamat siang';
		if (hour < 18) return 'Selamat sore';
		return 'Selamat malam';
	}

	function matchesAny(text, patterns) {
		return (patterns || []).some((pattern) => pattern.test(text));
	}

	function normalizeText(value) {
		return String(value || '')
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9\s-]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function stripHtmlTags(value) {
		return String(value || '')
			.replace(/<[^>]*>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function prettifyPageName(path) {
		return String(path || '')
			.replace(/\.html$/i, '')
			.replace(/^(materi-|lib-)/i, '')
			.split('-')
			.filter(Boolean)
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}

	function humanizeReply(content, options = {}) {
		const page = options.page || getCurrentPage();
		const tone = options.tone || 'info';
		const fallback = PAGE_FAQ_FALLBACKS[page] || PAGE_FAQ_FALLBACKS.default || { prompts: [] };
		const prompts = Array.isArray(fallback.prompts) ? fallback.prompts.slice(0, 3) : [];

		const intros = {
			info: 'Tentu, saya bantu ya.',
			warm: 'Siap, saya bantu dengan santai ya.',
			issue: 'Tenang, kita cek pelan-pelan bareng.',
			search: 'Saya coba carikan yang paling relevan untuk Anda.',
			page: 'Saya sesuaikan jawabannya dengan halaman yang sedang Anda buka.'
		};

		const closers = {
			info: 'Kalau mau, Anda bisa lanjut tanya tanpa formal-formal juga 😊',
			warm: 'Kalau masih ada yang ingin ditanyakan, lanjutkan saja ya.',
			issue: 'Kalau masih belum beres, sebutkan nama halaman dan kendalanya ya.',
			search: prompts.length
				? `Kalau belum pas, coba kata kunci seperti <em>${prompts.map((item) => escapeHtml(item)).join('</em>, <em>')}</em>.`
				: 'Kalau belum pas, coba pakai kata kunci yang lebih spesifik ya.',
			page: prompts.length
				? `Coba juga pertanyaan cepat seperti <em>${prompts.map((item) => escapeHtml(item)).join('</em>, <em>')}</em>.`
				: 'Kalau mau, saya bisa bantu arahkan langkah berikutnya juga.'
		};

		const intro = intros[tone] || intros.info;
		const closer = closers[tone] || closers.info;

		return `${intro ? `<div style="margin-bottom:8px;">${intro}</div>` : ''}${content}${closer ? `<div style="margin-top:8px;">${closer}</div>` : ''}`;
	}

	function createPageFallback(page) {
		const fallback = PAGE_FAQ_FALLBACKS[page] || PAGE_FAQ_FALLBACKS.default;
		const prompts = (fallback.prompts || []).map((item) => `<em>${escapeHtml(item)}</em>`).join(', ');
		return createInfoList(fallback.title, fallback.items, prompts ? `Coba juga: ${prompts}.` : '');
	}

	function buildSearchPreview(text, tokens) {
		const sourceText = String(text || '').replace(/\s+/g, ' ').trim();
		if (!sourceText) return 'Ringkasan materi tersedia pada halaman ini.';

		const lowered = sourceText.toLowerCase();
		let firstIndex = -1;

		(tokens || []).forEach((token) => {
			const index = lowered.indexOf(String(token || '').toLowerCase());
			if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
				firstIndex = index;
			}
		});

		if (firstIndex === -1) {
			return `${sourceText.slice(0, 160)}${sourceText.length > 160 ? '…' : ''}`;
		}

		const start = Math.max(0, firstIndex - 70);
		const end = Math.min(sourceText.length, firstIndex + 150);
		return `${start > 0 ? '…' : ''}${sourceText.slice(start, end).trim()}${end < sourceText.length ? '…' : ''}`;
	}

	function scoreSearchEntry(tokens, entry) {
		const titleText = normalizeText(entry && entry.title);
		const keywordText = normalizeText((entry && entry.keywords || []).join(' '));
		const bodyText = normalizeText(entry && entry.text);
		let score = 0;

		(tokens || []).forEach((token) => {
			if (!token) return;
			if (titleText.includes(token)) score += 6;
			if (keywordText.includes(token)) score += 4;
			if (bodyText.includes(token)) score += 2;
		});

		if ((tokens || []).length && (tokens || []).every((token) => titleText.includes(token) || keywordText.includes(token) || bodyText.includes(token))) {
			score += 6;
		}

		if (entry && entry.href === getCurrentPage()) {
			score += 1;
		}

		return score;
	}

	function getCurrentDocumentSearchEntry() {
		const page = getCurrentPage();
		const title = stripHtmlTags(document.title) || prettifyPageName(page) || 'Halaman saat ini';
		const headings = Array.from(document.querySelectorAll('h1, h2, h3, .card-title, .lesson-title, .section-title'))
			.map((node) => stripHtmlTags(node.textContent))
			.filter(Boolean)
			.slice(0, 24);
		const bodyText = stripHtmlTags(document.body ? (document.body.innerText || document.body.textContent || '') : '');

		return {
			href: page,
			title,
			keywords: headings,
			text: `${title} ${headings.join(' ')} ${bodyText}`,
			previewText: bodyText,
			source: 'current'
		};
	}

	async function fetchSearchEntry(path) {
		if (!path) return null;
		if (searchCache.has(path)) {
			return searchCache.get(path);
		}

		const entryPromise = (async () => {
			if (path === getCurrentPage()) {
				return getCurrentDocumentSearchEntry();
			}

			const fallbackTitle = prettifyPageName(path) || path;
			const fallbackEntry = {
				href: path,
				title: fallbackTitle,
				keywords: fallbackTitle.split(' '),
				text: `${fallbackTitle} ${path.replace(/[-_.]/g, ' ')}`,
				previewText: `Materi atau referensi terkait ${fallbackTitle}.`,
				source: 'catalog'
			};

			if (typeof fetch !== 'function' || typeof DOMParser === 'undefined') {
				return fallbackEntry;
			}

			try {
				const response = await fetch(path);
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}

				const html = await response.text();
				const doc = new DOMParser().parseFromString(html, 'text/html');
				const title = stripHtmlTags(
					(doc.querySelector('title') && doc.querySelector('title').textContent)
					|| (doc.querySelector('h1, h2') && doc.querySelector('h1, h2').textContent)
					|| fallbackTitle
				) || fallbackTitle;
				const headings = Array.from(doc.querySelectorAll('h1, h2, h3, .card-title, .lesson-title, .section-title'))
					.map((node) => stripHtmlTags(node.textContent))
					.filter(Boolean)
					.slice(0, 24);
				const bodyText = stripHtmlTags(doc.body ? (doc.body.textContent || '') : '');

				return {
					href: path,
					title,
					keywords: headings,
					text: `${title} ${headings.join(' ')} ${bodyText}`,
					previewText: bodyText,
					source: 'live'
				};
			} catch (error) {
				return fallbackEntry;
			}
		})();

		searchCache.set(path, entryPromise);
		return entryPromise;
	}

	async function searchMaterialContent(userMessage) {
		const normalizedQuery = normalizeText(userMessage)
			.replace(/\b(tolong|dong|please|saya|aku|ingin|mau|cari|carikan|search|temukan|materi|topik|halaman|jelaskan|tentang|mengenai|belajar)\b/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();

		const tokens = normalizedQuery
			.split(' ')
			.filter((token) => token.length > 2 && !SEARCH_STOP_WORDS.has(token));

		if (!tokens.length) {
			return '';
		}

		const prioritizedPaths = SEARCHABLE_PAGE_PATHS.filter((path) => {
			const slugText = normalizeText(path.replace(/\.html$/i, '').replace(/[-_]/g, ' '));
			return tokens.some((token) => slugText.includes(token));
		});

		const candidatePaths = Array.from(new Set([
			getCurrentPage(),
			'materi.html',
			'library.html',
			...prioritizedPaths.slice(0, 12),
			...SEARCHABLE_PAGE_PATHS.slice(0, 10)
		]));

		const entries = (await Promise.all(candidatePaths.map((path) => fetchSearchEntry(path)))).filter(Boolean);
		const results = entries
			.map((entry) => ({ entry, score: scoreSearchEntry(tokens, entry) }))
			.filter((item) => item.score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, 4);

		if (!results.length) {
			return '';
		}

		const listMarkup = results.map(({ entry }) => {
			const preview = buildSearchPreview(entry.previewText || entry.text, tokens);
			return `
				<li style="margin-bottom:10px;">
					<strong>${escapeHtml(entry.title || prettifyPageName(entry.href))}</strong><br>
					<span>${escapeHtml(preview)}</span>
					<div style="margin-top:4px;">${makeLink(entry.href, 'Buka materi ini')}</div>
				</li>
			`;
		}).join('');

		const hasLiveResult = results.some(({ entry }) => entry.source === 'live' || entry.source === 'current');
		const footer = hasLiveResult
			? 'Saya tampilkan yang paling dekat dengan kata kunci Anda. Kalau mau, sebutkan topik yang lebih spesifik lagi.'
			: 'Hasil diambil dari halaman aktif dan katalog materi. Jika situs dijalankan lewat browser/server lokal, pencarian isi halaman akan jadi lebih lengkap.';

		return `
			<strong>Hasil pencarian materi</strong>
			<div style="margin-top:6px;">Saya menemukan beberapa halaman yang kemungkinan paling relevan untuk <em>${escapeHtml(stripHtmlTags(userMessage))}</em>:</div>
			<ul style="margin:10px 0 0; padding-left:18px;">${listMarkup}</ul>
			<div style="margin-top:8px;">${footer}</div>
		`;
	}

	function getLearningSnapshot() {
		const lessonScore = parseInt(localStorage.getItem('totalScore') || '0', 10);
		const snbtScore = parseInt(localStorage.getItem('snbt_totalScore') || '0', 10);
		const bonusScore = parseInt(localStorage.getItem('qn_bonus_score') || '0', 10);
		const stars = parseInt(localStorage.getItem('starBalance') || '0', 10);
		const streak = parseInt(localStorage.getItem('streakDays') || '0', 10);
		const isGuest = localStorage.getItem('isGuest') !== 'false';
		const currentUser = localStorage.getItem('currentUser') || '';

		return {
			lessonScore,
			snbtScore,
			bonusScore,
			totalScore: lessonScore + snbtScore + bonusScore,
			stars,
			streak,
			isGuest,
			currentUser
		};
	}

	function getLearnerStage(snapshot) {
		const totalScore = snapshot && typeof snapshot.totalScore === 'number' ? snapshot.totalScore : 0;

		if (totalScore >= 1500) return 'advanced';
		if (totalScore >= 500) return 'intermediate';
		return 'beginner';
	}

	function createPersonalRecommendation(snapshot) {
		const stage = getLearnerStage(snapshot);

		if (stage === 'advanced') {
			return createInfoList('Rekomendasi personal untuk level Anda saat ini:', [
				'fokus review topik yang paling sering salah agar skor makin stabil',
				'imbangi latihan cepat dengan 1 sesi analisis kesalahan',
				'gunakan statistik untuk memilih kategori yang paling lemah',
				'targetkan evaluasi campuran agar kemampuan tetap merata'
			], `Skor lokal Anda saat ini sekitar <strong>${snapshot.totalScore.toLocaleString('id-ID')} poin</strong> dengan <strong>${snapshot.stars.toLocaleString('id-ID')} bintang</strong>.`);
		}

		if (stage === 'intermediate') {
			return createInfoList('Rekomendasi personal untuk progres Anda:', [
				'gabungkan 1 materi konsep + 1 sesi latihan setiap hari',
				'ulangi topik yang nilainya belum konsisten 2–3 kali seminggu',
				'pakai pomodoro 25 menit agar ritme belajar tetap enak',
				'cek statistik tiap selesai belajar untuk melihat kenaikan skor'
			], `Dengan progres sekitar <strong>${snapshot.totalScore.toLocaleString('id-ID')} poin</strong>, Anda sudah bagus dan tinggal dibuat lebih konsisten.`);
		}

		return createInfoList('Rekomendasi personal untuk awal belajar:', [
			'mulai dari materi dasar yang paling Anda butuhkan dulu',
			'batasi target kecil: 1 materi singkat + 5–10 soal latihan',
			'pakai mode fokus supaya tidak cepat terdistraksi',
			'setelah itu cek statistik agar progres terasa lebih jelas'
		], 'Kalau mau, saya juga bisa bantu buatkan rencana belajar 7 hari yang ringan.');
	}

	function createSevenDayPlan(snapshot) {
		const stage = getLearnerStage(snapshot);
		const focusText = stage === 'advanced'
			? 'kombinasi evaluasi campuran, review salah, dan penguatan akurasi'
			: stage === 'intermediate'
				? 'keseimbangan antara materi inti dan latihan soal'
				: 'dasar materi, latihan ringan, dan konsistensi harian';

		return createInfoList('Rencana belajar 7 hari yang bisa Anda ikuti:', [
			'Hari 1: pilih 1 topik utama dan pelajari konsep dasarnya',
			'Hari 2: kerjakan latihan singkat dari topik yang sama',
			'Hari 3: review kesalahan dan catat pola yang sering muncul',
			'Hari 4: lanjut ke topik kedua yang masih berhubungan',
			'Hari 5: gabungkan materi + evaluasi singkat 15–20 menit',
			'Hari 6: fokus pada soal yang paling menantang atau paling sering salah',
			'Hari 7: cek statistik, simpulkan progres, lalu tentukan target minggu berikutnya'
		], `Fokus yang cocok untuk Anda sekarang: <strong>${focusText}</strong>.`);
	}

	function createTodayStudySuggestion(snapshot, page) {
		const stage = getLearnerStage(snapshot);
		const pageLabel = prettifyPageName(page);

		if (stage === 'advanced') {
			return createInfoList('Saran belajar untuk hari ini:', [
				'mulai dari 1 evaluasi cepat agar ritme berpikir langsung aktif',
				'pilih 1 topik salah terbanyak untuk direview 10–15 menit',
				'akhiri dengan cek statistik atau pencapaian untuk melihat progres'
			], `Karena Anda sedang berada di tahap lanjut, pendekatan paling pas adalah review terarah + evaluasi. Jika mau, lanjutkan dari halaman <strong>${escapeHtml(pageLabel || 'saat ini')}</strong>.`);
		}

		if (stage === 'intermediate') {
			return createInfoList('Saran belajar untuk hari ini:', [
				'buka 1 materi inti terlebih dahulu selama 15 menit',
				'lanjutkan dengan 1 sesi evaluasi pendek agar konsep langsung terpakai',
				'catat 1–2 kesalahan penting sebelum menutup sesi belajar'
			], 'Pola ini biasanya paling efektif untuk membuat progres lebih stabil.');
		}

		return createInfoList('Saran belajar untuk hari ini:', [
			'pilih 1 materi paling dasar yang terasa penting',
			'baca singkat, lalu coba beberapa soal ringan',
			'jangan kejar banyak topik sekaligus; cukup 1 topik dulu'
		], 'Kuncinya hari ini adalah mulai dulu dengan santai, bukan langsung banyak.');
	}

	function getDynamicQuickActions() {
		const page = getCurrentPage();
		const merged = [...(PAGE_ACTIONS[page] || []), ...BASE_QUICK_ACTIONS];
		const deduped = new Map();

		merged.forEach((item) => {
			if (!item || !item.label || deduped.has(item.label)) return;
			deduped.set(item.label, item);
		});

		return Array.from(deduped.values()).slice(0, 10);
	}

	function createInfoList(title, items, footer = '') {
		const listMarkup = (items || [])
			.map((item) => `<li style="margin-bottom:4px;">${item}</li>`)
			.join('');

		return `<strong>${title}</strong><div style="margin-top:6px;"><ul style="margin:0; padding-left:18px;">${listMarkup}</ul></div>${footer ? `<div style="margin-top:8px;">${footer}</div>` : ''}`;
	}

	function createFaqOverview() {
		return `
			<strong>FAQ QuizNation</strong>
			<div style="margin-top:8px; line-height:1.65;">
				Saya punya bantuan untuk beberapa topik utama berikut:
			</div>
			<div style="margin-top:8px;">
				<strong>1. Akun & Login</strong>
				<ul style="margin:6px 0 8px; padding-left:18px;">
					${FAQ_GROUPS.akun.map((item) => `<li>${item}</li>`).join('')}
				</ul>
				<strong>2. Belajar & Materi</strong>
				<ul style="margin:6px 0 8px; padding-left:18px;">
					${FAQ_GROUPS.belajar.map((item) => `<li>${item}</li>`).join('')}
				</ul>
				<strong>3. Evaluasi & SNBT</strong>
				<ul style="margin:6px 0 8px; padding-left:18px;">
					${FAQ_GROUPS.evaluasi.map((item) => `<li>${item}</li>`).join('')}
				</ul>
				<strong>4. Progress & Statistik</strong>
				<ul style="margin:6px 0 8px; padding-left:18px;">
					${FAQ_GROUPS.progres.map((item) => `<li>${item}</li>`).join('')}
				</ul>
				<strong>5. Kendala Teknis</strong>
				<ul style="margin:6px 0 0; padding-left:18px;">
					${FAQ_GROUPS.teknis.map((item) => `<li>${item}</li>`).join('')}
				</ul>
			</div>
			<div style="margin-top:8px;">Anda bisa tanya langsung dengan bahasa santai, misalnya <em>cara login</em>, <em>data saya hilang</em>, atau <em>tips evaluasi</em>.</div>
		`;
	}

	function formatMessageTime(value) {
		const date = value ? new Date(value) : new Date();
		return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
	}

	// NEW FEATURE 1: Session Timer — tracks how long the user has been chatting
	function startSessionTimer() {
		if (state.sessionTimer) return;
		state.sessionTimer = setInterval(() => {
			state.sessionSeconds++;
			const timerEl = document.getElementById('qnChatbotTimer');
			if (!timerEl) return;
			const m = Math.floor(state.sessionSeconds / 60).toString().padStart(2, '0');
			const s = (state.sessionSeconds % 60).toString().padStart(2, '0');
			timerEl.textContent = `${m}:${s}`;
		}, 1000);
	}

	// NEW FEATURE 2: Export Chat as text file
	function exportChatHistory() {
		const history = loadHistory();
		if (!history.length) { alert('Belum ada percakapan yang bisa diekspor.'); return; }
		const text = history.map(item => {
			const who = item.role === 'user' ? 'Anda' : BOT_NAME;
			const time = formatMessageTime(item.time);
			const content = item.isHtml
				? item.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
				: item.content;
			return `[${time}] ${who}: ${content}`;
		}).join('\n\n');
		const blob = new Blob([`Riwayat Chat ${BOT_NAME}\n${'='.repeat(40)}\n\n${text}`], { type: 'text/plain;charset=utf-8' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `quiznation-chat-${new Date().toISOString().slice(0, 10)}.txt`;
		a.click();
	}

	function scrollMessagesToBottom() {
		if (els.messages) {
			els.messages.scrollTop = els.messages.scrollHeight;
		}
	}

	function setFabBadge(count) {
		state.unreadCount = Math.max(0, count || 0);
		if (!els.launcher) return;

		if (state.unreadCount > 0) {
			els.launcher.setAttribute('data-badge', String(Math.min(state.unreadCount, 9)));
		} else {
			els.launcher.removeAttribute('data-badge');
		}
	}

	function queueSidebarRefresh() {
		if (state.sidebarRefreshQueued) return;
		state.sidebarRefreshQueued = true;

		requestAnimationFrame(() => {
			state.sidebarRefreshQueued = false;
			injectSidebarButtons();
		});
	}

	function injectStyles() {
		if (document.getElementById('qnChatbotStyles')) return;

		const style = document.createElement('style');
		style.id = 'qnChatbotStyles';
		style.textContent = `
			body.qn-chatbot-open {
				overflow: hidden !important;
				overscroll-behavior: none;
			}

			.qn-chatbot-backdrop {
				position: fixed;
				inset: 0;
				background: rgba(7, 10, 20, 0.58);
				backdrop-filter: blur(8px);
				-webkit-backdrop-filter: blur(8px);
				opacity: 0;
				visibility: hidden;
				pointer-events: none;
				transition: opacity 0.25s ease, visibility 0.25s ease;
				z-index: 12040;
			}

			.qn-chatbot-backdrop.active {
				opacity: 1;
				visibility: visible;
				pointer-events: auto;
			}

			.qn-chatbot-fab {
				position: fixed;
				right: 18px;
				bottom: calc(18px + env(safe-area-inset-bottom, 0px));
				width: 58px;
				height: 58px;
				border: none;
				border-radius: 50%;
				background: linear-gradient(135deg, #8b5cf6, #4f46e5);
				color: #fff;
				font-size: 1.35rem;
				box-shadow: 0 14px 30px rgba(59, 130, 246, 0.35);
				cursor: pointer;
				z-index: 12050;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				transition: transform 0.2s ease, box-shadow 0.2s ease;
				animation: qnChatbotFabFloat 3.2s ease-in-out infinite;
			}

			.qn-chatbot-fab:hover {
				transform: translateY(-2px) scale(1.02);
				box-shadow: 0 18px 34px rgba(59, 130, 246, 0.42);
			}

			.qn-chatbot-fab[data-badge]::after {
				content: attr(data-badge);
				position: absolute;
				top: 2px;
				right: 0;
				min-width: 18px;
				height: 18px;
				padding: 0 5px;
				border-radius: 999px;
				background: #f43f5e;
				color: #fff;
				font-size: 0.64rem;
				font-weight: 800;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 8px 16px rgba(244, 63, 94, 0.28);
			}

			@keyframes qnChatbotFabFloat {
				0%, 100% { transform: translateY(0); }
				50% { transform: translateY(-3px); }
			}

			.qn-chatbot-panel {
				position: fixed;
				right: 22px;
				bottom: calc(96px + env(safe-area-inset-bottom, 0px));
				width: min(620px, calc(100vw - 40px));
				max-height: min(86vh, 840px);
				min-height: 640px;
				display: flex;
				flex-direction: column;
				border-radius: 26px;
				overflow: hidden;
				background: rgba(9, 13, 28, 0.96);
				border: 1px solid rgba(255, 255, 255, 0.1);
				box-shadow: 0 24px 60px rgba(0, 0, 0, 0.34);
				transform: translateY(14px) scale(0.98);
				opacity: 0;
				visibility: hidden;
				pointer-events: none;
				transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s ease;
				z-index: 12060;
				color: #eef2ff;
				font-family: 'Inter', 'Segoe UI', sans-serif;
			}

			.qn-chatbot-panel.active {
				opacity: 1;
				visibility: visible;
				pointer-events: auto;
				transform: translateY(0) scale(1);
			}

			.qn-chatbot-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 12px;
				padding: 14px 16px;
				background: linear-gradient(135deg, rgba(139, 92, 246, 0.92), rgba(59, 130, 246, 0.92));
			}

			.qn-chatbot-title-wrap {
				display: flex;
				align-items: center;
				gap: 10px;
				min-width: 0;
			}

			.qn-chatbot-avatar {
				width: 36px;
				height: 36px;
				border-radius: 12px;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				background: rgba(255, 255, 255, 0.16);
				font-size: 1rem;
				flex-shrink: 0;
			}

			.qn-chatbot-title {
				font-size: 0.95rem;
				font-weight: 800;
				margin: 0;
			}

			.qn-chatbot-subtitle {
				font-size: 0.72rem;
				opacity: 0.9;
				margin: 2px 0 0;
			}

			.qn-chatbot-status {
				display: inline-flex;
				align-items: center;
				gap: 6px;
				margin-top: 4px;
				padding: 4px 8px;
				border-radius: 999px;
				background: rgba(255, 255, 255, 0.16);
				font-size: 0.68rem;
				font-weight: 700;
			}

			.qn-chatbot-actions {
				display: inline-flex;
				align-items: center;
				gap: 8px;
				flex-shrink: 0;
			}

			.qn-chatbot-clear,
			.qn-chatbot-close {
				border: none;
				background: rgba(255, 255, 255, 0.14);
				color: #fff;
				width: 34px;
				height: 34px;
				border-radius: 10px;
				cursor: pointer;
				font-size: 1rem;
				flex-shrink: 0;
			}

			.qn-chatbot-messages {
				padding: 18px;
				overflow-y: auto;
				display: flex;
				flex-direction: column;
				gap: 14px;
				min-height: 420px;
				background:
					radial-gradient(circle at top right, rgba(139, 92, 246, 0.12), transparent 38%),
					rgba(9, 13, 28, 0.96);
			}

			.qn-chatbot-messages::-webkit-scrollbar {
				width: 6px;
			}

			.qn-chatbot-messages::-webkit-scrollbar-thumb {
				background: rgba(96, 165, 250, 0.35);
				border-radius: 999px;
			}

			.qn-chatbot-message {
				display: flex;
			}

			.qn-chatbot-message.user {
				justify-content: flex-end;
			}

			.qn-chatbot-stack {
				display: flex;
				flex-direction: column;
				gap: 4px;
				max-width: 88%;
			}

			.qn-chatbot-meta {
				font-size: 0.68rem;
				color: rgba(255, 255, 255, 0.56);
				padding: 0 2px;
			}

			.qn-chatbot-message.user .qn-chatbot-meta {
				text-align: right;
			}

			.qn-chatbot-bubble {
				max-width: 100%;
				padding: 12px 14px;
				border-radius: 15px;
				font-size: 0.92rem;
				line-height: 1.72;
				word-break: break-word;
				box-shadow: 0 8px 20px rgba(0, 0, 0, 0.14);
			}

			.qn-chatbot-message.bot .qn-chatbot-bubble {
				background: rgba(255, 255, 255, 0.08);
				border: 1px solid rgba(255, 255, 255, 0.08);
			}

			.qn-chatbot-message.user .qn-chatbot-bubble {
				background: linear-gradient(135deg, #8b5cf6, #4f46e5);
				color: #fff;
			}

			.qn-chatbot-message.typing .qn-chatbot-bubble {
				display: inline-flex;
				align-items: center;
				min-height: 40px;
			}

			.qn-chatbot-typing-dots {
				display: inline-flex;
				align-items: center;
				gap: 4px;
			}

			.qn-chatbot-typing-dots span {
				width: 7px;
				height: 7px;
				border-radius: 50%;
				background: rgba(255, 255, 255, 0.72);
				animation: qnTypingPulse 1s infinite ease-in-out;
			}

			.qn-chatbot-typing-dots span:nth-child(2) {
				animation-delay: 0.15s;
			}

			.qn-chatbot-typing-dots span:nth-child(3) {
				animation-delay: 0.3s;
			}

			@keyframes qnTypingPulse {
				0%, 80%, 100% { transform: translateY(0); opacity: 0.55; }
				40% { transform: translateY(-3px); opacity: 1; }
			}

			.qn-chatbot-link {
				color: #c4b5fd;
				font-weight: 700;
				text-decoration: none;
			}

			.qn-chatbot-link:hover {
				text-decoration: underline;
			}

			.qn-chatbot-quick-actions {
				display: flex;
				flex-wrap: wrap;
				gap: 8px;
				padding: 0 14px 12px;
			}

			.qn-chatbot-chip {
				border: 1px solid rgba(139, 92, 246, 0.34);
				background: rgba(139, 92, 246, 0.12);
				color: #e9ddff;
				border-radius: 999px;
				padding: 8px 10px;
				font-size: 0.72rem;
				font-weight: 700;
				cursor: pointer;
				transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
			}

			.qn-chatbot-chip:hover {
				transform: translateY(-1px);
				background: rgba(139, 92, 246, 0.2);
				border-color: rgba(96, 165, 250, 0.52);
			}

			.qn-chatbot-footer {
				display: grid;
				grid-template-columns: 1fr auto;
				gap: 8px;
				padding: 12px 14px 14px;
				border-top: 1px solid rgba(255, 255, 255, 0.08);
				background: rgba(7, 10, 20, 0.92);
			}

			.qn-chatbot-input {
				width: 100%;
				border: 1px solid rgba(255, 255, 255, 0.12);
				border-radius: 12px;
				background: rgba(255, 255, 255, 0.06);
				color: #fff;
				padding: 12px 13px;
				outline: none;
				font-size: 0.82rem;
			}

			.qn-chatbot-input::placeholder {
				color: rgba(255, 255, 255, 0.58);
			}

			.qn-chatbot-send {
				min-width: 52px;
				border: none;
				border-radius: 12px;
				background: linear-gradient(135deg, #8b5cf6, #4f46e5);
				color: #fff;
				font-weight: 800;
				cursor: pointer;
				padding: 0 14px;
			}

			.qn-chatbot-inline {
				margin-top: 16px;
				padding: 12px;
				border-radius: 16px;
				background: rgba(59, 130, 246, 0.12);
				border: 1px solid rgba(139, 92, 246, 0.22);
			}

			.qn-chatbot-inline-note {
				margin: 8px 0 0;
				font-size: 0.72rem;
				line-height: 1.5;
				color: rgba(255, 255, 255, 0.78);
			}

			.qn-chatbot-sidebar-btn {
				width: 100%;
				min-height: 42px;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				gap: 8px;
				border: none;
				border-radius: 12px;
				background: linear-gradient(135deg, rgba(139, 92, 246, 0.92), rgba(59, 130, 246, 0.92));
				color: #fff;
				font-size: 0.82rem;
				font-weight: 800;
				cursor: pointer;
				padding: 10px 12px;
				text-align: center;
			}

			.qn-chatbot-sidebar-btn .qn-chatbot-btn-icon {
				font-size: 0.95rem;
			}

			@media (max-width: 1280px) {
				.qn-chatbot-panel {
					width: min(540px, calc(100vw - 32px));
					min-height: 580px;
					max-height: min(82vh, 760px);
				}
			}

			@media (max-width: 1100px) {
				.qn-chatbot-panel {
					width: min(460px, calc(100vw - 28px));
					min-height: 520px;
					max-height: min(80vh, 700px);
				}
			}

			@media (max-width: 640px) {
				.qn-chatbot-panel {
					right: 12px;
					left: 12px;
					width: auto;
					bottom: calc(82px + env(safe-area-inset-bottom, 0px));
					min-height: auto;
					max-height: 78vh;
				}

				.qn-chatbot-fab {
					right: 12px;
					bottom: calc(12px + env(safe-area-inset-bottom, 0px));
					width: 54px;
					height: 54px;
				}
			}

			/* NEW: Minimized panel state */
			.qn-chatbot-panel.minimized {
				min-height: 0 !important;
				max-height: 60px !important;
				overflow: hidden;
			}

			/* NEW: Typing sound toggle button */
			.qn-chatbot-sound-btn {
				border: none;
				background: rgba(255,255,255,0.1);
				color: #fff;
				width: 30px;
				height: 30px;
				border-radius: 8px;
				cursor: pointer;
				font-size: 0.85rem;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				transition: background 0.2s;
			}
			.qn-chatbot-sound-btn:hover { background: rgba(255,255,255,0.22); }

			/* NEW: Session timer display */
			.qn-chatbot-timer {
				font-size: 0.65rem;
				opacity: 0.7;
				font-variant-numeric: tabular-nums;
				letter-spacing: 0.04em;
				padding: 3px 7px;
				border-radius: 999px;
				background: rgba(0,0,0,0.22);
				margin-left: 4px;
			}

			/* NEW: Copy button on message hover */
			.qn-chatbot-stack:hover .qn-copy-btn {
				opacity: 1;
			}
			.qn-copy-btn {
				opacity: 0;
				transition: opacity 0.18s;
				border: none;
				background: rgba(255,255,255,0.1);
				color: rgba(255,255,255,0.7);
				border-radius: 6px;
				padding: 2px 7px;
				font-size: 0.65rem;
				cursor: pointer;
				margin-top: 2px;
				align-self: flex-start;
			}
			.qn-chatbot-message.user .qn-copy-btn {
				align-self: flex-end;
			}

			/* NEW: Emoji reaction strip */
			.qn-reaction-strip {
				display: flex;
				gap: 4px;
				opacity: 0;
				transition: opacity 0.18s;
				margin-top: 3px;
			}
			.qn-chatbot-stack:hover .qn-reaction-strip {
				opacity: 1;
			}
			.qn-reaction-btn {
				border: none;
				background: rgba(255,255,255,0.08);
				border-radius: 999px;
				padding: 2px 7px;
				font-size: 0.82rem;
				cursor: pointer;
				transition: background 0.15s, transform 0.12s;
			}
			.qn-reaction-btn:hover {
				background: rgba(255,255,255,0.18);
				transform: scale(1.15);
			}
			.qn-reaction-btn.active {
				background: rgba(14,165,233,0.36);
			}

			/* NEW: Voice input button */
			.qn-voice-btn {
				border: none;
				background: rgba(255,255,255,0.08);
				color: rgba(255,255,255,0.9);
				border-radius: 10px;
				width: 42px;
				height: 100%;
				min-height: 38px;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				font-size: 1rem;
				transition: background 0.18s, color 0.18s;
				flex-shrink: 0;
			}
			.qn-voice-btn.listening {
				background: rgba(239,68,68,0.32);
				color: #fca5a5;
				animation: qnVoicePulse 1.1s ease-in-out infinite;
			}
			@keyframes qnVoicePulse {
				0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
				60% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
			}

			/* NEW: Auto-suggest dropdown */
			.qn-suggest-list {
				position: absolute;
				bottom: calc(100% + 6px);
				left: 14px;
				right: 14px;
				background: rgba(15,18,38,0.97);
				border: 1px solid rgba(14,165,233,0.35);
				border-radius: 14px;
				overflow: hidden;
				z-index: 99;
				box-shadow: 0 8px 24px rgba(0,0,0,0.35);
				display: none;
			}
			.qn-suggest-list.visible { display: block; }
			.qn-suggest-item {
				padding: 9px 14px;
				font-size: 0.82rem;
				color: #e9ddff;
				cursor: pointer;
				transition: background 0.14s;
				border-bottom: 1px solid rgba(255,255,255,0.05);
			}
			.qn-suggest-item:last-child { border-bottom: none; }
			.qn-suggest-item:hover { background: rgba(14,165,233,0.2); }

			/* NEW: Minimize button */
			.qn-chatbot-min {
				border: none;
				background: rgba(255,255,255,0.14);
				color: #fff;
				width: 34px;
				height: 34px;
				border-radius: 10px;
				cursor: pointer;
				font-size: 1rem;
				flex-shrink: 0;
			}
			.qn-chatbot-min:hover { background: rgba(255,255,255,0.22); }

			/* NEW: Export button in header */
			.qn-export-btn {
				border: none;
				background: rgba(255,255,255,0.12);
				color: #fff;
				width: 34px;
				height: 34px;
				border-radius: 10px;
				cursor: pointer;
				font-size: 0.88rem;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				transition: background 0.18s;
			}
			.qn-export-btn:hover { background: rgba(255,255,255,0.22); }

			/* NEW: Footer wrapper for voice+input+send */
			.qn-chatbot-input-row {
				display: flex;
				gap: 6px;
				align-items: stretch;
				position: relative;
			}
		`;

		document.head.appendChild(style);
	}

	function loadHistory() {
		try {
			const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
			return Array.isArray(parsed) ? parsed : [];
		} catch (error) {
			return [];
		}
	}

	function saveHistory(history) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
		} catch (error) {
			/* ignore storage issues */
		}
	}

	function renderMessage(role, content, isHtml, persist, options = {}) {
		if (!els.messages) return;

		const timestamp = options.time || Date.now();
		const messageEl = document.createElement('div');
		messageEl.className = `qn-chatbot-message ${role}`;

		const stackEl = document.createElement('div');
		stackEl.className = 'qn-chatbot-stack';

		const metaEl = document.createElement('div');
		metaEl.className = 'qn-chatbot-meta';
		metaEl.textContent = `${role === 'user' ? 'Anda' : BOT_NAME} • ${formatMessageTime(timestamp)}`;

		const bubbleEl = document.createElement('div');
		bubbleEl.className = 'qn-chatbot-bubble';

		if (isHtml) {
			bubbleEl.innerHTML = content;
		} else {
			bubbleEl.textContent = content;
		}

		stackEl.appendChild(metaEl);
		stackEl.appendChild(bubbleEl);

		// NEW FEATURE 3: Copy message button
		const copyBtn = document.createElement('button');
		copyBtn.className = 'qn-copy-btn';
		copyBtn.textContent = '📋 copy';
		copyBtn.title = 'Salin pesan';
		copyBtn.addEventListener('click', () => {
			const plain = bubbleEl.innerText || bubbleEl.textContent || '';
			navigator.clipboard && navigator.clipboard.writeText(plain).then(() => {
				copyBtn.textContent = '✅ disalin';
				setTimeout(() => copyBtn.textContent = '📋 copy', 1500);
			});
		});
		stackEl.appendChild(copyBtn);

		// NEW FEATURE 4: Emoji reactions (only on bot messages)
		if (role === 'bot') {
			const reactionStrip = document.createElement('div');
			reactionStrip.className = 'qn-reaction-strip';
			['👍', '👎', '❤️', '😂', '🤔'].forEach(emoji => {
				const btn = document.createElement('button');
				btn.className = 'qn-reaction-btn';
				btn.textContent = emoji;
				btn.title = 'Reaksi';
				btn.addEventListener('click', () => {
					reactionStrip.querySelectorAll('.qn-reaction-btn').forEach(b => b.classList.remove('active'));
					btn.classList.add('active');
				});
				reactionStrip.appendChild(btn);
			});
			stackEl.appendChild(reactionStrip);
		}

		messageEl.appendChild(stackEl);
		els.messages.appendChild(messageEl);
		scrollMessagesToBottom();

		// NEW FEATURE 5: Typing sound
		if (role === 'user' && state.soundEnabled) {
			const ctx = window.AudioContext || window.webkitAudioContext;
			if (ctx) {
				const ac = new ctx();
				const osc = ac.createOscillator();
				const gain = ac.createGain();
				osc.connect(gain); gain.connect(ac.destination);
				osc.frequency.value = 420; gain.gain.value = 0.08;
				osc.start(); osc.stop(ac.currentTime + 0.06);
				setTimeout(() => ac.close(), 200);
			}
		}

		if (persist) {
			const history = loadHistory();
			history.push({ role, content, isHtml: !!isHtml, time: timestamp });
			saveHistory(history);
		}
	}

	function clearTypingIndicator() {
		const typingEl = els.messages && els.messages.querySelector('.qn-chatbot-message.typing');
		if (typingEl) typingEl.remove();
	}

	function showTypingIndicator() {
		if (!els.messages) return;
		clearTypingIndicator();

		const typingEl = document.createElement('div');
		typingEl.className = 'qn-chatbot-message bot typing';
		typingEl.innerHTML = `
			<div class="qn-chatbot-stack">
				<div class="qn-chatbot-meta">${BOT_NAME} • sedang mengetik...</div>
				<div class="qn-chatbot-bubble">
					<span class="qn-chatbot-typing-dots"><span></span><span></span><span></span></span>
				</div>
			</div>
		`;

		els.messages.appendChild(typingEl);
		scrollMessagesToBottom();
	}

	function getWelcomeMessage() {
		const page = getCurrentPage();
		const pageTip = PAGE_TIPS[page] || 'Saya bisa bantu untuk login, progres, evaluasi, materi, dan kontak admin QuizNation.';
		return `
			<div>${getTimeGreeting()}! Saya <strong>${BOT_NAME}</strong> 👋</div>
			<div style="margin-top:6px;">${pageTip}</div>
			<div style="margin-top:10px;"><strong>Saya bisa bantu:</strong></div>
			<div style="margin-top:6px; line-height:1.7;">
				• login & akun<br>
				• progres, skor, dan bintang<br>
				• evaluasi SNBT & materi belajar<br>
				• carikan materi atau halaman yang relevan<br>
				• rekomendasi belajar personal & rencana 7 hari<br>
				• arahan saat ada kendala atau bug
			</div>
		`;
	}

	async function getBotReply(userMessage) {
		const rawText = String(userMessage || '').trim();
		const text = rawText.toLowerCase();
		const snapshot = getLearningSnapshot();
		const page = getCurrentPage();
		const pageTip = PAGE_TIPS[page] || 'Saya siap membantu penggunaan fitur-fitur utama QuizNation.';
		const scoreText = `${snapshot.totalScore.toLocaleString('id-ID')} poin`;
		const starsText = `${snapshot.stars.toLocaleString('id-ID')} bintang`;
		const streakText = `${snapshot.streak} hari`;
		const stage = getLearnerStage(snapshot);
		const stageLabel = stage === 'advanced' ? 'lanjutan' : stage === 'intermediate' ? 'menengah' : 'pemula';
		const wantsDynamicSearch = matchesAny(text, [
			/\b(cari|carikan|search|temukan)\b/i,
			/\bmateri tentang\b/i,
			/\btopik tentang\b/i,
			/\bjelaskan tentang\b/i,
			/\bada materi\b/i
		]);

		if (!text) {
			return humanizeReply('Silakan tulis pertanyaan Anda — saya siap bantu kapan saja 😊', { tone: 'warm', page });
		}

		// ── Slash commands ──────────────────────────────────────────────────────
		if (text === '/help' || text === '/perintah') {
			return humanizeReply(createInfoList('Perintah cepat yang tersedia:', [
				'<strong>/help</strong> — tampilkan daftar perintah ini',
				'<strong>/skor</strong> — lihat skor, bintang, dan streak lokal Anda',
				'<strong>/hari ini</strong> — rekomendasi sesi belajar hari ini',
				'<strong>/rencana</strong> — buat rencana belajar 7 hari',
				'<strong>/rekomendasi</strong> — saran belajar personal berdasarkan level Anda',
				'<strong>/faq</strong> — tampilkan FAQ dan topik bantuan lengkap',
				'<strong>/clear</strong> — hapus seluruh percakapan ini'
			], 'Anda juga bisa mengetik dalam bahasa santai — saya akan mencoba memahami ✨'), { tone: 'info', page });
		}
		if (text === '/skor') {
			const levelBadge = stage === 'advanced' ? '🏆 Level Lanjutan' : stage === 'intermediate' ? '⭐ Level Menengah' : '🌱 Level Pemula';
			return humanizeReply(createInfoList('Data lokal Anda saat ini:', [
				`<strong>Total skor:</strong> ${scoreText}`,
				`<strong>Bintang:</strong> ${starsText}`,
				`<strong>Streak:</strong> ${streakText}`,
				`<strong>Level:</strong> ${levelBadge}`
			], `Buka ${makeLink('statistik.html', 'Statistik')} untuk rincian grafik dan histori performa lengkap.`), { tone: 'info', page });
		}
		if (text === '/hari ini') {
			return humanizeReply(createTodayStudySuggestion(snapshot, page), { tone: 'warm', page });
		}
		if (text === '/rencana') {
			return humanizeReply(createSevenDayPlan(snapshot), { tone: 'warm', page });
		}
		if (text === '/rekomendasi') {
			return humanizeReply(createPersonalRecommendation(snapshot), { tone: 'warm', page });
		}
		if (text === '/faq') {
			return humanizeReply(createFaqOverview(), { tone: 'page', page });
		}
		if (text === '/clear') {
			setTimeout(() => clearConversation(), 300);
			return 'Menghapus percakapan...';
		}

		// ── Sapaan ──────────────────────────────────────────────────────────────
		if (matchesAny(text, [/(^(halo|hai|hello|hi|hey|permisi|assalamualaikum|oi|selamat))/i])) {
			const greetings = [
				`${getTimeGreeting()}! Saya <strong>${BOT_NAME}</strong> 👋 Ceritakan saja kebutuhan Anda, nanti saya bantu arahkan dengan cepat dan santai.`,
				`${getTimeGreeting()}! Ada yang ingin ditanyakan? Saya siap bantu seputar belajar, fitur, akun, atau kendala QuizNation 😊`,
				`${getTimeGreeting()}! Senang bisa membantu Anda. Mau mulai dari mana — cari materi, cek progres, atau ada kendala?`
			];
			return humanizeReply(greetings[Math.floor(Math.random() * greetings.length)], { tone: 'warm', page });
		}

		// ── Informasi halaman saat ini ────────────────────────────────────────
		if (matchesAny(text, [/(halaman ini|di halaman ini|fitur halaman ini|bantuan halaman ini)/i])) {
			return humanizeReply(createPageFallback(page), { tone: 'page', page });
		}

		// ── FAQ ───────────────────────────────────────────────────────────────
		if (matchesAny(text, [/(faq|faq lengkap|bantuan lengkap|daftar bantuan|menu bantuan|help menu|pusat bantuan)/i])) {
			return humanizeReply(createFaqOverview(), { tone: 'page', page });
		}

		// ── Pencarian materi dinamis ───────────────────────────────────────────
		if (wantsDynamicSearch) {
			const searchReply = await searchMaterialContent(rawText);
			if (searchReply) {
				return humanizeReply(searchReply, { tone: 'search', page });
			}
		}

		// ── Rekomendasi personal ──────────────────────────────────────────────
		if (matchesAny(text, [/(rekomendasi belajar personal|rekomendasi saya|saran buat saya|saran belajar untuk saya|bantu saya belajar)/i])) {
			return humanizeReply(createPersonalRecommendation(snapshot), { tone: 'warm', page });
		}

		// ── Belajar hari ini ──────────────────────────────────────────────────
		if (matchesAny(text, [/(belajar hari ini|hari ini belajar apa|hari ini enaknya belajar apa|mulai hari ini|mau belajar apa|enaknya belajar apa)/i])) {
			return humanizeReply(createTodayStudySuggestion(snapshot, page), { tone: 'warm', page });
		}

		// ── Rencana belajar ───────────────────────────────────────────────────
		if (matchesAny(text, [/(rencana belajar|jadwal belajar|study plan|7 hari|seminggu|jadwalkan|buat jadwal)/i])) {
			return humanizeReply(createSevenDayPlan(snapshot), { tone: 'warm', page });
		}

		// ── Naikkan skor ──────────────────────────────────────────────────────
		if (matchesAny(text, [/(target skor|naikkan skor|tingkatkan skor|score boost|cara naik skor|skor naik|supaya skor)/i])) {
			return humanizeReply(createInfoList('Strategi menaikkan skor lebih efisien:', [
				`Pilih 1–2 topik dari kategori paling lemah — skor Anda saat ini sekitar <strong>${scoreText}</strong>`,
				'Latih topik itu 2–3 kali dalam seminggu, bukan semua sekaligus',
				'Setelah tiap evaluasi, catat jenis soal mana yang paling sering salah',
				'Gunakan pomodoro 25 menit agar sesi tetap fokus dan tidak jenuh',
				'Cek grafik di Statistik tiap selesai — melihat angka naik itu motivasi tersendiri 📈'
			], `Target realistis: naik <strong>100–200 poin per minggu</strong> dari distribusi evaluasi yang konsisten. Buka ${makeLink('statistik.html', 'Statistik')} untuk mulai.`), { tone: 'warm', page });
		}

		// ── Akurasi ───────────────────────────────────────────────────────────
		if (matchesAny(text, [/(akurasi|ketelitian|sering salah|kurangi salah|teliti|banyak salah)/i])) {
			return humanizeReply(createInfoList('Tips meningkatkan akurasi jawaban:', [
				'Baca soal pelan-pelan 3–5 detik sebelum memilih jawaban',
				'Tandai kata kunci kritis: <em>tidak</em>, <em>paling tepat</em>, <em>kecuali</em>, atau <em>salah satu</em>',
				'Eliminasi 1–2 pilihan yang jelas salah terlebih dahulu',
				'Review setiap kesalahan agar pola yang sama tidak terulang',
				'Jangan terburu-buru — akurasi jauh lebih berharga dari kecepatan di tahap awal'
			], 'Kalau masih sering salah di topik tertentu, coba ulang materinya dulu sebelum lanjut latihan.'), { tone: 'info', page });
		}

		// ── Kecepatan mengerjakan soal ────────────────────────────────────────
		if (matchesAny(text, [/(kecepatan|cepat menjawab|kejar waktu|waktu mepet|manajemen waktu soal|mepet waktu)/i])) {
			return humanizeReply(createInfoList('Cara meningkatkan kecepatan tanpa mengorbankan akurasi:', [
				'Kerjakan soal yang paling yakin lebih dulu (skip yang ragu)',
				'Pasang batas waktu per soal — misalnya 60–90 detik per soal',
				'Latihan rutin dengan timer akan membangun refleks lebih cepat',
				'Jangan habiskan waktu menebak satu soal; kembali lagi di akhir',
				'Setelah terbiasa, tingkatkan tempo secara bertahap'
			], 'Kecepatan biasanya datang sendiri setelah akurasi sudah stabil.'), { tone: 'warm', page });
		}

		// ── Materi lemah / topik untuk direview ──────────────────────────────
		if (matchesAny(text, [/(materi lemah|topik lemah|ulang materi apa|review materi apa|bagian lemah saya|paling lemah)/i])) {
			return humanizeReply(createInfoList('Cara menemukan dan memperbaiki topik lemah:', [
				`Buka ${makeLink('statistik.html', 'Statistik')} → cek kategori dengan skor paling rendah`,
				'Pilih 1 topik yang paling kritis, jangan semuanya sekaligus',
				'Baca ulang materi inti lalu kerjakan 5–10 soal serupa',
				'Verifikasi: apakah error yang sama masih muncul setelah latihan?',
				'Kalau sudah membaik, baru lanjut ke topik berikutnya'
			], `Lanjut ke ${makeLink('materi.html', 'Materi')} atau ${makeLink('library.html', 'Library')} untuk materi referensi lebih lengkap.`), { tone: 'info', page });
		}

		// ── Shortcut keyboard ─────────────────────────────────────────────────
		if (matchesAny(text, [/(shortcut|hotkey|tombol cepat|keyboard shortcut)/i])) {
			return humanizeReply(createInfoList('Shortcut yang tersedia di QuizNation:', [
				'<strong>/</strong> — fokus ke kotak pencarian (jika tersedia)',
				'<strong>F</strong> — aktifkan mode fokus di halaman utama',
				'<strong>R</strong> — refresh atau reset tampilan cepat',
				'<strong>?</strong> — tampilkan panduan shortcut di beranda',
				'<strong>P</strong> — mulai atau jeda pomodoro timer'
			], 'Shortcut hanya aktif di halaman yang mendukung — biasanya beranda dan halaman evaluasi utama.'), { tone: 'info', page });
		}

		// ── Sinkronisasi / cache ───────────────────────────────────────────────
		if (matchesAny(text, [/(sinkron|sync|tidak sinkron|cache|cookie|browser lain|tersimpan tidak|localStorage)/i])) {
			return humanizeReply(createInfoList('Masalah data tidak sinkron — langkah diagnosa:', [
				'Pastikan Anda memakai browser dan perangkat yang sama',
				'Cek status: apakah sedang login atau masih mode tamu?',
				'Jangan bersihkan cache sebelum backup data (Export JSON dulu)',
				'Gunakan Export JSON → pindah perangkat → Import JSON untuk transfer data',
				`Kalau masih bermasalah, laporkan lewat ${makeLink('feedback.html', 'Feedback')}`
			], 'Data QuizNation tersimpan di localStorage browser, sehingga bersifat lokal per perangkat/browser.'), { tone: 'issue', page });
		}

		// ── Fitur utama ───────────────────────────────────────────────────────
		if (matchesAny(text, [/(fitur|fitur utama|bisa apa|apa saja fiturnya|ada apa saja)/i])) {
			return humanizeReply(createInfoList('Fitur lengkap QuizNation:', [
				'📖 <strong>Materi Bahasa Inggris</strong> bertahap — grammar, vocab, reading, listening',
				'📝 <strong>Evaluasi SNBT</strong> — latihan soal per kategori dengan skor real-time',
				'📚 <strong>Library referensi</strong> — penalaran, matematika, dan bahasa Indonesia',
				'📊 <strong>Statistik & Pencapaian</strong> — pantau skor, bintang, streak, dan badge',
				'⚙️ <strong>Smart Tools</strong> — mode fokus, pomodoro, quick notes, export/import data',
				'🎵 <strong>Backsound</strong> — musik belajar dengan volume control'
			], `Tip untuk halaman <strong>${page}</strong>: ${pageTip}`), { tone: 'info', page });
		}

		// ── Pemula / mulai dari mana ───────────────────────────────────────────
		if (matchesAny(text, [/(baru mulai|mulai dari mana|bingung mulai|mulai belajar|pemula|belum pernah|pertama kali)/i])) {
			return humanizeReply(createInfoList('Langkah awal yang paling disarankan untuk pemula:', [
				`1. ${makeLink('index.html#englishLevelsGrid', 'Pilih Level Bahasa Inggris')} — sistem akan memandu Anda bertahap`,
				`2. ${makeLink('materi.html', 'Buka Materi')} — pelajari konsep dulu sebelum latihan soal`,
				`3. ${makeLink('evaluasi.html', 'Masuk Evaluasi SNBT')} — uji pemahaman dengan simulasi soal`,
				`4. ${makeLink('statistik.html', 'Cek Statistik')} — pantau perkembangan belajar Anda`,
				'5. Aktifkan <strong>mode fokus</strong> dari sidebar agar sesi belajar lebih efektif'
			], 'Kalau punya target spesifik — misalnya <em>fokus SNBT</em>, <em>grammar</em>, atau <em>penalaran</em> — ceritakan ke saya, nanti saya arahkan lebih spesifik 🎯'), { tone: 'warm', page });
		}

		// ── Tips belajar ──────────────────────────────────────────────────────
		if (matchesAny(text, [/(tips belajar|belajar efektif|biar konsisten|gimana biar rajin|strategi belajar|cara belajar yang baik)/i])) {
			return humanizeReply(createInfoList(`Tips belajar efektif untuk level <strong>${stageLabel}</strong>:`, [
				'Mulai dari sesi pendek 15–25 menit — lebih baik konsisten dari banyak tapi jarang',
				'Gunakan pomodoro: 25 menit fokus + 5 menit istirahat',
				'Setelah belajar materi, langsung latihan soal — jangan tunda',
				'Catat 1–2 kesalahan paling penting sebelum tutup sesi',
				'Review catatan kesalahan tiap akhir pekan sebelum evaluasi mingguan'
			], 'Konsistensi kecil setiap hari biasanya mengalahkan belajar marathon seminggu sekali.'), { tone: 'warm', page });
		}

		// ── Bahasa Inggris / English ──────────────────────────────────────────
		if (matchesAny(text, [/(grammar|vocabulary|reading comprehension|listening|speaking|writing|bahasa inggris|english|tenses|kosakata)/i])) {
			return humanizeReply(createInfoList('Belajar Bahasa Inggris di QuizNation:', [
				`<strong>Grammar & Structure</strong> — ${makeLink('materi.html', 'buka Materi')} atau ${makeLink('lib-grammar-structure.html', 'Library Grammar')}`,
				`<strong>Vocabulary</strong> — ${makeLink('materi-kosakata.html', 'Materi Kosakata')} atau ${makeLink('lib-vocabulary-context.html', 'Library Vocab')}`,
				`<strong>Reading Comprehension</strong> — ${makeLink('materi-membacateks.html', 'Materi Reading')} atau ${makeLink('lib-reading-comprehension.html', 'Library Reading')}`,
				`<strong>Tenses & Modal Verbs</strong> — ${makeLink('tenses.html', 'halaman Tenses')} atau ${makeLink('materi-modal-verbs.html', 'Modal Verbs')}`,
				`Mulai dari ${makeLink('index.html#englishLevelsGrid', 'Level Bahasa Inggris')} untuk jalur bertahap`
			], 'Kalau ingin saya carikan topik spesifik, ketik: <em>carikan materi tentang [topik]</em>'), { tone: 'info', page });
		}

		// ── Matematika / Numerik ─────────────────────────────────────────────
		if (matchesAny(text, [/(matematika|numerik|logika kuantitatif|kuantitatif|aritmatika|statistika|geometri|aljabar|peluang|kombinatorika)/i])) {
			return humanizeReply(createInfoList('Topik numerik & penalaran kuantitatif di QuizNation:', [
				`<strong>Aritmatika dasar</strong> — ${makeLink('lib-aritmatika.html', 'Library Aritmatika')}`,
				`<strong>Rasio & Persen</strong> — ${makeLink('lib-pk-rasio-proporsi.html', 'Rasio & Proporsi')} | ${makeLink('lib-pk-persen-bunga.html', 'Persen & Bunga')}`,
				`<strong>Statistika & Geometri</strong> — ${makeLink('lib-statistika.html', 'Statistika')} | ${makeLink('lib-geometri.html', 'Geometri')}`,
				`<strong>Aljabar & Fungsi</strong> — ${makeLink('lib-aljabar.html', 'Aljabar')} | ${makeLink('lib-fungsi-kuadrat-optimasi.html', 'Fungsi Kuadrat')}`,
				`<strong>Kombinatorika & Peluang</strong> — ${makeLink('lib-pk-kombinatorika-peluang.html', 'Kombinatorika')} | ${makeLink('lib-pk-tabel-grafik.html', 'Tabel & Grafik')}`
			], `Semua materi di atas bisa diakses dari ${makeLink('library.html', 'Library')}.`), { tone: 'info', page });
		}

		// ── Penalaran / Logika ────────────────────────────────────────────────
		if (matchesAny(text, [/(penalaran|penalaran umum|penalaran logis|logika|analitis|induktif|kausal|verbal|argumen)/i])) {
			return humanizeReply(createInfoList('Topik penalaran yang tersedia:', [
				`<strong>Penalaran Logis</strong> — ${makeLink('lib-penalaran-logis.html', 'buka materi')}`,
				`<strong>Penalaran Analitis</strong> — ${makeLink('lib-penalaran-analitis.html', 'buka materi')}`,
				`<strong>Penalaran Induktif</strong> — ${makeLink('lib-penalaran-induktif.html', 'buka materi')}`,
				`<strong>Penalaran Kausal</strong> — ${makeLink('lib-penalaran-kausal.html', 'buka materi')}`,
				`<strong>Argumen & Analisis</strong> — ${makeLink('lib-analisis-argumen.html', 'Analisis Argumen')} | ${makeLink('lib-asumsi-evaluasi-argumen.html', 'Asumsi & Evaluasi')}`
			], `Semua tersedia di ${makeLink('library.html', 'Library')}.`), { tone: 'info', page });
		}

		// ── Login / Akun ──────────────────────────────────────────────────────
		if (matchesAny(text, [/(login|masuk|daftar|akun|sign in|sign up|registrasi)/i])) {
			const userInfo = snapshot.isGuest
				? '⚠️ Anda saat ini kemungkinan masih di <strong>mode tamu</strong> — login untuk menyimpan progres dengan lebih aman.'
				: `✅ Akun aktif terdeteksi: <strong>${escapeHtml(snapshot.currentUser || 'pengguna')}</strong>.`;
			return humanizeReply(createInfoList('Panduan akses akun QuizNation:', [
				`Buka ${makeLink('login.html', 'halaman Login')} dan pilih <em>Masuk</em> atau <em>Daftar</em>`,
				'Isi email dan kata sandi, lalu klik tombol login',
				'Jika akun belum ada, daftar terlebih dahulu dengan email aktif',
				'Setelah login, progres Anda akan tersimpan di perangkat tersebut'
			], userInfo), { tone: 'warm', page });
		}

		// ── Mode tamu ─────────────────────────────────────────────────────────
		if (matchesAny(text, [/(guest|tamu|mode tamu|bedanya tamu|bedanya login)/i])) {
			return humanizeReply(createInfoList('Perbedaan mode tamu vs akun login:', [
				'<strong>Mode tamu:</strong> bisa akses semua fitur, data tersimpan lokal di browser',
				'<strong>Akun login:</strong> data lebih terstruktur, bisa backup & restore dengan mudah',
				'Kalau ganti browser/HP di mode tamu, progres bisa tidak terbawa',
				'Login tetap menggunakan data lokal — tidak ada server eksternal yang terlibat'
			], 'Saran: login untuk pengalaman yang lebih aman, terutama jika ingin pindah perangkat.'), { tone: 'info', page });
		}

		// ── Lupa password / reset ─────────────────────────────────────────────
		if (matchesAny(text, [/(lupa|password|sandi|reset akun|reset password|tidak bisa masuk|akun terkunci)/i])) {
			return humanizeReply(createInfoList('Kendala akses akun — langkah yang bisa dicoba:', [
				'Pastikan email yang digunakan sudah benar',
				'Coba refresh halaman lalu login ulang',
				`Jika masih gagal, kirim detail kendala (email dan deskripsi masalah) lewat ${makeLink('feedback.html', 'Feedback')}`,
				'Admin akan membantu secepatnya setelah menerima laporan Anda'
			], 'Data QuizNation bersifat lokal, sehingga reset mungkin tidak bisa otomatis — hubungi admin untuk panduan lebih lanjut.'), { tone: 'issue', page });
		}

		// ── Data & statistik pengguna ─────────────────────────────────────────
		if (matchesAny(text, [/(skor saya|bintang saya|streak saya|progress saya|progres saya|data saya sekarang|level saya)/i])) {
			const levelBadge = stage === 'advanced' ? '🏆 Lanjutan' : stage === 'intermediate' ? '⭐ Menengah' : '🌱 Pemula';
			return humanizeReply(createInfoList('Ringkasan data belajar Anda saat ini:', [
				`<strong>Total skor:</strong> ${scoreText}`,
				`<strong>Bintang:</strong> ${starsText}`,
				`<strong>Streak harian:</strong> ${streakText}`,
				`<strong>Level perkiraan:</strong> ${levelBadge}`
			], `Untuk grafik dan analisis lengkap, buka ${makeLink('statistik.html', 'Statistik')} atau ${makeLink('pencapaian.html', 'Pencapaian')}.`), { tone: 'info', page });
		}

		// ── Progres & statistik umum ─────────────────────────────────────────
		if (matchesAny(text, [/(progress|progres|statistik|lihat skor|lihat bintang|lihat pencapaian|pantau progres|cek statistik)/i])) {
			return humanizeReply(createInfoList('Cara memantau hasil belajar di QuizNation:', [
				`${makeLink('statistik.html', 'Statistik')} — grafik skor, persentase benar, dan histori`,
				`${makeLink('pencapaian.html', 'Pencapaian')} — badge, milestone, dan target streak`,
				`Data lokal Anda: <strong>${scoreText}</strong>, <strong>${starsText}</strong>, streak <strong>${streakText}</strong>`
			], 'Cek statistik tiap selesai sesi belajar — melihat angka naik adalah motivasi terbaik 📊'), { tone: 'info', page });
		}

		// ── Evaluasi / SNBT / Tryout ──────────────────────────────────────────
		if (matchesAny(text, [/(evaluasi|snbt|ujian|quiz|tryout|latihan soal|mulai ujian|mulai latihan)/i])) {
			return humanizeReply(createInfoList('Panduan memulai evaluasi SNBT:', [
				`Buka ${makeLink('evaluasi.html', 'Evaluasi SNBT')} atau ${makeLink('snbt.html', 'halaman SNBT')}`,
				'Pilih kategori: Penalaran Umum, Bahasa Indonesia, Bahasa Inggris, atau Matematika',
				'Kerjakan soal betimbap, tidak perlu langsung semua kategori',
				'Setelah selesai, cek skor dan identifikasi kategori yang paling perlu diperbaiki',
				'Gunakan hasil itu sebagai panduan materi berikutnya'
			], 'Tip: mulai dari kategori yang paling dikuasai untuk membangun kepercayaan diri lebih dulu.'), { tone: 'info', page });
		}

		// ── Membaca hasil evaluasi ────────────────────────────────────────────
		if (matchesAny(text, [/(nilai|hasil evaluasi|hasil ujian|skor evaluasi|predikat|baca hasil|interpretasi hasil)/i])) {
			return humanizeReply(createInfoList('Cara membaca dan memanfaatkan hasil evaluasi:', [
				'Lihat persentase benar per kategori, bukan hanya total skor',
				'Kategori di bawah 60% biasanya butuh perhatian khusus dulu',
				'Catat 2–3 soal yang paling sering salah untuk review mendalam',
				'Bandingkan hasil antar sesi di Statistik untuk melihat tren naik/turun',
				'Gunakan pola kesalahan untuk menentukan materi review berikutnya'
			], `Detail grafik tersedia di ${makeLink('statistik.html', 'Statistik')}.`), { tone: 'info', page });
		}

		// ── Strategi evaluasi / SNBT ──────────────────────────────────────────
		if (matchesAny(text, [/(tips evaluasi|strategi snbt|cara ngerjain|cepat ngerjain|manajemen waktu|trik snbt|biar lulus snbt)/i])) {
			return humanizeReply(createInfoList('Strategi mengerjakan SNBT dengan efektif:', [
				'Kerjakan soal yang paling dikuasai lebih dulu untuk menghemat waktu',
				'Jangan habiskan lebih dari 90 detik per soal — skip dulu jika ragu',
				'Eliminasi 1–2 pilihan salah sebelum memilih jawaban akhir',
				'Catat pola kesalahan yang sama agar tidak berulang di sesi berikutnya',
				'Setelah latihan, ulangi materi kategori dengan nilai paling rendah'
			], 'Latihan rutin 15–30 menit per hari lebih efektif dari 2 jam satu kali seminggu.'), { tone: 'warm', page });
		}

		// ── Materi / Library / Buku ────────────────────────────────────────────
		if (matchesAny(text, [/(materi|belajar|lesson|level bahasa|library|buku|referensi|bahan belajar)/i])) {
			return humanizeReply(createInfoList('Sumber belajar yang tersedia:', [
				`${makeLink('materi.html', 'Halaman Materi')} — topik belajar utama Bahasa Inggris`,
				`${makeLink('library.html', 'Library')} — referensi penalaran, matematika, dan bahasa Indonesia`,
				`${makeLink('index.html#englishLevelsGrid', 'Level Bahasa Inggris')} — jalur bertahap lewat beranda`
			], 'Bingung pilih materi? Ketik <em>carikan materi tentang [topik]</em> dan saya akan bantu temukan halaman yang paling relevan 🔍'), { tone: 'page', page });
		}

		// ── Quest / Misi harian ────────────────────────────────────────────────
		if (matchesAny(text, [/(quest|misi|harian|hadiah|reward|gift|gacha|tukar bintang|klaim hadiah)/i])) {
			return humanizeReply(createInfoList('Sistem misi harian dan reward:', [
				'Selesaikan target harian untuk mendapatkan bintang otomatis',
				`Bintang Anda saat ini: <strong>${starsText}</strong>`,
				'Bintang bisa ditukar dengan gift atau digunakan di fitur tertentu',
				'Pantau status misi dari beranda agar tidak ada target yang terlewat',
				'Streak harian juga memberikan bonus bintang sebagai reward konsistensi'
			], `Cek halaman ${makeLink('pencapaian.html', 'Pencapaian')} untuk melihat semua badge dan target yang sudah terbuka.`), { tone: 'info', page });
		}

		// ── Streak harian ─────────────────────────────────────────────────────
		if (matchesAny(text, [/(streak|hari berturut|login harian|check in harian|jaga streak|pertahankan streak)/i])) {
			const streakTip = snapshot.streak < 3
				? 'Streak Anda baru mulai — coba aktif 3 hari berturut-turut dulu untuk membangun kebiasaan 🔥'
				: snapshot.streak >= 7
					? `Streak <strong>${streakText}</strong> Anda sudah luar biasa! Pertahankan dengan minimal 1 sesi singkat setiap hari.`
					: `Streak <strong>${streakText}</strong> Anda sudah bagus — tinggal konsisten dan bangun terus!`;
			return humanizeReply(`${streakTip} Buka QuizNation minimal sekali sehari dan selesaikan 1 evaluasi atau baca 1 materi untuk menjaga streak tetap berjalan.`, { tone: 'warm', page });
		}

		// ── Mode fokus / Pomodoro / Produktivitas ─────────────────────────────
		if (matchesAny(text, [/(fokus|pomodoro|timer|produktif|mode fokus|distraksi|cara pakai pomodoro)/i])) {
			return humanizeReply(createInfoList('Fitur produktivitas di QuizNation:', [
				'<strong>Mode Fokus</strong> — aktifkan dari sidebar untuk tampilan minimalis tanpa distraksi',
				'<strong>Pomodoro Timer</strong> — sesi 25 menit + 5 menit istirahat untuk ritme belajar optimal',
				'<strong>Quick Notes</strong> — catat poin penting selama belajar tanpa harus keluar halaman',
				'<strong>Shortcut keyboard</strong> — F untuk fokus, P untuk pomodoro, ? untuk panduan'
			], 'Kombinasi mode fokus + pomodoro biasanya paling efektif untuk sesi belajar harian.'), { tone: 'info', page });
		}

		// ── Tema / Dark-light mode ─────────────────────────────────────────────
		if (matchesAny(text, [/(tema|theme|gelap|terang|dark mode|light mode|ganti tampilan|warna tampilan)/i])) {
			return humanizeReply(`Anda bisa mengganti mode gelap ↔ terang langsung dari toggle tema di sidebar atau header. Preferensi tema tersimpan otomatis, jadi tidak perlu diulang setiap buka halaman. Kalau perubahan belum terlihat, refresh halaman sekali.`, { tone: 'info', page });
		}

		// ── Musik / Audio ─────────────────────────────────────────────────────
		if (matchesAny(text, [/(musik|backsound|audio|sound|volume|lagu|mati musik|nyalain musik)/i])) {
			return humanizeReply(createInfoList('Pengaturan audio di QuizNation:', [
				'Buka sidebar → cari toggle musik untuk nyala/matikan backsound',
				'Slider volume tersedia di panel musik di beranda',
				'Pilih track audio favorit langsung dari daftar yang tersedia',
				'Kalau audio tidak muncul, pastikan browser tidak mem-blokir autoplay'
			]), { tone: 'info', page });
		}

		// ── Pengaturan / Settings ─────────────────────────────────────────────
		if (matchesAny(text, [/(pengaturan|setting|preferensi|atur akun|ubah profil|ubah tampilan)/i])) {
			return humanizeReply(`Semua pengaturan utama bisa diakses dari ${makeLink('pengaturan.html', 'halaman Pengaturan')}. Di sana Anda bisa mengatur preferensi tampilan, akun, notifikasi, dan beberapa opsi personalisasi.`, { tone: 'page', page });
		}

		// ── Avatar / Profil ───────────────────────────────────────────────────
		if (matchesAny(text, [/(avatar|foto profil|profil saya|nama akun|ganti nama|ubah avatar)/i])) {
			return humanizeReply(`Perubahan profil atau avatar biasanya tersimpan lokal di browser. Setelah mengubah, refresh halaman jika tampilan belum langsung berubah. Untuk bantuan lebih lanjut seputar profil, kirim permintaan lewat ${makeLink('feedback.html', 'Feedback')}.`, { tone: 'info', page });
		}

		// ── Export / Import / Backup ──────────────────────────────────────────
		if (matchesAny(text, [/(export|import|backup|data progress|pindah data|restore data|simpan data|ekspor|impor)/i])) {
			return humanizeReply(createInfoList('Cara backup dan transfer data progres Anda:', [
				`Di beranda, buka bagian <strong>Smart Tools</strong> → klik <strong>Export JSON</strong>`,
				'File JSON akan diunduh otomatis ke perangkat Anda',
				'Untuk memindahkan data, buka halaman tujuan → Smart Tools → <strong>Import JSON</strong>',
				'Pastikan file JSON yang diimpor berasal dari akun yang sama'
			], '⚠️ Selalu backup sebelum berganti browser, membersihkan cache, atau reset perangkat.'), { tone: 'info', page });
		}

		// ── Hapus / Reset data ────────────────────────────────────────────────
		if (matchesAny(text, [/(hapus data|reset data|mulai dari awal|kosongkan progress|bersihkan data)/i])) {
			return humanizeReply(createInfoList('⚠️ Jika ingin mulai dari awal — lakukan hati-hati:', [
				'Backup dulu semua data dengan Export JSON sebelum menghapus apapun',
				'Pastikan Anda yakin 100% karena data lokal tidak bisa dipulihkan tanpa backup',
				'Reset hanya data yang memang tidak diperlukan lagi',
				`Kalau ragu, minta panduan dari admin lewat ${makeLink('feedback.html', 'Feedback')} sebelum bertindak`
			]), { tone: 'issue', page });
		}

		// ── Data hilang ───────────────────────────────────────────────────────
		if (matchesAny(text, [/(data hilang|progress hilang|skor hilang|bintang hilang|data terhapus)/i])) {
			return humanizeReply(createInfoList('Data terasa hilang — langkah pemulihan:', [
				'1. Pastikan Anda membuka browser dan perangkat yang <strong>sama</strong>',
				'2. Cek status: masih mode tamu atau sudah login?',
				'3. Cek apakah cache browser baru-baru ini dibersihkan (data lokal ikut terhapus)',
				`4. Jika pernah export data, gunakan <strong>Import JSON</strong> untuk memulihkan`,
				`5. Kalau belum berhasil, laporkan detail lewat ${makeLink('feedback.html', 'Feedback')}`
			], '💡 Untuk mencegah ini di masa depan, lakukan Export JSON secara berkala sebagai backup.'), { tone: 'issue', page });
		}

		// ── Sidebar / Menu ────────────────────────────────────────────────────
		if (matchesAny(text, [/(sidebar|menu|hamburger|tertutup|terbuka|menu samping|buka menu|tutup menu)/i])) {
			return humanizeReply(createInfoList('Cara menggunakan menu/sidebar:', [
				'Klik ikon ☰ di pojok kiri atas untuk membuka sidebar',
				'Di HP, tap ✕ atau area gelap di luar sidebar untuk menutupnya',
				'Sidebar berisi navigasi halaman, toggle tema, musik, dan Quick Notes',
				'Di Android, sidebar sudah dioptimasi agar tidak geser melebihi layar'
			]), { tone: 'info', page });
		}

		// ── Bug / Error / Loading ─────────────────────────────────────────────
		if (matchesAny(text, [/(bug|error|gagal|tidak bisa|blank|macet|loading|load lama|bermasalah|lemot|lambat|aplikasi hang)/i])) {
			return humanizeReply(createInfoList('Langkah mengatasi kendala teknis:', [
				'1. <strong>Refresh halaman</strong> — biasanya menyelesaikan 70% masalah loading',
				'2. Tutup dan buka kembali tab browser',
				'3. Coba gunakan mode Incognito/Private untuk menguji tanpa extension',
				'4. Jika masih sama, catat nama halaman, browser, perangkat, dan langkah sebelum error',
				`5. Kirim laporan lengkap lewat ${makeLink('feedback.html', 'Feedback')}`
			], 'Semakin detail laporan Anda, semakin cepat admin dapat membantu!'), { tone: 'issue', page });
		}

		// ── Elemen tidak muncul ──────────────────────────────────────────────
		if (matchesAny(text, [/(tidak muncul|nggak muncul|tidak tampil|tombol hilang|fitur hilang|tidak kelihatan)/i])) {
			return humanizeReply(createInfoList('Elemen tidak muncul — hal yang bisa dicoba:', [
				'Refresh halaman terlebih dahulu',
				'Cek zoom browser — level zoom yang tidak standar bisa memengaruhi tampilan',
				'Nonaktifkan sementara extension/adblock jika ada',
				`Kalau masih tidak muncul, sebutkan nama halaman dan fitur yang hilang lewat ${makeLink('feedback.html', 'Feedback')}`
			]), { tone: 'issue', page });
		}

		// ── Link rusak / 404 ─────────────────────────────────────────────────
		if (matchesAny(text, [/(404|halaman tidak ditemukan|link rusak|tautan rusak|halaman error)/i])) {
			return humanizeReply(`Jika ada link yang menuju halaman kosong atau error 404, laporkan lewat ${makeLink('feedback.html', 'Feedback')} beserta nama halaman asal dan link yang diklik. Admin akan memeriksa dan memperbaikinya.`, { tone: 'issue', page });
		}

		// ── Perangkat / Platform ─────────────────────────────────────────────
		if (matchesAny(text, [/(android|iphone|ios|desktop|laptop|mobile|hp|tablet|chromebook)/i])) {
			return humanizeReply(createInfoList('Kompatibilitas QuizNation di berbagai perangkat:', [
				'<strong>Desktop/Laptop</strong> — tampilan penuh dengan sidebar dan semua fitur',
				'<strong>Mobile/HP</strong> — tampilan responsif dengan sidebar yang bisa digeser',
				'<strong>Tablet</strong> — disesuaikan antara tampilan mobile dan desktop',
				'Untuk hasil terbaik gunakan browser modern (Chrome 80+, Edge, Firefox)'
			], 'Jika ada tampilan yang terasa aneh di perangkat tertentu, sebutkan nama halaman dan jenis perangkatnya ya.'), { tone: 'info', page });
		}

		// ── Browser ───────────────────────────────────────────────────────────
		if (matchesAny(text, [/(browser|chrome|edge|firefox|safari|opera|brave)/i])) {
			return humanizeReply(createInfoList('Kompatibilitas browser QuizNation:', [
				'✅ <strong>Chrome 80+</strong> — direkomendasikan untuk performa terbaik',
				'✅ <strong>Microsoft Edge</strong> — kompatibel penuh',
				'✅ <strong>Firefox</strong> — kompatibel dengan sebagian besar fitur',
				'⚠️ <strong>Safari</strong> — pada umumnya oke, tapi audio/localStorage bisa berperilaku beda',
				'⚠️ <strong>Browser lama</strong> — beberapa fitur mungkin tidak tersedia'
			], 'Jika ada kendala di browser tertentu, sebutkan nama dan versinya saat menghubungi admin.'), { tone: 'info', page });
		}

		// ── Hubungi / Admin / CS ──────────────────────────────────────────────
		if (matchesAny(text, [/(kontak|hubungi|customer service|cs|admin|feedback|melaporkan|lapor|saran|kritik)/i])) {
			return humanizeReply(createInfoList('Cara menghubungi tim QuizNation:', [
				`Buka ${makeLink('feedback.html', 'halaman Feedback')}`,
				'Jelaskan nama halaman dan masalah yang dialami secara singkat',
				'Sertakan jenis perangkat dan browser jika berkaitan dengan bug',
				'Admin biasanya merespons dalam 1–2 hari kerja'
			], 'Semakin lengkap informasi yang Anda kirim, semakin cepat penanganannya.'), { tone: 'warm', page });
		}

		// ── Jadwal SNBT / UTBK ────────────────────────────────────────────────
		if (matchesAny(text, [/(jadwal|utbk|tanggal snbt|snbt 2026|kapan utbk|jadwal ujian)/i])) {
			return humanizeReply(createInfoList('Info jadwal SNBT/UTBK 2026:', [
				'📅 Pendaftaran: hingga <strong>7 April 2026</strong>',
				'💳 Pembayaran: hingga <strong>8 April 2026</strong>',
				'📝 Pelaksanaan UTBK: <strong>21–30 April 2026</strong>',
				'📢 Pengumuman hasil: <strong>25 Mei 2026</strong>'
			], `Gunakan waktu yang tersisa seefisien mungkin. Mau saya bantu buatkan ${makeLink('#', 'rencana belajar SNBT')} sesuai timeline ini?`), { tone: 'info', page });
		}

		// ── Passing grade / Universitas ────────────────────────────────────────
		if (matchesAny(text, [/(passing grade|universitas|kampus|ui|itb|ugm|unpad|telkom|undip|its|unair)/i])) {
			return humanizeReply(createInfoList('Informasi passing grade kampus:', [
				'Tersedia di bagian SNBT di beranda — gunakan dropdown universitas',
				'Pilih nama kampus untuk melihat estimasi nilai lolos tiap prodi',
				'Nilai passing grade berubah tiap tahun — gunakan sebagai estimasi, bukan patokan pasti'
			], `Info lebih lanjut bisa dicek di ${makeLink('snbt.html', 'halaman SNBT')}.`), { tone: 'info', page });
		}

		// ── Jurusan / Prodi ───────────────────────────────────────────────────
		if (matchesAny(text, [/(jurusan|prodi|pilihan kampus|kampus mana|fakultas|program studi)/i])) {
			return humanizeReply(`Untuk eksplorasi kampus dan jurusan, lihat bagian <strong>Passing Grade SNBT</strong> di beranda. Anda bisa membandingkan beberapa kampus populer melalui dropdown universitas yang tersedia, termasuk estimasi nilai yang dibutuhkan tiap prodinya.`, { tone: 'info', page });
		}

		// ── Biaya / Premium ───────────────────────────────────────────────────
		if (matchesAny(text, [/(gratis|biaya|bayar|harga|premium|langganan|berbayar)/i])) {
			return humanizeReply('QuizNation saat ini fokus sebagai platform belajar gratis 🎉 Semua fitur utama — materi, evaluasi, statistik, library, dan Smart Tools — dapat digunakan tanpa biaya apapun.', { tone: 'info', page });
		}

		// ── Identitas bot ─────────────────────────────────────────────────────
		if (matchesAny(text, [/(siapa kamu|siapa anda|siapa dirimu|ini bot apa|kamu itu apa|tentang kamu)/i])) {
			return humanizeReply(`Saya adalah <strong>${BOT_NAME}</strong> — asisten virtual QuizNation yang siap membantu 24/7. Saya bisa bantu navigasi halaman, memahami fitur, memantau progres, memberikan rekomendasi belajar, dan mengarahkan Anda saat ada kendala. Saya tidak terhubung ke internet; semua jawaban saya berdasarkan sistem QuizNation ini.`, { tone: 'warm', page });
		}

		// ── Motivasi / Semangat ───────────────────────────────────────────────
		if (matchesAny(text, [/(semangat|motivasi|capek belajar|bosan belajar|jenuh|lelah|males|malas|tidak semangat)/i])) {
			const msgs = [
				'Wajar kok kalau sesekali capek 😊 Coba istirahat sebentar, lalu mulai dengan 1 sesi pomodoro pendek — sering kali momentum datang setelah dimulai.',
				'Belajar maraton memang melelahkan. Coba pendekatan berbeda: satu topik kecil per hari, konsisten selama seminggu — hasilnya mengejutkan!',
				'Jenuh itu tanda otak butuh variasi 💡 Coba ganti topik atau mode belajar — misalnya dari membaca materi ke latihan soal — agar lebih segar.'
			];
			return humanizeReply(msgs[Math.floor(Math.random() * msgs.length)], { tone: 'warm', page });
		}

		// ── Terima kasih ──────────────────────────────────────────────────────
		if (matchesAny(text, [/(terima kasih|makasih|thanks|thank you|thx|arigatou)/i])) {
			const replies = [
				`Sama-sama 😊 Semoga belajarnya makin lancar! Kalau ada pertanyaan lain, saya selalu di sini.`,
				`Dengan senang hati! Semangat terus ya — setiap sesi belajar adalah investasi buat masa depan Anda 🌟`,
				`Senang bisa bantu! Jangan ragu balik lagi kalau ada yang ingin ditanyakan lebih lanjut.`
			];
			return humanizeReply(replies[Math.floor(Math.random() * replies.length)], { tone: 'warm', page });
		}

		// ── Badge / Pencapaian / Achievement ─────────────────────────────────
		if (matchesAny(text, [/(badge|pencapaian|achievement|penghargaan|lencana|tanda prestasi)/i])) {
			return humanizeReply(createInfoList('Sistem badge dan pencapaian QuizNation:', [
				`Buka ${makeLink('pencapaian.html', 'Pencapaian')} untuk melihat semua badge yang tersedia`,
				'Badge diberikan berdasarkan milestone: skor tertentu, streak, dan evaluasi selesai',
				'Beberapa badge eksklusif hanya tersedia di periode atau event tertentu',
				`Skor saat ini: <strong>${scoreText}</strong>, bintang: <strong>${starsText}</strong>`
			], 'Terus belajar dan skor Anda akan membuka lebih banyak pencapaian otomatis!'), { tone: 'info', page });
		}

		// ── Notifikasi ────────────────────────────────────────────────────────
		if (matchesAny(text, [/(notifikasi|notification|pengingat|reminder|pemberitahuan)/i])) {
			return humanizeReply(`Saat ini QuizNation berjalan sebagai web app dan tidak mengirim push notifikasi ke perangkat. Untuk pengingat belajar, Anda bisa set alarm manual atau gunakan fitur pomodoro yang ada di dalam aplikasi. Keinginan fitur notifikasi bisa disarankan lewat ${makeLink('feedback.html', 'Feedback')}.`, { tone: 'info', page });
		}

		// ── Dark mode / Aksesibilitas ─────────────────────────────────────────
		if (matchesAny(text, [/(aksesibilitas|accessibility|buta warna|kontras|ukuran font|besar tulisan)/i])) {
			return humanizeReply(createInfoList('Pengaturan tampilan dan aksesibilitas:', [
				'Gunakan toggle tema (gelap ↔ terang) untuk kontras yang lebih nyaman',
				'Zoom browser bisa digunakan untuk memperbesar teks (Ctrl + +)',
				'Dark mode memberikan kontras yang biasanya lebih nyaman di malam hari'
			], `Untuk saran aksesibilitas spesifik, kirim masukan lewat ${makeLink('feedback.html', 'Feedback')} — tim akan mempertimbangkannya.`), { tone: 'info', page });
		}

		// ── Catatan / Notes ───────────────────────────────────────────────────
		if (matchesAny(text, [/(catatan|notes|quick notes|catat|memo)/i])) {
			return humanizeReply(`Fitur <strong>Quick Notes</strong> tersedia di sidebar QuizNation. Gunakan untuk mencatat poin penting selama belajar tanpa harus keluar halaman. Catatan disimpan lokal di browser dan tidak akan hilang selama Anda tidak membersihkan data browser.`, { tone: 'info', page });
		}

		// ── Share / Bagikan ───────────────────────────────────────────────────
		if (matchesAny(text, [/(bagikan|share|kirim ke teman|rekomendasikan)/i])) {
			return humanizeReply(`Senang kalau QuizNation mau dibagikan! Salin saja URL halaman ini lalu kirim ke teman atau bagikan di media sosial. Tidak ada fitur invite khusus saat ini, tapi cara termudah tetap copy link halaman.`, { tone: 'warm', page });
		}

		// ── Offline ───────────────────────────────────────────────────────────
		if (matchesAny(text, [/(offline|tanpa internet|tanpa koneksi|tidak ada internet|mode offline)/i])) {
			return humanizeReply(createInfoList('QuizNation dan akses offline:', [
				'QuizNation adalah web app yang memerlukan koneksi untuk loading halaman pertama',
				'Setelah halaman terbuka, sebagian besar fitur bisa digunakan meskipun koneksi terputus',
				'Data progres tersimpan lokal — aman meski koneksi tidak stabil',
				'Pencarian materi dinamis memerlukan koneksi internet untuk hasil terbaik'
			], 'Untuk pengalaman terbaik, gunakan dengan koneksi internet yang stabil.'), { tone: 'info', page });
		}

		// ── Bahasa Indonesia / Teks bahasa ────────────────────────────────────
		if (matchesAny(text, [/(bahasa indonesia|ejaan|tanda baca|kalimat efektif|paragraf|menulis)/i])) {
			return humanizeReply(createInfoList('Materi Bahasa Indonesia di Library:', [
				`<strong>Ejaan & Tanda Baca</strong> — ${makeLink('lib-ejaan-tanda-baca.html', 'buka materi')}`,
				`<strong>Kalimat Efektif</strong> — ${makeLink('lib-kalimat-efektif.html', 'buka materi')}`,
				`<strong>Ringkasan & Parafrase</strong> — ${makeLink('lib-ringkasan-parafrase.html', 'buka materi')}`,
				`<strong>Struktur Teks & Referensi</strong> — ${makeLink('lib-text-structure-reference.html', 'buka materi')}`,
				`<strong>Memahami Teks</strong> — ${makeLink('lib-memahami-teks.html', 'buka materi')}`
			], `Semua tersedia di ${makeLink('library.html', 'Library')} tanpa perlu pencarian manual.`), { tone: 'info', page });
		}

		// ── Info tenses / Grammar spesifik ────────────────────────────────────
		if (matchesAny(text, [/(tenses|past tense|present tense|future|perfect|continuous|passive voice|direct indirect|modal)/i])) {
			return humanizeReply(createInfoList('Materi Grammar Bahasa Inggris spesifik:', [
				`<strong>Tenses</strong> — ${makeLink('tenses.html', 'halaman Tenses')}`,
				`<strong>Passive Voice</strong> — ${makeLink('materi-passive-voice.html', 'Passive Voice')}`,
				`<strong>Modal Verbs</strong> — ${makeLink('materi-modal-verbs.html', 'Modal Verbs')}`,
				`<strong>Direct & Indirect Speech</strong> — ${makeLink('materi-direct-indirect-speech.html', 'Direct Indirect Speech')}`,
				`<strong>Adjectives & Adverbs</strong> — ${makeLink('materi-adjectives-adverbs.html', 'Adjectives Adverbs')}`
			], `Butuh yang lain? Ketik <em>carikan materi tentang [topik]</em> dan saya bantu temukan 📖`), { tone: 'info', page });
		}

		// ── Default fallback ─────────────────────────────────────────────────
		return humanizeReply(createPageFallback(page), { tone: 'page', page });
	}

	// NEW FEATURE 7: Smart auto-suggest data
	const SUGGEST_PROMPTS = [
		'Cara login atau daftar akun',
		'Carikan materi tentang grammar',
		'Carikan materi tentang tenses',
		'Carikan materi tentang penalaran logis',
		'Carikan materi tentang passive voice',
		'Carikan materi tentang aritmatika',
		'Carikan materi tentang geometri',
		'Carikan materi tentang kalimat efektif',
		'Bagaimana cara melihat progres saya?',
		'Buatkan rencana belajar 7 hari',
		'Rekomendasi belajar personal untuk saya',
		'Strategi cepat mengerjakan SNBT',
		'Tips meningkatkan akurasi jawaban',
		'Bagaimana cara menaikkan skor?',
		'Skor dan bintang saya sekarang berapa?',
		'Tips belajar efektif setiap hari',
		'Hari ini enaknya belajar apa?',
		'Data saya hilang, apa yang harus saya lakukan?',
		'Apa saja fitur utama QuizNation?',
		'Bagaimana cara memakai mode fokus dan pomodoro?',
		'Bagaimana cara export dan import data?',
		'Mode tamu vs login, apa bedanya?',
		'Jadwal SNBT 2026 kapan?',
		'Universitas mana yang passing grade-nya paling rendah?',
		'Bagaimana cara menghubungi admin?',
		'Ada bug, bagaimana cara melaporkan?',
		'Bagaimana cara ganti tema gelap atau terang?',
		'Cara menjaga streak harian tetap berjalan?',
		'Cara baca statistik dan progres QuizNation?',
		'Apa bedanya Materi dan Library?'
	];

	function getAutoSuggest(query) {
		const q = normalizeText(query);
		if (!q || q.length < 2) return [];
		return SUGGEST_PROMPTS.filter(p => normalizeText(p).includes(q)).slice(0, 5);
	}

	// NEW FEATURE 8: Voice input (speech recognition)
	let recognition = null;
	function startVoiceInput() {
		if (!voiceAvailable) {
			alert('Browser Anda tidak mendukung input suara.');
			return;
		}
		const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
		recognition = new SpeechRec();
		recognition.lang = 'id-ID';
		recognition.interimResults = false;
		recognition.maxAlternatives = 1;
		const voiceBtn = document.getElementById('qnVoiceBtn');
		function stopVoice() {
			if (voiceBtn) voiceBtn.classList.remove('listening');
			recognition && recognition.stop();
		}
		recognition.onstart = () => voiceBtn && voiceBtn.classList.add('listening');
		recognition.onresult = (evt) => {
			const transcript = evt.results[0][0].transcript;
			if (els.input) els.input.value = transcript;
			stopVoice();
			sendMessage(transcript);
		};
		recognition.onerror = stopVoice;
		recognition.onend = stopVoice;
		recognition.start();
	}

	function openChatbot() {
		if (!els.panel || !els.backdrop) return;

		els.panel.classList.add('active');
		els.backdrop.classList.add('active');
		els.panel.setAttribute('aria-hidden', 'false');
		if (els.launcher) els.launcher.setAttribute('aria-expanded', 'true');
		document.body.classList.add('qn-chatbot-open');
		setFabBadge(0);

		if (typeof window.__quizNationCloseSidebar === 'function' && window.matchMedia('(max-width: 1024px)').matches) {
			window.__quizNationCloseSidebar();
		}

		window.setTimeout(() => {
			if (els.input) els.input.focus();
		}, 80);
	}

	function closeChatbot() {
		if (!els.panel || !els.backdrop) return;

		clearTypingIndicator();
		els.panel.classList.remove('active');
		els.backdrop.classList.remove('active');
		els.panel.setAttribute('aria-hidden', 'true');
		if (els.launcher) els.launcher.setAttribute('aria-expanded', 'false');
		document.body.classList.remove('qn-chatbot-open');
	}

	function toggleChatbot(forceOpen) {
		if (typeof forceOpen === 'boolean') {
			if (forceOpen) openChatbot();
			else closeChatbot();
			return;
		}

		if (els.panel && els.panel.classList.contains('active')) {
			closeChatbot();
		} else {
			openChatbot();
		}
	}

	function sendMessage(rawText) {
		const text = String(rawText || '').trim();
		if (!text) return;

		renderMessage('user', text, false, true);
		if (els.input) els.input.value = '';

		clearTypingIndicator();
		showTypingIndicator();
		window.clearTimeout(state.typingTimer);
		state.typingTimer = window.setTimeout(async () => {
			try {
				const reply = await Promise.resolve(getBotReply(text));
				clearTypingIndicator();
				renderMessage('bot', reply, true, true);
			} catch (error) {
				clearTypingIndicator();
				renderMessage('bot', humanizeReply('Maaf, pencarian tadi belum sempat selesai dengan baik. Coba ulangi dengan kata kunci yang lebih singkat ya.', { tone: 'issue', page: getCurrentPage() }), true, true);
			}
		}, Math.min(900, 280 + (text.length * 12)));
	}

	function clearConversation() {
		if (!window.confirm('Hapus percakapan chatbot ini?')) return;
		saveHistory([]);
		if (els.messages) els.messages.innerHTML = '';
		renderMessage('bot', getWelcomeMessage(), true, true);
		setFabBadge(0);
	}

	function ensureHistory() {
		const history = loadHistory();
		if (history.length) {
			history.forEach((item) => {
				renderMessage(item.role || 'bot', item.content || '', !!item.isHtml, false, { time: item.time });
			});
			setFabBadge(0);
			return;
		}

		renderMessage('bot', getWelcomeMessage(), true, true);
		setFabBadge(1);
	}

	function injectSidebarButtons() {
		const sidebars = Array.from(document.querySelectorAll('.sidebar, nav.sidebar, aside.sidebar, #sidebar'));
		const uniqueSidebars = sidebars.filter((node, index, list) => node && list.indexOf(node) === index);

		uniqueSidebars.forEach((sidebar) => {
			if (!sidebar || sidebar.querySelector('.qn-chatbot-inline')) return;

			const container = sidebar.querySelector('.sidebar-body')
				|| sidebar.querySelector('.sidebar-menu:last-of-type')
				|| sidebar;

			const wrap = document.createElement('div');
			wrap.className = 'qn-chatbot-inline';
			wrap.innerHTML = `
				<button type="button" class="qn-chatbot-sidebar-btn" aria-label="Buka customer service chatbot">
					<span class="qn-chatbot-btn-icon">💬</span>
					<span>Chat Customer Service</span>
				</button>
				<p class="qn-chatbot-inline-note">Tanya akun, progres, error, atau cara memakai fitur QuizNation langsung dari sini.</p>
			`;

			container.appendChild(wrap);
		});
	}

	function buildWidget() {
		if (document.getElementById('qnChatbotPanel')) return;

		const backdrop = document.createElement('div');
		backdrop.className = 'qn-chatbot-backdrop';
		backdrop.id = 'qnChatbotBackdrop';
		backdrop.setAttribute('aria-hidden', 'true');

		const panel = document.createElement('section');
		panel.className = 'qn-chatbot-panel';
		panel.id = 'qnChatbotPanel';
		panel.setAttribute('role', 'dialog');
		panel.setAttribute('aria-hidden', 'true');
		panel.setAttribute('aria-label', 'Chatbot customer service QuizNation');
		panel.innerHTML = `
			<div class="qn-chatbot-header">
				<div class="qn-chatbot-title-wrap">
					<div class="qn-chatbot-avatar">🤖</div>
					<div>
						<p class="qn-chatbot-title">${BOT_NAME}</p>
						<div class="qn-chatbot-status">🟢 Online • bantuan cepat <span class="qn-chatbot-timer" id="qnChatbotTimer">00:00</span></div>
					</div>
				</div>
				<div class="qn-chatbot-actions">
					<button type="button" class="qn-chatbot-sound-btn" id="qnSoundBtn" title="Nyala/matikan suara">🔇</button>
					<button type="button" class="qn-export-btn" id="qnExportBtn" title="Ekspor chat" aria-label="Ekspor percakapan">⬇️</button>
					<button type="button" class="qn-chatbot-min" id="qnChatbotMin" title="Perkecil" aria-label="Minimalkan chatbot">─</button>
					<button type="button" class="qn-chatbot-clear" id="qnChatbotClear" aria-label="Reset percakapan">↺</button>
					<button type="button" class="qn-chatbot-close" aria-label="Tutup chatbot">✕</button>
				</div>
			</div>
			<div class="qn-chatbot-messages" id="qnChatbotMessages"></div>
			<div class="qn-chatbot-quick-actions" id="qnChatbotQuickActions"></div>
			<div id="qnSuggestList" class="qn-suggest-list"></div>
			<div class="qn-chatbot-footer">
				<div class="qn-chatbot-input-row">
					${voiceAvailable ? `<button type="button" class="qn-voice-btn" id="qnVoiceBtn" title="Input suara" aria-label="Input suara">🎙️</button>` : ''}
					<input type="text" class="qn-chatbot-input" id="qnChatbotInput" placeholder="Tulis pertanyaan atau ketik /help..." maxlength="240" autocomplete="off" />
					<button type="button" class="qn-chatbot-send" id="qnChatbotSend">Kirim</button>
				</div>
			</div>
		`;

		const launcher = document.createElement('button');
		launcher.type = 'button';
		launcher.className = 'qn-chatbot-fab';
		launcher.id = 'qnChatbotFab';
		launcher.setAttribute('aria-label', 'Buka chatbot customer service');
		launcher.textContent = '💬';

		document.body.appendChild(backdrop);
		document.body.appendChild(panel);
		document.body.appendChild(launcher);

		els.backdrop = backdrop;
		els.panel = panel;
		els.messages = panel.querySelector('#qnChatbotMessages');
		els.quickActions = panel.querySelector('#qnChatbotQuickActions');
		els.input = panel.querySelector('#qnChatbotInput');
		els.send = panel.querySelector('#qnChatbotSend');
		els.close = panel.querySelector('.qn-chatbot-close');
		els.clear = panel.querySelector('#qnChatbotClear');
		els.launcher = launcher;
		els.suggestList = panel.querySelector('#qnSuggestList');
		els.soundBtn = panel.querySelector('#qnSoundBtn');
		els.exportBtn = panel.querySelector('#qnExportBtn');
		els.minBtn = panel.querySelector('#qnChatbotMin');
		els.voiceBtn = voiceAvailable ? panel.querySelector('#qnVoiceBtn') : null;
	}

	function renderQuickActions() {
		if (!els.quickActions) return;
		els.quickActions.innerHTML = '';

		getDynamicQuickActions().forEach((item) => {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'qn-chatbot-chip';
			button.textContent = item.label;
			button.dataset.prompt = item.prompt;
			els.quickActions.appendChild(button);
		});
	}

	function bindEvents() {
		if (els.launcher) {
			els.launcher.addEventListener('click', () => toggleChatbot(true));
		}

		if (els.close) {
			els.close.addEventListener('click', closeChatbot);
		}

		if (els.clear) {
			els.clear.addEventListener('click', clearConversation);
		}

		if (els.backdrop) {
			els.backdrop.addEventListener('click', closeChatbot);
		}

		if (els.send) {
			els.send.addEventListener('click', () => sendMessage(els.input && els.input.value));
		}

		if (els.input) {
			els.input.addEventListener('keydown', (event) => {
				if (event.key === 'Enter' && !event.shiftKey) {
					event.preventDefault();
					hideSuggest();
					sendMessage(els.input.value);
				}
				if (event.key === 'Escape') hideSuggest();
			});

			// NEW FEATURE 9: Auto-suggest dropdown
			els.input.addEventListener('input', () => {
				const val = els.input.value.trim();
				const suggestions = getAutoSuggest(val);
				if (suggestions.length && val.length >= 2) {
					showSuggest(suggestions);
				} else {
					hideSuggest();
				}
			});
		}

		if (els.quickActions) {
			els.quickActions.addEventListener('click', (event) => {
				const chip = event.target.closest('.qn-chatbot-chip');
				if (!chip) return;
				sendMessage(chip.dataset.prompt || chip.textContent || 'Bantuan');
			});
		}

		// Suggest list click
		if (els.suggestList) {
			els.suggestList.addEventListener('click', (event) => {
				const item = event.target.closest('.qn-suggest-item');
				if (!item) return;
				if (els.input) els.input.value = item.textContent;
				hideSuggest();
				sendMessage(item.textContent);
			});
		}

		// NEW FEATURE 10: Minimize toggle
		if (els.minBtn) {
			els.minBtn.addEventListener('click', () => {
				state.minimized = !state.minimized;
				els.panel.classList.toggle('minimized', state.minimized);
				els.minBtn.textContent = state.minimized ? '□' : '─';
				els.minBtn.title = state.minimized ? 'Perbesar' : 'Perkecil';
			});
		}

		// Sound toggle (Feature 5 control)
		if (els.soundBtn) {
			const prefs = loadPrefs();
			state.soundEnabled = !!prefs.soundEnabled;
			els.soundBtn.textContent = state.soundEnabled ? '🔔' : '🔇';
			els.soundBtn.addEventListener('click', () => {
				state.soundEnabled = !state.soundEnabled;
				els.soundBtn.textContent = state.soundEnabled ? '🔔' : '🔇';
				savePrefs({ soundEnabled: state.soundEnabled });
			});
		}

		// Export button (Feature 2)
		if (els.exportBtn) {
			els.exportBtn.addEventListener('click', exportChatHistory);
		}

		// Voice input (Feature 8)
		if (els.voiceBtn) {
			els.voiceBtn.addEventListener('click', startVoiceInput);
		}

		document.addEventListener('click', (event) => {
			const trigger = event.target.closest('.qn-chatbot-sidebar-btn');
			if (!trigger) return;
			event.preventDefault();
			toggleChatbot(true);
		});

		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape' && els.panel && els.panel.classList.contains('active')) {
				if (els.suggestList && els.suggestList.classList.contains('visible')) {
					hideSuggest();
				} else {
					closeChatbot();
				}
			}
		});
	}

	function showSuggest(suggestions) {
		if (!els.suggestList) return;
		els.suggestList.innerHTML = suggestions.map(s => `<div class="qn-suggest-item">${escapeHtml(s)}</div>`).join('');
		els.suggestList.classList.add('visible');
		// reposition above footer
		const footer = els.panel && els.panel.querySelector('.qn-chatbot-footer');
		if (footer) {
			els.suggestList.style.bottom = (footer.offsetHeight + 6) + 'px';
		}
	}

	function hideSuggest() {
		if (els.suggestList) els.suggestList.classList.remove('visible');
	}

	function init() {
		injectStyles();
		buildWidget();
		renderQuickActions();
		ensureHistory();
		queueSidebarRefresh();
		bindEvents();
		startSessionTimer();

		window.setTimeout(queueSidebarRefresh, 260);
		window.setTimeout(queueSidebarRefresh, 900);

		if (document.body && 'MutationObserver' in window) {
			const observer = new MutationObserver(() => queueSidebarRefresh());
			observer.observe(document.body, { childList: true, subtree: true });
		}

		window.openQuizNationChatbot = openChatbot;
		window.closeQuizNationChatbot = closeChatbot;
		window.toggleQuizNationChatbot = toggleChatbot;
		window.exportQuizNationChat = exportChatHistory;
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init, { once: true });
	} else {
		init();
	}
})();
