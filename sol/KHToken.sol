pragma solidity ^0.4.23; 

contract ERC20Base {  
    string public name;                  
    uint8 public decimals;                
    string public symbol;                 
    uint256 public totalSupply; 
 
    function balanceOf(address _owner) public view returns (uint256 balance); 
    function transfer(address _to, uint256 _value) public returns (bool success); 
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success); 
    function approve(address _spender, uint256 _value) public returns (bool success); 
    function allowance(address _owner, address _spender) public view returns (uint256 remaining); 
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

library SafeAddSub { 
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(a >= b); 
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a); //exceeded
        return c;
    }
}  

contract KHToken is ERC20Base {
    using SafeAddSub for uint256; 

    mapping (address => uint256) public balances;
    mapping (address => mapping (address => uint256)) public allowed; 

    constructor(
            uint256 _init_amount,
            string _token_name,
            uint8 _decimal,
            string _symbol
    ) public {
        balances[msg.sender] = _init_amount;               
        totalSupply = _init_amount;                        
        name = _token_name;                                
        decimals = _decimal;                            
        symbol = _symbol;                               
    }


    function transfer(address _to, uint256 _value) public returns (bool success) {  
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value); 
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) { 
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
        balances[_from] = balances[_from].sub(_value); 
        balances[_to] = balances[_to].add(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value); 
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }
}
//"21000000000000000000000000","KHTOKEN1","18","KHT1"