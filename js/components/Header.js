function Header({ onNavigate, currentPage }) {
    try {
        const menuItems = [
            { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
            { id: 'tabs', label: 'Comandas', icon: 'fas fa-receipt' },
            { id: 'products', label: 'Produtos', icon: 'fas fa-box' },
            { id: 'history', label: 'Histórico', icon: 'fas fa-history' },
            { id: 'reports', label: 'Relatórios', icon: 'fas fa-file-alt' }
        ];
        
        const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
        const [isScrolled, setIsScrolled] = React.useState(false);
        const [isConnected, setIsConnected] = React.useState(false);
        
        React.useEffect(() => {
            const handleScroll = () => {
                const scrollTop = window.pageYOffset;
                if (scrollTop > 10) {
                    setIsScrolled(true);
                } else {
                    setIsScrolled(false);
                }
            };
            
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }, []);
        
        React.useEffect(() => {
            // Verificar status da conexão Firebase
            const checkConnectionStatus = () => {
                if (window.firebase && firebase.database) {
                    const connectedRef = firebase.database().ref(".info/connected");
                    connectedRef.on("value", (snap) => {
                        setIsConnected(!!snap.val());
                    });
                    
                    return () => connectedRef.off("value");
                }
            };
            
            const timer = setTimeout(checkConnectionStatus, 1000);
            return () => clearTimeout(timer);
        }, []);
        
        const toggleMobileMenu = () => {
            setIsMobileMenuOpen(!isMobileMenuOpen);
        };
        
        const handleNavigate = (pageId) => {
            setIsMobileMenuOpen(false);
            onNavigate(pageId);
        };
        
        return (
            <div 
                data-name="header" 
                className={`sticky top-0 z-50 transition-all duration-300 ${
                    isScrolled ? 'bg-opacity-90 backdrop-blur shadow-md' : 'bg-opacity-100'
                } bg-gray-800`}
            >
                {/* Desktop header */}
                <div data-name="desktop-header" className="hidden md:flex justify-between items-center px-6 py-3">
                    <div data-name="logo" className="flex items-center">
                        <i className="fas fa-glass-cheers text-2xl text-purple-500 mr-2"></i>
                        <h1 className="text-xl font-bold text-white">Sistema de Comandas</h1>
                    </div>
                    
                    <nav data-name="desktop-nav" className="flex-1 ml-10">
                        <ul className="flex space-x-2">
                            {menuItems.map(item => (
                                <li key={item.id} data-name={`nav-item-${item.id}`} className="flex-1 max-w-[150px]">
                                    <button 
                                        onClick={() => handleNavigate(item.id)}
                                        className={`flex items-center justify-center w-full px-3 py-2 rounded-md transition-colors ${
                                            currentPage === item.id 
                                                ? 'bg-purple-700 text-white' 
                                                : 'text-gray-300 hover:bg-gray-700'
                                        }`}
                                        aria-current={currentPage === item.id ? 'page' : undefined}
                                    >
                                        <i className={`${item.icon} mr-2`}></i>
                                        <span>{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    
                    <div className="flex items-center ml-4">
                        <div className="relative" data-name="user-menu">
                            <button className="flex items-center text-sm font-medium text-gray-300 hover:text-white focus:outline-none">
                                <span className="sr-only">Opções do usuário</span>
                                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                                    <i className="fas fa-user"></i>
                                </div>
                            </button>
                        </div>
                    </div>
                    
                    {/* Indicador de status da conexão */}
                    <div className="ml-2 flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        <span className="text-xs text-gray-400">
                            {isConnected ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
                
                {/* Mobile header */}
                <div data-name="mobile-header" className="md:hidden flex justify-between items-center px-4 py-3">
                    <div data-name="mobile-logo" className="flex items-center">
                        <i className="fas fa-glass-cheers text-xl text-purple-500 mr-2"></i>
                        <h1 className="text-lg font-bold text-white">Sistema de Comandas</h1>
                    </div>
                    
                    <button 
                        data-name="mobile-menu-toggle"
                        onClick={toggleMobileMenu}
                        className="text-gray-300 hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                    >
                        <span className="sr-only">Abrir menu principal</span>
                        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
                    </button>
                </div>
                
                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <nav 
                        data-name="mobile-nav" 
                        className="md:hidden bg-gray-800 px-2 pb-3 animate-fadeInUp"
                        id="mobile-menu"
                    >
                        <ul>
                            {menuItems.map(item => (
                                <li key={item.id} data-name={`mobile-nav-item-${item.id}`} className="mb-1">
                                    <button 
                                        onClick={() => handleNavigate(item.id)}
                                        className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${
                                            currentPage === item.id 
                                                ? 'bg-purple-700 text-white' 
                                                : 'text-gray-300 hover:bg-gray-700'
                                        }`}
                                        aria-current={currentPage === item.id ? 'page' : undefined}
                                    >
                                        <i className={`${item.icon} w-6`}></i>
                                        <span>{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}
            </div>
        );
    } catch (error) {
        console.error('Header component error:', error);
        reportError(error);
        return null;
    }
}
