function Modal({ isOpen, onClose, title, children, footer }) {
    try {
        const [isAnimatingOut, setIsAnimatingOut] = React.useState(false);
        const modalRef = React.useRef(null);
        
        if (!isOpen && !isAnimatingOut) {
            return null;
        }
        
        // Prevenir rolagem do body quando o modal está aberto
        React.useEffect(() => {
            if (isOpen) {
                document.body.style.overflow = 'hidden';
                
                // Foco no modal quando abrir
                if (modalRef.current) {
                    modalRef.current.focus();
                }
            }
            
            return () => {
                document.body.style.overflow = 'auto';
            };
        }, [isOpen]);
        
        // Lidar com tecla ESC para fechar o modal
        React.useEffect(() => {
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    handleClose();
                }
            };
            
            if (isOpen) {
                window.addEventListener('keydown', handleKeyDown);
            }
            
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        }, [isOpen]);
        
        const handleClose = () => {
            setIsAnimatingOut(true);
            
            // Aguardar a animação terminar antes de fechar completamente
            setTimeout(() => {
                setIsAnimatingOut(false);
                onClose();
            }, 300); // Duração da animação
        };
        
        const handleOverlayClick = (e) => {
            if (e.target === e.currentTarget) {
                handleClose();
            }
        };
        
        return (
            <div 
                data-name="modal-overlay" 
                className={`modal-overlay ${isAnimatingOut ? 'animate-fadeOut' : 'animate-fadeIn'}`}
                onClick={handleOverlayClick}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div 
                    data-name="modal-content" 
                    className={`modal-content ${isAnimatingOut ? 'animate-scaleOut' : 'animate-scaleIn'}`}
                    ref={modalRef}
                    tabIndex={-1}
                >
                    {title !== null && (
                        <div data-name="modal-header" className="modal-header">
                            <h3 
                                data-name="modal-title" 
                                className="modal-title"
                                id="modal-title"
                            >
                                {title}
                            </h3>
                            <button 
                                data-name="modal-close" 
                                className="modal-close" 
                                onClick={handleClose}
                                aria-label="Fechar"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    )}
                    
                    <div 
                        data-name="modal-body" 
                        className={`modal-body custom-scrollbar ${title === null ? 'no-header' : ''}`}
                    >
                        {children}
                    </div>
                    
                    {footer && (
                        <div data-name="modal-footer" className="modal-footer">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error('Modal component error:', error);
        reportError(error);
        return null;
    }
}
