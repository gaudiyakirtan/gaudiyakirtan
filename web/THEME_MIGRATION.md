# Theme System Migration Guide

This document outlines how to migrate from the current dual theme (gaur/shyam with explicit dark mode) to a simpler theme system using CSS variables.

## Background

Previously, we were using Tailwind classes with explicit light/dark mode selectors like:

```jsx
<h2 className="text-gaur-primary dark:text-shyam-primary">Title</h2>
```

This approach has several drawbacks:
- Verbose class names
- Requires explicit dark mode handling in every component
- Duplicated color definitions in both Tailwind config and CSS variables
- Potential for inconsistency between themes

## New Approach

We've updated the system to use CSS variables that automatically switch between light and dark mode:

```jsx
<h2 className="text-primary">Title</h2>
```

Benefits:
- Shorter, more readable class names
- Automatic dark mode handling via CSS variables
- Single source of truth for colors
- Easier to maintain and update

## Implementation Details

1. **CSS Variables (already implemented in `colors.css`):**

```css
:root {
  /* Light mode colors (Gaur) */
  --gaur-primary: #1A1A1A;
  --gaur-secondary: #3A3A3A;
  /* ... other colors ... */
  
  /* Dark mode colors (Shyam) */
  --shyam-primary: #E0E0E0;
  --shyam-secondary: #B8B8B8;
  /* ... other colors ... */
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --primary: var(--shyam-primary);
    --secondary: var(--shyam-secondary);
    /* ... other mappings ... */
  }
}

/* Light mode (default) */
:root {
  --primary: var(--gaur-primary);
  --secondary: var(--gaur-secondary);
  /* ... other mappings ... */
}
```

2. **Tailwind Configuration (updated):**

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Theme colors using CSS variables
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
        accent: 'var(--accent)',
        background: 'var(--background)',
        'background-offset': 'var(--background-offset)',
        border: 'var(--border)',
        neutral: 'var(--neutral)',
        
        // Legacy colors (kept for backward compatibility)
        gaur: { /* ... */ },
        shyam: { /* ... */ },
      },
    },
  },
}
```

## Migration Steps

1. **Find and Replace:**

Instead of:
```jsx
className="text-gaur-primary dark:text-shyam-primary"
```

Use:
```jsx
className="text-primary"
```

2. **Common Replacements:**

| Old Pattern | New Replacement |
|-------------|----------------|
| `text-gaur-primary dark:text-shyam-primary` | `text-primary` |
| `text-gaur-secondary dark:text-shyam-secondary` | `text-secondary` |
| `text-gaur-tertiary dark:text-shyam-tertiary` | `text-tertiary` |
| `text-gaur-accent dark:text-shyam-accent` | `text-accent` |
| `bg-gaur-background dark:bg-shyam-background` | `bg-background` |
| `bg-gaur-background-offset dark:bg-shyam-background-offset` | `bg-background-offset` |
| `border-gaur-border dark:border-shyam-border` | `border-border` |

3. **Handling Alpha/Opacity:**

Instead of:
```jsx
className="bg-gaur-neutral/25 dark:bg-shyam-neutral/25"
```

Use:
```jsx
className="bg-neutral/25"
```

## Example Migration

### Before:

```jsx
<div className="bg-gaur-background-offset dark:bg-shyam-background-offset rounded-xl">
  <h2 className="text-xl font-bold text-gaur-primary dark:text-shyam-primary">
    {title}
  </h2>
  <p className="text-gaur-tertiary dark:text-shyam-tertiary">
    {description}
  </p>
</div>
```

### After:

```jsx
<div className="bg-background-offset rounded-xl">
  <h2 className="text-xl font-bold text-primary">
    {title}
  </h2>
  <p className="text-tertiary">
    {description}
  </p>
</div>
```

## Benefits

- **Less Code**: Fewer characters, more readable
- **Automatic Dark Mode**: No need to specify dark variants
- **Easier Maintenance**: One place to update colors
- **Better Performance**: Fewer classes to process
- **Simpler Theme Updates**: Change once in CSS, applies everywhere

## Legacy Support

The original `gaur-*` and `shyam-*` color classes are still available for backward compatibility, but we recommend gradually migrating to the new approach for all new components and when updating existing ones.