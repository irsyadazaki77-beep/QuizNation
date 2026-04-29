(function () {
	const ua = navigator.userAgent || '';
	const isAndroid = /Android/i.test(ua);
	const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
	const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
	const lowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
	const reduceEffects = !!(isAndroid && (lowMemory || lowCpu));

	function readScreenState() {
		return {
			isSmallScreen: window.matchMedia('(max-width: 820px)').matches,
			isPhoneScreen: window.matchMedia('(max-width: 640px)').matches,
			isPortrait: window.matchMedia('(orientation: portrait)').matches
		};
	}

	function setDynamicVh() {
		const viewportHeight = window.visualViewport && typeof window.visualViewport.height === 'number'
			? window.visualViewport.height
			: window.innerHeight;
		const vh = viewportHeight * 0.01;
		document.documentElement.style.setProperty('--app-vh', vh + 'px');
	}

	function normalizeViewportMeta() {
		let vp = document.querySelector('meta[name="viewport"]');
		if (!vp) {
			vp = document.createElement('meta');
			vp.name = 'viewport';
			document.head.appendChild(vp);
		}
		vp.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
	}

	function ensureChatbotWidgetLoaded() {
		if (window.__quizNationChatbotInitialized || document.querySelector('script[data-quiznation-chatbot="true"]')) {
			return;
		}

		const script = document.createElement('script');
		script.src = 'chatbot-widget.js';
		script.defer = true;
		script.dataset.quiznationChatbot = 'true';
		document.head.appendChild(script);
	}

	function applyDeviceClasses() {
		const { isSmallScreen, isPhoneScreen, isPortrait } = readScreenState();
		if (!document.body) return;

		document.body.classList.toggle('is-android', isAndroid);
		document.body.classList.toggle('is-touch-device', isTouchDevice);
		document.body.classList.toggle('is-small-screen', isSmallScreen);
		document.body.classList.toggle('is-phone-screen', isPhoneScreen);
		document.body.classList.toggle('is-portrait', isPortrait);
		document.body.classList.toggle('android-lite', reduceEffects);

		window.__QUIZNATION_PERF__ = {
			isAndroid,
			isTouchDevice,
			isSmallScreen,
			isPhoneScreen,
			isPortrait,
			lowMemory,
			lowCpu,
			reduceEffects,
			disableDecorations: reduceEffects
		};
	}

	function applyGlobalPreferences() {
		try {
			// 1. Theme
			const themeMode = localStorage.getItem('themeMode');
			const savedTheme = localStorage.getItem('theme');
			let isDark = true; // default dark for index/snbt
			
			// Detect theme mode
			if (themeMode === 'light' || savedTheme === 'light') {
				isDark = false;
			} else if (themeMode === 'system') {
				isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
			} else if (themeMode === 'dark' || savedTheme === 'dark') {
				isDark = true;
			}

			// Apply all possible classes so it works across different pages
			if (document.body) {
				document.body.classList.toggle('dark-mode', isDark);
				document.body.classList.toggle('dark', isDark);
				document.body.classList.toggle('light-mode', !isDark);

				// 2. Animations
				const animsOn = localStorage.getItem('animations') !== 'false';
				document.body.classList.toggle('animations-on', animsOn);

				// 3. Reduce Motion
				const reduceMotion = localStorage.getItem('reduceMotion') === 'true';
				document.body.classList.toggle('reduce-motion', reduceMotion);
			}

			// 4. Font Size
			const fontSize = localStorage.getItem('fontSize');
			if (document.documentElement) {
				document.documentElement.classList.remove('font-small', 'font-large');
				if (fontSize === 'small') document.documentElement.classList.add('font-small');
				else if (fontSize === 'large') document.documentElement.classList.add('font-large');
			}

			// 5. Accent Color
			const savedAccent = localStorage.getItem('accentColor');
			if (savedAccent && document.documentElement) {
				try {
					const ac = JSON.parse(savedAccent);
					document.documentElement.style.setProperty('--accent', ac.c1);
					document.documentElement.style.setProperty('--accent1', ac.c1);
					document.documentElement.style.setProperty('--accent2', ac.c2);
					document.documentElement.style.setProperty('--accent3', ac.c3);
				} catch (e) {}
			}

			// 6. Init session timeout watcher
			initSessionTimeoutWatcher();
		} catch (e) {
			console.warn('Failed to apply global preferences:', e);
		}
	}
	window.__quizNationApplyGlobalPreferences = applyGlobalPreferences;

	let inactivityTimer = null;
	let sessionWatcherBound = false;
	function initSessionTimeoutWatcher() {
		if (inactivityTimer) clearTimeout(inactivityTimer);
		const secRaw = localStorage.getItem('sessionTimeout');
		if (!secRaw || secRaw === '0') return;
		const sec = parseInt(secRaw, 10);
		if (!sec) return;

		const resetTimer = () => {
			if (inactivityTimer) clearTimeout(inactivityTimer);
			inactivityTimer = setTimeout(() => {
				localStorage.setItem('isGuest', 'true');
				localStorage.removeItem('currentUser');
				// if not already on login
				if (!window.location.pathname.endsWith('login.html')) {
					alert('Sesi Anda telah berakhir karena tidak ada aktivitas.');
					window.location.href = 'login.html';
				}
			}, sec * 1000);
		};

		if (!sessionWatcherBound) {
			['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt => {
				document.addEventListener(evt, resetTimer, { passive: true });
			});
			sessionWatcherBound = true;
		}
		resetTimer();
	}

	function setupGlobalInteractionFixes() {
		const buttonLikeSelectors = '#hamburger, #hamburgerBtn, #ham, #menuBtn, .hamburger, .menu-btn, [role="button"]';

		document.querySelectorAll(buttonLikeSelectors).forEach(function (node) {
			if (!node) return;
			if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '0');
			if (!node.hasAttribute('role')) node.setAttribute('role', 'button');
		});

		document.querySelectorAll('.sidebar-backdrop, .sidebar-overlay, #sidebarBackdrop, #sidebarOverlay, #backdrop').forEach(function (node) {
			if (node && !node.hasAttribute('aria-hidden')) {
				node.setAttribute('aria-hidden', 'true');
			}
		});

		document.addEventListener('keydown', function (event) {
			if (event.key !== 'Enter' && event.key !== ' ') return;
			const target = event.target.closest(buttonLikeSelectors);
			if (!target) return;

			const tagName = target.tagName ? target.tagName.toLowerCase() : '';
			if (tagName === 'button' || tagName === 'a' || tagName === 'input') return;

			event.preventDefault();
			target.click();
		});

		document.addEventListener('click', function (event) {
			const anchor = event.target.closest('a[href^="#"]');
			if (!anchor) return;

			const hash = anchor.getAttribute('href');
			if (!hash || hash === '#' || hash.length < 2) return;

			const target = document.querySelector(hash);
			if (!target) return;

			window.requestAnimationFrame(function () {
				try {
					target.scrollIntoView({ behavior: 'smooth', block: 'start' });
				} catch (error) {
					target.scrollIntoView();
				}
			});
		});
	}

	function setupMobileSidebarFixes() {
		const sidebarSelectors = ['#sidebar', '.sidebar', 'nav.sidebar', 'aside.sidebar'];
		const backdropSelectors = ['#sidebarBackdrop', '#sidebarOverlay', '#backdrop', '.sidebar-backdrop', '.sidebar-overlay', '.backdrop'];
		const toggleSelectors = ['#hamburger', '#hamburgerBtn', '#ham', '#menuBtn', '.hamburger', '.menu-btn'];

		function uniqueNodes(selectors) {
			const seen = new Set();
			const nodes = [];
			selectors.forEach(function (selector) {
				document.querySelectorAll(selector).forEach(function (node) {
					if (!seen.has(node)) {
						seen.add(node);
						nodes.push(node);
					}
				});
			});
			return nodes;
		}

		function isMobileSidebarViewport() {
			return window.matchMedia('(max-width: 1024px), (hover: none) and (pointer: coarse)').matches;
		}

		function getSidebars() {
			return uniqueNodes(sidebarSelectors);
		}

		function getBackdrops() {
			return uniqueNodes(backdropSelectors);
		}

		function getToggles() {
			return uniqueNodes(toggleSelectors);
		}

		function clearForcedStyles(el, properties) {
			if (!el || !el.style) return;
			properties.forEach(function (property) {
				el.style.removeProperty(property);
			});
		}

		function isSidebarMarkedOpen(el) {
			if (!el || !el.classList) return false;
			return el.classList.contains('active')
				|| el.classList.contains('open')
				|| el.classList.contains('on')
				|| el.getAttribute('data-mobile-sidebar-state') === 'open';
		}

		function applySidebarStyles(el, isOpen) {
			if (!el) return;

			if (!isMobileSidebarViewport()) {
				clearForcedStyles(el, ['transform', 'visibility', 'pointer-events', 'inset', 'left', 'height', 'max-height', 'overflow-y', 'touch-action', '-webkit-overflow-scrolling']);
				el.removeAttribute('data-mobile-sidebar-state');
				return;
			}

			el.setAttribute('data-mobile-sidebar-state', isOpen ? 'open' : 'closed');
			el.style.setProperty('transform', isOpen ? 'translate3d(0, 0, 0)' : 'translate3d(calc(-100% - 18px), 0, 0)', 'important');
			el.style.setProperty('visibility', isOpen ? 'visible' : 'hidden', 'important');
			el.style.setProperty('pointer-events', isOpen ? 'auto' : 'none', 'important');
			el.style.setProperty('inset', '0 auto 0 0', 'important');
			el.style.setProperty('left', '0', 'important');
			el.style.setProperty('height', 'calc(var(--app-vh) * 100)', 'important');
			el.style.setProperty('max-height', 'calc(var(--app-vh) * 100)', 'important');
			el.style.setProperty('overflow-y', 'auto', 'important');
			el.style.setProperty('touch-action', 'pan-y', 'important');
			el.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important');
		}

		function applyBackdropStyles(el, isOpen) {
			if (!el) return;

			if (!isMobileSidebarViewport()) {
				clearForcedStyles(el, ['opacity', 'visibility', 'pointer-events']);
				el.removeAttribute('data-mobile-sidebar-state');
				return;
			}

			el.setAttribute('data-mobile-sidebar-state', isOpen ? 'open' : 'closed');
			el.style.setProperty('opacity', isOpen ? '1' : '0', 'important');
			el.style.setProperty('visibility', isOpen ? 'visible' : 'hidden', 'important');
			el.style.setProperty('pointer-events', isOpen ? 'auto' : 'none', 'important');
		}

		function setSidebarState(isOpen) {
			const sidebars = getSidebars();
			const backdrops = getBackdrops();
			const toggles = getToggles();

			sidebars.forEach(function (el) {
				el.classList.toggle('active', isOpen);
				el.classList.toggle('open', isOpen);
				el.classList.toggle('on', isOpen);
				el.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
				applySidebarStyles(el, isOpen);
			});

			backdrops.forEach(function (el) {
				el.classList.toggle('active', isOpen);
				el.classList.toggle('open', isOpen);
				el.classList.toggle('on', isOpen);
				applyBackdropStyles(el, isOpen);
			});

			toggles.forEach(function (el) {
				el.classList.toggle('sidebar-active', isOpen);
				el.classList.toggle('open', isOpen);
				if (el.hasAttribute('aria-expanded') || el.tagName === 'BUTTON') {
					el.setAttribute('aria-expanded', String(isOpen));
				}
			});

			if (document.body) {
				document.body.classList.toggle('sidebar-open', isOpen);
				document.body.classList.toggle('nav-open', isOpen);
			}

			try {
				localStorage.setItem('eval_snbt_sidebar_open', isOpen ? '1' : '0');
			} catch (error) {
				/* ignore storage issues */
			}

			return isOpen;
		}

		function getCurrentSidebarState() {
			return getSidebars().some(isSidebarMarkedOpen);
		}

		let sidebarCloseTimer = 0;

		function scheduleSidebarClose(delay) {
			window.clearTimeout(sidebarCloseTimer);
			sidebarCloseTimer = window.setTimeout(function () {
				closeSidebarSafely();
			}, typeof delay === 'number' ? delay : 0);
		}

		function closeSidebarSafely() {
			return setSidebarState(false);
		}

		function openSidebarSafely() {
			return setSidebarState(true);
		}

		function toggleSidebarSafely(forceOpen) {
			if (typeof forceOpen === 'boolean') {
				return setSidebarState(forceOpen);
			}
			return setSidebarState(!getCurrentSidebarState());
		}

		window.__quizNationCloseSidebar = closeSidebarSafely;
		window.__quizNationOpenSidebar = openSidebarSafely;
		window.__quizNationToggleSidebar = toggleSidebarSafely;

		function patchSidebarApi(apiName, fallbackHandler) {
			const original = typeof window[apiName] === 'function' ? window[apiName] : null;
			if (original && original.__quizNationPatched) return;

			const wrapped = function () {
				if (isMobileSidebarViewport()) {
					return fallbackHandler.apply(this, arguments);
				}

				if (original) {
					const result = original.apply(this, arguments);
					setSidebarState(getCurrentSidebarState());
					return result;
				}

				return fallbackHandler.apply(this, arguments);
			};

			wrapped.__quizNationPatched = true;
			window[apiName] = wrapped;
		}

		function patchSidebarApis() {
			patchSidebarApi('toggleSidebar', toggleSidebarSafely);
			patchSidebarApi('openSidebar', function () {
				return openSidebarSafely();
			});
			patchSidebarApi('closeSidebar', function () {
				return closeSidebarSafely();
			});
		}

		function handleDocumentInteraction(event) {
			const target = event.target;
			if (!target || !isMobileSidebarViewport()) return;

			if (target.closest('.sidebar-close, .sb-close, [data-sidebar-close="true"]')) {
				closeSidebarSafely();
				return;
			}

			if (target.closest('.sidebar a[href], nav.sidebar a[href], aside.sidebar a[href], .menu-item[href], .sb-item[href]')) {
				scheduleSidebarClose(120);
				return;
			}

			if (target.closest('.sidebar-backdrop, .sidebar-overlay, .backdrop, #sidebarBackdrop, #sidebarOverlay, #backdrop')) {
				closeSidebarSafely();
				return;
			}

			const clickedSidebar = target.closest('.sidebar, nav.sidebar, aside.sidebar, #sidebar');
			const clickedToggle = target.closest('#hamburger, #hamburgerBtn, #ham, #menuBtn, .hamburger, .menu-btn');

			if (getCurrentSidebarState() && !clickedSidebar && !clickedToggle) {
				closeSidebarSafely();
			}
		}

		patchSidebarApis();
		document.addEventListener('click', handleDocumentInteraction);
		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape') closeSidebarSafely();
		});

		if (isMobileSidebarViewport()) {
			closeSidebarSafely();
			requestAnimationFrame(function () {
				setSidebarState(false);
			});
		} else {
			setSidebarState(getCurrentSidebarState());
		}

		window.addEventListener('pageshow', function () {
			patchSidebarApis();
			if (isMobileSidebarViewport()) closeSidebarSafely();
		}, { passive: true });

		window.addEventListener('pagehide', function () {
			closeSidebarSafely();
		}, { passive: true });

		document.addEventListener('visibilitychange', function () {
			if (document.hidden) closeSidebarSafely();
		});
	}

	document.addEventListener('DOMContentLoaded', function () {
		applyGlobalPreferences();
		normalizeViewportMeta();
		ensureChatbotWidgetLoaded();
		setDynamicVh();
		applyDeviceClasses();
		setupGlobalInteractionFixes();
		setupMobileSidebarFixes();

		const refreshLayoutState = function () {
			setDynamicVh();
			applyDeviceClasses();
			if (window.__quizNationCloseSidebar && window.matchMedia('(max-width: 1024px), (hover: none) and (pointer: coarse)').matches) {
				window.__quizNationCloseSidebar();
			}
		};

		window.addEventListener('resize', refreshLayoutState, { passive: true });
		window.addEventListener('orientationchange', refreshLayoutState, { passive: true });

		if (window.visualViewport) {
			window.visualViewport.addEventListener('resize', refreshLayoutState, { passive: true });
			window.visualViewport.addEventListener('scroll', setDynamicVh, { passive: true });
		}

		document.querySelectorAll('img').forEach(function (img) {
			if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
			if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
		});

		document.querySelectorAll('iframe').forEach(function (frame) {
			if (!frame.hasAttribute('loading')) frame.setAttribute('loading', 'lazy');
		});

		document.querySelectorAll('audio').forEach(function (audio) {
			const preload = audio.getAttribute('preload');
			if (!preload || preload === 'auto') {
				audio.setAttribute('preload', 'metadata');
			}
		});
	});
})();
