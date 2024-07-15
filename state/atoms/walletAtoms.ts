export enum WalletStatusType {
  /* nothing happens to the wallet */
  idle = '@wallet-state/idle',
  /* restored wallets state from the cache */
  restored = '@wallet-state/restored',
  /* the wallet is fully connected */
  connected = '@wallet-state/connected',
  /* connecting to the wallet */
  connecting = '@wallet-state/connecting',
  /* error when tried to connect */
  error = '@wallet-state/error',
}
