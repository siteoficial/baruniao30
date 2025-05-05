// Configuração do Firebase
const FirebaseConfig = {
    apiKey: "AIzaSyCuLb36Hag-IQNORF_dPjk2M67hlWUZs5s",
    authDomain: "comandabar-508b0.firebaseapp.com",
    databaseURL: "https://comandabar-508b0-default-rtdb.firebaseio.com",
    projectId: "comandabar-508b0",
    storageBucket: "comandabar-508b0.firebasestorage.app",
    messagingSenderId: "26778079842",
    appId: "1:26778079842:web:b3a9a64a18ece0017e373b"
};

// Inicialização do Firebase
let firebaseApp;
let firebaseDb;
let firebaseAuth;

// Constantes para o registro de comandas excluídas
const DELETED_TABS_KEY = 'deletedTabsRegistry';

const FirebaseManager = {
    initializeFirebase: function() {
        try {
            if (!window.firebase) {
                console.error("Firebase SDK não está carregado");
                return false;
            }
            
            if (!firebaseApp) {
                firebaseApp = firebase.initializeApp(FirebaseConfig);
                firebaseDb = firebase.database();
                firebaseAuth = firebase.auth();
                console.log("Firebase inicializado com sucesso");
            }
            return true;
        } catch (error) {
            console.error("Erro ao inicializar Firebase:", error);
            return false;
        }
    },

    // Autenticação
    signInAnonymously: async function() {
        try {
            const userCredential = await firebaseAuth.signInAnonymously();
            return userCredential.user;
        } catch (error) {
            console.error("Erro na autenticação anônima:", error);
            return null;
        }
    },

    // Funções de CRUD para comandas em tempo real
    saveTab: async function(tab) {
        try {
            await firebaseDb.ref(`tabs/${tab.id}`).set(tab);
            return true;
        } catch (error) {
            console.error("Erro ao salvar comanda:", error);
            return false;
        }
    },

    updateTab: async function(tabId, updates) {
        try {
            if (!firebaseDb) {
                console.error("Firebase Database não inicializado");
                return false;
            }
            
            console.log("Tentando atualizar comanda no Firebase:", tabId, updates);
            
            if (!tabId) {
                console.error("ID da comanda é inválido:", tabId);
                return false;
            }

            // Se temos items, garantir que é um array
            if (updates && updates.items && !Array.isArray(updates.items)) {
                console.warn("Campo items não é um array:", updates.items);
                updates.items = Array.isArray(updates.items) ? updates.items : [];
            }
            
            // Adicionar timestamp de atualização
            const updateData = {
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            // Tentar fazer a atualização direta usando update
            await firebaseDb.ref(`tabs/${tabId}`).update(updateData);
            console.log("Comanda atualizada com sucesso");
            
            return true;
        } catch (error) {
            console.error("Erro ao atualizar comanda:", error);
            return false;
        }
    },

    deleteTab: async function(tabId) {
        try {
            // Registrar a comanda como excluída
            this.addToDeletedTabsRegistry(tabId);
            
            // Remover a comanda do Firebase
            await firebaseDb.ref(`tabs/${tabId}`).remove();
            return true;
        } catch (error) {
            console.error("Erro ao excluir comanda:", error);
            return false;
        }
    },

    listenToOpenTabs: function(callback) {
        firebaseDb.ref('tabs').orderByChild('status').equalTo('open')
            .on('value', snapshot => {
                const tabs = [];
                snapshot.forEach(childSnapshot => {
                    tabs.push(childSnapshot.val());
                });
                callback(tabs);
            });
    },

    listenToClosedTabs: function(callback) {
        firebaseDb.ref('tabs').orderByChild('status').equalTo('closed')
            .on('value', snapshot => {
                const tabs = [];
                snapshot.forEach(childSnapshot => {
                    tabs.push(childSnapshot.val());
                });
                callback(tabs);
            });
    },

    // Funções para produtos
    saveProduct: async function(product) {
        try {
            await firebaseDb.ref(`products/${product.id}`).set(product);
            return true;
        } catch (error) {
            console.error("Erro ao salvar produto:", error);
            return false;
        }
    },

    updateProduct: async function(productId, updates) {
        try {
            await firebaseDb.ref(`products/${productId}`).update(updates);
            return true;
        } catch (error) {
            console.error("Erro ao atualizar produto:", error);
            return false;
        }
    },

    deleteProduct: async function(productId) {
        try {
            await firebaseDb.ref(`products/${productId}`).remove();
            return true;
        } catch (error) {
            console.error("Erro ao excluir produto:", error);
            return false;
        }
    },

    listenToProducts: function(callback) {
        firebaseDb.ref('products').on('value', snapshot => {
            const products = [];
            snapshot.forEach(childSnapshot => {
                products.push(childSnapshot.val());
            });
            callback(products);
        });
    },

    // Contador de comandas
    getNextTabNumber: async function() {
        try {
            const counterRef = firebaseDb.ref('counter/tabNumber');
            const snapshot = await counterRef.once('value');
            const current = snapshot.val() || 0;
            const next = current + 1;
            await counterRef.set(next);
            return next;
        } catch (error) {
            console.error("Erro ao obter próximo número de comanda:", error);
            return Date.now(); // Fallback para timestamp como número de comanda
        }
    },

    // Funções de sincronização inicial
    syncLocalToFirebase: async function() {
        try {
            console.log("Iniciando sincronização segura...");
            let syncStats = { success: 0, skipped: 0, failed: 0 };
            
            // Primeiro, sincronizar os registros de comandas
            await this.syncDeletedTabsRegistry();
            await this.syncClosedTabsHistory();
            
            // Sincronizar comandas abertas com verificação
            const openTabs = LocalStorageManager.getData('openTabs', []);
            console.log(`Sincronizando ${openTabs.length} comandas abertas...`);
            
            for (const tab of openTabs) {
                try {
                    // Verificar se a comanda está no registro de excluídas
                    const isDeleted = await this.isTabDeleted(tab.id);
                    if (isDeleted) {
                        console.log(`Comanda ${tab.id} está no registro de excluídas. Ignorando sincronização.`);
                        syncStats.skipped++;
                        continue;
                    }
                    
                    // Verificar se a comanda está no histórico de fechadas
                    if (this.isTabInClosedHistory(tab.id)) {
                        console.log(`Comanda ${tab.id} está no histórico de fechadas. Ignorando sincronização.`);
                        syncStats.skipped++;
                        continue;
                    }
                    
                    // Verificar se a comanda existe no Firebase
                    const tabRef = firebaseDb.ref(`tabs/${tab.id}`);
                    const snapshot = await tabRef.once('value');
                    
                    // Se a comanda existe no Firebase, verificar seu status
                    if (snapshot.exists()) {
                        const remoteTab = snapshot.val();
                        
                        // Se a comanda remota está fechada, não sobrescrever
                        if (remoteTab.status === 'closed') {
                            console.log(`Comanda ${tab.id} já fechada no Firebase. Não será sobrescrita.`);
                            // Registrar no histórico local para evitar futuros problemas
                            const closedTabsHistory = this.getClosedTabsHistory();
                            closedTabsHistory[tab.id] = {
                                status: 'closed',
                                closedAt: remoteTab.closedAt || new Date().toISOString()
                            };
                            LocalStorageManager.saveData('closedTabsHistory', closedTabsHistory);
                            
                            syncStats.skipped++;
                            continue;
                        }
                    }
                    
                    // Se chegou aqui, a comanda não existe ou está aberta - pode sincronizar
                    await this.saveTab(tab);
                    syncStats.success++;
                } catch (error) {
                    console.error(`Erro ao sincronizar comanda ${tab.id}:`, error);
                    syncStats.failed++;
                }
            }
            
            // Sincronizar apenas o básico das comandas fechadas
            const closedTabs = LocalStorageManager.getData('closedTabs', []);
            console.log(`Verificando ${closedTabs.length} comandas fechadas...`);
            
            for (const tab of closedTabs) {
                try {
                    // Verificar se a comanda está no registro de excluídas
                    const isDeleted = await this.isTabDeleted(tab.id);
                    if (isDeleted) {
                        console.log(`Comanda fechada ${tab.id} está no registro de excluídas. Ignorando sincronização.`);
                        syncStats.skipped++;
                        continue;
                    }
                    
                    // Verificar se a comanda existe no Firebase
                    const tabRef = firebaseDb.ref(`tabs/${tab.id}`);
                    const snapshot = await tabRef.once('value');
                    
                    // Só sincronizar se não existir no Firebase
                    if (!snapshot.exists()) {
                        await this.saveTab(tab);
                        syncStats.success++;
                    } else {
                        console.log(`Comanda fechada ${tab.id} já existe no Firebase. Não será sobrescrita.`);
                        syncStats.skipped++;
                    }
                } catch (error) {
                    console.error(`Erro ao verificar comanda fechada ${tab.id}:`, error);
                    syncStats.failed++;
                }
            }
            
            // Sincronizar produtos (isso é mais seguro, pois produtos raramente são excluídos)
            const products = LocalStorageManager.getData('products', []);
            for (const product of products) {
                await this.saveProduct(product);
            }
            
            console.log("Sincronização concluída:", syncStats);
            return true;
        } catch (error) {
            console.error("Erro na sincronização local para Firebase:", error);
            return false;
        }
    },

    // Funções para gerenciar o registro de comandas excluídas
    getDeletedTabsRegistry: function() {
        return LocalStorageManager.getData(DELETED_TABS_KEY, {});
    },
    
    addToDeletedTabsRegistry: function(tabId) {
        try {
            const registry = this.getDeletedTabsRegistry();
            registry[tabId] = new Date().toISOString();
            LocalStorageManager.saveData(DELETED_TABS_KEY, registry);
            
            // Também registrar no Firebase para sincronizar entre dispositivos
            if (firebaseDb) {
                firebaseDb.ref(`deletedTabs/${tabId}`).set({
                    deletedAt: new Date().toISOString()
                });
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao registrar comanda excluída:', error);
            return false;
        }
    },
    
    isTabDeleted: async function(tabId) {
        try {
            // Verificar primeiro no registro local
            const registry = this.getDeletedTabsRegistry();
            if (registry[tabId]) {
                return true;
            }
            
            // Se tiver conexão, verificar também no Firebase
            if (firebaseDb) {
                const snapshot = await firebaseDb.ref(`deletedTabs/${tabId}`).once('value');
                return snapshot.exists();
            }
            
            return false;
        } catch (error) {
            console.error('Erro ao verificar se comanda foi excluída:', error);
            return false;
        }
    },
    
    syncDeletedTabsRegistry: async function() {
        try {
            if (!firebaseDb) return false;
            
            // Buscar registro de exclusões do Firebase
            const snapshot = await firebaseDb.ref('deletedTabs').once('value');
            const remoteRegistry = snapshot.val() || {};
            
            // Combinar com o registro local
            const localRegistry = this.getDeletedTabsRegistry();
            const combinedRegistry = { ...localRegistry };
            
            // Adicionar registros remotos ao registro local
            for (const tabId in remoteRegistry) {
                combinedRegistry[tabId] = remoteRegistry[tabId].deletedAt;
            }
            
            // Salvar registro combinado localmente
            LocalStorageManager.saveData(DELETED_TABS_KEY, combinedRegistry);
            
            return true;
        } catch (error) {
            console.error('Erro ao sincronizar registro de comandas excluídas:', error);
            return false;
        }
    },

    // Funções para gerenciar o histórico de comandas fechadas
    getClosedTabsHistory: function() {
        return LocalStorageManager.getData('closedTabsHistory', {});
    },
    
    isTabInClosedHistory: function(tabId) {
        const history = this.getClosedTabsHistory();
        return !!history[tabId];
    },
    
    syncClosedTabsHistory: async function() {
        try {
            if (!firebaseDb) return false;
            
            // Obter histórico local
            const localHistory = this.getClosedTabsHistory();
            
            // Enviar ao Firebase para sincronizar entre dispositivos
            for (const tabId in localHistory) {
                await firebaseDb.ref(`closedTabsHistory/${tabId}`).set(localHistory[tabId]);
            }
            
            // Obter histórico do Firebase
            const snapshot = await firebaseDb.ref('closedTabsHistory').once('value');
            const remoteHistory = snapshot.val() || {};
            
            // Combinar históricos
            const combinedHistory = { ...localHistory, ...remoteHistory };
            
            // Salvar histórico combinado localmente
            LocalStorageManager.saveData('closedTabsHistory', combinedHistory);
            
            return true;
        } catch (error) {
            console.error('Erro ao sincronizar histórico de comandas fechadas:', error);
            return false;
        }
    },

    // Função para limpar registros antigos
    cleanupOldRecords: function() {
        try {
            const MAX_AGE_DAYS = 30; // Manter registros por até 30 dias
            const now = new Date();
            
            // Limpar registro de comandas excluídas
            const deletedRegistry = this.getDeletedTabsRegistry();
            const newDeletedRegistry = {};
            
            for (const tabId in deletedRegistry) {
                const deletedDate = new Date(deletedRegistry[tabId]);
                const diffDays = (now - deletedDate) / (1000 * 60 * 60 * 24);
                
                if (diffDays < MAX_AGE_DAYS) {
                    newDeletedRegistry[tabId] = deletedRegistry[tabId];
                }
            }
            
            LocalStorageManager.saveData(DELETED_TABS_KEY, newDeletedRegistry);
            
            // Limpar histórico de comandas fechadas
            const closedHistory = this.getClosedTabsHistory();
            const newClosedHistory = {};
            
            for (const tabId in closedHistory) {
                const item = closedHistory[tabId];
                const closedDate = new Date(item.closedAt);
                const diffDays = (now - closedDate) / (1000 * 60 * 60 * 24);
                
                if (diffDays < MAX_AGE_DAYS) {
                    newClosedHistory[tabId] = item;
                }
            }
            
            LocalStorageManager.saveData('closedTabsHistory', newClosedHistory);
            
            console.log("Limpeza de registros concluída");
            return true;
        } catch (error) {
            console.error("Erro ao limpar registros antigos:", error);
            return false;
        }
    }
}; 