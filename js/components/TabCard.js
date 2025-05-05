function TabCard({ tab, isSelected, onClick }) {
    try {
        const getStatusClass = () => {
            if (!tab) return 'tab-card-available';
            return tab.status === 'open' ? 'tab-card-open' : 'tab-card-closed';
        };
        
        const getTabTotal = () => {
            if (!tab || !tab.items || tab.items.length === 0) {
                return formatCurrency(0);
            }
            
            return formatCurrency(calculateTabTotal(tab.items));
        };
        
        const handleClick = () => {
            if (onClick) {
                onClick(tab);
            }
        };
        
        // Calcular quanto tempo a comanda está aberta
        const getTimeOpen = () => {
            if (!tab || !tab.createdAt) return '';
            return getTimeDifference(tab.createdAt);
        };
        
        // Verificar se a comanda está aberta há muito tempo (mais de 2 horas)
        const isLongOpen = () => {
            if (!tab || !tab.createdAt) return false;
            const now = new Date();
            const created = new Date(tab.createdAt);
            const diffHours = (now - created) / (1000 * 60 * 60);
            return diffHours > 2;
        };
        
        return (
            <div 
                data-name="tab-card"
                className={`tab-card ${getStatusClass()} ${isSelected ? 'active' : ''} ${isLongOpen() ? 'long-open' : ''}`}
                onClick={handleClick}
                role="button"
                aria-pressed={isSelected ? 'true' : 'false'}
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleClick()}
            >
                <div data-name="tab-number" className="tab-number">
                    {tab ? tab.number : ''}
                </div>
                
                {tab && (
                    <React.Fragment>
                        <div data-name="tab-name" className="tab-name" title={tab.customerName}>
                            {tab.customerName}
                        </div>
                        <div data-name="tab-time" className="tab-time" title="Tempo aberta">
                            {tab.status === 'open' ? (
                                <React.Fragment>
                                    <i className="fas fa-clock mr-1"></i> {getTimeOpen()}
                                </React.Fragment>
                            ) : null}
                        </div>
                        <div data-name="tab-amount" className="tab-amount">
                            {getTabTotal()}
                            {tab.items && tab.items.length > 0 && (
                                <span className="tab-items-count" title={`${tab.items.length} itens`}>
                                    {tab.items.length} <i className="fas fa-utensils"></i>
                                </span>
                            )}
                        </div>
                    </React.Fragment>
                )}
                
                {!tab && (
                    <div data-name="tab-available" className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <i className="fas fa-plus text-white opacity-50 text-2xl mb-2"></i>
                            <div className="text-sm opacity-70">Nova Comanda</div>
                        </div>
                    </div>
                )}
                
                {/* Indicador visual para comandas abertas há muito tempo */}
                {tab && tab.status === 'open' && isLongOpen() && (
                    <div data-name="long-open-indicator" className="long-open-indicator" title="Comanda aberta há mais de 2 horas">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('TabCard component error:', error);
        reportError(error);
        return null;
    }
}
