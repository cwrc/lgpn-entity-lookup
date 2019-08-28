![Picture](http://cwrc.ca/logos/CWRC_logos_2016_versions/CWRCLogo-Horz-FullColour.png)

[![Travis](https://img.shields.io/travis/cwrc/lgpn-entity-lookup.svg)](https://travis-ci.org/cwrc/lgpn-entity-lookup)
[![Codecov](https://img.shields.io/codecov/c/github/cwrc/lgpn-entity-lookup.svg)](https://codecov.io/gh/cwrc/lgpn-entity-lookup)
[![version](https://img.shields.io/npm/v/lgpn-entity-lookup.svg)](http://npm.im/lgpn-entity-lookup)
[![downloads](https://img.shields.io/npm/dm/lgpn-entity-lookup.svg)](http://npm-stat.com/charts.html?package=lgpn-entity-lookup&from=2015-08-01)
[![GPL-3.0](https://img.shields.io/npm/l/lgpn-entity-lookup.svg)](http://opensource.org/licenses/GPL-3.0)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

# lgpn-entity-lookup

1. [Overview](#overview)

### Overview

Finds entities (people and places) in the [LGPN](http://www.lgpn.ox.ac.uk/).  Meant to be used with [cwrc-public-entity-dialogs](https://github.com/cwrc-public-entity-dialogs) where it runs in the browser.

Although it will not work in node.js as-is, it does use the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for http requests, and so could likely therefore use a browser/node.js compatible fetch implementation like: [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch).
