# Daraja

![Daraja](assets/daraja.png)

A type-safe NodeJS library for Safaricom's [Daraja API](https://developer.safaricom.co.ke/APIs).

## Documentation

Daraja Client's full documentation is online at [Daraja Client Documentation](https://austinewuncler.github.io/daraja).

## Installation

```bash
npm install @daraja/client
```

or

```bash
yarn add @daraja/client
```

## Quick Start

A full set of examples can be found in the [online documentation](https://austinewuncler.github.io/daraja).

To get started, install `@daraja/client` and create an app on <https://developer.safaricom.co.ke/MyApps/> to get your `CONSUMER_KEY` and `CONSUMER_SECRET`

### Authorization

```typescript
import { DarajaCredentials } from '@daraja/client';

const credentials = new DarajaCredentials({
  consumerKey: '{YOUR_CONSUMER_KEY}',
  consumerSecret: '{YOUR_CONSUMER_SECRET}',
  environment: 'sandbox',
});
```
