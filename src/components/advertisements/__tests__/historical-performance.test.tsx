import { render, screen, fireEvent } from '@testing-library/react';
import { HistoricalPerformance } from '../historical-performance';
import { AdAnalytics } from '@/types';

const mockAnalytics: AdAnalytics[] = [
  {
    id: '1',
    campaignId: 'campaign-1',
    date: '2024-01-01',
    impressions: 1000,
    clicks: 20,
    conversions: 2,
    spend: 50,
    revenue: 100,
    ctr: 2.0,
    cpc: 2.5,
    cpm: 50,
    roas: 2.0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    campaignId: 'campaign-1',
    date: '2024-01-02',
    impressions: 1500,
    clicks: 30,
    conversions: 3,
    spend: 75,
    revenue: 150,
    ctr: 2.0,
    cpc: 2.5,
    cpm: 50,
    roas: 2.0,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
  {
    id: '3',
    campaignId: 'campaign-1',
    date: '2024-01-03',
    impressions: 2000,
    clicks: 40,
    conversions: 4,
    spend: 100,
    revenue: 200,
    ctr: 2.0,
    cpc: 2.5,
    cpm: 50,
    roas: 2.0,
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03',
  },
  {
    id: '4',
    campaignId: 'campaign-2',
    date: '2024-01-01',
    impressions: 800,
    clicks: 16,
    conversions: 1,
    spend: 40,
    revenue: 50,
    ctr: 2.0,
    cpc: 2.5,
    cpm: 50,
    roas: 1.25,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

describe('HistoricalPerformance', () => {
  const defaultProps = {
    analytics: mockAnalytics,
    dateRange: '30d',
  };

  it('renders historical performance component', () => {
    render(<HistoricalPerformance {...defaultProps} />);
    
    expect(screen.getByText('Historical Performance')).toBeInTheDocument();
    expect(screen.getByText('Analyze trends and patterns over time')).toBeInTheDocument();
  });

  it('displays metric and view type selectors', () => {
    render(<HistoricalPerformance {...defaultProps} />);
    
    // Check for metric selector options
    expect(screen.getByDisplayValue('Impressions')).toBeInTheDocument();
    
    // Check for view type selector options
    expect(screen.getByDisplayValue('Daily')).toBeInTheDocument();
  });

  it('processes daily data correctly by default', () => {
    render(<HistoricalPerformance {...defaultProps} />);
    
    // Should show data for each day
    expect(screen.getByText('Jan 1')).toBeInTheDocument();
    expect(screen.getByText('Jan 2')).toBeInTheDocument();
    expect(screen.getByText('Jan 3')).toBeInTheDocument();
    
    // Should aggregate data for same dates
    // Jan 1: 1000 + 800 = 1800 impressions
    expect(screen.getByText('1,800')).toBeInTheDocument();
    // Jan 2: 1500 impressions
    expect(screen.getByText('1,500')).toBeInTheDocument();
    // Jan 3: 2000 impressions
    expect(screen.getByText('2,000')).toBeInTheDocument();
  });

  it('changes metric when selector is updated', () => {
    render(<HistoricalPerformance {...defaultProps} />);
    
    // Change to clicks metric
    const metricSelector = screen.getByDisplayValue('Impressions');
    fireEvent.change(metricSelector, { target: { value: 'clicks' } });
    
    // Should now show click data
    // Jan 1: 20 + 16 = 36 clicks
    expect(screen.getByText('36')).toBeInTheDocument();
    // Jan 2: 30 clicks
    expect(screen.getByText('30')).toBeInTheDocument();
    // Jan 3: 40 clicks
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('changes view type when selector is updated', () => {
    render(<HistoricalPerformance {...defaultProps} />);
    
    // Change to weekly view
    const viewSelector = screen.getByDisplayValue('Daily');
    fireEvent.change(viewSelector, { target: { value: 'weekly' } });
    
    // Should show weekly aggregated data
    expect(screen.getByText(/Week of/)).toBeInTheDocument();
  });

  it('displays trend analysis when sufficient data is available', () => {
    render(<HistoricalPerformance {...defaultProps} />);
    
    // Should show trend analysis
    expect(screen.getByText(/Trend/)).toBeInTheDocument();
    expect(screen.getByText(/change from first to second half/)).toBeInTheDocument();
  });

  it('shows improving trend for increasing metrics', () => {
    // Create data with clear upward trend
    const trendingUpAnalytics = [
      { ...mockAnalytics[0], impressions: 1000 },
      { ...mockAnalytics[1], impressions: 1200 },
      { ...mockAnalytics[2], impressions: 1400 },
      { ...mockAnalytics[0], date: '2024-01-04', impressions: 1600 },
    ];

    render(<HistoricalPerformance analytics={trendingUpAnalytics} dateRange="30d" />);
    
    expect(screen.getByText('Improving Trend')).toBeInTheDocument();
  });

  it('applies correct theme colors based on metric type', () => {
    render(<HistoricalPerformance {...defaultProps} />);
    
    // Impressions should use blue theme
    const progressBars = document.querySelectorAll('.bg-ad-blue');
    expect(progressBars.length).toBeGreaterThan(0);
    
    // Change to spend metric
    const metricSelector = screen.getByDisplayValue('Impressions');
    fireEvent.change(metricSelector, { target: { value: 'spend' } });
    
    // Spend should use orange theme
    const orangeBars = document.querySelectorAll('.bg-ad-orange');
    expect(orangeBars.length).toBeGreaterThan(0);
  });

  it('formats values correctly based on metric type', () => {
    render(<HistoricalPerformance {...defaultProps} />);
    
    // Change to spend metric
    const metricSelector = screen.getByDisplayValue('Impressions');
    fireEvent.change(metricSelector, { target: { value: 'spend' } });
    
    // Should show currency formatting
    expect(screen.getByText('₹90')).toBeInTheDocument(); // Jan 1: 50 + 40
    expect(screen.getByText('₹75')).toBeInTheDocument(); // Jan 2: 75
    expect(screen.getByText('₹100')).toBeInTheDocument(); // Jan 3: 100
    
    // Change to CTR metric
    fireEvent.change(metricSelector, { target: { value: 'ctr' } });
    
    // Should show percentage formatting
    expect(screen.getByText('2.0%')).toBeInTheDocument();
  });

  it('displays summary statistics correctly', () => {
    render(<HistoricalPerformance {...defaultProps} />);
    
    // Should show peak, lowest, average, and data points
    expect(screen.getByText('Peak Value')).toBeInTheDocument();
    expect(screen.getByText('Lowest Value')).toBeInTheDocument();
    expect(screen.getByText('Average')).toBeInTheDocument();
    expect(screen.getByText('Data Points')).toBeInTheDocument();
    
    // Peak value should be 2000 (highest impressions)
    expect(screen.getByText('2,000')).toBeInTheDocument();
    
    // Should show 3 data points (3 unique dates)
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows peak indicators on highest values', () => {
    render(<HistoricalPerformance {...defaultProps} />);
    
    // Should show peak indicator (green dot) on highest value
    const peakIndicators = document.querySelectorAll('.bg-ad-status-success.rounded-full');
    expect(peakIndicators.length).toBeGreaterThan(0);
  });

  it('handles empty analytics data', () => {
    render(<HistoricalPerformance analytics={[]} dateRange="30d" />);
    
    expect(screen.getByText('No historical data available')).toBeInTheDocument();
  });

  it('groups data by week correctly', () => {
    render(<HistoricalPerformance {...defaultProps} />);
    
    // Change to weekly view
    const viewSelector = screen.getByDisplayValue('Daily');
    fireEvent.change(viewSelector, { target: { value: 'weekly' } });
    
    // Should group all data into one week
    expect(screen.getByText(/Week of Jan/)).toBeInTheDocument();
  });

  it('groups data by month correctly', () => {
    render(<HistoricalPerformance {...defaultProps} />);
    
    // Change to monthly view
    const viewSelector = screen.getByDisplayValue('Daily');
    fireEvent.change(viewSelector, { target: { value: 'monthly' } });
    
    // Should group all data into January
    expect(screen.getByText('Jan 2024')).toBeInTheDocument();
  });

  it('calculates derived metrics correctly', () => {
    render(<HistoricalPerformance {...defaultProps} />);
    
    // Change to CTR metric
    const metricSelector = screen.getByDisplayValue('Impressions');
    fireEvent.change(metricSelector, { target: { value: 'ctr' } });
    
    // CTR should be calculated as (clicks / impressions) * 100
    // Jan 1: (36 / 1800) * 100 = 2.0%
    expect(screen.getByText('2.0%')).toBeInTheDocument();
  });

  it('sorts data chronologically', () => {
    // Create unsorted analytics
    const unsortedAnalytics = [
      { ...mockAnalytics[2], date: '2024-01-03' }, // Latest first
      { ...mockAnalytics[0], date: '2024-01-01' }, // Earliest last
      { ...mockAnalytics[1], date: '2024-01-02' }, // Middle
    ];

    render(<HistoricalPerformance analytics={unsortedAnalytics} dateRange="30d" />);
    
    // Should display in chronological order
    const dateElements = screen.getAllByText(/Jan \d+/);
    expect(dateElements[0]).toHaveTextContent('Jan 1');
    expect(dateElements[1]).toHaveTextContent('Jan 2');
    expect(dateElements[2]).toHaveTextContent('Jan 3');
  });

  it('handles single data point without trend analysis', () => {
    const singleAnalytics = [mockAnalytics[0]];
    
    render(<HistoricalPerformance analytics={singleAnalytics} dateRange="30d" />);
    
    // Should not show trend analysis with insufficient data
    expect(screen.queryByText(/Trend/)).not.toBeInTheDocument();
  });

  it('displays correct progress bar widths', () => {
    render(<HistoricalPerformance {...defaultProps} />);
    
    // The highest value (2000) should have 100% width
    // Other values should be proportional
    const progressBars = document.querySelectorAll('[style*="width"]');
    expect(progressBars.length).toBeGreaterThan(0);
    
    // Check that at least one bar has 100% width (the maximum value)
    const fullWidthBars = Array.from(progressBars).filter(bar => 
      bar.getAttribute('style')?.includes('100%')
    );
    expect(fullWidthBars.length).toBeGreaterThan(0);
  });
});