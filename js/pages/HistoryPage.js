function HistoryPage() {
    try {
        const [closedTabs, setClosedTabs] = React.useState([]);
        const [viewingTab, setViewingTab] = React.useState(null);
        const [showTabDetails, setShowTabDetails] = React.useState(false);
        
        // Load closed tabs on component mount
        React.useEffect(() => {
            loadClosedTabs();
        }, []);
        
        const loadClosedTabs = () => {
            const tabs = TabManager.getClosedTabs();
            
            // Sort by closedAt, most recent first
            tabs.sort((a, b) => new Date(b.closedAt) - new Date(a.closedAt));
            
            setClosedTabs(tabs);
        };
        
        const handleViewTab = (tab) => {
            setViewingTab(tab);
            setShowTabDetails(true);
        };
        
        const handleCloseDetails = () => {
            setShowTabDetails(false);
            setViewingTab(null);
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
        
        return (
            <div data-name="history-page" className="p-4">
                <h1 className="page-title">Histórico</h1>
                
                <HistoryList tabs={closedTabs} onViewTab={handleViewTab} />
                
                {/* Tab Details Modal */}
                {showTabDetails && viewingTab && (
                    <Modal
                        isOpen={showTabDetails}
                        onClose={handleCloseDetails}
                        title={`Comanda #${viewingTab.number} - ${viewingTab.customerName}`}
                    >
                        <div data-name="tab-details-view">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-lg font-medium">Detalhes da Comanda</div>
                                <button 
                                    data-name="print-tab-button"
                                    className="btn btn-secondary"
                                    onClick={() => printTab(viewingTab)}
                                    title="Imprimir comanda"
                                >
                                    <i className="fas fa-print mr-2"></i>
                                    Imprimir Comanda
                                </button>
                            </div>
                            
                            <div data-name="tab-info" className="mb-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-gray-400 text-sm">Data de Abertura</div>
                                        <div>{formatDateTime(viewingTab.createdAt)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Data de Fechamento</div>
                                        <div>{formatDateTime(viewingTab.closedAt)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Forma de Pagamento</div>
                                        <div>{getPaymentMethodLabel(viewingTab.paymentMethod)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-sm">Total</div>
                                        <div className="font-bold">{formatCurrency(viewingTab.total)}</div>
                                    </div>
                                </div>
                                
                                {viewingTab.discount > 0 && (
                                    <div className="mt-2 p-2 bg-gray-800 rounded-lg">
                                        <div className="flex justify-between">
                                            <div className="text-gray-400 text-sm">Subtotal</div>
                                            <div>{formatCurrency(viewingTab.subtotal || calculateTabTotal(viewingTab.items))}</div>
                                        </div>
                                        <div className="flex justify-between">
                                            <div className="text-gray-400 text-sm">Desconto</div>
                                            <div className="text-purple-400">{formatCurrency(viewingTab.discount)}</div>
                                        </div>
                                        <div className="flex justify-between">
                                            <div className="text-gray-400 text-sm">Total com Desconto</div>
                                            <div className="font-bold">{formatCurrency(viewingTab.total)}</div>
                                        </div>
                                    </div>
                                )}
                                
                                {viewingTab.observations && (
                                    <div className="mt-2">
                                        <div className="text-gray-400 text-sm">Observações</div>
                                        <div>{viewingTab.observations}</div>
                                    </div>
                                )}
                            </div>
                            
                            <div data-name="tab-items" className="mt-4">
                                <h4 className="text-lg font-medium mb-2">Itens da Comanda</h4>
                                
                                {viewingTab.items.length === 0 ? (
                                    <div className="text-gray-400 text-center py-4">Nenhum item na comanda</div>
                                ) : (
                                    <div data-name="items-table" className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Item</th>
                                                    <th>Preço Unit.</th>
                                                    <th>Quantidade</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {viewingTab.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.name}</td>
                                                        <td>{formatCurrency(item.price)}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>{formatCurrency(item.price * item.quantity)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="3" className="text-right font-bold">Subtotal</td>
                                                    <td className="font-bold">{formatCurrency(viewingTab.subtotal || calculateTabTotal(viewingTab.items))}</td>
                                                </tr>
                                                {viewingTab.discount > 0 && (
                                                <tr>
                                                    <td colSpan="3" className="text-right font-bold">Desconto</td>
                                                    <td className="font-bold text-purple-400">{formatCurrency(viewingTab.discount)}</td>
                                                </tr>
                                                )}
                                                <tr>
                                                    <td colSpan="3" className="text-right font-bold">Total</td>
                                                    <td className="font-bold text-green-500">{formatCurrency(viewingTab.total)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        );
    } catch (error) {
        console.error('HistoryPage error:', error);
        reportError(error);
        return (
            <div className="p-4 text-center text-red-500">
                <p>Erro ao carregar a página de histórico.</p>
            </div>
        );
    }
}
