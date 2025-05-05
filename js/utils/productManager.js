const ProductManager = {
    STORAGE_KEY: 'products',
    CATEGORIES_KEY: 'productCategories',
    
    // Estado local para armazenar os produtos em memória
    _products: [],
    _initialized: false,
    
    // Inicialização e configuração dos listeners do Firebase
    init: async function() {
        if (this._initialized) return;
        
        try {
            // Inicializar Firebase
            if (!FirebaseManager.initializeFirebase()) {
                console.error("Falha ao inicializar Firebase, usando localStorage como fallback");
                this._loadFromLocalStorage();
                return;
            }
            
            // Configurar listeners para produtos
            FirebaseManager.listenToProducts(products => {
                this._products = products;
                // Manter também no localStorage como backup
                LocalStorageManager.saveData(this.STORAGE_KEY, products);
                // Notificar alterações
                this._notifyProductsChanged();
            });
            
            // Marcar como inicializado
            this._initialized = true;
        } catch (error) {
            console.error("Erro ao inicializar ProductManager com Firebase:", error);
            // Fallback para localStorage
            this._loadFromLocalStorage();
        }
    },
    
    // Carrega os dados do localStorage como fallback
    _loadFromLocalStorage: function() {
        this._products = LocalStorageManager.getData(this.STORAGE_KEY, []);
    },
    
    // Sistema de notificação para atualizações em tempo real
    _productChangeListeners: [],
    
    addProductChangeListener: function(listener) {
        this._productChangeListeners.push(listener);
    },
    
    removeProductChangeListener: function(listener) {
        this._productChangeListeners = this._productChangeListeners.filter(l => l !== listener);
    },
    
    _notifyProductsChanged: function() {
        this._productChangeListeners.forEach(listener => {
            try {
                listener(this._products);
            } catch (error) {
                console.error("Erro ao notificar listener:", error);
            }
        });
    },
    
    getProducts: function() {
        try {
            return this._products;
        } catch (error) {
            console.error('Erro ao obter produtos:', error);
            reportError(error);
            return [];
        }
    },
    
    getProductById: function(productId) {
        try {
            return this._products.find(product => product.id === productId) || null;
        } catch (error) {
            console.error('Erro ao obter produto por ID:', error);
            reportError(error);
            return null;
        }
    },
    
    createProduct: async function(productData) {
        try {
            const newProduct = {
                id: generateId(),
                ...productData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Salvar no Firebase
            if (FirebaseManager.initializeFirebase()) {
                await FirebaseManager.saveProduct(newProduct);
            } else {
                // Fallback para localStorage
                const products = [...this._products];
                products.push(newProduct);
                LocalStorageManager.saveData(this.STORAGE_KEY, products);
                this._products = products;
                this._notifyProductsChanged();
            }
            
            // Atualizar categorias se necessário
            if (productData.category) {
                this.addCategory(productData.category);
            }
            
            return newProduct;
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            reportError(error);
            return null;
        }
    },
    
    updateProduct: async function(productId, updates) {
        try {
            // Verificar se o produto existe em memória
            const productIndex = this._products.findIndex(product => product.id === productId);
            
            if (productIndex === -1) {
                return null;
            }
            
            const updatedProduct = {
                ...this._products[productIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            // Atualizar no Firebase
            if (FirebaseManager.initializeFirebase()) {
                await FirebaseManager.updateProduct(productId, updatedProduct);
            } else {
                // Fallback para localStorage
                const products = [...this._products];
                products[productIndex] = updatedProduct;
                LocalStorageManager.saveData(this.STORAGE_KEY, products);
                this._products = products;
                this._notifyProductsChanged();
            }
            
            // Atualizar categorias se necessário
            if (updates.category) {
                this.addCategory(updates.category);
            }
            
            return updatedProduct;
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            reportError(error);
            return null;
        }
    },
    
    deleteProduct: async function(productId) {
        try {
            // Verificar se o produto existe em memória
            if (!this._products.some(product => product.id === productId)) {
                return false;
            }
            
            // Excluir do Firebase
            if (FirebaseManager.initializeFirebase()) {
                await FirebaseManager.deleteProduct(productId);
            } else {
                // Fallback para localStorage
                const filteredProducts = this._products.filter(product => product.id !== productId);
                LocalStorageManager.saveData(this.STORAGE_KEY, filteredProducts);
                this._products = filteredProducts;
                this._notifyProductsChanged();
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            reportError(error);
            return false;
        }
    },
    
    searchProducts: function(query) {
        try {
            query = query.toLowerCase();
            
            return this._products.filter(product => 
                product.name.toLowerCase().includes(query) || 
                (product.category && product.category.toLowerCase().includes(query))
            );
        } catch (error) {
            console.error('Erro ao pesquisar produtos:', error);
            reportError(error);
            return [];
        }
    },
    
    getProductsByCategory: function(category) {
        try {
            if (!category) {
                return this.getProducts();
            }
            
            return this._products.filter(product => product.category === category);
        } catch (error) {
            console.error('Erro ao obter produtos por categoria:', error);
            reportError(error);
            return [];
        }
    },
    
    getCategories: function() {
        try {
            const categories = new Set();
            
            this._products.forEach(product => {
                if (product.category) {
                    categories.add(product.category);
                }
            });
            
            return Array.from(categories).sort();
        } catch (error) {
            console.error('Erro ao obter categorias:', error);
            reportError(error);
            return [];
        }
    },
    
    addCategory: function(category) {
        try {
            if (!category) return false;
            
            const categories = this.getCategories();
            if (!categories.includes(category)) {
                // As categorias são derivadas dos produtos, apenas atualizamos os dados do produto
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao adicionar categoria:', error);
            reportError(error);
            return false;
        }
    }
};
