// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

interface IStreamPayment {


    // method to create ecco creator to store the mapping
    function createEccoCreator(bytes calldata _context) external;

    // Method to get the payment rate of the creator
    function getPaymentRate(address creator) external view returns (uint);

    // Method to stop payment from fan to creator
    function stopPayment(bytes calldata context) external returns (bytes memory _context);

    // Triggered when #createEccoCreator is called
    event EccoCreatorCreated(address creator);

    // Triggered when fan payment stream is created
    event FanPaymentStreamCreated(address fan);

    // Triggered when fan payment stream is stopped
    event FanPaymentStreamStopped(address fan);

    // Triggered when payment stream from app to creator is created
    event AppToCreatorStreamCreated(address creator);

    // Triggered when payment stream from app to creator is updated
    event AppToCreatorStreamUpdated(address creator);

    // Triggered when reward  stream from app to fan is created. 
    event AppToFanRewardStreamCreated(address fan);

    // Triggered when reward stream is stopped
    event RewardStreamStopped(address fan);

    // Triggered when #FanPaymentStreamStopped and #RewardStreamStopped is stopped
    event PaymentStreamStopped(address fan);
    

}