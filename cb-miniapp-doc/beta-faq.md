# Coinbase Wallet Beta

> Frequently asked questions about the Coinbase Wallet limited beta

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

Welcome to the Coinbase Wallet limited beta. Here are answers to some frequently asked questions about the early beta! Thank you for building with us.

## Access and Participation

The beta is currently open to a limited group of testers. We'll be rolling out to more users on our waitlist soon.

<Card title="Join the Waitlist" icon="user-plus" href="https://app.deform.cc/form/a332685e-9685-4b8d-89cb-14107ada5386/?page_number=0">
  Click here to join our beta waitlist
</Card>

## Basenames

<AccordionGroup>
  <Accordion title="I already have a basename but it isn't showing up/ I don't have the option to transfer it.">
    A wallet can use multiple basenames. Sign up with a new basename, then transfer your existing basename to this new wallet. Here are the steps to transfer and use your existing basename.

    <Steps>
      <Step title="Transfer the basename">
        [Transfer the basename between wallets](https://docs.base.org/identity/basenames/basenames-faq#10-how-do-i-transfer-my-basename-to-another-address).
      </Step>

      <Step title="Set as primary">
        [Set the basename as the primary name on your new wallet.](https://docs.base.org/identity/basenames/basenames-faq#9-how-do-i-set-my-basename-as-my-primary-name-for-my-address)
      </Step>
    </Steps>
  </Accordion>

  <Accordion title="Will my basename show up on Farcaster?">
    No, your basename will only be visible from users in the Coinbase Wallet beta. Interaction from other clients will display your Farcaster username
  </Accordion>
</AccordionGroup>

## Wallet and Funds

### Smart Wallet Requirement

**The beta requires a smart wallet.** A smart wallet is a passkey-secured, self-custodial onchain wallet that's embedded in the app. It's designed for easy onboarding and better user experience—no browser extensions, no app switching.

If you don't have a smart wallet, you will create one in the onboarding flow for the new beta app.

### Checking Your Wallet Type

If you use a passkey to sign onchain transactions, you have a smart wallet. If you have a 12-word recovery phrase backed up somewhere, you use an EOA (externally owned account), not a smart wallet.

<Tip>
  From the in-app browser, go to wallet.coinbase.com and log in. If you have a smart wallet, you'll see it say "smart wallet" in your account details.
</Tip>

### Common Issues

<AccordionGroup>
  <Accordion title="I logged into the beta, but don't see my funds from Coinbase Wallet.">
    The Coinbase Wallet beta currently only supports smart wallets. Your funds are safe and still in Coinbase Wallet. If you created a new smart wallet during the onboarding process, then your previous Externally Owned Account (EOA) wallet will only be available in the standard Coinbase Wallet app.

    <Info>
      You can return to your previous wallet by toggling beta mode off.
      Navigate to the Social tab (first icon), tap your profile pic, and toggle "beta mode" off.
    </Info>
  </Accordion>
</AccordionGroup>

## Farcaster Integration

<AccordionGroup>
  <Accordion title="How do I connect my Farcaster account?">
    Open the social tab and engage with any post (tap like or recast). You'll be prompted to open the Farcaster app to connect your account. Follow the prompts to link Coinbase Wallet to Farcaster.
  </Accordion>

  <Accordion title="What if I don't have a Farcaster account?">
    Coinbase Wallet currently does not yet support new Farcaster account creation. If you do not have a Farcaster account, you will need to go to the app store and download Farcaster to sign up for an account. Then follow the "How do I connect my Farcaster account" instructions above to link your accounts.
  </Accordion>
</AccordionGroup>

## Beta Management

### Toggling Beta Mode

**To turn beta mode off:** Navigate to the Social tab (first icon), tap your profile photo, and toggle "beta mode" off.

**To rejoin beta mode:** Navigate to the Assets tab (last tab on the right), select the settings icon in the upper right, and toggle "Beta mode".

### Additional Questions

<AccordionGroup>
  <Accordion title="I needed to reinstall Coinbase Wallet and no longer have access to the beta - can I get another invite?">
    Unfortunately, our invites are one time use. If you uninstall the app, we aren't able to add you back into the beta. However, all your wallets will still be available as long as you have your passkeys, backups, and recovery phrases.
  </Accordion>
</AccordionGroup>

## Launch Timeline

<AccordionGroup>
  <Accordion title="When will the official app launch?">
    We will announce the official app launch date soon - thanks for being a part of the beta!
  </Accordion>
</AccordionGroup>

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
