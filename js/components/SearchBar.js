function SearchBar({ placeholder, onChange, value }) {
    try {
        const [searchTerm, setSearchTerm] = React.useState(value || '');
        const [isFocused, setIsFocused] = React.useState(false);
        
        const handleChange = (e) => {
            const newValue = e.target.value;
            setSearchTerm(newValue);
            
            if (onChange) {
                onChange(newValue);
            }
        };
        
        const handleClear = () => {
            setSearchTerm('');
            
            if (onChange) {
                onChange('');
            }
        };
        
        return (
            <div 
                data-name="search-bar" 
                className={`relative transition-all duration-200 ${
                    isFocused ? 'scale-[1.02]' : ''
                }`}
            >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className={`fas fa-search ${isFocused ? 'text-purple-500' : 'text-gray-400'}`}></i>
                </div>
                <input
                    data-name="search-input"
                    type="text"
                    className="form-control pl-10"
                    placeholder={placeholder || "Buscar..."}
                    value={searchTerm}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    aria-label={placeholder || "Buscar"}
                />
                {searchTerm && (
                    <button
                        data-name="clear-search"
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={handleClear}
                        aria-label="Limpar pesquisa"
                    >
                        <i className="fas fa-times text-gray-400 hover:text-white"></i>
                    </button>
                )}
            </div>
        );
    } catch (error) {
        console.error('SearchBar component error:', error);
        reportError(error);
        return null;
    }
}
