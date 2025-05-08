function SettingsPage() {
    try {
        const [activeTab, setActiveTab] = React.useState('general');
        const [toastConfig, setToastConfig] = React.useState(null);

        // Função para exibir mensagens de toast
        const showToast = (config) => {
            setToastConfig(config);
            setTimeout(() => setToastConfig(null), 3000);
        };

        return (
            <div className="settings-page container mx-auto py-6 px-4 max-w-6xl">
                <h1 className="page-title">Configurações</h1>
                
                {toastConfig && <Toast message={toastConfig.message} type={toastConfig.type} onClose={() => setToastConfig(null)} />}
                
                <div className="settings-tabs flex border-b border-gray-700 mb-6">
                    <button 
                        onClick={() => setActiveTab('general')}
                        className={`py-2 px-4 mr-2 ${activeTab === 'general' ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400'}`}
                    >
                        Geral
                    </button>
                    <button 
                        onClick={() => setActiveTab('tabs')}
                        className={`py-2 px-4 mr-2 ${activeTab === 'tabs' ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400'}`}
                    >
                        Comandas
                    </button>
                    <button 
                        onClick={() => setActiveTab('sounds')}
                        className={`py-2 px-4 mr-2 ${activeTab === 'sounds' ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400'}`}
                    >
                        Sons
                    </button>
                    <button 
                        onClick={() => setActiveTab('sync')}
                        className={`py-2 px-4 mr-2 ${activeTab === 'sync' ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400'}`}
                    >
                        Sincronização
                    </button>
                </div>
                
                <div className="tab-content">
                    {activeTab === 'general' && <GeneralSettings showToast={showToast} />}
                    {activeTab === 'tabs' && <TabsSettings showToast={showToast} />}
                    {activeTab === 'sounds' && <SoundsSettings showToast={showToast} />}
                    {activeTab === 'sync' && <SyncSettings showToast={showToast} />}
                </div>
            </div>
        );
    } catch (error) {
        console.error('Erro no componente SettingsPage:', error);
        reportError(error);
        return (
            <div className="error-container p-4 bg-red-800 text-white rounded">
                <h3 className="text-xl mb-2">Erro ao carregar configurações</h3>
                <p>{error.message}</p>
            </div>
        );
    }
}

function GeneralSettings({ showToast }) {
    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Configurações Gerais</h3>
            </div>
            <div className="card-body">
                <p className="text-gray-400 mb-4">Configurações gerais do sistema estarão disponíveis em breve.</p>
            </div>
        </div>
    );
}

function SoundsSettings({ showToast }) {
    const [enabled, setEnabled] = React.useState(true);
    const [volume, setVolume] = React.useState(50);
    
    React.useEffect(() => {
        // Carregar configurações de som
        if (typeof SoundManager !== 'undefined') {
            setEnabled(SoundManager.isEnabled());
            setVolume(SoundManager.getVolume() * 100);
        }
    }, []);
    
    const handleToggleSound = () => {
        const newValue = !enabled;
        setEnabled(newValue);
        
        if (typeof SoundManager !== 'undefined') {
            SoundManager.setEnabled(newValue);
            showToast({ 
                message: newValue ? 'Sons ativados com sucesso' : 'Sons desativados com sucesso', 
                type: 'success' 
            });
        }
    };
    
    const handleVolumeChange = (e) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        
        if (typeof SoundManager !== 'undefined') {
            SoundManager.setVolume(newVolume / 100);
        }
    };
    
    const handleTestSound = () => {
        if (typeof SoundManager !== 'undefined') {
            SoundManager.playSound('CLOSE_TAB');
        }
    };
    
    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Configurações de Sons</h3>
            </div>
            <div className="card-body">
                <div className="form-group mb-4">
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                className="sr-only" 
                                checked={enabled} 
                                onChange={handleToggleSound}
                            />
                            <div className={`block w-14 h-8 rounded-full ${enabled ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${enabled ? 'transform translate-x-6' : ''}`}></div>
                        </div>
                        <div className="ml-3 text-gray-200 font-medium">
                            {enabled ? 'Sons ativados' : 'Sons desativados'}
                        </div>
                    </label>
                </div>
                
                <div className="form-group mb-4">
                    <label className="block text-gray-300 mb-2">Volume ({volume}%)</label>
                    
                    <div className="relative pt-1">
                        <div className="flex h-2 overflow-hidden bg-gray-700 rounded">
                            <div
                                style={{ width: `${volume}%` }}
                                className={`shadow-none flex flex-col whitespace-nowrap ${enabled ? 'bg-purple-500' : 'bg-gray-500'} transition-all duration-300`}
                            ></div>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={volume} 
                            onChange={handleVolumeChange}
                            className="absolute top-0 w-full h-2 cursor-pointer appearance-none bg-transparent" 
                            disabled={!enabled}
                            style={{
                                '--track-background': 'transparent',
                                '--thumb-border-color': enabled ? 'rgb(147, 51, 234)' : 'rgb(75, 85, 99)',
                                '--thumb-background': 'white'
                            }}
                        />
                        <style jsx>{`
                            input[type="range"]::-webkit-slider-thumb {
                                width: 16px;
                                height: 16px;
                                border-radius: 50%;
                                background: var(--thumb-background);
                                border: 2px solid var(--thumb-border-color);
                                cursor: pointer;
                                -webkit-appearance: none;
                                margin-top: -7px;
                                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                                transition: all 0.15s ease;
                            }
                            input[type="range"]::-moz-range-thumb {
                                width: 16px;
                                height: 16px;
                                border-radius: 50%;
                                background: var(--thumb-background);
                                border: 2px solid var(--thumb-border-color);
                                cursor: pointer;
                                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                                transition: all 0.15s ease;
                            }
                            input[type="range"]::-webkit-slider-runnable-track {
                                background: var(--track-background);
                            }
                            input[type="range"]::-moz-range-track {
                                background: var(--track-background);
                            }
                        `}</style>
                    </div>
                </div>
                
                <button 
                    className="btn btn-primary mt-2"
                    onClick={handleTestSound}
                    disabled={!enabled}
                >
                    <i className="fas fa-volume-up mr-2"></i>
                    Testar Som
                </button>
            </div>
        </div>
    );
}

function SyncSettings({ showToast }) {
    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Configurações de Sincronização</h3>
            </div>
            <div className="card-body">
                <p className="text-gray-400 mb-4">Configurações de sincronização estarão disponíveis em breve.</p>
            </div>
        </div>
    );
}

function TabsSettings({ showToast }) {
    // Estado para controlar as configurações de numeração de comandas
    const [tabNumberingMode, setTabNumberingMode] = React.useState('auto');
    const [predefinedNumbers, setPredefinedNumbers] = React.useState([1, 2, 3, 4, 5]);
    const [newNumberInput, setNewNumberInput] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [numbersInUse, setNumbersInUse] = React.useState([]);
    
    // Função para atualizar o estado quando as configurações mudarem
    const handleSettingsChanged = React.useCallback((oldSettings, newSettings) => {
        if (newSettings && newSettings.tabNumbering) {
            setTabNumberingMode(newSettings.tabNumbering.mode);
            setPredefinedNumbers(newSettings.tabNumbering.predefinedNumbers || []);
            
            // Atualizar números em uso
            updateNumbersInUse(newSettings.tabNumbering.predefinedNumbers || []);
        }
    }, []);
    
    // Carregar configurações ao montar o componente
    React.useEffect(() => {
        if (typeof SettingsManager !== 'undefined') {
            const settings = SettingsManager.getTabNumberingSettings();
            setTabNumberingMode(settings.mode);
            setPredefinedNumbers(settings.predefinedNumbers || []);
            
            // Buscar comandas abertas para identificar números em uso
            updateNumbersInUse(settings.predefinedNumbers || []);
            
            // Registrar ouvinte para mudanças nas configurações
            SettingsManager.addChangeListener(handleSettingsChanged);
        }
        
        // Limpar o ouvinte ao desmontar o componente
        return () => {
            if (typeof SettingsManager !== 'undefined') {
                SettingsManager.removeChangeListener(handleSettingsChanged);
            }
        };
    }, [handleSettingsChanged]);
    
    // Adicionar listener para eventos de criação/fechamento de comandas
    React.useEffect(() => {
        const handleTabEvent = () => {
            // Atualizar números em uso quando houver mudanças nas comandas
            if (typeof SettingsManager !== 'undefined') {
                const settings = SettingsManager.getTabNumberingSettings();
                updateNumbersInUse(settings.predefinedNumbers || []);
            }
        };
        
        // Eventos customizados
        window.addEventListener('tabCreated', handleTabEvent);
        
        // Também escutar eventos de alteração de comandas do TabManager
        if (typeof TabManager !== 'undefined') {
            TabManager.addTabChangeListener(handleTabEvent);
        }
        
        // Limpar listeners ao desmontar o componente
        return () => {
            window.removeEventListener('tabCreated', handleTabEvent);
            
            if (typeof TabManager !== 'undefined') {
                TabManager.removeTabChangeListener(handleTabEvent);
            }
        };
    }, []);
    
    // Função para atualizar a lista de números em uso
    const updateNumbersInUse = (numbers) => {
        if (!numbers || !numbers.length) return;
        
        try {
            // Obter comandas abertas
            const openTabs = TabManager.getOpenTabs();
            const usedNumbers = openTabs
                .map(tab => tab.number)
                .filter(num => numbers.includes(num));
            
            setNumbersInUse(usedNumbers);
        } catch (error) {
            console.error('Erro ao verificar números em uso:', error);
        }
    };
    
    // Salvar alterações no modo de numeração
    const handleModeChange = (mode) => {
        setTabNumberingMode(mode);
        if (typeof SettingsManager !== 'undefined') {
            SettingsManager.setTabNumberingMode(mode);
            showToast({ 
                message: `Modo de numeração alterado para ${mode === 'auto' ? 'automático' : 'predefinido'}`, 
                type: 'success' 
            });
        }
    };
    
    // Validar e adicionar novos números predefinidos
    const handleAddNumber = () => {
        setErrorMessage('');
        
        // Verificar se o campo está vazio
        if (!newNumberInput.trim()) {
            return;
        }
        
        try {
            // Validar o formato do input
            let newNumbers = [];
            
            // Verificar se é um intervalo (ex: 1-100)
            if (newNumberInput.includes('-')) {
                const [start, end] = newNumberInput.split('-').map(n => parseInt(n.trim()));
                
                if (isNaN(start) || isNaN(end) || start >= end) {
                    setErrorMessage('Intervalo inválido. Use o formato "início-fim" com números válidos.');
                    return;
                }
                
                if (end - start > 1000) {
                    setErrorMessage('Intervalo muito grande. Máximo de 1000 números por vez.');
                    return;
                }
                
                newNumbers = Array.from({length: end - start + 1}, (_, i) => start + i);
            } 
            // Verificar se é uma lista separada por vírgulas (ex: 1,2,3,4,5)
            else if (newNumberInput.includes(',')) {
                newNumbers = newNumberInput.split(',')
                    .map(n => parseInt(n.trim()))
                    .filter(n => !isNaN(n));
                    
                if (newNumbers.length === 0) {
                    setErrorMessage('Formato inválido. Use números separados por vírgula.');
                    return;
                }
            } 
            // Caso contrário, é um único número
            else {
                const num = parseInt(newNumberInput.trim());
                if (isNaN(num)) {
                    setErrorMessage('Por favor, digite um número válido.');
                    return;
                }
                newNumbers = [num];
            }
            
            // Adicionar os novos números
            if (typeof SettingsManager !== 'undefined') {
                const updatedNumbers = SettingsManager.addPredefinedTabNumbers(newNumbers);
                setPredefinedNumbers(updatedNumbers);
                
                // Atualizar números em uso
                updateNumbersInUse(updatedNumbers);
                
                setNewNumberInput('');
                showToast({ 
                    message: `${newNumbers.length > 1 ? newNumbers.length + ' números adicionados' : 'Número adicionado'} com sucesso`, 
                    type: 'success' 
                });
            }
        } catch (error) {
            console.error('Erro ao adicionar números predefinidos:', error);
            setErrorMessage('Erro ao processar os números. Verifique o formato e tente novamente.');
        }
    };
    
    // Remover um número específico
    const handleRemoveNumber = (numberToRemove) => {
        try {
            // Verificar se o número está em uso
            if (numbersInUse.includes(numberToRemove)) {
                showToast({
                    message: `Não é possível remover o número ${numberToRemove}, pois está em uso por uma comanda aberta.`,
                    type: 'error'
                });
                return;
            }
            
            if (typeof SettingsManager !== 'undefined') {
                // Usar o método específico do SettingsManager para remover o número
                const success = SettingsManager.removePredefinedTabNumber(numberToRemove);
                
                if (success) {
                    // Atualizar estado local
                    setPredefinedNumbers(prev => prev.filter(num => num !== numberToRemove));
                    
                    showToast({
                        message: `Número ${numberToRemove} removido com sucesso`,
                        type: 'success'
                    });
                } else {
                    showToast({
                        message: `Erro ao remover número ${numberToRemove}`,
                        type: 'error'
                    });
                }
            }
        } catch (error) {
            console.error('Erro ao remover número predefinido:', error);
            showToast({
                message: 'Erro ao remover número',
                type: 'error'
            });
        }
    };
    
    // Limpar todos os números predefinidos
    const handleClearList = () => {
        try {
            // Verificar se há números em uso
            if (numbersInUse.length > 0) {
                showToast({
                    message: `Não é possível limpar a lista pois existem ${numbersInUse.length} números em uso.`,
                    type: 'error'
                });
                return;
            }
            
            if (typeof SettingsManager !== 'undefined') {
                SettingsManager.clearPredefinedTabNumbers();
                setPredefinedNumbers([]);
                showToast({ 
                    message: 'Lista de números predefinidos foi limpa', 
                    type: 'success' 
                });
            }
        } catch (error) {
            console.error('Erro ao limpar lista de números predefinidos:', error);
            showToast({
                message: 'Erro ao limpar lista',
                type: 'error'
            });
        }
    };
    
    // Renderizar a lista de números predefinidos
    const renderNumberButtons = () => {
        return predefinedNumbers.map(number => (
            <div 
                key={number} 
                className={`relative w-14 h-10 flex items-center justify-center ${
                    numbersInUse.includes(number) ? 'bg-purple-700' : 'bg-gray-800 hover:bg-gray-700'
                } text-gray-200 rounded m-1 group`}
            >
                <span className="text-center">{number}</span>
                
                {numbersInUse.includes(number) && (
                    <span className="absolute -top-1 -right-1 bg-green-500 rounded-full text-xs text-white w-4 h-4 flex items-center justify-center">
                        <i className="fas fa-check text-xs"></i>
                    </span>
                )}
                
                {!numbersInUse.includes(number) && (
                    <button 
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveNumber(number);
                        }}
                        title={`Remover número ${number}`}
                    >
                        <i className="fas fa-times text-xs"></i>
                    </button>
                )}
            </div>
        ));
    };
    
    return (
        <div className="tabs-settings">
            <div className="card mb-6">
                <div className="card-header">
                    <h3 className="card-title">Numeração de Comandas</h3>
                </div>
                <div className="card-body">
                    <div className="mb-6">
                        <h4 className="text-lg text-gray-200 mb-2">Modo de Numeração</h4>
                        
                        <div className="flex flex-col space-y-2">
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="numberingMode" 
                                    className="form-radio" 
                                    checked={tabNumberingMode === 'auto'} 
                                    onChange={() => handleModeChange('auto')}
                                />
                                <span className="ml-2">Automático (sequencial)</span>
                            </label>
                            
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="numberingMode" 
                                    className="form-radio" 
                                    checked={tabNumberingMode === 'predefined'} 
                                    onChange={() => handleModeChange('predefined')}
                                />
                                <span className="ml-2">Comandas predefinidas (físicas)</span>
                            </label>
                        </div>
                        
                        <p className="text-gray-400 text-sm mt-2">
                            Use este modo se você possui comandas físicas com números predefinidos.
                        </p>
                    </div>
                    
                    {tabNumberingMode === 'predefined' && (
                        <div className="predefined-numbers-section">
                            <h4 className="text-lg text-gray-200 mb-2">Comandas Predefinidas</h4>
                            
                            <div className="flex items-center mb-4">
                                <input 
                                    type="text" 
                                    className="form-control flex-1 mr-2" 
                                    placeholder="Ex: 1-100 ou 1,2,3,4,5" 
                                    value={newNumberInput}
                                    onChange={(e) => setNewNumberInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddNumber()}
                                />
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleAddNumber}
                                >
                                    Adicionar
                                </button>
                            </div>
                            
                            {errorMessage && (
                                <div className="text-red-500 text-sm mb-4">
                                    {errorMessage}
                                </div>
                            )}
                            
                            <div className="text-sm text-gray-400 mb-4">
                                Digite um intervalo (ex: 1-100) ou uma lista de números separados por vírgula (ex: 1,2,3,4,5)
                            </div>
                            
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h5 className="text-gray-300">Lista de Comandas</h5>
                                    <div className="text-sm text-gray-400">
                                        Total: <span className="text-purple-400 font-medium">{predefinedNumbers.length}</span>
                                        <span className="text-gray-500 ml-2">Em uso: 
                                            <span className="text-green-400 font-medium ml-1">{numbersInUse.length}</span>
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="predefined-numbers-list flex flex-wrap max-h-60 overflow-y-auto p-2 bg-gray-900 rounded-lg border border-gray-700">
                                    {predefinedNumbers.length > 0 ? (
                                        renderNumberButtons()
                                    ) : (
                                        <div className="text-gray-500 text-center w-full py-4">
                                            Nenhuma comanda predefinida adicionada
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <div className="text-sm">
                                    {numbersInUse.length > 0 ? (
                                        <span className="text-yellow-400">
                                            <i className="fas fa-info-circle mr-1"></i>
                                            Comandas em uso não podem ser removidas
                                        </span>
                                    ) : null}
                                </div>
                                
                                <button 
                                    className="btn btn-danger" 
                                    onClick={handleClearList}
                                    disabled={predefinedNumbers.length === 0 || numbersInUse.length > 0}
                                    title={numbersInUse.length > 0 ? 'Não é possível limpar a lista enquanto houver comandas em uso' : ''}
                                >
                                    <i className="fas fa-trash-alt mr-2"></i>
                                    Limpar Lista
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 