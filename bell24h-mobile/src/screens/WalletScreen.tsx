import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, TextInput, List, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store/store';
import { fetchWalletBalance, depositFunds, withdrawFunds } from '../store/slices/walletSlice';

const WalletScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { balance, transactions, loading, error } = useSelector((state: RootState) => state.wallet);
  const { user } = useSelector((state: RootState) => state.user);

  const [amount, setAmount] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchWalletBalance(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleDeposit = async () => {
    if (!amount || !user?.id) return;
    
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      await dispatch(depositFunds({ userId: user.id, amount: depositAmount })).unwrap();
      Alert.alert('Success', 'Funds deposited successfully!');
      setAmount('');
      setShowDeposit(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to deposit funds');
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !user?.id) return;
    
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (balance && withdrawAmount > balance.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    try {
      await dispatch(withdrawFunds({ userId: user.id, amount: withdrawAmount })).unwrap();
      Alert.alert('Success', 'Funds withdrawn successfully!');
      setAmount('');
      setShowWithdraw(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to withdraw funds');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !balance) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="wallet" size={32} color="#2563eb" />
        <Text style={styles.title}>Wallet</Text>
      </View>

      {/* Balance Card */}
      <Card style={styles.balanceCard}>
        <Card.Content>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>
            {balance ? formatCurrency(balance.balance) : '₹0.00'}
          </Text>
          <Text style={styles.balanceCurrency}>{balance?.currency || 'INR'}</Text>
          
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => setShowDeposit(true)}
              style={[styles.actionButton, styles.depositButton]}
              icon="plus"
            >
              Deposit
            </Button>
            <Button
              mode="outlined"
              onPress={() => setShowWithdraw(true)}
              style={[styles.actionButton, styles.withdrawButton]}
              icon="minus"
            >
              Withdraw
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Deposit Modal */}
      {showDeposit && (
        <Card style={styles.modalCard}>
          <Card.Content>
            <Text style={styles.modalTitle}>Deposit Funds</Text>
            <TextInput
              label="Amount (₹)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              mode="outlined"
              style={styles.amountInput}
            />
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowDeposit(false);
                  setAmount('');
                }}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleDeposit}
                loading={loading}
                style={styles.modalButton}
              >
                Deposit
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <Card style={styles.modalCard}>
          <Card.Content>
            <Text style={styles.modalTitle}>Withdraw Funds</Text>
            <TextInput
              label="Amount (₹)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              mode="outlined"
              style={styles.amountInput}
            />
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowWithdraw(false);
                  setAmount('');
                }}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleWithdraw}
                loading={loading}
                style={styles.modalButton}
              >
                Withdraw
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Transaction History */}
      <Card style={styles.transactionsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            transactions.slice(0, 10).map((transaction, index) => (
              <View key={transaction.id}>
                <List.Item
                  title={transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                  description={formatDate(transaction.timestamp)}
                  left={(props) => (
                    <Ionicons
                      name={transaction.type === 'deposit' ? 'arrow-down-circle' : 'arrow-up-circle'}
                      size={24}
                      color={transaction.type === 'deposit' ? '#10b981' : '#ef4444'}
                    />
                  )}
                  right={() => (
                    <View style={styles.transactionAmount}>
                      <Text
                        style={[
                          styles.transactionAmountText,
                          { color: transaction.type === 'deposit' ? '#10b981' : '#ef4444' }
                        ]}
                      >
                        {transaction.type === 'deposit' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </Text>
                      <Text style={styles.transactionBalance}>
                        Balance: {formatCurrency(transaction.newBalance)}
                      </Text>
                    </View>
                  )}
                />
                {index < transactions.length - 1 && <Divider />}
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#1f2937',
  },
  balanceCard: {
    margin: 16,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    marginVertical: 8,
  },
  balanceCurrency: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  depositButton: {
    backgroundColor: '#10b981',
  },
  withdrawButton: {
    borderColor: '#ef4444',
  },
  modalCard: {
    margin: 16,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  amountInput: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  transactionsCard: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionBalance: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});

export default WalletScreen; 