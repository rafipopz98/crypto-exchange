const EthSwap = artifacts.require("EthSwap");
const Token = artifacts.require("Token")
module.exports = async function (deployer) {
    await deployer.deploy(Token)
    // send all the supply to ethSwap
    const token = await Token.deployed();

    await deployer.deploy(EthSwap, token.address);
    const ethSwap = await EthSwap.deployed();

    //swap it now using transfer in token contract

    await token.transfer(ethSwap.address, '1000000000000000000000000')
};
