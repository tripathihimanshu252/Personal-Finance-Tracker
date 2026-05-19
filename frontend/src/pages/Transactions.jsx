import { useState, useEffect } from 'react';
import API from '../api/api';
import { PlusCircle, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('Food');
    const [description, setDescription] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');

    const user = JSON.parse(localStorage.getItem('user')) || { role: 'user' };
    const isReadOnly = user.role === 'read-only';

    const fetchTransactions = async () => {
        try {
            const { data } = await API.get(`/transactions?page=${page}&limit=5`);
            setTransactions(data.transactions);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error('Failed to fetch transactions');
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page]);

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (isReadOnly) return;
        try {
            await API.post('/transactions', { amount, type, category, description });
            setAmount('');
            setDescription('');
            setPage(1);
            fetchTransactions();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add transaction');
        }
    };

    const handleDelete = async (id) => {
        if (isReadOnly) return;
        try {
            await API.delete(`/transactions/${id}`);
            fetchTransactions();
        } catch (err) {
            alert(err.response?.data?.message || 'Not authorized to delete');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {!isReadOnly && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                        <PlusCircle className="text-blue-600" size={20} />
                        <span>Add Transaction</span>
                    </h3>
                    {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
                    <form onSubmit={handleAddTransaction} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input
                                type="number"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="Food">Food</option>
                                <option value="Transport">Transport</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Bills">Bills</option>
                                <option value="Salary">Salary</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <input
                                type="text"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                        >
                            Save Transaction
                        </button>
                    </form>
                </div>
            )}

            <div className={`${isReadOnly ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white p-6 rounded-xl shadow-sm border border-gray-200`}>
                <h3 className="text-xl font-bold text-gray-800 mb-4">History</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-left">
                        <thead>
                            <tr className="text-gray-500 text-sm font-semibold">
                                <th className="pb-3">Type</th>
                                <th className="pb-3">Category</th>
                                <th className="pb-3">Amount</th>
                                <th className="pb-3">Description</th>
                                {!isReadOnly && <th className="pb-3 text-right">Action</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                            {transactions.map((t) => (
                                <tr key={t.id} className="text-gray-700">
                                    <td className="py-3">
                                        {t.type === 'income' ? (
                                            <span className="text-green-600 flex items-center space-x-1"><ArrowUpRight size={16} /> <span>Income</span></span>
                                        ) : (
                                            <span className="text-red-600 flex items-center space-x-1"><ArrowDownRight size={16} /> <span>Expense</span></span>
                                        )}
                                    </td>
                                    <td className="py-3 font-medium">{t.category}</td>
                                    <td className={`py-3 font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        ₹{t.amount}
                                    </td>
                                    <td className="py-3 text-gray-500">{t.description || '-'}</td>
                                    {!isReadOnly && (
                                        <td className="py-3 text-right">
                                            <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1 bg-gray-100 rounded text-sm disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-3 py-1 bg-gray-100 rounded text-sm disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Transactions;