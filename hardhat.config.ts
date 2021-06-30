import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const INFURA_API_KEY = "e4b4cdf2ab2a417cb835edff7e919f6e"
const PRIVATE_KEY = "7c2d556c19353a93bd1871f819613de131d8e269b4d9c60246c73f4c696f0475"

module.exports = {
  solidity: "0.8.6",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: `https://ropsten.infura.io/v3/${INFURA_API_KEY}`
      } 
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  }
};

