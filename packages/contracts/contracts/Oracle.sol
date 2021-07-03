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

    function getGoalProgress(uint256 goalId) public returns (bytes32) {
        Chainlink.Request memory request = buildChainlinkRequest(
            chainlinkJobId,
            address(this),
            this.fulfill.selector
        );
        IGoalManager.Goal memory goal = goalManager.goals(goalId);
        requests[request.id] = goalId;
        string memory url = string(
            abi.encodePacked(
                apiBaseUrl,
                goal.staker,
                "?after=",
                goal.created,
                "&before=",
                goal.expires
            )
        );
        request.add("get", url);
        request.add("path", "totalDistance");
        uint256 fee = 0.1 * 10**18;
        //return sendChainlinkRequestTo(chainlinkOracle, request, fee);
    }

    function fulfill(bytes32 requestId, uint256 distance) public {
        uint256 goalId = requests[requestId];
        delete requests[requestId];
        IGoalManager.Goal memory goal = goalManager.goals(goalId);
    }
}
