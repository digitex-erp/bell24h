import React from 'react';
import { NextPage } from 'next';
import { Card, PageHeader, Spin } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { WalletProvider } from '@/providers/WalletProvider';

// Dynamically import the WalletDashboard component with no SSR
const WalletDashboard = dynamic(
  () => import('@/components/wallet/WalletDashboard'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Spin size="large" />
      </div>
    )
  }
);

const WalletPage: NextPage = () => {
  return (
    <WalletProvider>
      <div className="wallet-page">
        <Head>
          <title>My Wallet - Bell24H</title>
          <meta name="description" content="Manage your wallet and view transaction history" />
        </Head>

        <PageHeader
          title={
            <>
              <WalletOutlined style={{ marginRight: 8 }} />
              My Wallet
            </>
          }
          subTitle="Manage your funds and view transaction history"
          style={{ padding: 0, marginBottom: 24 }}
        />

        <Card className="wallet-container">
          <WalletDashboard />
        </Card>
      </div>
    </WalletProvider>
  );
};

export default WalletPage;
