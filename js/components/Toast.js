function Toast({ message, type = 'info', onClose, duration = 3000 }) {
    try {
        const [isExiting, setIsExiting] = React.useState(false);
        const toastRef = React.useRef(null);
        
        React.useEffect(() => {
            if (duration > 0) {
                const timer = setTimeout(() => {
                    handleClose();
                }, duration);
                
                return () => clearTimeout(timer);
            }
        }, [duration]);
        
        const handleClose = () => {
            setIsExiting(true);
            
            // Aguardar a animação de saída antes de remover o toast
            setTimeout(() => {
                if (onClose) {
                    onClose();
                }
            }, 300); // Duração da animação de saída
        };
        
        const getIcon = () => {
            switch (type) {
                case 'success':
                    return 'fas fa-check-circle';
                case 'error':
                    return 'fas fa-exclamation-circle';
                case 'warning':
                    return 'fas fa-exclamation-triangle';
                case 'info':
                default:
                    return 'fas fa-info-circle';
            }
        };
        
        return (
            <div 
                data-name={`toast-${type}`} 
                className={`toast toast-${type} ${isExiting ? 'animate-fadeOut' : ''}`}
                role="alert"
                aria-live="assertive"
                ref={toastRef}
            >
                <div data-name="toast-icon" className="toast-icon">
                    <i className={getIcon()}></i>
                </div>
                <div data-name="toast-message" className="toast-message">
                    {message}
                </div>
                <div
                    data-name="toast-close"
                    className="toast-close"
                    onClick={handleClose}
                    role="button"
                    tabIndex={0}
                    aria-label="Fechar notificação"
                >
                    <i className="fas fa-times"></i>
                </div>
                <div 
                    data-name="toast-progress" 
                    className="toast-progress"
                    style={{
                        animation: `progress ${duration / 1000}s linear`
                    }}
                ></div>
            </div>
        );
    } catch (error) {
        console.error('Toast component error:', error);
        reportError(error);
        return null;
    }
}

function ToastContainer({ toasts, removeToast }) {
    try {
        return (
            <div data-name="toast-container" className="toast-container">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                        duration={toast.duration}
                    />
                ))}
            </div>
        );
    } catch (error) {
        console.error('ToastContainer component error:', error);
        reportError(error);
        return null;
    }
}
