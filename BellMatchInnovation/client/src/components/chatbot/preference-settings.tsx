import React from 'react';
import { UserPreferences } from '../../hooks/use-user-preferences';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface ProcurementChatPreferencesProps {
  preferences: UserPreferences;
  updateChatPreferences: (updates: Partial<UserPreferences['chatPreferences']>) => void;
  updateInterfacePreferences: (updates: Partial<UserPreferences['interfacePreferences']>) => void;
  resetPreferences: () => void;
}

/**
 * Component that allows users to modify their chatbot preferences
 */
export const ProcurementChatPreferences: React.FC<ProcurementChatPreferencesProps> = ({
  preferences,
  updateChatPreferences,
  updateInterfacePreferences,
  resetPreferences
}) => {

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'zh', label: 'Chinese' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'ar', label: 'Arabic' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'ru', label: 'Russian' },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Chat Preferences</CardTitle>
        <CardDescription>
          Customize how the procurement assistant works for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-md font-medium">Language</h3>
          <p className="text-sm text-muted-foreground">
            Choose your preferred language for responses
          </p>
          <Select 
            value={preferences.chatPreferences.language} 
            onValueChange={(value) => updateChatPreferences({ language: value })}
          >
            <SelectTrigger className="w-full md:w-[240px]">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-md font-medium">Detail Level</h3>
          <p className="text-sm text-muted-foreground">
            How detailed should the responses be?
          </p>
          <RadioGroup 
            value={preferences.chatPreferences.detailLevel}
            onValueChange={(value) => updateChatPreferences({ 
              detailLevel: value as 'basic' | 'detailed' | 'comprehensive' 
            })}
            className="space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="basic" id="detail-basic" />
              <Label htmlFor="detail-basic">Basic</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="detailed" id="detail-detailed" />
              <Label htmlFor="detail-detailed">Detailed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comprehensive" id="detail-comprehensive" />
              <Label htmlFor="detail-comprehensive">Comprehensive</Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-md font-medium">Additional Options</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="suggestions">Show Suggestions</Label>
              <p className="text-sm text-muted-foreground">Show suggestion chips for common questions</p>
            </div>
            <Switch 
              id="suggestions"
              checked={preferences.chatPreferences.suggestionsEnabled}
              onCheckedChange={(checked) => updateChatPreferences({ suggestionsEnabled: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-scroll">Auto-scroll to New Messages</Label>
              <p className="text-sm text-muted-foreground">Automatically scroll to the latest message</p>
            </div>
            <Switch 
              id="auto-scroll"
              checked={preferences.chatPreferences.autoScrollEnabled}
              onCheckedChange={(checked) => updateChatPreferences({ autoScrollEnabled: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="supplier-info">Include Supplier Information</Label>
              <p className="text-sm text-muted-foreground">Include supplier data in responses when relevant</p>
            </div>
            <Switch 
              id="supplier-info"
              checked={preferences.chatPreferences.includeSupplierInfo}
              onCheckedChange={(checked) => updateChatPreferences({ includeSupplierInfo: checked })}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-md font-medium">Interface Preferences</h3>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Theme</p>
            <RadioGroup 
              value={preferences.interfacePreferences.theme}
              onValueChange={(value) => updateInterfacePreferences({ 
                theme: value as 'light' | 'dark' | 'system' 
              })}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="theme-system" />
                <Label htmlFor="theme-system">System</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2 mt-4">
            <p className="text-sm text-muted-foreground">Font Size</p>
            <RadioGroup 
              value={preferences.interfacePreferences.fontSize}
              onValueChange={(value) => updateInterfacePreferences({ 
                fontSize: value as 'small' | 'medium' | 'large' 
              })}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="font-small" />
                <Label htmlFor="font-small">Small</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="font-medium" />
                <Label htmlFor="font-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="font-large" />
                <Label htmlFor="font-large">Large</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="space-y-0.5">
              <Label htmlFor="timestamps">Show Timestamps</Label>
              <p className="text-sm text-muted-foreground">Display timestamps on messages</p>
            </div>
            <Switch 
              id="timestamps"
              checked={preferences.interfacePreferences.showTimestamps}
              onCheckedChange={(checked) => updateInterfacePreferences({ showTimestamps: checked })}
            />
          </div>
        </div>

        <button
          onClick={resetPreferences}
          className="mt-4 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium"
        >
          Reset to Defaults
        </button>
      </CardContent>
    </Card>
  );
};