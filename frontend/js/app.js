// Dados das cifras - removidos dados estáticos, agora vem 100% do banco
const cifrasData = [];

// Variáveis globais
let currentFilter = 'todas';
let cifrasCarregadas = [];
let filteredCifras = [];
let selectedFiles = [];
let ocrResults = [];

// Mobile Navigation
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('hidden');
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.remove('open');
    overlay.classList.add('hidden');
}

function setupMobileNavigation() {
    const menuBtn = document.getElementById('menuBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            toggleMobileMenu();
            this.classList.toggle('active');
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            closeMobileMenu();
            const menuBtn = document.getElementById('menuBtn');
            if (menuBtn) menuBtn.classList.remove('active');
        });
    }
    
    // Fechar menu ao clicar em links da sidebar
    const sidebarLinks = document.querySelectorAll('.sidebar-item');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
            const menuBtn = document.getElementById('menuBtn');
            if (menuBtn) menuBtn.classList.remove('active');
        });
    });
}

// User Menu Functions
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('hidden');
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', function(e) {
    const userMenu = document.getElementById('userMenu');
    const dropdown = document.getElementById('userDropdown');
    
    if (userMenu && dropdown && !userMenu.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

// ========== SISTEMA AUTOMÁTICO DE DETECÇÃO DE MODAIS ==========
// MutationObserver para detectar modais criados dinamicamente e aplicar handlers automaticamente
function setupAutoModalDetection() {
    console.log('🔍 [AUTO MODAL] Configurando detecção automática de modais...');
    
    // Criar observer para detectar novos elementos no DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                // Verificar se é um elemento HTML (não texto)
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Detectar se é um modal ou contém um modal
                    const modals = [];
                    
                    // Verificar se o próprio node é um modal
                    if (isModalElement(node)) {
                        modals.push(node);
                    }
                    
                    // Buscar modais dentro do node
                    const innerModals = node.querySelectorAll?.('.fixed.inset-0, [id*="modal"], .modal, dialog');
                    if (innerModals) {
                        modals.push(...Array.from(innerModals));
                    }
                    
                    // Aplicar handlers para cada modal encontrado
                    modals.forEach(modal => {
                        console.log('🎯 [AUTO MODAL] Modal detectado automaticamente:', modal.id || modal.className);
                        applyAutoHandlersToModal(modal);
                    });
                }
            });
        });
    });
    
    // Iniciar observação do DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ [AUTO MODAL] Detecção automática configurada!');
    return observer;
}

// Verificar se um elemento é um modal
function isModalElement(element) {
    if (!element.classList) return false;
    
    // Verificar classes típicas de modal
    const modalClasses = ['fixed', 'modal', 'inset-0'];
    const hasModalClass = modalClasses.some(cls => element.classList.contains(cls));
    
    // Verificar se é um dialog
    const isDialog = element.tagName === 'DIALOG';
    
    // Verificar se tem ID de modal
    const hasModalId = element.id && element.id.includes('modal');
    
    // Verificar se tem z-index alto (típico de modais)
    const hasHighZIndex = element.style.zIndex && parseInt(element.style.zIndex) >= 50;
    
    return hasModalClass || isDialog || hasModalId || hasHighZIndex;
}

// Aplicar handlers automaticamente a um modal detectado
function applyAutoHandlersToModal(modal) {
    console.log('🔧 [AUTO MODAL] Aplicando handlers automáticos ao modal...');
    
    // Aguardar um pouco para garantir que o modal está totalmente renderizado
    setTimeout(() => {
        // Buscar todos os botões dentro do modal
        const buttons = modal.querySelectorAll('button, [role="button"], [data-action]');
        
        buttons.forEach(button => {
            // Verificar se o botão já tem event listeners (evitar duplicatas)
            if (button.dataset.autoHandlerApplied) return;
            
            // Marcar como processado
            button.dataset.autoHandlerApplied = 'true';
            
            console.log('🎯 [AUTO MODAL] Processando botão:', {
                id: button.id,
                text: button.textContent?.trim(),
                classes: button.className
            });
            
            // Aplicar handler baseado na função do botão
            const handler = determineButtonHandler(button, modal);
            if (handler) {
                button.addEventListener('click', handler);
                console.log('✅ [AUTO MODAL] Handler aplicado:', button.id || button.textContent?.trim());
            }
        });
        
        // Aplicar handlers para formulários
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => {
            if (form.dataset.autoHandlerApplied) return;
            form.dataset.autoHandlerApplied = 'true';
            
            const submitHandler = determineFormHandler(form, modal);
            if (submitHandler) {
                form.addEventListener('submit', submitHandler);
                console.log('✅ [AUTO MODAL] Form handler aplicado:', form.id);
            }
        });
        
    }, 100); // 100ms para garantir renderização completa
}

// Determinar qual handler aplicar baseado no botão
function determineButtonHandler(button, modal) {
    const buttonId = button.id;
    const buttonText = button.textContent?.toLowerCase() || '';
    const dataAction = button.getAttribute('data-action');
    
    // Handlers específicos por ID
    const idHandlers = {
        'close-modal-btn': () => closeModal(),
        'cancel-modal-btn': () => closeModal(),
        'close-main-modal-btn': () => closeModal(),
        'close-editor-modal-btn': () => closeModal(),
        'close-upload-modal-btn': () => closeModal(),
        'check-url-btn-simple': () => handleCheckUrlButton(),
        'import-url-btn-simple': () => handleImportUrlButton(),
        'btn-escrever-cifra-modal': () => { closeModal(); setTimeout(() => openCifraEditor(), 100); },
        'btn-link-cifra-modal': () => { closeModal(); setTimeout(() => openUrlImportModal(), 100); },
        'btn-upload-cifra-modal': () => { closeModal(); setTimeout(() => openCifraUploader(), 100); },
        'btn-save-cifra': () => saveCifra(),
        'btn-cancel-editor': () => closeModal(),
        'btn-cancel-upload': () => closeModal(),
        'btn-process-files': () => processUploadedFiles(),
        'btn-select-files': () => {
            const fileInput = document.getElementById('fileInput') || document.getElementById('cifra-files');
            if (fileInput) fileInput.click();
        },
        'btn-preview-cifra': () => previewCifra(),
        'btn-insert-verso': () => insertText('\n\nVerso:\n'),
        'btn-insert-refrao': () => insertText('\n\nRefrão:\n'),
        'btn-insert-ponte': () => insertText('\n\nPonte:\n'),
        'btn-insert-final': () => insertText('\n\nFinal:\n')
    };
    
    // Verificar handler específico por ID
    if (idHandlers[buttonId]) {
        return idHandlers[buttonId];
    }
    
    // Handlers por data-action
    if (dataAction) {
        const actionHandlers = {
            'close': () => closeModal(),
            'save': () => saveCifra(),
            'process': () => processUploadedFiles(),
            'select-files': () => {
                const fileInput = document.getElementById('fileInput') || document.getElementById('cifra-files');
                if (fileInput) fileInput.click();
            },
            'import': () => handleImportUrlButton(),
            'check': () => handleCheckUrlButton()
        };
        
        if (actionHandlers[dataAction]) {
            return actionHandlers[dataAction];
        }
    }
    
    // Handlers inteligentes baseados no texto/ícones
    const hasCloseIcon = button.querySelector('.fa-times, .fa-close');
    if (hasCloseIcon || buttonText.includes('cancelar') || buttonText.includes('fechar')) {
        return () => closeModal();
    }
    
    if (buttonText.includes('salvar') || buttonText.includes('save')) {
        return () => saveCifra();
    }
    
    if (buttonText.includes('verificar') || buttonText.includes('check')) {
        return () => handleCheckUrlButton();
    }
    
    if (buttonText.includes('importar') || buttonText.includes('import')) {
        return () => handleImportUrlButton();
    }
    
    if (buttonText.includes('processar') || buttonText.includes('upload')) {
        return () => processUploadedFiles();
    }
    
    if (buttonText.includes('selecionar') || buttonText.includes('arquivos')) {
        return () => {
            const fileInput = document.getElementById('fileInput') || document.getElementById('cifra-files');
            if (fileInput) fileInput.click();
        };
    }
    
    // Se não encontrou handler específico, retornar null
    return null;
}

// Determinar handler para formulários
function determineFormHandler(form, modal) {
    const formId = form.id;
    
    const formHandlers = {
        'url-import-form-simple': (e) => {
            e.preventDefault();
            handleImportUrlButton();
        },
        'cifraEditorForm': (e) => {
            e.preventDefault();
            saveCifra();
        }
    };
    
    return formHandlers[formId] || null;
}

// ========== DELEGAÇÃO GLOBAL DE EVENTOS PARA MODAIS ==========

// ========== DELEGAÇÃO GLOBAL DE EVENTOS (MANTIDA COMO BACKUP) ==========
// Sistema para garantir que todos os botões dos modais funcionem corretamente
function setupGlobalModalEventDelegation() {
    console.log('🔧 [MODAL DELEGATION] Configurando delegação global de eventos...');
    
    // Event listener global no document.body para capturar todos os cliques
    document.body.addEventListener('click', function(event) {
        const target = event.target;
        const button = target.closest('button') || target.closest('[role="button"]') || target.closest('[data-action]');
        
        if (!button) return;
        
        // Verificar se o clique foi dentro de um modal
        const modal = button.closest('.fixed.inset-0') || button.closest('[id*="modal"]') || button.closest('.modal');
        
        if (!modal) return;
        
        console.log('🎯 [MODAL DELEGATION] Clique detectado em modal:', {
            buttonId: button.id,
            buttonClass: button.className,
            buttonText: button.textContent?.trim(),
            modalId: modal.id
        });
        
        // Evitar propagação dupla
        event.preventDefault();
        event.stopPropagation();
        
        // Identificar ação baseada no ID ou atributos do botão
        const buttonId = button.id;
        const dataAction = button.getAttribute('data-action');
        
        // Botões de fechar modal
        if (buttonId === 'close-modal-btn' || 
            buttonId === 'cancel-modal-btn' || 
            buttonId === 'close-main-modal-btn' ||
            dataAction === 'close' ||
            button.querySelector('.fa-times') ||
            button.classList.contains('close-modal')) {
            console.log('✅ [MODAL DELEGATION] Executando ação: fechar modal');
            closeModal();
            return;
        }
        
        // Botão de verificar URL
        if (buttonId === 'check-url-btn-simple') {
            console.log('✅ [MODAL DELEGATION] Executando ação: verificar URL');
            handleCheckUrlButton();
            return;
        }
        
        // Botão de importar URL
        if (buttonId === 'import-url-btn-simple') {
            console.log('✅ [MODAL DELEGATION] Executando ação: importar URL');
            handleImportUrlButton();
            return;
        }
        
        // Botões do modal principal de adicionar cifra
        if (buttonId === 'btn-escrever-cifra-modal') {
            console.log('✅ [MODAL DELEGATION] Executando ação: abrir editor');
            closeModal();
            setTimeout(() => openCifraEditor(), 100);
            return;
        }
        
        if (buttonId === 'btn-link-cifra-modal') {
            console.log('✅ [MODAL DELEGATION] Executando ação: importar por link');
            closeModal();
            setTimeout(() => openUrlImportModal(), 100);
            return;
        }
        
        if (buttonId === 'btn-upload-cifra-modal') {
            console.log('✅ [MODAL DELEGATION] Executando ação: upload arquivo');
            closeModal();
            setTimeout(() => openCifraUploader(), 100);
            return;
        }
        
        // Botões do modal de upload de arquivo
        if (buttonId === 'select-files-btn') {
            console.log('✅ [MODAL DELEGATION] Executando ação: selecionar arquivos');
            const fileInput = document.getElementById('cifra-files');
            if (fileInput) fileInput.click();
            return;
        }
        
        if (buttonId === 'process-files-btn') {
            console.log('✅ [MODAL DELEGATION] Executando ação: processar arquivos');
            processUploadedFiles();
            return;
        }
        
        // Botões do modal de editor de cifra
        if (buttonId === 'save-cifra-btn') {
            console.log('✅ [MODAL DELEGATION] Executando ação: salvar cifra');
            saveCifra();
            return;
        }
        
        // Botões genéricos com data-action
        if (dataAction) {
            console.log(`✅ [MODAL DELEGATION] Executando ação genérica: ${dataAction}`);
            
            switch (dataAction) {
                case 'save':
                    saveCifra();
                    break;
                case 'process':
                    processUploadedFiles();
                    break;
                case 'select-files':
                    const fileInput = document.getElementById('cifra-files');
                    if (fileInput) fileInput.click();
                    break;
                case 'import':
                    handleImportUrlButton();
                    break;
                case 'check':
                    handleCheckUrlButton();
                    break;
                default:
                    console.warn('⚠️ [MODAL DELEGATION] Ação não reconhecida:', dataAction);
            }
            return;
        }
        
        console.log('⚠️ [MODAL DELEGATION] Botão não reconhecido, aplicando handlers dinâmicos...');
        
        // Fallback: tentar aplicar handlers baseado no contexto
        applyDynamicHandlers(button, modal);
    });
    
    // Event listener para formulários em modais
    document.body.addEventListener('submit', function(event) {
        const form = event.target;
        const modal = form.closest('.fixed.inset-0') || form.closest('[id*="modal"]') || form.closest('.modal');
        
        if (!modal) return;
        
        console.log('📝 [MODAL DELEGATION] Submit detectado em modal:', form.id);
        
        event.preventDefault();
        event.stopPropagation();
        
        // Handle form submission baseado no ID
        if (form.id === 'url-import-form-simple') {
            console.log('✅ [MODAL DELEGATION] Executando: submit do formulário de import URL');
            handleImportUrlButton();
        } else if (form.id === 'cifra-editor-form') {
            console.log('✅ [MODAL DELEGATION] Executando: submit do formulário de editor');
            saveCifra();
        }
    });
    
    console.log('✅ [MODAL DELEGATION] Delegação global configurada com sucesso!');
}

// Handlers específicos para ações dos modais
async function handleCheckUrlButton() {
    const urlInput = document.getElementById('cifra-url-simple');
    const checkBtn = document.getElementById('check-url-btn-simple');
    
    if (!urlInput || !checkBtn) {
        console.error('❌ [MODAL DELEGATION] Elementos não encontrados para verificar URL');
        return;
    }
    
    const url = urlInput.value.trim();
    
    if (!url) {
        showValidationFeedbackSimple('Por favor, insira uma URL.', 'error');
        return;
    }
    
    checkBtn.disabled = true;
    checkBtn.innerHTML = '<span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>Verificando...';
    
    try {
        const result = await checkUrlSupport(url);
        handleUrlCheckResultSimple(result);
    } catch (error) {
        console.error('Erro ao verificar URL:', error);
        showValidationFeedbackSimple(`Erro: ${error.message}`, 'error');
    } finally {
        checkBtn.disabled = false;
        checkBtn.innerHTML = '<i class="fas fa-search mr-2"></i>Verificar URL';
    }
}

async function handleImportUrlButton() {
    const urlInput = document.getElementById('cifra-url-simple');
    const importBtn = document.getElementById('import-url-btn-simple');
    
    if (!urlInput || !importBtn) {
        console.error('❌ [MODAL DELEGATION] Elementos não encontrados para importar URL');
        return;
    }
    
    const url = urlInput.value.trim();
    
    if (!url) {
        showValidationFeedbackSimple('Por favor, insira uma URL.', 'error');
        return;
    }
    
    importBtn.disabled = true;
    importBtn.innerHTML = '<span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>Importando...';
    
    try {
        const result = await importCifraFromUrlModal(url);
        handleImportResultSimple(result);
    } catch (error) {
        console.error('Erro na importação:', error);
        showValidationFeedbackSimple(`Erro na importação: ${error.message}`, 'error');
    } finally {
        importBtn.disabled = false;
        importBtn.innerHTML = '<i class="fas fa-download mr-2"></i>Importar Cifra';
    }
}

// Aplicar handlers dinâmicos como fallback
function applyDynamicHandlers(button, modal) {
    const buttonText = button.textContent?.toLowerCase() || '';
    const hasCloseIcon = button.querySelector('.fa-times, .fa-close');
    
    if (hasCloseIcon || buttonText.includes('cancelar') || buttonText.includes('fechar')) {
        console.log('🔄 [MODAL DELEGATION] Aplicando handler dinâmico: fechar modal');
        closeModal();
        return;
    }
    
    if (buttonText.includes('verificar') || buttonText.includes('check')) {
        console.log('🔄 [MODAL DELEGATION] Aplicando handler dinâmico: verificar URL');
        handleCheckUrlButton();
        return;
    }
    
    if (buttonText.includes('importar') || buttonText.includes('import')) {
        console.log('🔄 [MODAL DELEGATION] Aplicando handler dinâmico: importar');
        handleImportUrlButton();
        return;
    }
    
    if (buttonText.includes('salvar') || buttonText.includes('save')) {
        console.log('🔄 [MODAL DELEGATION] Aplicando handler dinâmico: salvar');
        saveCifra();
        return;
    }
    
    if (buttonText.includes('processar') || buttonText.includes('upload')) {
        console.log('🔄 [MODAL DELEGATION] Aplicando handler dinâmico: processar arquivos');
        processUploadedFiles();
        return;
    }
    
    console.log('⚠️ [MODAL DELEGATION] Nenhum handler dinâmico aplicável encontrado para:', buttonText);
}

// ========== FIM DA DELEGAÇÃO GLOBAL ==========

// Modal Adicionar Cifra com 3 opções
function showAddCifraModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-xl font-semibold text-gray-900">Adicionar Nova Cifra</h3>
                <button id="close-main-modal-btn" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="p-6">
                <p class="text-gray-600 mb-6">Escolha como você gostaria de adicionar a cifra:</p>
                
                <div class="space-y-4">
                    <!-- Escrever Cifra -->
                    <button id="btn-escrever-cifra-modal" class="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group text-left">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <i class="fas fa-edit text-blue-600 text-xl"></i>
                            </div>
                            <div class="ml-4">
                                <h4 class="font-semibold text-gray-900 group-hover:text-blue-900">Escrever Cifra</h4>
                                <p class="text-sm text-gray-600">Digite manualmente a letra e acordes</p>
                            </div>
                        </div>
                    </button>
                    
                    <!-- Link da Cifra -->
                    <button id="btn-link-cifra-modal" class="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group text-left">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                <i class="fas fa-link text-green-600 text-xl"></i>
                            </div>
                            <div class="ml-4">
                                <h4 class="font-semibold text-gray-900 group-hover:text-green-900">Link da Cifra</h4>
                                <p class="text-sm text-gray-600">Importar do Cifra Club ou outros sites</p>
                            </div>
                        </div>
                    </button>
                    
                    <!-- Upload de Arquivo -->
                    <button id="btn-upload-cifra-modal" class="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group text-left">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                <i class="fas fa-cloud-upload-alt text-purple-600 text-xl"></i>
                            </div>
                            <div class="ml-4">
                                <h4 class="font-semibold text-gray-900 group-hover:text-purple-900">Upload de Arquivo</h4>
                                <p class="text-sm text-gray-600">PNG, PDF ou JPEG da cifra</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners são gerenciados pela delegação global de eventos
    console.log('🔗 [MODAL] Event listeners gerenciados pela delegação global');
    
    // Fechar modal clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Carregar cifras da API
async function carregarCifras() {
    try {
        const response = await fetch(apiUrl('/api/cifras'));
        const data = await response.json();
        
        cifrasCarregadas = data.cifras || [];
        
        // Carregar favoritos do usuário logado
        await carregarFavoritos();
        
        filteredCifras = [...cifrasCarregadas];
        renderCifras();
        
    } catch (error) {
        console.error('Erro ao carregar cifras:', error);
        // Mostrar mensagem de erro se API falhar
        const songsGrid = document.getElementById('songsGrid');
        if (songsGrid) {
            songsGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-exclamation-triangle text-red-400 text-4xl mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">Erro ao carregar cifras</h3>
                    <p class="text-gray-500">Verifique sua conexão e tente novamente</p>
                    <button onclick="carregarCifras()" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Tentar novamente
                    </button>
                </div>
            `;
        }
    }
}

// Carregar favoritos do usuário
async function carregarFavoritos() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return; // Se não está logado, não carregar favoritos
        
        const response = await fetch(apiUrl('/api/favoritos'), {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const favoritosIds = data.favoritos.map(f => f.cifra_id);
            
            // Marcar cifras como favoritadas
            cifrasCarregadas.forEach(cifra => {
                cifra.isFavorited = favoritosIds.includes(cifra.id);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
    }
}

// Inicialização ATUALIZADA - Sistema automático de modais
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 [INIT] DOM carregado, iniciando sistema automático de modais...');
    
    // PRIORIDADE 1: Configurar detecção automática de modais (NOVO SISTEMA INTELIGENTE)
    const modalObserver = setupAutoModalDetection();
    
    // PRIORIDADE 2: Manter delegação global como backup de segurança
    setupGlobalModalEventDelegation();
    
    // PRIORIDADE 3: Demais inicializações do app
    carregarCifras();
    setupEventListeners();
    setupMobileNavigation();
    
    // Resetar navegação ao carregar a página (importante para quando vem de outras páginas)
    resetNavigationState();
    
    // Inicializar carousel de banners
    initializeBannerCarousel();
    loadBanners();
    
    // Inicializar novo layout
    initializeNewHomepage();
    
    // Verificar se usuário é master
    checkMasterAccess();
    
    console.log('✅ [INIT] Sistema automático de modais inicializado com sucesso!');
    
    // Salvar observer globalmente para debug se necessário
    window.modalObserver = modalObserver;
    
    // Função global para forçar aplicação de handlers (útil para debug)
    window.forceApplyModalHandlers = function() {
        console.log('🔧 [FORCE] Aplicando handlers manualmente a todos os modais...');
        const allModals = document.querySelectorAll('.fixed.inset-0, [id*="modal"], .modal, dialog');
        console.log('🔍 [FORCE] Encontrados', allModals.length, 'modais');
        allModals.forEach((modal, index) => {
            console.log(`🎯 [FORCE] Processando modal ${index + 1}:`, modal.id || modal.className);
            applyAutoHandlersToModal(modal);
        });
        console.log('✅ [FORCE] Handlers aplicados manualmente!');
    };
});

// Configurar event listeners
function setupEventListeners() {
    // Filtros de categoria
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            const category = this.dataset.category;
            setActiveFilter(this);
            filterCifras(category);
        });
    });

    // Busca
    const searchInput = document.querySelector('input[placeholder="Buscar cifras..."]');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Links da sidebar
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Permitir navegação normal para links com href real
            if (this.getAttribute('href') && this.getAttribute('href') !== '#') {
                return; // Deixa o comportamento padrão acontecer
            }
            
            e.preventDefault();
            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('bg-blue-50', 'text-blue-700'));
            // Add active class to clicked item
            this.classList.add('bg-blue-50', 'text-blue-700');
        });
    });
}

// Definir filtro ativo
function setActiveFilter(activeElement) {
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.classList.remove('border-blue-600', 'text-blue-600');
        filter.classList.add('border-transparent', 'text-gray-500');
    });
    
    activeElement.classList.remove('border-transparent', 'text-gray-500');
    activeElement.classList.add('border-blue-600', 'text-blue-600');
}

// Filtrar cifras por categoria
function filterCifras(category) {
    currentFilter = category;
    
    if (category === 'todas') {
        filteredCifras = [...cifrasCarregadas];
    } else {
        filteredCifras = cifrasCarregadas.filter(cifra => cifra.categoria === category);
    }
    
    renderCifras();
}

// Buscar cifras
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        showMainSections();
        return;
    }
    
    hideMainSections();
    
    filteredCifras = cifrasCarregadas.filter(cifra => 
        cifra.titulo.toLowerCase().includes(searchTerm) ||
        cifra.artista.toLowerCase().includes(searchTerm) ||
        cifra.categoria.toLowerCase().includes(searchTerm)
    );
    
    renderCifras();
    
    const searchResults = document.getElementById('searchResults');
    
    // Resetar cabeçalho para formato padrão
    const headerContainer = searchResults.querySelector('div.flex.items-center.justify-between');
    if (headerContainer) {
        headerContainer.outerHTML = `<h2 class="text-2xl font-bold text-gray-900 mb-6">Resultados para "${searchTerm}"</h2>`;
    } else {
        const existingH2 = searchResults.querySelector('h2');
        if (existingH2) {
            existingH2.textContent = `Resultados para "${searchTerm}"`;
        }
    }
    
    searchResults.classList.remove('hidden');
}

// Renderizar cifras
function renderCifras() {
    const songsGrid = document.getElementById('songsGrid');
    if (!songsGrid) return;
    
    if (filteredCifras.length === 0) {
        songsGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-music text-gray-400 text-4xl mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">Nenhuma cifra encontrada</h3>
                <p class="text-gray-500">Tente buscar por outro termo ou categoria</p>
            </div>
        `;
        return;
    }
    
    songsGrid.innerHTML = filteredCifras.map(cifra => createCifraCard(cifra)).join('');
    
    // Adicionar event listeners aos botões
    setupCardEventListeners();
}

// Criar card de cifra
function createCifraCard(cifra) {
    const categoryColor = getCategoryColor(cifra.categoria);
    const heartIcon = cifra.isFavorited ? 'fas' : 'far';
    const heartColor = cifra.isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500';
    
    return `
        <div class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group" onclick="viewCifra(${cifra.id})">
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <h4 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-1 transition-colors">${cifra.titulo}</h4>
                    <p class="text-sm text-gray-600">${cifra.artista}</p>
                </div>
                <button class="${heartColor} transition-colors" onclick="event.stopPropagation(); toggleFavorite(${cifra.id})">
                    <i class="${heartIcon} fa-heart"></i>
                </button>
            </div>
            
            <div class="flex items-center space-x-2 mb-4">
                <span class="tom-tag">Tom: ${cifra.tom}</span>
                <span class="category-tag ${categoryColor}">${formatCategory(cifra.categoria)}</span>
            </div>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center text-sm text-gray-500">
                    <i class="fas fa-eye mr-1"></i>
                    <span>${cifra.views}</span>
                </div>
                <div class="flex space-x-2">
                    <button 
                        class="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center"
                        onclick="event.stopPropagation(); addToRepertorio(${cifra.id})"
                    >
                        <i class="fas fa-plus mr-1"></i>
                        Repertório
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Configurar event listeners dos cards
function setupCardEventListeners() {
    // Event listeners já são adicionados via onclick nos botões
    // Esta função pode ser usada para event listeners adicionais se necessário
}

// Obter cor da categoria
function getCategoryColor(categoria) {
    const colors = {
        entrada: 'bg-green-100 text-green-800',
        comunhao: 'bg-yellow-100 text-yellow-800',
        final: 'bg-purple-100 text-purple-800',
        adoracao: 'bg-red-100 text-red-800',
        mariana: 'bg-blue-100 text-blue-800',
        ofertorio: 'bg-green-100 text-green-800'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
}

// Formatar nome da categoria
function formatCategory(categoria) {
    const categorias = {
        'entrada': 'Entrada',
        'gloria': 'Glória',
        'salmo': 'Salmo',
        'aleluia': 'Aleluia',
        'ofertorio': 'Ofertório',
        'santo': 'Santo',
        'comunhao': 'Comunhão',
        'final': 'Final',
        'adoracao': 'Adoração',
        'maria': 'Maria',
        'natal': 'Natal',
        'pascoa': 'Páscoa',
        'outras': 'Outras'
    };
    return categorias[categoria] || categoria;
}

// Sistema de alinhamento perfeito de cifras
class CifraRenderer {
    constructor() {
        // Sistema simplificado usando lógica do array de espaços
    }
    

    
    // Detectar formato da cifra
    detectFormat(lines) {
        let hasInlineChords = false;
        let hasSeparateLines = false;
        let hasSpacedAlignment = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Verificar acordes inline [C] [Am] etc - MAS NÃO SEÇÕES!
            // Seções são tipo [Intro], [Primeira Parte] etc
            const isSection = /^\[([^\]]+)\]$/.test(line) && 
                             (/intro|parte|refrão|final|solo|ponte/i.test(line) || line.toLowerCase().includes('parte'));
            
            if (line.includes('[') && line.includes(']') && !isSection) {
                // Apenas acordes inline como [C]palavra[Am]outra, não seções
                if (line.length > line.replace(/\[[^\]]*\]/g, '').length + 20) {
                    hasInlineChords = true;
                }
            }
            
            // Verificar linhas separadas (acorde seguido de letra)
            if (this.isChordOnlyLine(line) && i + 1 < lines.length && lines[i + 1].trim() && !this.isChordOnlyLine(lines[i + 1])) {
                hasSeparateLines = true;
            }
            
            // Verificar alinhamento por espaços (linha com acordes e espaços)
            if (this.isChordOnlyLine(line) && line.includes('  ')) {
                hasSpacedAlignment = true;
            }
        }
        
        // PRIORIDADE CORRETA: separated > spaced > inline > mixed
        if (hasSeparateLines) return 'separated';
        if (hasSpacedAlignment) return 'spaced';  
        if (hasInlineChords) return 'inline';
        return 'mixed';
    }
    
    // Detectar se linha contém apenas acordes
    isChordOnlyLine(line) {
        const linhaTrimmed = line.trim();
        if (!linhaTrimmed) return false;
        
        // Remove espaços múltiplos e divide palavras
        const palavras = linhaTrimmed.split(/\s+/);
        
        // Verifica se todas as palavras parecem ser acordes
        return palavras.every(palavra => {
            // Padrão para acordes (mais flexível)
            return /^[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\([^)]*\))?([/][A-G](#|b)?)?$/.test(palavra);
        });
    }
    
    // Renderizar cifra com formato inline [C]palavra [Am]outra
    renderInlineFormat(text) {
        const inlinePattern = /\[([^\]]+)\]/g;
        return text.replace(inlinePattern, '<span style="color: #d66c00; font-weight: bold; background: rgba(214, 108, 0, 0.1); padding: 1px 3px; border-radius: 2px;">$1</span>');
    }
    
    // Renderizar formato separado (acordes em linha acima) - NOVA LÓGICA
    renderSeparatedFormat(lines) {
        const result = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
            
            // Se linha atual é só acordes e próxima é letra
            if (this.isChordOnlyLine(line) && nextLine.trim() && !this.isChordOnlyLine(nextLine)) {
                const alignedPair = this.alignChordWithLyric(line, nextLine); // NÃO usar .trim()!
                result.push(alignedPair);
                i++; // Pular próxima linha pois já processou
            } else {
                // Linha normal ou seção
                if (line.match(/^\s*\[.*\]\s*$/)) {
                    result.push(`<div class="section-header" style="font-weight: 600; color: #374151; margin: 12px 0 6px 0; text-transform: uppercase; font-size: 12px;">${line.trim()}</div>`);
                } else if (this.isChordOnlyLine(line)) {
                    const preservedLine = line.replace(/\t/g, '  '); // Manter TODOS os espaços
                    const acordesFormatados = preservedLine.replace(/\b[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\([^)]*\))?([/][A-G](#|b)?)?/g, '<span style="color: #ff6600; font-weight: bold;">$&</span>');
                    result.push(`<div style="margin: 6px 0; line-height: 1.4; font-family: 'Roboto Mono', 'Courier New', monospace; white-space: pre;">${acordesFormatados}</div>`);
                } else {
                    result.push(`<div style="margin: 4px 0; line-height: 1.6; font-family: 'Roboto Mono', 'Courier New', monospace; color: #374151;">${line}</div>`);
                }
            }
        }
        
        return result.join('\n');
    }
    
    // Alinhar acordes com letras usando a lógica genial do amigo
    alignChordWithLyric(chordLine, lyricLine) {
        // SISTEMA IDÊNTICO AO CIFRA CLUB - SEM PROCESSAMENTO DUPLO!
        if (!chordLine.trim() || !lyricLine.trim()) {
            return `<div style="margin: 4px 0; line-height: 1.6; font-family: 'Roboto Mono', 'Courier New', monospace; color: #374151;">${lyricLine}</div>`;
        }
        
        // PRESERVAR TODOS OS ESPAÇOS - incluindo os iniciais (são propositais!)
        const linhaAcordes = chordLine.replace(/\t/g, '  '); // Converter tabs, manter espaços
        const linhaLetra = lyricLine; // Manter espaços da letra também
        
        // Formatar acordes SEM usar formatChordsInLine (evitar processamento duplo)
        const acordesFormatados = linhaAcordes.replace(
            /\b[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\([^)]*\))?([/][A-G](#|b)?)?/g,
            '<span style="color: #ff6600; font-weight: bold;">$&</span>'
        );
        
        return `<div style="margin: 6px 0; font-family: 'Roboto Mono', 'Courier New', monospace; line-height: 1.4; white-space: pre;">
<div style="margin-bottom: 1px;">${acordesFormatados}</div>
<div style="color: #374151;">${linhaLetra}</div>
</div>`;
    }
    
    // Extrair acordes individuais de uma linha
    extractChordsFromLine(line) {
        const acordes = [];
        const regex = /[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\([^)]*\))?([/][A-G](#|b)?)?/g;
        let match;
        
        while ((match = regex.exec(line)) !== null) {
            acordes.push({
                nome: match[0],
                posicao: match.index
            });
        }
        
        return acordes;
    }
    
    // Formatar linha de acordes (destacar apenas os acordes, deixar espaços)
    formatChordLine(line) {
        return line.replace(/[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\([^)]*\))?([/][A-G](#|b)?)?/g, 
            '<span style="color: #ff6600; font-weight: bold;">$&</span>'
        );
    }
    

    
    // Renderizar formato com espaçamento - COM LÓGICA MELHORADA
    renderSpacedFormat(lines) {
        const result = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
            
            // Se linha atual é só acordes e próxima é letra - APLICAR NOVA LÓGICA TAMBÉM AQUI!
            if (this.isChordOnlyLine(line) && nextLine.trim() && !this.isChordOnlyLine(nextLine)) {
                const alignedPair = this.alignChordWithLyric(line, nextLine); // NÃO usar .trim()!
                result.push(alignedPair);
                i++; // Pular próxima linha pois já processou
            } else {
                // Linha normal ou seção
                if (this.isChordOnlyLine(line)) {
                    result.push(this.preserveSpacedAlignment(line));
                } else if (line.match(/^\s*\[.*\]\s*$/)) {
                    result.push(`<div class="section-header" style="font-weight: 600; color: #374151; margin: 12px 0 6px 0; text-transform: uppercase; font-size: 12px;">${line.trim()}</div>`);
                } else if (line.trim()) {
                    result.push(`<div style="margin: 4px 0; line-height: 1.6; font-family: 'Roboto Mono', 'Courier New', monospace; color: #374151;">${line}</div>`);
                }
            }
        }
        
        return result.join('\n');
    }
    
    // Preservar espaçamento como Cifra Club (2 espaços entre acordes)
    preserveSpacedAlignment(line) {
        // PRESERVAR TODOS OS ESPAÇOS (incluindo iniciais - são propositais!)
        const linhaTrimmed = line.replace(/\t/g, '  '); // Manter TODOS os espaços
        
        const acordesFormatados = linhaTrimmed.replace(
            /\b[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\([^)]*\))?([/][A-G](#|b)?)?/g,
            '<span style="color: #ff6600; font-weight: bold;">$&</span>'
        );
        
        return `<div style="margin: 6px 0; line-height: 1.4; font-family: 'Roboto Mono', 'Courier New', monospace; white-space: pre;">${acordesFormatados}</div>`;
    }
    
    // Formatar acordes individuais em uma linha
    formatChordsInLine(line) {
        const chordPattern = /\b[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\([^)]*\))?([/][A-G](#|b)?)?/g;
        return line.replace(chordPattern, '<span style="color: #ff6600; font-weight: bold;">$&</span>');
    }
    
    // Função principal de renderização  
    render(cifraText) {
        if (!cifraText) return '';
        
        // FORMATAÇÃO SIMPLES E EFICAZ - só formatar acordes óbvios
        const textoFormatado = cifraText
            .replace(/\b([A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add|°)?(?:[0-9]+)?(?:\([^)]*\))?(?:\/[A-G](?:#|b)?)?)\b/g, function(match, acorde, offset, string) {
                // Verificar se está em uma linha de tablatura (contém E|, B|, G|, D|, A|, E|)
                const linhaAtual = string.substring(string.lastIndexOf('\n', offset) + 1, string.indexOf('\n', offset) === -1 ? string.length : string.indexOf('\n', offset));
                if (/[EBGDA]\|/.test(linhaAtual)) {
                    return match; // Não formatar tablaturas
                }
                
                // Lista de palavras que são SEMPRE texto, nunca acordes
                const palavrasTexto = ['E', 'De', 'Da', 'Do', 'Na', 'No', 'Se', 'Te', 'Me', 'Que', 'Ele', 'Ela', 'Era', 'Ser', 'Ver', 'Ter', 'Dar', 'Far', 'Vai', 'Vem', 'Som', 'Dom', 'Bem', 'Mal', 'Fim', 'Luz', 'Deus', 'Senhor', 'Rei', 'Grande', 'Forte', 'Fiel', 'Bom', 'Gloria', 'Aleluia', 'Amor', 'Paz', 'Casa', 'Agua', 'Dia', 'Ano', 'Sol', 'Mar', 'Dor', 'Cor', 'Mil', 'Foi', 'Bar', 'Gas', 'Gel', 'Fez', 'Lar', 'Par', 'Rap', 'Pop', 'Rock', 'Samba', 'Bebe', 'Bebi', 'Beba', 'Doce', 'Doer', 'Acre', 'Agua', 'Cada', 'Cena', 'Come', 'Demo', 'Gene', 'Gera', 'Gore', 'Leme', 'Meme', 'Nome', 'Pede', 'Pode', 'Sede', 'Side', 'Site', 'Sobe', 'Take', 'Vale', 'Zone'];
                
                // Se é uma palavra de texto comum, não formatar
                if (palavrasTexto.includes(match)) {
                    return match;
                }
                
                // Formatar acordes verdadeiros (incluindo Em, Am, Bm, etc.)
                if (
                    /[#b°/]/.test(match) ||                    // Tem acidentes ou símbolos
                    /[0-9]/.test(match) ||                     // Tem números
                    /^[A-G]m$/.test(match) ||                  // Acordes menores (Am, Bm, Cm, Dm, Em, Fm, Gm)
                    /^[A-G](maj|min|dim|aug|sus|add)/.test(match) || // Padrões claros de acorde
                    /^[A-G]$/.test(match)                      // Notas simples (A, B, C, D, F, G)
                ) {
                    return `<b style="color: #ff6600;">${match}</b>`;
                }
                
                return match; // Não formatar
            });
        
        return `<pre style="font-family: 'Roboto Mono', 'Courier New', monospace; line-height: 1.4; margin: 0; white-space: pre; overflow-x: auto;">${textoFormatado}</pre>`;
    }
}

// Instância global do renderizador
const cifraRenderer = new CifraRenderer();

// Formatação SIMPLES igual ao Cifra Club
function formatCifraForModal(letra) {
    if (!letra) return '';
    
    // Limpeza MÍNIMA - preservar espaços!
    let textoLimpo = letra
        .replace(/\r\n/g, '\n')        // Normalizar quebras de linha
        .replace(/\r/g, '\n')          // Normalizar quebras de linha
        .replace(/\n{3,}/g, '\n\n');   // Máximo 2 quebras seguidas

    // Processar linha por linha usando a mesma lógica da tela da missa
    const linhas = textoLimpo.split('\n');
    let resultado = '';
    
    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        
        // Verificar se é uma linha de acordes (usando a mesma lógica da tela da missa)
        const isChordLine = /^[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?(\s+[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?)*\s*$/.test(linha.trim()) ||
                           (/\b[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?\b/.test(linha) && 
                            linha.trim().split(/\s+/).every(word => 
                                /^[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?$/.test(word) || word === ''
                            ));
        
        // Verificar se é uma linha com rótulo seguido de acordes (ex: "INTRO: D9 C9 G")
        const isLabelWithChords = /^(INTRO|VERSO|REFRÃO|REFRAO|PONTE|FINAL|CODA|SOLO|INSTRUMENTAL|PRE-REFRÃO|PRE-REFRAO|ESTROFE|CHORUS|BRIDGE|OUTRO):\s*/.test(linha.trim().toUpperCase());
        
        // Verificar se está em uma linha de tablatura
        const isTabLine = /[EBGDA]\|/.test(linha);
        
        if ((isChordLine || isLabelWithChords) && linha.trim() && !isTabLine) {
            // Linha de acordes ou rótulo com acordes - formatar acordes
            if (isLabelWithChords) {
                // Para linhas com rótulo, separar o rótulo dos acordes
                const match = linha.match(/^([^:]+:)\s*(.*)$/);
                if (match) {
                    const rotulo = match[1];
                    const acordesParte = match[2];
                    
                    if (acordesParte.trim()) {
                        // Formatar apenas os acordes após o rótulo
                        const palavrasAcordes = acordesParte.split(/(\s+)/);
                        const acordesFormatados = palavrasAcordes.map(parte => {
                            if (/^\s+$/.test(parte)) return parte;
                            if (parte.trim() && /^[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?$/.test(parte.trim())) {
                                return `<b style="color: #ff6600;">${parte}</b>`;
                            }
                            return parte;
                        }).join('');
                        resultado += rotulo + ' ' + acordesFormatados + '\n';
                    } else {
                        resultado += linha + '\n';
                    }
                } else {
                    resultado += linha + '\n';
                }
            } else {
                // Linha de acordes normal - formatar todos os acordes
                const palavras = linha.split(/(\s+)/);
                const linhaFormatada = palavras.map(parte => {
                    // Se for espaço, manter
                    if (/^\s+$/.test(parte)) return parte;
                    // Se for palavra e não vazia, formatar como acorde
                    if (parte.trim()) {
                        return `<b style="color: #ff6600;">${parte}</b>`;
                    }
                    return parte;
                }).join('');
                resultado += linhaFormatada + '\n';
            }
        } else {
            // Linha normal - não formatar acordes individuais para evitar falsos positivos
            resultado += linha + '\n';
        }
    }
    
    // Retornar com <pre> para preservar TODOS os espaços
    return `<pre style="font-family: 'Roboto Mono', 'Courier New', monospace; line-height: 1.4; margin: 0; white-space: pre; overflow-x: auto;">${resultado}</pre>`;
}

// Detectar se uma linha é tablatura
function isTabLine(linha) {
    const linhaTrimmed = linha.trim();
    
    // Padrão clássico: E|--12b14r12-12~--12------9-----|
    // Corda|notação musical|
    const tabPattern1 = /^[A-Ga-g][\d]?\|[\d\-hpbr~\/\\]*\|?$/;
    
    // Padrão mais flexível com múltiplos caracteres
    const tabPattern2 = /^[A-Ga-g][\d]?\|.*[\d\-~hpbr\/\\].*$/;
    
    // Padrão específico para cordas de guitarra/baixo
    const guitarPattern = /^[EBGDAE]\|[\d\-~hpbr\/\\]*$/;
    
    // Padrão que inclui os símbolos típicos de tablatura
    const symbolPattern = /^[A-Ga-g][\d]?\|.*[\d\-~hpbr\/\\bx\(\)]+.*\|?$/;
    
    // Verifica se tem pelo menos 3 traços seguidos (comum em tabs)
    const dashPattern = /^[A-Ga-g][\d]?\|.*\-{3,}.*$/;
    
    return tabPattern1.test(linhaTrimmed) || 
           tabPattern2.test(linhaTrimmed) ||
           guitarPattern.test(linhaTrimmed) ||
           symbolPattern.test(linhaTrimmed) ||
           dashPattern.test(linhaTrimmed);
}

// Detectar e marcar tablaturas no texto
function detectAndMarkTabs(texto) {
    const linhas = texto.split('\n');
    let resultado = [];
    let dentroDeTab = false;
    
    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        
        // Verifica se é linha de tablatura ou texto relacionado à tablatura
        const isTabRelated = isTabLine(linha) || isTabLabel(linha);
        
        if (isTabRelated) {
            if (!dentroDeTab) {
                resultado.push('<div class="tablatura-section" style="display: block; background: rgba(147, 51, 234, 0.05); padding: 8px; border-radius: 4px; margin: 4px 0; border-left: 3px solid #9333ea;">');
                dentroDeTab = true;
            }
            
            // Se for um rótulo de tab, formatar diferente
            if (isTabLabel(linha)) {
                resultado.push(`<div class="tab-label" style="color: #7c3aed; font-weight: bold; font-size: 12px; margin-bottom: 4px;">${linha}</div>`);
            } else {
                resultado.push(`<div class="tab-line" style="color: #9333ea; font-family: monospace; font-size: 11px;">${linha}</div>`);
            }
        } else {
            // Se estava dentro de tab e agora não é mais, fecha a seção
            if (dentroDeTab) {
                resultado.push('</div>');
                dentroDeTab = false;
            }
            // Aplicar formatação de acordes se não for tablatura
            resultado.push(formatChords(linha));
        }
    }
    
    // Se terminou dentro de uma seção de tab, fecha ela
    if (dentroDeTab) {
        resultado.push('</div>');
    }
    
    return resultado.join('\n');
}

// Função para detectar rótulos/títulos de tablatura
function isTabLabel(linha) {
    const linhaTrimmed = linha.trim();
    
    // Padrões comuns de rótulos de tablatura
    const tabLabelPatterns = [
        /^\[.*tab.*\]/i,           // [Tab - Intro], [Tablatura], etc.
        /^\[.*dedilhado.*\]/i,     // [Dedilhado]
        /^\[.*intro.*tab.*\]/i,    // [Intro - Tab]
        /^\[.*solo.*tab.*\]/i,     // [Solo - Tab]
        /^\[.*riff.*\]/i,          // [Riff]
        /^tab.*:/i,                // Tab:, Tablatura:
        /^dedilhado.*:/i,          // Dedilhado:
        /^riff.*:/i,               // Riff:
        /^\(.*tab.*\)/i,           // (Tab - Intro)
        /^\(.*dedilhado.*\)/i      // (Dedilhado)
    ];
    
    return tabLabelPatterns.some(pattern => pattern.test(linhaTrimmed));
}

// Verificar se a cifra contém tablaturas
function cifraContainsTabs(letra) {
    const linhas = letra.split('\n');
    return linhas.some(linha => isTabLine(linha) || isTabLabel(linha));
}

// Detectar se uma linha contém apenas acordes
function isChordOnlyLine(linha) {
    const linhaTrimmed = linha.trim();
    if (!linhaTrimmed) return false;
    
    // Remove espaços múltiplos e divide palavras
    const palavras = linhaTrimmed.split(/\s+/);
    
    // Verifica se todas as palavras parecem ser acordes
    return palavras.every(palavra => {
        // Padrão para acordes (mais flexível)
        return /^[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\([^)]*\))?([/][A-G](#|b)?)?$/.test(palavra);
    });
}

// Detectar e formatar acordes na cifra
function formatChords(texto) {
    const linhas = texto.split('\n');
    
    return linhas.map(linha => {
        // Verificar se é uma linha de acordes (usando a mesma lógica da tela da missa)
        const isChordLine = /^[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?(\s+[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?)*\s*$/.test(linha.trim()) ||
                           (/\b[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?\b/.test(linha) && 
                            linha.trim().split(/\s+/).every(word => 
                                /^[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?$/.test(word) || word === ''
                            ));
        
        // Verificar se é uma linha com rótulo seguido de acordes (ex: "INTRO: D9 C9 G")
        const isLabelWithChords = /^(INTRO|VERSO|REFRÃO|REFRAO|PONTE|FINAL|CODA|SOLO|INSTRUMENTAL|PRE-REFRÃO|PRE-REFRAO|ESTROFE|CHORUS|BRIDGE|OUTRO):\s*/.test(linha.trim().toUpperCase());
        
        // Verificar se está em uma linha de tablatura
        const isTabLine = /[EBGDA]\|/.test(linha);
        
        if ((isChordLine || isLabelWithChords) && linha.trim() && !isTabLine) {
            // Linha de acordes ou rótulo com acordes - formatar acordes
            if (isLabelWithChords) {
                // Para linhas com rótulo, separar o rótulo dos acordes
                const match = linha.match(/^([^:]+:)\s*(.*)$/);
                if (match) {
                    const rotulo = match[1];
                    const acordesParte = match[2];
                    
                    if (acordesParte.trim()) {
                        // Formatar apenas os acordes após o rótulo
                        const palavrasAcordes = acordesParte.split(/(\s+)/);
                        const acordesFormatados = palavrasAcordes.map(parte => {
                            if (/^\s+$/.test(parte)) return parte;
                            if (parte.trim() && /^[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?$/.test(parte.trim())) {
                                return `<span style="color: #ff6600; font-weight: bold;">${parte}</span>`;
                            }
                            return parte;
                        }).join('');
                        return rotulo + ' ' + acordesFormatados;
                    } else {
                        return linha;
                    }
                } else {
                    return linha;
                }
            } else {
                // Linha de acordes normal - formatar todos os acordes
                const palavras = linha.split(/(\s+)/);
                return palavras.map(parte => {
                    // Se for espaço, manter
                    if (/^\s+$/.test(parte)) return parte;
                    // Se for palavra e não vazia, formatar como acorde
                    if (parte.trim()) {
                        return `<span style="color: #ff6600; font-weight: bold;">${parte}</span>`;
                    }
                    return parte;
                }).join('');
            }
        } else {
            // Linha normal - não formatar acordes individuais para evitar falsos positivos
            return linha;
        }
    }).join('\n');
}



// Funções dos botões
function viewCifra(id) {
    const cifra = cifrasCarregadas.find(c => c.id === id);
    if (!cifra) return;
    
    // Criar modal para exibir a cifra
    showCifraModal(cifra);
}

async function toggleFavorite(id) {
    const button = event.target.closest('button');
    const icon = button.querySelector('i');
    
    try {
        // Verificar se é para adicionar ou remover
        const isFavorited = icon.classList.contains('fas');
        const action = isFavorited ? 'DELETE' : 'POST';
        
        // Fazer chamada para o backend
        const response = await fetch(`/api/favoritos/${id}`, {
            method: action,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Atualizar estado local da cifra
            const cifra = cifrasCarregadas.find(c => c.id === id);
            if (cifra) {
                cifra.isFavorited = !isFavorited;
            }
            
            // Atualizar UI baseado na resposta
            if (action === 'POST') {
                icon.classList.remove('far');
                icon.classList.add('fas');
                button.classList.remove('text-gray-400', 'hover:text-red-500');
                button.classList.add('text-red-500');
                showToast('Adicionado aos favoritos!', 'success');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                button.classList.remove('text-red-500');
                button.classList.add('text-gray-400', 'hover:text-red-500');
                showToast('Removido dos favoritos!', 'info');
            }
        } else {
            showToast(data.error || 'Erro ao atualizar favoritos', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao favoritar cifra:', error);
        showToast('Erro ao atualizar favoritos', 'error');
    }
}

async function addToRepertorio(id) {
    const cifra = cifrasCarregadas.find(c => c.id === id);
    if (!cifra) return;
    
    // Buscar repertórios do usuário
    try {
        const response = await fetch(apiUrl('/api/repertorios'), {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            showToast('Erro ao carregar repertórios', 'error');
            return;
        }
        
        const data = await response.json();
        const repertorios = data.repertorios;
        
        if (repertorios.length === 0) {
            showToast('Você não tem repertórios. Crie um primeiro!', 'info');
            setTimeout(() => {
                window.location.href = '/repertorios.html';
            }, 2000);
            return;
        }
        
        // Mostrar modal para seleção de repertório
        showRepertorioSelectionModal(cifra, repertorios);
        
    } catch (error) {
        console.error('Erro ao buscar repertórios:', error);
        showToast('Erro ao carregar repertórios', 'error');
    }
}

function showRepertorioSelectionModal(cifra, repertorios) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-md w-full">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-lg font-semibold text-gray-900">Adicionar ao Repertório</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="p-6">
                <p class="text-sm text-gray-600 mb-4">Selecione um repertório para adicionar "<strong>${cifra.titulo}</strong>":</p>
                
                <div class="space-y-2 max-h-60 overflow-y-auto">
                    ${repertorios.map(rep => `
                        <button 
                            onclick="adicionarCifraAoRepertorio(${cifra.id}, ${rep.id})"
                            class="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <div class="flex items-center space-x-3">
                                <div class="w-3 h-3 rounded-full" style="background-color: ${rep.cor}"></div>
                                <div class="flex-1">
                                    <div class="font-medium text-gray-900">${rep.nome}</div>
                                    <div class="text-sm text-gray-500">${rep.total_cifras} cifras</div>
                                </div>
                            </div>
                        </button>
                    `).join('')}
                </div>
                
                <div class="mt-4 pt-4 border-t">
                    <button 
                        onclick="window.location.href='/repertorios.html'"
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <i class="fas fa-plus mr-2"></i>
                        Criar Novo Repertório
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fechar modal clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

async function adicionarCifraAoRepertorio(cifraId, repertorioId) {
    try {
        const response = await fetch(apiUrl(`/api/repertorios/${repertorioId}/cifras`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ cifra_id: cifraId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Cifra adicionada ao repertório!', 'success');
            closeModal();
        } else {
            showToast(data.error || 'Erro ao adicionar cifra', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao adicionar cifra:', error);
        showToast('Erro ao adicionar cifra ao repertório', 'error');
    }
}

// Modal para exibir cifra (versão geral)
function showCifraModal(cifra) {
    // Esconder COMPLETAMENTE todos os dropdowns
    document.querySelectorAll('.nav-item-dropdown').forEach(dropdown => {
        dropdown.style.display = 'none';
    });
    
    // Adicionar classe que desabilita TODOS os dropdowns
    document.body.classList.add('modal-open');
    
    // Criar modal dinamicamente
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-6xl w-full max-h-[85vh] min-h-[400px] flex flex-col overflow-hidden">
            <!-- Header fixo -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6 border-b flex-shrink-0">
                <div class="mb-3 md:mb-0">
                    <h3 class="text-xl md:text-2xl font-bold text-gray-900">${cifra.titulo}</h3>
                    <p class="text-gray-600 text-sm md:text-base">${cifra.artista}</p>
                </div>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 self-end md:self-auto">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <!-- Conteúdo scrollável -->
            <div class="flex-1 overflow-y-auto" style="scrollbar-width: thin; max-height: calc(85vh - 200px);">
                <div class="p-4 md:p-6">
                    <div class="space-y-4">
                        <div class="flex flex-wrap items-center gap-2 md:gap-4 mb-4">
                            <span class="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">Tom: ${cifra.tom}</span>
                            <span class="inline-block px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(cifra.categoria)}">${formatCategory(cifra.categoria)}</span>
                            <span class="text-sm text-gray-500"><i class="fas fa-eye mr-1"></i>${cifra.views || 0} visualizações</span>
                        </div>
                        <div class="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                            <div id="cifra-content" style="font-family: 'Roboto Mono', 'Courier New', monospace; white-space: pre; overflow-x: auto;">${detectAndMarkTabs(formatCifraForModal(cifra.letra))}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer fixo -->
            <div class="flex flex-col md:flex-row justify-between items-stretch md:items-center p-4 md:p-6 border-t bg-gray-50 space-y-3 md:space-y-0 flex-shrink-0">
                <div class="flex space-x-2 justify-center md:justify-start">
                    <button class="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm">
                        <i class="fas fa-arrow-up mr-1"></i> Subir Tom
                    </button>
                    <button class="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm">
                        <i class="fas fa-arrow-down mr-1"></i> Baixar Tom
                    </button>
                    ${cifraContainsTabs(cifra.letra) ? `
                    <button onclick="toggleTabs()" id="toggle-tabs-btn" class="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 text-sm">
                        <i class="fas fa-eye-slash mr-1"></i> Ocultar Tab
                    </button>
                    ` : ''}
                </div>
                <div class="flex space-x-2 justify-center md:justify-end">
                    <button onclick="visualizarCifraTelaMissa(${cifra.id})" class="bg-blue-600 text-white px-3 md:px-4 py-2 rounded hover:bg-blue-700 text-sm flex-1 md:flex-initial">
                        <i class="fas fa-eye mr-1"></i> Tela da Missa
                    </button>
                    <button onclick="toggleFavoriteModal(${cifra.id})" class="bg-red-600 text-white px-3 md:px-4 py-2 rounded hover:bg-red-700 text-sm flex-1 md:flex-initial">
                        <i class="fas fa-heart mr-1"></i> Favoritar
                    </button>
                    <button onclick="shareCifra(${cifra.id})" class="bg-green-600 text-white px-3 md:px-4 py-2 rounded hover:bg-green-700 text-sm flex-1 md:flex-initial">
                        <i class="fas fa-share mr-1"></i> Compartilhar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fechar modal clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Modal para exibir cifra em "Minhas Cifras" (com opções de editar, excluir e enviar para comunidade)
function showMinhaCifraModal(cifra) {
    console.log('Mostrando modal da cifra:', cifra); // Debug
    
    // Esconder COMPLETAMENTE todos os dropdowns
    document.querySelectorAll('.nav-item-dropdown').forEach(dropdown => {
        dropdown.style.display = 'none';
    });
    
    // Adicionar classe que desabilita TODOS os dropdowns
    document.body.classList.add('modal-open');
    
    // Determinar status da cifra
    const statusTexto = {
        'privada': 'Privada',
        'pendente': 'Aguardando Análise',
        'aprovada': 'Aprovada - Pública',
        'rejeitada': 'Rejeitada'
    };
    
    const statusCor = {
        'privada': 'bg-gray-100 text-gray-800',
        'pendente': 'bg-yellow-100 text-yellow-800',
        'aprovada': 'bg-green-100 text-green-800',
        'rejeitada': 'bg-red-100 text-red-800'
    };
    
    // Debug do status para o botão
    const statusAnalise = (cifra.status_analise || '').toString().toLowerCase().trim();
    console.log('Status para botão comunidade:', statusAnalise);
    const podeEnviarComunidade = (statusAnalise === 'privada' || statusAnalise === 'rejeitada');
    if (!podeEnviarComunidade) {
        console.log('Botão NÃO será exibido');
    } else {
        console.log('Botão SERÁ exibido');
    }
    
    // Função para destacar acordes (igual tela da missa)
    function highlightChords(text) {
        // Regex para acordes comuns (ex: C, G, F#m, Bb7, etc)
        return text.replace(/([A-G][#b]?m?(?:aj|sus|dim|aug|add)?\d*(?:\/[A-G][#b]?)?)/g, '<span class="text-orange-600 font-bold">$1</span>');
    }
    
    // Criar modal dinamicamente
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-6xl w-full max-h-[85vh] flex flex-col" style="max-height:85vh; min-height:400px;">
            <!-- Header fixo -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6 border-b flex-shrink-0">
                <div class="mb-3 md:mb-0">
                    <h3 class="text-xl md:text-2xl font-bold text-gray-900">${cifra.titulo}</h3>
                    <p class="text-gray-600 text-sm md:text-base">${cifra.artista}</p>
                    <span class="inline-block px-3 py-1 text-sm font-medium rounded-full mt-2 ${statusCor[cifra.status_analise] || statusCor['privada']}">
                        ${statusTexto[cifra.status_analise] || statusTexto['privada']}
                    </span>
                </div>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 self-end md:self-auto">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <!-- Conteúdo scrollável -->
            <div class="flex-1 overflow-y-auto min-h-0" style="max-height:calc(85vh - 140px);">
                <div class="p-4 md:p-6">
                    <div class="space-y-4">
                        <div class="flex flex-wrap items-center gap-2 md:gap-4 mb-4">
                            <span class="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">Tom: ${cifra.tom}</span>
                            <span class="inline-block px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(cifra.categoria)}">${formatCategory(cifra.categoria)}</span>
                            <span class="text-sm text-gray-500"><i class="fas fa-eye mr-1"></i>${cifra.views || 0} visualizações</span>
                        </div>
                        
                        <div class="bg-gray-50 rounded-lg p-4">
                            <div id="cifra-content" style="font-family: 'Roboto Mono', 'Courier New', monospace; white-space: pre; overflow-x: auto;">${detectAndMarkTabs(formatCifraForModal(cifra.letra))}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Botões fixos -->
            <div class="border-t p-4 md:p-6 bg-white flex-shrink-0">
                <div class="flex flex-wrap gap-3 justify-center md:justify-end">
                    <button onclick="editarMinhaCifra(${cifra.id})" class="bg-green-600 text-white px-3 md:px-4 py-2 rounded hover:bg-green-700 text-sm flex-1 md:flex-initial">
                        <i class="fas fa-edit mr-1"></i> Editar
                    </button>
                    <button onclick="excluirMinhaCifra(${cifra.id})" class="bg-red-600 text-white px-3 md:px-4 py-2 rounded hover:bg-red-700 text-sm flex-1 md:flex-initial">
                        <i class="fas fa-trash mr-1"></i> Excluir
                    </button>
                    ${podeEnviarComunidade ? `
                    <button onclick="enviarParaComunidade(${cifra.id})" class="bg-orange-600 text-white px-3 md:px-4 py-2 rounded hover:bg-orange-700 text-sm flex-1 md:flex-initial">
                        <i class="fas fa-share-alt mr-1"></i> Enviar para Comunidade
                    </button>
                    ` : ''}
                    <button onclick="visualizarCifraTelaMissa(${cifra.id})" class="bg-blue-600 text-white px-3 md:px-4 py-2 rounded hover:bg-blue-700 text-sm flex-1 md:flex-initial">
                        <i class="fas fa-eye mr-1"></i> Tela da Missa
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fechar modal clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Função para escapar HTML (evita XSS e mantém formatação)
function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function (c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;'}[c];
    });
}

function closeModal() {
    console.log('🔒 [CLOSE MODAL] Tentando fechar modal...');
    
    // Buscar modal de forma mais flexível
    let modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50'); // Seletor original
    
    if (!modal) {
        // Seletor mais flexível para diferentes tipos de modal
        modal = document.querySelector('.fixed.inset-0');
        console.log('🔍 [CLOSE MODAL] Modal encontrado com seletor flexível:', !!modal);
    }
    
    if (!modal) {
        // Buscar por ID de modal
        modal = document.querySelector('[id*="modal"]');
        console.log('🔍 [CLOSE MODAL] Modal encontrado por ID:', !!modal);
    }
    
    if (modal) {
        console.log('✅ [CLOSE MODAL] Modal encontrado, removendo...', modal.id || modal.className);
        modal.remove();
        console.log('✅ [CLOSE MODAL] Modal removido com sucesso!');
    } else {
        console.warn('⚠️ [CLOSE MODAL] Nenhum modal encontrado para fechar');
        
        // Debug: Listar todos os elementos com fixed
        const allFixed = document.querySelectorAll('.fixed');
        console.log('🔍 [CLOSE MODAL] Elementos com .fixed encontrados:', allFixed.length);
        allFixed.forEach((el, i) => {
            console.log(`  ${i + 1}:`, el.className, el.id);
        });
    }
    
    // Mostrar dropdowns novamente
    document.querySelectorAll('.nav-item-dropdown').forEach(dropdown => {
        dropdown.style.display = '';
    });
    
    // Reabilitar dropdowns quando modal fecha
    document.body.classList.remove('modal-open');
}

function toggleFavoriteModal(id) {
    toggleFavorite(id);
}

function shareCifra(id) {
    const cifra = cifrasCarregadas.find(c => c.id === id);
    if (!cifra) return;
    
    const url = `${window.location.origin}${window.location.pathname}?cifra=${id}`;
    
    if (navigator.share) {
        navigator.share({
            title: `${cifra.titulo} - ${cifra.artista}`,
            text: `Confira esta cifra do OMúsicoCatólico: ${cifra.titulo}`,
            url: url
        });
    } else {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link copiado para a área de transferência!', 'success');
        });
    }
}

// Função para alternar visibilidade das tablaturas
function toggleTabs() {
    const tabSections = document.querySelectorAll('.tablatura-section');
    const toggleBtn = document.getElementById('toggle-tabs-btn');
    const icon = toggleBtn.querySelector('i');
    
    if (tabSections.length === 0) return;
    
    // Verificar estado atual
    const isVisible = tabSections[0].style.display !== 'none';
    
    // Alternar visibilidade das seções de tablatura (inclui rótulos e linhas)
    tabSections.forEach(section => {
        section.style.display = isVisible ? 'none' : 'block';
    });
    
    // Atualizar botão
    if (isVisible) {
        icon.className = 'fas fa-eye mr-1';
        toggleBtn.innerHTML = '<i class="fas fa-eye mr-1"></i> Mostrar Tab';
        showToast('Tablaturas e rótulos ocultados', 'info');
    } else {
        icon.className = 'fas fa-eye-slash mr-1';
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash mr-1"></i> Ocultar Tab';
        showToast('Tablaturas e rótulos exibidos', 'info');
    }
}

// Modal Criar Repertório (como mostrado no print)
function showCreateRepertorioModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center p-4 md:p-6 border-b">
                <h3 class="text-lg font-semibold text-gray-900">Criar Novo Repertório</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-4 md:p-6">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Repertório</label>
                        <input 
                            type="text" 
                            id="repertorioNome"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm md:text-base"
                            placeholder="Digite o nome do repertório"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Descrição (opcional)</label>
                        <textarea 
                            id="repertorioDescricao"
                            rows="3"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm md:text-base"
                            placeholder="Adicione uma descrição para o repertório"
                        ></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Celebração</label>
                        <select 
                            id="tipoCelebracao"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm md:text-base"
                        >
                            <option value="missa">Missa</option>
                            <option value="adoracao">Adoração</option>
                            <option value="novena">Novena</option>
                            <option value="retiro">Retiro</option>
                            <option value="festa">Festa</option>
                            <option value="casamento">Casamento</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 md:p-6 border-t bg-gray-50">
                <button 
                    onclick="closeModal()" 
                    class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium order-2 sm:order-1"
                >
                    Cancelar
                </button>
                <button 
                    onclick="createRepertorio()" 
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium order-1 sm:order-2"
                >
                    Criar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focar no campo nome
    setTimeout(() => {
        document.getElementById('repertorioNome').focus();
    }, 100);
    
    // Fechar modal clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function createRepertorio() {
    const nome = document.getElementById('repertorioNome').value.trim();
    const descricao = document.getElementById('repertorioDescricao').value.trim();
    const tipo = document.getElementById('tipoCelebracao').value;
    
    if (!nome) {
        showToast('Nome do repertório é obrigatório!', 'warning');
        return;
    }
    
    // Simular criação do repertório
    const novoRepertorio = {
        id: Date.now(),
        nome: nome,
        descricao: descricao,
        tipo: tipo,
        cifras: [],
        dataCriacao: new Date()
    };
    
    console.log('Novo repertório criado:', novoRepertorio);
    
    closeModal();
    showToast(`Repertório "${nome}" criado com sucesso!`, 'success');
}

// Sistema de toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white text-sm font-medium shadow-lg transition-all duration-300 transform translate-x-full`;
    
    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
        warning: 'bg-yellow-600'
    };
    
    toast.classList.add(colors[type] || colors.info);
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Funções para adicionar cifra

// 1. Editor de Cifra Manual
async function openCifraEditor() {
    console.log('🎵 [DEBUG] openCifraEditor() foi chamada!');
    // Limpar variável de edição (estamos criando nova cifra)
    window.currentEditingCifraId = null;
    
    closeModal(); // Fechar modal anterior
    
    // Carregar categorias
    const categorias = await loadCategorias();
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Fundo semi-transparente manual
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-xl font-semibold text-gray-900">
                    <i class="fas fa-edit text-blue-600 mr-2"></i>
                    Editor de Cifra
                </h3>
                <button id="close-editor-modal-btn" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="flex flex-col md:flex-row h-[70vh]">
                <!-- Formulário -->
                <div class="w-full md:w-1/3 p-6 border-r border-gray-200 overflow-y-auto">
                    <form id="cifraEditorForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Título</label>
                            <input type="text" id="cifraTitle" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome da música">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Artista</label>
                            <input type="text" id="cifraArtist" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome do artista">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Tom</label>
                            <select id="cifraTom" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="C">C</option>
                                <option value="C#">C#</option>
                                <option value="D">D</option>
                                <option value="D#">D#</option>
                                <option value="E">E</option>
                                <option value="F">F</option>
                                <option value="F#">F#</option>
                                <option value="G">G</option>
                                <option value="G#">G#</option>
                                <option value="A">A</option>
                                <option value="A#">A#</option>
                                <option value="B">B</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                            <select id="cifraCategory" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                ${createCategoryOptions(categorias)}
                            </select>
                        </div>
                        
                        <div class="pt-4">
                            <h4 class="font-medium text-gray-900 mb-2">Dicas de Formatação:</h4>
                            <div class="text-xs text-gray-600 space-y-1">
                                <p><strong>Acordes acima da letra:</strong></p>
                                <p>A&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;B&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;C#m</p>
                                <p>Santa Maria, mãe de Deus</p>
                                <p><strong>Verso:</strong> - Seção</p>
                                <p><strong>Refrão:</strong> - Seção</p>
                                <p>Use quebras de linha para separar versos</p>
                            </div>
                        </div>
                    </form>
                </div>
                
                <!-- Editor de Texto -->
                <div class="flex-1 flex flex-col">
                    <div class="p-4 border-b border-gray-200">
                        <div class="flex flex-wrap gap-2">
                            <button type="button" id="btn-insert-verso" class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">Verso</button>
                            <button type="button" id="btn-insert-refrao" class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">Refrão</button>
                            <button type="button" id="btn-insert-ponte" class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">Ponte</button>
                            <button type="button" id="btn-insert-final" class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">Final</button>
                        </div>
                    </div>
                    
                    <div class="flex-1 p-4">
                        <textarea 
                            id="cifraContent" 
                            class="w-full h-full border border-gray-300 rounded-lg p-4 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Digite a letra e acordes aqui...

Exemplo:
Verso:
     C                Am              F           G
Santa Maria, mãe de Deus
     C           Am           F    G         C
Rogai por nós pecadores

Refrão:
    Am         F         C        G
Ave, ave, ave Maria
    Am         F         C        G
Ave, ave, ave Maria"
                        ></textarea>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-between items-center p-6 border-t bg-gray-50">
                <button id="btn-preview-cifra" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    <i class="fas fa-eye mr-2"></i>Visualizar
                </button>
                <div class="flex space-x-3">
                    <button id="btn-cancel-editor" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button id="btn-save-cifra" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-save mr-2"></i>Salvar Cifra
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners para o modal do editor
    const closeBtn = document.getElementById('close-editor-modal-btn');
    const cancelBtn = document.getElementById('btn-cancel-editor');
    const saveBtn = document.getElementById('btn-save-cifra');
    const previewBtn = document.getElementById('btn-preview-cifra');
    const versoBtn = document.getElementById('btn-insert-verso');
    const refraoBtn = document.getElementById('btn-insert-refrao');
    const ponteBtn = document.getElementById('btn-insert-ponte');
    const finalBtn = document.getElementById('btn-insert-final');
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (saveBtn) saveBtn.addEventListener('click', saveCifra);
    if (previewBtn) previewBtn.addEventListener('click', previewCifra);
    if (versoBtn) versoBtn.addEventListener('click', () => insertText('\n\nVerso:\n'));
    if (refraoBtn) refraoBtn.addEventListener('click', () => insertText('\n\nRefrão:\n'));
    if (ponteBtn) ponteBtn.addEventListener('click', () => insertText('\n\nPonte:\n'));
    if (finalBtn) finalBtn.addEventListener('click', () => insertText('\n\nFinal:\n'));
    
    // Fechar modal clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Abrir editor de cifras com dados pré-preenchidos (para cifras importadas)
async function openCifraEditorWithData(cifraData) {
    console.log('🎵 Abrindo editor com dados da cifra:', cifraData);
    
    // Definir que estamos editando uma cifra existente
    window.currentEditingCifraId = cifraData.id;
    
    closeModal();
    
    // Carregar categorias
    const categorias = await loadCategorias();
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-xl font-semibold text-gray-900">
                    <i class="fas fa-edit text-blue-600 mr-2"></i>
                    Editar Cifra Importada
                </h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="flex flex-col md:flex-row h-[70vh]">
                <!-- Formulário -->
                <div class="w-full md:w-1/3 p-6 border-r border-gray-200 overflow-y-auto">
                    <form id="cifraEditorForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Título</label>
                            <input type="text" id="cifraTitle" value="${(cifraData.titulo || '').replace(/"/g, '&quot;')}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome da música">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Artista</label>
                            <input type="text" id="cifraArtist" value="${(cifraData.artista || '').replace(/"/g, '&quot;')}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome do artista">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Tom</label>
                            <select id="cifraTom" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="C" ${cifraData.tom === 'C' ? 'selected' : ''}>C</option>
                                <option value="C#" ${cifraData.tom === 'C#' ? 'selected' : ''}>C#</option>
                                <option value="D" ${cifraData.tom === 'D' ? 'selected' : ''}>D</option>
                                <option value="D#" ${cifraData.tom === 'D#' ? 'selected' : ''}>D#</option>
                                <option value="E" ${cifraData.tom === 'E' ? 'selected' : ''}>E</option>
                                <option value="F" ${cifraData.tom === 'F' ? 'selected' : ''}>F</option>
                                <option value="F#" ${cifraData.tom === 'F#' ? 'selected' : ''}>F#</option>
                                <option value="G" ${cifraData.tom === 'G' ? 'selected' : ''}>G</option>
                                <option value="G#" ${cifraData.tom === 'G#' ? 'selected' : ''}>G#</option>
                                <option value="A" ${cifraData.tom === 'A' ? 'selected' : ''}>A</option>
                                <option value="A#" ${cifraData.tom === 'A#' ? 'selected' : ''}>A#</option>
                                <option value="B" ${cifraData.tom === 'B' ? 'selected' : ''}>B</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                            <select id="cifraCategory" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                ${createCategoryOptions(categorias, cifraData.categoria)}
                            </select>
                        </div>
                        
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div class="flex items-center mb-2">
                                <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                                <span class="text-sm font-medium text-blue-800">Cifra Importada</span>
                            </div>
                            <p class="text-sm text-blue-700">
                                Esta cifra foi importada automaticamente. Você pode ajustar o título, artista, tom e categoria conforme necessário antes de salvar.
                            </p>
                        </div>
                        
                        <div class="pt-4">
                            <h4 class="font-medium text-gray-900 mb-2">Dicas de Formatação:</h4>
                            <div class="text-xs text-gray-600 space-y-1">
                                <p><strong>Acordes acima da letra:</strong></p>
                                <p>A&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;B&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;C#m</p>
                                <p>Santa Maria, mãe de Deus</p>
                                <p><strong>Verso:</strong> - Seção</p>
                                <p><strong>Refrão:</strong> - Seção</p>
                                <p>Use quebras de linha para separar versos</p>
                            </div>
                        </div>
                    </form>
                </div>
                
                <!-- Editor de Texto -->
                <div class="flex-1 flex flex-col">
                    <div class="p-4 border-b border-gray-200">
                        <div class="flex flex-wrap gap-2">
                            <button type="button" onclick="insertText('\\n\\nVerso:\\n')" class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">Verso</button>
                            <button type="button" onclick="insertText('\\n\\nRefrão:\\n')" class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">Refrão</button>
                            <button type="button" onclick="insertText('\\n\\nPonte:\\n')" class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">Ponte</button>
                            <button type="button" onclick="insertText('\\n\\nFinal:\\n')" class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">Final</button>
                        </div>
                    </div>
                    
                    <div class="flex-1 p-4">
                        <textarea 
                            id="cifraContent" 
                            class="w-full h-full border border-gray-300 rounded-lg p-4 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Digite a letra e acordes aqui..."
                        >${(cifraData.letra || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-between items-center p-6 border-t bg-gray-50">
                <button onclick="previewCifra()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    <i class="fas fa-eye mr-2"></i>Visualizar
                </button>
                <div class="flex space-x-3">
                    <button onclick="closeModal()" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button onclick="saveCifra()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-save mr-2"></i>Salvar Cifra
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focar no campo título para facilitar edição
    setTimeout(() => {
        const titleInput = document.getElementById('cifraTitle');
        if (titleInput) {
            titleInput.focus();
            titleInput.select(); // Selecionar todo o texto para facilitar edição
        }
    }, 100);
}

// 2. Upload de Arquivo
function openCifraUploader() {
    console.log('📁 [DEBUG] openCifraUploader() foi chamada!');
    closeModal();
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Fundo semi-transparente manual
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-lg w-full">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-xl font-semibold text-gray-900">
                    <i class="fas fa-cloud-upload-alt text-purple-600 mr-2"></i>
                    Upload de Cifra
                </h3>
                <button id="close-upload-modal-btn" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="p-6">
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors" id="dropZone">
                    <div class="mb-4">
                        <i class="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
                    </div>
                    <div class="mb-4">
                        <p class="text-lg font-medium text-gray-900 mb-2">Solte os arquivos aqui</p>
                        <p class="text-sm text-gray-600">ou clique para selecionar</p>
                    </div>
                    <div class="flex justify-center">
                        <button id="btn-select-files" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            Selecionar Arquivos
                        </button>
                    </div>
                    <input type="file" id="fileInput" multiple accept=".png,.jpg,.jpeg,.pdf" class="hidden">
                </div>
                
                <div class="mt-4 text-xs text-gray-500">
                    <p><strong>Formatos aceitos:</strong> PNG, JPG, JPEG, PDF</p>
                    <p><strong>Tamanho máximo:</strong> 10MB por arquivo</p>
                </div>
                
                <!-- Opções de processamento -->
                <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 class="font-medium text-blue-900 mb-3 flex items-center">
                        <i class="fas fa-magic mr-2"></i>
                        Modo de Processamento
                    </h4>
                    <div class="space-y-2">
                        <label class="flex items-center">
                            <input type="radio" name="processingMode" value="backend" class="mr-2" checked>
                            <div>
                                <span class="font-medium text-blue-800">Avançado (Recomendado)</span>
                                <div class="text-xs text-blue-600">Preserva estrutura espacial - acordes alinhados sobre as letras</div>
                            </div>
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="processingMode" value="client" class="mr-2">
                            <div>
                                <span class="font-medium text-gray-700">Básico</span>
                                <div class="text-xs text-gray-500">Processamento local - texto corrido</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                <button id="btn-cancel-upload" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancelar
                </button>
                <button id="btn-process-files" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    <i class="fas fa-magic mr-2"></i>Processar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners para o modal de upload
    const closeBtn = document.getElementById('close-upload-modal-btn');
    const cancelBtn = document.getElementById('btn-cancel-upload');
    const processBtn = document.getElementById('btn-process-files');
    const selectFilesBtn = document.getElementById('btn-select-files');
    const fileInput = document.getElementById('fileInput');
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (processBtn) processBtn.addEventListener('click', processUploadedFiles);
    if (selectFilesBtn) selectFilesBtn.addEventListener('click', () => fileInput.click());
    if (fileInput) fileInput.addEventListener('change', handleFileSelect);
    
    // Configurar drag and drop básico
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-purple-500', 'bg-purple-50');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-purple-500', 'bg-purple-50');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-purple-500', 'bg-purple-50');
            const files = Array.from(e.dataTransfer.files);
            selectedFiles = files;
            updateFileList();
        });
    }
    
    // Fechar modal clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Funções auxiliares para editor
function insertText(text) {
    const textarea = document.getElementById('cifraContent');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    
    textarea.value = value.substring(0, start) + text + value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + text.length, start + text.length);
}

// Visualizar cifra existente no formato da Tela da Missa
function visualizarCifraTelaMissa(cifraId) {
    const cifra = cifrasCarregadas.find(c => c.id == cifraId);
    if (!cifra) {
        showToast('Cifra não encontrada!', 'error');
        return;
    }
    
    // Converter categoria para momento litúrgico
    const momentosLiturgicos = {
        'entrada': 'Entrada',
        'ofertorio': 'Ofertório', 
        'comunhao': 'Comunhão',
        'final': 'Final',
        'adoracao': 'Adoração',
        'mariana': 'Mariana'
    };
    
    const momentoLiturgico = momentosLiturgicos[cifra.categoria] || cifra.categoria;
    
    // Processar cifra para formato HTML com fonte monospace
    const cifraProcessada = processarCifraParaTelaMissaMonospace(cifra.letra);
    
    // Determinar número de colunas baseado na altura estimada (melhor distribuição)
    const numeroLinhas = cifraProcessada.split('\n').filter(linha => linha.trim()).length;
    const alturaEstimada = numeroLinhas * 20; // ~20px por linha (line-height 1.4 * 14px font)
    
    // Altura máxima desejada por coluna (considerando viewport típico)
    const alturaMaximaColuna = 700; // Aumentado para aproveitar melhor o espaço
    
    let numeroColunas = 1;
    if (alturaEstimada > alturaMaximaColuna) {
        // Calcular número ideal de colunas baseado na altura
        numeroColunas = Math.ceil(alturaEstimada / alturaMaximaColuna);
        
        // Limitar a 4 colunas máximo para manter legibilidade
        numeroColunas = Math.min(numeroColunas, 4);
        
        // Para cifras muito longas, garantir pelo menos 3 colunas
        if (alturaEstimada > 2000 && numeroColunas < 3) {
            numeroColunas = 3;
        }
    }
    
    // Criar HTML da preview
    const htmlPreview = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cifra.titulo} - ${cifra.artista}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: #f0f0f0;
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
}

.container {
  width: 100vw;
  height: 100vh;
  background-color: white;
  display: flex;
  flex-direction: column;
}

header {
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.titulo {
  color: #d66c00;
  font-weight: 600;
  font-size: 22px;
  letter-spacing: 0.5px;
  font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.botao-inicio {
  background-color: #d66c00;
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
  text-transform: uppercase;
  font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.conteudo {
  background-color: white;
  padding: 20px 30px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cifra-container {
  display: grid;
  gap: 30px;
  height: 100%;
  align-content: start;
}

.cifra-container.cols-1 { grid-template-columns: 1fr; }
.cifra-container.cols-2 { grid-template-columns: 1fr 1fr; }
.cifra-container.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
.cifra-container.cols-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }

.coluna {
  overflow: hidden;
}

.cifra-content {
  font-family: 'Roboto Mono', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  color: #374151;
  white-space: pre;
  overflow-x: auto;
  margin: 0;
  padding: 0;
}

.cifra-content span {
  color: #ff6600;
  font-weight: bold;
}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <span class="titulo">${cifra.titulo.toUpperCase()} ${cifra.artista ? '– ' + cifra.artista.toUpperCase() : ''}</span>
            <button class="botao-inicio">${momentoLiturgico}</button>
        </header>
        <main class="conteudo">
            <!-- Debug: ${numeroLinhas} linhas, altura estimada: ${alturaEstimada}px, ${numeroColunas} colunas -->
            <div class="cifra-container cols-${numeroColunas}">
                ${distribuirEmColunasMonospace(cifraProcessada, numeroColunas)}
            </div>
        </main>
    </div>
</body>
</html>`;
    
    // Abrir preview em nova janela
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
        previewWindow.document.write(htmlPreview);
        previewWindow.document.close();
    } else {
        showToast('Não foi possível abrir a tela da missa. Verifique se o bloqueador de popup está desabilitado.', 'error');
    }
}

// Processar cifra do editor para formato da tela da missa
function processarCifraParaTelaMissa(conteudo) {
    const linhas = conteudo.split('\n');
    let htmlLinhas = [];
    
    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        
        // Pular linhas vazias
        if (!linha.trim()) continue;
        
        // Verificar se a linha contém acordes inline [Acorde]
        const temAcordesInline = /\[[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?\]/g.test(linha);
        
        if (temAcordesInline) {
            // Processar linha com acordes inline
            const linhaProcessada = processarAcordesInline(linha);
            htmlLinhas.push(`
                <div class="linha-cifra">
                    <div class="letra">${linhaProcessada}</div>
                </div>
            `);
        } else {
            // Detectar se é uma linha de acordes (formato tradicional)
            const ehLinhaDeAcordes = detectarLinhaDeAcordes(linha);
            
            if (ehLinhaDeAcordes) {
                // Próxima linha é a letra
                const proximaLinha = i + 1 < linhas.length ? linhas[i + 1] : '';
                
                // Processar linha de acordes mantendo espaçamento original
                const acordesProcessados = linha
                    .replace(/\s/g, '&nbsp;'); // Preservar espaçamento exato
                
                htmlLinhas.push(`
                    <div class="linha-cifra">
                        <span class="acordes">${acordesProcessados}</span>
                        <div class="letra">${proximaLinha}</div>
                    </div>
                `);
                
                i++; // Pular próxima linha pois já foi processada
            } else {
                // Verificar se a próxima linha não é de acordes (linha isolada)
                const proximaLinha = i + 1 < linhas.length ? linhas[i + 1] : '';
                const proximaEhAcorde = detectarLinhaDeAcordes(proximaLinha);
                
                if (!proximaEhAcorde) {
                    // Linha de letra sem acordes acima - verificar se tem acordes isolados
                    const linhaProcessada = melhorarDeteccaoAcordes(linha);
                    htmlLinhas.push(`
                        <div class="linha-cifra">
                            <div class="letra">${linhaProcessada}</div>
                        </div>
                    `);
                }
                // Se a próxima é acorde, esta linha será processada junto com ela
            }
        }
    }
    
    return htmlLinhas.join('');
}

// Nova função para processar acordes inline [Acorde]
function processarAcordesInline(linha) {
    return linha.replace(/\[([A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?)\]/g, 
        '<span class="acorde-inline">$1</span>');
}

// Função para melhorar a detecção de acordes em linhas isoladas
function melhorarDeteccaoAcordes(linha) {
    // Detectar acordes isolados no meio da letra (sem colchetes)
    const acordesRegex = /\b([A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?)\b/g;
    
    // Verificar se a linha tem características de acordes
    const palavras = linha.trim().split(/\s+/);
    let acordesEncontrados = 0;
    
    // Contar quantas palavras são acordes
    palavras.forEach(palavra => {
        if (acordesRegex.test(palavra)) {
            acordesEncontrados++;
        }
        acordesRegex.lastIndex = 0; // Reset regex
    });
    
    // Se mais de 60% das palavras são acordes e não tem palavras muito longas
    const percentualAcordes = acordesEncontrados / palavras.length;
    const temPalavrasLongas = palavras.some(p => p.length > 8);
    
    if (percentualAcordes > 0.6 && !temPalavrasLongas) {
        // Destacar os acordes mesmo sem colchetes
        return linha.replace(/\b([A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?)\b/g, 
            '<span class="acorde-inline">$1</span>');
    }
    
    return linha;
}

// Detectar se uma linha contém acordes
function detectarLinhaDeAcordes(linha) {
    if (!linha || !linha.trim()) return false;
    
    // Padrões de acordes musicais
    const padroesAcordes = [
        /\b[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?/g, // Acordes básicos
        /\b[A-G](#|b)?[0-9]*/g, // Acordes com números
        /\b[A-G](#|b)?(m|M|maj|min|dim|aug|sus|add)/g // Acordes com sufixos
    ];
    
    // Remover espaços e verificar se tem pelo menos 50% de acordes
    const palavras = linha.trim().split(/\s+/).filter(p => p.length > 0);
    if (palavras.length === 0) return false;
    
    let acordesEncontrados = 0;
    
    for (const palavra of palavras) {
        // Verificar se a palavra é um acorde
        const ehAcorde = padroesAcordes.some(padrao => {
            padrao.lastIndex = 0; // Reset regex
            const match = padrao.exec(palavra);
            return match && match[0] === palavra; // Match exato
        });
        
        if (ehAcorde) {
            acordesEncontrados++;
        }
    }
    
    // Se pelo menos 70% das palavras são acordes, considera linha de acordes
    const percentualAcordes = acordesEncontrados / palavras.length;
    return percentualAcordes >= 0.7;
}

// Distribuir linhas em colunas
function distribuirEmColunas(htmlLinhas, numeroColunas) {
    if (numeroColunas === 1) {
        return `<div class="coluna">${htmlLinhas}</div>`;
    }
    
    const linhasArray = htmlLinhas.split('<div class="linha-cifra">').filter(linha => linha.trim());
    const linhasPorColuna = Math.ceil(linhasArray.length / numeroColunas);
    
    let colunas = [];
    
    for (let col = 0; col < numeroColunas; col++) {
        const inicio = col * linhasPorColuna;
        const fim = Math.min(inicio + linhasPorColuna, linhasArray.length);
        const linhasColuna = linhasArray.slice(inicio, fim);
        
        if (linhasColuna.length > 0) {
            const htmlColuna = linhasColuna.map(linha => `<div class="linha-cifra">${linha}`).join('');
            colunas.push(`<div class="coluna">${htmlColuna}</div>`);
        }
    }
    
    return colunas.join('');
}

async function saveCifra() {
    const titulo = document.getElementById('cifraTitle').value.trim();
    const artista = document.getElementById('cifraArtist').value.trim();
    const tom = document.getElementById('cifraTom').value;
    const categoria = document.getElementById('cifraCategory').value;
    const letra = document.getElementById('cifraContent').value.trim();
    
    // Verificar se estamos editando uma cifra existente (importada)
    const isEditing = window.currentEditingCifraId;
    
    console.log('💾 Salvando cifra:', { titulo, artista, tom, categoria, isEditing, cifraId: window.currentEditingCifraId });
    
    // Validação
    if (!titulo || !artista || !letra) {
        showToast('Preencha título, artista e letra da cifra!', 'warning');
        return;
    }
    
    // Verificar autenticação
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
        showToast('Você precisa fazer login para salvar cifras. Use o botão "Login Teste" no canto superior direito.', 'warning');
        return;
    }
    
    // Mostrar loading
    const btnSalvar = document.querySelector('button[onclick="saveCifra()"]');
    const originalText = btnSalvar ? btnSalvar.innerHTML : 'Salvar';
    
    try {
        if (btnSalvar) {
            btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...';
            btnSalvar.disabled = true;
        }
        
        let response;
        const requestData = {
            titulo,
            artista,
            tom,
            categoria,
            letra,
            compositor: artista,
            tags: isEditing ? ['importada', 'editada'] : ['manual']
        };
        
        if (isEditing) {
            // Atualizar cifra existente
            console.log(`🔄 Atualizando cifra ID: ${window.currentEditingCifraId}`);
            response = await fetch(`/api/cifras/${window.currentEditingCifraId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });
        } else {
            // Criar nova cifra
            console.log('➕ Criando nova cifra');
            response = await fetch(apiUrl('/api/cifras/manual'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });
        }
        
        console.log(`📡 Response status: ${response.status}`);
        
        // Verificar se a resposta é válida
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Token inválido ou expirado - tentar fazer login novamente
                console.log('🔑 Token inválido, tentando renovar login...');
                await quickLogin();
                
                // Tentar novamente com novo token
                const newToken = localStorage.getItem('token') || localStorage.getItem('authToken');
                if (newToken && newToken !== token) {
                    console.log('🔄 Tentando novamente com novo token...');
                    
                    if (isEditing) {
                        response = await fetch(`/api/cifras/${window.currentEditingCifraId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${newToken}`
                            },
                            body: JSON.stringify(requestData)
                        });
                    } else {
                        response = await fetch(apiUrl('/api/cifras/manual'), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${newToken}`
                            },
                            body: JSON.stringify(requestData)
                        });
                    }
                    
                    if (!response.ok) {
                        throw new Error(`Erro ${response.status}: ${response.statusText}`);
                    }
                } else {
                    throw new Error('Falha na autenticação. Faça login manualmente.');
                }
            } else {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
        }
        
        const data = await response.json();
        console.log('📄 Response data:', data);
        
        if (data.success) {
            const message = isEditing ? 'Cifra atualizada com sucesso! 🎵' : 'Cifra salva com sucesso! 🎵';
            showToast(message, 'success');
            closeModal();
            
            // Limpar variável de edição
            window.currentEditingCifraId = null;
            
            // Recarregar lista de cifras
            if (typeof carregarCifras === 'function') {
                carregarCifras();
            }
        } else {
            throw new Error(data.message || data.error || 'Erro ao salvar cifra');
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar cifra:', error);
        showToast('Erro ao salvar cifra: ' + error.message, 'error');
    } finally {
        // Restaurar botão sempre
        if (btnSalvar) {
            btnSalvar.innerHTML = originalText;
            btnSalvar.disabled = false;
        }
    }
}

// Função removida - substituída pela nova implementação no setupUrlImportModal

function handleFileSelect(event) {
    const files = event.target.files;
    selectedFiles = Array.from(files);
    
    if (selectedFiles.length === 0) {
        showToast('Nenhum arquivo selecionado', 'warning');
        return;
    }
    
    // Validar arquivos
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    for (const file of selectedFiles) {
        if (!validTypes.includes(file.type)) {
            showToast(`Arquivo ${file.name} não é um formato suportado`, 'error');
            return;
        }
        if (file.size > maxSize) {
            showToast(`Arquivo ${file.name} é muito grande (máximo 10MB)`, 'error');
            return;
        }
    }
    
    // Mostrar arquivos selecionados
    updateFileList();
    showToast(`${selectedFiles.length} arquivo(s) selecionado(s)`, 'success');
}

function updateFileList() {
    // Esta função mostra os arquivos selecionados na interface
    const dropZone = document.getElementById('dropZone');
    if (!dropZone || !selectedFiles || selectedFiles.length === 0) {
        return;
    }
    
    // Criar lista de arquivos
    const fileList = document.createElement('div');
    fileList.className = 'mt-4 space-y-2';
    fileList.innerHTML = `
        <h4 class="font-medium text-gray-900">Arquivos selecionados (${selectedFiles.length}):</h4>
        ${selectedFiles.map((file, index) => `
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded border">
                <div class="flex items-center">
                    <i class="fas fa-file-image text-purple-600 mr-2"></i>
                    <span class="text-sm text-gray-700">${file.name}</span>
                    <span class="text-xs text-gray-500 ml-2">(${(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                </div>
                <button onclick="removeFile(${index})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('')}
    `;
    
    // Remover lista antiga se existir
    const existingList = dropZone.parentNode.querySelector('.file-list');
    if (existingList) {
        existingList.remove();
    }
    
    // Adicionar nova lista
    fileList.classList.add('file-list');
    dropZone.parentNode.insertBefore(fileList, dropZone.nextSibling);
}

function removeFile(index) {
    if (selectedFiles && selectedFiles.length > index) {
        selectedFiles.splice(index, 1);
        updateFileList();
    }
}

async function processUploadedFiles() {
    if (selectedFiles.length === 0) {
        showToast('Nenhum arquivo selecionado', 'warning');
        return;
    }
    
    // Verificar qual modo foi selecionado
    const processingMode = document.querySelector('input[name="processingMode"]:checked')?.value || 'backend';
    
    if (processingMode === 'backend') {
        await processUploadedFilesBackend();
    } else {
        await processUploadedFilesClientSide();
    }
}

// Processamento backend (novo - com preservação de layout)
async function processUploadedFilesBackend() {
    // Verificar se o usuário está logado
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
        showToast('Você precisa fazer login para usar o modo avançado. Use o botão "Login Teste" no canto superior direito.', 'warning');
        return;
    }
    
    // Mostrar progress
    showOCRProgress();
    ocrResults = [];
    
    try {
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            console.log(`Processando arquivo ${i + 1}/${selectedFiles.length} no servidor:`, file.name);
            updateOCRProgress(i + 1, selectedFiles.length, `Processando ${file.name} com IA avançada...`);
            
            // Usar backend para OCR com preservação de layout
            const result = await processFileWithBackend(file);
            ocrResults.push({ 
                filename: file.name, 
                text: result.text, 
                originalText: result.originalText,
                processedBy: result.processedBy 
            });
        }
        
        // Mostrar resultados
        showOCRResults();
        
    } catch (error) {
        console.error('Erro no OCR:', error);
        showToast(`Erro ao processar arquivos: ${error.message}`, 'error');
        hideOCRProgress();
    }
}

// Função alternativa para fallback ao OCR client-side (mantida para compatibilidade)
async function processUploadedFilesClientSide() {
    if (selectedFiles.length === 0) {
        showToast('Nenhum arquivo selecionado', 'warning');
        return;
    }
    
    // Verificar se as bibliotecas OCR estão carregadas
    if (typeof Tesseract === 'undefined') {
        showToast('Biblioteca OCR não carregada. Recarregue a página e tente novamente.', 'error');
        return;
    }
    
    console.log('Tesseract carregado:', typeof Tesseract);
    console.log('PDF.js carregado:', typeof pdfjsLib);
    
    // Mostrar progress
    showOCRProgress();
    ocrResults = [];
    
    try {
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            console.log(`Processando arquivo ${i + 1}/${selectedFiles.length}:`, file.name);
            updateOCRProgress(i + 1, selectedFiles.length, `Processando ${file.name}...`);
            
            if (file.type === 'application/pdf') {
                const text = await extractTextFromPDF(file);
                ocrResults.push({ filename: file.name, text: text });
            } else {
                const text = await extractTextFromImage(file);
                ocrResults.push({ filename: file.name, text: text });
            }
        }
        
        // Mostrar resultados
        showOCRResults();
        
    } catch (error) {
        console.error('Erro no OCR:', error);
        showToast(`Erro ao processar arquivos: ${error.message}`, 'error');
        hideOCRProgress();
    }
}

function showOCRProgress() {
    const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
    if (!modal) return;
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-lg w-full mx-4">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-xl font-semibold text-gray-900">
                    <i class="fas fa-magic text-purple-600 mr-2"></i>
                    Processando OCR
                </h3>
            </div>
            
            <div class="p-6">
                <div class="mb-4">
                    <div class="flex items-center justify-center mb-4">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                    <p id="ocrProgressText" class="text-center text-gray-600">Iniciando processamento...</p>
                </div>
                
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div id="ocrProgressBar" class="bg-purple-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
                
                <div id="ocrProgressDetails" class="mt-4 text-sm text-gray-500 text-center">
                    Aguarde enquanto extraímos o texto das imagens...
                </div>
            </div>
        </div>
    `;
}

function updateOCRProgress(current, total, message) {
    const progressText = document.getElementById('ocrProgressText');
    const progressBar = document.getElementById('ocrProgressBar');
    const progressDetails = document.getElementById('ocrProgressDetails');
    
    if (progressText) progressText.textContent = message;
    if (progressBar) progressBar.style.width = `${(current / total) * 100}%`;
    if (progressDetails) progressDetails.textContent = `${current} de ${total} arquivos processados`;
}

function hideOCRProgress() {
    // Função será chamada quando showOCRResults() for executada
}

async function extractTextFromImage(file) {
    try {
        console.log('Iniciando OCR para:', file.name);
        
        // Verificar se Tesseract está carregado
        if (typeof Tesseract === 'undefined') {
            throw new Error('Tesseract.js não foi carregado corretamente');
        }
        
        const result = await Tesseract.recognize(
            file,
            'por',
            {
                logger: m => {
                    console.log('OCR Progress:', m);
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        updateOCRProgress(0, 1, `Reconhecendo texto... ${progress}%`);
                    }
                }
            }
        );
        
        console.log('OCR concluído:', result.data.text);
        return cleanOCRText(result.data.text);
        
    } catch (error) {
        console.error('Erro detalhado no OCR:', error);
        throw new Error(`Falha no OCR: ${error.message}`);
    }
}

async function extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        
        fileReader.onload = async function() {
            try {
                const typedArray = new Uint8Array(this.result);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                let fullText = '';
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    updateOCRProgress(i, pdf.numPages, `Processando página ${i} do PDF...`);
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n';
                }
                
                resolve(cleanOCRText(fullText));
            } catch (error) {
                reject(error);
            }
        };
        
        fileReader.onerror = () => reject(new Error('Erro ao ler PDF'));
        fileReader.readAsArrayBuffer(file);
    });
}

function cleanOCRText(text) {
    // Limpar e formatar o texto extraído
    return text
        .replace(/\n\s*\n/g, '\n\n'); // Múltiplas quebras de linha
}

function showOCRResults() {
    const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
    if (!modal) return;
    
    const combinedText = ocrResults.map(result => result.text).join('\n\n');
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-xl font-semibold text-gray-900">
                    <i class="fas fa-file-text text-green-600 mr-2"></i>
                    Texto Extraído com Estrutura Preservada
                </h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="flex h-[70vh]">
                <!-- Texto estruturado -->
                <div class="w-1/3 p-6 border-r">
                    <h4 class="font-medium text-gray-900 mb-3">
                        <i class="fas fa-music text-purple-600 mr-2"></i>
                        Cifra com Layout Preservado
                    </h4>
                    <div class="bg-gray-50 p-3 rounded-lg mb-3">
                        <small class="text-gray-600">
                            <i class="fas fa-info-circle mr-1"></i>
                            Acordes posicionados sobre as letras conforme original
                        </small>
                    </div>
                    <textarea id="structuredText" class="w-full h-full p-3 border border-gray-300 rounded-lg text-sm font-mono resize-none bg-green-50" readonly>${combinedText}</textarea>
                </div>
                
                <!-- Texto original -->
                <div class="w-1/3 p-6 border-r">
                    <h4 class="font-medium text-gray-900 mb-3">
                        <i class="fas fa-align-left text-gray-600 mr-2"></i>
                        Texto Original (OCR)
                    </h4>
                    <div class="bg-yellow-50 p-3 rounded-lg mb-3">
                        <small class="text-yellow-700">
                            <i class="fas fa-exclamation-triangle mr-1"></i>
                            Texto corrido sem estrutura espacial
                        </small>
                    </div>
                    <textarea id="extractedText" class="w-full h-full p-3 border border-gray-300 rounded-lg text-sm font-mono resize-none bg-yellow-50" readonly></textarea>
                </div>
                
                <!-- Formulário de cifra -->
                <div class="w-1/3 p-6 overflow-y-auto">
                    <h4 class="font-medium text-gray-900 mb-3">
                        <i class="fas fa-edit text-blue-600 mr-2"></i>
                        Dados da Cifra
                    </h4>
                    <form id="ocrCifraForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Título</label>
                            <input type="text" id="ocrTitulo" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome da música">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Artista</label>
                            <input type="text" id="ocrArtista" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome do artista">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Tom</label>
                            <select id="ocrTom" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="">Selecione o tom</option>
                                <option value="C">C</option>
                                <option value="C#">C#</option>
                                <option value="D">D</option>
                                <option value="D#">D#</option>
                                <option value="E">E</option>
                                <option value="F">F</option>
                                <option value="F#">F#</option>
                                <option value="G">G</option>
                                <option value="G#">G#</option>
                                <option value="A">A</option>
                                <option value="A#">A#</option>
                                <option value="B">B</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                            <select id="ocrCategoria" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="entrada">Entrada</option>
                                <option value="ofertorio">Ofertório</option>
                                <option value="comunhao">Comunhão</option>
                                <option value="final">Final</option>
                                <option value="adoracao">Adoração</option>
                                <option value="mariana">Mariana</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Letra/Cifra Editável</label>
                            <textarea id="ocrLetra" class="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" placeholder="Edite a cifra aqui...">${combinedText}</textarea>
                        </div>
                        
                        <div class="bg-blue-50 p-3 rounded-lg">
                            <div class="flex items-center mb-2">
                                <i class="fas fa-lightbulb text-blue-600 mr-2"></i>
                                <span class="text-sm font-medium text-blue-800">Dicas para Edição:</span>
                            </div>
                            <ul class="text-xs text-blue-700 space-y-1">
                                <li>• Os acordes já estão posicionados sobre as letras</li>
                                <li>• Ajuste manualmente se necessário</li>
                                <li>• Use espaços para alinhar acordes</li>
                            </ul>
                        </div>
                    </form>
                </div>
            </div>
            
            <div class="flex justify-between items-center p-6 border-t bg-gray-50">
                <div class="flex items-center space-x-2 text-sm text-gray-600">
                    <i class="fas fa-robot text-green-600"></i>
                    <span>OCR com preservação de layout espacial ativo</span>
                </div>
                <div class="flex space-x-3">
                    <button onclick="closeModal()" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button onclick="copyStructuredText()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        <i class="fas fa-copy mr-2"></i>Copiar Estruturado
                    </button>
                    <button onclick="processOCRText()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-magic mr-2"></i>Reprocessar
                    </button>
                    <button onclick="saveOCRCifra()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <i class="fas fa-save mr-2"></i>Salvar Cifra
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Preencher texto original se disponível
    if (ocrResults.length > 0 && ocrResults[0].originalText) {
        document.getElementById('extractedText').value = ocrResults.map(result => 
            result.originalText || result.text
        ).join('\n\n');
    } else {
        document.getElementById('extractedText').value = combinedText;
    }
    
    // Tentar extrair automaticamente informações do texto  
    autoFillCifraData(combinedText);
}

// Função para copiar texto estruturado
function copyStructuredText() {
    const structuredText = document.getElementById('structuredText').value;
    navigator.clipboard.writeText(structuredText).then(() => {
        showToast('Texto estruturado copiado para a área de transferência!', 'success');
    }).catch(() => {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = structuredText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Texto estruturado copiado!', 'success');
    });
}

function autoFillCifraData(text) {
    // Tentar extrair título, artista e tom automaticamente
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length > 0) {
        // Primeira linha geralmente é o título
        const firstLine = lines[0].trim();
        document.getElementById('ocrTitulo').value = firstLine;
        
        // Procurar por tom (padrões como "Tom: C", "em C", etc.)
        const tomMatch = text.match(/(?:tom:?\s*|em\s+)([A-G][#b]?)/i);
        if (tomMatch) {
            document.getElementById('ocrTom').value = tomMatch[1].toUpperCase();
        }
        
        // Procurar por artista (padrões como "por:", "de:", etc.)
        const artistMatch = text.match(/(?:por:?\s*|de:?\s*|artista:?\s*)([^\n]+)/i);
        if (artistMatch) {
            document.getElementById('ocrArtista').value = artistMatch[1].trim();
        }
    }
}

function processOCRText() {
    const text = document.getElementById('extractedText').value;
    const processedText = formatCifraText(text);
    document.getElementById('ocrLetra').value = processedText;
    showToast('Texto processado e formatado!', 'success');
}

function formatCifraText(text) {
    // Processar e formatar o texto para o padrão de cifra
    let lines = text.split('\n');
    let formattedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        if (!line) {
            formattedLines.push('');
            continue;
        }
        
        // Verificar se é uma linha de acordes
        if (isChordLine(line)) {
            formattedLines.push(line);
        } else {
            // É uma linha de letra
            formattedLines.push(line);
        }
    }
    
    return formattedLines.join('\n');
}

function isChordLine(line) {
    // Verificar se a linha contém principalmente acordes
    const chordPattern = /[A-G][#b]?(?:m|maj|dim|aug|sus|add)?[0-9]*/g;
    const chords = line.match(chordPattern) || [];
    const words = line.split(/\s+/).filter(word => word.length > 0);
    
    // Se mais de 50% das palavras são acordes, considerar linha de acorde
    return chords.length > 0 && (chords.length / words.length) > 0.5;
}

async function saveOCRCifra() {
    const titulo = document.getElementById('ocrTitulo').value.trim();
    const artista = document.getElementById('ocrArtista').value.trim();
    const tom = document.getElementById('ocrTom').value;
    const categoria = document.getElementById('ocrCategoria').value;
    const letra = document.getElementById('ocrLetra').value.trim();
    
    if (!titulo || !letra) {
        showToast('Título e letra são obrigatórios!', 'warning');
        return;
    }
    
    // Verificar se o usuário está logado
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
        showToast('Você precisa fazer login para salvar cifras. Use o botão "Login Teste" no canto superior direito.', 'warning');
        return;
    }
    
    try {
        const response = await fetch(apiUrl('/api/cifras/manual'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                titulo,
                artista,
                tom,
                categoria,
                letra,
                compositor: artista,
                tags: ['ocr']
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Cifra salva com sucesso!', 'success');
            closeModal();
            // Recarregar lista de cifras
            carregarCifras();
        } else {
            showToast(data.error || 'Erro ao salvar cifra', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao salvar cifra:', error);
        showToast('Erro ao salvar cifra', 'error');
    }
}

// Funções para navegação principal - SIMPLIFICADAS
function filtrarFavoritas() {
    window.location.href = '/favoritas';
}

function filtrarMinhasCifras() {
    window.location.href = '/minhas-cifras';  
}

function goToHome() {
    window.location.href = '/inicio';
}

// Resetar estado da navegação (usado quando página carrega)
function resetNavigationState() {
    // Resetar todos os tabs para estado inativo
    document.querySelectorAll('.nav-item').forEach(item => {
        // Remove todas as classes de estado ativo
        item.classList.remove('active', 'text-blue-600', 'bg-white', 'shadow-sm', 'font-medium');
        // Adiciona classes de estado inativo
        item.classList.add('text-gray-700');
        
        // Resetar ícones
        const icon = item.querySelector('i');
        if (icon) {
            icon.classList.remove('text-blue-600', 'text-blue-500');
            icon.classList.add('text-gray-500');
        }
    });
    
    // Ativar apenas o tab "Início" por padrão
    const inicioTab = document.querySelector('a[href="index.html"]');
    if (inicioTab) {
        updateActiveNavItem('inicio');
    }
}

// Função simples para ativar item de navegação
function updateActiveNavItem(activeItem) {
    // Resetar todos os itens
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active', 'text-blue-600', 'bg-white', 'shadow-sm', 'font-medium');
        item.classList.add('text-gray-700');
        
        const icon = item.querySelector('i');
        if (icon) {
            icon.classList.remove('text-blue-600', 'text-blue-500');
            icon.classList.add('text-gray-500');
        }
    });
    
    // Ativar item específico
    let activeElement = null;
    switch(activeItem) {
        case 'inicio':
            activeElement = document.querySelector('a[href="index.html"]');
            break;
        case 'favoritas':
            activeElement = document.querySelector('a[href*="favoritas"]');
            break;
        case 'minhas-cifras':
            activeElement = document.querySelector('a[href*="minhas-cifras"]');
            break;
        case 'categorias':
            activeElement = document.querySelector('a[href="categorias.html"]');
            break;
    }
    
    if (activeElement) {
        activeElement.classList.add('text-blue-600', 'bg-white', 'shadow-sm');
        activeElement.classList.remove('text-gray-700');
        
        const icon = activeElement.querySelector('i');
        if (icon) {
            icon.classList.add('text-blue-600');
            icon.classList.remove('text-gray-500');
        }
    }
}

// Função para carregar categorias do backend
async function loadCategorias() {
    try {
        const response = await fetch(apiUrl('/api/cifras/categorias'));
        const categorias = await response.json();
        
        return categorias.map(categoria => ({
            value: categoria,
            label: formatCategory(categoria)
        }));
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        // Fallback para categorias padrão
        return [
            { value: 'entrada', label: 'Entrada' },
            { value: 'gloria', label: 'Glória' },
            { value: 'salmo', label: 'Salmo' },
            { value: 'aleluia', label: 'Aleluia' },
            { value: 'ofertorio', label: 'Ofertório' },
            { value: 'santo', label: 'Santo' },
            { value: 'comunhao', label: 'Comunhão' },
            { value: 'final', label: 'Final' },
            { value: 'adoracao', label: 'Adoração' },
            { value: 'maria', label: 'Maria' },
            { value: 'natal', label: 'Natal' },
            { value: 'pascoa', label: 'Páscoa' },
            { value: 'outras', label: 'Outras' }
        ];
    }
}

// Função para criar options de categoria
function createCategoryOptions(categorias, selectedValue = '') {
    return categorias.map(cat => 
        `<option value="${cat.value}" ${selectedValue === cat.value ? 'selected' : ''}>${cat.label}</option>`
    ).join('');
}

// Função para login rápido (apenas para testes)
async function quickLogin() {
    try {
        const response = await fetch(apiUrl('/api/auth/login'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@omusicacatolico.com',
                password: 'admin123'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            updateAuthUI();
            showToast('Login realizado com sucesso!', 'success');
        } else {
            showToast('Erro no login: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Erro no login rápido:', error);
        showToast('Erro no login', 'error');
    }
}

// Atualizar interface baseada no status de autenticação
function updateAuthUI() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    const notLoggedIn = document.getElementById('notLoggedIn');
    const loggedIn = document.getElementById('loggedIn');
    
    // Elementos mobile
    const notLoggedInMobile = document.getElementById('notLoggedInMobile');
    const loggedInMobile = document.getElementById('loggedInMobile');
    
    if (token && user) {
        // Usuário logado
        if (notLoggedIn) notLoggedIn.classList.add('hidden');
        if (loggedIn) loggedIn.classList.remove('hidden');
        if (notLoggedInMobile) notLoggedInMobile.classList.add('hidden');
        if (loggedInMobile) loggedInMobile.classList.remove('hidden');
        
        try {
            const userData = JSON.parse(user);
            const nomeUsuario = userData.nome || 'Usuário';
            const iniciaisUsuario = nomeUsuario.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            
            // Atualizar TODOS os elementos de nome (desktop e mobile)
            const userNameElements = document.querySelectorAll('#userName, #userNameDropdown, #userNameMobile');
            userNameElements.forEach(el => {
                if (el) el.textContent = nomeUsuario;
            });
            
            // Atualizar TODOS os elementos de iniciais (desktop e mobile)
            const userInitialsElements = document.querySelectorAll('#userInitials, #userInitialsMobile');
            userInitialsElements.forEach(el => {
                if (el) el.textContent = iniciaisUsuario;
            });
            
        } catch (e) {
            console.error('Erro ao parsear dados do usuário:', e);
        }
    } else {
        // Usuário não logado
        if (notLoggedIn) notLoggedIn.classList.remove('hidden');
        if (loggedIn) loggedIn.classList.add('hidden');
        if (notLoggedInMobile) notLoggedInMobile.classList.remove('hidden');
        if (loggedInMobile) loggedInMobile.classList.add('hidden');
    }
}

// Função logout removida - usando a do auth.js para evitar conflitos
// function logout() {
//     localStorage.removeItem('token');
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('user');
//     updateAuthUI();
//     showToast('Logout realizado com sucesso!', 'success');
// }

// Verificar autenticação na inicialização
// Comentado para evitar conflitos com páginas específicas
// document.addEventListener('DOMContentLoaded', function() {
//     updateAuthUI();
// });

// Função para usar o backend (OCR com preservação de layout)
async function processFileWithBackend(file) {
    const formData = new FormData();
    formData.append('arquivo', file);
    
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    console.log('Token encontrado:', token ? 'Sim' : 'Não');
    console.log('Token (primeiros 20 chars):', token ? token.substring(0, 20) + '...' : 'null');
    
    if (!token) {
        throw new Error('Usuário não está logado. Faça login primeiro.');
    }
    
    try {
        console.log('Enviando requisição para:', apiUrl('/api/cifras/upload'));
        const response = await fetch(apiUrl('/api/cifras/upload'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.status === 403) {
            // Token inválido - tentar fazer login novamente
            console.log('Token inválido, tentando renovar login...');
            await quickLogin();
            
            // Tentar novamente com novo token
            const newToken = localStorage.getItem('token') || localStorage.getItem('authToken');
            if (newToken && newToken !== token) {
                console.log('Tentando novamente com novo token...');
                const retryResponse = await fetch(apiUrl('/api/cifras/upload'), {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${newToken}`
                    },
                    body: formData
                });
                
                const retryData = await retryResponse.json();
                if (!retryData.success) {
                    throw new Error(retryData.message || 'Erro no processamento após renovação do token');
                }
                
                return {
                    text: retryData.ocrText || retryData.cifra?.letra,
                    originalText: retryData.originalText,
                    processedBy: retryData.processedBy || 'Backend OCR',
                    cifraInfo: retryData.cifra
                };
            } else {
                throw new Error('Falha na autenticação. Faça login manualmente.');
            }
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!data.success) {
            throw new Error(data.message || 'Erro no processamento');
        }
        
        return {
            text: data.ocrText || data.cifra?.letra,
            originalText: data.originalText,
            processedBy: data.processedBy || 'Backend OCR',
            cifraInfo: data.cifra
        };
        
    } catch (error) {
        console.error('Erro no backend OCR:', error);
        throw new Error(`Falha no processamento do arquivo ${file.name}: ${error.message}`);
    }
}

// Função alternativa para fallback ao OCR client-side (mantida para compatibilidade)

// Nova funcionalidade: Importação por URL
function setupUrlImportModal() {
    // Verificar se modal já existe para evitar duplicação
    const existingModal = document.getElementById('url-import-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Criar modal para importação por URL
    const importModal = document.createElement('div');
    importModal.id = 'url-import-modal';
    importModal.className = 'modal fade';
    importModal.setAttribute('tabindex', '-1');
    importModal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-link text-primary"></i>
                        Importar Cifra por Link
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="url-import-form">
                        <div class="mb-3">
                            <label for="cifra-url" class="form-label">URL da Cifra</label>
                            <input type="url" 
                                   class="form-control" 
                                   id="cifra-url" 
                                   placeholder="https://www.cifraclub.com.br/..." 
                                   required>
                            <div class="form-text">
                                Sites suportados: Cifra Club, Vagalume, Letras.mus.br, Super Partituras
                            </div>
                        </div>
                        
                        <div id="url-validation-feedback" class="mt-2"></div>
                        
                        <div class="d-flex justify-content-end gap-2">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cancelar
                            </button>
                            <button type="button" class="btn btn-primary" id="check-url-btn">
                                <i class="fas fa-search"></i>
                                Verificar URL
                            </button>
                            <button type="submit" class="btn btn-success" id="import-url-btn" style="display: none;">
                                <i class="fas fa-download"></i>
                                Importar Cifra
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(importModal);
    
    // Configurar event listeners APÓS adicionar ao DOM
    setTimeout(() => {
        setupModalEventListeners();
    }, 100);
    
    // Adicionar botão para abrir modal na interface principal - removido para não aparecer na página principal
    // addImportUrlButton();
}

// Configurar event listeners do modal separadamente
function setupModalEventListeners() {
    const urlInput = document.getElementById('cifra-url');
    const checkUrlBtn = document.getElementById('check-url-btn');
    const importUrlBtn = document.getElementById('import-url-btn');
    const validationFeedback = document.getElementById('url-validation-feedback');
    const modalElement = document.getElementById('url-import-modal');
    
    if (!urlInput || !checkUrlBtn || !importUrlBtn) {
        console.error('Elementos do modal não encontrados');
        return;
    }
    
    // Verificar URL quando clicar no botão
    checkUrlBtn.onclick = async function() {
        const url = urlInput.value.trim();
        
        if (!url) {
            showValidationFeedback('Por favor, insira uma URL.', 'danger');
            return;
        }
        
        checkUrlBtn.disabled = true;
        checkUrlBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Verificando...';
        
        try {
            const result = await checkUrlSupport(url);
            handleUrlCheckResult(result);
        } catch (error) {
            console.error('Erro ao verificar URL:', error);
            showValidationFeedback(`Erro: ${error.message}`, 'danger');
        }
        
        checkUrlBtn.disabled = false;
        checkUrlBtn.innerHTML = '<i class="fas fa-search"></i> Verificar URL';
    };
    
    // Importar cifra quando submeter formulário
    const form = document.getElementById('url-import-form');
    form.onsubmit = async function(e) {
        e.preventDefault();
        
        const url = urlInput.value.trim();
        
        if (!url) {
            showValidationFeedback('Por favor, insira uma URL.', 'danger');
            return;
        }
        
        importUrlBtn.disabled = true;
        importUrlBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Importando...';
        
        try {
            const result = await importCifraFromUrlModal(url);
            handleImportResult(result);
        } catch (error) {
            console.error('Erro na importação:', error);
            showValidationFeedback(`Erro na importação: ${error.message}`, 'danger');
            
            importUrlBtn.disabled = false;
            importUrlBtn.innerHTML = '<i class="fas fa-download"></i> Importar Cifra';
        }
    };
    
    // Reset modal quando fechar
    modalElement.addEventListener('hidden.bs.modal', () => {
        form.reset();
        validationFeedback.innerHTML = '';
        importUrlBtn.style.display = 'none';
        checkUrlBtn.style.display = 'inline-block';
        
        // Reset button states
        checkUrlBtn.disabled = false;
        importUrlBtn.disabled = false;
        checkUrlBtn.innerHTML = '<i class="fas fa-search"></i> Verificar URL';
        importUrlBtn.innerHTML = '<i class="fas fa-download"></i> Importar Cifra';
    });
}

// Verificar se URL é suportada
async function checkUrlSupport(url) {
    console.log('🧪 Testando rota simples primeiro...');
    
    // TESTE: Primeiro verificar se a rota simples funciona
    try {
        const testResponse = await fetch(apiUrl('/api/cifras/test-check-url'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });
        
        console.log('🧪 Resposta da rota de teste:', testResponse.status);
        
        if (!testResponse.ok) {
            console.error('❌ Rota de teste falhou:', testResponse.status);
        } else {
            const testData = await testResponse.json();
            console.log('✅ Rota de teste funcionou:', testData);
        }
    } catch (testError) {
        console.error('❌ Erro na rota de teste:', testError);
    }
    
    // Agora tentar a rota real
    console.log('🔍 Tentando rota real...');
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    console.log('🔑 Token:', token ? 'presente' : 'ausente');
    
            const response = await fetch(apiUrl('/api/cifras/check-url-public'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    });
    
    console.log('📝 Resposta da rota real:', response.status);
    
    if (!response.ok) {
        throw new Error('Erro ao verificar URL');
    }
    
    return await response.json();
}

// Importar cifra da URL (versão para modal)
async function importCifraFromUrlModal(url) {
    const response = await fetch(apiUrl('/api/cifras/import-url-public'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao importar cifra');
    }
    
    return await response.json();
}

// Lidar com resultado da verificação de URL
function handleUrlCheckResult(result) {
    const validationFeedback = document.getElementById('url-validation-feedback');
    const checkUrlBtn = document.getElementById('check-url-btn');
    const importUrlBtn = document.getElementById('import-url-btn');
    
    if (result.supported) {
        if (result.alreadyExists) {
            showValidationFeedback(
                `✅ Site ${result.site} suportado! ⚠️ Esta cifra já foi importada.`,
                'warning'
            );
            importUrlBtn.style.display = 'none';
        } else {
            showValidationFeedback(
                `✅ Site ${result.site} suportado! Pronto para importar.`,
                'success'
            );
            checkUrlBtn.style.display = 'none';
            importUrlBtn.style.display = 'inline-block';
        }
    } else {
        const supportedSites = result.supportedSites?.join(', ') || 'sites suportados';
        showValidationFeedback(
            `❌ ${result.message}<br><small>Sites suportados: ${supportedSites}</small>`,
            'danger'
        );
        importUrlBtn.style.display = 'none';
    }
}

// Lidar com resultado da importação
function handleImportResult(result) {
    console.log('Resultado da importação:', result);
    
    const modalElement = document.getElementById('url-import-modal');
    const importUrlBtn = document.getElementById('import-url-btn');
    
    // Resetar estado do botão
    if (importUrlBtn) {
        importUrlBtn.disabled = false;
        importUrlBtn.innerHTML = '<i class="fas fa-download"></i> Importar Cifra';
    }
    
    if (result.success) {
        // Fechar modal
        try {
            const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modal.hide();
        } catch (error) {
            console.log('Erro ao fechar modal (não crítico):', error);
        }
        
        // Mostrar sucesso
        showToast(`🎵 Cifra "${result.cifra.titulo}" importada com sucesso!`, 'success');
        
        // Recarregar lista de cifras se estivermos na página principal
        if (typeof carregarCifras === 'function') {
            setTimeout(() => {
                carregarCifras();
            }, 1000);
        }
        
        // Opcional: abrir a cifra importada
        if (result.cifra.id) {
            setTimeout(() => {
                viewCifra(result.cifra.id);
            }, 2000);
        }
    } else {
        showValidationFeedback(`❌ ${result.message}`, 'danger');
    }
}

// Mostrar feedback de validação
function showValidationFeedback(message, type) {
    const validationFeedback = document.getElementById('url-validation-feedback');
    validationFeedback.innerHTML = `
        <div class="alert alert-${type} alert-sm mb-0">
            ${message}
        </div>
    `;
}

// Adicionar botão de importação por URL na interface
// Função removida - deve aparecer apenas no processo de adicionar cifra
// function addImportUrlButton() {
//     // Procurar onde adicionar o botão (próximo ao upload ou criar cifra)
//     const uploadSection = document.querySelector('.upload-section, #upload-modal, .btn-group');
//     
//     if (uploadSection) {
//         const importUrlBtn = document.createElement('button');
//         importUrlBtn.className = 'btn btn-outline-primary';
//         importUrlBtn.setAttribute('data-bs-toggle', 'modal');
//         importUrlBtn.setAttribute('data-bs-target', '#url-import-modal');
//         importUrlBtn.innerHTML = `
//             <i class="fas fa-link"></i>
//             Importar por Link
//         `;
//         
//         // Adicionar botão na interface
//         if (uploadSection.classList.contains('btn-group')) {
//             uploadSection.appendChild(importUrlBtn);
//         } else {
//             uploadSection.appendChild(importUrlBtn);
//         }
//     }
//     
//     // Também adicionar no menu de ações principais se existir
//     const mainActions = document.querySelector('.main-actions, .page-actions');
//     if (mainActions) {
//         const separator = document.createElement('span');
//         separator.innerHTML = ' | ';
//         
//         const linkImportBtn = document.createElement('a');
//         linkImportBtn.href = '#';
//         linkImportBtn.className = 'text-primary text-decoration-none';
//         linkImportBtn.setAttribute('data-bs-toggle', 'modal');
//         linkImportBtn.setAttribute('data-bs-target', '#url-import-modal');
//         linkImportBtn.innerHTML = `
//             <i class="fas fa-link"></i>
//             Importar Link
//         `;
//         
//         mainActions.appendChild(separator);
//         mainActions.appendChild(linkImportBtn);
//     }
// }

// Abrir modal de importação por URL (nova função)
function openUrlImportModal(prefilledUrl = '') {
    console.log('🔗 [DEBUG] openUrlImportModal() foi chamada!');
    closeModal(); // Fechar modal anterior
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Fundo semi-transparente manual
    modal.id = 'url-import-modal-debug'; // ID para debug
    
    console.log('🔗 [DEBUG] Modal criado:', modal);
    console.log('🔗 [DEBUG] Modal className:', modal.className);
    console.log('🔗 [DEBUG] Modal style:', modal.style.cssText);
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-lg w-full">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-xl font-semibold text-gray-900">
                    <i class="fas fa-link text-green-600 mr-2"></i>
                    Importar Cifra por Link
                </h3>
                <button id="close-modal-btn" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="p-6">
                <form id="url-import-form-simple">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">URL da Cifra</label>
                        <input 
                            type="url" 
                            id="cifra-url-simple" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="https://www.cifraclub.com.br/..." 
                            value="${prefilledUrl}"
                            required>
                        <div class="mt-2 text-sm text-gray-600">
                            Sites suportados: Cifra Club, Vagalume, Letras.mus.br, Super Partituras
                        </div>
                    </div>
                    
                    <div id="url-validation-feedback-simple" class="mb-4"></div>
                    
                    <div class="flex justify-end space-x-3">
                        <button type="button" id="cancel-modal-btn" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="button" id="check-url-btn-simple" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-search mr-2"></i>Verificar URL
                        </button>
                        <button type="submit" id="import-url-btn-simple" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" style="display: none;">
                            <i class="fas fa-download mr-2"></i>Importar Cifra
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    console.log('🔗 [DEBUG] Modal adicionado ao DOM!');
    console.log('🔗 [DEBUG] Modal no DOM?', document.getElementById('url-import-modal-debug'));
    console.log('🔗 [DEBUG] Body children count:', document.body.children.length);
    console.log('🔗 [DEBUG] Modal computed style:', window.getComputedStyle(modal));
    
    // Event listeners são gerenciados pela delegação global
    console.log('🔗 [DEBUG] Event listeners gerenciados pela delegação global de eventos');
    
    // Fechar modal clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Event listeners para o modal simples
function setupSimpleModalEventListeners() {
    const form = document.getElementById('url-import-form-simple');
    const urlInput = document.getElementById('cifra-url-simple');
    const checkBtn = document.getElementById('check-url-btn-simple');
    const importBtn = document.getElementById('import-url-btn-simple');
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-modal-btn');
    
    // Botões de fechar modal
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    // Verificar URL
    if (checkBtn) {
        checkBtn.addEventListener('click', async function() {
            const url = urlInput.value.trim();
            
            if (!url) {
                showValidationFeedbackSimple('Por favor, insira uma URL.', 'error');
                return;
            }
            
            checkBtn.disabled = true;
            checkBtn.innerHTML = '<span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>Verificando...';
            
            try {
                const result = await checkUrlSupport(url);
                handleUrlCheckResultSimple(result);
            } catch (error) {
                console.error('Erro ao verificar URL:', error);
                showValidationFeedbackSimple(`Erro: ${error.message}`, 'error');
            }
            
            checkBtn.disabled = false;
            checkBtn.innerHTML = '<i class="fas fa-search mr-2"></i>Verificar URL';
        });
    }
    
    // Importar cifra
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const url = urlInput.value.trim();
            
            if (!url) {
                showValidationFeedbackSimple('Por favor, insira uma URL.', 'error');
                return;
            }
            
            importBtn.disabled = true;
            importBtn.innerHTML = '<span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>Importando...';
            
            try {
                const result = await importCifraFromUrlModal(url);
                handleImportResultSimple(result);
            } catch (error) {
                console.error('Erro na importação:', error);
                showValidationFeedbackSimple(`Erro na importação: ${error.message}`, 'error');
                
                importBtn.disabled = false;
                importBtn.innerHTML = '<i class="fas fa-download mr-2"></i>Importar Cifra';
            }
        });
    }
}

// Funções auxiliares para o modal simples
function showValidationFeedbackSimple(message, type) {
    const validationFeedback = document.getElementById('url-validation-feedback-simple');
    const bgColor = type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
                   type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
                   'bg-yellow-50 border-yellow-200 text-yellow-800';
    
    validationFeedback.innerHTML = `
        <div class="p-3 rounded-lg border ${bgColor} text-sm">
            ${message}
        </div>
    `;
}

function handleUrlCheckResultSimple(result) {
    const checkBtn = document.getElementById('check-url-btn-simple');
    const importBtn = document.getElementById('import-url-btn-simple');
    
    if (result.supported) {
        if (result.alreadyExists) {
            showValidationFeedbackSimple(
                `✅ Site ${result.site} suportado! ⚠️ Esta cifra já foi importada.`,
                'warning'
            );
            importBtn.style.display = 'none';
        } else {
            showValidationFeedbackSimple(
                `✅ Site ${result.site} suportado! Pronto para importar.`,
                'success'
            );
            checkBtn.style.display = 'none';
            importBtn.style.display = 'inline-block';
        }
    } else {
        const supportedSites = result.supportedSites?.join(', ') || 'sites suportados';
        showValidationFeedbackSimple(
            `❌ ${result.message}<br><small>Sites suportados: ${supportedSites}</small>`,
            'error'
        );
        importBtn.style.display = 'none';
    }
}

function handleImportResultSimple(result) {
    const importBtn = document.getElementById('import-url-btn-simple');
    
    // Resetar estado do botão
    if (importBtn) {
        importBtn.disabled = false;
        importBtn.innerHTML = '<i class="fas fa-download mr-2"></i>Importar Cifra';
    }
    
    if (result.success) {
        // Fechar modal
        closeModal();
        
        // Mostrar sucesso
        showToast(`🎵 Cifra "${result.cifra.titulo}" importada com sucesso! Abrindo editor para ajustes...`, 'success');
        
        // Recarregar lista de cifras se estivermos na página principal
        if (typeof carregarCifras === 'function') {
            setTimeout(() => {
                carregarCifras();
            }, 1000);
        }
        
        // Abrir editor de cifras com os dados importados para permitir ajustes
        if (result.cifra) {
            setTimeout(async () => {
                await openCifraEditorWithData(result.cifra);
            }, 1500);
        }
    } else {
        showValidationFeedbackSimple(`❌ ${result.message}`, 'error');
    }
}

// ========== BANNER CAROUSEL FUNCTIONS ==========

let currentBannerSlide = 0;
let bannerInterval;
let activeBanners = [];

// Inicializar carousel de banners
function initializeBannerCarousel() {
    const bannerSlides = document.getElementById('bannerSlides');
    const bannerDots = document.getElementById('bannerDots');
    const arrowLeft = document.getElementById('bannerArrowLeft');
    const arrowRight = document.getElementById('bannerArrowRight');
    
    if (!bannerSlides) return;
    
    // Event listeners para navegação
    if (arrowLeft) {
        arrowLeft.addEventListener('click', () => {
            previousBannerSlide();
        });
    }
    
    if (arrowRight) {
        arrowRight.addEventListener('click', () => {
            nextBannerSlide();
        });
    }
    
    // Autoplay (opcional)
    startBannerAutoplay();
    
    // Pausar autoplay no hover
    const carouselContainer = document.querySelector('.banner-carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopBannerAutoplay);
        carouselContainer.addEventListener('mouseleave', startBannerAutoplay);
    }
}

// Carregar banners do servidor
async function loadBanners() {
    try {
        const response = await fetch(apiUrl('/api/banners'));
        const data = await response.json();
        
        if (data.success) {
            activeBanners = data.banners || [];
            updateBannerDisplay();
        }
    } catch (error) {
        console.error('Erro ao carregar banners:', error);
        // Manter apenas o banner padrão
        activeBanners = [];
        updateBannerDisplay();
    }
}

// Atualizar exibição dos banners
function updateBannerDisplay() {
    const bannerSlides = document.getElementById('bannerSlides');
    const bannerDots = document.getElementById('bannerDots');
    
    if (!bannerSlides || !bannerDots) return;
    
    // Sempre manter o banner padrão + banners customizados ativos
    const totalSlides = 1 + activeBanners.length;
    
    // Mostrar/esconder slides customizados
    for (let i = 1; i <= 4; i++) {
        const bannerSlot = document.getElementById(`banner-slot-${i}`);
        if (bannerSlot) {
            const bannerData = activeBanners[i - 1];
            if (bannerData) {
                bannerSlot.classList.remove('hidden');
                const img = bannerSlot.querySelector('img');
                if (img) {
                    img.src = bannerData.url;
                    img.alt = bannerData.title || `Banner ${i}`;
                }
            } else {
                bannerSlot.classList.add('hidden');
            }
        }
    }
    
    // Atualizar dots de navegação
    bannerDots.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = `banner-dot w-3 h-3 rounded-full transition-all ${i === 0 ? 'bg-blue-600 opacity-100 active' : 'bg-gray-400 opacity-60'}`;
        dot.setAttribute('data-slide', i);
        dot.addEventListener('click', () => goToBannerSlide(i));
        bannerDots.appendChild(dot);
    }
    
    // Mostrar/esconder setas se há mais de um slide
    const arrows = document.querySelectorAll('.banner-arrow');
    arrows.forEach(arrow => {
        arrow.style.display = totalSlides > 1 ? 'block' : 'none';
    });
    
    // Mostrar botão de admin se logado
    updateAdminBannerButton();
}

// Ir para slide específico
function goToBannerSlide(slideIndex) {
    const bannerSlides = document.getElementById('bannerSlides');
    const dots = document.querySelectorAll('.banner-dot');
    
    if (!bannerSlides) return;
    
    currentBannerSlide = slideIndex;
    
    // Atualizar posição do carousel
    bannerSlides.style.transform = `translateX(-${slideIndex * 100}%)`;
    
    // Atualizar dots
    dots.forEach((dot, index) => {
        if (index === slideIndex) {
            dot.classList.add('active');
            dot.classList.remove('opacity-60');
            dot.classList.add('opacity-100');
        } else {
            dot.classList.remove('active');
            dot.classList.remove('opacity-100');
            dot.classList.add('opacity-60');
        }
    });
}

// Próximo slide
function nextBannerSlide() {
    const totalSlides = 1 + activeBanners.length;
    const nextSlide = (currentBannerSlide + 1) % totalSlides;
    goToBannerSlide(nextSlide);
}

// Slide anterior
function previousBannerSlide() {
    const totalSlides = 1 + activeBanners.length;
    const prevSlide = currentBannerSlide === 0 ? totalSlides - 1 : currentBannerSlide - 1;
    goToBannerSlide(prevSlide);
}

// Iniciar autoplay
function startBannerAutoplay() {
    stopBannerAutoplay(); // Limpar interval anterior
    const totalSlides = 1 + activeBanners.length;
    if (totalSlides > 1) {
        bannerInterval = setInterval(nextBannerSlide, 5000); // 5 segundos
    }
}

// Parar autoplay
function stopBannerAutoplay() {
    if (bannerInterval) {
        clearInterval(bannerInterval);
        bannerInterval = null;
    }
}

// Atualizar botão de admin
function updateAdminBannerButton() {
    const adminBtn = document.getElementById('adminBannerBtn');
    if (adminBtn) {
        // Mostrar apenas se estiver logado (você pode ajustar essa lógica)
        const isLoggedIn = localStorage.getItem('token');
        adminBtn.style.display = isLoggedIn ? 'block' : 'none';
    }
}

// Abrir gerenciador de banners
function openBannerManager() {
    showBannerManagerModal();
}

// Modal de gerenciamento de banners
function showBannerManagerModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center p-6 border-b">
                <h3 class="text-xl font-bold text-gray-900">Gerenciar Banners</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="p-6">
                <div class="mb-6">
                    <p class="text-gray-600 mb-4">Você pode adicionar até 4 banners customizados além do banner padrão de boas-vindas.</p>
                    
                    <!-- Upload de novo banner -->
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
                        <i class="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-3"></i>
                        <h4 class="text-lg font-medium text-gray-900 mb-2">Adicionar Novo Banner</h4>
                        <p class="text-gray-600 mb-4">Faça upload de uma imagem (recomendado: 1200x400px)</p>
                        <input type="file" id="bannerFileInput" accept="image/*" class="hidden">
                        <button onclick="document.getElementById('bannerFileInput').click()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                            Escolher Arquivo
                        </button>
                    </div>
                    
                    <!-- Lista de banners ativos -->
                    <div id="bannersList">
                        <h4 class="text-lg font-medium text-gray-900 mb-4">Banners Ativos</h4>
                        <div id="activeBannersList">
                            <!-- Will be populated by JavaScript -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup event listeners
    const fileInput = document.getElementById('bannerFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleBannerUpload);
    }
    
    // Carregar lista de banners
    refreshBannersList();
    
    // Fechar modal clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Listar banners ativos no modal
function refreshBannersList() {
    const container = document.getElementById('activeBannersList');
    if (!container) return;
    
    if (activeBanners.length === 0) {
        container.innerHTML = '<p class="text-gray-500">Nenhum banner customizado adicionado ainda.</p>';
        return;
    }
    
    container.innerHTML = activeBanners.map((banner, index) => `
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-3">
            <div class="flex items-center">
                <img src="${banner.url}" alt="${banner.title}" class="w-20 h-12 object-cover rounded mr-4">
                <div>
                    <h5 class="font-medium">${banner.title || `Banner ${index + 1}`}</h5>
                    <p class="text-sm text-gray-500">Enviado em ${new Date(banner.uploadDate).toLocaleDateString()}</p>
                </div>
            </div>
            <button onclick="deleteBanner(${banner.id})" class="text-red-600 hover:text-red-700 p-2">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Upload de banner
async function handleBannerUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar arquivo
    if (!file.type.startsWith('image/')) {
        showToast('Por favor, selecione um arquivo de imagem válido.', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
        showToast('O arquivo deve ter menos de 5MB.', 'error');
        return;
    }
    
    if (activeBanners.length >= 4) {
        showToast('Você já atingiu o limite de 4 banners customizados.', 'warning');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('banner', file);
        
        const response = await fetch(apiUrl('/api/banners/upload'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Banner enviado com sucesso!', 'success');
            loadBanners(); // Recarregar banners
            refreshBannersList(); // Atualizar lista no modal
        } else {
            throw new Error(data.message || 'Erro ao enviar banner');
        }
    } catch (error) {
        console.error('Erro ao enviar banner:', error);
        showToast('Erro ao enviar banner: ' + error.message, 'error');
    }
    
    // Limpar input
    event.target.value = '';
}

// Deletar banner
async function deleteBanner(bannerId) {
    if (!confirm('Tem certeza que deseja excluir este banner?')) {
        return;
    }
    
    try {
        const response = await fetch(apiUrl(`/api/banners/${bannerId}`), {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Banner excluído com sucesso!', 'success');
            loadBanners(); // Recarregar banners
            refreshBannersList(); // Atualizar lista no modal
        } else {
            throw new Error(data.message || 'Erro ao excluir banner');
        }
    } catch (error) {
        console.error('Erro ao excluir banner:', error);
        showToast('Erro ao excluir banner: ' + error.message, 'error');
    }
}

// ===== NOVAS FUNCIONALIDADES PARA O LAYOUT RENOVADO =====

// Inicializar página inicial renovada
function initializeNewHomepage() {
    loadLiturgicalSuggestion();
    loadCarousels();
    loadCommunityRepertoires();
}

// Carregar todos os carrosseis
async function loadCarousels() {
    try {
        const response = await fetch(apiUrl('/api/carrosseis'));
        const data = await response.json();
        
        if (data.success) {
            // Separar itens por tipo de carrossel
            const carousels = {
                mais_tocadas: data.data.filter(item => item.tipo_carrossel === 'mais_tocadas'),
                novas_cifras: data.data.filter(item => item.tipo_carrossel === 'novas_cifras'),
                por_categoria: data.data.filter(item => item.tipo_carrossel === 'por_categoria')
            };
            
            // Inicializar cada carrossel
            initializeCarousel('mostPlayed', carousels.mais_tocadas);
            initializeCarousel('newSongs', carousels.novas_cifras);
            initializeCarousel('category', carousels.por_categoria);
        }
    } catch (error) {
        console.error('Erro ao carregar carrosseis:', error);
        // Fallback para carrosseis com imagens placeholder
        initializeFallbackCarousels();
    }
}

// Inicializar carrossel individual
function initializeCarousel(type, items) {
    const slidesContainer = document.getElementById(`${type}Slides`);
    const dotsContainer = document.getElementById(`${type}Dots`);
    
    if (!slidesContainer || !dotsContainer) return;
    
    // Limpar conteúdo anterior
    slidesContainer.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    // Se não há items, usar placeholder
    if (!items || items.length === 0) {
        items = createPlaceholderItems(type);
    }
    
    // Criar slides
    items.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.style.cssText = 'flex: 0 0 100%; min-width: 100%;';
        slide.innerHTML = `
            <div class="carousel-item">
                <img src="${getCarouselImageUrl(item)}" 
                     alt="${item.titulo}" 
                     class="w-full h-24 object-cover rounded-lg mb-2">
                <h4 class="font-medium text-gray-900 text-sm truncate">${item.titulo}</h4>
                ${item.subtitulo ? `<p class="text-gray-600 text-xs truncate">${item.subtitulo}</p>` : ''}
            </div>
        `;
        
        // Adicionar clique se tem URL
        if (item.link_url) {
            slide.style.cursor = 'pointer';
            slide.onclick = () => window.open(item.link_url, '_blank');
        }
        
        slidesContainer.appendChild(slide);
        
        // Criar dot
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => goToCarouselSlide(type, index);
        dotsContainer.appendChild(dot);
    });
    
    // Reset posição inicial
    slidesContainer.style.transform = 'translateX(0%)';
    
    // Inicializar auto-play
    startCarouselAutoplay(type, items.length);
}

// Criar items placeholder
function createPlaceholderItems(type) {
    const placeholders = {
        mostPlayed: [
            { titulo: 'Mais Tocada #1', subtitulo: 'Popular na comunidade', imagem: 'placeholder1.jpg' },
            { titulo: 'Mais Tocada #2', subtitulo: 'Favorita das missas', imagem: 'placeholder2.jpg' },
            { titulo: 'Mais Tocada #3', subtitulo: 'Clássico atemporal', imagem: 'placeholder3.jpg' }
        ],
        newSongs: [
            { titulo: 'Nova Cifra #1', subtitulo: 'Recém adicionada', imagem: 'placeholder4.jpg' },
            { titulo: 'Nova Cifra #2', subtitulo: 'Tendência', imagem: 'placeholder5.jpg' },
            { titulo: 'Nova Cifra #3', subtitulo: 'Descoberta', imagem: 'placeholder6.jpg' }
        ],
        category: [
            { titulo: 'Entrada', subtitulo: 'Início da missa', imagem: 'placeholder7.jpg' },
            { titulo: 'Comunhão', subtitulo: 'Momento sagrado', imagem: 'placeholder8.jpg' },
            { titulo: 'Final', subtitulo: 'Despedida', imagem: 'placeholder9.jpg' }
        ]
    };
    
    return placeholders[type] || [];
}

// Obter URL da imagem do carrossel
function getCarouselImageUrl(item) {
    if (item.imagem && !item.imagem.startsWith('placeholder')) {
        return apiUrl(`/uploads/carrosseis/${item.imagem}`);
    }
    
    // Usar imagem placeholder colorida
    const colors = ['3B82F6', 'EF4444', '10B981', 'F59E0B', '8B5CF6', 'EC4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return `https://via.placeholder.com/300x150/${color}/ffffff?text=${encodeURIComponent(item.titulo)}`;
}

// Controlar slide do carrossel
function goToCarouselSlide(type, slideIndex) {
    const slidesContainer = document.getElementById(`${type}Slides`);
    const dots = document.querySelectorAll(`#${type}Dots .carousel-dot`);
    
    if (!slidesContainer) return;
    
    // Mover slides
    slidesContainer.style.transform = `translateX(-${slideIndex * 100}%)`;
    
    // Atualizar dots
    dots.forEach((dot, index) => {
        if (index === slideIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    // Salvar slide atual
    window[`${type}CurrentSlide`] = slideIndex;
}

// Auto-play do carrossel
function startCarouselAutoplay(type, totalSlides) {
    if (totalSlides <= 1) return;
    
    window[`${type}CurrentSlide`] = 0;
    
    window[`${type}AutoplayInterval`] = setInterval(() => {
        const currentSlide = window[`${type}CurrentSlide`] || 0;
        const nextSlide = (currentSlide + 1) % totalSlides;
        goToCarouselSlide(type, nextSlide);
    }, 4000); // Trocar a cada 4 segundos
}

// Fallback para carrosseis sem dados
function initializeFallbackCarousels() {
    initializeCarousel('mostPlayed', []);
    initializeCarousel('newSongs', []);
    initializeCarousel('category', []);
}

// Sugestão Litúrgica
function loadLiturgicalSuggestion() {
    const today = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    const liturgicalDateElement = document.getElementById('liturgicalDate');
    if (liturgicalDateElement) {
        liturgicalDateElement.textContent = today.toLocaleDateString('pt-BR', options);
    }
    
    // Sugestões baseadas no dia da semana
    const dayOfWeek = today.getDay();
    const suggestions = getLiturgicalSuggestions(dayOfWeek);
    
    const liturgicalSongs = document.getElementById('liturgicalSongs');
    if (liturgicalSongs) {
        liturgicalSongs.innerHTML = suggestions.map(song => `
        <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
            <div>
                <h4 class="font-medium text-gray-900">${song.title}</h4>
                <p class="text-sm text-gray-600">${song.category} • ${song.artist}</p>
            </div>
            <button onclick="viewCifra(${song.id})" class="text-amber-600 hover:text-amber-700">
                <i class="fas fa-play-circle text-lg"></i>
            </button>
        </div>
    `).join('');
    }
}

function getLiturgicalSuggestions(dayOfWeek) {
    // Filtrar cifras por dia da semana
    const suggestions = [];
    
    if (cifrasCarregadas.length > 0) {
        // Domingo - foco em entrada e comunhão
        if (dayOfWeek === 0) {
            const entrada = cifrasCarregadas.find(c => c.categoria === 'entrada');
            const comunhao = cifrasCarregadas.find(c => c.categoria === 'comunhao');
            
            if (entrada) suggestions.push({
                id: entrada.id,
                title: entrada.titulo,
                artist: entrada.artista,
                category: 'Entrada'
            });
            
            if (comunhao) suggestions.push({
                id: comunhao.id,
                title: comunhao.titulo,
                artist: comunhao.artista,
                category: 'Comunhão'
            });
        } else {
            // Dias da semana - adoração e marianas
            const adoracao = cifrasCarregadas.find(c => c.categoria === 'adoracao');
            const mariana = cifrasCarregadas.find(c => c.categoria === 'mariana');
            
            if (adoracao) suggestions.push({
                id: adoracao.id,
                title: adoracao.titulo,
                artist: adoracao.artista,
                category: 'Adoração'
            });
            
            if (mariana) suggestions.push({
                id: mariana.id,
                title: mariana.titulo,
                artist: mariana.artista,
                category: 'Mariana'
            });
        }
    }
    
    return suggestions;
}

function refreshLiturgicalSuggestion() {
    loadLiturgicalSuggestion();
    showToast('Sugestões atualizadas!', 'success');
}

// Abrir menu de categorias
function openCategoryMenu() {
    const categories = [
        { id: 'entrada', name: 'Entrada', icon: 'fas fa-door-open', color: 'text-green-600' },
        { id: 'ofertorio', name: 'Ofertório', icon: 'fas fa-hands', color: 'text-yellow-600' },
        { id: 'comunhao', name: 'Comunhão', icon: 'fas fa-bread-slice', color: 'text-amber-600' },
        { id: 'final', name: 'Final', icon: 'fas fa-door-closed', color: 'text-purple-600' },
        { id: 'adoracao', name: 'Adoração', icon: 'fas fa-praying-hands', color: 'text-pink-600' },
        { id: 'mariana', name: 'Marianas', icon: 'fas fa-star', color: 'text-blue-600' }
    ];
    
    // Criar menu temporário
    const menu = document.createElement('div');
    menu.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    menu.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold mb-4">Escolha uma Categoria</h3>
            <div class="space-y-2">
                ${categories.map(cat => `
                    <button onclick="filterByCategory('${cat.id}'); closeTemporaryMenu();" 
                            class="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center">
                        <i class="${cat.icon} ${cat.color} mr-3"></i>
                        ${cat.name}
                    </button>
                `).join('')}
            </div>
            <button onclick="closeTemporaryMenu()" 
                    class="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Cancelar
            </button>
        </div>
    `;
    
    menu.onclick = (e) => {
        if (e.target === menu) closeTemporaryMenu();
    };
    
    document.body.appendChild(menu);
    window.temporaryMenu = menu;
}

// Fechar menu temporário
function closeTemporaryMenu() {
    if (window.temporaryMenu) {
        window.temporaryMenu.remove();
        window.temporaryMenu = null;
    }
}

// Carregar repertórios da comunidade
async function loadCommunityRepertoires() {
    try {
        const response = await fetch(apiUrl('/api/repertorios/publicos'));
        const data = await response.json();
        
        const repertoires = data.repertorios || [];
        const container = document.getElementById('communityRepertoires');
        
        if (!container) {
            console.log('Container communityRepertoires não encontrado');
            return;
        }
        
        container.innerHTML = repertoires.slice(0, 6).map(rep => `
            <div class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer" onclick="viewRepertoire(${rep.id})">
                <h4 class="font-medium text-gray-900 mb-2">${rep.nome}</h4>
                <p class="text-sm text-gray-600 mb-2">${rep.descricao || 'Repertório da comunidade'}</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span><i class="fas fa-music mr-1"></i>${rep.cifra_count || 0} cifras</span>
                    <span><i class="fas fa-user mr-1"></i>${rep.usuario?.nome || 'Anônimo'}</span>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar repertórios da comunidade:', error);
        const container = document.getElementById('communityRepertoires');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center p-8 text-gray-500">
                    <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                    <p>Erro ao carregar repertórios</p>
                </div>
            `;
        }
    }
}

// Filtrar por categoria (nova versão)
function filterByCategory(category) {
    // Esconder seções principais
    hideMainSections();
    
    // Mostrar resultados da busca
    const searchResults = document.getElementById('searchResults');
    searchResults.classList.remove('hidden');
    
    // Filtrar cifras
    filteredCifras = cifrasCarregadas.filter(cifra => cifra.categoria === category);
    renderCifras();
    
    // Atualizar título - resetar cabeçalho para formato padrão
    const categoryNames = {
        'entrada': 'Entrada',
        'ofertorio': 'Ofertório',
        'comunhao': 'Comunhão',
        'final': 'Final',
        'adoracao': 'Adoração',
        'mariana': 'Marianas'
    };
    
    const headerContainer = searchResults.querySelector('div.flex.items-center.justify-between');
    if (headerContainer) {
        headerContainer.outerHTML = `<h2 class="text-2xl font-bold text-gray-900 mb-6">Cifras de ${categoryNames[category]}</h2>`;
    } else {
        const existingH2 = searchResults.querySelector('h2');
        if (existingH2) {
            existingH2.textContent = `Cifras de ${categoryNames[category]}`;
        }
    }
}

// Ver todas as cifras mais tocadas
function viewAllMostPlayed() {
    hideMainSections();
    filteredCifras = [...cifrasCarregadas].sort((a, b) => b.views - a.views);
    renderCifras();
    
    const searchResults = document.getElementById('searchResults');
    const headerContainer = searchResults.querySelector('div.flex.items-center.justify-between');
    if (headerContainer) {
        headerContainer.outerHTML = '<h2 class="text-2xl font-bold text-gray-900 mb-6">Mais Tocadas</h2>';
    } else {
        const existingH2 = searchResults.querySelector('h2');
        if (existingH2) {
            existingH2.textContent = 'Mais Tocadas';
        }
    }
    searchResults.classList.remove('hidden');
}

// Ver todas as cifras novas
function viewAllNew() {
    hideMainSections();
    filteredCifras = [...cifrasCarregadas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderCifras();
    
    const searchResults = document.getElementById('searchResults');
    const headerContainer = searchResults.querySelector('div.flex.items-center.justify-between');
    if (headerContainer) {
        headerContainer.outerHTML = '<h2 class="text-2xl font-bold text-gray-900 mb-6">Cifras Recentes</h2>';
    } else {
        const existingH2 = searchResults.querySelector('h2');
        if (existingH2) {
            existingH2.textContent = 'Cifras Recentes';
        }
    }
    searchResults.classList.remove('hidden');
}

// Ver todos os clássicos
function viewAllClassics() {
    hideMainSections();
    filteredCifras = cifrasCarregadas.filter(song => 
        song.titulo.toLowerCase().includes('santo') ||
        song.titulo.toLowerCase().includes('ave maria') ||
        song.titulo.toLowerCase().includes('pai nosso') ||
        song.titulo.toLowerCase().includes('glória') ||
        song.titulo.toLowerCase().includes('aleluia')
    );
    renderCifras();
    
    const searchResults = document.getElementById('searchResults');
    const headerContainer = searchResults.querySelector('div.flex.items-center.justify-between');
    if (headerContainer) {
        headerContainer.outerHTML = '<h2 class="text-2xl font-bold text-gray-900 mb-6">Clássicos Católicos</h2>';
    } else {
        const existingH2 = searchResults.querySelector('h2');
        if (existingH2) {
            existingH2.textContent = 'Clássicos Católicos';
        }
    }
    searchResults.classList.remove('hidden');
}

// Esconder seções principais
function hideMainSections() {
    // Esconder ferramentas
    const toolsSection = document.querySelector('.bg-white.rounded-xl.shadow-sm.border.border-gray-200.p-6.mb-8');
    if (toolsSection) toolsSection.style.display = 'none';
    
    // Esconder sugestão litúrgica
    const liturgicalSection = document.getElementById('liturgicalSuggestion');
    if (liturgicalSection) liturgicalSection.style.display = 'none';
    
    // Esconder grid principal
    const mainGrid = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3.gap-6.mb-8');
    if (mainGrid) mainGrid.style.display = 'none';
    
    // Esconder repertórios da comunidade
    const communitySection = document.querySelector('.bg-white.rounded-xl.shadow-sm.border.border-gray-200.p-6:has(#communityRepertoires)');
    if (communitySection) communitySection.style.display = 'none';
    
    // Alternativa mais robusta
    document.querySelectorAll('main > div').forEach(section => {
        if (!section.id || section.id !== 'searchResults') {
            section.style.display = 'none';
        }
    });
}

// Mostrar seções principais (voltar ao início)
function showMainSections() {
    // Mostrar todas as seções principais
    document.querySelectorAll('main > div').forEach(section => {
        if (section.id !== 'searchResults') {
            section.style.display = 'block';
        }
    });
    
    // Esconder resultados da busca
    const searchResults = document.getElementById('searchResults');
    searchResults.classList.add('hidden');
    
    // Resetar cabeçalho para o formato padrão (remover botão de enviar se existir)
    const headerContainer = searchResults.querySelector('div.flex.items-center.justify-between');
    if (headerContainer) {
        headerContainer.outerHTML = '<h2 class="text-2xl font-bold text-gray-900 mb-6">Resultados</h2>';
    }
}

// ===== FERRAMENTAS PARA MÚSICOS =====

// Abrir transpositor
function openTranspositor() {
    showToast('Transpositor em desenvolvimento!', 'info');
    // TODO: Implementar modal do transpositor
}

// Abrir afinador
function openTuner() {
    showToast('Afinador em desenvolvimento!', 'info');
    // TODO: Implementar afinador virtual
}

// Abrir metrônomo
function openMetronome() {
    showToast('Metrônomo em desenvolvimento!', 'info');
    // TODO: Implementar metrônomo
}

// Ver repertório
function viewRepertoire(id) {
    window.location.href = `repertorios.html?id=${id}`;
}

// Funções específicas para "Minhas Cifras"
async function editarMinhaCifra(cifraId) {
    try {
        const response = await fetchWithAuth(`/api/cifras/${cifraId}`);
        const data = await response.json();
        
        if (data.success) {
            closeModal();
            await openCifraEditorWithData(data.cifra);
        } else {
            showToast('Erro ao carregar cifra para edição', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar cifra:', error);
        showToast('Erro ao carregar cifra para edição', 'error');
    }
}

async function excluirMinhaCifra(cifraId) {
    if (!confirm('Tem certeza que deseja excluir esta cifra? Esta ação não pode ser desfeita!')) {
        return;
    }
    
    try {
        const response = await fetchWithAuth(`/api/cifras/${cifraId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Cifra excluída com sucesso!', 'success');
            closeModal();
            
            // Recarregar a página se estivermos em minhas-cifras.html
            if (window.location.pathname.includes('minhas-cifras')) {
                if (typeof carregarMinhasCifras === 'function') {
                    carregarMinhasCifras();
                }
            }
        } else {
            showToast(data.message || 'Erro ao excluir cifra', 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir cifra:', error);
        showToast('Erro ao excluir cifra', 'error');
    }
}

function enviarParaComunidade(cifraId) {
    console.log('Enviando cifra para comunidade:', cifraId); // Debug
    // Criar modal de confirmação
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-md w-full p-6">
            <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                    <i class="fas fa-share-alt text-orange-600 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Enviar para Comunidade</h3>
                <p class="text-sm text-gray-500 mb-6">
                    Deseja enviar a música para análise para que ela se torne pública na comunidade?
                </p>
                <div class="flex space-x-3">
                    <button onclick="closeConfirmModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                        Não
                    </button>
                    <button onclick="confirmarEnvioParaComunidade(${cifraId})" class="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                        Sim
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeConfirmModal() {
    console.log('Fechando modal de confirmação'); // Debug
    const modal = document.querySelector('.z-\\[10000\\]');
    if (modal) {
        modal.remove();
    }
}

async function confirmarEnvioParaComunidade(cifraId) {
    console.log('Confirmando envio para comunidade:', cifraId); // Debug
    try {
        const response = await fetchWithAuth(`/api/cifras/${cifraId}/enviar-para-analise`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeConfirmModal();
            closeModal();
            
            // Mostrar modal de sucesso
            const successModal = document.createElement('div');
            successModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4';
            successModal.innerHTML = `
                <div class="bg-white rounded-lg max-w-md w-full p-6">
                    <div class="text-center">
                        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <i class="fas fa-check text-green-600 text-xl"></i>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Enviado com sucesso!</h3>
                        <p class="text-sm text-gray-500 mb-6">
                            Sua letra e cifra passará por uma análise e em breve poderá estar na comunidade de forma pública para que todos tenham acesso.
                        </p>
                        <button onclick="closeSuccessModal()" class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                            Entendi
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(successModal);
            
            // Recarregar a página se estivermos em minhas-cifras.html
            if (window.location.pathname.includes('minhas-cifras')) {
                if (typeof carregarMinhasCifras === 'function') {
                    setTimeout(() => {
                        carregarMinhasCifras();
                    }, 2000);
                }
            }
            
        } else {
            showToast(data.message || 'Erro ao enviar cifra para análise', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao enviar cifra para análise:', error);
        showToast('Erro ao enviar cifra para análise', 'error');
    }
}

function closeSuccessModal() {
    const modal = document.querySelector('.z-\\[10000\\]');
    if (modal) {
        modal.remove();
    }
}

// Verificar se usuário é master e mostrar link do painel
function checkMasterAccess() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const masterEmails = [
            'master@omusicacatolico.com',
    'admin@omusicacatolico.com',
    'vinicius@omusicacatolico.com'
    ];
    
    if (user.email && masterEmails.includes(user.email)) {
        const masterLink = document.getElementById('masterLink');
        if (masterLink) {
            masterLink.classList.remove('hidden');
        }
    }
}

// Processar cifra para formato monospace da tela da missa
function processarCifraParaTelaMissaMonospace(conteudo) {
    // Processar o conteúdo preservando espaçamento e formatando acordes
    const linhas = conteudo.split('\n');
    let resultado = '';
    
    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        
        // Verificar se é uma linha de acordes (contém acordes típicos)
        const isChordLine = /^[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?(\s+[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?)*\s*$/.test(linha.trim()) ||
                           /\b[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?\b/.test(linha) && linha.trim().split(/\s+/).every(word => 
                               /^[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?$/.test(word) || word === ''
                           );
        
        if (isChordLine && linha.trim()) {
            // Linha de acordes - envolver em span colorido
            resultado += `<span>${linha}</span>\n`;
        } else {
            // Linha normal - manter como está
            resultado += linha + '\n';
        }
    }
    
    return resultado;
}

// Distribuir conteúdo em colunas para formato monospace com quebra inteligente
function distribuirEmColunasMonospace(conteudo, numeroColunas) {
    if (numeroColunas === 1) {
        return `<div class="coluna"><pre class="cifra-content">${conteudo}</pre></div>`;
    }
    
    const linhas = conteudo.split('\n');
    const blocos = identificarBlocosMusicas(linhas);
    const blocosDistribuidos = distribuirBlocosEmColunas(blocos, numeroColunas);
    
    let colunas = '';
    for (let i = 0; i < numeroColunas; i++) {
        const conteudoColuna = blocosDistribuidos[i] || [];
        if (conteudoColuna.length > 0) {
            const textoColuna = conteudoColuna.join('\n');
            const linhasColuna = conteudoColuna.filter(linha => linha.trim()).length;
            colunas += `<!-- Coluna ${i + 1}: ${linhasColuna} linhas --><div class="coluna"><pre class="cifra-content">${textoColuna}</pre></div>`;
        } else {
            colunas += `<!-- Coluna ${i + 1}: vazia --><div class="coluna"><pre class="cifra-content"></pre></div>`;
        }
    }
    
    return colunas;
}

// Identificar blocos musicais (acordes + letras que devem ficar juntos)
function identificarBlocosMusicas(linhas) {
    const blocos = [];
    let blocoAtual = [];
    
    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        const proximaLinha = i + 1 < linhas.length ? linhas[i + 1] : '';
        
        // Adicionar linha atual ao bloco
        blocoAtual.push(linha);
        
        // Verificar se é uma linha de acordes
        const ehLinhaDeAcordes = /^[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?(\s+[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?[0-9]*(\/[A-G](#|b)?)?)*\s*$/.test(linha.trim());
        
        // Se é linha de acordes, a próxima linha (letra) deve ficar no mesmo bloco
        if (ehLinhaDeAcordes && proximaLinha.trim()) {
            continue; // Não fechar o bloco ainda
        }
        
        // Fechar bloco se:
        // 1. Linha vazia (separação natural)
        // 2. Próxima linha é vazia
        // 3. Fim do arquivo
        // 4. Mudança de seção (INTRO, VERSO, etc.)
        // 5. Bloco ficou muito grande (mais de 8 linhas)
        const ehSeparacao = !linha.trim() || 
                           !proximaLinha.trim() || 
                           i === linhas.length - 1 ||
                           /^(INTRO|VERSO|REFRÃO|PONTE|FINAL|CODA):/i.test(proximaLinha) ||
                           blocoAtual.length >= 8; // Evitar blocos muito grandes
        
        if (ehSeparacao && blocoAtual.length > 0) {
            blocos.push([...blocoAtual]);
            blocoAtual = [];
        }
    }
    
    // Adicionar último bloco se não estiver vazio
    if (blocoAtual.length > 0) {
        blocos.push(blocoAtual);
    }
    
    return blocos;
}

// Distribuir blocos em colunas respeitando ordem sequencial
function distribuirBlocosEmColunas(blocos, numeroColunas) {
    const colunas = Array(numeroColunas).fill().map(() => []);
    
    // Se só tem uma coluna, colocar tudo nela
    if (numeroColunas === 1) {
        colunas[0] = blocos.flat();
        return colunas;
    }
    
    // Calcular altura total e dividir proporcionalmente
    const alturaTotal = blocos.reduce((total, bloco) => total + bloco.length, 0);
    const alturaIdealPorColuna = Math.ceil(alturaTotal / numeroColunas);
    
    let colunaAtual = 0;
    let alturaAtualColuna = 0;
    
    for (let i = 0; i < blocos.length; i++) {
        const bloco = blocos[i];
        const alturaBloco = bloco.length;
        
        // Verificar se deve mudar de coluna
        // Só muda se:
        // 1. A coluna atual já tem conteúdo E
        // 2. Adicionar este bloco excederia muito a altura ideal E
        // 3. Ainda há colunas disponíveis
        const excederiaAltura = (alturaAtualColuna + alturaBloco) > (alturaIdealPorColuna * 1.3);
        const temColunasDisponiveis = colunaAtual < (numeroColunas - 1);
        const colunaTemConteudo = colunas[colunaAtual].length > 0;
        
        if (colunaTemConteudo && excederiaAltura && temColunasDisponiveis) {
            colunaAtual++;
            alturaAtualColuna = 0;
        }
        
        // Adicionar espaço entre blocos (exceto no primeiro bloco da coluna)
        if (colunas[colunaAtual].length > 0) {
            colunas[colunaAtual].push(''); // Linha vazia entre blocos
            alturaAtualColuna += 1;
        }
        
        // Adicionar bloco à coluna atual
        colunas[colunaAtual].push(...bloco);
        alturaAtualColuna += alturaBloco;
    }
    
    return colunas;
}

// Visualizar cifra no formato da Tela da Missa (função de preview para criação)