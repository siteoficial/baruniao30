function formatCurrency(value) {
    try {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    } catch (error) {
        console.error('Format currency error:', error);
        reportError(error);
        return `R$ ${parseFloat(value).toFixed(2)}`;
    }
}

function formatDate(date) {
    try {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(new Date(date));
    } catch (error) {
        console.error('Format date error:', error);
        reportError(error);
        return '';
    }
}

function formatDateTime(date) {
    try {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date));
    } catch (error) {
        console.error('Format datetime error:', error);
        reportError(error);
        return '';
    }
}

function formatTime(date) {
    try {
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date));
    } catch (error) {
        console.error('Format time error:', error);
        reportError(error);
        return '';
    }
}

function generateId() {
    try {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    } catch (error) {
        console.error('Generate ID error:', error);
        reportError(error);
        return Math.random().toString(36).substr(2);
    }
}

function calculateTabTotal(items) {
    try {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    } catch (error) {
        console.error('Calculate tab total error:', error);
        reportError(error);
        return 0;
    }
}

function getTimeDifference(startDate) {
    try {
        const start = new Date(startDate);
        const now = new Date();
        const diffMs = now - start;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHrs > 0) {
            return `${diffHrs}h ${diffMins}min`;
        }
        return `${diffMins}min`;
    } catch (error) {
        console.error('Get time difference error:', error);
        reportError(error);
        return '';
    }
}

function debounce(func, wait) {
    try {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    } catch (error) {
        console.error('Debounce error:', error);
        reportError(error);
        return func;
    }
}

function exportToCSV(data, filename) {
    try {
        if (!data || !data.length) {
            return;
        }
        
        const headers = Object.keys(data[0]);
        const csvRows = [];
        
        // Add headers
        csvRows.push(headers.join(','));
        
        // Add data rows
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (error) {
        console.error('Export to CSV error:', error);
        reportError(error);
    }
}

// Verificar se a conexão com a internet está disponível
function isOnline() {
    return window.navigator.onLine;
}

// Função para reportar erros (pode ser expandida no futuro)
function reportError(error) {
    console.error('Erro reportado:', error);
    // Aqui você poderia integrar com algum sistema de monitoramento
}
