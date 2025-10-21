'use client'

import { Card, Text, Metric, Flex, Grid } from '@tremor/react'
import { AreaChart, LineChart } from '@tremor/react'
import { useState, useEffect } from 'react'

const chartdata = [
  {
    date: '2024-01',
    'Total RFQs': 2890,
    'Completed RFQs': 2400,
    'Active Users': 1800,
  },
  {
    date: '2024-02',
    'Total RFQs': 3200,
    'Completed RFQs': 2800,
    'Active Users': 2100,
  },
  {
    date: '2024-03',
    'Total RFQs': 3500,
    'Completed RFQs': 3100,
    'Active Users': 2400,
  },
  {
    date: '2024-04',
    'Total RFQs': 3800,
    'Completed RFQs': 3300,
    'Active Users': 2700,
  },
]

const metrics = [
  {
    title: 'Total Users',
    metric: '12,699',
    subtext: '+15.2% from last month',
  },
  {
    title: 'Active RFQs',
    metric: '2,342',
    subtext: '+22.4% from last month',
  },
  {
    title: 'Total Transaction Value',
    metric: '₹4.2Cr',
    subtext: '+8.1% from last month',
  },
  {
    title: 'Success Rate',
    metric: '94.2%',
    subtext: '+2.3% from last month',
  },
]

export default function OverviewMetrics() {
  return (
    <div className="space-y-6">
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        {metrics.map((item) => (
          <Card key={item.title}>
            <Text>{item.title}</Text>
            <Metric>{item.metric}</Metric>
            <Text className="text-green-500">{item.subtext}</Text>
          </Card>
        ))}
      </Grid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <Text>Platform Growth</Text>
          <AreaChart
            className="mt-4 h-72"
            data={chartdata}
            index="date"
            categories={['Total RFQs', 'Completed RFQs', 'Active Users']}
            colors={['indigo', 'cyan', 'green']}
            valueFormatter={(number: number) => 
              Intl.NumberFormat('en-IN').format(number).toString()
            }
            yAxisWidth={48}
          />
        </Card>

        <Card>
          <Text>Success Metrics</Text>
          <LineChart
            className="mt-4 h-72"
            data={chartdata}
            index="date"
            categories={['Total RFQs', 'Completed RFQs']}
            colors={['indigo', 'green']}
            valueFormatter={(number: number) => 
              Intl.NumberFormat('en-IN').format(number).toString()
            }
            yAxisWidth={48}
          />
        </Card>
      </div>
    </div>
  )
}
