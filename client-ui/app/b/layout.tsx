'use client';

import { ReactNode } from 'react';
import './user-layout.css';
import Link from 'next/link';

export default function UserLayout({ children }: { children: ReactNode }) {
    return (
        <div className="bookstore-layout">
            {/* ===== Header ===== */}
            <header className="bookstore-header">
                <div className="header-left">
                    <Link href="/" className="brand">
                        📚 BookNest
                    </Link>
                </div>

                <nav className="nav-links">
                    <Link href="/b/books">Sách</Link>
                    <Link href="/b/cart">🛒 Giỏ hàng</Link>
                    <Link href="/b/profile">Tài khoản</Link>
                </nav>
            </header>

            {/* ===== Content ===== */}
            <main className="bookstore-content">
                {children}
            </main>

            {/* ===== Footer ===== */}
            <footer className="bookstore-footer">
                © {new Date().getFullYear()} BookNest. Giữ toàn bộ bản quyền.
            </footer>
        </div>
    );
}
