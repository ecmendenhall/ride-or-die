# ride-or-die

## Setup

### Lerna setup
`$ npm install`
`$ npx lerna bootstrap`
`$ npx lerna run test` (run twice for whatever reason)

### Database setup
`$ cd packages/api`
`$ createdb ride_or_die`
`$ createdb ride_or_die_test`

## Run tests

### Run individual project tests
```shell
$ cd packages/<project>
$ npm run test
```
### Run all tests from root
`$ npx lerna run test`

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
