function ProductForm({ product, onSubmit, onCancel, categories }) {
    try {
        const [formData, setFormData] = React.useState({
            name: product?.name || '',
            price: product?.price || '',
            category: product?.category || ''
        });
        
        const [errors, setErrors] = React.useState({});
        
        const handleChange = (e) => {
            const { name, value } = e.target;
            
            if (name === 'price') {
                // Only allow numbers and a single decimal point
                const regex = /^[0-9]*\.?[0-9]*$/;
                if (value === '' || regex.test(value)) {
                    setFormData({
                        ...formData,
                        [name]: value
                    });
                }
                return;
            }
            
            setFormData({
                ...formData,
                [name]: value
            });
        };
        
        const validateForm = () => {
            const newErrors = {};
            
            if (!formData.name.trim()) {
                newErrors.name = 'Nome do produto é obrigatório';
            }
            
            if (!formData.price) {
                newErrors.price = 'Preço é obrigatório';
            } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
                newErrors.price = 'Preço deve ser um valor positivo';
            }
            
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };
        
        const handleSubmit = (e) => {
            e.preventDefault();
            
            if (validateForm()) {
                onSubmit({
                    ...formData,
                    price: parseFloat(formData.price)
                });
            }
        };
        
        return (
            <div data-name="product-form" className="card">
                <div data-name="card-header" className="card-header">
                    <h3 className="card-title">
                        {product ? 'Editar Produto' : 'Novo Produto'}
                    </h3>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div data-name="form-group" className="form-group">
                        <label data-name="name-label" htmlFor="name" className="form-label">Nome do Produto</label>
                        <input
                            data-name="name-input"
                            type="text"
                            id="name"
                            name="name"
                            className={`form-control ${errors.name ? 'border-red-500' : ''}`}
                            value={formData.name}
                            onChange={handleChange}
                            autoFocus
                        />
                        {errors.name && (
                            <div data-name="name-error" className="text-red-500 text-sm mt-1">
                                {errors.name}
                            </div>
                        )}
                    </div>
                    
                    <div data-name="form-group" className="form-group">
                        <label data-name="price-label" htmlFor="price" className="form-label">Preço (R$)</label>
                        <input
                            data-name="price-input"
                            type="text"
                            inputmode="decimal"
                            pattern="[0-9]*\.?[0-9]*"
                            id="price"
                            name="price"
                            className={`form-control ${errors.price ? 'border-red-500' : ''}`}
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0.00"
                        />
                        {errors.price && (
                            <div data-name="price-error" className="text-red-500 text-sm mt-1">
                                {errors.price}
                            </div>
                        )}
                    </div>
                    
                    <div data-name="form-group" className="form-group">
                        <label data-name="category-label" htmlFor="category" className="form-label">Categoria</label>
                        {categories && categories.length > 0 ? (
                            <select
                                data-name="category-select"
                                id="category"
                                name="category"
                                className="form-control"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">Selecione uma categoria</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                data-name="category-input"
                                type="text"
                                id="category"
                                name="category"
                                className="form-control"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="Ex: Bebidas, Petiscos, etc."
                            />
                        )}
                    </div>
                    
                    <div data-name="form-actions" className="flex justify-end space-x-2 mt-4">
                        <button
                            data-name="cancel-button"
                            type="button"
                            className="btn btn-secondary"
                            onClick={onCancel}
                        >
                            Cancelar
                        </button>
                        <button
                            data-name="submit-button"
                            type="submit"
                            className="btn btn-primary"
                        >
                            {product ? 'Atualizar' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        );
    } catch (error) {
        console.error('ProductForm component error:', error);
        reportError(error);
        return null;
    }
}
