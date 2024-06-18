const { assert } = require('chai');

const EthSwap = artifacts.require("EthSwap");
const Token = artifacts.require("Token")

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

contract("EthSwap", ([deployer, investor]) => {
    let token, ethSwap;
    before(async () => {
        token = await Token.new();
        ethSwap = await EthSwap.new(token.address);
        await token.transfer(ethSwap.address, tokens('1000000'))
    })

    // check if token is deployed

    describe("Token Deployed", async () => {
        it("Token contract deployment status", async () => {
            const name = await token.name();
            assert.equal(name, "shity shit Token")
        })
    })

    // check if ethswap is deployed

    describe("EthSwap Deployed", async () => {
        it("EthSwap Contract deployement status", async () => {
            const name = await ethSwap.name();
            assert.equal(name, "Haha")
        })
        it("Contract has tokens 1 mil shity shit token", async () => {
            const balance = await token.balanceOf(ethSwap.address)
            assert.equal((balance.toString()), tokens('1000000'))
        })
    })

    //buy tokens
    describe("Buy Tokens", async () => {
        it("buying token from ethswap", async () => {
            const checkBalanceBefore = await token.balanceOf(investor)
            const buyToken = await ethSwap.buyToken({ from: investor, value: tokens('0.01') })
            const checkBalanceAfter = await token.balanceOf(investor)
            const ethSwapBalance = await token.balanceOf(ethSwap.address);
            assert.equal(checkBalanceBefore.toString(), tokens('0'));
            assert.equal(checkBalanceAfter.toString(), tokens('1'));
            assert.equal(ethSwapBalance.toString(), tokens('999999'));
            //check whether exchange received ethereum or not
            const etherbalance = await web3.eth.getBalance(ethSwap.address);
            assert.equal(etherbalance.toString(), tokens('0.01'))
            //emit event check and it is stored in buyToken.logs
            // console.log(buyToken.logs[0].args)
            const events = buyToken.logs[0].args;
            assert.equal(events.boughtBy, investor)
            assert.equal(events.token, token.address)
            assert.equal(events.amount.toString(), tokens('1').toString());
            assert.equal(events.rate.toString(), '100')
        })
    })

    //sell tokens
    describe("Sell Tokens", async () => {
        it("selling token to ethswap", async () => {
            // //check whether in received ethereum or not
            // const etherbalance = await web3.eth.getBalance(ethSwap.address);
            // assert.equal(etherbalance.toString(), tokens('0.01'))

            // before selling we have to approve it from investor else it will be revoked
            const checkBalanceBeforeSell = await token.balanceOf(investor)
            await token.approve(ethSwap.address, tokens('1'), { from: investor })
            const sellToken = await ethSwap.sellToken(tokens('1'), { from: investor })
            const checkBalanceAfterSell = await token.balanceOf(investor)
            assert.equal(checkBalanceBeforeSell.toString(), tokens('1'));
            assert.equal(checkBalanceAfterSell.toString(), tokens('0'));
            const ethSwapBalance = await token.balanceOf(ethSwap.address);
            assert.equal(ethSwapBalance.toString(), tokens('1000000'));
            // emit event check and it is stored in sellToken.logs
            // console.log(sellToken.logs[0].args)
            const events = sellToken.logs[0].args;
            assert.equal(events.boughtBy, investor)
            assert.equal(events.token, token.address)
            assert.equal(events.amount.toString(), tokens('1').toString());
            assert.equal(events.rate.toString(), '100')


            // Failure check
            await ethSwap.sellToken(tokens('100'), { from: investor }).should.be.rejected;
        })
    })

})