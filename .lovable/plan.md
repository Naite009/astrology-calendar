

# Add Personal Context to Quick Topic Readings

## The Idea

Instead of keeping specific questions separate, we incorporate the user's personal context directly into the structured reading prompt. When someone clicks "Love & Relationships," instead of auto-submitting immediately, a small input appears asking: **"Anything specific on your mind?"** — optional, skippable. If they type something like *"I was asked to the movies by someone with earth qualities"*, that context gets woven into the full structured prompt so the AI addresses it within the comprehensive reading.

This is better than keeping questions separate because:
- The AI can connect the specific situation to the person's chart patterns
- It feels like a consultation, not a generic report
- The structured framework still runs (7th house first, timing layers, etc.) but now with a personal anchor

## How It Works (User Experience)

1. User clicks a Quick Topic button (e.g., "Love & Relationships")
2. A small modal or inline expansion appears:
   - **"Anything specific you'd like addressed in this reading?"**
   - A text input with placeholder: *e.g., "I met someone earthy, should I pursue it?"*
   - Two buttons: **"Include & Generate"** and **"Skip — General Reading"**
3. If they add context, it gets prepended to the structured prompt as a `PERSONAL CONTEXT` block
4. The AI is instructed to weave that context into the relevant sections (not as a separate answer, but integrated)

## Technical Changes

### 1. Update `AskQuickTopics.tsx`
- Change `onSelect` callback signature to pass both the topic ID and an optional personal context string
- Instead of immediately calling `onSelect(topic.prompt(...))`, show a small inline dialog below the clicked button
- Add a state for the active topic and the user's optional input
- On confirm, call `onSelect` with the full prompt that includes the personal context block

### 2. Update each Quick Topic prompt template
- Add a conditional `PERSONAL CONTEXT` block at the top of each prompt:
  ```
  PERSONAL CONTEXT: The person specifically wants to know about: "[user input]"
  Weave this into the relevant sections of your analysis. Do not create a separate section for it — integrate it naturally where it fits (e.g., timing, compatibility patterns, attraction style).
  ```

### 3. Update `AskView.tsx`
- Adjust `handleQuickTopic` to accept the final assembled prompt string (no structural change needed since the prompt is already a string)

### 4. Prompt integration rule
- The `PERSONAL CONTEXT` block tells the AI: "Address this within the existing framework sections, don't add a new section or answer it separately"
- For relationships: the earth-quality person would get addressed in the Mars/attraction section, the 5th house dating section, and the timing section
- For relocation: "I got a job offer in Denver" would get addressed in the career score and timing sections

## What stays the same
- All 13 relationship factors still run in order
- The 3-layer timing architecture still generates
- The structured JSON output format is unchanged
- Skipping the context field produces the exact same reading as today

