function TabForm({ onSubmit, onCancel }) {
    try {
        const [customerName, setCustomerName] = React.useState('');
        const [error, setError] = React.useState('');
        const [isSubmitting, setIsSubmitting] = React.useState(false);
        const [tabNumberingMode, setTabNumberingMode] = React.useState('auto');
        const [availableNumbers, setAvailableNumbers] = React.useState([]);
        const [selectedNumber, setSelectedNumber] = React.useState('');
        const [loading, setLoading] = React.useState(true);
        
        // Carregar configurações de numeração e números disponíveis
        React.useEffect(() => {
            const initForm = async () => {
                setLoading(true);
                
                try {
                    // Verificar modo de numeração atual
                    if (typeof SettingsManager !== 'undefined') {
                        const settings = SettingsManager.getTabNumberingSettings();
                        setTabNumberingMode(settings.mode);
                        
                        // Se for modo predefinido, buscar números disponíveis
                        if (settings.mode === 'predefined') {
                            await loadAvailableNumbers(settings.predefinedNumbers);
                        }
                    }
                } catch (error) {
                    console.error('Erro ao carregar configurações de numeração:', error);
                } finally {
                    setLoading(false);
                }
            };
            
            initForm();
        }, []);
        
        // Função para carregar números disponíveis
        const loadAvailableNumbers = async (predefinedNumbers) => {
            if (!predefinedNumbers || !predefinedNumbers.length) {
                setAvailableNumbers([]);
                return;
            }
            
            try {
                // Obter comandas abertas para verificar números já em uso
                const openTabs = TabManager.getOpenTabs();
                const numbersInUse = openTabs.map(tab => tab.number);
                
                // Filtrar para obter apenas números disponíveis
                const available = predefinedNumbers.filter(num => !numbersInUse.includes(num));
                
                setAvailableNumbers(available);
                
                // Selecionar primeiro número disponível por padrão
                if (available.length > 0) {
                    setSelectedNumber(available[0]);
                }
            } catch (error) {
                console.error('Erro ao carregar números disponíveis:', error);
                setAvailableNumbers([]);
            }
        };
        
        const handleSubmit = async (e) => {
            e.preventDefault();
            
            if (!customerName.trim()) {
                setError('Por favor, informe o nome do cliente.');
                return;
            }
            
            // Verificar se é necessário selecionar um número
            if (tabNumberingMode === 'predefined' && !selectedNumber && availableNumbers.length > 0) {
                setError('Por favor, selecione um número de comanda.');
                return;
            }
            
            // Evita múltiplos cliques
            if (isSubmitting) return;
            
            setIsSubmitting(true);
            
            try {
                // Passar o número selecionado, se estiver no modo predefinido
                await onSubmit({ 
                    customerName,
                    tabNumber: tabNumberingMode === 'predefined' ? selectedNumber : undefined
                });
            } catch (error) {
                console.error('Erro ao criar comanda:', error);
                setError('Ocorreu um erro ao criar a comanda. Tente novamente.');
                setIsSubmitting(false);
            }
        };
        
        // Renderizar seletor de números predefinidos
        const renderNumberSelector = () => {
            if (availableNumbers.length === 0) {
                return (
                    <div className="bg-yellow-800 text-yellow-200 p-3 rounded-lg mb-4">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        Não há números de comanda disponíveis. Todas as comandas físicas estão em uso.
                    </div>
                );
            }
            
            return (
                <div className="form-group mb-4">
                    <label className="block text-gray-300 mb-2">Número da Comanda</label>
                    <select
                        className="form-control"
                        value={selectedNumber}
                        onChange={(e) => setSelectedNumber(parseInt(e.target.value))}
                    >
                        {availableNumbers.map(number => (
                            <option key={number} value={number}>
                                {number}
                            </option>
                        ))}
                    </select>
                </div>
            );
        };
        
        if (loading) {
            return (
                <div data-name="tab-form-loading" className="card">
                    <div className="card-body flex items-center justify-center p-8">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        <span>Carregando...</span>
                    </div>
                </div>
            );
        }
        
        return (
            <div data-name="tab-form" className="card">
                <div data-name="card-header" className="card-header">
                    <h5 className="card-title">Nova Comanda</h5>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="card-body">
                        {/* Nome do Cliente sempre primeiro */}
                        <div data-name="form-group" className="form-group">
                            <label className="block text-gray-300 mb-2">Nome do Cliente</label>
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
                        </div>
                        
                        {/* Modo predefinido: mostrar seletor de números depois do nome */}
                        {tabNumberingMode === 'predefined' && renderNumberSelector()}
                        
                        {error && (
                            <div data-name="error-message" className="text-red-500 text-sm mt-1">
                                {error}
                            </div>
                        )}
                    </div>
                    
                    <div data-name="form-actions" className="card-footer flex justify-end space-x-2">
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
                            disabled={isSubmitting || (tabNumberingMode === 'predefined' && availableNumbers.length === 0)}
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
