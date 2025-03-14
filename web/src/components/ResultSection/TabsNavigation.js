import React, { useState } from 'react';
import styles from './ResultSection.module.css';

function TabsNavigation({ activeTab, tabs, onTabChange }) {
    const [previousTab, setPreviousTab] = useState(activeTab);
    const [isAnimating, setIsAnimating] = useState(false);
    
    const handleTabClick = (tabId) => {
        if (typeof onTabChange === 'function' && !isAnimating && tabId !== activeTab) {
            setPreviousTab(activeTab);
            setIsAnimating(true);
            
            // Aguardar a animação terminar antes de permitir nova mudança
            setTimeout(() => {
                setIsAnimating(false);
            }, 300);
            
            onTabChange(tabId);
        }
    };
    
    // Determinar a direção da animação
    const getTabIndex = (tabId) => tabs.findIndex(tab => tab.id === tabId);
    const currentIndex = getTabIndex(activeTab);
    const previousIndex = getTabIndex(previousTab);
    const direction = currentIndex > previousIndex ? 'right' : 'left';
    
    return (
        <div className={`${styles.tabsContainer} ${styles.animateTabsContainer}`}>
            {tabs.map((tab, index) => (
                <button
                    key={tab.id}
                    className={`
                      ${styles.tabButton} 
                      ${activeTab === tab.id ? styles.activeTab : ''} 
                      ${styles.transitionAll}
                      ${styles.animateFadeIn}
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleTabClick(tab.id)}
                    type="button"
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span 
                            className={`
                                ${styles.tabCount} 
                                ${activeTab === tab.id ? styles.animatePulse : ''}
                            `}
                        >
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

export default TabsNavigation;