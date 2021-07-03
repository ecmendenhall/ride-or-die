# ride-or-die

## Setup

### Lerna setup
```shell
$ npm install
$ npx lerna bootstrap
$ npx lerna run test #(run twice for whatever reason)
```

### Database setup
```shell
$ cd packages/api
$ createdb ride_or_die
$ createdb ride_or_die_test
```

## Run tests

### Run individual project tests
```shell
$ cd packages/<project>
$ npm run test
```
### Run all tests from root
```shell
$ npx lerna run test
```

## Run apps

### Run API server
```shell
$ cd packages/api
$ npm run server
```

### Run frontend app
```shell
$ cd packages/app
$ npm run start
```

## Forked testchain

Get an [Alchemy](https://dashboard.alchemyapi.io/) API key and add it to `.env`. (See `.env.example` for an example `.env` file)

```shell
export ALCHEMY_API_KEY=<API Key>
```

Source `.env` to load the API key into your shell context:

```shell
source .env
```

Run a local hardhat network node:

```shell
$ npx hardhat node --network hardhat
```

Deploy the contracts:
```shell
$ npx hardhat run --network localhost scripts/deploy.ts
```

The deployment script will print addresses for each deployed contract.
