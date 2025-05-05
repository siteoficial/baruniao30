function ReportsPage() {
    try {
        const [reportType, setReportType] = React.useState('sales');
        const [startDate, setStartDate] = React.useState('');
        const [endDate, setEndDate] = React.useState('');
        const [report, setReport] = React.useState(null);
        const [toasts, setToasts] = React.useState([]);
        
        // Set default date range to current month
        React.useEffect(() => {
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            setStartDate(formatDateForInput(firstDayOfMonth));
            setEndDate(formatDateForInput(now));
        }, []);
        
        const formatDateForInput = (date) => {
            return date.toISOString().split('T')[0];
        };
        
        const handleReportTypeChange = (type) => {
            setReportType(type);
            setReport(null);
        };
        
        const handleGenerateReport = () => {
            if (!startDate || !endDate) {
                showToast({
                    message: 'Por favor, selecione um período válido.',
                    type: 'error'
                });
                return;
            }
            
            try {
                // Converter as datas para o formato correto
                // Garantir que a data inicial seja o início do dia e a data final seja o fim do dia
                const start = new Date(startDate + 'T00:00:00');
                const end = new Date(endDate + 'T23:59:59');
                
                if (start > end) {
                    showToast({
                        message: 'Data inicial não pode ser posterior à data final.',
                        type: 'error'
                    });
                    return;
                }
                
                let generatedReport;
                
                if (reportType === 'sales') {
                    generatedReport = ReportManager.getSalesReport(start, end);
                } else {
                    generatedReport = ReportManager.getProductSalesReport(start, end);
                }
                
                setReport(generatedReport);
                
                showToast({
                    message: 'Relatório gerado com sucesso!',
                    type: 'success'
                });
            } catch (error) {
                console.error('Error generating report:', error);
                reportError(error);
                
                showToast({
                    message: 'Erro ao gerar relatório.',
                    type: 'error'
                });
            }
        };
        
        const handleExportReport = (report) => {
            try {
                if (reportType === 'sales') {
                    ReportManager.exportSalesReportToCSV(report);
                } else {
                    ReportManager.exportProductSalesReportToCSV(report);
                }
                
                showToast({
                    message: 'Relatório exportado com sucesso!',
                    type: 'success'
                });
            } catch (error) {
                console.error('Error exporting report:', error);
                reportError(error);
                
                showToast({
                    message: 'Erro ao exportar relatório.',
                    type: 'error'
                });
            }
        };
        
        // Toast management
        const showToast = (toast) => {
            const id = generateId();
            setToasts([...toasts, { ...toast, id }]);
            
            // Auto-remove after duration
            setTimeout(() => {
                removeToast(id);
            }, 3000);
        };
        
        const removeToast = (id) => {
            setToasts(toasts.filter(toast => toast.id !== id));
        };
        
        return (
            <div data-name="reports-page" className="p-4">
                <h1 className="page-title">Relatórios</h1>
                
                <div data-name="report-controls" className="card bg-gray-800 mb-6">
                    <div data-name="report-type-selector" className="mb-4">
                        <div className="text-gray-400 mb-2">Tipo de Relatório</div>
                        <div className="flex space-x-2">
                            <button
                                data-name="sales-report-button"
                                className={`btn ${reportType === 'sales' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleReportTypeChange('sales')}
                            >
                                <i className="fas fa-chart-line mr-2"></i>
                                Vendas
                            </button>
                            <button
                                data-name="products-report-button"
                                className={`btn ${reportType === 'products' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleReportTypeChange('products')}
                            >
                                <i className="fas fa-box mr-2"></i>
                                Produtos
                            </button>
                        </div>
                    </div>
                    
                    <div data-name="date-range-selector" className="mb-4">
                        <div className="text-gray-400 mb-2">Período</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <label className="form-label text-sm">Data Inicial</label>
                                <input
                                    data-name="start-date"
                                    type="date"
                                    className="form-control"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="form-label text-sm">Data Final</label>
                                <input
                                    data-name="end-date"
                                    type="date"
                                    className="form-control"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => {
                                    const today = new Date();
                                    setStartDate(formatDateForInput(today));
                                    setEndDate(formatDateForInput(today));
                                }}
                            >
                                Hoje
                            </button>
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => {
                                    const today = new Date();
                                    const yesterday = new Date();
                                    yesterday.setDate(today.getDate() - 1);
                                    setStartDate(formatDateForInput(yesterday));
                                    setEndDate(formatDateForInput(yesterday));
                                }}
                            >
                                Ontem
                            </button>
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => {
                                    const today = new Date();
                                    const sevenDaysAgo = new Date();
                                    sevenDaysAgo.setDate(today.getDate() - 7);
                                    setStartDate(formatDateForInput(sevenDaysAgo));
                                    setEndDate(formatDateForInput(today));
                                }}
                            >
                                Últimos 7 dias
                            </button>
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => {
                                    const today = new Date();
                                    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                                    setStartDate(formatDateForInput(firstDayOfMonth));
                                    setEndDate(formatDateForInput(today));
                                }}
                            >
                                Este mês
                            </button>
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => {
                                    const today = new Date();
                                    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                                    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                                    setStartDate(formatDateForInput(firstDayOfLastMonth));
                                    setEndDate(formatDateForInput(lastDayOfLastMonth));
                                }}
                            >
                                Mês anterior
                            </button>
                        </div>
                    </div>
                    
                    <div data-name="report-actions" className="flex justify-end">
                        <button
                            data-name="generate-report-button"
                            className="btn btn-primary"
                            onClick={handleGenerateReport}
                        >
                            <i className="fas fa-chart-bar mr-2"></i>
                            Gerar Relatório
                        </button>
                    </div>
                </div>
                
                <ReportView
                    report={report}
                    reportType={reportType}
                    onExport={handleExportReport}
                />
                
                {/* Toast Notifications */}
                <ToastContainer toasts={toasts} removeToast={removeToast} />
            </div>
        );
    } catch (error) {
        console.error('ReportsPage error:', error);
        reportError(error);
        return (
            <div className="p-4 text-center text-red-500">
                <p>Erro ao carregar a página de relatórios.</p>
            </div>
        );
    }
}
