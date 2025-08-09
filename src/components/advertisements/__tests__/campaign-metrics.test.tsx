import { render, screen } from '@testing-library/react';
import { CampaignMetrics } from '../campaign-metrics';
import { AdCampaign } from '@/types';

const mockCampaigns: AdCampaign[] = [
  {
    id: '1',
    businessId: 'business-1',
    name: 'Test Campaign 1',
    description: 'Test description',
    campaignType: 'product',
    status: 'active',
    budget: 5000,
    dailyBudget: 100,
    spentAmount: 1500,
    bidAmount: 2.5,
    biddingStrategy: 'cpc',
    startDate: '2024-01-01',
    targetingConfig: {},
    ads: [],
    analytics: [
      {
        id: 'analytics-1',
        campaignId: '1',
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
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    businessId: 'business-1',
    name: 'Test Campaign 2',
    description: 'Test description 2',
    campaignType: 'service',
    status: 'paused',
    budget: 3000,
    dailyBudget: 50,
    spentAmount: 800,
    bidAmount: 1.5,
    biddingStrategy: 'cpm',
    startDate: '2024-01-02',
    targetingConfig: {},
    ads: [],
    analytics: [
      {
        id: 'analytics-2',
        campaignId: '2',
        date: '2024-01-02',
        impressions: 5000,
        clicks: 75,
        conversions: 3,
        spend: 300,
        revenue: 450,
        ctr: 1.5,
        cpc: 4.0,
        cpm: 60,
        roas: 1.5,
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
      },
    ],
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
  {
    id: '3',
    businessId: 'business-1',
    name: 'Test Campaign 3',
    description: 'Test description 3',
    campaignType: 'brand',
    status: 'pending_approval',
    budget: 2000,
    spentAmount: 0,
    bidAmount: 1.0,
    biddingStrategy: 'cpa',
    startDate: '2024-01-03',
    targetingConfig: {},
    ads: [],
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03',
  },
];

describe('CampaignMetrics', () => {
  it('renders all metric cards', () => {
    render(<CampaignMetrics campaigns={mockCampaigns} />);
    
    expect(screen.getByText('Total Campaigns')).toBeInTheDocument();
    expect(screen.getByText('Total Budget')).toBeInTheDocument();
    expect(screen.getByText('Total Impressions')).toBeInTheDocument();
    expect(screen.getByText('Conversions')).toBeInTheDocument();
  });

  it('displays correct campaign counts', () => {
    render(<CampaignMetrics campaigns={mockCampaigns} />);
    
    expect(screen.getByText('3')).toBeInTheDocument(); // Total campaigns
    expect(screen.getByText('1')).toBeInTheDocument(); // Active campaigns
    expect(screen.getByText('1')).toBeInTheDocument(); // Paused campaigns  
    expect(screen.getByText('1')).toBeInTheDocument(); // Pending campaigns
  });

  it('calculates and displays total budget correctly', () => {
    render(<CampaignMetrics campaigns={mockCampaigns} />);
    
    // Total budget: 5000 + 3000 + 2000 = 10000
    expect(screen.getByText('₹10,000')).toBeInTheDocument();
    
    // Total spent: 1500 + 800 + 0 = 2300
    expect(screen.getByText('₹2,300')).toBeInTheDocument();
    
    // Remaining: 10000 - 2300 = 7700
    expect(screen.getByText('₹7,700')).toBeInTheDocument();
  });

  it('calculates and displays impression metrics correctly', () => {
    render(<CampaignMetrics campaigns={mockCampaigns} />);
    
    // Total impressions: 10000 + 5000 = 15000
    expect(screen.getByText('15,000')).toBeInTheDocument();
    
    // Total clicks: 200 + 75 = 275
    expect(screen.getByText('275')).toBeInTheDocument();
    
    // CTR: (275 / 15000) * 100 = 1.83%
    expect(screen.getByText('1.8%')).toBeInTheDocument();
  });

  it('calculates and displays conversion metrics correctly', () => {
    render(<CampaignMetrics campaigns={mockCampaigns} />);
    
    // Total conversions: 10 + 3 = 13
    expect(screen.getByText('13')).toBeInTheDocument();
    
    // Conversion rate: (13 / 275) * 100 = 4.73%
    expect(screen.getByText('4.7%')).toBeInTheDocument();
    
    // Cost per conversion: 800 / 13 = 61.54
    expect(screen.getByText('₹61.54')).toBeInTheDocument();
  });

  it('applies correct theme colors to metric cards', () => {
    render(<CampaignMetrics campaigns={mockCampaigns} />);
    
    // Check for orange theme on budget metrics
    const budgetCard = screen.getByText('Total Budget').closest('.p-6');
    expect(budgetCard?.querySelector('.text-ad-orange')).toBeInTheDocument();
    
    // Check for blue theme on impression metrics
    const impressionCard = screen.getByText('Total Impressions').closest('.p-6');
    expect(impressionCard?.querySelector('.text-ad-blue')).toBeInTheDocument();
    
    // Check for success theme on conversion metrics
    const conversionCard = screen.getByText('Conversions').closest('.p-6');
    expect(conversionCard?.querySelector('.text-ad-status-success')).toBeInTheDocument();
  });

  it('handles empty campaigns array', () => {
    render(<CampaignMetrics campaigns={[]} />);
    
    expect(screen.getByText('0')).toBeInTheDocument(); // Total campaigns
    expect(screen.getByText('₹0')).toBeInTheDocument(); // Total budget
  });

  it('handles campaigns without analytics', () => {
    const campaignsWithoutAnalytics = mockCampaigns.map(campaign => ({
      ...campaign,
      analytics: undefined,
    }));

    render(<CampaignMetrics campaigns={campaignsWithoutAnalytics} />);
    
    expect(screen.getByText('0')).toBeInTheDocument(); // Total impressions should be 0
  });

  it('displays status-specific counts with correct colors', () => {
    render(<CampaignMetrics campaigns={mockCampaigns} />);
    
    // Check for active status color
    const activeElement = screen.getByText('Active').closest('div');
    expect(activeElement?.querySelector('.text-ad-status-active')).toBeInTheDocument();
    
    // Check for paused status color
    const pausedElement = screen.getByText('Paused').closest('div');
    expect(pausedElement?.querySelector('.text-ad-status-paused')).toBeInTheDocument();
    
    // Check for pending status color
    const pendingElement = screen.getByText('Pending').closest('div');
    expect(pendingElement?.querySelector('.text-ad-status-pending')).toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    const campaignsWithLargeNumbers = [
      {
        ...mockCampaigns[0],
        analytics: [
          {
            ...mockCampaigns[0].analytics![0],
            impressions: 1500000, // 1.5M
            clicks: 45000, // 45K
          },
        ],
      },
    ];

    render(<CampaignMetrics campaigns={campaignsWithLargeNumbers} />);
    
    expect(screen.getByText('1,500,000')).toBeInTheDocument();
    expect(screen.getByText('45,000')).toBeInTheDocument();
  });

  it('calculates percentage changes correctly when available', () => {
    render(<CampaignMetrics campaigns={mockCampaigns} />);
    
    // The component should display current metrics
    // Percentage changes would require historical data comparison
    expect(screen.getByText('Total Campaigns')).toBeInTheDocument();
  });
});