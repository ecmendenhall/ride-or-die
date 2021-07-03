import React, {useState} from "react";
import { ethers } from "ethers";

declare const window: any;

export function EthAuthentication() {
    const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();

    const onConnectMetaMaskClick = function() {
        window.ethereum.enable().then(() => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            setSigner(provider.getSigner())
        })
    }

    const onLoginClick = async function() {
        if (signer !== undefined) {
            let address = await signer.getAddress();
            let response = await fetch("/login", {
                method: "POST",
                body: JSON.stringify({
                    address: address,
                }),
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });
            let { nonce } = await response.json();
            console.log(nonce);
            let signature = await signer.signMessage(nonce);
            response = await fetch("/login/sign", {
                method: "POST",
                body: JSON.stringify({
                    address: address,
                    signature: signature,
                }),
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });

            let { token } = await response.json();
            console.log(token);
        }
    };

    return (
        <div>
            {!signer &&
                <button
                    onClick={onConnectMetaMaskClick}
                    className="fixed top-8 right-10 bg-pink-600 hover:bg-pink-700 rounded-lg shadow py-1 px-2 text-yellow-50">Connect
                    Wallet
                </button>
            }
            { signer &&
                <button
                    onClick={onLoginClick}
                    className="fixed top-8 right-10 bg-pink-600 hover:bg-pink-700 rounded-lg shadow py-1 px-2 text-yellow-50">Login
                </button>
            }
        </div>
    );
}
