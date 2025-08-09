'use client';

import { useMemo } from 'react';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdCampaign } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface BudgetTrackerProps {
  campaigns: AdCampaign[];
  onPauseCampaign?: (campaignId: string) => void;
  onResumeCampaign?: (campaignId: string) => void;
}

export function BudgetTracker({ campaigns, onPauseCampaign, onResumeCampaign }: BudgetTrackerProps) {
  const budgetAnalysis = useMemo(() => {
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    
    const analysis = activeCampaigns.map(campaign => {
      const spentPercentage = campaign.budget > 0 ? (campaign.spentAmount / campaign.budget) * 100 : 0;
      const remainingBudget = campaign.budget - campaign.spentAmount;
      const remainingPercentage = 100 - spentPercentage;
      
      // Calculate daily spend rate if we have analytics
      const dailySpend = campaign.analytics?.reduce((sum, a) => {
        const today = new Date().toISOString().split('T')[0];
        const analyticsDate = new Date(a.date).toISOString().split('T')[0];
        return analyticsDate === today ? sum + a.spend : sum;
      }, 0) || 0;

      // Estimate days remaining based on current spend rate
      const daysRemaining = dailySpend > 0 ? Math.floor(remainingBudget / dailySpend) : Infinity;
      
      // Determine alert level
      let alertLevel: 'success' | 'warning' | 'danger' = 'success';
      if (spentPercentage >= 90) alertLevel = 'danger';
      else if (spentPercentage >= 75) alertLevel = 'warning';
      
      return {
        campaign,
        spentPercentage,
        remainingBudget,
        remainingPercentage,
        dailySpend,
        daysRemaining,
        alertLevel,
      };
    });

    // Sort by alert level (danger first, then warning, then success)
    const sortOrder = { danger: 0, warning: 1, success: 2 };
    analysis.sort((a, b) => sortOrder[a.alertLevel] - sortOrder[b.alertLevel]);

    return analysis;
  }, [campaigns]);

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spentAmount, 0);
  const totalRemaining = totalBudget - totalSpent;

  const alertCounts = budgetAnalysis.reduce(
    (acc, item) => {
      acc[item.alertLevel]++;
      return acc;
    },
    { success: 0, warning: 0, danger: 0 }
  );

  const getAlertIcon = (level: 'success' | 'warning' | 'danger') => {
    switch (level) {
      case 'success':
        return CheckCircleIcon;
      case 'warning':
        return ClockIcon;
      case 'danger':
        return ExclamationTriangleIcon;
    }
  };

  const getAlertColor = (level: 'success' | 'warning' | 'danger') => {
    switch (level) {
      case 'success':
        return 'text-ad-status-success';
      case 'warning':
        return 'text-ad-status-pending';
      case 'danger':
        return 'text-ad-status-rejected';
    }
  };

  const getAlertBgColor = (level: 'success' | 'warning' | 'danger') => {
    switch (level) {
      case 'success':
        return 'bg-ad-status-success/10';
      case 'warning':
        return 'bg-ad-status-pending/10';
      case 'danger':
        return 'bg-ad-status-rejected/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Budget Overview</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Budget</div>
              <div className="text-lg font-bold text-ad-orange">
                {formatCurrency(totalBudget)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Remaining</div>
              <div className="text-lg font-bold text-ad-blue">
                {formatCurrency(totalRemaining)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-ad-status-success/10 rounded-lg">
            <CheckCircleIcon className="w-8 h-8 text-ad-status-success" />
            <div>
              <div className="text-2xl font-bold text-ad-status-success">
                {alertCounts.success}
              </div>
              <div className="text-sm text-muted-foreground">Healthy Campaigns</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-ad-status-pending/10 rounded-lg">
            <ClockIcon className="w-8 h-8 text-ad-status-pending" />
            <div>
              <div className="text-2xl font-bold text-ad-status-pending">
                {alertCounts.warning}
              </div>
              <div className="text-sm text-muted-foreground">Need Attention</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-ad-status-rejected/10 rounded-lg">
            <ExclamationTriangleIcon className="w-8 h-8 text-ad-status-rejected" />
            <div>
              <div className="text-2xl font-bold text-ad-status-rejected">
                {alertCounts.danger}
              </div>
              <div className="text-sm text-muted-foreground">Critical Alerts</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Campaign Budget Details */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Campaign Budget Status</h2>
        
        {budgetAnalysis.length === 0 ? (
          <div className="text-center py-8">
            <CurrencyDollarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active campaigns to track</p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgetAnalysis.map((item) => {
              const AlertIcon = getAlertIcon(item.alertLevel);
              const alertColor = getAlertColor(item.alertLevel);
              const alertBgColor = getAlertBgColor(item.alertLevel);

              return (
                <div key={item.campaign.id} className={`border rounded-lg p-4 ${alertBgColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <AlertIcon className={`w-5 h-5 ${alertColor}`} />
                      <div>
                        <h4 className="font-medium text-foreground">
                          {item.campaign.name}
                        </h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {item.campaign.campaignType} • {item.campaign.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.campaign.status === 'active' && onPauseCampaign && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPauseCampaign(item.campaign.id)}
                          className="text-ad-status-paused border-ad-status-paused hover:bg-ad-status-paused/10"
                        >
                          Pause
                        </Button>
                      )}
                      {item.campaign.status === 'paused' && onResumeCampaign && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onResumeCampaign(item.campaign.id)}
                          className="text-ad-status-active border-ad-status-active hover:bg-ad-status-active/10"
                        >
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Budget Progress */}
                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Budget Usage</span>
                        <span className="text-sm font-medium text-foreground">
                          {formatPercentage(item.spentPercentage / 100)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${
                            item.alertLevel === 'danger' ? 'bg-ad-status-rejected' :
                            item.alertLevel === 'warning' ? 'bg-ad-status-pending' :
                            'bg-ad-status-success'
                          }`}
                          style={{ width: `${Math.min(item.spentPercentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-muted-foreground">
                          Spent: {formatCurrency(item.campaign.spentAmount)}
                        </span>
                        <span className="text-muted-foreground">
                          Budget: {formatCurrency(item.campaign.budget)}
                        </span>
                      </div>
                    </div>

                    {/* Remaining Budget */}
                    <div className="text-center">
                      <div className="text-lg font-bold text-ad-blue">
                        {formatCurrency(item.remainingBudget)}
                      </div>
                      <div className="text-sm text-muted-foreground">Remaining</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatPercentage(item.remainingPercentage / 100)} left
                      </div>
                    </div>

                    {/* Daily Spend & Projection */}
                    <div className="text-center">
                      <div className="text-lg font-bold text-ad-orange">
                        {formatCurrency(item.dailySpend)}
                      </div>
                      <div className="text-sm text-muted-foreground">Today's Spend</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.daysRemaining === Infinity ? 'No spend rate' : 
                         item.daysRemaining < 1 ? 'Budget exhausted' :
                         `~${item.daysRemaining} days left`}
                      </div>
                    </div>
                  </div>

                  {/* Alert Messages */}
                  {item.alertLevel === 'danger' && (
                    <div className="mt-4 p-3 bg-ad-status-rejected/20 border border-ad-status-rejected/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-ad-status-rejected" />
                        <span className="text-sm font-medium text-ad-status-rejected">
                          Critical: Campaign has used {formatPercentage(item.spentPercentage / 100)} of budget
                        </span>
                      </div>
                    </div>
                  )}

                  {item.alertLevel === 'warning' && (
                    <div className="mt-4 p-3 bg-ad-status-pending/20 border border-ad-status-pending/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-ad-status-pending" />
                        <span className="text-sm font-medium text-ad-status-pending">
                          Warning: Campaign has used {formatPercentage(item.spentPercentage / 100)} of budget
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}