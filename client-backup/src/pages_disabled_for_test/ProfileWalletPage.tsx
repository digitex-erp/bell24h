import React from 'react';
import WalletBankForm from '../components/WalletBankForm';

// Replace with your actual user context or prop
const currentUserId = 'USER_ID_FROM_CONTEXT';

const ProfileWalletPage: React.FC = () => {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>Wallet & Bank Account Setup</h2>
      <WalletBankForm userId={currentUserId} />
    </div>
  );
};

export default ProfileWalletPage;
