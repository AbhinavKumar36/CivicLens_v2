import React from "react";
import { motion } from "framer-motion";
import { Headline, BodyText, Label } from "@/components/atoms/Typography";
import { useSettings } from "@/contexts/SettingsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/utils/utils";

export function Settings() {
  const { settings, updateSetting } = useSettings();
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-full max-w-4xl mx-auto py-8 flex flex-col gap-8 relative z-10">
      <header>
        <Headline className="mb-2">Settings & Accessibility</Headline>
        <BodyText className="text-on-surface-variant max-w-2xl">
          Customize your CivicLens experience. We are committed to WCAG AA compliance, ensuring the operating system works for everyone.
        </BodyText>
      </header>

      <section className="glass-panel p-6 md:p-8 rounded-[2rem] flex flex-col gap-8">
        
        {/* Theme Settings */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-foreground/5 pb-4">
            <span className="material-symbols-outlined text-primary text-2xl">palette</span>
            <h2 className="font-display-lg text-xl font-bold">Appearance</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {(['light', 'dark', 'system'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "flex-1 p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all",
                  theme === t 
                    ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(192,193,255,0.2)]"
                    : "border-foreground/10 bg-foreground/5 text-on-surface hover:bg-foreground/10 hover:border-foreground/20"
                )}
                aria-pressed={theme === t}
                aria-label={`${t} theme`}
              >
                <span className="material-symbols-outlined text-3xl">
                  {t === 'dark' ? 'dark_mode' : t === 'light' ? 'light_mode' : 'brightness_auto'}
                </span>
                <span className="font-bold capitalize">{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility Settings */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-foreground/5 pb-4 mt-4">
            <span className="material-symbols-outlined text-secondary text-2xl">accessibility_new</span>
            <h2 className="font-display-lg text-xl font-bold">Accessibility</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* High Contrast Toggle */}
            <div className="bg-surface-container/50 p-6 rounded-2xl border border-foreground/5 flex items-start justify-between gap-4 group hover:bg-surface-container transition-colors">
              <div>
                <Label className="text-on-surface text-base mb-1 block">High Contrast</Label>
                <BodyText className="text-xs text-on-surface-variant">
                  Maximizes color contrast ratios (WCAG AAA standard) for easier reading.
                </BodyText>
              </div>
              <button 
                role="switch"
                aria-checked={settings.highContrast}
                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                className={cn(
                  "w-12 h-6 rounded-full flex items-center px-1 transition-colors flex-shrink-0 relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  settings.highContrast ? "bg-primary" : "bg-surface-variant"
                )}
              >
                <motion.div 
                  layout
                  className="w-4 h-4 bg-white rounded-full shadow-sm"
                  initial={false}
                  animate={{ x: settings.highContrast ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Large Text Toggle */}
            <div className="bg-surface-container/50 p-6 rounded-2xl border border-foreground/5 flex items-start justify-between gap-4 group hover:bg-surface-container transition-colors">
              <div>
                <Label className="text-on-surface text-base mb-1 block">Large Text</Label>
                <BodyText className="text-xs text-on-surface-variant">
                  Scales up the global font size for better legibility.
                </BodyText>
              </div>
              <button 
                role="switch"
                aria-checked={settings.largeText}
                onClick={() => updateSetting('largeText', !settings.largeText)}
                className={cn(
                  "w-12 h-6 rounded-full flex items-center px-1 transition-colors flex-shrink-0 relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  settings.largeText ? "bg-primary" : "bg-surface-variant"
                )}
              >
                <motion.div 
                  layout
                  className="w-4 h-4 bg-white rounded-full shadow-sm"
                  initial={false}
                  animate={{ x: settings.largeText ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="bg-surface-container/50 p-6 rounded-2xl border border-foreground/5 flex items-start justify-between gap-4 group hover:bg-surface-container transition-colors">
              <div>
                <Label className="text-on-surface text-base mb-1 block">Reduced Motion</Label>
                <BodyText className="text-xs text-on-surface-variant">
                  Disables UI animations and transitions for users with vestibular disorders.
                </BodyText>
              </div>
              <button 
                role="switch"
                aria-checked={settings.reducedMotion}
                onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                className={cn(
                  "w-12 h-6 rounded-full flex items-center px-1 transition-colors flex-shrink-0 relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  settings.reducedMotion ? "bg-primary" : "bg-surface-variant"
                )}
              >
                <motion.div 
                  layout
                  className="w-4 h-4 bg-white rounded-full shadow-sm"
                  initial={false}
                  animate={{ x: settings.reducedMotion ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Voice Navigation Toggle */}
            <div className="bg-surface-container/50 p-6 rounded-2xl border border-foreground/5 flex items-start justify-between gap-4 group hover:bg-surface-container transition-colors">
              <div>
                <Label className="text-on-surface text-base mb-1 block">Voice Navigation <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded-full ml-2">Beta</span></Label>
                <BodyText className="text-xs text-on-surface-variant">
                  Say commands like "Go to Dashboard" to navigate without a mouse or keyboard.
                </BodyText>
              </div>
              <button 
                role="switch"
                aria-checked={settings.voiceNavigation}
                onClick={() => updateSetting('voiceNavigation', !settings.voiceNavigation)}
                className={cn(
                  "w-12 h-6 rounded-full flex items-center px-1 transition-colors flex-shrink-0 relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  settings.voiceNavigation ? "bg-primary" : "bg-surface-variant"
                )}
              >
                <motion.div 
                  layout
                  className="w-4 h-4 bg-white rounded-full shadow-sm"
                  initial={false}
                  animate={{ x: settings.voiceNavigation ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

          </div>
        </div>

      </section>
    </div>
  );
}
