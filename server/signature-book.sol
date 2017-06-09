pragma solidity ^0.4.11;

/// @title Signing documents and stuff
contract SignatureBook {

  event log(string msg);

  function toString(address x) returns (string) {
    bytes memory b = new bytes(20);
    for (uint i = 0; i < 20; i++)
        b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
    return string(b);
  }

  // A signature associates the real id of a user provided by a trusted id provider and a document's hash
  struct Signature {
      bytes32 idProvider;
      bytes32 userId;
      bytes32 docHash;
  }

  // Dynamically sized array of signatures
  Signature[] public signatures;

  // The creator of the contract and sole manager of the users' signatures
  address public bookKeeper;

  function SignatureBook() {
    bookKeeper = msg.sender;
    log("Signature book created");
  }

  // Actually sign a document
  function sign(bytes32 idProvider, bytes32 userId, bytes32 docHash) {
    // Only the book keeper writes signatures
    // log("sign !");
    require(msg.sender == bookKeeper);

    signatures.push(Signature({
      idProvider: idProvider,
      userId: userId,
      docHash: docHash
    }));
  }
}
