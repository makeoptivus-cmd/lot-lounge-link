# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## Storage & Media Upload Guide

### 🎯 Storage Limits
- **Browser localStorage**: ~5-10 MB total (all data combined)
- **Maximum file per upload**: 200 MB (original file)
- **Recommended total**: Keep all data under 50 MB for reliable saving
- **Auto-compression**: All photos are automatically compressed by 60-80% ✨

### 📸 Auto-Compression for Photos
- **All photos are automatically compressed** when you upload them
- Reduces image size by 60-80% while maintaining good quality
- No action needed - happens automatically!
- Compression settings: Max 1200x1200px, 75% quality (JPEG)

### 🎥 Video File Size Tips
Videos are NOT auto-compressed (to preserve quality). 

**Safe Video Sizes:**
| Resolution | Codec | Max Size | Notes |
|-----------|-------|----------|-------|
| 480p | H.264 | 5-10 MB | Best for storage ✅ |
| 720p | H.264 | 15-20 MB | Good balance |
| 1080p+ | H.264 | 50+ MB | Not recommended |

**How to compress videos before upload:**
1. Use free tools: Handbrake, CloudConvert, or TinyWow
2. Target: 480p resolution, H.264 codec, ~3-5 MB final size
3. Upload to app → auto-saves with smaller footprint

### 💾 Storage Size Breakdown
When you save data:
- Photos: Auto-compressed, ~500KB-1MB each (stored at 75% quality)
- Videos: Store at original size, ~5-50MB each
- Form data (text): Negligible (~few KB total)

**Example Storage Usage:**
- 1 compressed photo: ~0.5-1 MB stored
- 1 small video (10MB): ~13.3 MB stored (base64 adds 33%)
- 5 photos + 1 video: ~20 MB total

### ✅ Best Practices to Avoid "Storage Quota Exceeded"
1. **Check size before saving** - App shows total size in real-time (💾 indicator)
2. **Keep total under 50 MB** - Green indicator means safe
3. **Delete old media** - Use checkbox selection → "Delete Selected"
4. **Compress videos first** - Pre-compress to 5-10 MB before upload
5. **Use photos instead of videos** when possible (much smaller)

### 🚀 Tips for Best Performance
- Upload 2-3 videos maximum per section
- Upload 5-7 photos maximum per section
- Keep each video under 20 MB
- For large workflows, use multiple owner profiles

### Error Messages & Solutions

| Error | Solution |
|-------|----------|
| "Storage quota exceeded. Files are too large" | Delete old media, reduce video sizes |
| "Video too large. Compress to <50MB" | Pre-compress video using HandBrake |
| "May struggle to save. Pre-compress if possible" | Video >20MB - consider smaller file |

---

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
