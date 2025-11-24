import {BookOpenCheck, LogOut} from 'lucide-react';
import {useRouter} from 'next/navigation';
import './AdminHeader.css';

export default function AdminHeader() {
    const router = useRouter();
    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    return (
        <header className="pharma-header">
            <div className="header-left">
                <BookOpenCheck className="header-icon"/>
                <h2>BOOK SHOP</h2>
            </div>
            <LogOut onClick={handleLogout} className="logout-icon"/>
        </header>
    );
}
