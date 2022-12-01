# Welcome

![Daraja](./assets/daraja.png)

Daraja Client is a type-safe NodeJS library for Safaricom's [Daraja API](https://developer.safaricom.co.ke/APIs). With Daraja Client you get full access to all of the operations provided by the Daraja platform.

## Installation

Install Daraja Client with:

```bash
npm install @daraja/client
```

or

```bash
yarn add @daraja/client
```

## Getting Started

### Authorization

#### Quick Start

Daraja Client provides a `DarajaCredentials` class that manages the credentials required to access the Daraja API.
First create an instance of `DarajaCredentials` like so:

```typescript
import { DarajaCredentials } from '@daraja/client';

const credentials = new DarajaCredentials({
  consumerKey: '{YOUR_CONSUMER_KEY}',
  consumerSecret: '{YOUR_CONSUMER_SECRET}',
  environment: 'sandbox',
});
```
