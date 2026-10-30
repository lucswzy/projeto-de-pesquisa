let appData = {
  documento: { titulo: '', conteudo: '' },
  artigos: []
};

let saveTimeout = null;

window.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderFichamentos();
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
  
  if (!appData.artigos) appData.artigos = [];
  if (!appData.documento) appData.documento = { titulo: '', conteudo: '' };

  const inputTitulo = document.getElementById('doc-titulo');
  const inputConteudo = document.getElementById('doc-conteudo');

  if (inputTitulo) inputTitulo.value = appData.documento.titulo || '';
  if (inputConteudo) {
    inputConteudo.value = appData.documento.conteudo || '';
    ajustarAltura(inputConteudo);
  }
  
  updateDisplays();
}

function updateDisplays() {
  const titleDisplay = document.getElementById('hero-title-display');
  if (titleDisplay && appData.documento.titulo) {
    titleDisplay.innerText = appData.documento.titulo;
  }
}

function saveData() {
  localStorage.setItem('unb_research_data', JSON.stringify(appData));
  updateDisplays();

  // Exibir aviso discreto de "Salvo automaticamente"
  const saveStatus = document.getElementById('save-status');
  if (saveStatus) {
    saveStatus.classList.remove('hidden');
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveStatus.classList.add('hidden');
    }, 2000);
  }
}

function saveDocument() {
  const tituloEl = document.getElementById('doc-titulo');
  const conteudoEl = document.getElementById('doc-conteudo');

  appData.documento = {
    titulo: tituloEl ? tituloEl.value : '',
    conteudo: conteudoEl ? conteudoEl.value : ''
  };
  saveData();
}

function ajustarAltura(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = (el.scrollHeight) + 'px';
}

function switchTab(tabId) {
  document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
  const targetTab = document.getElementById(`tab-${tabId}`);
  if (targetTab) targetTab.classList.remove('hidden');

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
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.toggle('hidden');
}

function addArtigo() {
  const titulo = document.getElementById('artigo-titulo').value;
  const autor = document.getElementById('artigo-autor').value;
  const ano = document.getElementById('artigo-ano').value;
  const status = document.getElementById('artigo-status').value;
  const link = document.getElementById('artigo-link').value;
  const resumo = document.getElementById('artigo-resumo').value;

  if (!titulo) {
    alert('Por favor, preencha o título do artigo.');
    return;
  }

  appData.artigos.push({ 
    id: Date.now(), 
    titulo, 
    autor, 
    ano, 
    status, 
    link, 
    resumo 
  });
  
  saveData();
  renderFichamentos();
  toggleModal('modal-artigo');

  // Limpar campos do modal
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
  const searchInput = document.getElementById('search-fichamento');
  if (!container) return;
  
  const search = searchInput ? searchInput.value.toLowerCase() : '';
  container.innerHTML = '';

  const filtrados = appData.artigos.filter(a => 
    a.titulo.toLowerCase().includes(search) || 
    (a.autor && a.autor.toLowerCase().includes(search))
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