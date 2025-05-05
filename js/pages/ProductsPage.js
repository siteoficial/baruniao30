function ProductsPage() {
    try {
        const [products, setProducts] = React.useState([]);
        const [editingProduct, setEditingProduct] = React.useState(null);
        const [showProductForm, setShowProductForm] = React.useState(false);
        const [toasts, setToasts] = React.useState([]);
        const [showCategoryManager, setShowCategoryManager] = React.useState(false);
        const [categories, setCategories] = React.useState([]);
        
        // Carrega os produtos e configura os listeners para atualizações em tempo real
        React.useEffect(() => {
            // Carregar produtos iniciais
            const allProducts = ProductManager.getProducts();
            setProducts(allProducts);
            
            // Carregar categorias iniciais
            const allCategories = ProductManager.getCategories();
            setCategories(allCategories);
            
            // Configurar listener para atualizações em tempo real
            const handleProductsChanged = (updatedProducts) => {
                setProducts(updatedProducts);
                // Atualizar categorias quando os produtos mudarem
                setCategories(ProductManager.getCategories());
            };
            
            // Adicionar listener
            ProductManager.addProductChangeListener(handleProductsChanged);
            
            // Remover listener quando o componente for desmontado
            return () => {
                ProductManager.removeProductChangeListener(handleProductsChanged);
            };
        }, []);
        
        const handleCreateProduct = () => {
            setEditingProduct(null);
            setShowProductForm(true);
        };
        
        const handleEditProduct = (product) => {
            setEditingProduct(product);
            setShowProductForm(true);
        };
        
        const handleDeleteProduct = async (product) => {
            if (window.confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
                const success = await ProductManager.deleteProduct(product.id);
                
                if (success) {
                    showToast({
                        message: `Produto "${product.name}" excluído com sucesso!`,
                        type: 'success'
                    });
                } else {
                    showToast({
                        message: 'Erro ao excluir produto.',
                        type: 'error'
                    });
                }
            }
        };
        
        const handleProductSubmit = async (formData) => {
            if (editingProduct) {
                // Atualizar produto existente
                const updatedProduct = await ProductManager.updateProduct(editingProduct.id, formData);
                
                if (updatedProduct) {
                    setShowProductForm(false);
                    
                    showToast({
                        message: `Produto "${updatedProduct.name}" atualizado com sucesso!`,
                        type: 'success'
                    });
                } else {
                    showToast({
                        message: 'Erro ao atualizar produto.',
                        type: 'error'
                    });
                }
            } else {
                // Criar novo produto
                const newProduct = await ProductManager.createProduct(formData);
                
                if (newProduct) {
                    setShowProductForm(false);
                    
                    showToast({
                        message: `Produto "${newProduct.name}" criado com sucesso!`,
                        type: 'success'
                    });
                } else {
                    showToast({
                        message: 'Erro ao criar produto.',
                        type: 'error'
                    });
                }
            }
        };
        
        const handleProductFormCancel = () => {
            setShowProductForm(false);
            setEditingProduct(null);
        };
        
        const handleAddCategory = (category) => {
            if (!categories.includes(category)) {
                // Como as categorias são derivadas dos produtos, adicionamos como um produto exemplo
                // Isso será melhorado mais tarde para ter um gerenciamento dedicado de categorias no Firebase
                ProductManager.createProduct({
                    name: `Exemplo - ${category}`,
                    price: 0,
                    category: category
                });
                
                showToast({
                    message: `Categoria "${category}" adicionada com sucesso!`,
                    type: 'success'
                });
            }
        };
        
        const handleDeleteCategory = async (category) => {
            // Atualizar produtos que têm esta categoria
            const productsToUpdate = products.filter(p => p.category === category);
            
            for (const product of productsToUpdate) {
                await ProductManager.updateProduct(product.id, { category: '' });
            }
            
            showToast({
                message: `Categoria "${category}" removida com sucesso!`,
                type: 'success'
            });
        };
        
        const handleToggleCategoryManager = () => {
            setShowCategoryManager(!showCategoryManager);
        };
        
        // Toast management
        const showToast = (toast) => {
            const id = generateId();
            setToasts([...toasts, { ...toast, id }]);
            
            // Auto-remove after duration
            setTimeout(() => {
                removeToast(id);
            }, 3000);
        };
        
        const removeToast = (id) => {
            setToasts(toasts.filter(toast => toast.id !== id));
        };
        
        return (
            <div data-name="products-page" className="p-4">
                <h1 className="page-title">Produtos</h1>
                
                <div data-name="products-header" className="flex justify-between items-center mb-4">
                    <div data-name="products-count" className="text-gray-400">
                        {products.length} produtos cadastrados
                    </div>
                    
                    <div className="flex space-x-2">
                        <button
                            data-name="manage-categories-button"
                            className="btn btn-secondary"
                            onClick={handleToggleCategoryManager}
                        >
                            <i className="fas fa-tags mr-2"></i>
                            Gerenciar Categorias
                        </button>
                        
                        <button
                            data-name="new-product-button"
                            className="btn btn-primary"
                            onClick={handleCreateProduct}
                        >
                            <i className="fas fa-plus mr-2"></i>
                            Novo Produto
                        </button>
                    </div>
                </div>
                
                {showCategoryManager && (
                    <div data-name="category-manager-container" className="mb-6 animate-fadeInUp">
                        <CategoryManager 
                            categories={categories}
                            onAddCategory={handleAddCategory}
                            onDeleteCategory={handleDeleteCategory}
                        />
                    </div>
                )}
                
                <ProductList
                    products={products}
                    onEditProduct={handleEditProduct}
                    onDeleteProduct={handleDeleteProduct}
                />
                
                {/* Product Form Modal */}
                {showProductForm && (
                    <Modal
                        isOpen={showProductForm}
                        onClose={handleProductFormCancel}
                        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
                    >
                        <ProductForm
                            product={editingProduct}
                            onSubmit={handleProductSubmit}
                            onCancel={handleProductFormCancel}
                            categories={categories}
                        />
                    </Modal>
                )}
                
                {/* Toast Notifications */}
                <ToastContainer toasts={toasts} removeToast={removeToast} />
            </div>
        );
    } catch (error) {
        console.error('ProductsPage error:', error);
        reportError(error);
        return (
            <div className="p-4 text-center text-red-500">
                <p>Erro ao carregar a página de produtos.</p>
            </div>
        );
    }
}
