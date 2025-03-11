import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import styles from './MainLayout.module.css';

function MainLayout() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        // Fechar o menu móvel quando mudar de rota
        setIsMobileMenuOpen(false);

        // Adicionar listener para detectar scroll
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [location.pathname, scrolled]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className={styles.mainWrapper}>
            <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
                <div className={styles.headerContainer}>
                    <h1 className={styles.title}>
                        <span className={styles.titleHighlight}>PIX</span>Control
                    </h1>

                    {/* Menu de hambúrguer para mobile */}
                    <div
                        className={styles.mobileMenuButton}
                        onClick={toggleMobileMenu}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    {/* Navegação normal para desktop e menu móvel */}
                    <nav className={`${styles.navigation} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                isActive ? styles.activeLink : styles.navLink
                            }
                            end
                        >
                            Análise de PIX
                        </NavLink>
                        <NavLink
                            to="/comprovantes"
                            className={({ isActive }) =>
                                isActive ? styles.activeLink : styles.navLink
                            }
                        >
                            Buscar Comprovantes
                        </NavLink>
                    </nav>
                </div>
            </header>

            <main className={styles.content}>
                <Outlet />
            </main>

            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <p>&copy; {new Date().getFullYear()} PIXControl - Todos os direitos reservados</p>
                </div>
            </footer>
        </div>
    );
}

export default MainLayout;