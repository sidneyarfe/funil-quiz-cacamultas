/* =========================================
   Caça Multas — Quiz Funnel Logic
   ========================================= */

(function () {
  'use strict';

  // --- State ---
  const state = {
    currentScreen: 'hook',
    screenHistory: [],
    answers: {},
    uploadedFile: null,
  };

  // Screen progression:
  // hook → id-nome → id-whatsapp → id-cnh → id-alerta → id-proprietario → id-condutor
  // → filtro → (humano | segmentacao) → upload → scan → diagnostico → comofunciona → oferta → form → pagamento
  const progressMap = {
    'hook': 0,
    'id-nome': 15,
    'id-whatsapp': 28,
    'id-cnh': 40,
    'id-alerta': 48,
    'id-proprietario': 55,
    'id-condutor': 62,
    'filtro': 68,
    'humano': 70,
    'segmentacao': 72,
    'upload': 76,
    'scan': 80,
    'diagnostico': 83,
    'contestacao': 86,
    'recurso': 89,
    'comofunciona': 92,
    'oferta': 95,
    'form': 97,
    'pagamento': 99,
  };

  // --- DOM Cache ---
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const progressFill = $('.progress-bar-fill');
  const btnBack = $('#btn-back');

  // Screens where back is NOT allowed
  const noBackScreens = ['hook', 'scan', 'pagamento'];

  // --- Navigation ---
  function showScreen(id) {
    // Push current screen to history before navigating
    if (state.currentScreen && state.currentScreen !== id) {
      state.screenHistory.push(state.currentScreen);
    }

    $$('.screen').forEach((s) => {
      s.classList.remove('active');
    });
    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
      state.currentScreen = id;
      updateProgress(id);
      updateBackButton(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function updateBackButton(screenId) {
    if (noBackScreens.includes(screenId) || state.screenHistory.length === 0) {
      btnBack.style.visibility = 'hidden';
    } else {
      btnBack.style.visibility = 'visible';
    }
  }

  // --- Back Button ---
  btnBack.addEventListener('click', () => {
    if (state.screenHistory.length === 0) return;
    const prevScreen = state.screenHistory.pop();
    // Navigate without pushing to history again
    $$('.screen').forEach((s) => s.classList.remove('active'));
    const target = document.getElementById(prevScreen);
    if (target) {
      target.classList.add('active');
      state.currentScreen = prevScreen;
      updateProgress(prevScreen);
      updateBackButton(prevScreen);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  function updateProgress(screenId) {
    const pct = progressMap[screenId] ?? 0;
    progressFill.style.width = pct + '%';
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

  // --- Diagnóstico → Contestação ---
  $('#btn-defesa').addEventListener('click', () => {
    showScreen('contestacao');
  });

  // --- Contestação → Recurso ---
  $('#btn-contestacao').addEventListener('click', () => {
    showScreen('recurso');
  });

  // --- Recurso → Como Funciona ---
  $('#btn-recurso').addEventListener('click', () => {
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

  // --- Social Proof Notifications (Pará) ---
  const socialProofData = {
    cities: ['Belém-PA', 'Ananindeua-PA', 'Marituba-PA', 'Castanhal-PA', 'Santarém-PA', 'Parauapebas-PA', 'Altamira-PA', 'Icoaraci-PA'],
    names: ['Marcus', 'Junior', 'Ana', 'Carlos', 'Fernanda', 'Paulo', 'Ricardo', 'Luana', 'Beatriz', 'Felipe', 'Mariana', 'Roberto'],
    uValues: ['130,16', '195,23', '293,47', '632,60', '880,41', '1.467,35'],
  };

  function showToast() {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Randomize data
    const city = socialProofData.cities[Math.floor(Math.random() * socialProofData.cities.length)];
    const name = socialProofData.names[Math.floor(Math.random() * socialProofData.names.length)];
    const isAnalysis = Math.random() > 0.4; // 60% chance of "enviou", 40% "anulou"

    let text, icon, iconColor;

    if (isAnalysis) {
      text = `<strong>${name}</strong> de ${city} enviou uma multa para análise.`;
      icon = '⚡';
      iconColor = '#F59E0B'; // Amber
    } else {
      const val = socialProofData.uValues[Math.floor(Math.random() * socialProofData.uValues.length)];
      text = `<strong>${name}</strong> de ${city} anulou uma multa de R$ ${val}.`;
      icon = '✅';
      iconColor = '#10B981'; // Emerald
    }

    // Create Toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon" style="color: ${iconColor}">${icon}</span>
      <span class="toast-content">${text}</span>
      <span class="toast-time">agora</span>
    `;

    container.appendChild(toast);

    // Remove after 5s
    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 5000);

    // Schedule next
    const delay = Math.floor(Math.random() * (15000 - 8000 + 1)) + 8000; // 8-15s
    setTimeout(showToast, delay);
  }

  // Start loop 5s after load
  setTimeout(showToast, 5000);



  // --- Init ---
  showScreen('hook');
})();
