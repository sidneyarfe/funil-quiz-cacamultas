/* =========================================
   Caça Multas — Quiz Funnel Logic
   ========================================= */

(function () {
  'use strict';

  // --- State ---
  const state = {
    currentScreen: 'hook',
    answers: {},
    uploadedFile: null,
  };

  // Screen progression for automatic path
  const autoFlow = ['hook', 'segmentacao', 'filtro', 'upload', 'scan', 'diagnostico', 'oferta', 'form', 'pagamento'];
  const progressMap = {
    hook: 0,
    segmentacao: 12,
    filtro: 25,
    humano: 40,
    upload: 40,
    scan: 55,
    diagnostico: 70,
    oferta: 80,
    form: 90,
    pagamento: 100,
  };

  // --- DOM Cache ---
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const progressFill = $('.progress-bar-fill');
  const progressText = $('.progress-step-text');

  // --- Navigation ---
  function showScreen(id) {
    $$('.screen').forEach((s) => {
      s.classList.remove('active');
    });
    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
      state.currentScreen = id;
      updateProgress(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function updateProgress(screenId) {
    const pct = progressMap[screenId] ?? 0;
    progressFill.style.width = pct + '%';

    const labels = {
      hook: 'Início',
      segmentacao: 'Etapa 1 de 6',
      filtro: 'Etapa 2 de 6',
      humano: 'Atendimento Especial',
      upload: 'Etapa 3 de 6',
      scan: 'Analisando...',
      diagnostico: 'Etapa 4 de 6',
      oferta: 'Etapa 5 de 6',
      form: 'Etapa 6 de 6',
      pagamento: 'Finalização',
    };

    progressText.textContent = labels[screenId] || '';
  }

  // --- Hook Screen ---
  $('#btn-start').addEventListener('click', () => {
    showScreen('segmentacao');
  });

  // --- Segmentação ---
  $$('#segmentacao .option-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.answers.recente = card.dataset.value;
      // Highlight selection briefly
      $$('#segmentacao .option-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      setTimeout(() => showScreen('filtro'), 350);
    });
  });

  // --- Filtro Crítico (Logic Jump) ---
  $$('#filtro .option-card').forEach((card) => {
    card.addEventListener('click', () => {
      const value = card.dataset.value;
      state.answers.infracao = value;

      $$('#filtro .option-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');

      setTimeout(() => {
        if (value === 'lei_seca' || value === 'carteira_suspensa') {
          showScreen('humano');
        } else {
          showScreen('upload');
        }
      }, 350);
    });
  });

  // --- Caminho Humano ---
  $('#btn-whatsapp').addEventListener('click', () => {
    const msg = encodeURIComponent(
      'Olá! Fiz o teste no site da Caça Multas e meu caso foi identificado como complexo. Gostaria de falar com um especialista.'
    );
    window.open('https://wa.me/5511999999999?text=' + msg, '_blank');
  });

  // --- Upload ---
  const uploadArea = $('#upload-area');
  const fileInput = $('#file-input');
  const uploadDefault = $('.upload-default');
  const uploadPreview = $('.upload-preview');
  const previewImg = $('#preview-img');
  const previewName = $('#preview-name');
  const btnAnalyze = $('#btn-analyze');

  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });

  // Drag & drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--emerald)';
  });

  uploadArea.addEventListener('dragleave', () => {
    if (!state.uploadedFile) uploadArea.style.borderColor = '';
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) handleFile(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
  });

  function handleFile(file) {
    state.uploadedFile = file;
    uploadArea.classList.add('has-file');
    uploadDefault.style.display = 'none';
    uploadPreview.classList.add('visible');
    previewName.textContent = file.name;

    if (file.type.startsWith('image/')) {
      previewImg.style.display = 'block';
      const reader = new FileReader();
      reader.onload = (ev) => {
        previewImg.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      previewImg.style.display = 'none';
    }

    btnAnalyze.style.display = 'flex';
  }

  btnAnalyze.addEventListener('click', () => {
    showScreen('scan');
    runScan();
  });

  // --- Scan Animation ---
  function runScan() {
    const messages = [
      'Conectando ao banco de dados do CTB...',
      'Verificando aferição do radar...',
      'Cruzando dados com o DETRAN...',
      'Buscando erros de preenchimento...',
      'Finalizando análise...',
    ];

    const scanMsg = $('#scan-message');
    const dots = $$('.scan-dot');
    let i = 0;

    scanMsg.textContent = messages[0];
    dots[0].classList.add('active');

    const interval = setInterval(() => {
      i++;
      if (i >= messages.length) {
        clearInterval(interval);
        setTimeout(() => showScreen('diagnostico'), 600);
        return;
      }
      scanMsg.style.opacity = '0';
      setTimeout(() => {
        scanMsg.textContent = messages[i];
        scanMsg.style.opacity = '1';
        if (dots[i]) dots[i].classList.add('active');
      }, 200);
    }, 1200);
  }

  // --- Diagnóstico ---
  $('#btn-defesa').addEventListener('click', () => {
    showScreen('oferta');
  });

  // --- Oferta ---
  $('#btn-oferta').addEventListener('click', () => {
    showScreen('form');
  });

  // --- Form Validation & Submit ---
  $('#btn-submit-form').addEventListener('click', () => {
    const fields = [
      { id: 'f-nome', label: 'Nome Completo' },
      { id: 'f-cpf', label: 'CPF' },
      { id: 'f-rg', label: 'RG' },
      { id: 'f-email', label: 'E-mail' },
      { id: 'f-tel', label: 'Telefone' },
      { id: 'f-rua', label: 'Rua' },
      { id: 'f-num', label: 'Número' },
      { id: 'f-bairro', label: 'Bairro' },
      { id: 'f-cidade', label: 'Cidade' },
      { id: 'f-uf', label: 'UF' },
      { id: 'f-cep', label: 'CEP' },
    ];

    let valid = true;

    fields.forEach((f) => {
      const el = document.getElementById(f.id);
      if (!el.value.trim()) {
        el.classList.add('error');
        valid = false;
      } else {
        el.classList.remove('error');
      }
    });

    if (!valid) {
      // Scroll to first error
      const firstErr = document.querySelector('.form-input.error');
      if (firstErr) firstErr.focus();
      return;
    }

    // Collect data
    state.answers.formData = {};
    fields.forEach((f) => {
      state.answers.formData[f.id] = document.getElementById(f.id).value.trim();
    });

    showScreen('pagamento');
  });

  // Clear error on focus
  $$('.form-input').forEach((input) => {
    input.addEventListener('focus', () => {
      input.classList.remove('error');
    });
  });

  // --- CPF Mask ---
  const cpfInput = document.getElementById('f-cpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
      else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
      e.target.value = v;
    });
  }

  // --- Phone Mask ---
  const telInput = document.getElementById('f-tel');
  if (telInput) {
    telInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
      else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,5})/, '($1) $2');
      e.target.value = v;
    });
  }

  // --- CEP Mask ---
  const cepInput = document.getElementById('f-cep');
  if (cepInput) {
    cepInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 8);
      if (v.length > 5) v = v.replace(/(\d{5})(\d{1,3})/, '$1-$2');
      e.target.value = v;
    });
  }

  // --- Pagamento ---
  $('#btn-pagar').addEventListener('click', () => {
    // Redirect to external checkout (Asaas placeholder)
    window.open('https://www.asaas.com/c/CHECKOUT_ID_AQUI', '_blank');
  });

  // --- Init ---
  showScreen('hook');
})();
