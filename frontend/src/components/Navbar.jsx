import { useNavigate, Link } from 'react-router-dom';
import { LogOut, LayoutDashboard, ReceiptText } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'User', role: 'user' };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <span className="text-xl font-bold text-blue-600 tracking-tight">FinanceTracker</span>
                        <div className="hidden md:flex space-x-4">
                            <Link to="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                <LayoutDashboard size={16} />
                                <span>Dashboard</span>
                            </Link>
                            <Link to="/transactions" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                <ReceiptText size={16} />
                                <span>Transactions</span>
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 uppercase">
                                {user.role}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-md text-sm font-medium border border-red-200 transition-colors"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;