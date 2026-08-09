import React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';

export function TooltipProvider({ children, ...props }) {
  return (
    <RadixTooltip.Provider delayDuration={300} {...props}>
      {children}
    </RadixTooltip.Provider>
  );
}

export function Tooltip({ children, content, side = 'top', align = 'center' }) {
  if (!content) return children;

  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>
        {children}
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          align={align}
          sideOffset={6}
          className="z-[100] px-3 py-1.5 text-sm font-medium text-stone-700 bg-white/95 backdrop-blur-sm border border-stone-200/50 shadow-sm rounded-lg animate-fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out"
        >
          {content}
          <RadixTooltip.Arrow className="fill-white/95" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
