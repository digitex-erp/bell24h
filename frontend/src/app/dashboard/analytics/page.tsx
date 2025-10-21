'use client'

import { useState } from 'react'
import { Card, Title, TabGroup, TabList, Tab, TabPanels, TabPanel } from '@tremor/react'
import OverviewMetrics from '@/components/analytics/OverviewMetrics'
import RfqAnalytics from '@/components/analytics/RfqAnalytics'
import WalletAnalytics from '@/components/analytics/WalletAnalytics'
import DisputeAnalytics from '@/components/analytics/DisputeAnalytics'

export default function AnalyticsDashboard() {
  const [selectedView, setSelectedView] = useState(0)

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Analytics Dashboard</Title>
      <TabGroup className="mt-6">
        <TabList>
          <Tab>Overview</Tab>
          <Tab>RFQ Analytics</Tab>
          <Tab>Wallet Analytics</Tab>
          <Tab>Dispute Analytics</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="mt-6">
              <OverviewMetrics />
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <RfqAnalytics />
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <WalletAnalytics />
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <DisputeAnalytics />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  )
}
