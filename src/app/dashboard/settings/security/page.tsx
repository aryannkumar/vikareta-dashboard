'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Monitor,
  Trash2,
  Download,
  RefreshCw,
  Lock,
  Unlock,
  Settings
} from 'lucide-react';
import { vikaretaApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';

interface SecuritySettings {
  twoFactorAuth: {
    enabled: boolean;
    method: 'sms' | 'email' | 'authenticator' | null;
    backupCodes: string[];
    lastUsed?: string;
  };
  passwordPolicy: {
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    minLength: number;
    maxAge: number; // days
    preventReuse: number; // number of previous passwords
  };
  loginSecurity: {
    maxFailedAttempts: number;
    lockoutDuration: number; // minutes
    requireEmailVerification: boolean;
    allowMultipleSessions: boolean;
    sessionTimeout: number; // minutes
  };
  notifications: {
    loginAlerts: boolean;
    passwordChanges: boolean;
    securityEvents: boolean;
    suspiciousActivity: boolean;
  };
}

interface LoginSession {
  id: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
  location: {
    city: string;
    country: string;
    ip: string;
  };
  loginTime: string;
  lastActivity: string;
  isCurrent: boolean;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'password_change' | 'failed_login' | 'suspicious_activity' | '2fa_enabled' | '2fa_disabled';
  description: string;
  timestamp: string;
  ip: string;
  location?: string;
  severity: 'low' | 'medium' | 'high';
}

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('password');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setIsLoading(true);
      const [settingsResponse, sessionsResponse, eventsResponse] = await Promise.all([
        vikaretaApiClient.get('/settings/security'),
        vikaretaApiClient.get('/auth/sessions'),
        vikaretaApiClient.get('/auth/security-events')
      ]);

      if (settingsResponse.success) {
        setSettings(settingsResponse.data as SecuritySettings);
      } else {
        // Initialize with default settings
        setSettings({
          twoFactorAuth: {
            enabled: false,
            method: null,
            backupCodes: []
          },
          passwordPolicy: {
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            minLength: 8,
            maxAge: 90,
            preventReuse: 5
          },
          loginSecurity: {
            maxFailedAttempts: 5,
            lockoutDuration: 15,
            requireEmailVerification: true,
            allowMultipleSessions: true,
            sessionTimeout: 60
          },
          notifications: {
            loginAlerts: true,
            passwordChanges: true,
            securityEvents: true,
            suspiciousActivity: true
          }
        });
      }

      if (sessionsResponse.success) {
        setSessions(sessionsResponse.data as LoginSession[]);
      }

      if (eventsResponse.success) {
        setSecurityEvents(eventsResponse.data as SecurityEvent[]);
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await vikaretaApiClient.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(response.error?.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await vikaretaApiClient.post('/auth/2fa/setup');
      
      if (response.success) {
        setQrCode((response.data as any).qrCode);
      } else {
        throw new Error(response.error?.message || 'Failed to setup 2FA');
      }
    } catch (error) {
      console.error('Failed to setup 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to setup two-factor authentication",
        variant: "destructive",
      });
    }
  };

  const handleVerify2FA = async () => {
    try {
      const response = await vikaretaApiClient.post('/auth/2fa/verify', {
        code: verificationCode
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Two-factor authentication enabled successfully",
        });
        setQrCode(null);
        setVerificationCode('');
        loadSecurityData();
      } else {
        throw new Error(response.error?.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Failed to verify 2FA:', error);
      toast({
        title: "Error",
        description: "Invalid verification code",
        variant: "destructive",
      });
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication?')) return;

    try {
      const response = await vikaretaApiClient.post('/auth/2fa/disable');
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Two-factor authentication disabled",
        });
        loadSecurityData();
      } else {
        throw new Error(response.error?.message || 'Failed to disable 2FA');
      }
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to disable two-factor authentication",
        variant: "destructive",
      });
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const response = await vikaretaApiClient.delete(`/auth/sessions/${sessionId}`);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Session terminated successfully",
        });
        loadSecurityData();
      } else {
        throw new Error(response.error?.message || 'Failed to terminate session');
      }
    } catch (error) {
      console.error('Failed to terminate session:', error);
      toast({
        title: "Error",
        description: "Failed to terminate session",
        variant: "destructive",
      });
    }
  };

  const handleTerminateAllSessions = async () => {
    if (!confirm('Are you sure you want to terminate all other sessions?')) return;

    try {
      const response = await vikaretaApiClient.post('/auth/sessions/terminate-all');
      
      if (response.success) {
        toast({
          title: "Success",
          description: "All other sessions terminated",
        });
        loadSecurityData();
      } else {
        throw new Error(response.error?.message || 'Failed to terminate sessions');
      }
    } catch (error) {
      console.error('Failed to terminate sessions:', error);
      toast({
        title: "Error",
        description: "Failed to terminate sessions",
        variant: "destructive",
      });
    }
  };

  const updateSettings = (updates: Partial<SecuritySettings>) => {
    if (settings) {
      setSettings({ ...settings, ...updates });
    }
  };

  const updateNestedSetting = (path: string, value: any) => {
    if (!settings) return;
    
    const keys = path.split('.');
    const newSettings = { ...settings };
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await vikaretaApiClient.put('/settings/security', settings);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Security settings updated successfully",
        });
      } else {
        throw new Error(response.error?.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error",
        description: "Failed to save security settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed_login': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'password_change': return <Key className="h-4 w-4 text-blue-600" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case '2fa_enabled': return <Shield className="h-4 w-4 text-green-600" />;
      case '2fa_disabled': return <Shield className="h-4 w-4 text-red-600" />;
      default: return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={variants[severity as keyof typeof variants]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load security settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account security and privacy settings
          </p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : (
            <Shield className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'password', label: 'Password', icon: Key },
            { id: '2fa', label: 'Two-Factor Auth', icon: Smartphone },
            { id: 'sessions', label: 'Active Sessions', icon: Monitor },
            { id: 'policies', label: 'Security Policies', icon: Shield },
            { id: 'activity', label: 'Security Activity', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'password' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Password Requirements:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• At least {settings.passwordPolicy.minLength} characters long</li>
                <li>• Contains uppercase and lowercase letters</li>
                <li>• Contains at least one number</li>
                <li>• Contains at least one special character</li>
              </ul>
            </div>

            <Button 
              onClick={handlePasswordChange} 
              disabled={isSaving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              className="w-full"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Key className="h-4 w-4 mr-2" />
              )}
              Change Password
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === '2fa' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!settings.twoFactorAuth.enabled ? (
              <div className="space-y-4">
                {!qrCode ? (
                  <div className="text-center py-8">
                    <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Two-Factor Authentication is Disabled</h3>
                    <p className="text-gray-600 mb-6">
                      Protect your account with an additional security layer
                    </p>
                    <Button onClick={handleEnable2FA}>
                      <Smartphone className="h-4 w-4 mr-2" />
                      Enable Two-Factor Authentication
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">Scan QR Code</h3>
                      <p className="text-gray-600 mb-4">
                        Scan this QR code with your authenticator app
                      </p>
                      <div className="flex justify-center mb-4">
                        <img src={qrCode} alt="2FA QR Code" className="border rounded-lg" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="verificationCode">Verification Code</Label>
                      <Input
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleVerify2FA} disabled={verificationCode.length !== 6}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify & Enable
                      </Button>
                      <Button variant="outline" onClick={() => setQrCode(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-900">Two-Factor Authentication Enabled</h4>
                      <p className="text-sm text-green-700">
                        Your account is protected with 2FA
                        {settings.twoFactorAuth.lastUsed && (
                          <span> • Last used: {formatDate(settings.twoFactorAuth.lastUsed)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleDisable2FA}>
                    <Unlock className="h-4 w-4 mr-2" />
                    Disable
                  </Button>
                </div>

                {settings.twoFactorAuth.backupCodes.length > 0 && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Backup Codes</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {settings.twoFactorAuth.backupCodes.map((code, index) => (
                        <div key={index} className="p-2 bg-gray-100 rounded">
                          {code}
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Download className="h-4 w-4 mr-2" />
                      Download Codes
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'sessions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage devices and locations where you're signed in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
                </p>
                <Button variant="outline" onClick={handleTerminateAllSessions}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Terminate All Others
                </Button>
              </div>

              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Monitor className="h-6 w-6 text-gray-600" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {session.deviceInfo.browser} on {session.deviceInfo.os}
                        </h4>
                        {session.isCurrent && (
                          <Badge className="bg-green-100 text-green-800">Current</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.location.city}, {session.location.country}
                        </div>
                        <span>IP: {session.location.ip}</span>
                        <span>Last active: {formatDate(session.lastActivity)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!session.isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'policies' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minLength">Minimum Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    value={settings.passwordPolicy.minLength}
                    onChange={(e) => updateNestedSetting('passwordPolicy.minLength', Number(e.target.value))}
                    min="6"
                    max="32"
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxAge">Password Expiry (days)</Label>
                  <Input
                    id="maxAge"
                    type="number"
                    value={settings.passwordPolicy.maxAge}
                    onChange={(e) => updateNestedSetting('passwordPolicy.maxAge', Number(e.target.value))}
                    min="30"
                    max="365"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'requireUppercase', label: 'Require uppercase letters' },
                  { key: 'requireLowercase', label: 'Require lowercase letters' },
                  { key: 'requireNumbers', label: 'Require numbers' },
                  { key: 'requireSpecialChars', label: 'Require special characters' }
                ].map((policy) => (
                  <div key={policy.key} className="flex items-center justify-between">
                    <span>{policy.label}</span>
                    <input
                      type="checkbox"
                      checked={settings.passwordPolicy[policy.key as keyof typeof settings.passwordPolicy] as boolean}
                      onChange={(e) => updateNestedSetting(`passwordPolicy.${policy.key}`, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Login Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxFailedAttempts">Max Failed Attempts</Label>
                  <Input
                    id="maxFailedAttempts"
                    type="number"
                    value={settings.loginSecurity.maxFailedAttempts}
                    onChange={(e) => updateNestedSetting('loginSecurity.maxFailedAttempts', Number(e.target.value))}
                    min="3"
                    max="10"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={settings.loginSecurity.lockoutDuration}
                    onChange={(e) => updateNestedSetting('loginSecurity.lockoutDuration', Number(e.target.value))}
                    min="5"
                    max="60"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'requireEmailVerification', label: 'Require email verification for new devices' },
                  { key: 'allowMultipleSessions', label: 'Allow multiple active sessions' }
                ].map((policy) => (
                  <div key={policy.key} className="flex items-center justify-between">
                    <span>{policy.label}</span>
                    <input
                      type="checkbox"
                      checked={settings.loginSecurity[policy.key as keyof typeof settings.loginSecurity] as boolean}
                      onChange={(e) => updateNestedSetting(`loginSecurity.${policy.key}`, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { key: 'loginAlerts', label: 'Login alerts from new devices' },
                  { key: 'passwordChanges', label: 'Password change notifications' },
                  { key: 'securityEvents', label: 'Security event notifications' },
                  { key: 'suspiciousActivity', label: 'Suspicious activity alerts' }
                ].map((notification) => (
                  <div key={notification.key} className="flex items-center justify-between">
                    <span>{notification.label}</span>
                    <input
                      type="checkbox"
                      checked={settings.notifications[notification.key as keyof typeof settings.notifications]}
                      onChange={(e) => updateNestedSetting(`notifications.${notification.key}`, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Security Activity
            </CardTitle>
            <CardDescription>
              Recent security events and login activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getEventIcon(event.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{event.description}</h4>
                      {getSeverityBadge(event.severity)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{formatDate(event.timestamp)}</span>
                      <span>IP: {event.ip}</span>
                      {event.location && (
                        <span>Location: {event.location}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}