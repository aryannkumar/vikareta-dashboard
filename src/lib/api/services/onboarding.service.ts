import { apiClient } from '../client';

export interface OnboardingStep {
  id: string;
  businessId: string;
  step: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  order: number;
  required: boolean;
  data?: Record<string, any>;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingProgress {
  businessId: string;
  totalSteps: number;
  completedSteps: number;
  currentStep: string;
  progressPercentage: number;
  estimatedCompletionTime?: string;
  nextRequiredStep?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOnboardingStepData {
  status?: 'pending' | 'in_progress' | 'completed' | 'skipped';
  data?: Record<string, any>;
}

export class OnboardingService {
  // Get onboarding steps for a business
  static async getOnboardingSteps(businessId: string): Promise<OnboardingStep[]> {
    const response = await apiClient.get('/onboarding/steps', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch onboarding steps');
    }
    return response.data as OnboardingStep[];
  }

  // Get onboarding progress for a business
  static async getOnboardingProgress(businessId: string): Promise<OnboardingProgress> {
    const response = await apiClient.get('/onboarding/progress', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch onboarding progress');
    }
    return response.data as OnboardingProgress;
  }

  // Update onboarding step
  static async updateOnboardingStep(stepId: string, stepData: UpdateOnboardingStepData): Promise<OnboardingStep> {
    const response = await apiClient.put(`/onboarding/steps/${stepId}`, stepData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update onboarding step');
    }
    return response.data as OnboardingStep;
  }

  // Complete onboarding step
  static async completeOnboardingStep(stepId: string, data?: Record<string, any>): Promise<OnboardingStep> {
    const response = await apiClient.post(`/onboarding/steps/${stepId}/complete`, { data });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to complete onboarding step');
    }
    return response.data as OnboardingStep;
  }

  // Skip onboarding step
  static async skipOnboardingStep(stepId: string): Promise<OnboardingStep> {
    const response = await apiClient.post(`/onboarding/steps/${stepId}/skip`, {});
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to skip onboarding step');
    }
    return response.data as OnboardingStep;
  }

  // Reset onboarding for a business
  static async resetOnboarding(businessId: string): Promise<{ success: boolean; message: string; }> {
    const response = await apiClient.post('/onboarding/reset', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to reset onboarding');
    }
    return response.data as { success: boolean; message: string; };
  }

  // Get onboarding checklist
  static async getOnboardingChecklist(businessId: string): Promise<{ steps: OnboardingStep[]; progress: OnboardingProgress; }> {
    const response = await apiClient.get('/onboarding/checklist', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch onboarding checklist');
    }
    return response.data as { steps: OnboardingStep[]; progress: OnboardingProgress; };
  }

  // Mark onboarding as complete
  static async completeOnboarding(businessId: string): Promise<{ success: boolean; message: string; }> {
    const response = await apiClient.post('/onboarding/complete', { businessId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to complete onboarding');
    }
    return response.data as { success: boolean; message: string; };
  }
}