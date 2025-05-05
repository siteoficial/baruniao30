const LocalStorageManager = {
    saveData: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            reportError(error);
            return false;
        }
    },
    
    getData: function(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error getting data from localStorage:', error);
            reportError(error);
            return defaultValue;
        }
    },
    
    removeData: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing data from localStorage:', error);
            reportError(error);
            return false;
        }
    },
    
    clearAll: function() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            reportError(error);
            return false;
        }
    }
};
