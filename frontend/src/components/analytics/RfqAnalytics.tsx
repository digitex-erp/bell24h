'use client'

import { Card, Text, BarChart, DonutChart, Title, Grid } from '@tremor/react'
import { Select, SelectItem } from '@tremor/react'
import { useState } from 'react'

const categories = [
  'Electronics',
  'Industrial Equipment',
  'Raw Materials',
  'Office Supplies',
  'Construction',
]

const categoryData = [
  {
    category: 'Electronics',
    'Total Value': 2400000,
    'Average Response Time': 48,
    'Success Rate': 92,
  },
  {
    category: 'Industrial Equipment',
    'Total Value': 1800000,
    'Average Response Time': 72,
    'Success Rate': 88,
  },
  {
    category: 'Raw Materials',
    'Total Value': 3200000,
    'Average Response Time': 36,
    'Success Rate': 95,
  },
  {
    category: 'Office Supplies',
    'Total Value': 800000,
    'Average Response Time': 24,
    'Success Rate': 97,
  },
  {
    category: 'Construction',
    'Total Value': 2900000,
    'Average Response Time': 60,
    'Success Rate': 90,
  },
]

const statusData = [
  {
    name: 'Open',
    value: 340,
  },
  {
    name: 'In Progress',
    value: 245,
  },
  {
    name: 'Completed',
    value: 890,
  },
  {
    name: 'Cancelled',
    value: 45,
  },
]

const valueFormatter = (number: number) => 
  '₹ ' + Intl.NumberFormat('en-IN').format(number).toString()

export default function RfqAnalytics() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title>RFQ Performance by Category</Title>
        <Select
          className="max-w-xs"
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </Select>
      </div>

      <Grid numItems={1} numItemsSm={2} numItemsLg={2} className="gap-6">
        <Card>
          <Text>RFQ Value by Category</Text>
          <BarChart
            className="mt-4 h-80"
            data={categoryData}
            index="category"
            categories={['Total Value']}
            colors={['indigo']}
            valueFormatter={valueFormatter}
            yAxisWidth={100}
          />
        </Card>

        <Card>
          <Text>RFQ Status Distribution</Text>
          <DonutChart
            className="mt-4 h-80"
            data={statusData}
            category="value"
            index="name"
            valueFormatter={(value) => `${value} RFQs`}
            colors={['emerald', 'yellow', 'blue', 'red']}
          />
        </Card>

        <Card>
          <Text>Average Response Time (Hours)</Text>
          <BarChart
            className="mt-4 h-80"
            data={categoryData}
            index="category"
            categories={['Average Response Time']}
            colors={['cyan']}
            valueFormatter={(value) => `${value}h`}
            yAxisWidth={48}
          />
        </Card>

        <Card>
          <Text>Success Rate by Category</Text>
          <BarChart
            className="mt-4 h-80"
            data={categoryData}
            index="category"
            categories={['Success Rate']}
            colors={['green']}
            valueFormatter={(value) => `${value}%`}
            yAxisWidth={48}
          />
        </Card>
      </Grid>
    </div>
  )
}
