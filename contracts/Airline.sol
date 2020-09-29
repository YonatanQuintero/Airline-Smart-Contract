pragma solidity ^0.4.24;

contract Airline{

    address public owner;

    struct Customer{
        uint loyalityPoints;
        uint totalFlights;
    }

    struct Flight{
        string name;
        uint price;
    }

    uint etherPerPoint = 0.5 ether;

    Flight[] public flights;

    mapping(address => Customer) public customers;
    mapping(address => Flight[]) public customerFlight;
    mapping(address => uint) public customerTotalFlights;

    event FlightPurchased(address indexed customer, uint price,string flight);

    constructor() public{
        owner = msg.sender;
        flights.push(Flight('Tokio',4 ether));
        flights.push(Flight('Germany',3 ether));
        flights.push(Flight('Madrid',3 ether));
    }

    function buyFlight(uint flightIndex) public payable{
        Flight memory flight = flights[flightIndex];
        require(msg.value == flight.price,"Value must be equal to fligth price");
        Customer storage customer = customers[msg.sender];
        customer.loyalityPoints += 5;
        customer.totalFlights += 1;
        customerFlight[msg.sender].push(flight);
        customerTotalFlights[msg.sender]++;
        emit FlightPurchased(msg.sender,flight.price,flight.name);
    }

    function totalFlights() public view returns (uint){
        return flights.length;
    }

    function redeemLoyalityPoints() public {
        Customer storage customer = customers[msg.sender];
        uint etherToRefund = etherPerPoint * customer.loyalityPoints;
        msg.sender.transfer(etherToRefund);
        customer.loyalityPoints = 0;
    }

    function getRefundableEther() public view returns (uint){
        return etherPerPoint * customers[msg.sender].loyalityPoints;
    }

    function getAirlineBalance() public view isOwner  returns (uint) {
        address airlineAddress = this;
        return airlineAddress.balance;
    }

    modifier isOwner(){
        require(msg.sender == owner,"Not is owner");
        _;
    }
}