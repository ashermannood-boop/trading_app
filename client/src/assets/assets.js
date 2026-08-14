import bitcoin from './bitcoin.svg';
import ethereum from './ethereum.svg';
import xrp from './xrp.svg';
import binance from './binance.svg';
import usdc from './usdc.svg';
import solana from './solana.svg';
import dogs from './dogs.svg';
import cardano from './cardano.svg';
import polkadot from './polkadot.svg';
import tether from './tether.svg';
import google from './google.png';
import telegram from './telegram.png';
import hero from './hero.jpg';
import hero1 from './hero1.jpg';
import hero2 from './hero2.jpg';
import logo from './logo.png';

// REMOTE ASSETS (Migrated to CryptoLogos where available)
const remoteIcons = {
    dogecoin: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
    tron: "https://cryptologos.cc/logos/tron-trx-logo.png",
    polygon: "https://cryptologos.cc/logos/polygon-matic-logo.png",
    avalanche: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
    near: "https://cryptologos.cc/logos/near-protocol-near-logo.png",
    cosmos: "https://cryptologos.cc/logos/cosmos-atom-logo.png",
    optimism: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png",
    fantom: "https://cryptologos.cc/logos/fantom-ftm-logo.png",
    stacks: "https://cryptologos.cc/logos/stacks-stx-logo.png",
    celestia: "https://cryptologos.cc/logos/celestia-tia-logo.png",
    uniswap: "https://cryptologos.cc/logos/uniswap-uni-logo.png",
    aave: "https://cryptologos.cc/logos/aave-aave-logo.png",
    chainlink: "https://cryptologos.cc/logos/chainlink-link-logo.png",
    "lido-dao": "https://cryptologos.cc/logos/lido-dao-ldo-logo.png",
    thorchain: "https://cryptologos.cc/logos/thorchain-rune-logo.png",
    pancakeswap: "https://cryptologos.cc/logos/pancakeswap-cake-logo.png",
    "internet-computer": "https://cryptologos.cc/logos/internet-computer-icp-logo.png",
    "fetch-ai": "https://cryptologos.cc/logos/fetch-ai-fet-logo.png",
    pepe: "https://cryptologos.cc/logos/pepe-pepe-logo.png",
    "shiba-inu": "https://cryptologos.cc/logos/shiba-inu-shib-logo.png",
    litecoin: "https://cryptologos.cc/logos/litecoin-ltc-logo.png",
    "bitcoin-cash": "https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png",
    "ethereum-classic": "https://cryptologos.cc/logos/ethereum-classic-etc-logo.png",
    stellar: "https://cryptologos.cc/logos/stellar-xlm-logo.png",
    algorand: "https://cryptologos.cc/logos/algorand-algo-logo.png",
    vechain: "https://cryptologos.cc/logos/vechain-vet-logo.png",
  //  "hedera-hashgraph": "https://cryptologos.cc/logos/hedera-hashgraph-hbar-logo.png",
     "hedera-hashgraph": "https://assets.coingecko.com/coins/images/3688/small/hbar.png",
    filecoin: "https://cryptologos.cc/logos/filecoin-fil-logo.png",

    // High-quality Fallbacks for items missing from CryptoLogos catalog
    sui: "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
    aptos: "https://s2.coinmarketcap.com/static/img/coins/64x64/21805.png",
    dogwifhat: "https://s2.coinmarketcap.com/static/img/coins/64x64/28752.png",
    arbitrum: "https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png",
    default: "https://assets.codepen.io/ss/placeholder.svg"
};

// EXPORT COMBINED ASSETS
export const assets = {
    logo,
    hero,
    hero1,
    hero2,
    google,
    telegram,

    bitcoin,
    ethereum,
    solana,
    cardano,
    polkadot,
    tether,
    usdc,
    
    binancecoin: binance,
    ripple: xrp,
    xrp,
    binance,
    dogs,

    ...remoteIcons
};