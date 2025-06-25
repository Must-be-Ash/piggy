npm i viem @dynamic-labs/wagmi-connector wagmi @tanstack/react-query @dynamic-labs/sdk-react-core @dynamic-labs/bitcoin @dynamic-labs/ethereum @dynamic-labs/flow @dynamic-labs/solana @dynamic-labs/sui

# Overview

<Info>
  If you are a current user of our legacy embedded wallets, you can find the migration guide [here](/wallets/embedded-wallets/legacy/migration) and the legacy documentation [here](/wallets/embedded-wallets/legacy/overview-tee-wallets).
</Info>

An embedded wallet functions like a powerful web-based account. It is a programmable crypto wallet that can be seamlessly issued to users within your website or app. With an embedded wallet, users can instantly receive tokens and interact onchain without needing to download an external wallet like MetaMask or Phantom.

Dynamic’s embedded wallets support a wide range of use cases, from simplifying onboarding on your site to serving as the foundation for building a full-stack wallet experience.

<Tip>
  A full stack wallet is a wallet that is not just a simple interface for users to interact with, but also a wallet that can be used to build your own custom wallet features.
</Tip>

## Secured By TSS-MPC

<Tip>
  For a deeper dive into MPC, check out our blog post on [Threshold Signature Scheme Multi-Party Computation (TSS-MPC)](https://www.dynamic.xyz/blog/a-deep-dive-into-tss-mpc).
</Tip>

Dynamic wallets are powered by a form of Multi-Party Computation (MPC) that leverages Threshold Signature Schemes (TSS). This TSS-MPC approach represents the next generation of wallet security and user experience.

Unlike traditional wallets where a single private key creates a single point of failure, TSS-MPC generates cryptographic key shares that collectively enable signing operations without ever constructing a complete private key. This approach offers several key benefits:

* **Enhanced Security**: With TSS-MPC, a complete private key never exists, significantly reducing the risk of theft or compromise. This removes the risk of a single point of failure, even during wallet transactions.
* **Sub-Second Signing**: While early MPC implementations were often slow, Dynamic’s TSS-MPC solution incorporates advanced optimizations to achieve signing speeds under one second.
* **Better Recovery Options**: Key shares can be restored through several options for account recovery, eliminating the need for seed phrases.
* **Flexible Key Management**: A foundation for advanced features such as social recovery and personalized security controls.
* **Improved User Experience**: Users can authenticate using familiar methods like email and social login while maintaining self custody.
* **More Chain Support**: Dynamic TSS-MPC employs three signature schemes across major blockchains:
  * [ECDSA (DKLs19 Protocol)](/wallets/embedded-wallets/mpc/glossary#ecdsa-dkls19-protocol): For Ethereum and EVM-compatible chains
  * [EdDSA (FROST protocol)](/wallets/embedded-wallets/mpc/glossary#eddsa-frost-protocol): For Solana, StarkNet, and other EdDSA ecosystems
  * [BIP-340 (FROST Protocol)](/wallets/embedded-wallets/mpc/glossary#bip-340-frost-protocol): For Bitcoin and Taproot-enabled blockchains

## Non-Custodial

Dynamic embedded wallets are non-custodial, meaning they are always end-user owned and controlled. Only the end-user has ownership and access to their wallet private keys.

Dynamic's TSS-MPC implementation uses a [User Share](/wallets/embedded-wallets/mpc/glossary#user-share) stored locally on the user's device and a [Server Share](/wallets/embedded-wallets/mpc/glossary#server-share) that participates in signing operations within a [TEE](/wallets/embedded-wallets/mpc/glossary#tee-trusted-execution-environment). The [MPC Relay](/wallets/embedded-wallets/mpc/glossary#mpc-relay) manages signing ceremonies without exposing key material. For added security, users can enable [Passcode Encryption](/wallets/embedded-wallets/mpc/glossary#passcode-encryption) and store a share in select [Backup Options](/wallets/embedded-wallets/mpc/glossary#backup-share).

Dynamic offers a full range of flexibility for key sharing. Our default set up of 2/2 can be adjusted to 2/3 or to 3/5. This further mitigates single points of failure and adds fail safes for users and developers alike. For additional security, periodic [Key Resharing](/wallets/embedded-wallets/mpc/glossary#key-resharing--refreshing) can also be performed.

Dynamic-powered embedded wallets can always be exported by the end-user to move to a different wallet provider or alternative storage location.

Dynamic is SOC2 Type 2 compliant and hires independent third parties to regularly conduct audits of our code, processes and systems. Dynamic also runs evergreen bug bounty programs.

## Multi-Chain

Dynamic offers embedded wallets on EVM, SVM, and Sui compatible networks. If multiple networks are enabled, wallets will be created for each simultaneously, and the one marked as "primary" will appear as the user's main address in their profile after sign-in.

<Tip>
  To enable embedded wallets for EVM, SVM, and Sui networks, the respective chains must also be enabled. You can find more information about enabling chains and networks [here](/chains/enabling-chains).
</Tip>

Dynamic offers native support for EVM, SVM, and Sui, along with signer support for networks such as Bitcoin, Cosmos, and other chains that use:

* [ECDSA (DKLs19 Protocol)](/wallets/embedded-wallets/mpc/glossary#ecdsa-dkls19-protocol)
* [EdDSA (FROST Protocol)](/wallets/embedded-wallets/mpc/glossary#eddsa-frost-protocol)
* [BIP-340 (FROST Protocol)](/wallets/embedded-wallets/mpc/glossary#bip-340-frost-protocol)

Need expanded support for a specific chain? Contact us to discuss your use case.

## Smart Accounts

You can turn these embedded wallets into smart accounts using our [smart wallet](/smart-wallets/add-smart-wallets) feature. By doing so, you can sponsor your end-users' gas fees, add complex approval logic, and much more.

## Agentic/Automation Use Cases

Dynamic also provides developer managed MPC wallets using a 2 of 2 threshold signature scheme. These wallets are not end-user owned and controlled, but rather are managed by the developer. They are ideal for automation and agentic use cases. Learn more here\[/wallets/server-wallets/overview].

<Accordion title="Looking for Legacy Embedded Wallets?">
  If you are an existing user looking for the documentation on our legacy embedded wallets that use Trusted Execution Environments (TEE), you can find that [here](/wallets/embedded-wallets/legacy/overview-tee-wallets).
</Accordion>


# DynamicContextProvider

## Settings

Passed in using the "settings" prop, available when you first initialize `DynamicContextProvider` in your App.

### accessDeniedMessagePrimary

**Type:** `string`

**Description:** Custom main error message used when a wallet attempts to authenticate via Dynamic and is rejected because it does not have access. Defaults to "Access denied"

### accessDeniedMessageSecondary

**Type:** `string`

**Description:** Custom secondary error message used when a wallet attempts to authenticate via Dynamic and is rejected because it does not have access. Defaults to "We couldn't find your wallet address on our access list of customers."

### accessDeniedButton

**Type:** `AccessDeniedCustomButton`

**Description:** Custom secondary error button text and action when a wallet attempts to authenticate via Dynamic and is rejected because it does not have access. Defaults to "Try another method" and allow user to choose another login option. Please see: [AccessDeniedCustomButton](/react-sdk/objects/access-denied-custom-button)

### coinbaseWalletPreference

**Type:** `'all' | 'smartWalletOnly' | 'eoaOnly'`

**Description:** Determines which connection options users will see. Defaults to all. Please see: [https://www.smartwallet.dev/sdk/makeWeb3Provider#options-optional](https://www.smartwallet.dev/sdk/makeWeb3Provider#options-optional)

### cssOverrides

**Type:** `string | JSX.Element`

**Description:** Allows for custom CSS overrides via ShadowDom. Please see: [Custom CSS](/design-customizations/css/custom-css)]

### debugError

**Type:** `boolean`

**Description:** When enabled, errors caught during the authentication step and their stack trace will be set in a state and displayed in the front end.

### deepLinkPreference

**Type:** `'native' | 'universal'`

**Description:** Controls the type of deep link used when connecting a mobile wallet. Defaults to 'native'. This is useful for example if your app is running in a webview of a native mobile app, and you want to be able to link out to any wallet without having to modify your iOS build config. In this case, you can set this to 'universal'.

### displaySiweStatement

**Type:** `boolean`

**Description:** When enabled, this will show a message on terms of service and privacy policy in the signing message on the authentication step.

### enableVisitTrackingOnConnectOnly

**Type:** `boolean`

**Description:** When the Dynamic SDK is being used with auth mode = connect-only, we require this to be set to "true" to track visits of connected wallets in this environment.

### environmentId

**Type:** `string`

**Description:** You will need to specify your app's environment ID, which refers to a unique environment and its settings in Dynamic. To get your environment ID, go to [dashboard's API tab](https://app.dynamic.xyz/dashboard/api)

### events

**Type:** `DynamicEvents`

**Description:** This prop allows custom event callbacks after important events during the authentication flows for Dynamic's React SDK. For more information, please see [the main React SDK reference](/react-sdk)

### initialAuthenticationMode

**Type:** `AuthModeType`

**Description:** Sets the initial SDK authentication mode to either connect-only or connect-and-sign. connect-only does not require users to authenticate to prove ownership of their wallet. connect-and-sign will require an additional step for users to prove ownership of their wallet. Defaults to connect-and-sign. See also the [setAuthMode](/react-sdk/hooks/usedynamiccontext) method, which allows you to toggle this after the app has loaded.

### logLevel

**Type:** `keyof typeof LogLevel`

**Description:** The log level to use for client side logging with our SDK. Defaults to WARN

### mobileExperience

**Type:** `'in-app-browser' | 'redirect'`

**Description:** This setting determines how users connect on mobile devices. By default, it is set to 'in-app-browser', which means the connection will open within the wallet's in-app browser. If you prefer to have users connect via WalletConnect, set this option to 'redirect'. This will prompt users to accept connection requests in their wallet app and, for Phantom users, automatically redirect them back to their mobile browser. [See here for examples](#setting-mobile-experience)

### newToWeb3WalletChainMap

**Type:** `ChainToWalletMap`

**Description:** When provided, this is used in the Get your first wallet view in the wallet list modal. This can be helpful to steer initial customers who do not have a wallet to download and use a specific chain and wallet.

### networkValidationMode

**Type:** `'always' | 'sign-in' | 'never'`

**Description:** Note: Supported only in connect-only. Defines how the Dynamic SDK will enforce the wallet network.

* **always** - requires the wallet to be on an enabled network while connecting and while the session is active
* **sign-in** - will only enforce the network on connect
* **never** - completely turn off the network validation. Defaults to `sign-in`.

### onboardingImageUrl

**Type:** `string`

**Description:** When provided, this image will be shown during the customer information capture step after a wallet successfully authenticates with Dynamic and the environment requires additional information from the user.

### policiesConsentInnerComponent

**Type:** `ReactNode | ReactNode[]`

**Description:** For environments with the username setting enabled, you will need to pass in a value for this prop to show a custom prompt or label for the policies contest checkboxes displayed during customer information capture after signing.

### privacyPolicyUrl

**Type:** `string`

**Description:** When provided, this will display a privacy policy URL on the signing step. This should be set to a URL of your organization's privacy policy web page.

### recommendedWallets

**Type:** `RecommendedWallet[]`

**Description:** Available from V1.2 only. An array of wallet keys that will be recommended to the user. See more in [our section on recommending wallets](/wallets/advanced-wallets/recommend-wallets).

### redirectUrl

**Type:** `string`

**Description:** When provided, this will redirect the user to the specified URL after the user has successfully gone through an oauth flow (social login or social account linking).

### shadowDOMEnabled

**Type:** `boolean`

**Description:** Shadow DOM allows the SDK to look as intended wherever it is hosted and it plays nicely with your existing styling system. For more information, please see: [Custom CSS](/design-customizations/css/custom-css)

### siweStatement

**Type:** `string`

**Description:** When provided, this custom message will be shown on the message to sign for the wallet signing step.

### termsOfServiceUrl

**Type:** `string`

**Description:** When provided, this will display a terms of service URL on the signing step. This should be set to a URL of your organization's terms of service web page.

### walletConnectors

**Type:** `[]walletConnector`

**Description:** When provided, will enable whatever connectors you pass so that your end user can signup/login using those wallets. For the list of available connectors, see the walletConnectors section below.

### walletConnectPreferredChains

**Type:** Not specified

**Description:** Relevant to Wallet Connect only, used to determine which chains to establish a connection with first. The value must be an array containing [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) chain ID's. The format for this is `{namespace-goes-here}:{reference-goes-here}`. Currently we only support Ethereum, so it will always be `eip155:{reference-goes-here}`. For example, Ethereum mainnet being \['eip155:1']

### walletsFilter

**Type:** `(options: WalletOption[]) => WalletOption[]`

**Description:** When specified, this is a custom function that allows clients of Dynamic SDK to filter out wallet options based on a function on the wallet options. For example: `walletsFilter: (wallets) => wallets.filter((w) => w.key !== 'walletx')` will exclude walletx from showing up on the wallet list.

### bridgeChains

**Type:** `WalletsByChain`

**Description:** (Only use with bridging) Which chains should be used for bridging.

### socialProvidersFilter

**Type:** `(providers: SocialOAuthProvider[]) => SocialOAuthProvider[]`

**Description:** When specified, this is a custom function that allows clients of Dynamic SDK using social auth to filter or modify the order of the social options displayed to the user. For example, we can only show github oauth option: `socialProvidersFilter: (providers) => (['github'])`.

### overrides

**Type:** `{ views: SdkView[], evmNetworks: EvmNetwork[] }`

**Description:** Used for passing in [Views](/react-sdk/objects/views) or [evmNetworks](/chains/network-switching#evmnetworks).

### enableConnectOnlyFallback

**Type:** `boolean`

**Description:** When `true`, enables the SDK to fallback to wallet connect-only auth mode if connection to Dynamic's servers is not possible. Available in version 1.1 and above

### defaultPhoneInputIso2

**Type:** `string`

**Description:** Used to define which phone number country code should be used as the default in all phone inputs, ex: `defaultPhoneInputIso2: "fr"`

### social

**Type:** `{ strategy: 'redirect' | 'popup' }`

**Description:** Allow to customize the default social behavior from 'redirect' to 'popup'

### tokenFilter

**Type:** `(tokens: TokenBalance[]) => TokenBalance[]`

**Description:** Allows filtering which tokens show in the widget balance view. Hidden tokens will not count towards the total balance.

## walletConnectors

Here are the possible options for the walletConnectors array. For each one, you must make sure you have installed the package first:

<Tip>
  Please note that @dynamic-labs/ethereum (EthereumWalletConnectors) contains
  all EVM chains, not just Ethereum. It also includes Dynamic-powered embedded
  wallets, as these are EVM based too.
</Tip>

| Package Name           | Chain  | WalletConnector to include |
| :--------------------- | :----- | -------------------------- |
| @dynamic-labs/ethereum | EVM    | `EthereumWalletConnectors` |
| @dynamic-labs/algorand | ALGO   | `AlgorandWalletConnectors` |
| @dynamic-labs/solana   | SOL    | `SolanaWalletConnectors`   |
| @dynamic-labs/flow     | FLOW   | `FlowWalletConnectors`     |
| @dynamic-labs/starknet | STARK  | `StarknetWalletConnectors` |
| @dynamic-labs/cosmos   | COSMOS | `CosmosWalletConnectors`   |

##### EVM Addon Wallets

| Package Name         | Which Wallets | WalletConnector to include  |
| :------------------- | :------------ | :-------------------------- |
| @dynamic-labs/magic  | *magic*       | `MagicWalletConnectors`     |
| @dynamic-labs/blocto | *blocto*      | `BloctoEvmWalletConnectors` |

## Locale

This prop is for editing copy and adding translations to the SDK. For more information, please see [the customizing copy guide](/design-customizations/customizing-copy-translations) and [reference](/react-sdk/objects/locale).

## Examples

#### Initiate Dynamic using only defaults

```JavaScript
<DynamicContextProvider
    settings={{
      environmentId: 'YOUR_ENVIRONMENT_ID'
  }}>
  <MyChildComponents />
</DynamicContextProvider>
```

#### Initiate Dynamic with Ethereum and Starknet wallets enabled

```JavaScript
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { StarknetWalletConnectors } from "@dynamic-labs/starknet";

<DynamicContextProvider
    settings={{
      environmentId: 'YOUR_ENVIRONMENT_ID',
      walletConnectors: [EthereumWalletConnectors, StarknetWalletConnectors]
  }}>
  <MyChildComponents />
</DynamicContextProvider>
```

#### Initiate Dynamic using all available methods

```JavaScript
<DynamicContextProvider
    settings={{
      environmentId: 'YOUR_ENVIRONMENT_ID',
      accessDeniedMessagePrimary: 'Custom main error message',
      accessDeniedMessageSecondary: 'Custom secondary error message',
      cssOverrides: ".wallet-list-item__tile { background-color: lightblue; }",
      debugError: true,
      displaySiweStatement: true,
      enableVisitTrackingOnConnectOnly: true,
      events: {
        onAuthFlowClose: () => {
          console.log('in onAuthFlowClose');
        },
        onAuthFlowOpen: () => {
          console.log('in onAuthFlowOpen');
        },
        onAuthSuccess: () => {
          navigate('/dashboard/overview');
        },
        onLogout: () => {
          console.log('in onLogout');
        },
      },
      initialAuthenticationMode: 'connect-only',
      logLevel: 'DEBUG',
      newToWeb3WalletChainMap: {
        1: ['metamask', 'walletconnect'],
        137: ['metamask', 'walletconnect'],
        56: ['metamask', 'walletconnect'],
        80001: ['metamask', 'walletconnect'],
      },
      onboardingImageUrl: 'https://i.imgur.com/3g7nmJC.png',
      policiesConsentInnerComponent: (
        <div>
          <p>
            By clicking "Connect", you agree to our{' '}
            <a href="https://www.dynamic.xyz/terms-of-service" target="_blank">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="https://www.dynamic.xyz/privacy-policy" target="_blank">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      ),
      privacyPolicyUrl: 'https://www.dynamic.xyz/privacy-policy',
      shadowDOMEnabled: true,
      siweStatement: 'Custom message to sign',
      termsOfServiceUrl: 'https://www.dynamic.xyz/terms-of-service',
      walletsFilter: (wallets) => wallets.filter((w) => w.key !== 'walletx'),
  }}>
  <MyChildComponents />
</DynamicContextProvider>
```

#### Do not show `walletx` on the wallet list

```JavaScript
<DynamicContextProvider
  settings={{
    environmentId: '<<sandboxEnvironmentId>>'
    walletsFilter: (wallets) => wallets.filter((w) => w.key !== 'walletx'),
  }}
>
  <MyChildComponents />
</DynamicContextProvider>
```

#### With events callbacks

```JavaScript
<DynamicContextProvider
    settings={{
      environmentId: '<<sandboxEnvironmentId>>',
      events: {
        onAuthFlowClose: () => {
          console.log('in onAuthFlowClose');
        },
        onAuthFlowOpen: () => {
          console.log('in onAuthFlowOpen');
        },
        onAuthSuccess: () => {
          navigate('/dashboard/overview');
        },
        onLogout: () => {
          console.log('in onLogout');
        },
      },
  }}>
  <MyChildComponents />
</DynamicContextProvider>
```

#### Setting mobile experience

##### Globally for all wallets

```JavaScript
<DynamicContextProvider
    settings={{
      environmentId: '<<sandboxEnvironmentId>>',
      mobileExperience: 'redirect' | 'in-app-browser'
  }}>
  <MyChildComponents />
</DynamicContextProvider>
```

##### On a wallet by wallet basis with optional default for all non-specified wallets

**Note**: The walletKey can be found on the chains and networks page of the dashboard [here](https://app.dynamic.xyz/dashboard/chains-and-networks#evm)

```JavaScript
<DynamicContextProvider
    settings={{
      environmentId: '<<sandboxEnvironmentId>>',
      mobileExperience: {
        '<<walletKey>>': 'redirect' | 'in-app-browser',
        default: 'in-app-browser'
      }
  }}>
  <MyChildComponents />
</DynamicContextProvider>
```

import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { mainnet } from "viem/chains";
import { BitcoinWalletConnectors } from "@dynamic-labs/bitcoin";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { FlowWalletConnectors } from "@dynamic-labs/flow";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { SuiWalletConnectors } from "@dynamic-labs/sui";

const config = createConfig({
  chains: [mainnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function App() {
  return (
    <DynamicContextProvider
      settings={{
        // Find your environment id at https://app.dynamic.xyz/dashboard/developer
        environmentId: "REPLACE-WITH-YOUR-ENVIRONMENT-ID",
        walletConnectors: [
          BitcoinWalletConnectors,
          EthereumWalletConnectors,
          FlowWalletConnectors,
          SolanaWalletConnectors,
          SuiWalletConnectors,
        ],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <DynamicWidget />
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}


# Using Wagmi

The default SDK implementation does not use Wagmi, but you can add full support for it by following the steps below.

#### Installing packages

First, you want to install the DynamicWagmiConnector package using `npm` or `yarn`

<CodeGroup>
  ```shell npm
  npm install viem wagmi @tanstack/react-query @dynamic-labs/wagmi-connector @dynamic-labs/sdk-react-core @dynamic-labs/ethereum
  ```

  ```shell yarn
  yarn add viem wagmi @tanstack/react-query @dynamic-labs/wagmi-connector @dynamic-labs/sdk-react-core @dynamic-labs/ethereum
  ```

  ```shell pnpm
  pnpm add viem wagmi @tanstack/react-query @dynamic-labs/wagmi-connector @dynamic-labs/sdk-react-core @dynamic-labs/ethereum
  ```
</CodeGroup>

#### Configure Wagmi and Dynamic

Here's a full code snippet with all the setup code required.

```TypeScript
import {
  DynamicContextProvider,
  DynamicWidget,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import {
  createConfig,
  WagmiProvider,
  useAccount,
} from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { mainnet } from 'viem/chains';

const config = createConfig({
  chains: [mainnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: 'ENV_ID',
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <DynamicWidget />
            <AccountInfo />
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}

function AccountInfo() {
  const { address, isConnected, chain } = useAccount();

  return (
    <div>
      <p>
        wagmi connected: {isConnected ? 'true' : 'false'}
      </p>
      <p>wagmi address: {address}</p>
      <p>wagmi network: {chain?.id}</p>
    </div>
  );
};
```

Two things to note here:

1. `multiInjectedProviderDiscovery` is set to `false` – this is because Dynamic implements the multi injected provider discovery protocol itself. If you'd like to keep this enabled on Wagmi, please do, but you might see some undefined behavior and we might not be able to debug.
2. While this example configures mainnet as the only chain, you can pass in all your supported chains to the `chains` array. For more info, see the "Chain Configuration" section below.

Throughout your app, you can now use Wagmi hooks like `useAccount` and they will automatically sync to the wallet that you logged in with via Dynamic.

<Note>
  Make sure to call `createConfig` at the top-level of your app. If you call it
  inside of a component, it will be called during each render, which can lead to
  unexpected behavior.
</Note>

#### Chain Configuration

If you are upgrading from Dynamic + Wagmi v1, then this config will look new to you. Previously, Dynamic was automatically updating the Wagmi config with the chains that you configured in your Dynamic Dashboard.
This behavior has changed in v2 to give you more control over your Wagmi config and for a simpler integration. What this means is that you will need to pass to Wagmi all of the chains you have configured with Dynamic.

For example, if in Dynamic you have enabled Ethereum Mainnet, Optimism and Base, you will need to update your Wagmi config to look like this:

```TypeScript
import {
  createConfig,
  WagmiProvider,
} from 'wagmi';
import { http } from 'viem';
import { mainnet, optimism, base } from 'viem/chains';

const config = createConfig({
  chains: [mainnet, optimism, base],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
});
```

### Adding Custom Networks

As you probably already know, you can add a custom EVM network through Dynamic using [the evmNetworks prop](/chains/evmNetwork). If you want to use these custom networks with Wagmi, you will need to declare it in your Wagmi config.

You can use our util function called [getOrMapViemChain](/react-sdk/utilities/getormapviemchain) to convert the EVM network object to a Viem chain object.

Here's an example of adding the Morph network to both Dynamic and to the Wagmi config:

```tsx
import {
  createConfig,
  WagmiProvider,
} from 'wagmi';

import { http } from 'viem';

import { getOrMapViemChain } from '@dynamic-labs/ethereum-core';

const customEvmNetworks = [
  {
    blockExplorerUrls: ["https://explorer-holesky.morphl2.io/"],
    chainId: 2810,
    name: "Morph",
    rpcUrls: ["https://rpc-quicknode-holesky.morphl2.io"],
    iconUrls: ["https://avatars.githubusercontent.com/u/132543920?v=4"],
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    networkId: 2810,
  },
]

export const wagmiConfig = createConfig({
  chains: [
    mainnet,
    ...customEvmNetworks.map(getOrMapViemChain),
  ],
  client({ chain }) {
    return createClient({
      chain,
      transport: http(),
    });
  },
});
```

### Adding Private RPCs

Note that if you are using [a private RPC in Dynamic](/chains/rpc-urls#dashboard-configuration), you will also need to declare that in your Wagmi config. Luckily this is as simple as passing it into your http transport in Wagmi:

```tsx
import {
  createConfig,
  WagmiProvider,
} from 'wagmi';

export const wagmiConfig = createConfig({
  chains: [mainnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http('your-private-rpc-url'),
  },
});
```

### Further Resources

For docs on `createConfig`, see: [https://wagmi.sh/react/api/createConfig](https://wagmi.sh/react/api/createConfig)

For more general information on what you can do with Wagmi, check out their getting started docs: [https://wagmi.sh/react/getting-started](https://wagmi.sh/react/getting-started)

# Vite.js polyfills necessary for Dynamic SDK

## Vite.js requires global and process polyfills

If you're using Vite.js with react and using the Dynamic SDK you may get this error in your console:

```
util.js:109 Uncaught ReferenceError: process is not defined
```

This is because one of the many libraries that our SDK depends on uses the `process` module which is natively not in the browser environment nor is it automatically polyfilled by Vite.

#### Polyfill `process` using `vite.config.js`

To fix this we must modify the `vite.config.js` file to modify `esbuild` to polyfill this for us. Here is a minimal example config:

```TypeScript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  plugins: [react()],
});
```

#### Warning: You may still see a console error `React Static Flag Error`

After applying the polyfill, you may still see an error for `React Static Flag Error`. This is currently expected. To learn more, checkout the troubleshooting page [React Static Flag Error](/troubleshooting/solved/react-static-flag-error). At this time, you can ignore this error in local development environment.

# Dynamic Doctor

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/dynamic-docs-testing/images/dynamic-doctor.png" />
</Frame>

Web3 moves fast, and this means that version management when it comes to packages is difficult. Often one library might require a specific version of Viem while another requires a different version. This is where Dynamic Doctor can help.

Use it if you've installed and initialized Dynamic but you're getting some errors. Often these can be related to the versions currently installed even though the errors themselves might not indicate it.

## Usage

In the root of your project, run the following command:

```bash
npx dynamic-doctor@latest run
```

## Output

You will see a list of issues found and a file `dynamic-doctor-report-<timestamp>.html` will be generated in your root directory.

Make sure that all of the dynamic packages have the same version, and if that doesn't fix things, you can review the generated file and as long as it doesn't contain any sensitive data, share this file with the Dynamic team to help diagnose the issue.
