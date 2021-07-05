// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma abicoder v2;

import {ISuperTokenFactory, ISuperToken, ERC20WithTokenInfo} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperTokenFactory.sol";
import {ISuperfluid} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

contract SocialTokenES {
    struct SocialTokenConvertData {
        address unwrapped;
        address wrapped;
    }

    mapping(address => SocialTokenConvertData) socialTokenOwners;

    ISuperTokenFactory private _factory;

    constructor(ISuperfluid host) {
        _factory = host.getSuperTokenFactory();
    }

    function setUserSocialToken(ERC20WithTokenInfo unwrappedErc20Token)
        external
        returns (ISuperToken wrappedSuperToken)
    {
        string memory name = string(
            abi.encodePacked("Super ", unwrappedErc20Token.name())
        );
        string memory symbol = string(
            abi.encodePacked(unwrappedErc20Token.symbol(), "x")
        );

        wrappedSuperToken = _factory.createERC20Wrapper(
            unwrappedErc20Token,
            ISuperTokenFactory.Upgradability.FULL_UPGRADABE,
            name,
            symbol
        );

        wrappedSuperToken.upgrade(0);

        SocialTokenConvertData memory data;
        data.unwrapped = address(unwrappedErc20Token);
        data.wrapped = address(wrappedSuperToken);

        socialTokenOwners[msg.sender] = data;
    }

    function getOwnerToken(address owner)
        public
        view
        returns (SocialTokenConvertData memory)
    {
        return socialTokenOwners[owner];
    }
}
