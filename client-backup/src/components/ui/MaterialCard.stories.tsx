import type { Meta, StoryObj } from '@storybook/react';
import { MaterialCard } from './MaterialCard';
import { Typography, Button, CardContent, Box } from '@mui/material';
import { PrimaryButton } from './PrimaryButton';

const meta: Meta<typeof MaterialCard> = {
  title: 'Components/Atoms/Surfaces/MaterialCard',
  component: MaterialCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['elevation', 'outlined'],
    },
    elevation: {
      control: { type: 'number', min: 0, max: 24 },
    },
    square: { control: 'boolean' },
    hoverEffect: { control: 'boolean' },
  },
  args: {
    variant: 'elevation',
    elevation: 2,
    square: false,
    hoverEffect: true,
  },
};

export default meta;
type Story = StoryObj<typeof MaterialCard>;

const CardContentExample = () => (
  <CardContent>
    <Typography variant="h6" component="div" gutterBottom>
      Card Title
    </Typography>
    <Typography variant="body2" color="text.secondary" paragraph>
      This is a simple example of card content. You can put any React node inside the card.
    </Typography>
    <Box display="flex" justifyContent="flex-end" gap={1}>
      <Button size="small" color="inherit">
        Cancel
      </Button>
      <PrimaryButton size="small">
        Action
      </PrimaryButton>
    </Box>
  </CardContent>
);

export const Default: Story = {
  render: (args) => (
    <MaterialCard {...args}>
      <CardContentExample />
    </MaterialCard>
  ),
};

export const Variants: Story = {
  render: () => (
    <Box display="grid" gap={3} gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))">
      <MaterialCard variant="elevation" elevation={2}>
        <CardContentExample />
      </MaterialCard>
      <MaterialCard variant="outlined">
        <CardContentExample />
      </MaterialCard>
    </Box>
  ),
};

export const ElevationLevels: Story = {
  render: () => (
    <Box display="grid" gap={3} gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))">
      {[0, 2, 4, 8, 16, 24].map((elevation) => (
        <MaterialCard key={elevation} elevation={elevation}>
          <CardContent>
            <Typography variant="subtitle2">Elevation: {elevation}</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Adjust the elevation to see the shadow effect.
            </Typography>
          </CardContent>
        </MaterialCard>
      ))}
    </Box>
  ),
};

export const HoverEffect: Story = {
  args: {
    hoverEffect: true,
  },
  render: (args) => (
    <Box display="grid" gap={3} gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))">
      <MaterialCard {...args}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Hover Effect
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hover over this card to see the effect. The card will lift and show a stronger shadow.
          </Typography>
        </CardContent>
      </MaterialCard>
    </Box>
  ),
};

export const WithMedia: Story = {
  render: () => (
    <MaterialCard>
      <Box
        component="img"
        src="https://source.unsplash.com/random/600x300?nature"
        alt="Random nature"
        sx={{
          width: '100%',
          height: 140,
          objectFit: 'cover',
        }}
      />
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Nature Card
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This card includes a media element at the top.
        </Typography>
      </CardContent>
    </MaterialCard>
  ),
};

export const ComplexExample: Story = {
  render: () => (
    <MaterialCard sx={{ maxWidth: 345 }}>
      <Box
        component="img"
        src="https://source.unsplash.com/random/600x400?technology"
        alt="Technology"
        sx={{
          width: '100%',
          height: 200,
          objectFit: 'cover',
        }}
      />
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Advanced Technology
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This is a more complex card example with multiple content sections and actions.
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="caption" color="text.secondary">
            Updated 2 days ago
          </Typography>
          <Box display="flex" gap={1}>
            <Button size="small" color="inherit">
              Share
            </Button>
            <PrimaryButton size="small">
              Learn More
            </PrimaryButton>
          </Box>
        </Box>
      </CardContent>
    </MaterialCard>
  ),
};
