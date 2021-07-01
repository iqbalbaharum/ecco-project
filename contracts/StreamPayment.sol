// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma abicoder v2;

import {ISuperfluid, ISuperToken, ISuperAgreement, SuperAppDefinitions} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {SuperAppBase} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

contract StreamPayment is SuperAppBase {
    ISuperfluid private _host;
    IConstantFlowAgreementV1 private _agreement;
    ISuperToken private _paymentToken;
    ISuperToken private _rewardToken;

    // for testing
    // TODO: change this to mapping later
    address private _creatorAddress;
    address private _socialTokenAddress;
    uint96 private _paymentRate = 385802469135802;
    uint96 private _rewardRate = 385802469135802;

    // event
    event FanPaymentStreamCreated(address fan);
    event FanPaymentStreamStopped(address fan);
    event AppToCreatorStreamCreated(address creator);
    event AppToCreatorStreamUpdated(address creator);
    event AppToFanStreamCreated(address fan);
    // general event
    event PaymentStreamStopped(address fan);
    event RewardStreamStopped(address fan);

    constructor(
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        ISuperToken paymentToken,
        ISuperToken rewardToken,
        address creator
    ) {
        _host = host;
        _agreement = cfa;
        _paymentToken = paymentToken;
        _rewardToken = rewardToken;
        _creatorAddress = creator;

        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL |
            SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

        _host.registerApp(configWord);
    }

    // start payment
    function startPayment(bytes calldata _context)
        public
        returns (bytes memory newContext)
    {
        newContext = _startPaymentFromFanFlow(_context);
        return _startRewardToFanFlow(newContext);
    }

    // stop flow
    function stopPayment(bytes calldata context)
        public
        returns (bytes memory _context)
    {
        address sender = _host.decodeCtx(_context).msgSender;

        _context = _stopPaymentFromFanFlow(context);
        _context = _stopRewardToFanFlow(_context);

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
        (uint256 action, ) = abi.decode(
            _host.decodeCtx(_ctx).userData,
            (uint256, bytes)
        );

        // Check if the payment is from fan or from creator
        if (action == 1) {} else {
            newCtx = startPayment(_ctx);
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
        return startPayment(_ctx);
    }

    /**************************************************************************
     * Private
     *************************************************************************/

    /**
     * @dev Start stream from the fan -> contract based on specified payment rate
     * @dev Check if the stream creator -> fan
     */
    function _startPaymentFromFanFlow(bytes memory _context)
        private
        returns (bytes memory newContext)
    {
        address sender = _host.decodeCtx(_context).msgSender;
        emit FanPaymentStreamCreated(sender);

        // check if the stream from SuperApp -> creator is available
        newContext = _updatePaymentToCreatorFlow(_context);
    }

    /**
     * @dev Stop stream from fan to creator
     */
    function _stopPaymentFromFanFlow(bytes calldata _context)
        private
        returns (bytes memory newContext)
    {
        address sender = _host.decodeCtx(_context).msgSender;

        (newContext, ) = _host.callAgreementWithContext(
            _agreement,
            abi.encodeWithSelector(
                _agreement.deleteFlow.selector,
                _paymentToken,
                address(this),
                msg.sender,
                new bytes(0)
            ),
            "0x",
            _context
        );

        emit FanPaymentStreamStopped(sender);

        _updatePaymentToCreatorFlow(newContext);
    }

    /**
     * @dev Check if the's already stream for payment token from app -> creator.
     * Create one, if doesnt exists, or update flow if existed.
     */
    function _updatePaymentToCreatorFlow(bytes memory _context)
        private
        returns (bytes memory newContext)
    {
        (, int96 outFlowRate, , ) = _agreement.getFlow(
            _paymentToken,
            address(this),
            _creatorAddress
        );

        if (outFlowRate != int96(0)) {
            (newContext, ) = _host.callAgreementWithContext(
                _agreement,
                abi.encodeWithSelector(
                    _agreement.updateFlow.selector,
                    _paymentToken,
                    _creatorAddress,
                    _agreement.getNetFlow(_paymentToken, address(this)),
                    new bytes(0)
                ),
                "0x",
                _context
            );

            emit AppToCreatorStreamUpdated(_creatorAddress);
        } else {
            (newContext, ) = _host.callAgreementWithContext(
                _agreement,
                abi.encodeWithSelector(
                    _agreement.createFlow.selector,
                    _paymentToken,
                    _creatorAddress,
                    _agreement.getNetFlow(_paymentToken, address(this)),
                    new bytes(0)
                ),
                "0x",
                _context
            );

            emit AppToCreatorStreamCreated(_creatorAddress);
        }

        return newContext;
    }

    /**
     * @dev Start stream from the app -> fan based on specified reward rate. update net flow creator -> app
     */
    function _startRewardToFanFlow(bytes memory _context)
        private
        returns (bytes memory newContext)
    {
        address sender = _host.decodeCtx(_context).msgSender;

        (newContext, ) = _host.callAgreementWithContext(
            _agreement,
            abi.encodeWithSelector(
                _agreement.createFlow.selector,
                _rewardToken,
                sender,
                _rewardRate,
                new bytes(0)
            ),
            new bytes(0),
            _context
        );

        emit AppToFanStreamCreated(sender);
    }

    /**
     * @dev Stop stream from fan to creator
     */
    function _stopRewardToFanFlow(bytes memory _context)
        private
        returns (bytes memory newContext)
    {
        newContext = _context;

        (newContext, ) = _host.callAgreementWithContext(
            _agreement,
            abi.encodeWithSelector(
                _agreement.deleteFlow.selector,
                _rewardToken,
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
