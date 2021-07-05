import { ethers } from 'hardhat'
import { utils } from 'ethers'
const SuperfluidSDK = require("@superfluid-finance/js-sdk");

const ropstenHost = '0xF2B4E81ba39F5215Db2e05B2F66f482BB8e87FD2'
const goerliHost = '0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9'

const ropstenCFAV1 = '0xaD2F1f7cd663f6a15742675f975CcBD42bb23a88'
const goerliCFAV1 = '0xEd6BcbF6907D4feEEe8a8875543249bEa9D308E8'

const ropstenEthx = '0x6fC99F5591b51583ba15A8C2572408257A1D2797'
const goerliEthx = '0x5943F705aBb6834Cad767e6E4bB258Bc48D9C947'

const ropstenfDAIx = '0xBF6201a6c48B56d8577eDD079b84716BB4918E8A'
const goerlifDAIx = '0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00'

const paymentRate = 1000
const rewardRate = 1000

const overrides = {
    gasLimit: 9999999,
}

const abicoder = new utils.AbiCoder();

const startTest = async () => {
    const StreamPayment = await ethers.getContractFactory("StreamPayment");
    const streamPayment = await StreamPayment.deploy(goerliHost, goerliCFAV1, overrides);
    const [wallet0, wallet1] = await ethers.getSigners();

    // Create a Ecco creator
    await streamPayment.createEccoCreator(wallet0.address, goerlifDAIx, goerlifDAIx, paymentRate, rewardRate, overrides);

    const sf = new SuperfluidSDK.Framework({
        ethers: ethers.provider,
        tokens: ["fDAI"],
    });
    
    await sf.initialize();
    
    // create a fan 
    const fan = sf.user({
        address: wallet1.address,
        token: goerlifDAIx // fDai
    });
    
    // Start a flow to the contract
    await fan.flow({
        recipient: streamPayment.address,
        flowRate: paymentRate,
        userData: abicoder.encode(
            ["uint256", "address"],
            [1, wallet0.address]
        ),
    });

    const details = await fan.details();
    console.log(details);
}

startTest()

// describe('StreamPayment', async () => {

//     const StreamPayment = await ethers.getContractFactory("StreamPayment");
//     const streamPayment = await StreamPayment.deploy(goerliHost, goerliCFAV1, overrides);
//     const [wallet0, wallet1] = await ethers.getSigners()

//     describe("#Create Ecco Creator", () => {

//         it('Create Ecco creator success', async ()  => {
//             await expect(streamPayment.createEccoCreator(wallet0.address, goerlifDAIx, goerlifDAIx, paymentRate, rewardRate, overrides))
//             .to.emit(streamPayment, "EccoCreatorCreated")
//             .withArgs(wallet0.address)
//         })

//         it('Duplicate Ecco creator', async ()  => {
//             await expect(streamPayment.createEccoCreator(wallet0.address, goerlifDAIx, goerlifDAIx, paymentRate, rewardRate, overrides))
//             .to.be.revertedWith('Duplicate Ecco Creator')
//         })

//         it('#isEcoCreator returns true for valid ecco creator', async ()  => {
//             expect(await streamPayment.isEccoCreator(wallet0.address)).to.be.true
//         })

//         it('#isEcoCreator returns false for invalid ecco creator', async ()  => {
//             expect(await streamPayment.isEccoCreator(wallet1.address)).to.be.false
//         })

//         it('#getPaymentRate for valid ecco creator', async ()  => {
//             expect(await streamPayment.getPaymentRate(wallet0.address))
//             .to.equal(paymentRate)
//         })

//         it('#getPaymentRate reverts for invalid ecco creator', async ()  => {
//             await expect(streamPayment.getPaymentRate(wallet1.address))
//             .to.be.revertedWith('Not a Ecco Creator')
//         })
//     })

//     describe("#Payment flow", () => {

//         it('Start payment flow from fan', async () => {

//             const sf = new SuperfluidSDK.Framework({
//                 ethers: ethers.provider,
//                 tokens: ["fDAI"],
//               });
            
//               await sf.initialize();
            
//               // create a fan 
//               const fan = sf.user({
//                 address: wallet1.address,
//                 token: goerlifDAIx // fDai
//               });
            
//               // Starte a flow to the contract
//               await fan.flow({
//                 recipient: streamPayment.address,
//                 flowRate: paymentRate,
//                 userData: abicoder.encode(
//                     ["uint256", "address"],
//                     [1, wallet0.address]
//                   ),
//               });

//         })


//     })


// })