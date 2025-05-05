const ReportManager = {
    getSalesReport: function(startDate, endDate) {
        try {
            const tabs = TabManager.getTabsForDateRange(startDate, endDate);
            
            const totalSales = tabs.reduce((total, tab) => total + tab.total, 0);
            const tabCount = tabs.length;
            
            const paymentMethods = {};
            tabs.forEach(tab => {
                const method = tab.paymentMethod || 'cash';
                if (paymentMethods[method]) {
                    paymentMethods[method].count += 1;
                    paymentMethods[method].total += tab.total;
                } else {
                    paymentMethods[method] = {
                        count: 1,
                        total: tab.total
                    };
                }
            });
            
            const averageTicket = tabCount > 0 ? totalSales / tabCount : 0;
            
            return {
                startDate,
                endDate,
                totalSales,
                tabCount,
                paymentMethods,
                averageTicket,
                tabs
            };
        } catch (error) {
            console.error('Error generating sales report:', error);
            reportError(error);
            return null;
        }
    },
    
    getProductSalesReport: function(startDate, endDate) {
        try {
            const tabs = TabManager.getTabsForDateRange(startDate, endDate);
            
            const productSales = {};
            
            tabs.forEach(tab => {
                tab.items.forEach(item => {
                    const productId = item.id;
                    const productName = item.name;
                    const quantity = item.quantity;
                    const totalValue = item.price * quantity;
                    
                    if (productSales[productId]) {
                        productSales[productId].quantity += quantity;
                        productSales[productId].totalValue += totalValue;
                    } else {
                        productSales[productId] = {
                            id: productId,
                            name: productName,
                            quantity,
                            totalValue,
                            unitPrice: item.price
                        };
                    }
                });
            });
            
            return {
                startDate,
                endDate,
                products: Object.values(productSales).sort((a, b) => b.totalValue - a.totalValue)
            };
        } catch (error) {
            console.error('Error generating product sales report:', error);
            reportError(error);
            return null;
        }
    },
    
    getDailySalesReport: function(date) {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            
            return this.getSalesReport(startOfDay, endOfDay);
        } catch (error) {
            console.error('Error generating daily sales report:', error);
            reportError(error);
            return null;
        }
    },
    
    exportSalesReportToCSV: function(report) {
        try {
            if (!report || !report.tabs || !report.tabs.length) {
                return;
            }
            
            const data = report.tabs.map(tab => ({
                'Número': tab.number,
                'Cliente': tab.customerName,
                'Data': formatDateTime(tab.closedAt),
                'Total': tab.total,
                'Forma de Pagamento': tab.paymentMethod || 'Dinheiro',
                'Observações': tab.observations || ''
            }));
            
            const startDateStr = formatDate(report.startDate);
            const endDateStr = formatDate(report.endDate);
            const filename = `relatorio_vendas_${startDateStr}_a_${endDateStr}.csv`;
            
            exportToCSV(data, filename);
        } catch (error) {
            console.error('Error exporting sales report to CSV:', error);
            reportError(error);
        }
    },
    
    exportProductSalesReportToCSV: function(report) {
        try {
            if (!report || !report.products || !report.products.length) {
                return;
            }
            
            const data = report.products.map(product => ({
                'Produto': product.name,
                'Quantidade': product.quantity,
                'Preço Unitário': product.unitPrice,
                'Valor Total': product.totalValue
            }));
            
            const startDateStr = formatDate(report.startDate);
            const endDateStr = formatDate(report.endDate);
            const filename = `relatorio_produtos_${startDateStr}_a_${endDateStr}.csv`;
            
            exportToCSV(data, filename);
        } catch (error) {
            console.error('Error exporting product sales report to CSV:', error);
            reportError(error);
        }
    }
};
