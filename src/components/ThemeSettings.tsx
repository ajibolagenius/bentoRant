import React from 'react';
import { useAccessibility } from '@/components/AccessibilityContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SunIcon, MoonIcon, DesktopIcon } from '@radix-ui/react-icons';

type ThemeType = 'light' | 'dark' | 'system';

const ThemeSettings: React.FC = () => {
    const { theme, setTheme } = useAccessibility();

    return (
        <div className="space-y-6 p-2" role="region" aria-label="Theme settings">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Theme</h3>
                <p className="text-sm text-muted-foreground">Choose your preferred color theme</p>
            </div>

            <Separator />

            <div className="space-y-4">
                <RadioGroup
                    value={theme}
                    onValueChange={(value) => setTheme(value as ThemeType)}
                    className="space-y-4"
                >
                    <div className="flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:bg-accent hover:text-accent-foreground">
                        <RadioGroupItem value="light" id="theme-light" aria-label="Light theme" />
                        <Label htmlFor="theme-light" className="flex flex-1 items-center justify-between cursor-pointer">
                            <div className="flex items-center space-x-3">
                                <SunIcon className="h-5 w-5" />
                                <span>Light Theme</span>
                            </div>
                        </Label>
                    </div>

                    <div className="flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:bg-accent hover:text-accent-foreground">
                        <RadioGroupItem value="dark" id="theme-dark" aria-label="Dark theme" />
                        <Label htmlFor="theme-dark" className="flex flex-1 items-center justify-between cursor-pointer">
                            <div className="flex items-center space-x-3">
                                <MoonIcon className="h-5 w-5" />
                                <span>Dark Theme</span>
                            </div>
                        </Label>
                    </div>

                    <div className="flex items-center space-x-3 rounded-md border p-3 cursor-pointer hover:bg-accent hover:text-accent-foreground">
                        <RadioGroupItem value="system" id="theme-system" aria-label="System theme" />
                        <Label htmlFor="theme-system" className="flex flex-1 items-center justify-between cursor-pointer">
                            <div className="flex items-center space-x-3">
                                <DesktopIcon className="h-5 w-5" />
                                <span>System Theme</span>
                            </div>
                        </Label>
                    </div>
                </RadioGroup>
            </div>
        </div>
    );
};

export default ThemeSettings;
