// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma abicoder v2;

import {ISuperfluid, ISuperToken, ISuperAgreement, SuperAppDefinitions} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {SuperAppBase} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

import "./interfaces/IStreamPayment.sol";

contract StreamPayment is SuperAppBase, IStreamPayment {

    struct EccoCreator {
        uint id;
        ISuperToken paymentToken;
        ISuperToken rewardToken;
        uint paymentRate;
        uint rewardRate;
    }

    ISuperfluid private _host;
    IConstantFlowAgreementV1 private _agreement;

    mapping(address => EccoCreator) private creatorMap;
    uint private creatorCount;

    constructor(
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa
    ) {
        _host = host;
        _agreement = cfa;

        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL |
            SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

        _host.registerApp(configWord);
    }

    function createEccoCreator(bytes calldata _context) external override {

        (address creatorAddr, 
        ISuperToken paymentToken, ISuperToken rewardToken,
        uint paymentRate, uint rewardRate) = abi.decode(
            _host.decodeCtx(_context).userData,
            (address, ISuperToken, ISuperToken, uint, uint)
        );

        _createEccoCreator(creatorAddr, paymentToken, rewardToken, paymentRate, rewardRate);
        
    }

    function _createEccoCreator(address creatorAddr,
        ISuperToken paymentToken, ISuperToken rewardToken,
        uint paymentRate, uint rewardRate) public {
        EccoCreator storage dupCreator = creatorMap[creatorAddr];
        require(_contains(dupCreator.id), 'Duplicate Ecco Creator');
        creatorCount++;
        EccoCreator memory eccoCreator = EccoCreator(creatorCount, paymentToken, rewardToken, paymentRate, rewardRate);
        creatorMap[creatorAddr] = eccoCreator;
        emit EccoCreatorCreated(creatorAddr);
    }

    function getPaymentRate(address creator) external override view returns (uint) {
        require(isEccoCreator(creator));
        EccoCreator storage eccoCreator = creatorMap[creator];
        return eccoCreator.paymentRate;
    }

    function isEccoCreator(address creator) public view returns (bool) {
       EccoCreator storage eccoCreator = creatorMap[creator];
       require(_contains(eccoCreator.id), 'Not a Ecco Creator');
       return true;
    }

    function _contains(uint eccoCreatorID) private view returns (bool){
        return eccoCreatorID > 0 && eccoCreatorID <= creatorCount;
    }

    // start payment
    function startPayment(bytes calldata _context, address creatorAddress)
        private
        returns (bytes memory newContext)
    {
        require(isEccoCreator(creatorAddress));
        EccoCreator storage eccoCreator = creatorMap[creatorAddress];

        newContext = _startPaymentFromFanFlow(_context, creatorAddress, eccoCreator);
        return _startRewardToFanFlow(newContext, eccoCreator);
    }

    // stop flow
    function stopPayment(bytes calldata context)
        external override
        returns (bytes memory _context)
    {
        address sender = _host.decodeCtx(_context).msgSender;

        (address creatorAddress) = abi.decode(
            _host.decodeCtx(_context).userData,
            (address)
        );

        require(isEccoCreator(creatorAddress));
        EccoCreator storage eccoCreator = creatorMap[creatorAddress];

        _context = _stopPaymentFromFanFlow(context, creatorAddress, eccoCreator);
        _context = _stopRewardToFanFlow(_context, eccoCreator);

        emit PaymentStreamStopped(sender);
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
        if (action == 1) {} else {
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

    /**************************************************************************
     * Private
     *************************************************************************/

    /**
     * @dev Start stream from the fan -> contract based on specified payment rate
     * @dev Check if the stream creator -> fan
     */
    function _startPaymentFromFanFlow(bytes memory _context, address creator, EccoCreator memory eccoCreator)
        private
        returns (bytes memory newContext)
    {
        address sender = _host.decodeCtx(_context).msgSender;

        emit FanPaymentStreamCreated(sender);

        // check if the stream from SuperApp -> creator is available
        newContext = _updatePaymentToCreatorFlow(_context, creator, eccoCreator);
    }

    /**
     * @dev Stop stream from fan to creator
     */
    function _stopPaymentFromFanFlow(bytes calldata _context, address creator, EccoCreator memory eccoCreator)
        private
        returns (bytes memory newContext)
    {
        address sender = _host.decodeCtx(_context).msgSender;

        (newContext, ) = _host.callAgreementWithContext(
            _agreement,
            abi.encodeWithSelector(
                _agreement.deleteFlow.selector,
                eccoCreator.paymentToken,
                address(this),
                msg.sender,
                new bytes(0)
            ),
            "0x",
            _context
        );

        emit FanPaymentStreamStopped(sender);

        _updatePaymentToCreatorFlow(newContext, creator, eccoCreator);
    }

    /**
     * @dev Check if the's already stream for payment token from app -> creator.
     * Create one, if doesnt exists, or update flow if existed.
     */
    function _updatePaymentToCreatorFlow(bytes memory _context, address creatorAddress, EccoCreator memory eccoCreator)
        private
        returns (bytes memory newContext)
    {
        ISuperToken paymentToken = eccoCreator.paymentToken;
        (, int96 outFlowRate, , ) = _agreement.getFlow(
            paymentToken,
            address(this),
            creatorAddress
        );

        if (outFlowRate != int96(0)) {
            (newContext, ) = _host.callAgreementWithContext(
                _agreement,
                abi.encodeWithSelector(
                    _agreement.updateFlow.selector,
                    paymentToken,
                    creatorAddress,
                    _agreement.getNetFlow(paymentToken, address(this)),
                    new bytes(0)
                ),
                "0x",
                _context
            );

            emit AppToCreatorStreamUpdated(creatorAddress);
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

            emit AppToCreatorStreamCreated(creatorAddress);
        }

        return newContext;
    }

    /**
     * @dev Start stream from the app -> fan based on specified reward rate. update net flow creator -> app
     */
    function _startRewardToFanFlow(bytes memory _context, EccoCreator memory eccoCreator)
        private
        returns (bytes memory newContext)
    {
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
    function _stopRewardToFanFlow(bytes memory _context, EccoCreator memory eccoCreator)
        private
        returns (bytes memory newContext)
    {
        newContext = _context;

        (newContext, ) = _host.callAgreementWithContext(
            _agreement,
            abi.encodeWithSelector(
                _agreement.deleteFlow.selector,
                eccoCreator.rewardToken,
                address(this),
                _host.decodeCtx(_context).msgSender,
                new bytes(0)
            ),
            new bytes(0),
            _context
        );
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
