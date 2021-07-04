import { useContext } from "react";

import { Context } from "../Context";
import api from "../lib/api";
import chain from "../lib/chain";

export function Login() {
  const {
    ethEnabled,
    setEthEnabled,
    eth,
    setEth,
    activeAddress,
    setActiveAddress,
    linkedAddress,
    setLinkedAddress,
    setContracts,
  } = useContext(Context);

  const onConnectMetaMaskClick = async function () {
    let activeAddress = await chain.connect();
    if (setActiveAddress) {
      setActiveAddress(activeAddress);
    }
    if (setEthEnabled) {
      setEthEnabled(true);
    }
    let eth = await chain.createProvider();
    if (setEth) {
      setEth(eth);
    }
    let contracts = await chain.loadContracts(eth.provider);
    if (setContracts) {
      setContracts(contracts);
    }
  };

  const onLinkAddressClick = async function () {
    let { signer } = eth || (await chain.createProvider());
    let address = await signer.getAddress();
    let nonce = await api.login(address);
    let signature = await signer.signMessage(nonce);
    await api.sign(address, signature);
    if (setLinkedAddress) {
      setLinkedAddress(address);
    }
  };

  const onUnlinkAddressClick = async function () {
    window.localStorage.removeItem("ride-or-die-token");
    if (setLinkedAddress) {
      setLinkedAddress(undefined);
    }
    if (setActiveAddress) {
      setActiveAddress(undefined);
      let activeAddress = await chain.connect();
      setActiveAddress(activeAddress);
    }
  };

  const formatAddress = function (address: string) {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  };

  return (
    <div>
      {!ethEnabled && (
        <div className="fixed top-8 right-10 space-x-2">
          <button
            onClick={onConnectMetaMaskClick}
            className="bg-pink-600 hover:bg-pink-700 rounded-lg shadow py-1 px-2 text-yellow-50"
          >
            Connect Wallet
          </button>
        </div>
      )}
      {ethEnabled && activeAddress && !linkedAddress && (
        <div className="fixed top-8 right-10 space-x-2">
          <span className="inline-block bg-gray-200 rounded-lg shadow py-1 px-2 text-gray-600">
            {formatAddress(activeAddress)}
          </span>
          <button
            onClick={onLinkAddressClick}
            className="bg-pink-600 hover:bg-pink-700 rounded-lg shadow py-1 px-2 text-yellow-50"
          >
            Link Address
          </button>
        </div>
      )}
      {ethEnabled && linkedAddress && (
        <div className="fixed top-8 right-10 space-x-2">
          <span className="inline-block bg-pink-600 rounded-lg shadow py-1 px-2 text-yellow-50">
            {formatAddress(linkedAddress)}
          </span>
          <button
            onClick={onUnlinkAddressClick}
            className="bg-pink-600 hover:bg-pink-700 rounded-lg shadow py-1 px-2 text-yellow-50"
          >
            Unlink Address
          </button>
        </div>
      )}
    </div>
  );
}
