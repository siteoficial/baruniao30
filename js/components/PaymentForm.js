function PaymentForm({ tab, onSubmit, onCancel }) {
    try {
        const [paymentMethod, setPaymentMethod] = React.useState('cash');
        const [observations, setObservations] = React.useState('');
        const [error, setError] = React.useState('');
        const [isSubmitting, setIsSubmitting] = React.useState(false);
        const [receivedAmount, setReceivedAmount] = React.useState('');
        const [changeAmount, setChangeAmount] = React.useState(0);
        const [showItemsList, setShowItemsList] = React.useState(false);
        const [isPrinting, setIsPrinting] = React.useState(false);
        const [showConfirmation, setShowConfirmation] = React.useState(false);
        const [discount, setDiscount] = React.useState('');
        const [finalTotal, setFinalTotal] = React.useState(0);
        
        const paymentMethods = [
            { id: 'cash', label: 'Dinheiro', icon: 'fas fa-money-bill-wave' },
            { id: 'credit', label: 'Cartão de Crédito', icon: 'fas fa-credit-card' },
            { id: 'debit', label: 'Cartão de Débito', icon: 'fas fa-credit-card' },
            { id: 'pix', label: 'Pix', icon: 'fas fa-qrcode' },
            { id: 'transfer', label: 'Transferência', icon: 'fas fa-university' }
        ];

        // Calcular o total com desconto
        React.useEffect(() => {
            const originalTotal = calculateTabTotal(tab.items);
            const discountValue = parseFloat(discount.replace(',', '.')) || 0;
            const total = Math.max(0, originalTotal - discountValue);
            setFinalTotal(total);
        }, [discount, tab.items]);
        
        // Calcular o troco quando o valor recebido muda
        React.useEffect(() => {
            if (paymentMethod === 'cash' && receivedAmount) {
                const received = parseFloat(receivedAmount.replace(',', '.'));
                if (!isNaN(received) && received >= finalTotal) {
                    setChangeAmount(received - finalTotal);
                } else {
                    setChangeAmount(0);
                }
            }
        }, [receivedAmount, finalTotal, paymentMethod]);
        
        const handleSubmit = (e) => {
            e.preventDefault();
            
            if (!paymentMethod) {
                setError('Selecione uma forma de pagamento');
                return;
            }
            
            if (paymentMethod === 'cash') {
                const received = parseFloat(receivedAmount.replace(',', '.'));
                
                if (!receivedAmount || isNaN(received)) {
                    setError('Informe o valor recebido');
                    return;
                }
                
                if (received < finalTotal) {
                    setError('O valor recebido é menor que o total');
                    return;
                }
            }
            
            // Em vez de processar imediatamente, mostrar confirmação
            setShowConfirmation(true);
        };
        
        const handleConfirmPayment = () => {
            setIsSubmitting(true);
            setShowConfirmation(false);
            
            // Simular um breve atraso para feedback visual
            setTimeout(() => {
                onSubmit({
                    paymentMethod,
                    observations,
                    receivedAmount: paymentMethod === 'cash' ? receivedAmount : null,
                    changeAmount: paymentMethod === 'cash' ? changeAmount : null,
                    discount: parseFloat(discount.replace(',', '.')) || 0
                });
                setIsSubmitting(false);
            }, 600);
        };
        
        const handleCancelConfirmation = () => {
            setShowConfirmation(false);
        };
        
        const handlePrint = () => {
            setIsPrinting(true);
            
            // Criar conteúdo para impressão
            const printContent = document.createElement('div');
            printContent.innerHTML = `
                <style>
                    @media print {
                        body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.2; }
                        h1, h2, h3 { margin: 5px 0; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { text-align: left; padding: 3px 0; }
                        .total { font-weight: bold; margin-top: 10px; }
                        .header { text-align: center; margin-bottom: 10px; }
                        .divider { border-top: 1px dashed #000; margin: 5px 0; }
                    }
                </style>
                <div class="header">
                    <h2>COMANDA #${tab.number}</h2>
                    <p>Cliente: ${tab.customerName}</p>
                    <p>Data: ${formatDateTime(new Date())}</p>
                </div>
                <div class="divider"></div>
                <table>
                    <tr>
                        <th>Item</th>
                        <th>Qtd</th>
                        <th>Valor</th>
                        <th>Total</th>
                    </tr>
                    ${tab.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${formatCurrency(item.price)}</td>
                            <td>${formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </table>
                <div class="divider"></div>
                <div class="total">
                    <p>Subtotal: ${formatCurrency(calculateTabTotal(tab.items))}</p>
                    ${parseFloat(discount) > 0 ? `<p>Desconto: ${formatCurrency(parseFloat(discount.replace(',', '.')) || 0)}</p>` : ''}
                    <p>Total: ${formatCurrency(finalTotal)}</p>
                    ${paymentMethod === 'cash' ? `
                        <p>Valor Recebido: ${formatCurrency(parseFloat(receivedAmount.replace(',', '.')))}</p>
                        <div style="margin: 8px 0; padding: 5px; border: 2px dashed #000; text-align: center;">
                            <p style="font-size: 14px; font-weight: bold; margin: 0;">TROCO: ${formatCurrency(changeAmount)}</p>
                        </div>
                    ` : `
                        <p>Forma de Pagamento: ${paymentMethods.find(m => m.id === paymentMethod)?.label || paymentMethod}</p>
                    `}
                </div>
                <div class="divider"></div>
                <div class="header">
                    <p>Obrigado pela preferência!</p>
                </div>
            `;
            
            // Criar iframe para impressão
            const printFrame = document.createElement('iframe');
            printFrame.style.position = 'absolute';
            printFrame.style.top = '-1000px';
            document.body.appendChild(printFrame);
            
            printFrame.contentDocument.open();
            printFrame.contentDocument.write(printContent.innerHTML);
            printFrame.contentDocument.close();
            
            // Imprimir após carregar o conteúdo
            printFrame.onload = function() {
                setTimeout(() => {
                    printFrame.contentWindow.print();
                    document.body.removeChild(printFrame);
                    setIsPrinting(false);
                }, 500);
            };
        };
        
        return (
            <div data-name="payment-form" className="card">
                <div data-name="card-header" className="card-header flex justify-between items-center">
                    <h3 className="card-title">
                        <i className="fas fa-credit-card text-purple-500 mr-2"></i>
                        Fechar Comanda #{tab.number}
                    </h3>
                    <button 
                        type="button" 
                        className="modal-close" 
                        onClick={onCancel}
                        aria-label="Fechar"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div data-name="tab-summary" className="mb-3 p-3 bg-gray-900 bg-opacity-70 rounded-lg shadow-inner">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400 text-sm">Cliente</span>
                            <span className="font-medium">{tab.customerName}</span>
                        </div>
                        
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400 text-sm">Itens</span>
                            <span className="font-medium">{tab.items.length}</span>
                        </div>
                        
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400 text-sm">Subtotal</span>
                            <span className="font-medium">{formatCurrency(calculateTabTotal(tab.items))}</span>
                        </div>
                        
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400 text-sm">Desconto</span>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">R$</span>
                                <input
                                    data-name="discount-input"
                                    type="text"
                                    inputmode="decimal"
                                    pattern="[0-9]*[,.]?[0-9]*"
                                    className="form-control pl-8 text-sm py-1 bg-gray-800 border-purple-900 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-25 w-24"
                                    placeholder="0,00"
                                    value={discount}
                                    onChange={(e) => {
                                        // Permitir apenas números e vírgula
                                        const value = e.target.value.replace(/[^0-9,]/g, '');
                                        setDiscount(value);
                                    }}
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400 text-sm">Total</span>
                            <span className="font-medium text-xl text-green-400">{formatCurrency(finalTotal)}</span>
                        </div>
                        
                        <div className="mt-2 flex justify-between items-center">
                            <button 
                                type="button" 
                                className="text-blue-400 hover:text-blue-300 text-xs flex items-center transition-colors"
                                onClick={() => setShowItemsList(!showItemsList)}
                            >
                                <i className={`fas fa-${showItemsList ? 'chevron-up' : 'chevron-down'} mr-1`}></i>
                                {showItemsList ? 'Ocultar itens' : 'Mostrar itens consumidos'}
                            </button>
                            
                            <button 
                                type="button" 
                                className="text-green-400 hover:text-green-300 text-xs flex items-center transition-colors"
                                onClick={handlePrint}
                                disabled={isPrinting}
                            >
                                <i className={`fas fa-${isPrinting ? 'spinner fa-spin' : 'print'} mr-1`}></i>
                                {isPrinting ? 'Imprimindo...' : 'Imprimir comanda'}
                            </button>
                        </div>
                        
                        {showItemsList && (
                            <div className="mt-2 border-t border-gray-700 pt-2 max-h-40 overflow-y-auto custom-scrollbar">
                                <h4 className="text-xs font-medium mb-1 text-gray-400">Itens Consumidos:</h4>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-gray-500 text-xs">
                                            <th className="text-left py-1">Item</th>
                                            <th className="text-center py-1">Qtd</th>
                                            <th className="text-right py-1">Valor</th>
                                            <th className="text-right py-1">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tab.items.map(item => (
                                            <tr key={item.id} className="border-t border-gray-800">
                                                <td className="py-1 text-left text-xs">{item.name}</td>
                                                <td className="py-1 text-center text-xs">{item.quantity}</td>
                                                <td className="py-1 text-right text-xs">{formatCurrency(item.price)}</td>
                                                <td className="py-1 text-right text-xs">{formatCurrency(item.price * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    
                    <div data-name="form-group" className="form-group mt-2 mb-2">
                        <label data-name="payment-method-label" className="form-label mb-1 text-sm">Forma de Pagamento</label>
                        
                        <div data-name="payment-methods-grid" className="grid grid-cols-3 gap-2">
                            {paymentMethods.map(method => (
                                <div
                                    data-name={`payment-method-${method.id}`}
                                    key={method.id}
                                    className={`payment-method-modern ${paymentMethod === method.id ? 'selected' : ''}`}
                                    onClick={() => setPaymentMethod(method.id)}
                                    role="radio"
                                    aria-checked={paymentMethod === method.id}
                                    tabIndex={0}
                                    onKeyPress={(e) => e.key === 'Enter' && setPaymentMethod(method.id)}
                                >
                                    <i className={`${method.icon} payment-method-icon`}></i>
                                    <span className="payment-method-label">{method.label}</span>
                                </div>
                            ))}
                        </div>
                        
                        {error && (
                            <div data-name="error-message" className="text-red-500 text-xs mt-1">
                                <i className="fas fa-exclamation-circle mr-1"></i>
                                {error}
                            </div>
                        )}
                    </div>
                    
                    {paymentMethod === 'cash' && (
                        <div data-name="cash-payment-details" className="form-group bg-gray-900 bg-opacity-60 p-2 rounded-lg mt-2 shadow-inner">
                            <div className="flex items-center justify-between mb-2">
                                <label data-name="received-amount-label" htmlFor="receivedAmount" className="form-label mb-0 text-sm">
                                    Valor Recebido
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400">R$</span>
                                    <input
                                        data-name="received-amount-input"
                                        id="receivedAmount"
                                        type="text"
                                        inputmode="decimal"
                                        pattern="[0-9]*[,.]?[0-9]*"
                                        className="form-control pl-8 text-sm py-2 bg-gray-800 border-purple-900 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-25"
                                        placeholder="0,00"
                                        value={receivedAmount}
                                        onChange={(e) => {
                                            // Permitir apenas números e vírgula
                                            const value = e.target.value.replace(/[^0-9,]/g, '');
                                            setReceivedAmount(value);
                                            setError('');
                                        }}
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-2 bg-gradient-to-r from-indigo-900 to-purple-800 rounded-lg p-2 shadow-lg">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-gray-300 text-xs">Total da Comanda</span>
                                    <div className="flex items-center">
                                        <i className="fas fa-receipt text-purple-300 mr-1"></i>
                                        <span className="text-lg font-bold text-white">{formatCurrency(finalTotal)}</span>
                                    </div>
                                </div>
                                
                                <div className="border-t border-purple-700 my-1 pt-1"></div>
                                
                                <div className="flex items-center justify-between mb-0">
                                    <span className="text-gray-300 text-xs">Troco</span>
                                    <div className="flex items-center">
                                        <i className="fas fa-exchange-alt text-purple-300 mr-1"></i>
                                        <span className={`text-xl font-bold ${changeAmount > 0 ? 'text-green-400' : 'text-white'}`}>{formatCurrency(changeAmount)}</span>
                                    </div>
                                </div>
                                {changeAmount > 0 && (
                                    <div className="text-xs text-right text-purple-300 mt-1">
                                        <i className="fas fa-info-circle mr-1"></i>
                                        Confira o valor antes de entregar
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div data-name="form-group" className="form-group mb-2">
                        <label data-name="observations-label" htmlFor="observations" className="form-label mb-1 text-sm">
                            Observações <span className="text-xs text-gray-400">(opcional)</span>
                        </label>
                        <textarea
                            data-name="observations-input"
                            id="observations"
                            className="form-control text-sm"
                            rows="2"
                            placeholder="Observações sobre o pagamento (opcional)"
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                        ></textarea>
                    </div>
                    
                    <div data-name="form-actions" className="flex justify-end space-x-2 mt-3">
                        <button
                            data-name="cancel-button"
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            data-name="submit-button"
                            type="submit"
                            className="btn btn-sm btn-primary bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden transition-all duration-300 ease-in-out shadow-lg hover:from-indigo-500 hover:to-purple-500"
                            disabled={isSubmitting}
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                {isSubmitting ? (
                                    <React.Fragment>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Processando...
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>
                                        <i className="fas fa-check-circle mr-2"></i>
                                        Finalizar Pagamento
                                    </React.Fragment>
                                )}
                            </span>
                        </button>
                    </div>
                </form>
                
                {showConfirmation && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gray-900 rounded-lg p-4 max-w-md w-full mx-4 shadow-2xl border border-purple-800 animate-fadeIn">
                            <div className="text-center mb-4">
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-lg">
                                    <i className="fas fa-check text-2xl text-white"></i>
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-white">Confirmar Fechamento</h3>
                                <p className="text-gray-400 text-sm">
                                    Tem certeza que deseja fechar a comanda <span className="font-medium text-white">#{tab.number}</span> de <span className="font-medium text-white">{tab.customerName}</span>?
                                </p>
                                <div className="mt-4 p-3 bg-gray-800 bg-opacity-50 rounded-lg shadow-inner">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Subtotal:</span>
                                        <span className="text-white">{formatCurrency(calculateTabTotal(tab.items))}</span>
                                    </div>
                                    {parseFloat(discount.replace(',', '.')) > 0 && (
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-gray-400 text-sm">Desconto:</span>
                                            <span className="text-purple-400">{formatCurrency(parseFloat(discount.replace(',', '.')) || 0)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-gray-400 text-sm">Total:</span>
                                        <span className="font-bold text-green-400">{formatCurrency(finalTotal)}</span>
                                    </div>
                                    {paymentMethod === 'cash' && (
                                        <React.Fragment>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-gray-400 text-sm">Recebido:</span>
                                                <span className="text-white">{formatCurrency(parseFloat(receivedAmount.replace(',', '.') || 0))}</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-gray-400 text-sm">Troco:</span>
                                                <span className="text-purple-400">{formatCurrency(changeAmount)}</span>
                                            </div>
                                        </React.Fragment>
                                    )}
                                    {paymentMethod !== 'cash' && (
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-gray-400 text-sm">Pagamento:</span>
                                            <span className="flex items-center text-white">
                                                <i className={`${paymentMethods.find(m => m.id === paymentMethod)?.icon} mr-2 text-purple-400`}></i>
                                                {paymentMethods.find(m => m.id === paymentMethod)?.label}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <button 
                                    className="btn btn-sm btn-secondary flex-1 border border-gray-700" 
                                    onClick={handleCancelConfirmation}
                                >
                                    <i className="fas fa-times mr-2"></i>
                                    Cancelar
                                </button>
                                <button 
                                    className="btn btn-sm flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all duration-300"
                                    onClick={handleConfirmPayment}
                                >
                                    <i className="fas fa-check-circle mr-2"></i>
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('PaymentForm component error:', error);
        reportError(error);
        return null;
    }
}
