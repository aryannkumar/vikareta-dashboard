'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Loading } from '../../../../components/ui/loading';
import { apiClient } from '../../../../lib/api/client';
import { formatCurrency } from '../../../../lib/utils';
import type { WalletBalance, WalletTransaction } from '../../../../types';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const PAYMENT_METHODS = [
  {
    id: 'upi',
    name: 'UPI',
    icon: Smartphone,
    description: 'Pay using UPI apps like GPay, PhonePe, Paytm',
    fees: 0,
    processingTime: 'Instant'
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, RuPay cards accepted',
    fees: 2.5,
    processingTime: 'Instant'
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    icon: Building,
    description: 'All major banks supported',
    fees: 0,
    processingTime: 'Instant'
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    icon: Wallet,
    description: 'Paytm, PhonePe, Amazon Pay',
    fees: 0,
    processingTime: 'Instant'
  }
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function AddMoneyPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);

      // Fetch real wallet balance
      const balanceResponse = await apiClient.get('/wallet/balance');
      if (balanceResponse.success && balanceResponse.data) {
        setBalance(balanceResponse.data as WalletBalance);
      } else {
        // Fallback balance
        setBalance({
          availableBalance: 0,
          lockedBalance: 0,
          totalBalance: 0,
          negativeBalance: 0
        });
      }

      // Fetch recent transactions
      const transactionsResponse = await apiClient.getRecentWalletTransactions(5);
      if (transactionsResponse.success && transactionsResponse.data) {
        setRecentTransactions(transactionsResponse.data as WalletTransaction[]);
      } else {
        // Fallback empty transactions
        setRecentTransactions([]);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) < 10) {
      alert('Minimum amount is ₹10');
      return;
    }

    if (parseFloat(amount) > 100000) {
      alert('Maximum amount is ₹1,00,000');
      return;
    }

    try {
      setProcessing(true);
      const response = await apiClient.addMoneyToWallet(parseFloat(amount), selectedMethod);

      if (response.success && response.data) {
        const data = response.data as any;
        // Redirect to payment gateway
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          // Handle successful direct payment
          alert('Money added successfully!');
          router.push('/dashboard/wallet');
        }
      } else {
        const errorMessage = response.error?.message || 'Failed to initiate payment. Please try again.';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error adding money:', error);
      alert('Failed to add money. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const calculateFees = (amount: number, method: string) => {
    const paymentMethod = PAYMENT_METHODS.find(m => m.id === method);
    if (!paymentMethod || paymentMethod.fees === 0) return 0;
    return (amount * paymentMethod.fees) / 100;
  };

  const amountValue = parseFloat(amount) || 0;
  const fees = calculateFees(amountValue, selectedMethod);
  const totalAmount = amountValue + fees;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Money to Wallet</h1>
          <p className="text-gray-600">Fund your wallet using secure payment methods</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Balance */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(balance?.availableBalance || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Amount Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Amount</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="10"
                  max="100000"
                  className="text-lg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum: ₹10 | Maximum: ₹1,00,000
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Quick Select</p>
                <div className="grid grid-cols-5 gap-2">
                  {QUICK_AMOUNTS.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="text-sm"
                    >
                      ₹{quickAmount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>

            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${selectedMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                        <Icon className={`h-5 w-5 ${selectedMethod === method.id ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{method.name}</h4>
                          <div className="flex items-center gap-2">
                            {method.fees > 0 && (
                              <span className="text-sm text-orange-600">
                                {method.fees}% fee
                              </span>
                            )}
                            <span className="text-sm text-green-600">
                              {method.processingTime}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium">{formatCurrency(amountValue)}</span>
              </div>

              {fees > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-medium text-orange-600">{formatCurrency(fees)}</span>
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-semibold text-lg">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-6"
              onClick={handleAddMoney}
              disabled={!amount || processing || amountValue < 10}
            >
              {processing ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Proceed to Pay
                </>
              )}
            </Button>

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Secure Payment</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Powered by Cashfree with bank-grade security
              </p>
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Additions</h3>

            <div className="space-y-3">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent transactions
                </p>
              )}
            </div>
          </Card>

          {/* Security Notice */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Security Notice</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Your payment is processed securely through Cashfree. We never store your payment details.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}