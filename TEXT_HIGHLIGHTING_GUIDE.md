# Text Highlighting Feature Guide

## Overview
You can now highlight specific portions of text within any text field in the Owner Profile. This is useful for emphasizing important details in notes, meeting details, negotiation information, etc.

## How to Use

### 1. **Enable Highlighting**
When viewing a text field in the Owner Profile:
- The text will display in a bordered box
- You can select any portion of text by clicking and dragging

### 2. **Select Text**
- Click and drag to select the text you want to highlight
- A color toolbar will appear with 5 color options:
  - **Yellow** - For general highlights
  - **Orange** - For important notes
  - **Red** - For urgent/critical information
  - **Blue** - For questions or clarifications
  - **Green** - For completed/verified items

### 3. **Apply Highlight**
- Click on any color button to apply the highlight
- The selected text will now display with a colored background
- You can select multiple different text segments and give each a different color

### 4. **View Highlights**
- All highlights are shown in a summary box below the text
- Each highlight shows:
  - The highlighted text
  - The highlight color
  - A delete button (✕) to remove it

### 5. **Remove Highlights**
- Click the ✕ button next to any highlight in the summary
- Or click directly on the highlighted text in the main display to remove it

### 6. **Edit with Highlights**
- Click the Edit button (pencil icon) to edit the field
- Your highlights will be preserved when you edit
- You can add new highlights or modify existing ones
- Click Save to persist changes

### 7. **Supported Fields**
Text highlighting is available on fields with longer text content:
- **Site Visit** - `notes`
- **Meeting Place** - `placeAddress`
- **Buyer-Seller Meeting** - `meetingNotes`, `buyerAddress`
- **Land Details** - `fmSketch`, `siteSketch`
- **Owner Meeting** - `negotiationDetails`
- **Mediation** - `mediationDetails`, `outcome`
- **Advance Registration** - `notes`

## Highlight Colors and Their Use

| Color | Use Case |
|-------|----------|
| 🟨 Yellow | General highlighting, citations |
| 🟧 Orange | Important but not urgent, follow-up items |
| 🟥 Red | Critical, urgent, or problematic information |
| 🟦 Blue | Questions, unclear points, needs clarification |
| 🟩 Green | Completed tasks, verified information, agreements |

## Data Persistence

- All highlights are automatically saved to localStorage
- Highlights persist across browser sessions
- When you export to PDF, highlighted text appears with the selected color

## Example Workflow

1. You're reviewing meeting notes with important price information
2. Select "₹ 50 lakh" and highlight it in red (critical price)
3. Select "Agent to follow up" and highlight it in orange (action item)
4. Select "Buyer approved" and highlight it in green (completed)
5. Your highlights are now saved and visible every time you view this record

## Tips & Tricks

- **Copy highlighting**: If you need to highlight the same text pattern across records, manually select and highlight each instance
- **Color coding system**: Establish a team standard for what each color means
- **Overlapping highlights**: You can't have overlapping highlights - selecting overlapped text will replace the existing highlight
- **Keyboard friendly**: Use Tab to navigate between fields and then click to select text

## Troubleshooting

**Highlights not appearing?**
- Refresh the page - highlights are stored in browser localStorage
- Check browser console for errors
- Ensure JavaScript is enabled

**Can't select text?**
- Make sure you're clicking in the text area
- Try a slower drag motion when selecting
- The field must have content to highlight

**Highlight disappeared?**
- Check if you accidentally clicked it (clicking a highlight removes it)
- Browser storage might have been cleared - check localStorage settings
- Export data regularly as backup
