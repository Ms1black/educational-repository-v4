# Motion (Framer Motion) Next.js Master Guide

## Overview
Motion (package: `motion`, formerly `framer-motion`) is the industry-standard React animation library. This unified guide is specifically optimized for **Next.js (App Router)**, combining core concepts, performance optimizations, and production-ready patterns into a single source of truth.

**Package Version:** `motion@12.23.24` (or `framer-motion@12.23.24`)
**Framework:** Next.js 14/15+ (App Router)

---

## 1. Next.js Integration (CRITICAL RULES)

### The `"use client"` Directive
Motion components rely on React context, DOM APIs, and effects. They **cannot** be rendered on the server.
**Rule:** Any file using `motion`, `AnimatePresence`, or hooks like `useScroll` MUST start with `"use client"`.

**Best Practice (Wrapper Component):**
Instead of making entire pages Client Components, create animated wrapper components:
```tsx
// components/MotionDiv.tsx
"use client"
import { motion, HTMLMotionProps } from "motion/react"

export const MotionDiv = (props: HTMLMotionProps<"div">) => {
  return <motion.div {...props} />
}
```

### Page Transitions (App Router)
To animate between pages in the App Router, you **must use `template.tsx`**, not `layout.tsx`. Layouts do not remount on navigation, so exit animations won't trigger.

```tsx
// app/template.tsx
"use client"
import { motion } from "motion/react"

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
```
*Note: App Router currently has known limitations with `AnimatePresence` and exit animations on route changes. Soft navigation often bypasses standard unmounts.*

---

## 2. Core Concepts Deep Dive

### Orchestration & Variants
Variants allow you to control child animations from a parent component without passing props manually.

```tsx
"use client"
import { motion } from "motion/react"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" } }
}

export function StaggeredList() {
  return (
    <motion.ul variants={containerVariants} initial="hidden" animate="show">
      <motion.li variants={itemVariants}>Item 1</motion.li>
      <motion.li variants={itemVariants}>Item 2</motion.li>
      <motion.li variants={itemVariants}>Item 3</motion.li>
    </motion.ul>
  )
}
```

### Shared Element Transitions (Layout Animations)
Use `layoutId` to smoothly animate an element that changes context or route (e.g., clicking a list item to open a full-screen detail view).

```tsx
"use client"
import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"

export function SharedCard() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <>
      <motion.div layoutId="card-1" onClick={() => setSelectedId("1")}>
        <motion.h2 layoutId="title-1">Click Me</motion.h2>
      </motion.div>

      <AnimatePresence>
        {selectedId && (
          <motion.div layoutId={`card-${selectedId}`} className="fixed inset-0 z-50">
            <motion.h2 layoutId={`title-${selectedId}`}>Full Screen!</motion.h2>
            <button onClick={() => setSelectedId(null)}>Close</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

---

## 3. Performance Optimization (Bundle Size)

Motion is ~34 KB. For Next.js applications, you should use `LazyMotion` at your root layout to reduce the initial JS payload to **4.6 KB**.

**Step 1: Setup Lazy Provider**
```tsx
// components/MotionProvider.tsx
"use client"
import { LazyMotion, domAnimation } from "motion/react"

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  )
}
```

**Step 2: Wrap Root Layout**
```tsx
// app/layout.tsx
import { MotionProvider } from "@/components/MotionProvider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  )
}
```

**Step 3: Use `m` instead of `motion`**
```tsx
"use client"
import { m } from "motion/react"

export function OptimizedComponent() {
  return <m.div animate={{ scale: 1.2 }}>Small bundle!</m.div>
}
```

---

## 4. Common Production Patterns

### 1. Animated Modal with Backdrop Blur
```tsx
"use client"
import { motion, AnimatePresence } from "motion/react"

export function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```
*Crucial Rule:* `AnimatePresence` must stay mounted. It wraps the condition `isOpen && ...`.

### 2. Auto-Height Accordion
Animating height from `0` to `auto` is natively supported.
```tsx
"use client"
import { motion, AnimatePresence } from "motion/react"

export function Accordion({ isOpen, content }) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          style={{ overflow: "hidden" }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

### 3. Scroll-Driven Parallax
```tsx
"use client"
import { motion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"

export function ParallaxHero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })
  
  // As user scrolls down, element moves up at half speed
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  return (
    <div ref={ref} className="h-screen overflow-hidden">
      <motion.div style={{ y, opacity }} className="h-full w-full bg-blue-500">
        Parallax Content
      </motion.div>
    </div>
  )
}
```

---

## 5. Accessibility (A11y)

Always respect system-level "reduce motion" preferences. Next.js users often test for strict a11y compliance.

```tsx
"use client"
import { MotionConfig } from "motion/react"

export function Providers({ children }) {
  return (
    // 'user' automatically disables transform/layout animations if the OS requests it
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  )
}
```
*Note: Using `whileFocus` instead of just `whileHover` ensures keyboard navigators also see interaction states.*

---

## 6. Troubleshooting & Known Issues

1. **Next.js SSR Hydration Mismatch**
   * **Cause:** Server renders static HTML, client hydrates with animated styles causing a flash.
   * **Fix:** Use `initial={false}` if the component should start in its animated state immediately, or ensure the initial state matches the static CSS.

2. **Tailwind Conflicts**
   * **Cause:** Using Tailwind's `transition-all` on a `<motion.div>`.
   * **Fix:** **Never** mix CSS transitions with Motion properties. Remove `transition-*` and `duration-*` classes from elements animated by Motion.

3. **Exit Animations Not Firing**
   * **Cause:** Parent component is unmounted before `AnimatePresence` can run exits.
   * **Fix:** `AnimatePresence` must be wrapping the condition, and children must have unique `key` props.

4. **Cloudflare / Edge Runtime build errors**
   * **Cause:** The `motion` package sometimes conflicts with specific Edge bundlers.
   * **Fix:** If deploying to Vercel Edge or Cloudflare, and you see build errors, install `framer-motion@12.23.24` instead of `motion`, the API is exactly the same.
```

