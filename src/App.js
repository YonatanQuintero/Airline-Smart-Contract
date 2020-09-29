import React, { Component } from "react";
import Panel from "./Panel";
import getWeb3 from "./getWeb3";
import AirlineContract from "./airline";
import AirlineServices from "./AirlineService";
import {ToastContainer} from "react-toastr";


const converter = (web3)=>{
    return (value) => {
        return web3.utils.fromWei(value.toString(),'ether');
    }
}

export class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            account: undefined,
            balance: 0,
            flights:[],
            customerFlights:[],
            refundableEther:0
        }
    }

    async getRefundableEther(){
        let refundableEther = this.toEther ((await this.airlineService.getRefundableEther(this.state.account)));
        this.setState({
            refundableEther
        });
    }

    async redeemLoyalityPoints(){
        await this.airlineService.redeemLoyalityPoints(this.state.account);
    }


    async getCustomerFlights(){
        let customerFlights = await this.airlineService.getCustomerFlights(this.state.account);
        this.setState({
            customerFlights
        });
        console.log("--- START CUSTOMER FLIGHT --");
        console.log(customerFlights);
        console.log(this.state);
        console.log("--- END CUSTOMER FLIGHT --");
    }

    async componentDidMount() {
        let self = this;

        this.web3 = await getWeb3();
        this.toEther = converter(this.web3);

        this.airline = await AirlineContract(this.web3.currentProvider);
        console.log(this.web3.version)
        this.airlineService = new AirlineServices(this.airline);

        let flightPurchased = this.airline.FlightPurchased();
        flightPurchased.watch(function(err,result){

            const {customer, price, flight} = result.args;

            if(customer === this.state.account){
                console.log(`You purchased a flight to ${flight} with a cost of ${price}`);
            }else{
                this.container.success(`Last customer purchased a flight to ${flight} with a cost of ${price}`, `Flight information`);
            }

        }.bind(this));

        var account = (await this.web3.eth.getAccounts())[0];

       /* this.web3.currentProvider.publicConfigStore.on('update', async function(event){
            console.log(event,event.selectedAddress);
            this.setState({
                account: event.selectedAddress.toLowerCase()
            },()=>{
                this.load();
            });
        }.bind(this));*/
        
        let currentAccount = null;
        ethereum.request({ method: 'eth_accounts' }).then(handleAccountsChanged).catch((err) => {
            // Some unexpected error.
            // For backwards compatibility reasons, if no accounts are available,
            // eth_accounts will return an empty array.
            console.error(err);
        });

        ethereum.on('accountsChanged', handleAccountsChanged);

        // For now, 'eth_accounts' will continue to always return an array
        function handleAccountsChanged(accounts) {
            console.log(accounts);
            if (accounts.length === 0) {
                // MetaMask is locked or the user has not connected any accounts
                console.log('Please connect to MetaMask.');
            } else if (accounts[0] !== currentAccount) {
                currentAccount = accounts[0];
                // Do any other work!
                console.log(`Current account ${currentAccount}`)
                self.setState({
                    account:  currentAccount //'0xDe1DD55Fc070230D7eb2163Ac3d937cC90253B46'
                },()=>{
                    console.log("handleAccountsChanged load")
                    self.load();
                });
            }
        }
       
        this.setState({
            account: account
        }, () => {
            self.load();
        })
    }

    async load() {
        this.getBalance();
        this.getFlights();
        this.getCustomerFlights();
        this.getRefundableEther();
        console.log("LOAD..!!!")
    }

    async getBalance() {
        let weiBalance = await this.web3.eth.getBalance(this.state.account);
        //console.log(this.state.account,weiBalance)
        this.setState({
            balance: this.toEther(weiBalance)
        });
    }

    async getFlights(){
        let flights =  await this.airlineService.getFlights();
        this.setState({
            flights
        });
    }

    async buyFlight(flightIndex,flight){
        await this.airlineService.buyFlight(
            flightIndex,
            this.state.account,
            flight.price
        );
    }

    render() {
        return <React.Fragment >
            <div className = "jumbotron">
                <h4 className = "display-4"> Welcome to the Airline! </h4>
            </div>
            <div className = "row">
                <div className = "col-sm">
                    <Panel title = "Balance">
                        <p><strong>{this.state.account}</strong></p>
                        <span><strong>Balance:</strong> {this.state.balance} ETH</span>
                    </Panel>
                </div>
                <div className = "col-sm">
                    <Panel title = "Loyalty points - refundable ether">
                        <span>{this.state.refundableEther} eth</span>
                        <button className="btn btn-sm bg-success text-white" onClick={this.redeemLoyalityPoints.bind(this)}>Refund</button>
                    </Panel>
                </div>
            </div>
            <div className = "row">
                <div className = "col-sm">
                    <Panel title = "Available flights">
                        {
                            this.state.flights.map((flight,i)=>{
                                return <div key={i}>
                                        <span>{flight.name} - Cost: {this.toEther(flight.price)}</span>
                                        <button className="btn btn-info" onClick={()=> this.buyFlight(i,flight)}>Purchase</button>
                                    </div>
                            })
                        }
                    </Panel>
                </div >
                <div className = "col-sm" >
                    <Panel title = "Your flights">
                    {
                            this.state.customerFlights.map((flight,i)=>{
                                return <div key={i}>
                                        <span>{flight.name} - Cost: {this.toEther(flight.price)}</span>
                                    </div>
                            })
                        }
                    </Panel>
                </div>
            </div>
            <ToastContainer ref={(input) => this.container = input} className="toast-top-right" />
        </React.Fragment >
    }
}