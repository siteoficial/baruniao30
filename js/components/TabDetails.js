function TabDetails({ tab, onAddItem, onRemoveItem, onUpdateItem, onCloseTab, onBack, onDeleteTab, autoOpenProductSelector, onProductSelectorOpened }) {
    try {
        const [showProductSelector, setShowProductSelector] = React.useState(autoOpenProductSelector || false);
        const [tabTotal, setTabTotal] = React.useState(0);
        const [animatedItemId, setAnimatedItemId] = React.useState(null);
        const [searchTerm, setSearchTerm] = React.useState('');
        const [filteredItems, setFilteredItems] = React.useState([]);
        const [confirmDelete, setConfirmDelete] = React.useState(false);
        const [quickAddMode, setQuickAddMode] = React.useState(false);
        const [recentlyAddedProducts, setRecentlyAddedProducts] = React.useState([]);
        const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
        const [clickedButtons, setClickedButtons] = React.useState({});
        
        // Referência para a lista de itens para scroll automático
        const itemsListRef = React.useRef(null);
        
        // Detectar dispositivo móvel
        React.useEffect(() => {
            const handleResize = () => {
                setIsMobile(window.innerWidth < 768);
            };
            
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, []);
        
        // Carregar produtos recentes do localStorage
        React.useEffect(() => {
            const recentProducts = getRecentProducts(isMobile ? 3 : 5);
            if (recentProducts && recentProducts.length > 0) {
                setRecentlyAddedProducts(recentProducts);
            }
        }, [isMobile]);
        
        React.useEffect(() => {
            if (tab && tab.items) {
                setTabTotal(calculateTabTotal(tab.items));
                setFilteredItems(tab.items);
            } else {
                setTabTotal(0);
                setFilteredItems([]);
            }
        }, [tab]);
        
        // Filtrar itens quando o termo de busca mudar
        React.useEffect(() => {
            if (!tab || !tab.items) return;
            
            if (!searchTerm) {
                setFilteredItems(tab.items);
                return;
            }
            
            const term = searchTerm.toLowerCase();
            const filtered = tab.items.filter(item => 
                item.name.toLowerCase().includes(term)
            );
            
            setFilteredItems(filtered);
        }, [searchTerm, tab]);
        
        // Rola para o final da lista quando um novo item é adicionado
        React.useEffect(() => {
            if (animatedItemId && itemsListRef.current) {
                itemsListRef.current.scrollTop = itemsListRef.current.scrollHeight;
                
                // Limpa o ID animado após 1.5s (duração da animação)
                const timer = setTimeout(() => {
                    setAnimatedItemId(null);
                }, 1500);
                
                return () => clearTimeout(timer);
            }
        }, [animatedItemId]);
        
        // Efeito para abrir o seletor de produtos automaticamente
        React.useEffect(() => {
            if (autoOpenProductSelector && !showProductSelector) {
                setShowProductSelector(true);
                if (onProductSelectorOpened) {
                    onProductSelectorOpened();
                }
            }
        }, [autoOpenProductSelector, showProductSelector, onProductSelectorOpened]);
        
        if (!tab) {
            return null;
        }
        
        // Garantir que tab.items sempre existe
        if (!tab.items) {
            tab.items = [];
        }
        
        // Buscar produtos recentes
        function getRecentProducts(limit = 5) {
            try {
                const allProducts = ProductManager.getProducts();
                const productUsageStats = localStorage.getItem('productUsageStats');
                
                if (!productUsageStats) return [];
                
                const stats = JSON.parse(productUsageStats);
                
                // Ordenar produtos por frequência de uso
                const sortedProducts = allProducts
                    .filter(p => stats[p.id])
                    .sort((a, b) => (stats[b.id] || 0) - (stats[a.id] || 0))
                    .slice(0, limit);
                
                return sortedProducts;
            } catch (error) {
                console.error('Error fetching recent products:', error);
                return [];
            }
        }
        
        // Atualizar estatísticas de uso do produto
        function updateProductUsageStats(productId) {
            try {
                const stats = JSON.parse(localStorage.getItem('productUsageStats') || '{}');
                stats[productId] = (stats[productId] || 0) + 1;
                localStorage.setItem('productUsageStats', JSON.stringify(stats));
            } catch (error) {
                console.error('Error updating product usage stats:', error);
            }
        }
        
        const handleAddItem = (product) => {
            try {
                console.log('Tentando adicionar produto:', product);
                
                if (!product || !product.name) {
                    console.error('Produto inválido ou sem nome!');
                    return;
                }
                
                // Criar objeto item simplificado
                const item = {
                    id: generateId(), // Sempre gerar um novo ID para evitar conflitos
                    name: product.name,
                    price: parseFloat(product.price) || 0,
                    quantity: 1 // Sempre começar com quantidade 1
                };
                
                console.log('Item preparado para adicionar:', item);
                
                // Chamar callback para adicionar o item
                if (typeof onAddItem === 'function') {
                    onAddItem(tab.id, item);
                    
                    // Animar item na lista
                    setTimeout(() => {
                        setAnimatedItemId(item.id);
                    }, 100);
                    
                    // Atualizar estatísticas
                    if (product.id) {
                        try {
                            updateProductUsageStats(product.id);
                        } catch (e) {
                            console.error('Erro ao atualizar estatísticas:', e);
                        }
                    }
                    
                    // Se não estiver no modo rápido, fechar o seletor de produtos
                    if (!quickAddMode) {
                        setTimeout(() => {
                            setShowProductSelector(false);
                        }, 300);
                    }
                } else {
                    console.error('Função onAddItem não disponível!');
                }
            } catch (error) {
                console.error('Erro ao adicionar item:', error);
            }
        };
        
        const handleRemoveItem = (itemId) => {
            if (onRemoveItem) {
                onRemoveItem(tab.id, itemId);
            }
        };
        
        const handleUpdateItemQuantity = (itemId, quantity) => {
            if (quantity <= 0 || isNaN(quantity)) {
                return;
            }
            
            if (onUpdateItem) {
                onUpdateItem(tab.id, itemId, { quantity });
            }
        };
        
        const handleCloseTab = () => {
            if (onCloseTab) {
                onCloseTab(tab);
            }
        };
        
        const handleDeleteTab = () => {
            if (confirmDelete && onDeleteTab) {
                onDeleteTab(tab.id);
            } else {
                setConfirmDelete(true);
                // Reset after 3 seconds if not confirmed
                setTimeout(() => {
                    setConfirmDelete(false);
                }, 3000);
            }
        };
        
        const getTimeSinceOpened = () => {
            try {
                return getTimeDifference(tab.createdAt);
            } catch (error) {
                console.error('Error calculating time since opened:', error);
                reportError(error);
                return '';
            }
        };
        
        const isLongOpen = () => {
            if (!tab || !tab.createdAt) return false;
            const now = new Date();
            const created = new Date(tab.createdAt);
            const diffHours = (now - created) / (1000 * 60 * 60);
            return diffHours > 2;
        };
        
        const toggleQuickAddMode = () => {
            setQuickAddMode(prev => !prev);
        };
        
        return (
            <div data-name="tab-details" className="tab-details">
                <div data-name="tab-details-header" className={`tab-details-header ${isMobile ? 'flex-col' : ''}`}>
                    <div data-name="tab-details-info" className={`tab-details-info ${isMobile ? 'mb-3 w-full' : ''}`}>
                        <div data-name="tab-details-name" className="tab-details-name flex items-center">
                            {tab.customerName} - Comanda #{tab.number}
                            {isLongOpen() && (
                                <span className="ml-2 text-yellow-500 text-sm flex items-center" title="Comanda aberta há muito tempo">
                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                    {!isMobile && "Aberta há muito tempo"}
                                </span>
                            )}
                        </div>
                        <div data-name="tab-details-time" className="tab-details-time">
                            Aberta há {getTimeSinceOpened()}
                        </div>
                    </div>
                    
                    <div data-name="tab-details-actions" className={`tab-details-actions ${isMobile ? 'w-full flex justify-between' : ''}`}>
                        <button
                            data-name="delete-tab-button"
                            className="btn btn-icon btn-danger"
                            onClick={handleDeleteTab}
                            aria-label="Excluir comanda"
                            title={confirmDelete ? "Clique novamente para confirmar" : "Excluir comanda"}
                        >
                            <i className={`fas ${confirmDelete ? 'fa-exclamation' : 'fa-trash'}`}></i>
                        </button>
                        
                        <button
                            data-name="close-tab-action-button"
                            className={`btn ${isMobile ? 'flex-grow mx-2' : ''} btn-secondary`}
                            onClick={onBack}
                            aria-label="Fechar comanda"
                            title="Fechar comanda e voltar à lista"
                        >
                            <i className="fas fa-times-circle mr-2"></i>
                            Fechar Comanda
                        </button>
                        
                        <button
                            data-name="add-item-button"
                            className={`btn ${isMobile ? 'flex-grow mx-2' : ''} ${showProductSelector ? 'btn-success' : 'btn-primary'}`}
                            onClick={() => setShowProductSelector(!showProductSelector)}
                        >
                            <i className={`fas ${showProductSelector ? 'fa-check' : 'fa-plus'} mr-2`}></i>
                            {showProductSelector ? 'Concluir Adição' : 'Adicionar Item'}
                        </button>
                    </div>
                </div>
                
                {recentlyAddedProducts.length > 0 && !showProductSelector && (
                    <div data-name="quick-products" className="flex flex-wrap gap-2 mt-3 p-2 bg-gray-800 bg-opacity-40 rounded-lg animate-fadeIn">
                        <span className="w-full text-xs text-gray-400 mb-1 flex items-center">
                            <i className="fas fa-bolt text-yellow-500 mr-1"></i> Adição Rápida:
                        </span>
                        <div className={`flex flex-wrap gap-2 ${isMobile ? 'w-full overflow-x-auto pb-1' : ''}`}>
                            {recentlyAddedProducts.map(product => (
                                <button
                                    key={product.id}
                                    className={`btn btn-xs ${clickedButtons[product.id] ? 'btn-success animate-pulse' : 'btn-secondary'} hover:bg-purple-600 transition-colors ${isMobile ? 'flex-shrink-0' : ''}`}
                                    onClick={() => {
                                        // Mostrar feedback visual
                                        setClickedButtons(prev => ({
                                            ...prev,
                                            [product.id]: true
                                        }));
                                        
                                        // Limpar feedback após 1 segundo
                                        setTimeout(() => {
                                            setClickedButtons(prev => ({
                                                ...prev,
                                                [product.id]: false
                                            }));
                                        }, 1000);
                                        
                                        handleAddItem({...product, quantity: 1});
                                    }}
                                    title={`Adicionar ${product.name} - ${formatCurrency(product.price)}`}
                                >
                                    <i className={`fas ${clickedButtons[product.id] ? 'fa-check' : 'fa-plus'} mr-1 text-xs`}></i>
                                    {product.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {showProductSelector && (
                    <div data-name="product-selector" className="mt-3 animate-fadeInUp">
                        <div className="mb-2 flex items-center justify-between flex-wrap">
                            <div className={`flex ${isMobile ? 'flex-col w-full' : 'items-center'}`}>
                                <button
                                    className={`btn btn-sm ${quickAddMode ? 'btn-success' : 'btn-secondary'} ${isMobile ? 'w-full mb-2' : 'mr-2'}`}
                                    onClick={toggleQuickAddMode}
                                    title={quickAddMode ? "Desativar modo de adição rápida" : "Ativar modo de adição rápida"}
                                >
                                    <i className={`fas fa-bolt mr-1 ${quickAddMode ? 'text-white' : 'text-yellow-400'}`}></i>
                                    {quickAddMode ? 'Modo Rápido Ativado' : 'Modo Rápido'}
                                </button>
                                {quickAddMode && (
                                    <span className="text-sm text-gray-400">
                                        Adicione vários itens sem fechar o seletor
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <ProductList
                            products={ProductManager.getProducts()}
                            onAddToTab={handleAddItem}
                            isSelectionMode={true}
                            tabItems={tab.items}
                        />
                    </div>
                )}
                
                <div data-name="tab-items" className="mt-3">
                    <div className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-start md:items-center mb-2`}>
                        <h4 className="text-lg font-medium flex items-center">
                            <i className="fas fa-receipt text-purple-500 mr-2"></i>
                            Itens da Comanda
                            <span className="ml-2 text-sm text-gray-400">({tab.items ? tab.items.length : 0})</span>
                        </h4>
                        
                        {tab.items && tab.items.length > 0 && (
                            <div className={`relative ${isMobile ? 'w-full mt-2' : 'w-64'}`}>
                                <input
                                    type="text"
                                    className="form-control pl-10 py-2 text-sm w-full"
                                    placeholder="Buscar itens..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-search text-gray-400"></i>
                                </div>
                                {searchTerm && (
                                    <button
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setSearchTerm('')}
                                        aria-label="Limpar busca"
                                    >
                                        <i className="fas fa-times text-gray-400 hover:text-white"></i>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {!tab.items || tab.items.length === 0 ? (
                        <div data-name="empty-items" className="p-4 text-center text-gray-400 bg-gray-800 bg-opacity-30 rounded-lg">
                            <i className="fas fa-utensils text-4xl mb-3 opacity-30"></i>
                            <p>Nenhum item adicionado à comanda.</p>
                            <button
                                className="btn btn-secondary mt-3 text-sm"
                                onClick={() => setShowProductSelector(true)}
                                title={!tab.items || tab.items.length === 0 ? "Adicione itens antes de encerrar a conta" : "Encerrar a conta e processar pagamento"}
                            >
                                <i className="fas fa-plus mr-2"></i>
                                Adicionar primeiro item
                            </button>
                        </div>
                    ) : (
                        <div 
                            data-name="tab-items-list" 
                            className="tab-items-list custom-scrollbar"
                            ref={itemsListRef}
                        >
                            {filteredItems.length === 0 ? (
                                <div className="p-4 text-center text-gray-400">
                                    Nenhum item encontrado para "{searchTerm}".
                                </div>
                            ) : (
                                filteredItems.map(item => (
                                    <div 
                                        data-name={`tab-item-${item.id}`} 
                                        key={item.id} 
                                        className={`tab-item compact ${animatedItemId === item.id ? 'item-added' : ''} ${isMobile ? 'flex-col md:flex-row' : ''}`}
                                    >
                                        <div data-name="tab-item-info" className={`tab-item-info ${isMobile ? 'mb-2 md:mb-0' : ''}`}>
                                            <div data-name="tab-item-name" className="tab-item-name">
                                                {item.name}
                                            </div>
                                            <div data-name="tab-item-price" className="text-sm text-gray-400">
                                                {formatCurrency(item.price)} cada
                                            </div>
                                        </div>
                                        
                                        <div data-name="tab-item-actions" className={`flex ${isMobile ? 'justify-between' : ''} items-center`}>
                                            <div data-name="quantity-control" className="flex items-center mr-4">
                                                <button
                                                    data-name="decrease-quantity"
                                                    className="btn btn-icon btn-sm btn-secondary"
                                                    onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                                                    aria-label="Diminuir quantidade"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <i className="fas fa-minus"></i>
                                                </button>
                                                
                                                <span data-name="item-quantity" className="mx-2 w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                
                                                <button
                                                    data-name="increase-quantity"
                                                    className="btn btn-icon btn-sm btn-secondary"
                                                    onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                                                    aria-label="Aumentar quantidade"
                                                >
                                                    <i className="fas fa-plus"></i>
                                                </button>
                                            </div>
                                            
                                            <div data-name="item-total" className="font-medium mr-3 w-20 text-right">
                                                {formatCurrency(item.price * item.quantity)}
                                            </div>
                                            
                                            <button
                                                data-name="remove-item"
                                                className="btn btn-icon btn-sm btn-danger"
                                                onClick={() => handleRemoveItem(item.id)}
                                                aria-label="Remover item"
                                                title="Remover item"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                
                <div data-name="tab-summary" className="mt-6 bg-gray-900 bg-opacity-50 rounded-lg p-4 shadow-lg border border-gray-800">
                    <div className="flex flex-col space-y-4">
                        <div data-name="tab-total" className="flex justify-between items-center border-b border-gray-700 pb-4">
                            <span className="text-gray-300 font-medium">Total da Comanda</span>
                            <span className="text-xl font-bold text-white">{formatCurrency(tabTotal)}</span>
                        </div>
                        
                        <div data-name="tab-actions" className="pt-2">
                            <button
                                data-name="close-tab-button"
                                className="btn btn-success w-full py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                                onClick={handleCloseTab}
                                disabled={!tab.items || tab.items.length === 0}
                                title={!tab.items || tab.items.length === 0 ? "Adicione itens antes de encerrar a conta" : "Encerrar a conta e processar pagamento"}
                            >
                                <i className="fas fa-check-circle mr-2"></i>
                                Encerrar a Conta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('TabDetails component error:', error);
        reportError(error);
        return null;
    }
}
