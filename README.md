# travis-utils

A quick module that exports some utilities for interacting with GitHub PRs from Travis.

## Install

```sh
$ npm i -D '@mixmaxhq/travis-utils'
```

## Usage

```js
import { getClient, getOptions } from '@mixmaxhq/travis-utils';

const client = getClient();

await client.issues.createComment(
  getOptions({
    body: "I'm in ur base writing a comment",
  })
);
```
