# Text Highlighting in Forms - Complete Guide

## Overview
You can now highlight important text directly within textarea fields (Notes, Negotiation Details, Mediation Details, etc.) with automatic calculation and statistics.

## Where Can You Highlight?

Text highlighting is available in these textarea fields:
- **Site Visit** → Notes
- **Owner Meeting & Price** → Negotiation Details
- **Mediation** → Details, Outcome
- **Buyer-Seller Meeting** → Meeting Notes
- **Advance & Registration** → Notes
- **Land Details** → FM Sketch, Site Sketch

## How to Highlight Text

### Step 1: Click Edit
- Click the pencil icon (Edit button) on the field you want to highlight
- The field will enter edit mode

### Step 2: Select Text to Highlight
- In the preview box labeled "Click and drag to highlight important parts", click and drag to select the text you want to highlight
- You can select any portion of the text

### Step 3: Choose Color
- A color toolbar will appear with 5 color options:
  - 🟨 **Yellow** - General importance
  - 🟧 **Orange** - Important items
  - 🟥 **Red** - Urgent/Critical
  - 🟦 **Blue** - Questions/Clarifications
  - 🟩 **Green** - Completed/Verified

### Step 4: View Statistics
- **Highlighted Sections** box shows:
  - Count of highlighted sections
  - Total characters highlighted
  - Percentage of text highlighted
  - Visual list of all highlighted portions

### Step 5: Save Changes
- Click the **Save** button to save the text and highlights
- Highlights are preserved when you view the record

## Features

### Real-Time Editing
- Both an interactive highlighting preview AND direct text editing
- Edit the text directly in the textarea and your highlights stay intact
- Change highlights at any time

### Automatic Statistics
Shows three key metrics:
1. **Number of Sections** - How many different parts are highlighted
2. **Character Count** - Total characters highlighted vs. total
3. **Coverage %** - What percentage of the text is highlighted

### Remove Highlights
- Click the ✕ button on any highlighted section to remove it
- Click directly on the highlighted text in the preview to remove

### View Mode
- When viewing a record, highlights are displayed with their statistics
- Shows a summary of all highlighted sections below the text

## Best Practices

### Color Coding Strategy
| Color | Best For |
|-------|----------|
| 🟨 Yellow | Key facts, important dates |
| 🟧 Orange | Follow-up items, tasks pending |
| 🟥 Red | Critical issues, urgent actions |
| 🟦 Blue | Questions, needs clarification |
| 🟩 Green | Agreements, completed actions |

### Example Workflow

**Scenario:** Recording meeting negotiation details

```
Original Text:
"Met with owner on 15-Jan-2025. Discussed land rate ₹5 lakhs/cent. Owner agreed to ₹4.5 lakhs subject to buyer approval. Need to confirm with buyer by 20-Jan. Border dispute pending resolution."

Highlighted as:
- 🟩 "15-Jan-2025" (Green - confirmed date)
- 🟧 "₹5 lakhs/cent" (Orange - starting offer)
- 🟩 "₹4.5 lakhs" (Green - agreed price)
- 🟧 "confirm with buyer by 20-Jan" (Orange - deadline)
- 🟥 "Border dispute pending" (Red - critical issue)

Statistics:
- 5 sections highlighted
- 87 characters highlighted
- 18.1% of content highlighted
```

## Tips & Tricks

### Multi-Selection
- Highlight different parts of the text with different colors
- Overlapping highlights aren't allowed - newer selection replaces older

### Keyboard Shortcuts
- Use Tab to navigate to the next field
- Use Shift+Tab to go to previous field
- Click to position cursor in text

### Copy Highlighting Pattern
- When you've established a good highlighting system, use the same colors for similar information across different records

### Partial Text Selection
- You can highlight individual words, phrases, or entire sentences
- Be specific - highlight only what's truly important

## Troubleshooting

**Highlights not showing in preview?**
- Make sure the text appears in the main preview box first
- Try selecting text more slowly

**Color not changing?**
- Click the color button after selecting text
- If selection is lost, try again with a slower drag motion

**Highlights disappeared after save?**
- Refresh the page - they're stored in browser storage
- Check if data was actually saved (look for success toast notification)

**Can't see statistics?**
- Scroll down in the edit panel to see the statistics box
- The box appears below the text input areas

## Data Persistence

- All highlights are automatically saved to browser localStorage
- Highlights persist across browser sessions
- When exporting to PDF, all highlights are included with their colors
- Backup your data regularly as browser storage can be cleared

## Performance Notes

- Highlighting works smoothly for up to 500 characters
- For very long notes (1000+ characters), selection may be slower
- Keep important content concise for better highlighting

## Example Use Cases

### Use Case 1: Meeting Notes
Highlight prices, dates, and action items to quickly scan key information

### Use Case 2: Negotiation Details
Color-code different proposals, agreed terms, and pending items

### Use Case 3: Mediation Records
Highlight disputes, resolutions, and follow-up actions

### Use Case 4: Site Visit Notes
Mark important observations, measurements, and concerns separately
