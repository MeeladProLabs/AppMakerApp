/**
 * App Maker - Security & Auth Module
 * Handles browser-side AES-GCM encryption and secure user key management.
 */

const AppAuth = {
  ALGORITHM: 'AES-GCM',
  KEY_LENGTH: 256,

  async generateUserKey() {
    const key = await window.crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      true,
      ['encrypt', 'decrypt']
    );

    const exportedKey = await window.crypto.subtle.exportKey('raw', key);
    const keyArray = Array.from(new Uint8Array(exportedKey));
    const keyString = keyArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return { key, keyString };
  },

  async importUserKey(keyString) {
    const match = keyString.match(/.{1,2}/g);
    if (!match) {
      throw new Error('Invalid key string format.');
    }

    const keyBytes = new Uint8Array(match.map(byte => parseInt(byte, 16)));

    return await window.crypto.subtle.importKey(
      'raw',
      keyBytes.buffer,
      { name: this.ALGORITHM },
      true,
      ['encrypt', 'decrypt']
    );
  },

  async encryptData(data, key) {
    const encoder = new TextEncoder();
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    const encodedData = encoder.encode(stringData);

    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv
      },
      key,
      encodedData
    );

    const ciphertextArray = Array.from(new Uint8Array(encryptedBuffer));
    const ciphertext = ciphertextArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const ivArray = Array.from(iv);
    const ivString = ivArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return {
      ciphertext: ciphertext,
      iv: ivString
    };
  },

  async decryptData(ciphertext, ivString, key) {
    const cipherMatch = ciphertext.match(/.{1,2}/g);
    const ivMatch = ivString.match(/.{1,2}/g);

    if (!cipherMatch || !ivMatch) {
      throw new Error('Invalid ciphertext or IV format.');
    }

    const encryptedBytes = new Uint8Array(cipherMatch.map(b => parseInt(b, 16)));
    const ivBytes = new Uint8Array(ivMatch.map(b => parseInt(b, 16)));

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: ivBytes
      },
      key,
      encryptedBytes.buffer
    );

    const decoder = new TextDecoder();
    const decodedText = decoder.decode(decryptedBuffer);

    try {
      return JSON.parse(decodedText);
    } catch (e) {
      return decodedText;
    }
  },

  async createNewUserIdentity(assignedUid) {
    const { key, keyString } = await this.generateUserKey();

    return {
      uid: assignedUid,
      secretKey: keyString,
      cryptoKey: key
    };
  }
};
