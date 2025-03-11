import React from 'react';
import styles from './ResultSection.module.css';

function TabsNavigation({ activeTab, tabs, onTabChange }) {
    return (
        <div className={styles.tabsContainer}>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label} {tab.count !== undefined && <span className={styles.tabCount}>{tab.count}</span>}
                </button>
            ))}
        </div>
    );
}

export default TabsNavigation;