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

  // Screen progression:
  // hook → id-nome → id-whatsapp → id-cnh → id-alerta → id-proprietario → id-condutor
  // → filtro → (humano | segmentacao) → upload → scan → diagnostico → comofunciona → oferta → form → pagamento
  const progressMap = {
    'hook': 0,
    'id-nome': 5,
    'id-whatsapp': 10,
    'id-cnh': 16,
    'id-alerta': 22,
    'id-proprietario': 28,
    'id-condutor': 34,
    'filtro': 40,
    'humano': 45,
    'segmentacao': 48,
    'upload': 55,
    'scan': 62,
    'diagnostico': 70,
    'comofunciona': 78,
    'oferta': 84,
    'form': 92,
    'pagamento': 100,
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
      'hook': 'Início',
      'id-nome': 'Etapa 1 de 11',
      'id-whatsapp': 'Etapa 2 de 11',
      'id-cnh': 'Etapa 3 de 11',
      'id-alerta': 'Importante',
      'id-proprietario': 'Etapa 4 de 11',
      'id-condutor': 'Etapa 5 de 11',
      'filtro': 'Etapa 6 de 11',
      'humano': 'Atendimento Especial',
      'segmentacao': 'Etapa 7 de 11',
      'upload': 'Etapa 8 de 11',
      'scan': 'Analisando...',
      'diagnostico': 'Etapa 9 de 11',
      'comofunciona': 'Etapa 10 de 11',
      'oferta': 'Etapa 11 de 11',
      'form': 'Seus Dados',
      'pagamento': 'Finalização',
    };

    progressText.textContent = labels[screenId] || '';
  }

  // === BLOCO 1: IDENTIFICAÇÃO ===

  // --- Hook → Nome ---
  $('#btn-start').addEventListener('click', () => {
    showScreen('id-nome');
  });

  // --- Nome ---
  const qNome = $('#q-nome');
  const btnNome = $('#btn-id-nome');

  qNome.addEventListener('input', () => {
    btnNome.disabled = qNome.value.trim().length < 3;
  });

  btnNome.addEventListener('click', () => {
    state.answers.nome = qNome.value.trim();
    showScreen('id-whatsapp');
  });

  // Allow Enter key on text inputs
  qNome.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !btnNome.disabled) btnNome.click();
  });

  // --- WhatsApp ---
  const qWhatsapp = $('#q-whatsapp');
  const btnWhatsapp = $('#btn-id-whatsapp');

  qWhatsapp.addEventListener('input', (e) => {
    // Phone mask
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,5})/, '($1) $2');
    e.target.value = v;

    btnWhatsapp.disabled = v.replace(/\D/g, '').length < 10;
  });

  btnWhatsapp.addEventListener('click', () => {
    state.answers.whatsapp = qWhatsapp.value.trim();
    showScreen('id-cnh');
  });

  qWhatsapp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !btnWhatsapp.disabled) btnWhatsapp.click();
  });

  // --- Depende da CNH ---
  $$('#id-cnh .option-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.answers.dependeCNH = card.dataset.value;
      $$('#id-cnh .option-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      setTimeout(() => showScreen('id-alerta'), 350);
    });
  });

  // --- Alerta Educativo ---
  $('#btn-id-alerta').addEventListener('click', () => {
    showScreen('id-proprietario');
  });

  // --- Proprietário ---
  $$('#id-proprietario .option-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.answers.proprietario = card.dataset.value;
      $$('#id-proprietario .option-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      setTimeout(() => showScreen('id-condutor'), 350);
    });
  });

  // --- Condutor ---
  $$('#id-condutor .option-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.answers.condutor = card.dataset.value;
      $$('#id-condutor .option-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      setTimeout(() => showScreen('filtro'), 350);
    });
  });

  // === BLOCO 2: TRIAGEM TÉCNICA ===

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
          showScreen('segmentacao');
        }
      }, 350);
    });
  });

  // --- Segmentação (30 dias) ---
  $$('#segmentacao .option-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.answers.recente = card.dataset.value;
      $$('#segmentacao .option-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      setTimeout(() => showScreen('upload'), 350);
    });
  });

  // --- Caminho Humano ---
  $('#btn-whatsapp').addEventListener('click', () => {
    const nome = state.answers.nome || '';
    const whats = state.answers.whatsapp || '';
    const msg = encodeURIComponent(
      `Olá! Meu nome é ${nome}. Fiz o teste no site da Caça Multas e meu caso foi identificado como complexo. Meu WhatsApp: ${whats}. Gostaria de falar com um especialista.`
    );
    window.open('https://wa.me/5511999999999?text=' + msg, '_blank');
  });

  // === BLOCO 3: COLETA DE PROVA ===

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
    showScreen('comofunciona');
  });

  // --- Como Funciona ---
  $('#btn-comofunciona').addEventListener('click', () => {
    showScreen('oferta');
  });

  // --- Oferta ---
  $('#btn-oferta').addEventListener('click', () => {
    showScreen('form');
    // Pre-fill form with data already collected
    prefillForm();
  });

  // --- Pre-fill checkout form ---
  function prefillForm() {
    const nomeInput = document.getElementById('f-nome');
    const telInput = document.getElementById('f-tel');

    if (state.answers.nome && nomeInput && !nomeInput.value) {
      nomeInput.value = state.answers.nome;
    }

    if (state.answers.whatsapp && telInput && !telInput.value) {
      telInput.value = state.answers.whatsapp;
    }
  }

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

  // --- Phone Mask (checkout) ---
  const telInputForm = document.getElementById('f-tel');
  if (telInputForm) {
    telInputForm.addEventListener('input', (e) => {
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
