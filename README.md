# PromptCraft Forge - AI Prompt Generation Platform

## Project info

**URL**: https://lovable.dev/projects/e08736c2-70e7-407f-9cb8-700968702efc

## 📚 **Rulebooks & Standards**

For development standards and code review guidelines, see the [rulebooks directory](./rulebooks/):
- [Code Review Checklist](./rulebooks/CODE_REVIEW_CHECKLIST.md) - Comprehensive code quality standards
- [Application Architecture Rulebook](./rulebooks/APPLICATION_ARCHITECTURE_RULEBOOK.md) - Architectural patterns and structural guidelines
- [Styling Rulebook](./rulebooks/STYLING_RULEBOOK.md) - Styling standards and design system
- [Services Rulebook](./rulebooks/SERVICES_RULEBOOK.md) - Service architecture and implementation patterns
- [Rulebooks Overview](./rulebooks/README.md) - Guide to using project rulebooks

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e08736c2-70e7-407f-9cb8-700968702efc) and start prompting.

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
- EmailJS (for feedback form emails)

## EmailJS Setup

This project includes a feedback form that sends emails using EmailJS. To set it up:

1. **Quick Setup:**
   ```sh
   npm run setup-emailjs
   ```

2. **Manual Setup:**
   - Copy `src/lib/emailConfig.private.template.ts` to `src/lib/emailConfig.private.ts`
   - Update the credentials in the private file with your EmailJS details
   - The private file is automatically ignored by Git

3. **Detailed Instructions:**
   See [EMAILJS_SETUP.md](./EMAILJS_SETUP.md) for complete setup guide.

**Note:** The private configuration file contains sensitive credentials and is automatically excluded from version control.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e08736c2-70e7-407f-9cb8-700968702efc) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
