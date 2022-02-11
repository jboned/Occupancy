from nucypher.blockchain.eth.interfaces import BlockchainInterfaceFactory
from nucypher.characters.lawful import Bob, Ursula, Enrico
from nucypher.config.keyring import NucypherKeyring
from nucypher.crypto.kits import UmbralMessageKit
from umbral.keys import UmbralPublicKey

from flask_restful import Resource, Api
from flask import Flask, request
from flask_cors import CORS

from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA256

import json
import os


app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
api = Api(app)
provider_uri = '/home/occupancy-api/.ethereum/goerli/geth.ipc'
BlockchainInterfaceFactory.get_or_create_interface(provider_uri)

class Retrieve(Resource):
    SEED_URI         = "lynx.nucypher.network:9151"
    URSULA           = Ursula.from_seed_and_stake_info(seed_uri=SEED_URI)
    def get(self):
        return 'Please, do POST request.'   
    def post(self):
        keys = request.json['keys']
        path = self.writeKeys(keys)

        password = request.json['password']
        address = request.json['address']
        passwd = PBKDF2(password, address.encode(), 20,count=30000,hmac_hash_module=SHA256).hex()
        keyring=NucypherKeyring(account=address,keyring_root="./keys")
        keyring.unlock(password=passwd)   
        
        bob = Bob(known_nodes=[self.URSULA], checksum_address=address,domain='lynx',keyring=keyring,provider_uri=provider_uri)  
        
        enrico_key = request.json['enrico_key']
        policy_key  = request.json['policy_key']
        data_source = Enrico.from_public_keys(
            verifying_key=bytes.fromhex(enrico_key),
            policy_encrypting_key=UmbralPublicKey.from_bytes(bytes.fromhex(policy_key))
        )      

        ciphertext = request.json['ciphertext']  
        message_kit = UmbralMessageKit.from_bytes(bytes.fromhex(ciphertext))

        label = request.json['label']
        alice_pubkey = request.json['alice_pubkey']
        alice_pubkey_umbral = UmbralPublicKey.from_bytes(bytes.fromhex(alice_pubkey))
        
        print("Retrieving...")     
        retrieved_plaintexts = bob.retrieve(
            message_kit,
            label=label.encode(),
            enrico=data_source,
            alice_verifying_key=alice_pubkey_umbral
        )
        print("Retrieved.") 
        result = retrieved_plaintexts[0].decode("utf-8")
        self.readAndDeleteKeys(address,keyring) #delete keys
        return result      
        


    def writeKeys(self,keys):
        path_keys = os.getcwd()+"/keys/"
        path_priv = path_keys + "private/"
        path_pub  = path_keys + "public/"
        for key in keys:
            if "priv" in key:
                with open(path_priv+key, 'w') as keyfile:
                    keyfile.write(json.dumps(keys[key]))
            if "pub" in key:
                pubkey = bytes.fromhex(keys[key])
                with open(path_pub+key, 'wb') as keyfile:
                    keyfile.write(pubkey)
        return path_keys

    def readAndDeleteKeys(self,address,keyring):
        path = os.getcwd()+"/keys/"
        status = {"type":"private/","ext":"priv"}
        res = {"keys":{}}
        type = status["type"]
        ext  = status["ext"]
        types_keys = ["root-","delegating-","signing-"] 
        for type_key in types_keys:   
            filename = type_key + address + "." + ext  
            new_path = type+filename
            abs_path = path+new_path
            with open(abs_path, 'r') as keyfile:
                key_metadata = json.loads(keyfile.read())
                res["keys"][filename]= key_metadata
                os.remove(abs_path)
        res["keys"]["root-"+address+".pub"] = keyring.encrypting_public_key.to_bytes().hex()
        res["keys"]["signing-"+address+".pub"] = keyring.signing_public_key.to_bytes().hex()
        os.remove(path+"public/"+"root-"+address+".pub")
        os.remove(path+"public/"+"signing-"+address+".pub")
        return json.dumps(res)

class JoinPolicy(Resource):
    SEED_URI         = "lynx.nucypher.network:9151"
    URSULA           = Ursula.from_seed_and_stake_info(seed_uri=SEED_URI)
    def get(self):
        return 'Please, do POST request.'   
    def post(self):
        keys = request.json['keys']
        password = request.json['password']
        address  = request.json['address']
        alice_pubkey = request.json['alice_pubkey']
        label = request.json['label']
        path = self.writeKeys(keys)
        passwd = PBKDF2(password, address.encode(), 20,count=30000,hmac_hash_module=SHA256).hex()
        keyring=NucypherKeyring(account=address,keyring_root="./keys")
        keyring.unlock(password=passwd)
        bob = Bob(known_nodes=[self.URSULA], checksum_address=address,domain='lynx',keyring=keyring,provider_uri=provider_uri)  
        alice_pubkey_umbral = UmbralPublicKey.from_bytes(bytes.fromhex(alice_pubkey))
        bob.join_policy(label.encode(), alice_verifying_key=alice_pubkey_umbral,block=True)
        self.readAndDeleteKeys(address,keyring) # delete keys

    def writeKeys(self,keys):
        path_keys = os.getcwd()+"/keys/"
        path_priv = path_keys + "private/"
        path_pub  = path_keys + "public/"
        for key in keys:
            if "priv" in key:
                with open(path_priv+key, 'w') as keyfile:
                    keyfile.write(json.dumps(keys[key]))
            if "pub" in key:
                pubkey = bytes.fromhex(keys[key])
                with open(path_pub+key, 'wb') as keyfile:
                    keyfile.write(pubkey)
        return path_keys

    def readAndDeleteKeys(self,address,keyring):
        path = os.getcwd()+"/keys/"
        status = {"type":"private/","ext":"priv"}
        res = {"keys":{}}
        type = status["type"]
        ext  = status["ext"]
        types_keys = ["root-","delegating-","signing-"] 
        for type_key in types_keys:   
            filename = type_key + address + "." + ext  
            new_path = type+filename
            abs_path = path+new_path
            with open(abs_path, 'r') as keyfile:
                key_metadata = json.loads(keyfile.read())
                res["keys"][filename]= key_metadata
                os.remove(abs_path)
        res["keys"]["root-"+address+".pub"] = keyring.encrypting_public_key.to_bytes().hex()
        res["keys"]["signing-"+address+".pub"] = keyring.signing_public_key.to_bytes().hex()
        os.remove(path+"public/"+"root-"+address+".pub")
        os.remove(path+"public/"+"signing-"+address+".pub")
        return json.dumps(res)
        
class CreateKeys(Resource):
    def get(self):
        return 'Please, do POST request.'
    def post(self):
        password = request.json['password']
        address  = request.json['address']  
        passwd = PBKDF2(password, address.encode(), 20,count=30000,hmac_hash_module=SHA256).hex()
        keyring=NucypherKeyring.generate(checksum_address=address, password=passwd,keyring_root="./keys")
        keyring.unlock(password=passwd)
        keyring.lock()
        json = self.readAndDeleteKeys(address,keyring)
        return json
        

    def readAndDeleteKeys(self,address,keyring):
        path = os.getcwd()+"/keys/"
        status = {"type":"private/","ext":"priv"}
        res = {"keys":{}}
        type = status["type"]
        ext  = status["ext"]
        types_keys = ["root-","delegating-","signing-"] 
        for type_key in types_keys:   
            filename = type_key + address + "." + ext  
            new_path = type+filename
            abs_path = path+new_path
            with open(abs_path, 'r') as keyfile:
                key_metadata = json.loads(keyfile.read())
                res["keys"][filename]= key_metadata
                os.remove(abs_path)
        res["keys"]["root-"+address+".pub"] = keyring.encrypting_public_key.to_bytes().hex()
        res["keys"]["signing-"+address+".pub"] = keyring.signing_public_key.to_bytes().hex()
        os.remove(path+"public/"+"root-"+address+".pub")
        os.remove(path+"public/"+"signing-"+address+".pub")
        return json.dumps(res)
    
class EncryptMessage(Resource):
    def get(self):
        return 'Please, do POST request.'
    def post(self):
        policy_key = request.json['policy_pubkey']
        data = request.json['data']
        enrico = Enrico(policy_encrypting_key=UmbralPublicKey.from_bytes(bytes.fromhex(policy_key)))
        message_kit, _signature = enrico.encrypt_message(data.encode())
        result = {}
        result["ciphertext"] = message_kit.to_bytes().hex()
        result["enrico"] = bytes(enrico.stamp).hex()
        return json.dumps(result)

api.add_resource(CreateKeys, '/bob/create-keys')
api.add_resource(JoinPolicy, '/bob/join-policy')  
api.add_resource(Retrieve, '/bob/retrieve')  
api.add_resource(EncryptMessage, '/enrico/encrypt')  

if __name__ == '__main__':
     app.run(host="0.0.0.0",port='5000')
