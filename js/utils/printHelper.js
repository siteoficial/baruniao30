// Funções auxiliares para impressão de comandas

function printTab(tab) {
    try {
        // Criar conteúdo para impressão direta
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'absolute';
        printFrame.style.top = '-1000px';
        document.body.appendChild(printFrame);
        
        // Estilo CSS para a impressão
        const printStyles = `
            body {
                font-family: Arial, sans-serif;
                font-size: 14px;
                line-height: 1.2;
                margin: 0;
                padding: 10px;
                color: black;
                background-color: white;
            }
            .header {
                text-align: center;
                margin-bottom: 10px;
                border-bottom: 1px dashed #000;
                padding-bottom: 5px;
            }
            .title {
                font-size: 18px;
                font-weight: bold;
                margin: 5px 0;
            }
            .info {
                margin: 5px 0;
            }
            .items {
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
            }
            .items th, .items td {
                text-align: left;
                padding: 4px 0;
            }
            .items th {
                border-bottom: 1px solid #000;
            }
            .total-row {
                border-top: 1px solid #000;
                font-weight: bold;
            }
            .subtotal-row {
                border-top: 1px solid #000;
            }
            .discount-row {
                color: #6b46c1;
            }
            .footer {
                text-align: center;
                margin-top: 10px;
                border-top: 1px dashed #000;
                padding-top: 5px;
                font-size: 12px;
            }
            @media print {
                @page {
                    margin: 0;
                }
            }
        `;
        
        // Conteúdo HTML da comanda
        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Comanda #${tab.number}</title>
                <style>${printStyles}</style>
            </head>
            <body>
                <div class="header">
                    <div class="title">COMANDA #${tab.number}</div>
                    <div class="info">Cliente: ${tab.customerName}</div>
                    <div class="info">Data: ${formatDateTime(tab.closedAt)}</div>
                </div>
                
                <div class="items-container">
                    <table class="items">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qtd</th>
                                <th>Valor</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tab.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatCurrency(item.price)}</td>
                                    <td>${formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            `).join('')}
                            ${tab.discount > 0 ? `
                                <tr class="subtotal-row">
                                    <td colspan="3">SUBTOTAL</td>
                                    <td>${formatCurrency(tab.subtotal || calculateTabTotal(tab.items))}</td>
                                </tr>
                                <tr class="discount-row">
                                    <td colspan="3">DESCONTO</td>
                                    <td>${formatCurrency(tab.discount)}</td>
                                </tr>
                            ` : ''}
                            <tr class="total-row">
                                <td colspan="3">TOTAL</td>
                                <td>${formatCurrency(tab.total)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="payment-info">
                    <div class="info">Forma de Pagamento: ${getPaymentMethodLabel(tab.paymentMethod)}</div>
                    ${tab.observations ? `<div class="info">Observações: ${tab.observations}</div>` : ''}
                </div>
                
                <div class="footer">
                    <p>Obrigado pela preferência!</p>
                    <p>Data de impressão: ${formatDateTime(new Date())}</p>
                </div>
            </body>
            </html>
        `;
        
        // Escreve o conteúdo no iframe
        printFrame.contentDocument.open();
        printFrame.contentDocument.write(content);
        printFrame.contentDocument.close();
        
        // Função auxiliar para obter o label do método de pagamento
        function getPaymentMethodLabel(method) {
            const methods = {
                'cash': 'Dinheiro',
                'credit': 'Crédito',
                'debit': 'Débito',
                'pix': 'Pix',
                'transfer': 'Transferência'
            };
            
            return methods[method] || method;
        }
        
        // Aguarda o carregamento da página e imprime
        printFrame.onload = function() {
            setTimeout(() => {
                printFrame.contentWindow.print();
                // Remove o iframe após a impressão
                document.body.removeChild(printFrame);
            }, 500);
        };
        
    } catch (error) {
        console.error('Erro ao imprimir comanda:', error);
        reportError(error);
        alert('Erro ao imprimir comanda. Por favor, tente novamente.');
    }
}