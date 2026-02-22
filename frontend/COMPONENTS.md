# Component Architecture

This document describes the modular component structure of the WanderWise AI frontend application.

## Directory Structure

```
components/
├── ui/                 # Reusable UI primitives
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── SearchInput.tsx
│   └── index.ts
├── layout/            # Layout components
│   ├── Header.tsx
│   ├── Stepper.tsx
│   └── index.ts
├── features/          # Feature-specific components
│   ├── InputStep.tsx
│   ├── ProcessingStep.tsx
│   ├── DirectionStep.tsx
│   ├── BudgetStep.tsx
│   ├── FinalStep.tsx
│   └── index.ts
└── index.ts          # Central export point

types/
└── index.ts          # TypeScript type definitions

lib/
└── mockData.tsx      # Mock data for development
```

## Design Principles

### 1. Single Responsibility Principle (SRP)
Each component has a single, well-defined purpose:
- **UI components** provide reusable primitives
- **Layout components** handle page structure
- **Feature components** implement business logic

### 2. Don't Repeat Yourself (DRY)
Common patterns are extracted into reusable components:
- Badge component handles all status indicators
- Button component with multiple variants
- Card component for consistent containers

### 3. Type Safety
All components use TypeScript with proper type definitions:
- Props are strongly typed
- Interfaces defined in `types/index.ts`
- No `any` types used

### 4. Component Composition
Components are designed to be composable:
- UI components can be combined
- Feature components use UI components
- Clear parent-child relationships

## Component Categories

### UI Components (`components/ui/`)

**Purpose**: Reusable, presentational components that handle visual styling and basic interactions.

#### Badge
Status indicators and labels with multiple variants.

```tsx
<Badge variant="amber" icon={ShieldCheck}>
  Verified
</Badge>
```

**Props**:
- `variant`: "default" | "amber" | "emerald" | "stone"
- `size`: "sm" | "md"
- `icon`: Optional Lucide icon
- `className`: Additional CSS classes

#### Button
Action buttons with variants and sizes.

```tsx
<Button 
  variant="primary" 
  size="lg" 
  icon={<ArrowRight />}
  onClick={handleClick}
>
  Continue
</Button>
```

**Props**:
- `variant`: "primary" | "secondary" | "outline"
- `size`: "sm" | "md" | "lg"
- `icon`: Optional icon element
- `iconPosition`: "left" | "right"
- `fullWidth`: Boolean for full-width button

#### Card
Container component for content sections.

```tsx
<Card variant="elevated" padding="lg" rounded="3xl">
  {children}
</Card>
```

**Props**:
- `variant`: "default" | "dark" | "outlined" | "elevated"
- `padding`: "sm" | "md" | "lg"
- `rounded`: "md" | "lg" | "xl" | "2xl" | "3xl"
- `hoverable`: Boolean for hover effects
- `onClick`: Optional click handler

#### SearchInput
Search input with integrated submit button.

```tsx
<SearchInput
  value={query}
  onChange={setQuery}
  onSubmit={handleSearch}
  placeholder="Enter query..."
  submitButton={<Button>Search</Button>}
/>
```

### Layout Components (`components/layout/`)

**Purpose**: Handle application structure and navigation.

#### Header
Top navigation bar with logo and status indicator.

```tsx
<Header currentStep={step} />
```

**Features**:
- Responsive navigation
- Agent status indicator
- Sticky positioning

#### Stepper
Floating step progress indicator (desktop only).

```tsx
<Stepper currentStep={step} />
```

**Features**:
- Visual progress tracking
- Smooth animations
- Desktop-only display

### Feature Components (`components/features/`)

**Purpose**: Implement specific application features and user workflows.

#### InputStep
Initial travel query input screen.

```tsx
<InputStep
  query={query}
  onQueryChange={setQuery}
  onStartPlanning={handleStart}
/>
```

**Features**:
- Large search input
- Popular query suggestions
- Hero content

#### ProcessingStep
Agent thinking visualization.

```tsx
<ProcessingStep
  currentThinking={message}
  completedSteps={steps}
/>
```

**Features**:
- Animated loading indicator
- Real-time thinking updates
- Completed step list

#### DirectionStep
Travel option selection.

```tsx
<DirectionStep
  options={travelOptions}
  onSelectOption={handleSelect}
/>
```

**Features**:
- Multiple option cards
- Price comparison
- Validation badges

#### BudgetStep
Budget breakdown and approval.

```tsx
<BudgetStep
  totalBudget="13,400"
  strategyId="RS-402"
  items={budgetItems}
  onApprove={handleApprove}
  onRecalibrate={handleRecalibrate}
/>
```

**Features**:
- Detailed cost breakdown
- Agent reasoning display
- Approval/recalibration actions

#### FinalStep
Complete trip itinerary dossier.

```tsx
<FinalStep tripPlan={tripPlan} />
```

**Features**:
- Day-by-day itinerary
- Booking links
- Intelligence insights
- Verification checklist

## Type Definitions

All types are defined in `types/index.ts`:

```typescript
// Step management
type StepType = "input" | "processing" | "direction" | "budget" | "final";

// Data structures
interface AgentThinking { agent: string; msg: string; }
interface TravelOption { id: string; title: string; price: string; ... }
interface BudgetItem { cat: string; cost: number; icon: ReactNode; ... }
interface TripPlan { destination: string; days: DayItinerary[]; ... }
```

## Usage Examples

### Creating a New Feature Component

```tsx
import React from "react";
import { Button, Card } from "@/components/ui";

interface MyFeatureProps {
  data: string;
  onAction: () => void;
}

export const MyFeature: React.FC<MyFeatureProps> = ({ 
  data, 
  onAction 
}) => {
  return (
    <Card variant="default" padding="lg">
      <h2>{data}</h2>
      <Button variant="primary" onClick={onAction}>
        Take Action
      </Button>
    </Card>
  );
};
```

### Composing Components

```tsx
import { InputStep, ProcessingStep } from "@/components/features";
import { Header } from "@/components/layout";

export default function Page() {
  return (
    <>
      <Header currentStep="input" />
      <main>
        <InputStep {...props} />
      </main>
    </>
  );
}
```

## Best Practices

1. **Keep components focused**: Each component should do one thing well
2. **Use TypeScript**: Always define prop types
3. **Document props**: Include JSDoc comments for complex props
4. **Extract constants**: Move hardcoded values to constants or config
5. **Handle errors**: Include error boundaries and validation
6. **Test isolation**: Components should be testable in isolation
7. **Accessibility**: Include ARIA labels and keyboard navigation
8. **Performance**: Use React.memo for expensive components

## Future Enhancements

- [ ] Add loading states to all async operations
- [ ] Implement error boundaries
- [ ] Add animation variants to components
- [ ] Create Storybook documentation
- [ ] Add unit tests for all components
- [ ] Implement accessibility improvements
- [ ] Add dark mode support
- [ ] Create component playground
