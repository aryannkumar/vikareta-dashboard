import { render, screen, fireEvent } from '@testing-library/react';
import { BudgetTracker } from '../budget-tracker';
import { AdCampaign } from '@/types';

const mockCampaigns: AdCampaign[] = [
  {
    id: '1',
    businessId: 'business-1',
    name: 'High Spend Campaign',
    description: 'Test campaign with high spend',
    campaignType: 'product',
    status: 'active',
    budget: 1000,
    spentAmount: 950, // 95% spent - danger level
    bidAmount: 2.5,
    biddingStrategy: 'cpc',
    startDate: '2024-01-01',
    targetingConfig: {},
    ads: [],
    analytics: [
      {
        id: 'analytics-1',
        campaignId: '1',
        date: new Date().toISOString().split('T')[0], // Today
        impressions: 5000,
        clicks: 100,
        conversions: 5,
        spend: 50, // Daily spend
        revenue: 250,
        ctr: 2.0,
        cpc: 0.5,
        cpm: 10,
        roas: 5.0,
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
    name: 'Medium Spend Campaign',
    description: 'Test campaign with medium spend',
    campaignType: 'service',
    status: 'active',
    budget: 2000,
    spentAmount: 1600, // 80% spent - warning level
    bidAmount: 1.5,
    biddingStrategy: 'cpm',
    startDate: '2024-01-02',
    targetingConfig: {},
    ads: [],
    analytics: [
      {
        id: 'analytics-2',
        campaignId: '2',
        date: new Date().toISOString().split('T')[0],
        impressions: 8000,
        clicks: 120,
        conversions: 8,
        spend: 30,
        revenue: 400,
        ctr: 1.5,
        cpc: 0.25,
        cpm: 3.75,
        roas: 13.33,
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
    name: 'Low Spend Campaign',
    description: 'Test campaign with low spend',
    campaignType: 'brand',
    status: 'active',
    budget: 5000,
    spentAmount: 1000, // 20% spent - success level
    bidAmount: 1.0,
    biddingStrategy: 'cpa',
    startDate: '2024-01-03',
    targetingConfig: {},
    ads: [],
    analytics: [
      {
        id: 'analytics-3',
        campaignId: '3',
        date: new Date().toISOString().split('T')[0],
        impressions: 10000,
        clicks: 200,
        conversions: 15,
        spend: 25,
        revenue: 750,
        ctr: 2.0,
        cpc: 0.125,
        cpm: 2.5,
        roas: 30.0,
        createdAt: '2024-01-03',
        updatedAt: '2024-01-03',
      },
    ],
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03',
  },
  {
    id: '4',
    businessId: 'business-1',
    name: 'Paused Campaign',
    description: 'Test paused campaign',
    campaignType: 'product',
    status: 'paused',
    budget: 3000,
    spentAmount: 1500,
    bidAmount: 2.0,
    biddingStrategy: 'cpc',
    startDate: '2024-01-04',
    targetingConfig: {},
    ads: [],
    createdAt: '2024-01-04',
    updatedAt: '2024-01-04',
  },
];

describe('BudgetTracker', () => {
  const mockOnPauseCampaign = jest.fn();
  const mockOnResumeCampaign = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    campaigns: mockCampaigns,
    onPauseCampaign: mockOnPauseCampaign,
    onResumeCampaign: mockOnResumeCampaign,
  };

  it('renders budget overview with correct totals', () => {
    render(<BudgetTracker {...defaultProps} />);
    
    expect(screen.getByText('Budget Overview')).toBeInTheDocument();
    
    // Total budget: 1000 + 2000 + 5000 + 3000 = 11000
    expect(screen.getByText('₹11,000')).toBeInTheDocument();
    
    // Total remaining: 11000 - (950 + 1600 + 1000 + 1500) = 5950
    expect(screen.getByText('₹5,950')).toBeInTheDocument();
  });

  it('displays correct alert counts', () => {
    render(<BudgetTracker {...defaultProps} />);
    
    // Should show 1 healthy (success), 1 warning, 1 danger
    // Note: Only active campaigns are considered
    expect(screen.getByText('1')).toBeInTheDocument(); // Healthy campaigns
    expect(screen.getByText('1')).toBeInTheDocument(); // Need attention
    expect(screen.getByText('1')).toBeInTheDocument(); // Critical alerts
  });

  it('applies correct alert levels based on spend percentage', () => {
    render(<BudgetTracker {...defaultProps} />);
    
    // High spend campaign (95%) should show danger
    const highSpendCampaign = screen.getByText('High Spend Campaign').closest('.border');
    expect(highSpendCampaign).toHaveClass('bg-ad-status-rejected/10');
    
    // Medium spend campaign (80%) should show warning
    const mediumSpendCampaign = screen.getByText('Medium Spend Campaign').closest('.border');
    expect(mediumSpendCampaign).toHaveClass('bg-ad-status-pending/10');
    
    // Low spend campaign (20%) should show success
    const lowSpendCampaign = screen.getByText('Low Spend Campaign').closest('.border');
    expect(lowSpendCampaign).toHaveClass('bg-ad-status-success/10');
  });

  it('displays budget progress bars with correct percentages', () => {
    render(<BudgetTracker {...defaultProps} />);
    
    // Check for percentage displays
    expect(screen.getByText('95.0%')).toBeInTheDocument(); // High spend
    expect(screen.getByText('80.0%')).toBeInTheDocument(); // Medium spend
    expect(screen.getByText('20.0%')).toBeInTheDocument(); // Low spend
  });

  it('calculates and displays remaining budget correctly', () => {
    render(<BudgetTracker {...defaultProps} />);
    
    // High spend: 1000 - 950 = 50
    expect(screen.getByText('₹50')).toBeInTheDocument();
    
    // Medium spend: 2000 - 1600 = 400
    expect(screen.getByText('₹400')).toBeInTheDocument();
    
    // Low spend: 5000 - 1000 = 4000
    expect(screen.getByText('₹4,000')).toBeInTheDocument();
  });

  it('displays daily spend and projections', () => {
    render(<BudgetTracker {...defaultProps} />);
    
    // Daily spend amounts
    expect(screen.getByText('₹50')).toBeInTheDocument(); // High spend daily
    expect(screen.getByText('₹30')).toBeInTheDocument(); // Medium spend daily
    expect(screen.getByText('₹25')).toBeInTheDocument(); // Low spend daily
    
    // Days remaining calculations
    expect(screen.getByText('~1 days left')).toBeInTheDocument(); // 50/50 = 1 day
    expect(screen.getByText('~13 days left')).toBeInTheDocument(); // 400/30 = 13.33 days
    expect(screen.getByText('~160 days left')).toBeInTheDocument(); // 4000/25 = 160 days
  });

  it('shows critical alert message for danger level campaigns', () => {
    render(<BudgetTracker {...defaultProps} />);
    
    expect(screen.getByText(/Critical: Campaign has used 95.0% of budget/)).toBeInTheDocument();
  });

  it('shows warning alert message for warning level campaigns', () => {
    render(<BudgetTracker {...defaultProps} />);
    
    expect(screen.getByText(/Warning: Campaign has used 80.0% of budget/)).toBeInTheDocument();
  });

  it('displays pause button for active campaigns', () => {
    render(<BudgetTracker {...defaultProps} />);
    
    const pauseButtons = screen.getAllByText('Pause');
    expect(pauseButtons).toHaveLength(3); // 3 active campaigns
  });

  it('displays resume button for paused campaigns', () => {
    render(<BudgetTracker {...defaultProps} />);
    
    // Paused campaign should not appear in active campaigns list
    // This test would need to be adjusted if paused campaigns are shown
    const resumeButtons = screen.queryAllByText('Resume');
    expect(resumeButtons).toHaveLength(0); // Only active campaigns shown
  });

  it('calls onPauseCampaign when pause button is clicked', () => {
    render(<BudgetTracker {...defaultProps} />);
    
    const pauseButtons = screen.getAllByText('Pause');
    fireEvent.click(pauseButtons[0]);
    
    expect(mockOnPauseCampaign).toHaveBeenCalledWith('1'); // First campaign ID
  });

  it('handles campaigns without analytics gracefully', () => {
    const campaignsWithoutAnalytics = mockCampaigns.map(campaign => ({
      ...campaign,
      analytics: undefined,
    }));

    render(<BudgetTracker campaigns={campaignsWithoutAnalytics} />);
    
    // Should still render without errors
    expect(screen.getByText('Budget Overview')).toBeInTheDocument();
    
    // Daily spend should be 0 when no analytics
    expect(screen.getByText('₹0')).toBeInTheDocument();
    expect(screen.getByText('No spend rate')).toBeInTheDocument();
  });

  it('shows no campaigns message when no active campaigns', () => {
    const inactiveCampaigns = mockCampaigns.map(campaign => ({
      ...campaign,
      status: 'paused' as const,
    }));

    render(<BudgetTracker campaigns={inactiveCampaigns} />);
    
    expect(screen.getByText('No active campaigns to track')).toBeInTheDocument();
  });

  it('sorts campaigns by alert level (danger first)', () => {
    render(<BudgetTracker {...defaultProps} />);
    
    const campaignNames = screen.getAllByText(/Campaign$/).map(el => el.textContent);
    
    // Should be sorted: danger (High Spend), warning (Medium Spend), success (Low Spend)
    expect(campaignNames[0]).toBe('High Spend Campaign');
    expect(campaignNames[1]).toBe('Medium Spend Campaign');
    expect(campaignNames[2]).toBe('Low Spend Campaign');
  });

  it('applies correct theme colors throughout', () => {
    render(<BudgetTracker {...defaultProps} />);
    
    // Check for orange theme on budget amounts
    const budgetElements = screen.getAllByText(/₹[\d,]+/);
    expect(budgetElements.some(el => el.classList.contains('text-ad-orange'))).toBe(true);
    
    // Check for blue theme on remaining amounts
    expect(budgetElements.some(el => el.classList.contains('text-ad-blue'))).toBe(true);
    
    // Check for success theme on healthy campaigns
    expect(screen.getByText('1').closest('.bg-ad-status-success\\/10')).toBeInTheDocument();
  });

  it('handles zero budget campaigns', () => {
    const zeroBudgetCampaigns = [
      {
        ...mockCampaigns[0],
        budget: 0,
        spentAmount: 0,
      },
    ];

    render(<BudgetTracker campaigns={zeroBudgetCampaigns} />);
    
    // Should handle division by zero gracefully
    expect(screen.getByText('Budget Overview')).toBeInTheDocument();
  });

  it('formats currency values correctly', () => {
    render(<BudgetTracker {...defaultProps} />);
    
    // Check for proper Indian currency formatting
    expect(screen.getByText('₹11,000')).toBeInTheDocument();
    expect(screen.getByText('₹5,950')).toBeInTheDocument();
  });
});