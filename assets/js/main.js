/* ═══════════════════════════════════════════════════════════
   روان‌سرا — تعاملات و موشن
   ═══════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ارقام فارسی */
  const FA = '۰۱۲۳۴۵۶۷۸۹';
  const fa = n => String(n).replace(/\d/g, d => FA[d]);

  /* ─── پیش‌بارگذار ─── */
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-ready');
    }, reducedMotion ? 0 : 900);
  });
  /* محافظ: اگر load دیر شد */
  setTimeout(() => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
  }, 3200);

  /* ─── هدر + نوار پیشرفت + بازگشت به بالا ─── */
  const header = $('#siteHeader');
  const bar = $('#scrollBar');
  const toTop = $('#toTop');

  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 24);
    toTop?.classList.toggle('is-visible', y > 600);
    if (bar) {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

  /* ─── منوی موبایل ─── */
  const navToggle = $('#navToggle');
  const mobileMenu = $('#mobileMenu');
  if (navToggle && mobileMenu) {
    const closeMenu = () => {
      mobileMenu.hidden = true;
      navToggle.setAttribute('aria-expanded', 'false');
    };
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      mobileMenu.hidden = open;
      navToggle.setAttribute('aria-expanded', String(!open));
    });
    $$('#mobileMenu a').forEach(a => a.addEventListener('click', closeMenu));
  }

  /* ─── لینک فعال ناوبری ─── */
  const links = $$('.nav__link');
  const byId = Object.fromEntries(links.map(l => [l.getAttribute('href').slice(1), l]));
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('is-active'));
        byId[e.target.id]?.classList.add('is-active');
      }
    });
  }, { rootMargin: '-38% 0px -55% 0px' });
  Object.keys(byId).forEach(id => { const s = document.getElementById(id); if (s) navObserver.observe(s); });

  /* ─── ظاهرشدن هنگام اسکرول ─── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        e.target.style.setProperty('--d', `${Math.min(i * 70, 420)}ms`);
        e.target.classList.add('is-visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach(el => revealObserver.observe(el));

  /* ─── شمارنده‌ها ─── */
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      counterObserver.unobserve(e.target);
      const target = +e.target.dataset.counter;
      if (reducedMotion) { e.target.textContent = fa(target); return; }
      const t0 = performance.now(), dur = 1700;
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        e.target.textContent = fa(Math.round(target * eased).toLocaleString('en-US').replace(/,/g, '٬'));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-counter]').forEach(el => counterObserver.observe(el));

  /* ─── پارالاکس ملایم هیرو ─── */
  const heroVisual = $('[data-parallax]');
  if (heroVisual && !reducedMotion && matchMedia('(pointer:fine)').matches) {
    const frame = $('.hero__frame', heroVisual);
    const chipA = $('.hero__chip--a');
    const chipB = $('.hero__chip--b');
    let raf = null;
    $('.hero')?.addEventListener('mousemove', e => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = heroVisual.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        frame.style.translate = `${dx * 14}px ${dy * 14}px`;
        if (chipA) chipA.style.translate = `${dx * -10}px ${dy * -10}px`;
        if (chipB) chipB.style.translate = `${dx * 12}px ${dy * 12}px`;
        raf = null;
      });
    });
  }

  /* ─── تمرین تنفس ─── */
  const breathCard = $('#breathCard');
  const breathLabel = $('#breathLabel');
  const breathHint = $('#breathHint');
  const phases = [
    { text: 'دم بگیرید...', ms: 4000 },
    { text: 'نگه دارید...', ms: 2000 },
    { text: 'آرام بازدم...', ms: 4000 },
    { text: 'مکث. خوب است.', ms: 4000 },
  ];
  let breathTimers = [];
  const stopBreath = () => {
    breathTimers.forEach(clearTimeout); breathTimers = [];
    breathCard.classList.remove('is-active');
    breathLabel.textContent = 'یک نفس عمیق بکشید';
    breathHint.textContent = 'برای شروع لمس کنید';
  };
  const runCycle = () => {
    let t = 0;
    phases.forEach(p => {
      breathTimers.push(setTimeout(() => { breathLabel.textContent = p.text; }, t));
      t += p.ms;
    });
    breathTimers.push(setTimeout(runCycle, t));
  };
  breathCard?.addEventListener('click', () => {
    if (breathCard.classList.contains('is-active')) { stopBreath(); return; }
    breathCard.classList.add('is-active');
    breathHint.textContent = 'برای توقف لمس کنید';
    runCycle();
  });

  /* ─── اسلایدر نقل‌قول‌ها ─── */
  const slider = $('#testimonialSlider');
  if (slider) {
    const items = $$('.testimonial', slider);
    const dotsBox = $('#testimonialDots');
    let cur = 0, timer;
    items.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `نقل‌قول ${fa(i + 1)}`);
      b.addEventListener('click', () => { go(i); restart(); });
      dotsBox.appendChild(b);
    });
    const dots = $$('button', dotsBox);
    const go = i => {
      cur = (i + items.length) % items.length;
      items.forEach((it, k) => it.classList.toggle('is-active', k === cur));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === cur));
    };
    const restart = () => { clearInterval(timer); if (!reducedMotion) timer = setInterval(() => go(cur + 1), 6000); };
    go(0); restart();
  }

  /* ─── آکاردئون پرسش‌ها ─── */
  $$('#faqList .faq__item').forEach(item => {
    const q = $('.faq__q', item);
    q.addEventListener('click', () => {
      const open = item.classList.contains('is-open');
      $$('#faqList .faq__item').forEach(i => {
        i.classList.remove('is-open');
        $('.faq__q', i).setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('is-open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ═══════════ تست‌های خودسنجی ═══════════ */
  const OPTIONS = [
    { t: 'هیچ‌وقت', v: 0 },
    { t: 'چند روز', v: 1 },
    { t: 'بیش از نیمی از روزها', v: 2 },
    { t: 'تقریباً هر روز', v: 3 },
  ];

  const TESTS = {
    gad7: {
      name: 'سنجش اضطراب (GAD-7)',
      max: 21,
      questions: [
        'در دو هفتهٔ گذشته، چند بار احساس عصبی بودن، اضطراب یا بی‌قراری کرده‌اید؟',
        'در دو هفتهٔ گذشته، چند بار نتوانسته‌اید جلوی نگرانی یا فکر مداوم‌تان را بگیرید؟',
        'در دو هفتهٔ گذشته، چند بار بیش از حد درباره موضوعات مختلف نگران بوده‌اید؟',
        'در دو هفتهٔ گذشته، چند سخت بوده که آرام کنید و ریلکس شوید؟',
        'در دو هفتهٔ گذشته، چند بار بی‌قرار بوده‌اید و سخت بوده سر جایتان بمانید؟',
        'در دو هفتهٔ گذشته، چند بار آزاردهنده یا زودرنج شده‌اید؟',
        'در دو هفتهٔ گذشته، چند بار ترسیده‌اید که ناگهان اتفاق وحشتناکی بیفتد؟',
      ],
      bands: [
        { min: 0,  title: 'نشانه‌ای دیده نمی‌شود', text: 'امتیاز شما در محدودهٔ سالم است. مراقب خودتان باشید و این آرامش را به تمرین‌های روزانه تبدیل کنید — ذهن‌آگاهی چند دقیقه‌ای در روز نگهدارندهٔ همین حال خوب است.' },
        { min: 5,  title: 'نشانه‌های خفیف اضطراب', text: 'سطحی از نگرانی در زندگی‌تان حضور دارد. تمرین تنفس، کاهش کافئین و خواب منظم می‌تواند کمک‌کننده باشد. اگر چند هفته ادامه داشت، گفت‌وگو با یک متخصص ارزشمند است.' },
        { min: 10, title: 'نشانه‌های متوسط اضطراب', text: 'اضطراب به‌طور محسوس بر زندگی روزمره‌تان اثر گذاشته است. توصیه می‌کنیم با یک روان‌شناس صحبت کنید؛ درمان‌های کوتاه‌مدت و اثربخش برای این سطح وجود دارد.' },
        { min: 15, title: 'نشانه‌های شدید اضطراب', text: 'شدت نشانه‌ها بالاست و ادامهٔ این وضعیت به‌تنهایی دشوار است. لطفاً در اولین فرصت با یک متخصص سلامت روان مشورت کنید — این قدم، بزرگ‌ترین هدیه به خودتان است.' },
      ],
    },
    phq9: {
      name: 'سنجش خلق (PHQ-9)',
      max: 27,
      questions: [
        'در دو هفتهٔ گذشته، چند بار کمتر از قبل به کارها علاقه یا لذت داشته‌اید؟',
        'در دو هفتهٔ گذشته، چند بار احساس ناراحتی، افسردگی یا ناامیدی کرده‌اید؟',
        'در دو هفتهٔ گذشته، چند بار در خوابیدن، خواب عمیق یا بیش‌ازحد خواب‌آلود بودن مشکل داشته‌اید؟',
        'در دو هفتهٔ گذشته، چند بار احساس خستگی یا کم‌انرژی بودن کرده‌اید؟',
        'در دو هفتهٔ گذشته، چند بار اشتها یا وزن‌تان تغییر کرده است؟',
        'در دو هفتهٔ گذشته، چند بار احساس بدی درباره خودتان داشته‌اید یا فکر کرده‌اید شکست‌خورده‌اید؟',
        'در دو هفتهٔ گذشته، چند سخت بوده که روی کارها — مثل مطالعه یا کار — تمرکز کنید؟',
        'در دو هفتهٔ گذشته، چند بار حرکات‌تان کند بوده یا برعکس بی‌قرار و پرتحرک بوده‌اید؟',
        'در دو هفتهٔ گذشته، چند بار فکر کرده‌اید که بهتر بود مرده بودید یا آسیبی به خودتان می‌زدید؟',
      ],
      bands: [
        { min: 0,  title: 'خلق شما در محدودهٔ سالم است', text: 'امتیاز شما پایین است و نشانهٔ معناداری دیده نمی‌شود. همین روند را حفظ کنید: ارتباط‌های سالم، فعالیت بدنی و خواب کافی، بهترین سپر خلق هستند.' },
        { min: 5,  title: 'نشانه‌های خفیف', text: 'کمی افت خلق در این دو هفته حس می‌شود. پیاده‌روی روزانه، نور صبحگاهی و گفت‌وگو با آدم‌های نزدیک را جدی بگیرید. اگر بعد از دو هفته بهتر نشد، مشورت با متخصص کمک می‌کند.' },
        { min: 10, title: 'نشانه‌های متوسط', text: 'نشانه‌ها به سطحی رسیده که تجربهٔ آن به‌تنهایی سخت است. پیشنهاد جدی ما گفت‌وگو با یک روان‌شناس است؛ درمان برای این سطح، کوتاه و مؤثر است.' },
        { min: 15, title: 'نشانه‌های متوسط تا شدید', text: 'وضعیت شما نیاز به توجه تخصصی دارد. لطفاً همین هفته با یک روان‌شناس یا روان‌پزشک تماس بگیرید. شما تنها نیستید و درمان واقعاً جواب می‌دهد.' },
        { min: 20, title: 'نشانه‌های شدید', text: 'شدت نشانه‌ها بالاست. توصیهٔ صمیمانه و جدی ما این است که در اولین فرصت به یک متخصص سلامت روان مراجعه کنید. گرفتن کمک نشانهٔ قدرت است، نه ضعف.' },
      ],
    },
  };

  const panel = $('#quizPanel');
  const cardsBox = $('#testCards');
  if (panel && cardsBox) {
  const quizName = $('#quizName'), quizStep = $('#quizStep'), quizBar = $('#quizBar');
  const quizBody = $('#quizBody'), quizQuestion = $('#quizQuestion'),
        quizOptions = $('#quizOptions'), quizPrev = $('#quizPrev'), quizNext = $('#quizNext');
  const quizResult = $('#quizResult'), resultBadge = $('#resultBadge'),
        resultTitle = $('#resultTitle'), resultScore = $('#resultScore'),
        resultFill = $('#resultFill'), resultText = $('#resultText');

  let quiz = null;

  const openQuiz = key => {
    quiz = { key, cfg: TESTS[key], idx: 0, answers: Array(TESTS[key].questions.length).fill(null) };
    cardsBox.hidden = true;
    panel.hidden = false;
    quizResult.hidden = true;
    quizBody.hidden = false;
    render();
    panel.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  };

  const closeQuiz = () => {
    quiz = null;
    panel.hidden = true;
    cardsBox.hidden = false;
    cardsBox.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  };

  const render = () => {
    const { cfg, idx, answers } = quiz;
    quizName.textContent = cfg.name;
    quizStep.textContent = `${fa(idx + 1)} از ${fa(cfg.questions.length)}`;
    quizBar.style.width = ((idx / cfg.questions.length) * 100) + '%';
    panel.querySelector('.quiz__progress').setAttribute('aria-valuenow', Math.round((idx / cfg.questions.length) * 100));
    quizQuestion.textContent = cfg.questions[idx];

    quizOptions.innerHTML = '';
    OPTIONS.forEach(o => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'quiz__option' + (answers[idx] === o.v ? ' is-selected' : '');
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(answers[idx] === o.v));
      b.textContent = o.t;
      b.addEventListener('click', () => {
        answers[idx] = o.v;
        render();
      });
      quizOptions.appendChild(b);
    });

    quizPrev.disabled = idx === 0;
    const answered = answers[idx] !== null;
    quizNext.disabled = !answered;
    quizNext.textContent = idx === cfg.questions.length - 1 ? 'دیدن نتیجه' : 'بعدی';
  };

  const finish = () => {
    const { cfg, answers } = quiz;
    const score = answers.reduce((a, b) => a + b, 0);
    let band = cfg.bands[0];
    cfg.bands.forEach(b => { if (score >= b.min) band = b; });

    quizBody.hidden = true;
    quizResult.hidden = false;
    quizBar.style.width = '100%';
    resultBadge.textContent = 'نتیجهٔ شما';
    resultTitle.textContent = band.title;
    resultScore.textContent = `امتیاز: ${fa(score)} از ${fa(cfg.max)}`;
    resultText.textContent = band.text;

    /* پیام مراقبت برای امتیاز بالا یا پاسخ مثبت به سؤال ۹ PHQ-9 */
    if (quiz.key === 'phq9' && (score >= 15 || answers[8] >= 1)) {
      const note = document.createElement('p');
      note.className = 'quiz__disclaimer';
      note.style.borderColor = 'var(--terra)';
      note.textContent = '💛 اگر این روزها فکر آسیب زدن به خودتان سراغ‌تان می‌آید، لطفاً تنها نمانید. همین حالا با اورژانس اجتماعی ۱۲۳ تماس بگیرید یا به نزدیک‌ترین اورژانس پزشکی بروید. شما ارزشمند هستید.';
      resultText.after(note);
    }

    requestAnimationFrame(() => {
      resultFill.style.width = (score / cfg.max) * 100 + '%';
    });
  };

  $$('[data-test]').forEach(c => c.addEventListener('click', () => openQuiz(c.dataset.test)));
  $('#quizClose').addEventListener('click', closeQuiz);
  $('#quizRestart').addEventListener('click', closeQuiz);
  quizPrev.addEventListener('click', () => { quiz.idx--; render(); });
  quizNext.addEventListener('click', () => {
    if (quiz.idx === quiz.cfg.questions.length - 1) finish();
    else { quiz.idx++; render(); }
  });
  }

  /* ─── فرم رزرو (نمایشی — اتصال واقعی در README توضیح داده شده) ─── */
  const form = $('#bookingForm');
  const formNote = $('#formNote');
  const formSuccess = $('#formSuccess');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#fName').value.trim();
    const phone = $('#fPhone').value.replace(/[^\d]/g, '');
    const service = $('#fService').value;
    if (!name || phone.length < 8 || !service) {
      formNote.textContent = '⚠️ لطفاً نام، شماره تماس معتبر و موضوع را کامل کنید.';
      formNote.style.color = 'var(--terra-deep)';
      return;
    }
    formNote.hidden = true;
    formSuccess.hidden = false;
    form.querySelectorAll('input, select, textarea, button[type=submit]').forEach(el => el.disabled = true);
    /* TODO برای اتصال واقعی: action فرم را به سرویسی مثل Formspree وصل کنید (راهنما در README) */
  });

})();
