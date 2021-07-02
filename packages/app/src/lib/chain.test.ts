import Chain from './chain';
import { ethers } from "ethers";

jest.mock("ethers");

describe('Chain Module', () => {
    let chain : Chain;
    let externalProvider : ethers.providers.ExternalProvider

    beforeAll(() => {
        externalProvider = (jest.fn() as ethers.providers.ExternalProvider);
        chain = new Chain(externalProvider);
    });

    test('setup a provider with a signer that calls ethers', () => {
        expect(chain.getProvider()).toBeDefined();
        expect(chain.getSigner()).toBeDefined();
        // expect(ethers.providers.Web3Provider).toHaveBeenCalledWith(externalProvider);
    })
})