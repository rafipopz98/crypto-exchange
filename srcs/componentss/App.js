import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import Navbar from './Navbar'
import EthSwap from '../abis/EthSwap.json'
import Token from '../abis/Token.json'
import Main from './Main'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] })


    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance })

    // to get the contract in fronmtend you need json of that particular contract and adress of the token
    // we could do this
    // const abi = Token.abi;
    // const address = Token.networks['5777'].address;
    // load token data
    const networkId = await web3.eth.net.getId();
    const tokenData = Token.networks[networkId]
    if (tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({ token })
      //get token balance
      const tokenBalance = await token.methods.balanceOf(this.state.account).call();
      this.setState({ tokenBalance: tokenBalance.toString() })
    } else {
      window.alert("Token Contract not deployed to detected network ")
    }

    //do the same with ethSwap
    const ethSwapData = EthSwap.networks[networkId];
    if (ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address);
      this.setState({ ethSwap })
    } else {
      window.alert("EthSwap Contract not deployed to detected network ")
    }


    // after everything loads loading will be false
    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  buyToken = (etherAmount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.buyToken().send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  sellToken = (tokenAmount) => {
    this.setState({ loading: true })
    this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.ethSwap.methods.sellToken(tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      token: {},
      ethSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true
    }
  }
  render() {
    let content
    if (this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        ethBalance={this.state.ethBalance}
        tokenBalance={this.state.tokenBalance}
        buyTokens={this.buyToken.bind(this)}
        sellTokens={this.sellToken.bind(this)}
      />
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
