
```python
import ipfshttpclient
import io
import os

class IPFSClient:
    def __init__(self):
        self.client = ipfshttpclient.connect('/dns/ipfs.infura.io/tcp/5001/https')
    
    async def store_document(self, document):
        """Store document in IPFS and return the hash"""
        try:
            if isinstance(document, bytes):
                document_data = io.BytesIO(document)
            else:
                document_data = document
                
            result = self.client.add(document_data)
            return result['Hash']
        except Exception as e:
            print(f"Error storing document in IPFS: {str(e)}")
            raise
    
    async def retrieve_document(self, document_hash):
        """Retrieve document from IPFS using its hash"""
        try:
            return self.client.cat(document_hash)
        except Exception as e:
            print(f"Error retrieving document from IPFS: {str(e)}")
            raise
```
