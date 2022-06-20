const EDDSA = require("elliptic").eddsa;
const eddsa = new EDDSA("ed25519");
const { v4 } = require('uuid');
const SHA256 = require('crypto-js/sha256.js')


class ChainUtil {  
    static genKeyPair(secret) {   
         return eddsa.keyFromSecret(secret); 
         }
         static hash(data){ 
               return SHA256(JSON.stringify(data)).toString();
            }

            static verifySignature(publicKey,signature,dataHash){
                return ec.keyFromPublic(publicKey).verify(dataHash,signature);
            }

    static id(){
        return v4();
}
        }
        
         module.exports = ChainUtil;