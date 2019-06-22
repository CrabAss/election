pragma solidity ^0.5.0;

contract Election {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(address => bool) public voters;
    mapping(uint => Candidate) public candidates;    // state variable
    uint public candidatesCount;

    event votedEvent(uint indexed _candidateId);

    constructor() public {
        addCandidate("Alice");
        addCandidate("Bob");
    }

    function addCandidate(string memory _name) private {
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        candidatesCount++;
    }

    function vote(uint _candidateId) public {
        // require ... == if not ... then throw exception
        require(!voters[msg.sender], "This address has already voted.");
        require(_candidateId >= 0 && _candidateId < candidatesCount, "CandidateId is invalid.");

        candidates[_candidateId].voteCount++;
        voters[msg.sender] = true;

        emit votedEvent(_candidateId);
    }
}