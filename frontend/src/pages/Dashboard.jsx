import {
    useState,
    useEffect,
    useMemo,
    useCallback
} from 'react';

import API from '../api/api';

import {

    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,

    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,

    LineChart,
    Line

} from 'recharts';

import {

    Wallet,
    ArrowUpCircle,
    ArrowDownCircle,
    RefreshCw

} from 'lucide-react';

const COLORS = [
    '#4F46E5',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6'
];

const Dashboard = () => {

    const [analytics, setAnalytics] = useState({

        categoryData: [],
        incomeExpenseData: [],
        monthlyData: []

    });

    const [source, setSource] = useState('database');

    const [loading, setLoading] = useState(false);

    // Fetch Analytics

    const fetchAnalytics = useCallback(async () => {

        setLoading(true);

        try {

            const { data } = await API.get('/analytics');

            setAnalytics(data.data || {

                categoryData: [],
                incomeExpenseData: [],
                monthlyData: []

            });

            setSource(data.source || 'database');

        } catch (err) {

            console.error(
                'Failed to load analytics data'
            );

        } finally {

            setLoading(false);

        }

    }, []);

    useEffect(() => {

        fetchAnalytics();

    }, [fetchAnalytics]);

    // Financial Totals

    const financialTotals = useMemo(() => {

        const totalIncome =
            analytics.incomeExpenseData?.find(
                d => d.type?.toLowerCase() === 'income'
            )?.total || 0;

        const totalExpense =
            analytics.incomeExpenseData?.find(
                d => d.type?.toLowerCase() === 'expense'
            )?.total || 0;

        const incomeNum = Number(totalIncome);

        const expenseNum = Number(totalExpense);

        const balance =
            incomeNum - expenseNum;

        return {

            totalIncome: incomeNum,
            totalExpense: expenseNum,
            balance

        };

    }, [analytics.incomeExpenseData]);

    // Monthly Trend Data

    const trendData = useMemo(() => {

        return analytics.monthlyData.length > 0

            ? analytics.monthlyData.map(item => ({

                month: item.month,
                total: Number(item.total)

            }))

            : [];

    }, [analytics.monthlyData]);

    return (

        <div className="space-y-8">

            {/* Header */}

            <div className="flex justify-between items-center">

                <div>

                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">

                        Financial Insights

                    </h2>

                    <p className="text-sm text-gray-500 mt-1">

                        Real-time performance analytics

                    </p>

                </div>

                <div className="flex items-center space-x-3">

                    <button
                        onClick={fetchAnalytics}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm"
                        disabled={loading}
                    >

                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                    </button>

                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            source === 'cache'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                        }`}
                    >

                        Data Source: {source}

                    </span>

                </div>

            </div>

            {/* Metric Cards */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Balance */}

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">

                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">

                        <Wallet size={24} />

                    </div>

                    <div>

                        <p className="text-sm text-gray-400 font-medium uppercase">

                            Net Balance

                        </p>

                        <h3
                            className={`text-2xl font-bold ${
                                financialTotals.balance >= 0
                                    ? 'text-gray-800'
                                    : 'text-red-600'
                            }`}
                        >

                            ₹{financialTotals.balance}

                        </h3>

                    </div>

                </div>

                {/* Income */}

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">

                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">

                        <ArrowUpCircle size={24} />

                    </div>

                    <div>

                        <p className="text-sm text-gray-400 font-medium uppercase">

                            Total Income

                        </p>

                        <h3 className="text-2xl font-bold text-emerald-600">

                            ₹{financialTotals.totalIncome}

                        </h3>

                    </div>

                </div>

                {/* Expense */}

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">

                    <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">

                        <ArrowDownCircle size={24} />

                    </div>

                    <div>

                        <p className="text-sm text-gray-400 font-medium uppercase">

                            Total Expenses

                        </p>

                        <h3 className="text-2xl font-bold text-rose-600">

                            ₹{financialTotals.totalExpense}

                        </h3>

                    </div>

                </div>

            </div>

            {/* Charts */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Pie Chart */}

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                    <h3 className="text-lg font-bold text-gray-800 mb-2">

                        Category Breakdown

                    </h3>

                    <div className="h-64">

                        <ResponsiveContainer width="100%" height="100%">

                            <PieChart>

                                <Pie
                                    data={
                                        analytics.categoryData.map(item => ({
                                            ...item,
                                            total: Number(item.total)
                                        }))
                                    }
                                    dataKey="total"
                                    nameKey="category"
                                    outerRadius={75}
                                    label
                                >

                                    {analytics.categoryData.map(
                                        (_, index) => (

                                            <Cell
                                                key={index}
                                                fill={
                                                    COLORS[
                                                    index %
                                                    COLORS.length
                                                    ]
                                                }
                                            />

                                        )
                                    )}

                                </Pie>

                                <Tooltip />

                                <Legend />

                            </PieChart>

                        </ResponsiveContainer>

                    </div>

                </div>

                {/* Bar Chart */}

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                    <h3 className="text-lg font-bold text-gray-800 mb-2">

                        Income vs Expense

                    </h3>

                    <div className="h-64">

                        <ResponsiveContainer width="100%" height="100%">

                            <BarChart
                                data={analytics.incomeExpenseData}
                            >

                                <XAxis dataKey="type" />

                                <YAxis />

                                <Tooltip />

                                <Legend />

                                <Bar
                                    dataKey="total"
                                    radius={[4, 4, 0, 0]}
                                >

                                    {analytics.incomeExpenseData.map(
                                        (entry, index) => (

                                            <Cell
                                                key={index}
                                                fill={
                                                    entry.type?.toLowerCase() === 'income'
                                                        ? '#10B981'
                                                        : '#EF4444'
                                                }
                                            />

                                        )
                                    )}

                                </Bar>

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                </div>

                {/* Line Chart */}

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                    <h3 className="text-lg font-bold text-gray-800 mb-2">

                        Monthly Trends

                    </h3>

                    <div className="h-64">

                        <ResponsiveContainer width="100%" height="100%">

                            <LineChart data={trendData}>

                                <XAxis dataKey="month" />

                                <YAxis />

                                <Tooltip />

                                <Legend />

                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#8B5CF6"
                                    strokeWidth={3}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Dashboard;