import sodium from 'sodium-native'

export class Encryption {
  /**
   * Standard Hashing for Hyperbee Keys
   * @param {any} instance - The data to hash
   * @returns {Buffer} The resulting hash as a Buffer
   */
   createKey(instance) {
    // 1. Ensure the object keys are always in the same order
    const sorted = this._sortObject(instance)
    const buf = Buffer.from(JSON.stringify(sorted))
    
    const out = Buffer.alloc(sodium.crypto_generichash_BYTES)
    sodium.crypto_generichash(out, buf)
    return out 
  }

  /**
   * sort JS object in standard way.
   * @param {*} obj 
   * @returns 
   */ 
  _sortObject(obj) {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return obj
    return Object.keys(obj).sort().reduce((acc, key) => {
      acc[key] = this._sortObject(obj[key]) // Recursive for nested BentoBoxDS
      return acc
    }, {})
  }

  /**
   * Create a prefixed key for Hyperbee
   * @param {string} prefix - The prefix (e.g., 'datatype')
   * @param {Buffer} hash - The 32-byte hash
   * @returns {Buffer} The prefixed key
   */
  createPrefixedKey(prefix, hash) {
    return Buffer.concat([Buffer.from(prefix + '!'), hash])
  }

  /**
   * Encryption for Raw Data (SecretBox)
   * @param {string|Buffer} data - The data to encrypt
   * @param {Buffer} masterKey - The master key for encryption (must be crypto_secretbox_KEYBYTES long)
   * @returns {{ ciphertext: Buffer, nonce: Buffer }} The encrypted data and nonce
   */
  encrypt(data, masterKey) {
    const nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES)
    sodium.randombytes_buf(nonce)
    
    const msg = Buffer.isBuffer(data) ? data : Buffer.from(data)
    const ciphertext = Buffer.alloc(msg.length + sodium.crypto_secretbox_MACBYTES)
    
    sodium.crypto_secretbox_easy(ciphertext, msg, nonce, masterKey)
    
    // Return both so you can store them in Hypercore
    return { ciphertext, nonce }
  }

  /**
   * Decryption for Raw Data (SecretBox)
   * @param {Buffer} ciphertext - The encrypted data
   * @param {Buffer} nonce - The nonce used during encryption
   * @param {Buffer} masterKey - The master key used during encryption
   * @returns {Buffer} The decrypted data
   */
  decrypt(ciphertext, nonce, masterKey) {
    const msg = Buffer.alloc(ciphertext.length - sodium.crypto_secretbox_MACBYTES)
    
    const success = sodium.crypto_secretbox_open_easy(msg, ciphertext, nonce, masterKey)
    
    if (!success) {
      throw new Error('Decryption failed')
    }
    
    return msg
  }
}
