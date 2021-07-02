import { ethers } from 'ethers'

class Chain {
    private provider: ethers.providers.Web3Provider;

    constructor(externalProvider : ethers.providers.ExternalProvider) {
        this.provider = new ethers.providers.Web3Provider(externalProvider);
    }

  getProvider() {
      return this.provider;
  }

  getSigner() {
        return this.provider.getSigner;
  }
}

export default Chain;