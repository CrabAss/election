var Election = artifacts.require("./Election.sol");

contract("Election", function (accounts) {

    it("initialized with two candidates", async function () {
        var instance = await Election.deployed();
        var candidatesCount = await instance.candidatesCount();
        assert.equal(candidatesCount, 2);
    });

    it("candidates are initialized with correct values", async function () {
        var instance = await Election.deployed();
        var candidates = [];
        candidates[0] = await instance.candidates(0);
        candidates[1] = await instance.candidates(1);

        assert.equal(candidates[0].id, 0, "id correct");
        assert.equal(candidates[0].name, "Alice", "name correct");
        assert.equal(candidates[0].voteCount, 0, "voteCount correct");

        assert.equal(candidates[1].id, 1, "id correct");
        assert.equal(candidates[1].name, "Bob", "name correct");
        assert.equal(candidates[1].voteCount, 0, "voteCount correct");
    });

      it("a voter is allowed to cast a vote", async function () {
        var instance = await Election.deployed();
        var candidateId = 0;

        var txReceipt = await instance.vote(candidateId, {from: accounts[0]});
        assert.equal(txReceipt.logs.length, 1, "an event was triggered");
        assert.equal(txReceipt.logs[0].event, "votedEvent", "the event type is correct");
        assert.equal(txReceipt.logs[0].args._candidateId.toNumber(), candidateId, "the candidate id is correct");

        var ifVoted = await instance.voters(accounts[0]);
        assert(ifVoted, "the voter was marked as voted");

        var candidate = await instance.candidates(candidateId);
        var voteCount = candidate[2];
        assert.equal(voteCount, 1, "candidate's vote count is incremented");
      });

      it("exception is thrown for invalid candidateId", async function () {
        var instance = await Election.deployed();
        var candidateId = 99;
        try {
            await instance.vote(candidateId, {from: accounts[1]});
            assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain 'revert'");
        }

        candidateId = 0;

        var candidate = await instance.candidates(candidateId);
        var voteCount = candidate[2];
        assert.equal(voteCount, 1, "candidate 0 did not receive any vote in this test");

        candidateId = 1;

        candidate = await instance.candidates(candidateId);
        voteCount = candidate[2];
        assert.equal(voteCount, 0, "candidate 1 did not receive any vote in this test");
      });

      it("exception is thrown for double voting", async function () {
        var instance = await Election.deployed();
        var candidateId = 1;
        await instance.vote(candidateId, {from: accounts[1]});
        var candidate = await instance.candidates(candidateId);
        var voteCount = candidate[2];
        assert.equal(voteCount, 1, "first vote accepted");
        try {
            await instance.vote(candidateId, {from: accounts[1]});
            assert.fail();
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain 'revert'");
        }
        candidate = await instance.candidates(candidateId);
        voteCount = candidate[2];
        assert.equal(voteCount, 1, "candidate 1 did not receive a double vote");

        candidateId = 0;

        candidate = await instance.candidates(candidateId);
        voteCount = candidate[2];
        assert.equal(voteCount, 1, "candidate 0 did not receive any vote in this test");

      });

});
