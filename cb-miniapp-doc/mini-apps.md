# Mini Apps in Coinbase Wallet

> Guide for building and optimizing mini apps for Coinbase Wallet

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

We're so excited that mini apps are coming to Coinbase Wallet! The purpose of this guide is to go over how to build or update your mini app so it works as well as possible in Coinbase Wallet.

## Using MiniKit

<Card title="Quick Start with MiniKit" icon="rocket" href="/wallet-app/build-with-minikit/quickstart">
  If you use MiniKit and/or follow the MiniKit quickstart guide, your mini app will work out of the box in Coinbase Wallet!
</Card>

For reference, MiniKit is easiest way to build mini apps on Base, allowing developers to easily build mini apps without needing to know the details of the SDK implementation. It integrates seamlessly with OnchainKit components and provides Coinbase Wallet-specific hooks.

<Card title="Debugging Guide" icon="bug" href="/wallet-app/build-with-minikit/debugging">
  If you're already using MiniKit and experiencing issues, you can refer to our debugging guide
</Card>

## Authentication

<Warning>
  As a general rule of thumb for building any mini app, we recommend that you do not automatically request that the user logs in/signs a message and instead that authentication is only used when it's needed (e.g. signing up for an event, viewing authenticated resources, etc).
</Warning>

Below we will quickly cover the different methods of authentication offered for mini apps and how well each of them work in Coinbase Wallet:

<Tabs>
  <Tab title="Wallet Authentication (Recommended)">
    Because users in Coinbase Wallet have an in-app smart wallet that doesn't require any app switching, we recommend wallet authentication as the primary method of authentication for developers looking to create a persisted session for the mini app user.

    As described below, we don't think it's the best practice to prompt the user to log in before that authentication will allow them to do something else in your mini app, but for cases where do you want a secure, persisted session, using a wallet connection is a great option.
  </Tab>

  <Tab title="Context Data">
    All mini app host apps (including Coinbase Wallet) return [context data](https://miniapps.farcaster.xyz/docs/sdk/context), which tells developers about the app/mini app host the user is accessing their mini app in, as well as **which user** is interacting with their mini app.

    A common flow that other mini app developers follow is using the context data to either track analytics metrics or create an authentication session via a [JWT](https://jwt.io/introduction). This allows you to still track analytics/offer certain authenticated services to your users without the extra friction of signing a message or deeplinking to another app.

    <Warning>
      Something important to note is that because of how the current mini app spec is written, context data can technically be spoofed by any developer who makes their own mini app host. Because of this, we recommend that context data is not used as the **primary** method of authentication.
    </Warning>
  </Tab>

  <Tab title="Sign In with Farcaster">
    Currently, using Sign In with Farcaster inside of Coinbase Wallet is **not recommended as the primary method of authentication**. This is because, for Farcaster accounts that were created in Farcaster (which many current accounts were), using Sign In with Farcaster will require deeplinking the user to Farcaster and then back to Coinbase Wallet. While this flow still works inside of Coinbase Wallet, we recommend either wallet auth or creating an auth strategy around the context data (eg. a custom JWT with context data) for a more optimal UX.

    <Info>
      Note: The Sign In with Farcaster flow will no longer require a deeplink to Farcaster when the [auth addresses FIP](https://github.com/farcasterxyz/protocol/discussions/225) lands, which will allow a set of delegated wallets to take actions on behalf of a Farcaster account's custody wallet.
    </Info>
  </Tab>
</Tabs>

## Deeplinks and SDK Actions

The official mini apps SDK offers a [set of actions](https://miniapps.farcaster.xyz/docs/specification#actions) (which MiniKit offers as well) so that users of your mini app can be led to do things back in clients like Coinbase Wallet (e.g. compose a cast, view a profile, etc).

<Warning>
  **Always use official SDK functions instead of Farcaster-specific deeplinks in your mini app.**
</Warning>

While some developers have used Farcaster-specific deeplinks in the `openUrl` function as a workaround, this approach can create problems. Farcaster-specific deeplinks might not match Coinbase Wallet-specific deeplinks, **potentially leaving users dead-ended and unable to take further action in your mini app**.

Using the official SDK functions ensures your users have the best viewing experience possible across all supported clients, including Coinbase Wallet.

<Info>
  Note: For developers who include a "Share" button in their miniapp, we recommend that you move over to the new `composeCast` function in the miniapps SDK instead of using a Farcaster-specific deeplink.
</Info>

## Wallet Interactions

Wallet interactions are a core part of the miniapp experience. We want to ensure both that building wallet interactions on top of the Coinbase Wallet is smooth for developers and that users can choose/have funds sent to their Coinbase Wallet when interacting with mini apps.

As a mini app host, we expose an [EIP-1193 Ethereum Provider](https://eips.ethereum.org/EIPS/eip-1193) that can be accessed in two primary ways:

<Tabs>
  <Tab title="OnchainKit Wallet Component (Recommended)">
    By using the [Wallet](https://docs.base.org/builderkits/onchainkit/wallet/wallet) component offered in OnchainKit/MiniKit

    <Note>
      If you run `npm create onchain --mini`, your mini app will have a "Connect Wallet" button already set up
    </Note>
  </Tab>

  <Tab title="Frame SDK">
    By using either `sdk.wallet.getEthereumProvider()` from [@farcaster/frame-sdk](https://www.npmjs.com/package/@farcaster/frame-sdk) or by using [@farcaster/frame-wagmi-connector](https://www.npmjs.com/package/@farcaster/frame-wagmi-connector) with your Wagmi config
  </Tab>
</Tabs>

## Metadata

Farcaster has recently [extended the metadata spec for mini apps](https://github.com/farcasterxyz/miniapps/discussions/191), which allows developers to add screenshot links, categories, and more to their manifest (farcaster.json) file. Making use of these new metadata fields is highly recommended for increasing the chance that your mini app could be featured throughout Coinbase Wallet.

Below is a table of the new metadata fields introduced, what they mean/could potentially be used for, and an example of what a manifest file could look like with these new fields (all taken from the [official spec](https://github.com/farcasterxyz/miniapps/discussions/191))

<Info>
  Note: Only \~30 of the hundreds of mini apps we've seen have set this data, we **highly recommend** that you set this metadata as it will give your mini app a better shot at being featured.
</Info>

<AccordionGroup>
  <Accordion title="Mini App Store Listing">
    | Field      | Purpose                              | Limitations                                    | Design Guidelines                                                                 |
    | ---------- | ------------------------------------ | ---------------------------------------------- | --------------------------------------------------------------------------------- |
    | `iconUrl`  | Main icon                            | 1024x1024 px PNG, no alpha                     | Use a bold, recognizable logo. No text. Avoid photos or screenshots.              |
    | `name`     | Display name of the app              | 30 characters, no emojis or special characters | Use brandable, unique names. Avoid generic terms. No emojis or trademark symbols. |
    | `subtitle` | Short description under the app name | 30 characters, no emojis or special characters | Should clarify what your app does in a catchy way. Avoid repeating the title.     |
  </Accordion>

  <Accordion title="Mini App Store Page">
    | Field            | Purpose                                        | Limitations                                     | Design Guidelines                                                                                                                |
    | ---------------- | ---------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
    | `description`    | Promotional message displayed on Mini App Page | 170 characters, no emojis or special characters | Use short paragraphs, headings, and bullet points. Focus on value, not features. Include social proof if possible. Avoid jargon. |
    | `screenshotUrls` | Visual previews of the app, max 3 screens      | Portrait, 1284 x 2778                           | Focus on showing the core value or magic moment of the app in the first 2–3 shots. Use device frames and short captions.         |
  </Accordion>

  <Accordion title="Search & Discovery">
    | Field             | Purpose                               | Options                                                                                                                                                                                 | Design Guidelines                                                                    |
    | ----------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
    | `primaryCategory` | Primary category of app               | One of: `games`, `social`, `finance`, `utility`, `productivity`, `health-fitness`, `news-media`, `music`, `shopping`, `education`, `developer-tools`, `entertainment`, `art-creativity` | Choose the category that best represents your app's primary use case                 |
    | `tags`            | Descriptive tags for filtering/search | up to 5 tags                                                                                                                                                                            | Use 3–5 high-volume terms; no spaces, no repeats, no brand names. Use singular form. |
  </Accordion>

  <Accordion title="Promotional Assets">
    | Field          | Purpose                                                | Limitations           | Design Guidelines                                                                                               |
    | -------------- | ------------------------------------------------------ | --------------------- | --------------------------------------------------------------------------------------------------------------- |
    | `heroImageUrl` | Promotional display image on top of the mini app store | 1200 x 630px (1.91:1) | 1200x630 px JPG or PNG. Should show your brand clearly. No excessive text. Logo + tagline + UI is a good combo. |
    | `tagline`      | Marketing tagline should be punchy and descriptive     | 30 characters         | Use for time-sensitive promos or CTAs. Keep copy active (e.g., "Grow, Raid & Rise in Stoke Fire").              |
  </Accordion>

  <Accordion title="Sharing Experience">
    | Field           | Purpose                                    | Limitations           | Design Guidelines                                                                         |
    | --------------- | ------------------------------------------ | --------------------- | ----------------------------------------------------------------------------------------- |
    | `ogTitle`       | Open Graph title for social sharing        | 30 characters         | Use your app name + short tag (e.g., "AppName – Local News Fast"). Title case, no emojis. |
    | `ogDescription` | Open Graph description for social sharing  | 100 characters        | Summarize core benefit in 1–2 lines. Avoid repeating OG title.                            |
    | `ogImageUrl`    | Promotional image (same as app hero image) | 1200 x 630px (1.91:1) | Same as heroImageUrl                                                                      |
  </Accordion>
</AccordionGroup>

### Example Manifest

```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjkxNTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMmVmNzkwRGQ3OTkzQTM1ZkQ4NDdDMDUzRURkQUU5NDBEMDU1NTk2In0",
    "payload": "eyJkb21haW4iOiJyZXdhcmRzLndhcnBjYXN0LmNvbSJ9",
    "signature": "MHgxMGQwZGU4ZGYwZDUwZTdmMGIxN2YxMTU2NDI1MjRmZTY0MTUyZGU4ZGU1MWU0MThiYjU4ZjVmZmQxYjRjNDBiNGVlZTRhNDcwNmVmNjhlMzQ0ZGQ5MDBkYmQyMmNlMmVlZGY5ZGQ0N2JlNWRmNzMwYzUxNjE4OWVjZDJjY2Y0MDFj"
  },
  "frame": {
    "version": "1",
    "name": "Example Mini App",
    "iconUrl": "https://example.com/app.png",
    "splashImageUrl": "https://example.com/logo.png",
    "splashBackgroundColor": "#000000",
    "homeUrl": "https://example.com",
    "webhookUrl": "https://example.com/api/webhook",
    "subtitle": "Example Mini App subtitle",
    "description": "Example Mini App subtitle",
    "screenshotUrls": [
      "https://example.com/screenshot1.png",
      "https://example.com/screenshot2.png",
      "https://example.com/screenshot3.png"
    ],
    "primaryCategory": "social",
    "tags": [
      "example",
      "mini app",
      "coinbase wallet"
    ],
    "heroImageUrl": "https://example.com/og.png",
    "tagline": "Example Mini App tagline",
    "ogTitle": "Example Mini App",
    "ogDescription": "Example Mini App description",
    "ogImageUrl": "https://example.com/og.png"
  }
}
```

## Notifications

You will soon be able to send notifications from your Mini App that will appear in Coinbase Wallet. These notifications help re-engage users when something important happens, like a new drop, an update, or a reminder to complete an action. There are two ways to integrate:

<Tabs>
  <Tab title="Use Neynar (Recommended)">
    The fastest way to start sending notifications. Neynar provides:

    * A hosted webhook interface
    * Built-in user token management (opt-in / opt-out)
    * CLI tools and a dashboard
    * Analytics out of the box

    <Card title="Get Started with Neynar" icon="rocket" href="https://docs.neynar.com/docs/send-notifications-to-mini-app-users">
      Learn how to integrate notifications using Neynar
    </Card>
  </Tab>

  <Tab title="Use Your Own Infrastructure">
    You can self-host your own backend as long as it follows the [Farcaster Mini App notification spec](https://miniapps.farcaster.xyz/docs/guides/notifications). This includes:

    * Sending lifecycle events (`notification_enabled`, `notification_disabled`)
    * Posting events to the expected format
  </Tab>
</Tabs>

## Mini Apps Compatibility in Coinbase Wallet

Coinbase Wallet is working towards full compatibility with the Farcaster Mini App SDK. While we continue to enhance support during the beta phase, there are currently some features that are not yet supported.

### AI-Powered Compatibility Checking

We provide a [validate.txt](https://raw.githubusercontent.com/base/demos/refs/heads/master/minikit/mini-app-help/validate.txt) file that can be used with AI tools to automatically check your codebase for Coinbase Wallet compatibility issues. Similar to llms.txt files, you can provide this validation file to language models to scan your Mini App code and receive a detailed compatibility report highlighting any unsupported features or patterns.

<Warning>
  This AI validation is experimental and should only be used in a read-only capacity for analysis and reporting purposes.
</Warning>

### Currently Unsupported Features

The following Mini App SDK features are **not currently supported** in Coinbase Wallet:

#### Environment Detection

* `sdk.isInMiniApp()`

#### Haptic Feedback

* All haptic-related SDK methods

#### Token Actions

* `sdk.actions.swapToken` - Token swapping functionality
* `sdk.actions.sendToken` - Token sending functionality
* `sdk.actions.viewToken` - Token viewing functionality

#### Navigation & Links

* Direct HTML links (`<a href=`, `<Link href=`)
* Warpcast composer URLs (`warpcast.com/~/compose`, `farcaster.com/~/compose`)

#### Context Features

* `Share extensions` -  Because share extensions heavily rely on context this will not work in CBW.
* `sdk.context.location` - Share link detection and embed context

#### Supported Chains

* Base
* Optimism
* Arbitrum
* Polygon
* Zora
* BNB
* Avalanche C-Chain

### Development Notes

* Use `sdk.actions.openUrl()` for external navigation instead of direct HTML links
* Use `sdk.actions.composeCast()` instead of Warpcast composer URLs
* Implement visual feedback alternatives for haptic feedback
* Avoid relying on location context for core functionality
* To conditionally render functionality based on the user's client, check context.client.clientFid (Coinbase Wallet returns 399519)

We are actively working to expand compatibility and expect to support additional features in future releases.

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
