# Integrating MiniKit with Existing Applications

> Guide for integrating MiniKit into an existing Next.js project with installation, provider setup, and environment configuration

export const Button = ({children, disabled, variant = "primary", size = "medium", iconName, roundedFull = false, className = '', fullWidth = false, onClick = undefined}) => {
  const variantStyles = {
    primary: 'bg-blue text-black border border-blue hover:bg-blue-80 active:bg-[#06318E] dark:text-white',
    secondary: 'bg-white border border-white text-palette-foreground hover:bg-zinc-15 active:bg-zinc-30',
    outlined: 'bg-transparent text-white border border-white hover:bg-white hover:text-black active:bg-[#E3E7E9]'
  };
  const sizeStyles = {
    medium: 'text-md px-4 py-2 gap-3',
    large: 'text-lg px-6 py-4 gap-5'
  };
  const sizeIconRatio = {
    medium: '0.75rem',
    large: '1rem'
  };
  const classes = ['text-md px-4 py-2 whitespace-nowrap', 'flex items-center justify-center', 'disabled:opacity-40 disabled:pointer-events-none', 'transition-all', variantStyles[variant], sizeStyles[size], roundedFull ? 'rounded-full' : 'rounded-lg', fullWidth ? 'w-full' : 'w-auto', className];
  const buttonClasses = classes.filter(Boolean).join(' ');
  const iconSize = sizeIconRatio[size];
  return <button type="button" disabled={disabled} className={buttonClasses} onClick={onClick}>
      <span>{children}</span>
      {iconName && <Icon name={iconName} width={iconSize} height={iconSize} color="currentColor" />}
    </button>;
};

export const BaseBanner = ({content = null, id, dismissable = true}) => {
  const LOCAL_STORAGE_KEY_PREFIX = 'cb-docs-banner';
  const [isVisible, setIsVisible] = useState(false);
  const onDismiss = () => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`, 'false');
    setIsVisible(false);
  };
  useEffect(() => {
    const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}-${id}`);
    setIsVisible(storedValue !== 'false');
  }, []);
  if (!isVisible) {
    return null;
  }
  return <div className="fixed bottom-0 left-0 right-0 bg-white py-8 px-4 lg:px-12 z-50 text-black dark:bg-black dark:text-white border-t dark:border-gray-95">
      <div className="flex items-center max-w-8xl mx-auto">
        {typeof content === 'function' ? content({
    onDismiss
  }) : content}
        {dismissable && <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss banner">
          ✕
        </button>}
      </div>
    </div>;
};

This guide helps developers integrate MiniKit into an existing Next.js project. It includes installation steps, provider setup and environment configuration.

<Warning>
  This guide assumes you want to add MiniKit to an existing application. For new projects, use the [MiniKit CLI](/wallet-app/build-with-minikit/quickstart) for automatic setup.
</Warning>

## Prerequisites

Before you begin, confirm the following:

<AccordionGroup>
  <Accordion title="Next.js Project Structure">
    You are using a Next.js project with the `app/` directory structure (App Router).
  </Accordion>

  <Accordion title="Deployment">
    Your app is deployed and publicly accessible (e.g. via Vercel) with HTTPS enabled.
  </Accordion>

  <Accordion title="Farcaster Account">
    You have an active Farcaster account for testing and access to your custody wallet.
  </Accordion>

  <Accordion title="Coinbase Developer Platform Account">
    Sign up for a [Coinbase Developer Platform](https://portal.cdp.coinbase.com/) to retrieve your CDP API Key.
  </Accordion>
</AccordionGroup>

## Integration Steps

<Steps>
  <Step title="Install required dependencies">
    MiniKit is available as part of OnchainKit.

    ```shell
    npm install @coinbase/onchainkit
    ```

    <Check>
      Verify installation by checking that `@coinbase/onchainkit` appears in your `package.json`.
    </Check>
  </Step>

  <Step title="Add the MiniKitProvider to your app">
    Create and use the `MiniKitProvider` to initialise SDK context for your application.

    **File: `providers/MiniKitProvider.tsx`**

    ```jsx
    'use client';

    import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
    import { ReactNode } from 'react';
    import { base } from 'wagmi/chains';

    export function MiniKitContextProvider({ children }: { children: ReactNode }) {
      return (
        <MiniKitProvider
          apiKey={process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY}
          chain={base}
        >
          {children}
        </MiniKitProvider>
      );
    }
    ```

    Then wrap your app in `app/layout.tsx`:

    ```jsx
    import { MiniKitContextProvider } from '@/providers/MiniKitProvider';

    export default function RootLayout({ children }: { children: React.ReactNode }) {
      return (
        <html lang="en">
          <body>
            <MiniKitContextProvider>
              {children}
            </MiniKitContextProvider>
          </body>
        </html>
      );
    }
    ```

    <Tip>
      The provider automatically configures wagmi and react-query, and sets up connectors to use Farcaster when available.
    </Tip>
  </Step>

  <Step title="Initialize MiniKit in your main page">
    Use the `useMiniKit` hook to access the frame context and trigger readiness.

    **File: `app/page.tsx`**

    ```jsx
    'use client';

    import { useEffect, useState } from 'react';
    import { useMiniKit } from '@coinbase/onchainkit/minikit';

    export default function HomePage() {
      const { setFrameReady, isFrameReady } = useMiniKit();

      // The setFrameReady() function is called when your mini-app is ready to be shown
      useEffect(() => {
        if (!isFrameReady) {
          setFrameReady();
        }
      }, [setFrameReady, isFrameReady]);

      return <div>Your app content goes here</div>;
    }
    ```

    <Info>
      The `setFrameReady()` function removes the splash screen and shows your application. Only call this when your app is fully loaded and ready for user interaction.
    </Info>
  </Step>

  <Step title="Configure environment variables">
    Add the required environment variables to your project and deployment platform.

    <Tabs>
      <Tab title="Required Variables">
        These variables are essential for your MiniKit app to function:

        <ParamField path="NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME" type="string" required>
          The name of your Mini App as it appears to users
        </ParamField>

        <ParamField path="NEXT_PUBLIC_URL" type="string" required>
          The deployed URL of your application (must be HTTPS)
        </ParamField>

        <ParamField path="NEXT_PUBLIC_ONCHAINKIT_API_KEY" type="string" required>
          Your Coinbase Developer Platform API key
        </ParamField>

        <ParamField path="FARCASTER_HEADER" type="string" required>
          Generated during manifest creation for account association
        </ParamField>

        <ParamField path="FARCASTER_PAYLOAD" type="string" required>
          Generated during manifest creation for account association
        </ParamField>

        <ParamField path="FARCASTER_SIGNATURE" type="string" required>
          Generated during manifest creation for account association
        </ParamField>
      </Tab>

      <Tab title="Optional Variables">
        These variables enhance your app's appearance and metadata:

        <ParamField path="NEXT_PUBLIC_APP_ICON" type="string">
          URL to your app's icon (recommended: 48x48px PNG)
        </ParamField>

        <ParamField path="NEXT_PUBLIC_APP_SUBTITLE" type="string">
          Brief subtitle shown in app listings
        </ParamField>

        <ParamField path="NEXT_PUBLIC_APP_DESCRIPTION" type="string">
          Detailed description of your app's functionality
        </ParamField>

        <ParamField path="NEXT_PUBLIC_APP_SPLASH_IMAGE" type="string">
          URL to splash screen image shown during app loading
        </ParamField>

        <ParamField path="NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR" type="string">
          Hex color code for splash screen background (e.g., "#000000")
        </ParamField>

        <ParamField path="NEXT_PUBLIC_APP_PRIMARY_CATEGORY" type="string">
          Primary category for app discovery (e.g., "social", "gaming", "utility")
        </ParamField>

        <ParamField path="NEXT_PUBLIC_APP_HERO_IMAGE" type="string">
          Hero image URL displayed in cast previews
        </ParamField>

        <ParamField path="NEXT_PUBLIC_APP_TAGLINE" type="string">
          Short, compelling tagline for your app
        </ParamField>

        <ParamField path="NEXT_PUBLIC_APP_OG_TITLE" type="string">
          Open Graph title for social media sharing
        </ParamField>

        <ParamField path="NEXT_PUBLIC_APP_OG_DESCRIPTION" type="string">
          Open Graph description for social media sharing
        </ParamField>

        <ParamField path="NEXT_PUBLIC_APP_OG_IMAGE" type="string">
          Open Graph image URL for social media previews
        </ParamField>
      </Tab>
    </Tabs>

    <Warning>
      Don't forget to include all referenced images in your `public/` folder and ensure they're accessible via HTTPS.
    </Warning>
  </Step>

  <Step title="Generate the manifest">
    Use the OnchainKit CLI to generate account association credentials and update your environment variables.

    ```shell
    npx create-onchain --manifest
    ```

    <Info>
      **Important:** The wallet you connect must be your Farcaster custody wallet. You can import this wallet using the recovery phrase found in Farcaster under Settings → Advanced → Farcaster recovery phrase.
    </Info>

    Follow these substeps:

    1. Connect your Farcaster custody wallet
    2. Add your deployed Vercel URL
    3. Sign the manifest to generate association credentials
    4. The CLI will automatically update your local `.env` file

    <Tip>
      After running this command locally, remember to update your deployment platform's environment variables with the generated `FARCASTER_HEADER`, `FARCASTER_PAYLOAD`, and `FARCASTER_SIGNATURE` values.
    </Tip>
  </Step>

  <Step title="Create .well-known/farcaster.json route">
    The farcaster.json file contains metadata that allows clients to identify your Mini App and its capabilities.

    Create a route handler at `app/.well-known/farcaster.json/route.ts`:

    ```typescript
    function withValidProperties(
      properties: Record<string, undefined | string | string[]>,
    ) {
      return Object.fromEntries(
        Object.entries(properties).filter(([key, value]) => {
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return !!value;
        }),
      );
    }

    export async function GET() {
      const URL = process.env.NEXT_PUBLIC_URL;

      return Response.json({
        accountAssociation: {
          header: process.env.FARCASTER_HEADER,
          payload: process.env.FARCASTER_PAYLOAD,
          signature: process.env.FARCASTER_SIGNATURE,
        },
        frame: withValidProperties({
          version: "1",
          name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
          subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE,
          description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
          screenshotUrls: [],
          iconUrl: process.env.NEXT_PUBLIC_APP_ICON,
          splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
          splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
          homeUrl: URL,
          webhookUrl: `${URL}/api/webhook`,
          primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
          tags: [],
          heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
          tagline: process.env.NEXT_PUBLIC_APP_TAGLINE,
          ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE,
          ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
          ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE,
        }),
      });
    }
    ```

    <Check>
      Test this endpoint by visiting `https://yourdomain.com/.well-known/farcaster.json` to ensure it returns valid JSON.
    </Check>
  </Step>

  <Step title="Define Farcaster frame metadata">
    Configure the metadata that clients use to render your Mini App in posts and generate preview cards.

    **File: `app/layout.tsx`**

    ```typescript
    import { Metadata } from 'next';

    export async function generateMetadata(): Promise<Metadata> {
      const URL = process.env.NEXT_PUBLIC_URL;
      return {
        title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
        description:
          "Generated by `create-onchain --mini`, a Next.js template for MiniKit",
        other: {
          "fc:frame": JSON.stringify({
            version: "next",
            imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
            button: {
              title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME}`,
              action: {
                type: "launch_frame",
                name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
                url: URL,
                splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE,
                splashBackgroundColor:
                  process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
              },
            },
          }),
        },
      };
    }
    ```

    <Warning>
      All image and API URLs used here must be publicly accessible via HTTPS. Test each URL in your browser before deploying.
    </Warning>
  </Step>

  <Step title="Test and deploy your Mini App">
    Before sharing your Mini App, validate that everything is working correctly.

    <Tabs>
      <Tab title="Pre-deployment Checklist">
        Verify the following before going live:

        * ✅ App is deployed at a public HTTPS domain
        * ✅ All environment variables are set on your deployment platform
        * ✅ All referenced images are accessible in your `public/` folder
        * ✅ The `.well-known/farcaster.json` endpoint returns valid JSON
        * ✅ Your app loads without errors in a browser
      </Tab>

      <Tab title="Validation Tools">
        Use these tools to test your configuration:

        **Manifest Validator:**

        ```
        https://farcaster.xyz/~/developers/mini-apps/manifest
        ```

        This tool validates:

        * Manifest can be loaded successfully
        * Frame metadata is correctly formatted
        * Button actions and preview images are functioning
        * Account association is properly configured

        **Manual Testing:**

        1. Visit your deployed URL directly in a browser
        2. Check browser console for any errors
        3. Verify the MiniKit context loads properly
        4. Test frame readiness functionality
      </Tab>

      <Tab title="Sharing Your App">
        Once validation passes:

        1. **Create a cast** with your app's URL in Farcaster
        2. **Verify the preview** displays your hero image and launch button
        3. **Test the launch experience** by clicking the button
        4. **Share with others** for feedback and testing

        <Info>
          If your app doesn't render as an embed, double-check your manifest configuration and ensure all URLs are publicly accessible.
        </Info>
      </Tab>
    </Tabs>

    <Card title="Need Help Debugging?" icon="bug" href="/wallet-app/build-with-minikit/debugging">
      If you encounter issues, check our comprehensive debugging guide for common problems and solutions.
    </Card>
  </Step>
</Steps>

## Understanding MiniKit Context

### What `useMiniKit` Gives You

The `useMiniKit()` hook provides access to everything your Mini App needs to understand the Farcaster session:

<ResponseField name="context.user.fid" type="string">
  The Farcaster ID of the current user
</ResponseField>

<ResponseField name="context.client.added" type="boolean">
  Whether the user has added your Mini App to their account
</ResponseField>

<ResponseField name="context.location" type="string">
  Where the app was launched from (e.g., "cast", "launcher", "notification")
</ResponseField>

<ResponseField name="isFrameReady" type="boolean">
  Whether your app has called `setFrameReady()` and is ready to be shown
</ResponseField>

<ResponseField name="setFrameReady" type="() => void">
  Function to call when your app is fully loaded and ready for interaction
</ResponseField>

You can use this context to personalize the experience, trigger different flows, or track user behavior.

## Available MiniKit Hooks

MiniKit provides a comprehensive set of hooks designed to help you build rich, social experiences:

<CardGroup cols={2}>
  <Card title="useNotification" icon="bell">
    Send in-app and push notifications to users who have added your frame
  </Card>

  <Card title="useAddFrame" icon="plus">
    Allow users to save your mini app to their Farcaster client for easy access
  </Card>

  <Card title="useClose" icon="x">
    Programmatically close the mini app frame when appropriate
  </Card>

  <Card title="useOpenUrl" icon="link">
    Open external URLs from within the frame context
  </Card>

  <Card title="usePrimaryButton" icon="hand-pointer">
    Configure and handle primary button interactions
  </Card>

  <Card title="useViewProfile" icon="user">
    Navigate users to Farcaster profiles (their own or others)
  </Card>

  <Card title="useAuthenticate" icon="key">
    Handle Farcaster authentication and sign-in flows
  </Card>
</CardGroup>

<Card title="Explore All Hooks" icon="code" href="/wallet-app/build-with-minikit/overview#hooks">
  Learn about all available MiniKit hooks, their parameters, and usage examples
</Card>

## Next Steps

Now that your Mini App is integrated and deployed:

<Steps>
  <Step title="Test thoroughly">
    Share your Mini App URL in Farcaster and test all functionality with real users.
  </Step>

  <Step title="Monitor and iterate">
    Use analytics to understand how users interact with your app and identify areas for improvement.
  </Step>

  <Step title="Explore advanced features">
    Consider adding notifications, authentication, or other MiniKit hooks to enhance the user experience.
  </Step>
</Steps>

<BaseBanner
  id="privacy-policy"
  dismissable={false}
  content={({ onDismiss }) => (
  <div className="flex items-center">
    <div className="mr-2">
      We're updating the Base Privacy Policy, effective July 25, 2025, to reflect an expansion of Base services. Please review the updated policy here:{" "}
      <a
        href="https://docs.base.org/privacy-policy-2025"
        target="_blank"
        className="whitespace-nowrap"
      >
        Base Privacy Policy
      </a>. By continuing to use Base services, you confirm that you have read and understand the updated policy.
    </div>
    <Button onClick={onDismiss}>I Acknowledge</Button>
  </div>
)}
/>
