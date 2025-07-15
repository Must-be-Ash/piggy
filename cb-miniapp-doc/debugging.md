# Common Issues & Debugging

> Frequent issues encountered during Mini App development and their solutions

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

## Previews Not Rendering

**Issue:** The app embed does not appear when previewed.

<Frame>
  <img alt="Manifest Embed Example" src="https://mintlify.s3.us-west-1.amazonaws.com/base-a060aa97/images/minikit/example_embed.png" height="364" />
</Frame>

**Cause:** This is typically due to an incorrectly formatted or unreachable splashImageUrl in the farcaster.json manifest.

<Tabs>
  <Tab title="Correct Format">
    ```json
    "splashImageUrl": "https://www.example.com/splash_image.png"
    ```
  </Tab>

  <Tab title="Common Mistake">
    ```json
    "splashImageUrl": "https://www.example.com//splash_image.png"
    ```
  </Tab>
</Tabs>

### Best Practices

<Check>
  **URL Validation:** Ensure the url is correct without typos. Double slashes, like seen above, will break the mini app preview.
</Check>

<Check>
  **Public Accessibility:** Ensure the image is hosted at a publicly accessible URL.
</Check>

<Check>
  **Image Requirements:** Confirm that the image meets the requirements: 200x200 pixels, under 1MB, and in PNG or JPG format.
</Check>

### Preview Tool

To verify your embed, use the Farcaster Frame Developer Tool:

<Card title="Embed Debugging" icon="bug" href="https://farcaster.xyz/~/developers/mini-apps/embed">
  Test your Mini App embed preview
</Card>

## Manifest Debugging (farcaster.json)

Ensure your domain's manifest at `/.well-known/farcaster.json` is properly configured.

### Example Manifest

```json
{
  "accountAssociation": {
    "header": "BASE64_HEADER_STRING",
    "payload": "BASE64_PAYLOAD_STRING",
    "signature": "BASE64_SIGNATURE_STRING"
  },
  "frame": {
    "version": "next",
    "name": "MiniKit",
    "iconUrl": "https://example.com/icon.png",
    "splashImageUrl": "https://example.com/splash.png",
    "splashBackgroundColor": "#000000",
    "homeUrl": "https://your-app.com"
  }
}
```

### Checklist

<Check>
  The domain in the payload must match the domain serving the manifest.
</Check>

<Check>
  Ensure all asset URLs (icon, splash) are reachable and correctly formatted.
</Check>

## Incorrect FID or Signature Errors

This is often caused by a farcaster.json file that was signed using the wrong wallet. The signing wallet must match the custody address associated with your Farcaster account.

**Issue:** You encounter errors related to an invalid FID or failed signature validation.

**Cause:** The signing wallet does not match the Farcaster custody wallet.

### Resolution

To sign with the correct identity, import your Farcaster custody key into an external wallet:

<Steps>
  <Step title="Open Farcaster Mobile App">
    Navigate to the Farcaster mobile app on your device
  </Step>

  <Step title="Access Recovery Phrase">
    Navigate to: `Settings → Advanced → Farcaster Recovery Phrase`
  </Step>

  <Step title="Copy Seed Phrase">
    Copy the 24-word seed phrase
  </Step>

  <Step title="Import to Wallet">
    Import the phrase into a compatible wallet (e.g., Coinbase Wallet Mobile App, MetaMask or Rabby)
  </Step>

  <Step title="Sign Manifest">
    Use this wallet for signing the `accountAssociation` payload
  </Step>
</Steps>

### Manifest Signing Utility

Run the following to initiate the manifest signing workflow:

```bash
npx create-onchain --manifest
```

This CLI will open the signing UI in your browser and update local .env values automatically.

<Info>
  This is required for generating valid signed manifests that link your domain to your Farcaster identity.
</Info>

## Developer Tools

### Farcaster Frame Debugger

Preview how your Mini App renders inside Farcaster:

<Card title="Farcaster Debugging" icon="magnifying-glass" href="https://farcaster.xyz/~/developers/mini-apps/manifest">
  Test and debug your Mini App in the Farcaster environment
</Card>

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
