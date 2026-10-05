
import sodium from 'sodium-native'

export class Encryption {
  /**
   * Standard Hashing for Hyperbee Keys
   * @param {any} instance - The data to hash
   * @returns {Buffer} The resulting 32-byte hash as a Buffer
   */
  createKey(instance) {
    const sorted = this._sortObject(instance)
    const buf = Buffer.from(JSON.stringify(sorted))
    
    const out = Buffer.alloc(sodium.crypto_generichash_BYTES)
    sodium.crypto_generichash(out, buf)
    return out 
  }

  /**
   * create storage key for chat dialogue
   * @param {any} instance - The data to hash
   * @returns {Buffer} The resulting 32-byte hash as a Buffer
   */
  createDialogueKey(lsId, cueHash, heliStamp, contentHash) {
    // 2. The Composite Formation (The 'When' & 'Where')
    // Using '!' as the hop-native delimiter for lifestrap extraction
    return `${lsId}!${cueHash}!${heliStamp}!${contentHash}`;
  }

  /**
   * Sort JS object in a standard way to ensure deterministic hashing.
   */ 
  _sortObject(obj) {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return obj
    const sortedAcc = {}
    Object.keys(obj).sort().forEach(key => {
      sortedAcc[key] = this._sortObject(obj[key])
    })
    return sortedAcc
  }

  /**
   * Create a Content Key (The Sovereign Brick)
   * Format: [category]![hash]
   */
  createContentKey(category, hash) {
    const prefix = Buffer.from(category + '!')
    const hashBuf = Buffer.isBuffer(hash) ? hash : Buffer.from(hash, 'hex')
    return Buffer.concat([prefix, hashBuf])
  }

  /**
   * Helper to ensure we have the raw 32-byte ID, stripping any prefix.
  */
  getRawID(input) {
    // Prevent the 'undefined' crash
    if (!input) return Buffer.alloc(32); 
    
    if (!Buffer.isBuffer(input)) input = Buffer.from(input);
    
    // If it's a prefixed key (e.g., lifestrap!HASH), slice the last 32 bytes
    return input.length > 32 ? input.slice(-32) : input;
  }

  /**
   * Create a Stitching Key (The Relational Synapse)
   * Connects content to a Life-Strap.
   * Format: [lsID]!link![itemHash]
   */
  createStitchKey(rawLsID, itemHash) {
    const delimiter = Buffer.from('!link!');
    return Buffer.concat([rawLsID, delimiter, itemHash]);
  }

  /**
   * Create Range Boundaries for Hyperbee Streams
   * Allows querying a full Life-Strap or a specific binary category within it.
  */
  getRange(rootNamespace, subTarget) {
    // 1. Root namespace gets the '!' delimiter
    let gt = Buffer.isBuffer(rootNamespace)
      ? Buffer.concat([rootNamespace, Buffer.from('!')])
      : Buffer.from(`${rootNamespace}!`)
    
    // 2. Append subTarget cleanly. NO trailing '!' after the hash.
    if (subTarget) {
      const subBuf = Buffer.isBuffer(subTarget) 
        ? subTarget 
        : Buffer.from(subTarget)
        
      gt = Buffer.concat([gt, subBuf])
    }
    
    // 3. Append explicit boundary cap
    const lt = Buffer.concat([gt, Buffer.from([0xff])])
    
    return { gt, lt }
  }

  /**
   * Prefix Range Query for Hyperbee (e.g. for root contracts)
   */
  getPrefixRange(prefix) {
    const gt = Buffer.from(prefix + '!');
    const lt = Buffer.concat([gt, Buffer.from([0xff])]);
    return { gt, lt };
  }

  /**
   * Combine two hashes into a single deterministic 32-byte hash (Compound Cue)
   * @param {Buffer|string} hashA - First hash
   * @param {Buffer|string} hashB - Second hash
   * @returns {Buffer} The resulting 32-byte hash
   */
  combineHashes(hashA, hashB) {
    const bufA = Buffer.isBuffer(hashA) ? hashA : Buffer.from(hashA, 'hex');
    const bufB = Buffer.isBuffer(hashB) ? hashB : Buffer.from(hashB, 'hex');
    
    // Sort buffers to ensure (A + B) generates the exact same hash as (B + A)
    const sorted = Buffer.compare(bufA, bufB) < 0 
      ? Buffer.concat([bufA, bufB]) 
      : Buffer.concat([bufB, bufA]);
      
    const out = Buffer.alloc(sodium.crypto_generichash_BYTES);
    sodium.crypto_generichash(out, sorted);
    return out;
  }

  /**
   * Legacy wrapper to maintain compatibility with older modules
   */
  createPrefixedKey(prefix, hash) {
    const hashBuf = Buffer.isBuffer(hash) ? hash : Buffer.from(hash, 'hex')
    return Buffer.concat([Buffer.from(prefix + '!'), hashBuf])
  }

  // ... encrypt and decrypt methods remain as provided ...
  encrypt(data, masterKey) {
    const nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES)
    sodium.randombytes_buf(nonce)
    const msg = Buffer.isBuffer(data) ? data : Buffer.from(data)
    const ciphertext = Buffer.alloc(msg.length + sodium.crypto_secretbox_MACBYTES)
    sodium.crypto_secretbox_easy(ciphertext, msg, nonce, masterKey)
    return { ciphertext, nonce }
  }

  decrypt(ciphertext, nonce, masterKey) {
    const msg = Buffer.alloc(ciphertext.length - sodium.crypto_secretbox_MACBYTES)
    const success = sodium.crypto_secretbox_open_easy(msg, ciphertext, nonce, masterKey)
    if (!success) throw new Error('Decryption failed')
    return msg
  }
}