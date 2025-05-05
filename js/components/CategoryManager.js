function CategoryManager({ categories, onAddCategory, onDeleteCategory }) {
    try {
        const [newCategory, setNewCategory] = React.useState('');
        const [error, setError] = React.useState('');
        
        const handleAddCategory = () => {
            if (!newCategory.trim()) {
                setError('Digite um nome para a categoria');
                return;
            }
            
            if (categories.includes(newCategory.trim())) {
                setError('Esta categoria já existe');
                return;
            }
            
            onAddCategory(newCategory.trim());
            setNewCategory('');
            setError('');
        };
        
        return (
            <div data-name="category-manager" className="mb-6">
                <h3 className="text-lg font-medium mb-3">Gerenciar Categorias</h3>
                
                <div className="flex mb-4">
                    <input
                        data-name="new-category-input"
                        type="text"
                        className={`form-control mr-2 ${error ? 'is-invalid' : ''}`}
                        placeholder="Nova categoria"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <button
                        data-name="add-category-button"
                        className="btn btn-primary"
                        onClick={handleAddCategory}
                    >
                        <i className="fas fa-plus mr-1"></i>
                        Adicionar
                    </button>
                </div>
                
                {error && (
                    <div data-name="category-error" className="text-red-500 text-sm mb-2">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {error}
                    </div>
                )}
                
                {categories.length > 0 ? (
                    <div data-name="categories-list" className="category-chips">
                        {categories.map(category => (
                            <div data-name={`category-chip-${category}`} key={category} className="category-chip">
                                {category}
                                <i 
                                    className="fas fa-times ml-2" 
                                    onClick={() => onDeleteCategory(category)}
                                    role="button"
                                    aria-label={`Remover categoria ${category}`}
                                ></i>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div data-name="no-categories" className="text-gray-400 text-sm">
                        Nenhuma categoria cadastrada. Adicione categorias para facilitar a organização dos produtos.
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('CategoryManager component error:', error);
        reportError(error);
        return null;
    }
}
