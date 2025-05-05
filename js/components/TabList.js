function TabList({ tabs, onSelectTab, onCreateTab, selectedTabId, showCreateButton = true }) {
    try {
        const handleSelectTab = (tab) => {
            if (onSelectTab) {
                onSelectTab(tab);
            }
        };
        
        const handleCreateTab = () => {
            if (onCreateTab) {
                onCreateTab();
            }
        };
        
        return (
            <div data-name="tab-list" className="tabs-grid">
                {tabs.map(tab => (
                    <TabCard 
                        key={tab.id} 
                        tab={tab} 
                        isSelected={selectedTabId === tab.id}
                        onClick={handleSelectTab} 
                    />
                ))}
                
                {showCreateButton && (
                    <div data-name="create-tab-card" onClick={handleCreateTab}>
                        <TabCard />
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('TabList component error:', error);
        reportError(error);
        return null;
    }
}
