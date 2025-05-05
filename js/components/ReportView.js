function ReportView({ report, reportType, onExport }) {
    try {
        if (!report) {
            return (
                <div data-name="no-report" className="empty-state">
                    <div className="empty-state-icon">
                        <i className="fas fa-chart-bar"></i>
                    </div>
                    <div className="empty-state-text">Selecione um período para gerar o relatório</div>
                </div>
            );
        }
        
        const handleExport = () => {
            if (onExport) {
                onExport(report);
            }
        };
        
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
        
        const renderSalesReport = () => {
            return (
                <div data-name="sales-report">
                    <div data-name="report-summary" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div data-name="report-card" className="card bg-gray-800">
                            <div className="text-sm text-gray-400">Total de Vendas</div>
                            <div className="text-2xl font-bold mt-1">{formatCurrency(report.totalSales)}</div>
                        </div>
                        
                        <div data-name="report-card" className="card bg-gray-800">
                            <div className="text-sm text-gray-400">Comandas Fechadas</div>
                            <div className="text-2xl font-bold mt-1">{report.tabCount}</div>
                        </div>
                        
                        <div data-name="report-card" className="card bg-gray-800">
                            <div className="text-sm text-gray-400">Ticket Médio</div>
                            <div className="text-2xl font-bold mt-1">{formatCurrency(report.averageTicket)}</div>
                        </div>
                    </div>
                    
                    <div data-name="payment-methods" className="mb-6">
                        <h4 className="text-lg font-medium mb-3">Formas de Pagamento</h4>
                        
                        {Object.keys(report.paymentMethods).length === 0 ? (
                            <div className="text-gray-400 text-center py-4">Nenhum pagamento registrado</div>
                        ) : (
                            <div data-name="payment-methods-table" className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Forma de Pagamento</th>
                                            <th>Quantidade</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(report.paymentMethods).map(([method, data]) => (
                                            <tr key={method}>
                                                <td>{getPaymentMethodLabel(method)}</td>
                                                <td>{data.count}</td>
                                                <td>{formatCurrency(data.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    
                    <div data-name="tabs-list">
                        <h4 className="text-lg font-medium mb-3">Comandas do Período</h4>
                        
                        {report.tabs.length === 0 ? (
                            <div className="text-gray-400 text-center py-4">Nenhuma comanda no período</div>
                        ) : (
                            <div data-name="tabs-table" className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Comanda</th>
                                            <th>Cliente</th>
                                            <th>Data</th>
                                            <th>Pagamento</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.tabs.map(tab => (
                                            <tr key={tab.id}>
                                                <td>#{tab.number}</td>
                                                <td>{tab.customerName}</td>
                                                <td>{formatDateTime(tab.closedAt)}</td>
                                                <td>{getPaymentMethodLabel(tab.paymentMethod)}</td>
                                                <td>{formatCurrency(tab.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            );
        };
        
        const renderProductReport = () => {
            return (
                <div data-name="product-report">
                    <div data-name="product-summary" className="mb-6">
                        <h4 className="text-lg font-medium mb-3">Vendas por Produto</h4>
                        
                        {report.products.length === 0 ? (
                            <div className="text-gray-400 text-center py-4">Nenhum produto vendido no período</div>
                        ) : (
                            <div data-name="products-table" className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th>Quantidade</th>
                                            <th>Preço Unit.</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.products.map(product => (
                                            <tr key={product.id}>
                                                <td>{product.name}</td>
                                                <td>{product.quantity}</td>
                                                <td>{formatCurrency(product.unitPrice)}</td>
                                                <td>{formatCurrency(product.totalValue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            );
        };
        
        return (
            <div data-name="report-view" className="card">
                <div data-name="report-header" className="card-header">
                    <h3 className="card-title">
                        {reportType === 'sales' ? 'Relatório de Vendas' : 'Relatório de Produtos'}
                    </h3>
                    
                    <div>
                        <button
                            data-name="export-button"
                            className="btn btn-primary btn-sm"
                            onClick={handleExport}
                        >
                            <i className="fas fa-file-export mr-1"></i>
                            Exportar CSV
                        </button>
                    </div>
                </div>
                
                <div data-name="report-period" className="mb-4 text-gray-400 text-sm">
                    Período: {formatDate(report.startDate)} a {formatDate(report.endDate)}
                </div>
                
                {reportType === 'sales' ? renderSalesReport() : renderProductReport()}
            </div>
        );
    } catch (error) {
        console.error('ReportView component error:', error);
        reportError(error);
        return null;
    }
}
