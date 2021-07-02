import { ethers } from "ethers";
declare const window: any;

export function connectMetaMask() {
    window.ethereum.enable().then(() => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
    });
}