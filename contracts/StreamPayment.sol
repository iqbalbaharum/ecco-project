// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma abicoder v2;

import {ISuperfluid, ISuperToken, ISuperAgreement, SuperAppDefinitions} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {SuperAppBase} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

import "./interfaces/IStreamPayment.sol";

contract StreamPayment is SuperAppBase, IStreamPayment {
    struct EccoCreator {
        int256 id;
        ISuperToken paymentToken;
        ISuperToken rewardToken;
        uint256 paymentRate;
        uint256 rewardRate;
    }

    ISuperfluid private _host;
    IConstantFlowAgreementV1 private _agreement;

    mapping(address => EccoCreator) private creatorMap;
    int256 private creatorCount;

    constructor(ISuperfluid host, IConstantFlowAgreementV1 cfa) {
        assert(address(host) != address(0));
        assert(address(cfa) != address(0));

        _host = host;
        _agreement = cfa;

        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL |
            SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

        _host.registerApp(configWord);
    }

    function createEccoCreator(
        address creatorAddr,
        ISuperToken paymentToken,
        ISuperToken rewardToken,
        uint256 paymentRate,
        uint256 rewardRate
    ) external override {
        EccoCreator storage dupCreator = creatorMap[creatorAddr];
        require(!_contains(dupCreator.id), "Duplicate Ecco Creator");
        creatorCount++;
        EccoCreator memory eccoCreator = EccoCreator(
            creatorCount,
            paymentToken,
            rewardToken,
            paymentRate,
            rewardRate
        );
        creatorMap[creatorAddr] = eccoCreator;
        emit EccoCreatorCreated(creatorAddr);
    }

    function updateEccoCreator(
        address creatorAddr,
        ISuperToken paymentToken,
        ISuperToken rewardToken,
        uint256 paymentRate,
        uint256 rewardRate
    ) external override {
        require(creatorAddr == msg.sender, "Not authorised");
        EccoCreator storage dupCreator = creatorMap[creatorAddr];
        require(
            _contains(dupCreator.id),
            "Ecco Creator not found. Cannot update"
        );
        if (paymentRate > 0) dupCreator.paymentRate = paymentRate;
        if (rewardRate > 0) dupCreator.rewardRate = rewardRate;
        dupCreator.paymentToken = paymentToken;
        dupCreator.rewardToken = rewardToken;

        emit EccoCreatorUpdated(creatorAddr);
    }

    function getPaymentRate(address creator)
        external
        view
        override
        returns (uint256)
    {
        require(isEccoCreator(creator), "Not a Ecco Creator");
        EccoCreator storage eccoCreator = creatorMap[creator];
        return eccoCreator.paymentRate;
    }

    function getPaymentTokenAddress(address creator)
        external
        view
        override
        returns (ISuperToken)
    {
        require(isEccoCreator(creator), "Not a Ecco Creator");
        EccoCreator storage eccoCreator = creatorMap[creator];
        return eccoCreator.paymentToken;
    }

    function isEccoCreator(address creator) public view returns (bool) {
        EccoCreator storage eccoCreator = creatorMap[creator];
        return _contains(eccoCreator.id);
    }

    function _contains(int256 eccoCreatorID) private view returns (bool) {
        return eccoCreatorID > 0 && eccoCreatorID <= creatorCount;
    }

    // start payment
    function startPayment(bytes calldata _context, address creatorAddress)
        private
        returns (bytes memory newContext)
    {
        require(isEccoCreator(creatorAddress), "Not a Ecco Creator");
        EccoCreator storage eccoCreator = creatorMap[creatorAddress];

        newContext = _startPaymentFromFanFlow(
            _context,
            creatorAddress,
            eccoCreator
        );
        return _startRewardToFanFlow(newContext, eccoCreator);
    }

    /**************************************************************************
     * SuperApp callbacks
     *************************************************************************/

    //
    /**
     * @dev callback after agreement has been created
     * Agreement is trigger on 2 condition
     * 1. Fan streaming payment to creator
     * 2. Creator streaming social token to contract
     */
    function afterAgreementCreated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, //_agreementId,
        bytes calldata, /*_agreementData*/
        bytes calldata, //_cbdata,
        bytes calldata _ctx
    )
        external
        override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory newCtx)
    {
        (uint256 action, address creatorAddress) = abi.decode(
            _host.decodeCtx(_ctx).userData,
            (uint256, address)
        );

        // Check if the payment is from fan or from creator
        if (action == 1) {
            newCtx = startPayment(_ctx, creatorAddress);
        }
    }

    // trigger after agreemeent has been updated
    function afterAgreementUpdated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, //_agreementId,
        bytes calldata,
        bytes calldata, //_cbdata,
        bytes calldata _ctx
    )
        external
        override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory newCtx)
    {
        (, address creatorAddress) = abi.decode(
            _host.decodeCtx(_ctx).userData,
            (uint256, address)
        );

        return startPayment(_ctx, creatorAddress);
    }

    function afterAgreementTerminated(
        ISuperToken,
        address _agreementClass,
        bytes32,
        bytes calldata,
        bytes calldata, /*_cbdata*/
        bytes calldata _ctx
    ) external override onlyHost returns (bytes memory newContext) {
        // According to the app basic law, we should never revert in a termination callback
        if (!_isCFAv1(_agreementClass)) return _ctx;
        address creator = abi.decode(_host.decodeCtx(_ctx).userData, (address));

        require(isEccoCreator(creator), "Not a Ecco Creator");
        EccoCreator storage eccoCreator = creatorMap[creator];

        newContext = _updatePaymentToCreatorFlow(_ctx, creator, eccoCreator);
        newContext = _stopRewardToFanFlow(_ctx, creator, eccoCreator);

        emit PaymentStreamStopped(msg.sender);

        return newContext;
    }

    /**************************************************************************
     * Private
     *************************************************************************/

    /**
     * @dev Start stream from the fan -> contract based on specified payment rate
     * @dev Check if the stream creator -> fan
     */
    function _startPaymentFromFanFlow(
        bytes memory _context,
        address creator,
        EccoCreator memory eccoCreator
    ) private returns (bytes memory newContext) {
        address sender = _host.decodeCtx(_context).msgSender;

        emit FanPaymentStreamCreated(sender);

        // check if the stream from SuperApp -> creator is available
        newContext = _updatePaymentToCreatorFlow(
            _context,
            creator,
            eccoCreator
        );

        return newContext;
    }

    /**
     * @dev Check if the's already stream for payment token from app -> creator.
     * Create one, if doesnt exists, or update flow if existed.
     */
    function _updatePaymentToCreatorFlow(
        bytes memory _context,
        address creatorAddress,
        EccoCreator memory eccoCreator
    ) private returns (bytes memory newContext) {
        newContext = _context;
        ISuperToken paymentToken = eccoCreator.paymentToken;
        address _receiver = creatorAddress;
        // @dev This will give me the new flowRate, as it is called in after callbacks
        int96 netFlowRate = _agreement.getNetFlow(paymentToken, address(this));
        (, int96 outFlowRate, , ) = _agreement.getFlow(
            paymentToken,
            address(this),
            _receiver
        );
        int96 inFlowRate = netFlowRate + outFlowRate;
        if (inFlowRate < 0) inFlowRate = -inFlowRate; // Fixes issue when inFlowRate is negative

        // @dev If outFlowRate != 0, then update existing flow.
        if (inFlowRate != int96(0)) {
            (newContext, ) = _host.callAgreementWithContext(
                _agreement,
                abi.encodeWithSelector(
                    _agreement.updateFlow.selector,
                    paymentToken,
                    _receiver,
                    inFlowRate,
                    new bytes(0) // placeholder
                ),
                "0x",
                newContext
            );

        } else if (inFlowRate == int96(0)) {
            // @dev if inFlowRate is zero, delete flow.
            (newContext, ) = _host.callAgreementWithContext(
                _agreement,
                abi.encodeWithSelector(
                    _agreement.deleteFlow.selector,
                    paymentToken,
                    address(this),
                    _receiver,
                    new bytes(0) // placeholder
                ),
                "0x",
                newContext
            );
        } else {
            (newContext, ) = _host.callAgreementWithContext(
                _agreement,
                abi.encodeWithSelector(
                    _agreement.createFlow.selector,
                    paymentToken,
                    creatorAddress,
                    _agreement.getNetFlow(paymentToken, address(this)),
                    new bytes(0)
                ),
                "0x",
                _context
            );
        }

        emit AppToCreatorStreamCreated(creatorAddress);

        return newContext;
    }

    /**
     * @dev Start stream from the app -> fan based on specified reward rate. update net flow creator -> app
     */
    function _startRewardToFanFlow(
        bytes memory _context,
        EccoCreator memory eccoCreator
    ) private returns (bytes memory newContext) {
        address sender = _host.decodeCtx(_context).msgSender;

        (newContext, ) = _host.callAgreementWithContext(
            _agreement,
            abi.encodeWithSelector(
                _agreement.createFlow.selector,
                eccoCreator.rewardToken,
                sender,
                eccoCreator.rewardRate,
                new bytes(0)
            ),
            new bytes(0),
            _context
        );

        emit AppToFanRewardStreamCreated(sender);
    }

    /**
     * @dev Stop stream from fan to creator
     */
    function _stopRewardToFanFlow(
        bytes memory _context,
        address creator,
        EccoCreator memory eccoCreator
    ) private returns (bytes memory newContext) {
       (newContext, ) = _host.callAgreementWithContext(
            _agreement,
            abi.encodeWithSelector(
                _agreement.deleteFlow.selector,
                eccoCreator.rewardToken,
                address(this),
                msg.sender,
                new bytes(0)
            ),
            new bytes(0),
            _context
        );

        emit RewardStreamStopped(creator);
    }

    function _isCFAv1(address agreementClass) private view returns (bool) {
        return
            ISuperAgreement(agreementClass).agreementType() ==
            keccak256(
                "org.superfluid-finance.agreements.ConstantFlowAgreement.v1"
            );
    }

    /**************************************************************************
     * modifier
     *************************************************************************/

    modifier onlyHost() {
        require(
            msg.sender == address(_host),
            "RedirectAll: support only one host"
        );
        _;
    }

    modifier onlyExpected(ISuperToken superToken, address agreementClass) {
        require(_isCFAv1(agreementClass), "RedirectAll: only CFAv1 supported");
        _;
    }
}
