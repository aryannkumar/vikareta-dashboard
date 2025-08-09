'use client';

import { useState } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { AdCampaignFilters } from '@/types';

interface CampaignFiltersProps {
  filters: AdCampaignFilters;
  onFiltersChange: (filters: AdCampaignFilters) => void;
}

export function CampaignFilters({ filters, onFiltersChange }: CampaignFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof AdCampaignFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search campaigns..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <Select
          value={filters.status || ''}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="draft">Draft</option>
        </Select>

        <Select
          value={filters.campaignType || ''}
          onValueChange={(value) => handleFilterChange('campaignType', value)}
        >
          <option value="">All Types</option>
          <option value="product">Product</option>
          <option value="service">Service</option>
          <option value="brand">Brand</option>
        </Select>

        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2"
        >
          <FunnelIcon className="w-4 h-4" />
          <span>More Filters</span>
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <XMarkIcon className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Date From
            </label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Date To
            </label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sort By
            </label>
            <Select
              value={filters.sortBy || 'created'}
              onValueChange={(value) => handleFilterChange('sortBy', value)}
            >
              <option value="created">Created Date</option>
              <option value="updated">Updated Date</option>
              <option value="spend">Total Spend</option>
              <option value="performance">Performance</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sort Order
            </label>
            <Select
              value={filters.sortOrder || 'desc'}
              onValueChange={(value) => handleFilterChange('sortOrder', value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Select>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          {filters.status && (
            <span className="px-2 py-1 bg-ad-blue/10 text-ad-blue rounded-md">
              Status: {filters.status}
            </span>
          )}
          {filters.campaignType && (
            <span className="px-2 py-1 bg-ad-orange/10 text-ad-orange rounded-md">
              Type: {filters.campaignType}
            </span>
          )}
          {filters.dateFrom && (
            <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md">
              From: {filters.dateFrom}
            </span>
          )}
          {filters.dateTo && (
            <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md">
              To: {filters.dateTo}
            </span>
          )}
        </div>
      )}
    </div>
  );
}