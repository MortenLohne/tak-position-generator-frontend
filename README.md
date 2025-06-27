# Random tak position generator

Hosted on https://random-tak-positions.vercel.app

A small website implementing a [bijection](https://en.wikipedia.org/wiki/Bijection) between [tak](https://en.wikipedia.org/wiki/Tak_(game)) positions and natural numbers, meaning that every number between 0 and 234953877228339135776421063941057364108851372312359712 maps to a unique tak position. This also allows generating truly random tak positions, by generating a random number in that range and converting it to a position.

The math is based on the counting function described in [AI agents for the abstract strategy game Tak](https://theses.liacs.nl/pdf/LaurensBeljaards2017Tak.pdf) by Laurens Beljaards, section 4.2.

## Building the wasm

Requires Rust and `wasm-pack` to be installed:

```bash
cd wasm-position-generator
wasm-pack build --target web -d pkg
```

## Running

Can be run with any http server, for example `python3 -m http.server`.