# Getting Started with Mini Apps

> Overview and implementation guide for Mini Apps in Coinbase Wallet

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

Mini Apps are lightweight web applications that run natively within clients like Coinbase Wallet. Users instantly access mini apps without downloads, benefit from seamless wallet interactions, and discover apps directly in the social feed. This benefits app developers by creating viral loops for user acquisition and engagement.

## What is a Mini App?

A Mini App is composed of:

<CardGroup cols={2}>
  <Card title="Your Existing Web Application" icon="globe">
    Your current web app works as-is
  </Card>

  <Card title="MiniKitProvider Wrapper" icon="code">
    Simple wrapper component integration
  </Card>

  <Card title="Manifest File" icon="file">
    Single farcaster.json configuration file
  </Card>

  <Card title="Standard Deployment" icon="rocket">
    Deploy to any hosting platform (Vercel, Netlify, etc.)
  </Card>
</CardGroup>

**No rebuilding, architectural changes, or complex integrations are required.**

## Code Implementation

<Tabs>
  <Tab title="Before (Standard Web App)">
    ```jsx
    function App() {
      return (
        <div>
          <MyExistingComponent />
          <AnotherComponent />
        </div>
      );
    }
    ```
  </Tab>

  <Tab title="After (Mini App Implementation)">
    ```jsx
    import { MiniKitProvider } from '@coinbase/onchainkit/minikit';

    function App() {
      return (
        <MiniKitProvider projectId="your-id">
          <MyExistingComponent />  {/* Existing components unchanged */}
          <AnotherComponent />     {/* Existing components unchanged */}
        </MiniKitProvider>
      );
    }
    ```

    **Changes Required**: Two import lines and one wrapper component. All existing components remain unchanged.
  </Tab>
</Tabs>

## Implementation Examples

<Tabs>
  <Tab title="Simple Example with MiniKit">
    ```shell
    npx create-onchain --mini
    cd my-miniapp
    npm run dev
    ```
  </Tab>

  <Tab title="Non-React Implementation (Vue, Svelte, Vanilla JS)">
    ```shell
    npm create @farcaster/mini-app
    cd my-miniapp
    npm run dev
    ```
  </Tab>
</Tabs>

<Check>
  **Result**: Functional Mini App with wallet integration, transaction capabilities, and social features.
</Check>

## Pre-Solved Development Challenges

<AccordionGroup>
  <Accordion title="Common Engineering Concerns">
    * Complex wallet integration processes
    * Authentication flow implementation
    * Mobile responsiveness requirements
    * Cross-platform compatibility issues
    * User onboarding friction
  </Accordion>

  <Accordion title="MiniKit Automated Solutions">
    * **Mobile Optimization**: Automatic handling of safe areas and responsive design
    * **Platform Compatibility**: Operates across Farcaster, Coinbase Wallet, and web browsers
    * **User Context**: Immediate access to user identification
  </Accordion>
</AccordionGroup>

## Manifest File Configuration

Mini Apps require one configuration file located at `/.well-known/farcaster.json` in your project root. This file instructs clients how to display your application.

### Sample Manifest Structure

```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjgxODAyNi...",
    "payload": "eyJkb21haW4iOiJleGFtcGxlLmNvbSJ9",
    "signature": "MHhmOGQ1YzQyMmU3ZTZlMWNhMzU1..."
  },
  "frame": {
    "version": "1",
    "name": "Your App Name",
    "subtitle": "Short tagline",
    "description": "Detailed description of what your app does",
    "iconUrl": "https://yourapp.com/icon.png",
    "homeUrl": "https://yourapp.com",
    "splashImageUrl": "https://yourapp.com/splash.png",
    "splashBackgroundColor": "#000000",
    "heroImageUrl": "https://yourapp.com/hero.png",
    "tagline": "One-line value proposition",
    "screenshotUrls": [
      "https://yourapp.com/screenshot1.png",
      "https://yourapp.com/screenshot2.png"
    ],
    "primaryCategory": "games",
    "tags": ["multiplayer", "strategy", "onchain"],
    "webhookUrl": "https://yourapp.com/api/webhook"
  }
}
```

## Categories and Discovery

### Primary Categories

<CardGroup cols={3}>
  <Card title="games" icon="gamepad">
    Gaming and entertainment applications
  </Card>

  <Card title="social" icon="users">
    Social networking and communication tools
  </Card>

  <Card title="finance" icon="dollar-sign">
    DeFi, trading, and payment applications
  </Card>

  <Card title="utility" icon="wrench">
    Tools and productivity applications
  </Card>

  <Card title="productivity" icon="briefcase">
    Task management and organization tools
  </Card>

  <Card title="developer-tools" icon="code">
    Development utilities
  </Card>

  <Card title="art-creativity" icon="palette">
    Creative and artistic applications
  </Card>
</CardGroup>

### Account Association (Domain Verification)

Domain ownership verification is required. Generate your manifest using:

<Tabs>
  <Tab title="MiniKit Method">
    ```shell
    npx create-onchain --manifest
    ```
  </Tab>

  <Tab title="Alternative Farcaster Tool">
    You can use the [Farcaster manifest tool](https://farcaster.xyz/~/developers/mini-apps/manifest) for generation.
  </Tab>
</Tabs>

### Image Requirements

<AccordionGroup>
  <Accordion title="iconUrl">
    200x200px PNG/JPG format
  </Accordion>

  <Accordion title="splashImageUrl">
    200x200px PNG/JPG (displayed during app loading)
  </Accordion>

  <Accordion title="heroImageUrl">
    1200x628px PNG/JPG (for featured placement)
  </Accordion>

  <Accordion title="screenshotUrls">
    App store screenshots in various sizes
  </Accordion>
</AccordionGroup>

## Deployment Process

The deployment process remains identical to standard web applications:

<Steps>
  <Step title="Build Application">
    `npm run build` (standard process)
  </Step>

  <Step title="Add Configuration">
    `public/.well-known/farcaster.json`
  </Step>

  <Step title="Deploy">
    Use any hosting platform (Vercel, Netlify, custom servers)
  </Step>

  <Step title="Browser Testing">
    Functions as standard web application
  </Step>

  <Step title="Farcaster Testing">
    <Card title="Test with Farcaster Tools" icon="test-tube" href="https://farcaster.xyz/~/developers/mini-apps/manifest">
      Validate your Mini App configuration
    </Card>
  </Step>
</Steps>

No special hosting, new infrastructure, or complex setup procedures required.

## Frequently Asked Questions

<AccordionGroup>
  <Accordion title="Do we need to rebuild our entire application?">
    No. Wrap your existing application in `<MiniKitProvider>`. Implementation complete.
  </Accordion>

  <Accordion title="Will this break our current web application?">
    No. Mini Apps function in regular browsers. The same codebase works across all platforms.
  </Accordion>

  <Accordion title="Do we need blockchain expertise?">
    No. Integration complexity is similar to Stripe implementation.
  </Accordion>

  <Accordion title="What about user data and privacy?">
    Maintain current practices. You control data, backend systems, and privacy policies.
  </Accordion>

  <Accordion title="What is the performance impact?">
    Minimal impact. MiniKit SDK is approximately 50KB. Application performance remains unchanged.
  </Accordion>

  <Accordion title="We don't use React/Next.js. Is this compatible?">
    Yes. The Farcaster SDK supports Vue, Angular, Svelte, and any web framework.
  </Accordion>
</AccordionGroup>

## Technical Resources

<CardGroup cols={2}>
  <Card title="Live Code Examples" icon="github" href="https://github.com/base/demos/tree/master/minikit">
    View working implementation examples
  </Card>

  <Card title="MiniKit" icon="book" href="https://docs.base.org/wallet-app/build-with-minikit/overview">
    MiniKit documentation and overview
  </Card>

  <Card title="Mini Apps Guide" icon="compass" href="https://docs.base.org/wallet-app/mini-apps">
    Comprehensive guide to Mini Apps
  </Card>

  <Card title="Debug Guide" icon="alert-triangle" href="https://docs.base.org/wallet-app/build-with-minikit/debugging">
    Debugging MiniKit and Mini Apps
  </Card>

  <Card title="Debug Tools" icon="bug" href="https://farcaster.xyz/~/developers/mini-apps/debug">
    Validate and test your Mini App
  </Card>

  <Card title="Farcaster SDK" icon="package" href="https://miniapps.farcaster.xyz/docs/getting-started">
    Farcaster Mini Apps SDK documentation
  </Card>

  <Card title="Onchainkit" icon="puzzle-piece" href="https://docs.base.org/builderkits/onchainkit/getting-started">
    OnchainKit components and guides
  </Card>
</CardGroup>

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
