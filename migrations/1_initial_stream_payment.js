var StreamPayment = artifacts.require("./StreamPayment.sol");

module.exports = function(deployer) {
  deployer.deploy(StreamPayment);
};
