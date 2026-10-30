let appData = {
  documento: { titulo: '', problema: '', objetivos: '', justificativa: '', metodologia: '' },
  artigos: [],
  ideias: []
};

let chartLeiturasObj = null;
let chartProgressoObj = null;

window.addEventListener('DOMContentLoaded', () => {
  loadData();
  initCharts();
  renderAll();
});

// Menu Lateral Retrátil
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  sidebar.classList.toggle('-translate-x-full');
  overlay.classList.toggle('hidden');
}

function loadData() {
  const saved = localStorage.getItem('unb_research_data');
  if (saved) {
    try { appData = JSON.parse(saved); } catch(e) {}
  }
  document.getElementById('doc-titulo').value = appData.documento.titulo || '';
  document.getElementById('doc-problema').value = appData.documento.problema || '';
  document.getElementById('doc-objetivos').value = appData.documento.objetivos || '';
  document.getElementById('doc-justificativa').value = appData.documento.justificativa || '';
  document.getElementById('doc-metodologia').value = appData.documento.metodologia || '';
  
  updateHeroTitle();
}

function updateHeroTitle() {
  const titleDisplay = document.getElementById('hero-title-display');
  if (appData.documento.titulo) {
    titleDisplay.innerText = appData.documento.titulo;
  }
}

function saveData() {
  localStorage.setItem('unb_research_data', JSON.stringify(appData));
  updateCharts();
  updateStats();
  updateHeroTitle();
}

function saveDocument() {
  appData.documento = {
    titulo: document.getElementById('doc-titulo').value,
    problema: document.getElementById('doc-problema').value,
    objetivos: document.getElementById('doc-objetivos').value,
    justificativa: document.getElementById('doc-justificativa').value,
    metodologia: document.getElementById('doc-metodologia').value
  };
  saveData();
}

function switchTab(tabId) {
  document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(`tab-${tabId}`).classList.remove('hidden');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-slate-800', 'text-emerald-400');
    btn.classList.add('text-slate-400');
  });

  const activeBtn = document.getElementById(`btn-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add('bg-slate-800', 'text-emerald-400');
    activeBtn.classList.remove('text-slate-400');
  }

  toggleSidebar();
}

function toggleModal(modalId) {
  document.getElementById(modalId).classList.toggle('hidden');
}

function addArtigo() {
  const titulo = document.getElementById('artigo-titulo').value;
  const autor = document.getElementById('artigo-autor').value;
  const ano = document.getElementById('artigo-ano').value;
  const status = document.getElementById('artigo-status').value;
  const link = document.getElementById('artigo-link').value;
  const resumo = document.getElementById('artigo-resumo').value;

  if (!titulo) return alert('Por favor, preencha o título do artigo.');

  appData.artigos.push({ id: Date.now(), titulo, autor, ano, status, link, resumo });
  saveData();
  renderFichamentos();
  toggleModal('modal-artigo');

  document.getElementById('artigo-titulo').value = '';
  document.getElementById('artigo-autor').value = '';
  document.getElementById('artigo-ano').value = '';
  document.getElementById('artigo-link').value = '';
  document.getElementById('artigo-resumo').value = '';
}

function deleteArtigo(id) {
  if (confirm('Deseja excluir este fichamento?')) {
    appData.artigos = appData.artigos.filter(a => a.id !== id);
    saveData();
    renderFichamentos();
  }
}

function renderFichamentos() {
  const container = document.getElementById('fichamentos-list');
  const search = document.getElementById('search-fichamento').value.toLowerCase();
  container.innerHTML = '';

  const filtrados = appData.artigos.filter(a => 
    a.titulo.toLowerCase().includes(search) || 
    a.autor.toLowerCase().includes(search)
  );

  if (filtrados.length === 0) {
    container.innerHTML = `<p class="text-slate-500 text-sm text-center py-8">Nenhum fichamento cadastrado.</p>`;
    return;
  }

  filtrados.forEach(a => {
    const badgeColors = {
      'Para Ler': 'bg-amber-950 text-amber-300 border-amber-800',
      'Lendo': 'bg-blue-950 text-blue-300 border-blue-800',
      'Lido': 'bg-emerald-950 text-emerald-300 border-emerald-800'
    };

    const card = document.createElement('div');
    card.className = 'bg-slate-800/50 border border-slate-700/60 p-5 rounded-xl space-y-3';
    card.innerHTML = `
      <div class="flex justify-between items-start gap-3">
        <div>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeColors[a.status] || ''}">${a.status}</span>
          <h3 class="font-bold text-lg text-white mt-2">${a.titulo}</h3>
          <p class="text-xs text-slate-400">${a.autor ? a.autor : 'Autor não informado'} ${a.ano ? '• ' + a.ano : ''}</p>
        </div>
        <button onclick="deleteArtigo(${a.id})" class="text-slate-500 hover:text-red-400 transition">
          <i class="fa-solid fa-trash text-sm"></i>
        </button>
      </div>
      ${a.resumo ? `<p class="text-sm text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">${a.resumo}</p>` : ''}
      ${a.link ? `<a href="${a.link}" target="_blank" class="inline-flex items-center text-xs text-emerald-400 hover:underline space-x-1"><i class="fa-solid fa-external-link-alt"></i> <span>Acessar fonte</span></a>` : ''}
    `;
    container.appendChild(card);
  });
}

function addIdeia() {
  const titulo = document.getElementById('ideia-titulo').value;
  const texto = document.getElementById('ideia-texto').value;

  if (!titulo) return alert('Insira um título para a ideia.');

  appData.ideias.push({ id: Date.now(), titulo, texto });
  saveData();
  renderIdeias();
  toggleModal('modal-ideia');

  document.getElementById('ideia-titulo').value = '';
  document.getElementById('ideia-texto').value = '';
}

function deleteIdeia(id) {
  appData.ideias = appData.ideias.filter(i => i.id !== id);
  saveData();
  renderIdeias();
}

function renderIdeias() {
  const container = document.getElementById('ideias-list');
  container.innerHTML = '';

  if (appData.ideias.length === 0) {
    container.innerHTML = `<p class="text-slate-500 text-sm text-center py-8 col-span-full">Nenhuma ideia anotada ainda.</p>`;
    return;
  }

  appData.ideias.forEach(i => {
    const card = document.createElement('div');
    card.className = 'bg-amber-950/20 border border-amber-800/40 p-4 rounded-xl space-y-2';
    card.innerHTML = `
      <div class="flex justify-between items-start">
        <h4 class="font-semibold text-amber-200">${i.titulo}</h4>
        <button onclick="deleteIdeia(${i.id})" class="text-amber-600 hover:text-amber-400">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>
      <p class="text-xs text-slate-300">${i.texto}</p>
    `;
    container.appendChild(card);
  });
}

function updateStats() {
  document.getElementById('stat-total-artigos').innerText = appData.artigos.length;
  document.getElementById('stat-lidos').innerText = appData.artigos.filter(a => a.status === 'Lido').length;
  document.getElementById('stat-ideias').innerText = appData.ideias.length;

  let secoes = 0;
  if (appData.documento.titulo) secoes++;
  if (appData.documento.problema) secoes++;
  if (appData.documento.objetivos) secoes++;
  if (appData.documento.justificativa) secoes++;
  if (appData.documento.metodologia) secoes++;
  document.getElementById('stat-secoes').innerText = `${secoes}/5`;
}

function initCharts() {
  const ctxLeituras = document.getElementById('chartLeituras').getContext('2d');
  chartLeiturasObj = new Chart(ctxLeituras, {
    type: 'doughnut',
    data: {
      labels: ['Para Ler', 'Lendo', 'Lido'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: ['#78350f', '#1e3a8a', '#065f46'],
        borderColor: '#0f172a'
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } } }
  });

  const ctxProgresso = document.getElementById('chartProgresso').getContext('2d');
  chartProgressoObj = new Chart(ctxProgresso, {
    type: 'bar',
    data: {
      labels: ['Título', 'Problema', 'Objetivos', 'Justificativa', 'Metodologia'],
      datasets: [{
        label: 'Status',
        data: [0, 0, 0, 0, 0],
        backgroundColor: '#10b981'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { max: 1, ticks: { stepSize: 1, callback: v => v === 1 ? 'Sim' : 'Não', color: '#94a3b8' } },
        x: { ticks: { color: '#94a3b8' } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function updateCharts() {
  if (!chartLeiturasObj || !chartProgressoObj) return;

  const paraLer = appData.artigos.filter(a => a.status === 'Para Ler').length;
  const lendo = appData.artigos.filter(a => a.status === 'Lendo').length;
  const lido = appData.artigos.filter(a => a.status === 'Lido').length;

  chartLeiturasObj.data.datasets[0].data = [paraLer, lendo, lido];
  chartLeiturasObj.update();

  const doc = appData.documento;
  chartProgressoObj.data.datasets[0].data = [
    doc.titulo ? 1 : 0,
    doc.problema ? 1 : 0,
    doc.objetivos ? 1 : 0,
    doc.justificativa ? 1 : 0,
    doc.metodologia ? 1 : 0
  ];
  chartProgressoObj.update();
}

function renderAll() {
  renderFichamentos();
  renderIdeias();
  updateStats();
  updateCharts();
}

function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "pesquisa_unb_dados.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importData(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      appData = JSON.parse(e.target.result);
      saveData();
      loadData();
      renderAll();
      alert('Dados importados com sucesso!');
    } catch(err) {
      alert('Erro ao carregar o arquivo JSON.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}