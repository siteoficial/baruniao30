function App() {
    try {
        const [currentPage, setCurrentPage] = React.useState('tabs');
        const [isInitialized, setIsInitialized] = React.useState(false);
        const [syncStatus, setSyncStatus] = React.useState('');
        const [isConnected, setIsConnected] = React.useState(window.navigator.onLine);
        
        // Monitor de conexão com a internet
        React.useEffect(() => {
            const handleOnline = () => {
                setIsConnected(true);
                setSyncStatus('Conexão recuperada. Sincronizando...');
                
                // Reiniciar gerenciadores quando a conexão voltar
                setTimeout(async () => {
                    if (window.navigator.onLine) {
                        try {
                            await TabManager.init();
                            await ProductManager.init();
                            await FirebaseManager.syncLocalToFirebase(); // Garantir sincronização completa
                            setSyncStatus('Dados sincronizados');
                            setTimeout(() => setSyncStatus(''), 3000);
                        } catch (error) {
                            console.error('Erro ao reinicializar após recuperar conexão:', error);
                            setSyncStatus('Erro ao sincronizar');
                            setTimeout(() => setSyncStatus(''), 3000);
                        }
                    }
                }, 2000);
            };
            
            const handleOffline = () => {
                setIsConnected(false);
                setSyncStatus('Sem conexão com a internet. Modo offline ativado.');
            };
            
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);
            
            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }, []);
        
        // Limpeza periódica de registros antigos
        React.useEffect(() => {
            // Executar limpeza a cada vez que a aplicação é carregada
            FirebaseManager.cleanupOldRecords();
            
            // Configurar limpeza periódica a cada 24 horas
            const cleanupInterval = setInterval(() => {
                FirebaseManager.cleanupOldRecords();
            }, 24 * 60 * 60 * 1000); // 24 horas
            
            return () => clearInterval(cleanupInterval);
        }, []);
        
        // Inicialização do Firebase e dos gerenciadores
        React.useEffect(() => {
            const initializeApp = async () => {
                try {
                    setSyncStatus('Inicializando...');
                    
                    // Verificar se há conexão com a internet
                    if (!isOnline()) {
                        console.warn("Sem conexão com a internet. Usando modo offline.");
                        setSyncStatus('Sem conexão. Usando modo offline.');
                        await TabManager.init();
                        await ProductManager.init();
                        setIsInitialized(true);
                        return;
                    }
                    
                    // Inicializar Firebase
                    const firebaseInitialized = FirebaseManager.initializeFirebase();
                    console.log("Firebase inicializado:", firebaseInitialized);
                    
                    if (firebaseInitialized) {
                        setSyncStatus('Conectando ao Firebase...');
                        
                        // Autenticar anonimamente
                        const user = await FirebaseManager.signInAnonymously();
                        console.log("Firebase autenticado:", user ? "Sim" : "Não");
                        
                        // Inicializar gerenciadores
                        console.log("Inicializando gerenciadores...");
                        await TabManager.init();
                        await ProductManager.init();
                        
                        // Verificar se temos comandas abertas
                        const openTabs = TabManager.getOpenTabs();
                        console.log("Comandas abertas carregadas:", openTabs.length);
                        
                        // Verificar se temos produtos
                        const products = ProductManager.getProducts();
                        console.log("Produtos carregados:", products.length);
                        
                        // Sincronizar dados locais com Firebase
                        setSyncStatus('Sincronizando dados...');
                        await FirebaseManager.syncLocalToFirebase();
                        
                        setSyncStatus('Conectado em tempo real');
                        setTimeout(() => setSyncStatus(''), 3000);
                    } else {
                        setSyncStatus('Usando modo offline');
                        setTimeout(() => setSyncStatus(''), 3000);
                    }
                    
                    setIsInitialized(true);
                } catch (error) {
                    console.error('Erro ao inicializar aplicação:', error);
                    setSyncStatus('Erro de conexão, usando modo offline');
                    setTimeout(() => setSyncStatus(''), 3000);
                    setIsInitialized(true);
                }
            };
            
            initializeApp();
        }, []);
        
        const handleNavigate = (page) => {
            setCurrentPage(page);
        };
        
        const renderPage = () => {
            switch (currentPage) {
                case 'dashboard':
                    return <Dashboard />;
                case 'tabs':
                    return <TabsPage />;
                case 'products':
                    return <ProductsPage />;
                case 'history':
                    return <HistoryPage />;
                case 'reports':
                    return <ReportsPage />;
                default:
                    return <TabsPage />;
            }
        };
        
        if (!isInitialized) {
            return (
                <div className="min-h-screen flex items-center justify-center flex-col">
                    <div className="animate-pulse text-3xl mb-4 text-purple-400">
                        <i className="fas fa-sync fa-spin mr-2"></i>
                        Sistema de Comandas
                    </div>
                    <div className="text-gray-400">{syncStatus}</div>
                </div>
            );
        }
        
        return (
            <div data-name="app" className="app-container">
                <Header onNavigate={handleNavigate} currentPage={currentPage} />
                
                <div data-name="content" className="content">
                    {renderPage()}
                </div>
                
                {syncStatus && (
                    <div className="fixed bottom-4 right-4 bg-gray-800 text-sm px-3 py-2 rounded-full shadow-lg z-50">
                        <span className={`flex items-center ${isConnected ? (syncStatus.includes('tempo real') ? 'text-green-400' : 'text-blue-400') : 'text-yellow-400'}`}>
                            <i className={`fas mr-2 ${isConnected 
                                ? (syncStatus.includes('tempo real') 
                                    ? 'fa-wifi' 
                                    : 'fa-sync-alt fa-spin')
                                : 'fa-exclamation-triangle'}`}></i>
                            {syncStatus}
                        </span>
                    </div>
                )}
                
                {!isConnected && !syncStatus && (
                    <div className="fixed bottom-4 right-4 bg-gray-800 text-sm px-3 py-2 rounded-full shadow-lg z-50">
                        <span className="flex items-center text-yellow-400">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            Modo offline
                        </span>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('App error:', error);
        reportError(error);
        return (
            <div className="p-4 text-center text-red-500">
                <h1 className="text-xl mb-2">Erro ao carregar a aplicação</h1>
                <p>Por favor, recarregue a página.</p>
            </div>
        );
    }
}

// Render the app
ReactDOM.render(
    <App />,
    document.getElementById('root')
);
