// MyPaymentsPage - User payments history
import { useState, useEffect } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Check, Clock, X } from 'lucide-react';
import { formatPrice } from '../utils/helpers';

function MyPaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [filter, setFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const { paymentService } = await import('../services/api.js');
                const result = await paymentService.getPaymentHistory();
                if (result.ok) {
                    setPayments(result.data.payments || result.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <Check className="w-5 h-5 text-green-500" />;
            case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'failed': return <X className="w-5 h-5 text-red-500" />;
            default: return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const filteredPayments = filter === 'all' 
        ? payments 
        : payments.filter(p => p.status === filter);

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes paiements</h1>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-6">
                        <p className="text-sm text-gray-500 mb-1">Total payé</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatPrice(payments.filter(p => p.status === 'completed' && p.type === 'out').reduce((sum, p) => sum + p.amount, 0))} FCFA
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6">
                        <p className="text-sm text-gray-500 mb-1">Total reçu</p>
                        <p className="text-2xl font-bold text-green-600">
                            {formatPrice(payments.filter(p => p.status === 'completed' && p.type === 'in').reduce((sum, p) => sum + p.amount, 0))} FCFA
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6">
                        <p className="text-sm text-gray-500 mb-1">En attente</p>
                        <p className="text-2xl font-bold text-yellow-600">
                            {formatPrice(payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0))} FCFA
                        </p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex gap-2 mb-6">
                    {['all', 'completed', 'pending', 'failed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === f 
                                    ? 'bg-orange-500 text-white' 
                                    : 'bg-white text-gray-700 border border-gray-200'
                            }`}
                        >
                            {f === 'all' ? 'Tous' : f === 'completed' ? 'Complétés' : f === 'pending' ? 'En attente' : 'Échoués'}
                        </button>
                    ))}
                </div>

                {/* Payments List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredPayments.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        {filteredPayments.map(payment => (
                            <div key={payment.id} className="p-4 border-b border-gray-100 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    payment.type === 'in' ? 'bg-green-100' : 'bg-gray-100'
                                }`}>
                                    {payment.type === 'in' 
                                        ? <ArrowDownLeft className="w-6 h-6 text-green-600" />
                                        : <ArrowUpRight className="w-6 h-6 text-gray-600" />
                                    }
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{payment.description}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${payment.type === 'in' ? 'text-green-600' : 'text-gray-900'}`}>
                                        {payment.type === 'in' ? '+' : '-'}{formatPrice(payment.amount)} FCFA
                                    </p>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        {getStatusIcon(payment.status)}
                                        <span className="text-sm text-gray-500">{payment.method}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl">
                        <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aucun paiement</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyPaymentsPage;
