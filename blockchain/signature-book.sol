pragma solidity ^0.4.11;

/// @title Signing documents and stuff
contract SignatureBook {

  // Utility stuff
  event log(string msg);
  event logBytes32(bytes32 msg);
  function toString(address x) returns (string) {
    bytes memory b = new bytes(20);
    for (uint i = 0; i < 20; i++)
        b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
    return string(b);
  }

  // A user id is meant to be the most reliable id we can produce for a real person on the ethereum network.
  // It relies on trusting an open id provider and trusting the bookkeeper to properly write the id and help
  // the user connecting his wallet address to it
  struct UserIdData {
      bytes16 idProvider;
      bytes16 userId;
      bytes32 firstName;
      bytes32 familyName;
      bytes32 birthPlace;
      bytes10 birthDate;
      bytes32 secretHash;
      address owner;
  }

  // A signature simply associates the id of a user document's hash
  struct Signature {
      bytes32 fullUserId;
      bytes32 docHash;
  }

  // Map full user ids to their detailled id data
  mapping(bytes32 => UserIdData) public userIds;

  // Dynamically sized array of signatures
  Signature[] public signatures;

  // The creator of the contract and sole manager of the users' signatures
  address public bookKeeper;

  // constructor
  function SignatureBook() {
    bookKeeper = msg.sender;
    log("Signature book created");
  }

  // Register a new user identification by the bookkeeper.
  // It contains a secret shared with the user, so that he can later associate it
  // to some ethereum wallet
  function registerUserId(bytes32 fullUserId, bytes16 idProvider, bytes16 userId, bytes32 firstName, bytes32 familyName, bytes32 birthPlace, bytes10 birthDate, bytes32 secret) {
    // Only the book keeper registers new user ids
    require(msg.sender == bookKeeper);

    userIds[fullUserId] = UserIdData({
      idProvider: idProvider,
      userId: userId,
      firstName: firstName,
      familyName: familyName,
      birthPlace: birthPlace,
      birthDate: birthDate,
      secretHash: keccak256(secret),
      owner: address(0)
    });
  }

  // Connect a previously registered user id to a wallet's address
  // This can be done by the user himself, after he received a secret from the bookkeeper
  function validateUserId(bytes32 fullUserId, bytes32 secret) {
    UserIdData userIdData = userIds[fullUserId];

    // the secret should match the one provided by the bookkeeper
    require(userIdData.secretHash == keccak256(secret));

    // TODO reimburse the bookkeeper ?

    userIdData.owner = msg.sender;
  }

  // Actually sign a document
  function sign(bytes32 fullUserId, bytes32 docHash) {
    UserIdData userIdData = userIds[fullUserId];
    require(msg.sender == bookKeeper || msg.sender == userIdData.owner);

    signatures.push(Signature({
      fullUserId: fullUserId,
      docHash: docHash
    }));
  }
}
