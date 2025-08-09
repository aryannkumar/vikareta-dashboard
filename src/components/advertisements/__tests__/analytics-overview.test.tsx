import { render, screen } from '@testing-library/react';
import { AnalyticsOverview } from '../analytics-overview';
import { AdAnalytics } from '@/types';

const mockAnalytics: AdAnalytics[] = [
  {
    id: '1',
    campaignId: 'campaign-1',
    date: '2024-01-01',
    impressions: 10000,
    clicks: 200,
    conversions: 10,
    spend: 500,
    revenue: 1000,
    ctr: 2.0,
    cpc: 2.5,
    cpm: 50,
    roas: 2.0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    campaignId: 'campaign-2',
    date: '2024-01-02',
    impressions: 5000,
    clicks: 100,
    conversions: 5,
    spend: 250,
    revenue: 500,
    ctr: 2.0,
    cpc: 2.5,
    cpm: 50,
    roas: 2.0,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
];

describe('AnalyticsOverview', () => {
  const defaultProps = {
    analytics: mockAnalytics,
    dateRange: '30d',
    loading: false,
  };

  it('renders performance overview with aggregated metrics', () => {
    render(<AnalyticsOverview {...defaultProps} />);
    
    expect(screen.getByText('Performance Overview')).toBeInTheDocument();
    expect(screen.getByText('30 days')).toBeInTheDocument();
  });

  it('displays correct aggregated totals', () => {
    render(<AnalyticsOverview {...defaultProps} />);
    
    // Total impressions: 10000 + 5000 = 15000
    expect(screen.getByText('15,000')).toBeInTheDocument();
    
    // Total clicks: 200 + 100 = 300
    expect(screen.getByText('300')).toBeInTheDocument();
    
    // Total conversions: 10 + 5 = 15
    expect(screen.getByText('15')).toBeInTheDocument();
    
    // Total spend: 500 + 250 = 750
    expect(screen.getByText('₹750')).toBeInTheDocument();
    
    // Total revenue: 1000 + 500 = 1500
    expect(screen.getByText('₹1,500')).toBeInTheDocument();
  });

  it('calculates and displays correct averages', () => {
    render(<AnalyticsOverview {...defaultProps} />);
    
    // CTR: (300 / 15000) * 100 = 2.0%
    expect(screen.getByText('2.0%')).toBeInTheDocument();
    
    // CPC: 750 / 300 = 2.5
    expect(screen.getByText('₹2.50')).toBeInTheDocument();
    
    // CPM: (750 / 15000) * 1000 = 50
    expect(screen.getByText('₹50.00')).toBeInTheDocument();
    
    // ROAS: 1500 / 750 = 2.0
    expect(screen.getByText('2.00x')).toBeInTheDocument();
    
    // Conversion Rate: (15 / 300) * 100 = 5.0%
    expect(screen.getByText('5.0%')).toBeInTheDocument();
  });

  it('applies correct theme colors to metrics', () => {
    render(<AnalyticsOverview {...defaultProps} />);
    
    // Check for blue theme on impressions and clicks
    const impressionsElement = screen.getByText('15,000');
    expect(impressionsElement).toHaveClass('text-ad-blue');
    
    const clicksElement = screen.getByText('300');
    expect(clicksElement).toHaveClass('text-ad-blue');
    
    // Check for orange theme on spend
    const spendElement = screen.getByText('₹750');
    expect(spendElement).toHaveClass('text-ad-orange');
    
    // Check for success theme on conversions
    const conversionsElement = screen.getByText('15');
    expect(conversionsElement).toHaveClass('text-ad-status-success');
  });

  it('shows performance indicators with correct status colors', () => {
    render(<AnalyticsOverview {...defaultProps} />);
    
    // CTR of 2.0% should show green (good performance)
    const ctrIndicator = screen.getByText('Click-through Rate').closest('div')?.querySelector('.w-2.h-2');
    expect(ctrIndicator).toHaveClass('bg-ad-status-success');
    
    // Conversion rate of 5.0% should show green (good performance)
    const conversionIndicator = screen.getByText('Conversion Rate').closest('div')?.querySelector('.w-2.h-2');
    expect(conversionIndicator).toHaveClass('bg-ad-status-success');
    
    // ROAS of 2.0x should show yellow (moderate performance)
    const roasIndicator = screen.getByText('Return on Ad Spend').closest('div')?.querySelector('.w-2.h-2');
    expect(roasIndicator).toHaveClass('bg-ad-status-pending');
  });

  it('shows loading state when loading prop is true', () => {
    render(<AnalyticsOverview {...defaultProps} loading={true} />);
    
    // Should show loading component instead of metrics
    expect(screen.queryByText('Performance Overview')).not.toBeInTheDocument();
  });

  it('shows no data message when analytics array is empty', () => {
    render(<AnalyticsOverview {...defaultProps} analytics={[]} />);
    
    expect(screen.getByText('No analytics data available for the selected period')).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    const zeroAnalytics: AdAnalytics[] = [
      {
        id: '1',
        campaignId: 'campaign-1',
        date: '2024-01-01',
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0,
        revenue: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        roas: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];

    render(<AnalyticsOverview {...defaultProps} analytics={zeroAnalytics} />);
    
    expect(screen.getByText('0')).toBeInTheDocument(); // Impressions
    expect(screen.getByText('₹0')).toBeInTheDocument(); // Spend
    expect(screen.getByText('0.0%')).toBeInTheDocument(); // CTR
  });

  it('formats date range display correctly', () => {
    render(<AnalyticsOverview {...defaultProps} dateRange="7d" />);
    expect(screen.getByText('7 days')).toBeInTheDocument();
    
    render(<AnalyticsOverview {...defaultProps} dateRange="90d" />);
    expect(screen.getByText('90 days')).toBeInTheDocument();
  });

  it('shows poor performance indicators with red color', () => {
    const poorPerformanceAnalytics: AdAnalytics[] = [
      {
        id: '1',
        campaignId: 'campaign-1',
        date: '2024-01-01',
        impressions: 10000,
        clicks: 50, // Low CTR (0.5%)
        conversions: 1, // Low conversion rate (2%)
        spend: 1000,
        revenue: 500, // Low ROAS (0.5x)
        ctr: 0.5,
        cpc: 20,
        cpm: 100,
        roas: 0.5,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];

    render(<AnalyticsOverview {...defaultProps} analytics={poorPerformanceAnalytics} />);
    
    // CTR of 0.5% should show red (poor performance)
    const ctrIndicator = screen.getByText('Click-through Rate').closest('div')?.querySelector('.w-2.h-2');
    expect(ctrIndicator).toHaveClass('bg-ad-status-rejected');
    
    // ROAS of 0.5x should show red (poor performance)
    const roasIndicator = screen.getByText('Return on Ad Spend').closest('div')?.querySelector('.w-2.h-2');
    expect(roasIndicator).toHaveClass('bg-ad-status-rejected');
  });

  it('displays sub-metrics correctly', () => {
    render(<AnalyticsOverview {...defaultProps} />);
    
    // Check for CPM display under impressions
    expect(screen.getByText('CPM: ₹50.00')).toBeInTheDocument();
    
    // Check for CTR display under clicks
    expect(screen.getByText('CTR: 2.0%')).toBeInTheDocument();
    
    // Check for conversion rate display under conversions
    expect(screen.getByText('Rate: 5.0%')).toBeInTheDocument();
    
    // Check for CPC display under spend
    expect(screen.getByText('CPC: ₹2.50')).toBeInTheDocument();
    
    // Check for revenue display under ROAS
    expect(screen.getByText('Revenue: ₹1,500')).toBeInTheDocument();
  });
});