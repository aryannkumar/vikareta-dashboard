'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { Loading } from '../../../../components/ui/loading';
import { Badge } from '../../../../components/ui/badge';
// import { WalletService } from '../../../../lib/api/services/wallet.service';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import type { WalletBalance, BankAccount, WithdrawalRequest } from '../../../../types';
import { 
  ArrowLeft, 
  CreditCard, 
  Plus,
  Shield,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

export default function WithdrawPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [amount, setAmount] = useState('');
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBankAccount, setNewBankAccount] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    accountType: 'savings' as 'savings' | 'current'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls when backend is ready
      // Mock wallet balance
      const mockBalance: WalletBalance = {
        availableBalance: 125000,
        lockedBalance: 25000,
        negativeBalance: 0,
        totalBalance: 150000
      };

      // Mock bank accounts
      const mockBankAccounts: BankAccount[] = [
        {
          id: 'bank-1',
          userId: 'user-1',
          accountHolderName: 'John Doe',
          accountNumber: '1234567890',
          ifscCode: 'HDFC0001234',
          bankName: 'HDFC Bank',
          branchName: 'Main Branch',
          accountType: 'savings',
          isVerified: true,
          isPrimary: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'bank-2',
          userId: 'user-1',
          accountHolderName: 'John Doe',
          accountNumber: '0987654321',
          ifscCode: 'ICIC0001234',
          bankName: 'ICICI Bank',
          branchName: 'Secondary Branch',
          accountType: 'current',
          isVerified: true,
          isPrimary: false,
          createdAt: '2024-01-02T00:00:00Z'
        }
      ];

      // Mock withdrawal requests
      const mockWithdrawals: WithdrawalRequest[] = [
        {
          id: 'withdraw-1',
          walletId: 'wallet-1',
          bankAccountId: 'bank-1',
          amount: 10000,
          status: 'completed',
          processedAt: '2024-01-10T00:00:00Z',
          createdAt: '2024-01-10T00:00:00Z'
        },
        {
          id: 'withdraw-2',
          walletId: 'wallet-1',
          bankAccountId: 'bank-1',
          amount: 5000,
          status: 'pending',
          createdAt: '2024-01-15T00:00:00Z'
        }
      ];

      setBalance(mockBalance);
      setBankAccounts(mockBankAccounts);
      setWithdrawals(mockWithdrawals);
      
      // Auto-select primary bank account
      const primaryAccount = mockBankAccounts.find(acc => acc.isPrimary);
      if (primaryAccount) {
        setSelectedBankAccount(primaryAccount.id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBankAccount = async () => {
    if (!newBankAccount.accountHolderName || !newBankAccount.accountNumber || !newBankAccount.ifscCode) {
      alert('Please fill all required fields');
      return;
    }

    try {
      // TODO: Implement actual bank account addition
      // const response = await WalletService.addBankAccount(newBankAccount);
      
      // Mock success for now
      const mockBankAccount: BankAccount = {
        id: `bank-${Date.now()}`,
        userId: 'user-1',
        ...newBankAccount,
        isVerified: false,
        isPrimary: false,
        createdAt: new Date().toISOString()
      };
      
      setBankAccounts([...bankAccounts, mockBankAccount]);
      setNewBankAccount({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        accountType: 'savings'
      });
      setShowAddBank(false);
      setSelectedBankAccount(mockBankAccount.id);
      alert('Bank account added successfully');
    } catch (error) {
      console.error('Error adding bank account:', error);
      alert('Failed to add bank account');
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!selectedBankAccount) {
      alert('Please select a bank account');
      return;
    }

    const amountValue = parseFloat(amount);
    if (amountValue < 100) {
      alert('Minimum withdrawal amount is ₹100');
      return;
    }

    if (amountValue > (balance?.availableBalance || 0)) {
      alert('Insufficient balance');
      return;
    }

    try {
      setProcessing(true);
      // TODO: Implement actual withdrawal request
      // const response = await WalletService.requestWithdrawal(amountValue, selectedBankAccount);
      
      // Mock success for now
      alert('Withdrawal request submitted successfully');
      setAmount('');
      loadData(); // Reload data to show new withdrawal request
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      alert('Failed to request withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelWithdrawal = async (withdrawalId: string) => {
    try {
      // TODO: Implement actual withdrawal cancellation
      // const response = await WalletService.cancelWithdrawal(withdrawalId);
      
      // Mock success for now
      alert(`Withdrawal ${withdrawalId} cancelled successfully`);
      loadData();
    } catch (error) {
      console.error('Error cancelling withdrawal:', error);
      alert('Failed to cancel withdrawal');
    }
  };

  const getWithdrawalStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdraw Money</h1>
          <p className="text-gray-600">Transfer money from your wallet to bank account</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Balance */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(balance?.availableBalance || 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Locked Balance</p>
                <p className="text-lg font-semibold text-yellow-600">
                  {formatCurrency(balance?.lockedBalance || 0)}
                </p>
              </div>
            </div>
          </Card>

          {/* Withdrawal Form */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdrawal Details</h3>
            
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
                  min="100"
                  max={balance?.availableBalance || 0}
                  className="text-lg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum: ₹100 | Available: {formatCurrency(balance?.availableBalance || 0)}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Bank Account
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddBank(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Account
                  </Button>
                </div>
                
                {bankAccounts.length > 0 ? (
                  <Select
                    value={selectedBankAccount}
                    onValueChange={setSelectedBankAccount}
                  >
                    <option value="">Select bank account</option>
                    {bankAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.bankName} - {account.accountNumber.slice(-4)} 
                        {account.isPrimary && ' (Primary)'}
                        {account.isVerified ? ' ✓' : ' (Unverified)'}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No bank accounts added</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setShowAddBank(true)}
                    >
                      Add Bank Account
                    </Button>
                  </div>
                )}
              </div>

              {selectedBankAccount && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  {(() => {
                    const account = bankAccounts.find(acc => acc.id === selectedBankAccount);
                    return account ? (
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-blue-900">{account.bankName}</h4>
                          {account.isVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <p className="text-sm text-blue-800">
                          {account.accountHolderName} - {account.accountNumber}
                        </p>
                        <p className="text-sm text-blue-700">{account.ifscCode}</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleWithdraw}
                disabled={!amount || !selectedBankAccount || processing || parseFloat(amount) < 100}
              >
                {processing ? (
                  <>
                    <Loading size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Request Withdrawal
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Add Bank Account Modal */}
          {showAddBank && (
            <Card className="p-6 border-blue-200 bg-blue-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Bank Account</h3>
                <Button variant="outline" size="sm" onClick={() => setShowAddBank(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Holder Name *
                  </label>
                  <Input
                    value={newBankAccount.accountHolderName}
                    onChange={(e) => setNewBankAccount({...newBankAccount, accountHolderName: e.target.value})}
                    placeholder="Full name as per bank"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number *
                  </label>
                  <Input
                    value={newBankAccount.accountNumber}
                    onChange={(e) => setNewBankAccount({...newBankAccount, accountNumber: e.target.value})}
                    placeholder="Bank account number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IFSC Code *
                  </label>
                  <Input
                    value={newBankAccount.ifscCode}
                    onChange={(e) => setNewBankAccount({...newBankAccount, ifscCode: e.target.value.toUpperCase()})}
                    placeholder="IFSC code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <Input
                    value={newBankAccount.bankName}
                    onChange={(e) => setNewBankAccount({...newBankAccount, bankName: e.target.value})}
                    placeholder="Bank name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Name
                  </label>
                  <Input
                    value={newBankAccount.branchName}
                    onChange={(e) => setNewBankAccount({...newBankAccount, branchName: e.target.value})}
                    placeholder="Branch name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <Select
                    value={newBankAccount.accountType}
                    onValueChange={(value) => setNewBankAccount({...newBankAccount, accountType: value as 'savings' | 'current'})}
                  >
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button onClick={handleAddBankAccount}>
                  Add Account
                </Button>
                <Button variant="outline" onClick={() => setShowAddBank(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Withdrawal Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdrawal Info</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Time</span>
                <span className="font-medium">1-3 business days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Minimum Amount</span>
                <span className="font-medium">₹100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Limit</span>
                <span className="font-medium">₹50,000</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Secure Transfer</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Powered by Cashfree with bank-grade security
              </p>
            </div>
          </Card>

          {/* Recent Withdrawals */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Withdrawals</h3>
            
            <div className="space-y-3">
              {withdrawals.length > 0 ? (
                withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{formatCurrency(withdrawal.amount)}</span>
                      {getWithdrawalStatusBadge(withdrawal.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatDate(withdrawal.createdAt)}
                    </p>
                    {withdrawal.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-red-600 hover:text-red-700"
                        onClick={() => handleCancelWithdrawal(withdrawal.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent withdrawals
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}