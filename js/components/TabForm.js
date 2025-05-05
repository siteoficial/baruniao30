function TabForm({ onSubmit, onCancel }) {
    try {
        const [customerName, setCustomerName] = React.useState('');
        const [error, setError] = React.useState('');
        const [isSubmitting, setIsSubmitting] = React.useState(false);
        
        const handleSubmit = async (e) => {
            e.preventDefault();
            
            if (!customerName.trim()) {
                setError('Por favor, informe o nome do cliente.');
                return;
            }
            
            // Evita múltiplos cliques
            if (isSubmitting) return;
            
            setIsSubmitting(true);
            
            try {
                await onSubmit({ customerName });
            } catch (error) {
                console.error('Erro ao criar comanda:', error);
                setError('Ocorreu um erro ao criar a comanda. Tente novamente.');
                setIsSubmitting(false);
            }
        };
        
        return (
            <div data-name="tab-form" className="card">
                <div data-name="card-header" className="card-header">
                    <h3 className="card-title">Nova Comanda</h3>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div data-name="form-group" className="form-group">
                        <label data-name="customer-name-label" htmlFor="customerName" className="form-label">Nome do Cliente</label>
                        <input 
                            data-name="customer-name-input"
                            type="text" 
                            id="customerName" 
                            className="form-control" 
                            placeholder="Digite o nome do cliente"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            autoFocus
                        />
                        
                        {error && (
                            <div data-name="error-message" className="text-red-500 text-sm mt-1">
                                {error}
                            </div>
                        )}
                    </div>
                    
                    <div data-name="form-actions" className="flex justify-end space-x-2 mt-4">
                        <button 
                            data-name="cancel-button"
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button 
                            data-name="submit-button"
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Criando...' : 'Criar Comanda'}
                        </button>
                    </div>
                </form>
            </div>
        );
    } catch (error) {
        console.error('TabForm component error:', error);
        reportError(error);
        return null;
    }
}
