// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;
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

    // stop flow
    function stopPayment(bytes calldata context)
        public
        returns (bytes memory _context)
    {
        _stopPaymentFromFanFlow(context);
        return _stopRewardToFanFlow(context);
    }

    /**************************************************************************
     * SuperApp callbacks
     *************************************************************************/

    // trigger after agreement has been created
    function afterAgreementCreated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, //_agreementId,
        bytes calldata, /*_agreementData*/
        bytes calldata, // _cbdata,
        bytes calldata _ctx
    )
        external
        override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory newCtx)
    {
        return _startPayment(_ctx);
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
        return _startPayment(_ctx);
    }

    /**************************************************************************
     * Private
     *************************************************************************/
    // start payment
    function _startPayment(bytes calldata _context)
        public
        returns (bytes memory context)
    {
        context = _startPaymentFromFanFlow();
        context = _startRewardToFanFlow(_context);
    }

    /**
     * @dev Start stream from the fan -> contract based on specified payment rate
     * @dev Check if the stream creator -> fan
     */
    function _startPaymentFromFanFlow() private returns (bytes memory context) {
        (context, ) = _host.callAgreementWithContext(
            _agreement,
            abi.encodeWithSelector(
                _agreement.createFlow.selector,
                _paymentToken,
                address(this),
                _paymentRate,
                new bytes(0)
            ),
            "0x",
            context
        );

        // check if the stream from SuperApp -> creator is available
        context = _updatePaymentToCreatorFlow();
    }

    /**
     * @dev Stop stream from fan to creator
     */
    function _stopPaymentFromFanFlow(bytes calldata _context)
        private
        returns (bytes memory context)
    {
        context = _context;

        (context, ) = _host.callAgreementWithContext(
            _agreement,
            abi.encodeWithSelector(
                _agreement.deleteFlow.selector,
                _paymentToken,
                address(this),
                msg.sender,
                new bytes(0)
            ),
            "0x",
            context
        );

        context = _updatePaymentToCreatorFlow();
    }

    /**
     * @dev Check if the's already stream for payment token from app -> creator.
     * Create one, if doesnt exists, or update flow if existed.
     */
    function _updatePaymentToCreatorFlow()
        private
        returns (bytes memory context)
    {
        (, int96 outFlowRate, , ) = _agreement.getFlow(
            _paymentToken,
            address(this),
            _creatorAddress
        );

        if (outFlowRate != int96(0)) {
            (context, ) = _host.callAgreementWithContext(
                _agreement,
                abi.encodeWithSelector(
                    _agreement.updateFlow.selector,
                    _paymentToken,
                    _creatorAddress,
                    _agreement.getNetFlow(_paymentToken, address(this)),
                    new bytes(0)
                ),
                new bytes(0),
                context
            );
        } else {
            (context, ) = _host.callAgreementWithContext(
                _agreement,
                abi.encodeWithSelector(
                    _agreement.createFlow.selector,
                    _paymentToken,
                    _creatorAddress,
                    _agreement.getNetFlow(_paymentToken, address(this)),
                    new bytes(0)
                ),
                new bytes(0),
                context
            );
        }
    }

    /**
     * @dev Start stream from the app -> fan based on specified reward rate. update net flow creator -> app
     */
    function _startRewardToFanFlow(bytes calldata _context)
        private
        returns (bytes memory context)
    {
        (context, ) = _host.callAgreementWithContext(
            _agreement,
            abi.encodeWithSelector(
                _agreement.createFlow.selector,
                _rewardToken,
                _host.decodeCtx(_context).msgSender,
                _rewardRate,
                new bytes(0)
            ),
            new bytes(0),
            context
        );

        _updateRewardFromCreatorFlow();
    }

    /**
     * @dev Stop stream from fan to creator
     */
    function _stopRewardToFanFlow(bytes calldata _context)
        private
        returns (bytes memory context)
    {
        context = _context;

        (context, ) = _host.callAgreementWithContext(
            _agreement,
            abi.encodeWithSelector(
                _agreement.deleteFlow.selector,
                _paymentToken,
                address(this),
                _host.decodeCtx(_context).msgSender,
                new bytes(0)
            ),
            new bytes(0),
            context
        );

        _updatePaymentToCreatorFlow();
    }

    /**
     * @dev Check if the's already stream for reward token from creator -> app.
     * Create one, if doesnt exists, or update flow if existed.
     */
    function _updateRewardFromCreatorFlow()
        private
        returns (bytes memory context)
    {
        (, int96 flowRate, , ) = _agreement.getFlow(
            _rewardToken,
            _creatorAddress,
            address(this)
        );

        if (flowRate != int96(0)) {
            (context, ) = _host.callAgreementWithContext(
                _agreement,
                abi.encodeWithSelector(
                    _agreement.updateFlow.selector,
                    _rewardToken,
                    address(this),
                    _agreement.getNetFlow(_rewardToken, address(this)),
                    new bytes(0)
                ),
                new bytes(0),
                context
            );
        } else {
            (context, ) = _host.callAgreementWithContext(
                _agreement,
                abi.encodeWithSelector(
                    _agreement.createFlow.selector,
                    _rewardToken,
                    address(this),
                    _agreement.getNetFlow(_rewardToken, address(this)),
                    new bytes(0)
                ),
                new bytes(0),
                context
            );
        }
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