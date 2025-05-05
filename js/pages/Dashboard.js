function Dashboard() {
    try {
        const [todayStats, setTodayStats] = React.useState(null);
        const [openTabs, setOpenTabs] = React.useState([]);
        const [topProducts, setTopProducts] = React.useState([]);
        
        React.useEffect(() => {
            // Get today's stats
            const today = new Date();
            const report = ReportManager.getDailySalesReport(today);
            setTodayStats(report);
            
            // Get open tabs
            const tabs = TabManager.getOpenTabs();
            setOpenTabs(tabs);
            
            // Get top products from the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const productReport = ReportManager.getProductSalesReport(sevenDaysAgo, today);
            
            if (productReport && productReport.products) {
                // Get top 5 products
                const top = productReport.products.slice(0, 5);
                setTopProducts(top);
            }
        }, []);
        
        const getPaymentMethodLabel = (method) => {
            const methods = {
                'cash': 'Dinheiro',
                'credit': 'Crédito',
                'debit': 'Débito',
                'pix': 'Pix',
                'transfer': 'Transferência'
            };
            
            return methods[method] || method;
        };
        
        return (
            <div data-name="dashboard-page" className="p-4">
                <h1 className="page-title mb-6">Dashboard</h1>
                
                <div data-name="stats-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div data-name="stat-card" className="card bg-gray-800">
                        <div className="text-sm text-gray-400">Vendas Hoje</div>
                        <div className="text-2xl font-bold mt-1">
                            {todayStats ? formatCurrency(todayStats.totalSales) : 'R$ 0,00'}
                        </div>
                    </div>
                    
                    <div data-name="stat-card" className="card bg-gray-800">
                        <div className="text-sm text-gray-400">Comandas Fechadas Hoje</div>
                        <div className="text-2xl font-bold mt-1">
                            {todayStats ? todayStats.tabCount : '0'}
                        </div>
                    </div>
                    
                    <div data-name="stat-card" className="card bg-gray-800">
                        <div className="text-sm text-gray-400">Comandas Abertas</div>
                        <div className="text-2xl font-bold mt-1">{openTabs.length}</div>
                    </div>
                </div>
                
                <div data-name="dashboard-content" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div data-name="open-tabs-section">
                        <h2 className="text-xl font-semibold mb-4">Comandas Abertas</h2>
                        
                        {openTabs.length === 0 ? (
                            <div data-name="no-open-tabs" className="card bg-gray-800 p-6 text-center">
                                <div className="text-gray-400 mb-2">
                                    <i className="fas fa-receipt text-3xl"></i>
                                </div>
                                <p>Nenhuma comanda aberta no momento</p>
                            </div>
                        ) : (
                            <div data-name="open-tabs-list" className="card bg-gray-800">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Comanda</th>
                                            <th>Cliente</th>
                                            <th>Tempo</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {openTabs.map(tab => (
                                            <tr key={tab.id}>
                                                <td>#{tab.number}</td>
                                                <td>{tab.customerName}</td>
                                                <td>{getTimeDifference(tab.createdAt)}</td>
                                                <td>{formatCurrency(calculateTabTotal(tab.items))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    
                    <div data-name="top-products-section">
                        <h2 className="text-xl font-semibold mb-4">Produtos Mais Vendidos (7 dias)</h2>
                        
                        {topProducts.length === 0 ? (
                            <div data-name="no-top-products" className="card bg-gray-800 p-6 text-center">
                                <div className="text-gray-400 mb-2">
                                    <i className="fas fa-box text-3xl"></i>
                                </div>
                                <p>Nenhuma venda registrada nos últimos 7 dias</p>
                            </div>
                        ) : (
                            <div data-name="top-products-list" className="card bg-gray-800">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th>Quantidade</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topProducts.map(product => (
                                            <tr key={product.id}>
                                                <td>{product.name}</td>
                                                <td>{product.quantity}</td>
                                                <td>{formatCurrency(product.totalValue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    
                    {todayStats && todayStats.paymentMethods && Object.keys(todayStats.paymentMethods).length > 0 && (
                        <div data-name="payment-methods-section" className="lg:col-span-2">
                            <h2 className="text-xl font-semibold mb-4">Formas de Pagamento (Hoje)</h2>
                            
                            <div data-name="payment-methods-list" className="card bg-gray-800">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Forma de Pagamento</th>
                                            <th>Quantidade</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(todayStats.paymentMethods).map(([method, data]) => (
                                            <tr key={method}>
                                                <td>{getPaymentMethodLabel(method)}</td>
                                                <td>{data.count}</td>
                                                <td>{formatCurrency(data.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error('Dashboard page error:', error);
        reportError(error);
        return (
            <div className="p-4 text-center text-red-500">
                <p>Erro ao carregar o dashboard.</p>
            </div>
        );
    }
}
