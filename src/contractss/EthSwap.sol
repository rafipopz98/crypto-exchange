pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap {
    string public name = "Haha";
    Token public token;
    uint public rate = 100; //for one eth 100 shitty shit token
    event tokensPurchased(
        address boughtBy,
        address token,
        uint amount,
        uint rate
    );
    event tokensSold(address boughtBy, address token, uint amount, uint rate);

    constructor(Token _token) public {
        token = _token;
    }

    function buyToken() public payable {
        // the ampunt of shish token to be brought has to be calculated
        // so rate * msg.value
        uint amount = rate * msg.value;

        //check whethere the exchange that many tokens to sell
        require(
            amount < token.balanceOf(address(this)),
            "We dont have enough supply"
        );

        //after check buy
        token.transfer(msg.sender, amount);

        // create an event or emit an event
        emit tokensPurchased(msg.sender, address(token), amount, rate);
    }
    function sellToken(uint _amount) public {
        // investor can sell his token to ethswap exchage
        // send the token to ethSwap
        // then send eth to investor then
        //check whether user has that many tokens
        require(
            _amount <= token.balanceOf(msg.sender),
            "You dont have enough tokens to sell"
        );
        token.transferFrom(msg.sender, address(this), _amount);
        uint etherAmount = _amount / rate;

        // check exchange has enough eth to send
        require(
            address(this).balance >= etherAmount,
            "Exchange doenot have enough eth, Please try again later"
        );
        msg.sender.transfer(etherAmount);
        // create an event or emit an event
        emit tokensPurchased(msg.sender, address(token), _amount, rate);
    }
}
