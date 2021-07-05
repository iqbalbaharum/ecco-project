import { ethers } from 'hardhat';

const main = async () => {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);

  const SocialTokenFactory = await ethers.getContractFactory('SocialToken');
  const socialToken = await SocialTokenFactory.deploy(
    'NAME',
    'NME',
    1000000000000,
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  );

  console.log('Contract deployed to:', socialToken.address);
  console.log(
    'Contract balanceOf:',
    (await socialToken.balanceOf(deployer.address)).toString()
  );
};

main();
