// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@chainlink/contracts/src/v0.7/ChainlinkClient.sol";

interface IGoalManager {
    struct Goal {
        address staker;
        uint256 target;
        uint256 stake;
        uint256 created;
        uint256 expires;
    }

    function goals(uint256 goalId) external view returns (Goal memory);
}

contract Oracle is ChainlinkClient {
    using Chainlink for Chainlink.Request;

    address public chainlinkOracle;
    bytes32 public chainlinkJobId;
    string public apiBaseUrl;

    mapping(bytes32 => uint256) public requests;

    IGoalManager public goalManager;

    constructor(
        address goalManager_,
        address chainlinkOracle_,
        bytes32 chainlinkJobId_,
        string memory apiBaseUrl_
    ) {
        goalManager = IGoalManager(goalManager_);
        chainlinkOracle = chainlinkOracle_;
        chainlinkJobId = chainlinkJobId_;
        apiBaseUrl = apiBaseUrl_;
        //setPublicChainlinkToken();
    }

    function verificationURL(uint256 goalId) public view returns (string memory) {
        IGoalManager.Goal memory goal = goalManager.goals(goalId);
        return string(
            abi.encodePacked(
                apiBaseUrl,
                addressToString(goal.staker),
                "/?after=",
                uint256ToString(goal.created),
                "&before=",
                uint256ToString(goal.expires)
            )
        );
    }

    function newChainlinkRequest(uint256 goalId) public view returns (Chainlink.Request memory) {
        Chainlink.Request memory request = buildChainlinkRequest(
            chainlinkJobId,
            address(this),
            this.fulfill.selector
        );
        request.add("get", verificationURL(goalId));
        request.add("path", "totalDistance");
        return request;
    }

    function getGoalProgress(uint256 goalId) public returns (bytes32) {
        Chainlink.Request memory request = newChainlinkRequest(goalId);
        uint256 fee = 0.1 * 10**18;
        //return sendChainlinkRequestTo(chainlinkOracle, request, fee);
    }

    function fulfill(bytes32 requestId, uint256 distance) public {
        uint256 goalId = requests[requestId];
        delete requests[requestId];
        IGoalManager.Goal memory goal = goalManager.goals(goalId);
    }

    function uint256ToString(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = byte(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }

    function addressToString(address _address) internal pure returns(string memory) {
        bytes32 _bytes = bytes32(uint256(_address));
        bytes memory HEX = "0123456789abcdef";
        bytes memory _string = new bytes(42);
        _string[0] = '0';
        _string[1] = 'x';
        for(uint i = 0; i < 20; i++) {
            _string[2+i*2] = HEX[uint8(_bytes[i + 12] >> 4)];
            _string[3+i*2] = HEX[uint8(_bytes[i + 12] & 0x0f)];
        }
        return string(_string);
    }
}
