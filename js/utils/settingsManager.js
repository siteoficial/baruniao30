/**
 * Gerenciador de Configurações do Sistema
 * Responsável por armazenar e gerenciar as configurações globais do sistema
 */

const SettingsManager = {
    // Chave para armazenar as configurações no localStorage
    SETTINGS_KEY: 'systemSettings',
    
    // Configurações padrão
    DEFAULT_SETTINGS: {
        // Configurações de numeração de comandas
        tabNumbering: {
            mode: 'auto', // 'auto' ou 'predefined'
            predefinedNumbers: [1, 2, 3, 4, 5] // Lista de números predefinidos para comandas físicas
        },
        // Outras configurações do sistema podem ser adicionadas aqui
    },
    
    // Configurações atuais
    _settings: null,
    
    // Array de callbacks para notificar sobre mudanças
    _changeListeners: [],
    
    // Inicializa o gerenciador de configurações
    init: function() {
        // Carregar configurações do localStorage
        this._loadSettings();
        
        // Configurar escuta em tempo real se o Firebase estiver disponível
        this._setupRealtimeSync();
        
        console.log('SettingsManager inicializado com sucesso.');
        return this;
    },
    
    // Configura a sincronização em tempo real com o Firebase
    _setupRealtimeSync: function() {
        if (typeof FirebaseManager !== 'undefined' && 
            FirebaseManager.initializeFirebase && 
            FirebaseManager.initializeFirebase()) {
            
            try {
                // Obter referência ao Firebase Database
                const firebase = window.firebase;
                if (firebase && firebase.database) {
                    firebase.database().ref('settings').on('value', (snapshot) => {
                        const remoteSettings = snapshot.val();
                        if (remoteSettings) {
                            // Atualizar configurações locais sem acionar nova sincronização
                            this._updateSettingsWithoutSync(remoteSettings);
                        }
                    });
                    console.log('Sincronização em tempo real de configurações configurada');
                }
            } catch (error) {
                console.error('Erro ao configurar sincronização em tempo real:', error);
            }
        }
    },
    
    // Atualiza as configurações locais sem acionar sincronização com Firebase
    _updateSettingsWithoutSync: function(newSettings) {
        const previousSettings = { ...this._settings };
        
        // Atualizar configurações
        this._settings = {
            ...this._settings,
            ...newSettings
        };
        
        // Garantir que todas as propriedades do objeto tabNumbering existam
        if (newSettings.tabNumbering) {
            this._settings.tabNumbering = {
                ...this._settings.tabNumbering,
                ...newSettings.tabNumbering
            };
        }
        
        // Salvar apenas no localStorage
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this._settings));
        } catch (error) {
            console.error('Erro ao salvar configurações no localStorage:', error);
        }
        
        // Notificar mudanças
        this._notifyChangeListeners(previousSettings, this._settings);
    },
    
    // Carrega as configurações do localStorage
    _loadSettings: function() {
        try {
            const storedSettings = localStorage.getItem(this.SETTINGS_KEY);
            
            if (storedSettings) {
                this._settings = JSON.parse(storedSettings);
                
                // Garantir que todas as propriedades padrão existam
                this._settings = {
                    ...this.DEFAULT_SETTINGS,
                    ...this._settings
                };
                
                // Garantir que todas as propriedades do objeto tabNumbering existam
                if (this._settings.tabNumbering) {
                    this._settings.tabNumbering = {
                        ...this.DEFAULT_SETTINGS.tabNumbering,
                        ...this._settings.tabNumbering
                    };
                }
            } else {
                // Se não existir configurações, usar as padrão
                this._settings = { ...this.DEFAULT_SETTINGS };
                this._saveSettings();
            }
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            this._settings = { ...this.DEFAULT_SETTINGS };
            this._saveSettings();
        }
    },
    
    // Salva as configurações no localStorage
    _saveSettings: function() {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this._settings));
            
            // Se o Firebase estiver disponível, sincronizar configurações
            if (typeof FirebaseManager !== 'undefined' && FirebaseManager.updateSettings) {
                FirebaseManager.updateSettings(this._settings);
            }
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
        }
    },
    
    // Notifica ouvintes sobre mudanças nas configurações
    _notifyChangeListeners: function(previousSettings, newSettings) {
        this._changeListeners.forEach(callback => {
            try {
                callback(previousSettings, newSettings);
            } catch (error) {
                console.error('Erro ao chamar listener de configurações:', error);
            }
        });
    },
    
    // Adiciona um ouvinte para mudanças nas configurações
    addChangeListener: function(callback) {
        if (typeof callback === 'function' && !this._changeListeners.includes(callback)) {
            this._changeListeners.push(callback);
        }
    },
    
    // Remove um ouvinte de mudanças nas configurações
    removeChangeListener: function(callback) {
        this._changeListeners = this._changeListeners.filter(cb => cb !== callback);
    },
    
    // Obtém todas as configurações
    getSettings: function() {
        return { ...this._settings };
    },
    
    // Atualiza as configurações
    updateSettings: function(newSettings) {
        const previousSettings = { ...this._settings };
        
        this._settings = {
            ...this._settings,
            ...newSettings
        };
        
        // Garantir que todas as propriedades do objeto tabNumbering existam
        if (newSettings.tabNumbering) {
            this._settings.tabNumbering = {
                ...this._settings.tabNumbering,
                ...newSettings.tabNumbering
            };
        }
        
        this._saveSettings();
        this._notifyChangeListeners(previousSettings, this._settings);
        return this._settings;
    },
    
    // Obtém a configuração de numeração de comandas
    getTabNumberingSettings: function() {
        return { ...this._settings.tabNumbering };
    },
    
    // Atualiza as configurações de numeração de comandas
    updateTabNumberingSettings: function(settings) {
        const previousSettings = { ...this._settings };
        
        this._settings.tabNumbering = {
            ...this._settings.tabNumbering,
            ...settings
        };
        
        this._saveSettings();
        this._notifyChangeListeners(previousSettings, this._settings);
        return this._settings.tabNumbering;
    },
    
    // Define o modo de numeração ('auto' ou 'predefined')
    setTabNumberingMode: function(mode) {
        if (mode !== 'auto' && mode !== 'predefined') {
            console.error('Modo de numeração inválido:', mode);
            return false;
        }
        
        const previousSettings = { ...this._settings };
        this._settings.tabNumbering.mode = mode;
        this._saveSettings();
        this._notifyChangeListeners(previousSettings, this._settings);
        return true;
    },
    
    // Adiciona números predefinidos para comandas físicas
    addPredefinedTabNumbers: function(numbers) {
        if (!Array.isArray(numbers)) {
            numbers = [numbers];
        }
        
        const previousSettings = { ...this._settings };
        
        // Filtrar para apenas números únicos
        const currentNumbers = this._settings.tabNumbering.predefinedNumbers || [];
        const newNumbersSet = new Set([...currentNumbers, ...numbers]);
        this._settings.tabNumbering.predefinedNumbers = [...newNumbersSet].sort((a, b) => a - b);
        
        this._saveSettings();
        this._notifyChangeListeners(previousSettings, this._settings);
        return this._settings.tabNumbering.predefinedNumbers;
    },
    
    // Remove um número específico da lista de números predefinidos
    removePredefinedTabNumber: function(number) {
        if (!this._settings.tabNumbering.predefinedNumbers) {
            return false;
        }
        
        // Verificar se o número existe na lista
        if (!this._settings.tabNumbering.predefinedNumbers.includes(number)) {
            return false;
        }
        
        const previousSettings = { ...this._settings };
        
        // Remover o número da lista
        this._settings.tabNumbering.predefinedNumbers = 
            this._settings.tabNumbering.predefinedNumbers.filter(n => n !== number);
        
        this._saveSettings();
        this._notifyChangeListeners(previousSettings, this._settings);
        return true;
    },
    
    // Remove todos os números predefinidos
    clearPredefinedTabNumbers: function() {
        const previousSettings = { ...this._settings };
        this._settings.tabNumbering.predefinedNumbers = [];
        this._saveSettings();
        this._notifyChangeListeners(previousSettings, this._settings);
        return [];
    }
};

// Inicializa o gerenciador de configurações automaticamente
SettingsManager.init(); 