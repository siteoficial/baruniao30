function ProductList({ products, onSelectProduct, onEditProduct, onDeleteProduct, isSelectionMode = false, onAddToTab = null, tabItems = [] }) {
    try {
        const [searchTerm, setSearchTerm] = React.useState('');
        const [selectedCategory, setSelectedCategory] = React.useState('');
        const [filteredProducts, setFilteredProducts] = React.useState(products);
        const [quantities, setQuantities] = React.useState({});
        const [recentlyAdded, setRecentlyAdded] = React.useState({});
        const [viewMode, setViewMode] = React.useState('grid'); // 'grid' ou 'list'
        const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
        const searchInputRef = React.useRef(null);
        
        // Função para obter a quantidade de um produto na comanda
        const getProductQuantityInTab = (productId) => {
            if (!tabItems || tabItems.length === 0) return 0;
            
            const item = tabItems.find(item => item.id === productId);
            return item ? item.quantity : 0;
        };
        
        // Detectar dispositivo móvel
        React.useEffect(() => {
            const handleResize = () => {
                setIsMobile(window.innerWidth < 768);
            };
            
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, []);
        
        // Get unique categories
        const categories = React.useMemo(() => {
            const uniqueCategories = new Set();
            products.forEach(product => {
                if (product.category) {
                    uniqueCategories.add(product.category);
                }
            });
            return Array.from(uniqueCategories).sort();
        }, [products]);
        
        // Filter products based on search and category
        React.useEffect(() => {
            let filtered = products;
            
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                filtered = filtered.filter(product => 
                    product.name.toLowerCase().includes(search) || 
                    (product.category && product.category.toLowerCase().includes(search))
                );
            }
            
            if (selectedCategory) {
                filtered = filtered.filter(product => 
                    product.category === selectedCategory
                );
            }
            
            setFilteredProducts(filtered);
            
            // Initialize quantities for new filtered products
            const newQuantities = { ...quantities };
            filtered.forEach(product => {
                if (!newQuantities[product.id]) {
                    newQuantities[product.id] = 1;
                }
            });
            setQuantities(newQuantities);
        }, [searchTerm, selectedCategory, products]);
        
        // Foco automático no campo de busca quando em modo de seleção
        React.useEffect(() => {
            if (isSelectionMode && searchInputRef.current && !isMobile) {
                setTimeout(() => {
                    searchInputRef.current.focus();
                }, 100);
            }
        }, [isSelectionMode, isMobile]);
        
        const handleSelectProduct = (product) => {
            if (onSelectProduct && isSelectionMode) {
                onSelectProduct(product);
            }
        };
        
        const handleQuantityChange = (productId, change) => {
            setQuantities(prev => {
                const newValue = Math.max(1, (prev[productId] || 1) + change);
                return { ...prev, [productId]: newValue };
            });
        };
        
        const handleAddToTab = (product) => {
            if (onAddToTab) {
                const quantity = quantities[product.id] || 1;
                
                // Verificar se o produto já existe na comanda (agora isso é tratado no TabsPage)
                const existingInTab = tabItems && tabItems.some(
                    item => item.name.toLowerCase() === product.name.toLowerCase()
                );
                
                // Passar item para o callback
                onAddToTab({
                    ...product,
                    quantity
                });
                
                // Mark as recently added
                setRecentlyAdded(prev => ({
                    ...prev,
                    [product.id]: true
                }));
                
                // Reset the recently added status after animation
                setTimeout(() => {
                    setRecentlyAdded(prev => ({
                        ...prev,
                        [product.id]: false
                    }));
                }, 2000);
                
                // Reset quantity after adding
                setQuantities(prev => ({
                    ...prev,
                    [product.id]: 1
                }));
                
                // Focar na busca após adicionar item
                if (searchInputRef.current && !isMobile) {
                    searchInputRef.current.focus();
                }
            }
        };
        
        // Keyboard shortcut for quick add
        const handleKeyDown = (e, product) => {
            if (e.key === 'Enter' && onAddToTab) {
                handleAddToTab(product);
            }
        };
        
        const toggleViewMode = () => {
            setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
        };
        
        // Ordenar produtos pela frequência de uso ou ordem alfabética
        const sortedProducts = React.useMemo(() => {
            return [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
        }, [filteredProducts]);
        
        // Em dispositivos móveis, usar sempre visualização de grade se estiver no modo de seleção
        const effectiveViewMode = isMobile && isSelectionMode ? 'grid' : viewMode;
        
        return (
            <div data-name="product-list" className="card">
                <div data-name="product-list-header" className={`card-header ${isMobile ? 'flex-col items-start' : ''}`}>
                    <h3 className="card-title">
                        <i className="fas fa-utensils mr-2 text-purple-500"></i>
                        {isSelectionMode ? "Adicionar Itens à Comanda" : "Produtos"}
                    </h3>
                    {!isSelectionMode && (
                        <div data-name="product-filters" className={`flex items-center space-x-2 ${isMobile ? 'w-full mt-2' : ''}`}>
                            <input
                                data-name="product-search"
                                type="text"
                                className={`form-control text-sm ${isMobile ? 'w-full' : 'w-40'}`}
                                placeholder="Buscar produtos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                data-name="category-filter"
                                className="form-control text-sm"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Todas categorias</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                
                {isSelectionMode && (
                    <div data-name="selection-filters" className="p-3 bg-gray-800 bg-opacity-50 rounded-lg mb-3">
                        <div className={`flex ${isMobile ? 'flex-col' : 'items-center space-x-2'} mb-3`}>
                            <div className={`relative ${isMobile ? 'mb-2' : ''} flex-grow`}>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-search text-gray-400"></i>
                                </div>
                                <input
                                    data-name="product-search"
                                    type="text"
                                    className="form-control w-full pl-10 py-2"
                                    placeholder="Buscar produtos por nome..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    ref={searchInputRef}
                                />
                                {searchTerm && (
                                    <button 
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <i className="fas fa-times text-gray-400 hover:text-white"></i>
                                    </button>
                                )}
                            </div>
                            
                            {!isMobile && (
                                <>
                                    <button
                                        className={`btn btn-icon ${effectiveViewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={toggleViewMode}
                                        title="Visualização em grade"
                                        aria-label="Mudar para visualização em grade"
                                    >
                                        <i className="fas fa-th-large"></i>
                                    </button>
                                    
                                    <button
                                        className={`btn btn-icon ${effectiveViewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={toggleViewMode}
                                        title="Visualização em lista"
                                        aria-label="Mudar para visualização em lista"
                                    >
                                        <i className="fas fa-list"></i>
                                    </button>
                                </>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2 overflow-x-auto pb-1 whitespace-nowrap">
                            <button 
                                data-name="all-categories"
                                className={`px-3 py-2 rounded transition-all ${!selectedCategory ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                                onClick={() => setSelectedCategory('')}
                            >
                                <i className="fas fa-th-large mr-2"></i>
                                Todos
                            </button>
                            {categories.map(category => (
                                <button
                                    data-name={`category-${category}`}
                                    key={category}
                                    className={`px-3 py-2 rounded transition-all ${selectedCategory === category ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {getCategoryIcon(category)}
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {filteredProducts.length === 0 ? (
                    <div data-name="empty-products" className="empty-state">
                        <div className="empty-state-icon">
                            <i className="fas fa-box-open"></i>
                        </div>
                        <div className="empty-state-text">Nenhum produto encontrado</div>
                        {searchTerm && (
                            <button 
                                className="btn btn-secondary mt-3"
                                onClick={() => setSearchTerm('')}
                            >
                                <i className="fas fa-times mr-2"></i>
                                Limpar busca
                            </button>
                        )}
                    </div>
                ) : (
                    <div data-name="products-container" className={isSelectionMode && onAddToTab ? "p-2" : ""}>
                        {isSelectionMode && onAddToTab && effectiveViewMode === 'grid' ? (
                            <div data-name="products-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                {sortedProducts.map(product => {
                                    // Verificar se este produto já existe na comanda
                                    const existingInTab = tabItems && tabItems.some(
                                        item => item.name.toLowerCase() === product.name.toLowerCase()
                                    );
                                    
                                    return (
                                    <div 
                                        key={product.id}
                                        className={`product-item compact-card ${recentlyAdded[product.id] ? 'item-added-animation' : ''} ${existingInTab ? 'border-purple-500 border' : ''}`}
                                        onClick={() => effectiveViewMode === 'grid' && handleAddToTab(product)}
                                    >
                                        <div className="product-info">
                                            <div className="product-name">
                                                {product.name}
                                                {existingInTab && (
                                                    <span className="ml-1 inline-flex items-center justify-center bg-indigo-800 bg-opacity-70 text-white text-xs rounded px-1 text-opacity-90" style={{fontSize: '0.65rem'}}>
                                                        + 1
                                                    </span>
                                                )}
                                            </div>
                                            <div className="product-price">{formatCurrency(product.price)}</div>
                                        </div>
                                        
                                        {effectiveViewMode === 'list' && (
                                            <div className="product-actions">
                                                <div className="quantity-control compact">
                                                    <button
                                                        className="quantity-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setQuantities(prev => ({
                                                                ...prev,
                                                                [product.id]: Math.max(1, (prev[product.id] || 1) - 1)
                                                            }));
                                                        }}
                                                    >
                                                        <i className="fas fa-minus"></i>
                                                    </button>
                                                    
                                                    <span className="quantity-value">
                                                        {quantities[product.id] || 1}
                                                    </span>
                                                    
                                                    <button
                                                        className="quantity-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setQuantities(prev => ({
                                                                ...prev,
                                                                [product.id]: (prev[product.id] || 1) + 1
                                                            }));
                                                        }}
                                                    >
                                                        <i className="fas fa-plus"></i>
                                                    </button>
                                                </div>
                                                
                                                <button
                                                    data-name="add-to-tab-btn"
                                                    className={`add-to-tab-btn compact ${isMobile ? 'mobile-add-btn' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToTab(product);
                                                    }}
                                                    aria-label="Adicionar à comanda"
                                                >
                                                    <i className="fas fa-plus"></i>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    );
                                })}
                            </div>
                        ) : isSelectionMode && onAddToTab && effectiveViewMode === 'list' ? (
                            <div data-name="products-list" className="overflow-x-auto rounded-lg bg-gray-800 bg-opacity-50">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-700 bg-gray-800 bg-opacity-40 text-gray-400 text-sm">
                                            <th className="py-3 px-4">Produto</th>
                                            <th className="py-3 px-4">Categoria</th>
                                            <th className="py-3 px-4 text-right">Preço</th>
                                            <th className="py-3 px-4 text-center">Quantidade</th>
                                            <th className="py-3 px-4 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedProducts.map(product => {
                                            // Verificar se este produto já existe na comanda
                                            const existingInTab = tabItems && tabItems.some(
                                                item => item.name.toLowerCase() === product.name.toLowerCase()
                                            );
                                            
                                            return (
                                            <tr 
                                                key={product.id} 
                                                className={`border-b border-gray-700 hover:bg-gray-700 transition-colors ${recentlyAdded[product.id] ? 'bg-purple-900 bg-opacity-20' : ''} ${existingInTab ? 'bg-indigo-900 bg-opacity-20' : ''}`}
                                                onKeyDown={(e) => handleKeyDown(e, product)}
                                                tabIndex={0}
                                            >
                                                <td className="py-3 px-4 font-medium">
                                                    {product.name}
                                                    {existingInTab && (
                                                        <span className="ml-2 inline-flex items-center justify-center bg-indigo-800 bg-opacity-70 text-white text-xs rounded px-1 text-opacity-90" style={{fontSize: '0.65rem'}}>
                                                            na comanda
                                                        </span>
                                                    )}
                                                    {recentlyAdded[product.id] && (
                                                        <span className="ml-2 text-green-400 text-sm animate-fadeIn">
                                                            <i className="fas fa-check-circle"></i>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-gray-400">
                                                    {getCategoryIcon(product.category)}
                                                    {product.category || "-"}
                                                </td>
                                                <td className="py-3 px-4 text-right font-medium">
                                                    {formatCurrency(product.price)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-center">
                                                        <button
                                                            className="btn btn-sm btn-icon btn-secondary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setQuantities(prev => ({
                                                                    ...prev,
                                                                    [product.id]: Math.max(1, (prev[product.id] || 1) - 1)
                                                                }));
                                                            }}
                                                            disabled={quantities[product.id] <= 1}
                                                        >
                                                            <i className="fas fa-minus"></i>
                                                        </button>
                                                        <span className="mx-3 w-6 text-center">
                                                            {quantities[product.id] || 1}
                                                        </span>
                                                        <button
                                                            className="btn btn-sm btn-icon btn-secondary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setQuantities(prev => ({
                                                                    ...prev,
                                                                    [product.id]: (prev[product.id] || 1) + 1
                                                                }));
                                                            }}
                                                        >
                                                            <i className="fas fa-plus"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddToTab(product);
                                                        }}
                                                    >
                                                        <i className="fas fa-plus mr-1"></i>
                                                        {existingInTab ? 'Adicionar mais' : 'Adicionar'}
                                                    </button>
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div data-name="products-management-list" className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-800 bg-opacity-40 text-gray-400 text-sm">
                                            <th className="py-3 px-4 text-left">Nome</th>
                                            <th className="py-3 px-4 text-left">Categoria</th>
                                            <th className="py-3 px-4 text-right">Preço</th>
                                            <th className="py-3 px-4 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map(product => (
                                            <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                                                <td className="py-3 px-4 font-medium">
                                                    {product.name}
                                                    {getProductQuantityInTab(product.id) > 0 && (
                                                        <span className="ml-2 inline-flex items-center justify-center bg-indigo-800 bg-opacity-70 text-white text-xs rounded px-1 text-opacity-90" style={{fontSize: '0.65rem'}}>
                                                            {getProductQuantityInTab(product.id)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-gray-400">{product.category || "-"}</td>
                                                <td className="py-3 px-4 text-right font-medium">{formatCurrency(product.price)}</td>
                                                <td className="py-3 px-4 text-right space-x-2">
                                                    <button
                                                        data-name="edit-product"
                                                        className="btn btn-sm btn-icon btn-secondary"
                                                        onClick={() => onEditProduct(product)}
                                                        title="Editar produto"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        data-name="delete-product"
                                                        className="btn btn-sm btn-icon btn-danger"
                                                        onClick={() => onDeleteProduct(product)}
                                                        title="Excluir produto"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
                
                {isSelectionMode && (
                    <div className="p-3 border-t border-gray-700 flex justify-center items-center">
                        <div className="text-sm text-gray-400">
                            <span className="font-medium">{filteredProducts.length}</span> produto(s) encontrado(s)
                        </div>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('ProductList component error:', error);
        reportError(error);
        return null;
    }
}

function getCategoryIcon(category) {
    if (!category) return null;
    
    const lowerCategory = category.toLowerCase();
    let icon = 'fa-utensils';
    
    if (lowerCategory.includes('bebida') || lowerCategory.includes('drink')) {
        icon = 'fa-glass-martini-alt';
    } else if (lowerCategory.includes('comida') || lowerCategory.includes('food') || lowerCategory.includes('prato')) {
        icon = 'fa-utensils';
    } else if (lowerCategory.includes('sobremesa') || lowerCategory.includes('dessert') || lowerCategory.includes('doce')) {
        icon = 'fa-ice-cream';
    } else if (lowerCategory.includes('entrada') || lowerCategory.includes('appetizer')) {
        icon = 'fa-cheese';
    } else if (lowerCategory.includes('cerveja') || lowerCategory.includes('beer')) {
        icon = 'fa-beer';
    } else if (lowerCategory.includes('vinho') || lowerCategory.includes('wine')) {
        icon = 'fa-wine-glass-alt';
    } else if (lowerCategory.includes('café') || lowerCategory.includes('coffee')) {
        icon = 'fa-coffee';
    }
    
    return <i className={`fas ${icon} mr-2`}></i>;
}
