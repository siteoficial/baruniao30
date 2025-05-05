const TabManager = {
    STORAGE_KEYS: {
        OPEN_TABS: 'openTabs',
        CLOSED_TABS: 'closedTabs',
        TAB_COUNTER: 'tabCounter'
    },
    
    // Estado local para armazenar as comandas em memória
    _openTabs: [],
    _closedTabs: [],
    _initialized: false,
    
    // Inicialização e configuração dos listeners do Firebase
    init: async function() {
        if (this._initialized) return true;
        
        try {
            console.log("Inicializando TabManager...");
            
            // Verificar se há conexão com a internet
            if (!isOnline()) {
                console.warn("Sem conexão com a internet. Usando modo offline.");
                this._loadFromLocalStorage();
                this._initialized = true;
                return true;
            }
            
            // Inicializar Firebase
            if (!FirebaseManager.initializeFirebase()) {
                console.error("Falha ao inicializar Firebase, usando localStorage como fallback");
                this._loadFromLocalStorage();
                this._initialized = true;
                return true;
            }
            
            // Autenticar anonimamente
            await FirebaseManager.signInAnonymously();
            
            // Configurar listeners para comandas abertas
            FirebaseManager.listenToOpenTabs(tabs => {
                console.log("Recebeu atualização de comandas abertas:", tabs.length);
                this._openTabs = tabs || [];
                // Manter também no localStorage como backup
                LocalStorageManager.saveData(this.STORAGE_KEYS.OPEN_TABS, tabs);
                // Notificar alterações
                this._notifyTabsChanged();
            });
            
            // Configurar listeners para comandas fechadas
            FirebaseManager.listenToClosedTabs(tabs => {
                console.log("Recebeu atualização de comandas fechadas:", tabs.length);
                this._closedTabs = tabs || [];
                // Manter também no localStorage como backup
                LocalStorageManager.saveData(this.STORAGE_KEYS.CLOSED_TABS, tabs);
                // Notificar alterações
                this._notifyTabsChanged();
            });
            
            // Marcar como inicializado
            this._initialized = true;
            console.log("TabManager inicializado com sucesso");
            return true;
        } catch (error) {
            console.error("Erro ao inicializar TabManager com Firebase:", error);
            // Fallback para localStorage
            this._loadFromLocalStorage();
            this._initialized = true;
            return false;
        }
    },
    
    // Carrega os dados do localStorage como fallback
    _loadFromLocalStorage: function() {
        console.log("Carregando dados do localStorage");
        this._openTabs = LocalStorageManager.getData(this.STORAGE_KEYS.OPEN_TABS, []);
        this._closedTabs = LocalStorageManager.getData(this.STORAGE_KEYS.CLOSED_TABS, []);
    },
    
    // Garante que o gerenciador esteja inicializado antes de executar operações
    _ensureInitialized: async function() {
        if (!this._initialized) {
            await this.init();
        }
        return this._initialized;
    },
    
    // Sistema de notificação para atualizações em tempo real
    _tabChangeListeners: [],
    
    addTabChangeListener: function(listener) {
        this._tabChangeListeners.push(listener);
    },
    
    removeTabChangeListener: function(listener) {
        this._tabChangeListeners = this._tabChangeListeners.filter(l => l !== listener);
    },
    
    _notifyTabsChanged: function() {
        this._tabChangeListeners.forEach(listener => {
            try {
                listener({
                    openTabs: this._openTabs,
                    closedTabs: this._closedTabs
                });
            } catch (error) {
                console.error("Erro ao notificar listener:", error);
            }
        });
    },
    
    getOpenTabs: function() {
        try {
            if (!this._initialized) {
                console.warn('TabManager não inicializado ao obter comandas abertas');
                this._loadFromLocalStorage();
            }
            return this._openTabs;
        } catch (error) {
            console.error('Erro ao obter comandas abertas:', error);
            reportError(error);
            return [];
        }
    },
    
    getClosedTabs: function() {
        try {
            if (!this._initialized) {
                console.warn('TabManager não inicializado ao obter comandas fechadas');
                this._loadFromLocalStorage();
            }
            return this._closedTabs;
        } catch (error) {
            console.error('Erro ao obter comandas fechadas:', error);
            reportError(error);
            return [];
        }
    },
    
    getTabById: function(tabId) {
        try {
            if (!this._initialized) {
                console.warn('TabManager não inicializado ao obter comanda por ID');
                this._loadFromLocalStorage();
            }
            return this._openTabs.find(tab => tab.id === tabId) || null;
        } catch (error) {
            console.error('Erro ao obter comanda por ID:', error);
            reportError(error);
            return null;
        }
    },
    
    getClosedTabById: function(tabId) {
        try {
            return this._closedTabs.find(tab => tab.id === tabId) || null;
        } catch (error) {
            console.error('Erro ao obter comanda fechada por ID:', error);
            reportError(error);
            return null;
        }
    },
    
    getNextTabNumber: async function() {
        try {
            // Usar o Firebase para obter o próximo número
            if (FirebaseManager.initializeFirebase()) {
                return await FirebaseManager.getNextTabNumber();
            }
            
            // Fallback para localStorage
            const currentCounter = LocalStorageManager.getData(this.STORAGE_KEYS.TAB_COUNTER, 0);
            const nextCounter = currentCounter + 1;
            LocalStorageManager.saveData(this.STORAGE_KEYS.TAB_COUNTER, nextCounter);
            return nextCounter;
        } catch (error) {
            console.error('Erro ao obter próximo número de comanda:', error);
            reportError(error);
            return Date.now();
        }
    },
    
    createTab: async function(customerName) {
        try {
            const tabNumber = await this.getNextTabNumber();
            const newTab = {
                id: generateId(),
                number: tabNumber,
                customerName: customerName || `Cliente ${tabNumber}`,
                items: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'open'
            };
            
            // Salvar no Firebase
            if (FirebaseManager.initializeFirebase()) {
                await FirebaseManager.saveTab(newTab);
            } else {
                // Fallback para localStorage
                const openTabs = this.getOpenTabs();
                openTabs.push(newTab);
                LocalStorageManager.saveData(this.STORAGE_KEYS.OPEN_TABS, openTabs);
                this._openTabs = openTabs;
                this._notifyTabsChanged();
            }
            
            return newTab;
        } catch (error) {
            console.error('Erro ao criar comanda:', error);
            reportError(error);
            return null;
        }
    },
    
    updateTab: async function(tabId, updates) {
        try {
            // Verificar se a comanda existe em memoria
            const tabIndex = this._openTabs.findIndex(tab => tab.id === tabId);
            
            if (tabIndex === -1) {
                console.error('Comanda não encontrada ao atualizar:', tabId);
                return null;
            }
            
            const updatedTab = {
                ...this._openTabs[tabIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            // Atualizar no Firebase
            if (FirebaseManager.initializeFirebase()) {
                const success = await FirebaseManager.updateTab(tabId, updates);
                if (!success) {
                    console.error('Falha ao atualizar comanda no Firebase:', tabId);
                    return null;
                }
                
                // Como o Firebase irá notificar via listener, não precisamos atualizar o estado local
                return updatedTab;
            } else {
                // Fallback para localStorage
                const openTabs = [...this._openTabs];
                openTabs[tabIndex] = updatedTab;
                LocalStorageManager.saveData(this.STORAGE_KEYS.OPEN_TABS, openTabs);
                this._openTabs = openTabs;
                this._notifyTabsChanged();
                
                return updatedTab;
            }
        } catch (error) {
            console.error('Erro ao atualizar comanda:', error);
            reportError(error);
            return null;
        }
    },
    
    deleteTab: async function(tabId) {
        try {
            // Verificar se a comanda existe em memória
            if (!this._openTabs.some(tab => tab.id === tabId)) {
                return false;
            }
            
            // Excluir do Firebase
            if (FirebaseManager.initializeFirebase()) {
                await FirebaseManager.deleteTab(tabId);
            } else {
                // Fallback para localStorage
                const filteredTabs = this._openTabs.filter(tab => tab.id !== tabId);
                LocalStorageManager.saveData(this.STORAGE_KEYS.OPEN_TABS, filteredTabs);
                this._openTabs = filteredTabs;
                
                // Registrar a comanda como excluída mesmo no modo offline
                FirebaseManager.addToDeletedTabsRegistry(tabId);
                
                this._notifyTabsChanged();
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao excluir comanda:', error);
            reportError(error);
            return false;
        }
    },
    
    addItemToTab: async function(tabId, item) {
        try {
            // Verificar inicialização
            if (!this._initialized) {
                console.warn('TabManager não inicializado ao adicionar item à comanda');
                await this.init();
            }
            
            const tab = this.getTabById(tabId);
            
            if (!tab) {
                console.error('Comanda não encontrada ao adicionar item:', tabId);
                return null;
            }
            
            // Garantir que o item tenha um ID único
            if (!item.id) {
                item.id = generateId();
            }
            
            // Garantir que o item tenha todas as propriedades necessárias
            const completeItem = {
                id: item.id,
                name: item.name || 'Item sem nome',
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1,
                addedAt: new Date().toISOString()
            };
            
            // Para segurança, garantir que tab.items seja um array
            if (!Array.isArray(tab.items)) {
                console.warn('tab.items não é um array:', tab.items);
                tab.items = [];
            }
            
            const existingItemIndex = tab.items.findIndex(i => i.id === completeItem.id);
            let updatedItems;
            
            if (existingItemIndex !== -1) {
                // Atualizar quantidade do item existente
                updatedItems = [...tab.items];
                updatedItems[existingItemIndex].quantity += completeItem.quantity;
            } else {
                // Adicionar novo item
                updatedItems = [...tab.items, completeItem];
            }
            
            console.log('Items atualizados para a comanda:', updatedItems);
            
            // Atualizar comanda com os novos itens
            return await this.updateTab(tabId, { items: updatedItems });
        } catch (error) {
            console.error('Erro ao adicionar item à comanda:', error);
            reportError(error);
            return null;
        }
    },
    
    removeItemFromTab: async function(tabId, itemId) {
        try {
            const tab = this.getTabById(tabId);
            
            if (!tab) {
                return null;
            }
            
            const updatedItems = tab.items.filter(item => item.id !== itemId);
            
            return await this.updateTab(tabId, { items: updatedItems });
        } catch (error) {
            console.error('Erro ao remover item da comanda:', error);
            reportError(error);
            return null;
        }
    },
    
    updateItemInTab: async function(tabId, itemId, updates) {
        try {
            const tab = this.getTabById(tabId);
            
            if (!tab) {
                return null;
            }
            
            const updatedItems = tab.items.map(item => {
                if (item.id === itemId) {
                    return { ...item, ...updates };
                }
                return item;
            });
            
            return await this.updateTab(tabId, { items: updatedItems });
        } catch (error) {
            console.error('Erro ao atualizar item na comanda:', error);
            reportError(error);
            return null;
        }
    },
    
    closeTab: async function(tabId, paymentMethod, observations, discount = 0) {
        try {
            const tab = this.getTabById(tabId);
            
            if (!tab) {
                return null;
            }
            
            const closedTab = {
                ...tab,
                status: 'closed',
                closedAt: new Date().toISOString(),
                paymentMethod: paymentMethod || 'cash',
                observations: observations || '',
                discount: discount || 0,
                subtotal: calculateTabTotal(tab.items),
                total: calculateTabTotal(tab.items) - (discount || 0)
            };
            
            // Atualizar no Firebase
            if (FirebaseManager.initializeFirebase()) {
                await FirebaseManager.updateTab(tabId, closedTab);
            } else {
                // Fallback para localStorage
                // Remover das comandas abertas
                const openTabs = this._openTabs.filter(t => t.id !== tabId);
                LocalStorageManager.saveData(this.STORAGE_KEYS.OPEN_TABS, openTabs);
                this._openTabs = openTabs;
                
                // Adicionar às comandas fechadas
                const closedTabs = [...this._closedTabs, closedTab];
                LocalStorageManager.saveData(this.STORAGE_KEYS.CLOSED_TABS, closedTabs);
                this._closedTabs = closedTabs;
                
                this._notifyTabsChanged();
            }
            
            // Registrar no histórico de comandas fechadas - para evitar que comandas fechadas sejam reabertas
            try {
                const closedTabsHistory = LocalStorageManager.getData('closedTabsHistory', {});
                closedTabsHistory[tabId] = {
                    status: 'closed',
                    closedAt: new Date().toISOString()
                };
                LocalStorageManager.saveData('closedTabsHistory', closedTabsHistory);
            } catch (e) {
                console.error('Erro ao registrar histórico de comanda fechada:', e);
            }
            
            return closedTab;
        } catch (error) {
            console.error('Erro ao fechar comanda:', error);
            reportError(error);
            return null;
        }
    },
    
    searchTabs: function(query, includeOpen = true, includeClosed = true) {
        try {
            query = query.toLowerCase();
            let results = [];
            
            if (includeOpen) {
                const openResults = this._openTabs.filter(tab => 
                    tab.customerName.toLowerCase().includes(query) || 
                    tab.number.toString().includes(query)
                );
                results = [...results, ...openResults];
            }
            
            if (includeClosed) {
                const closedResults = this._closedTabs.filter(tab => 
                    tab.customerName.toLowerCase().includes(query) || 
                    tab.number.toString().includes(query)
                );
                results = [...results, ...closedResults];
            }
            
            return results;
        } catch (error) {
            console.error('Erro ao pesquisar comandas:', error);
            reportError(error);
            return [];
        }
    },
    
    getTabsForDateRange: function(startDate, endDate) {
        try {
            // Garantir que as datas sejam objetos Date
            let start, end;
            
            if (typeof startDate === 'string') {
                start = new Date(startDate + 'T00:00:00');
            } else {
                start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
            }
            
            if (typeof endDate === 'string') {
                end = new Date(endDate + 'T23:59:59');
            } else {
                end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
            }
            
            const closedTabs = this.getClosedTabs();
            
            return closedTabs.filter(tab => {
                if (!tab.closedAt) return false;
                
                // Garantir que a data da comanda seja um objeto Date
                const closedDate = new Date(tab.closedAt);
                
                // Comparar se a data está dentro do intervalo (>= start e <= end)
                return closedDate >= start && closedDate <= end;
            });
        } catch (error) {
            console.error('Error getting tabs for date range:', error);
            reportError(error);
            return [];
        }
    }
};
