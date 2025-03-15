import React from 'react';
import styles from './ResultSection.module.css';

function TabsNavigation({ activeTab, tabs, onTabChange }) {
    const handleTabClick = (tabId) => {
        if (typeof onTabChange === 'function' && tabId !== activeTab) {
            onTabChange(tabId);
        }
    };

    return (
        <div className={styles.tabsContainer}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
                    onClick={() => handleTabClick(tab.id)}
                    type="button"
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span className={styles.tabCount}>
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

export default TabsNavigation;