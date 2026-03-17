import sodium from 'sodium-native'

export class Encryption {
  /**
   * Standard Hashing for Hyperbee Keys
   * @param {any} instance - The data to hash
   * @returns {Buffer} The resulting hash as a Buffer
   */
  createKey(instance) {
    const buf = Buffer.from(JSON.stringify(instance))
    const out = Buffer.alloc(sodium.crypto_generichash_BYTES)
    // Using BLAKE2b (the Holepunch standard)
    sodium.crypto_generichash(out, buf)
    return out // Return as Buffer for Hyperbee
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
