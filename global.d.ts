interface NaclInstance {
    to_hex: (Uint8Array) => string;
    from_hex: (string) => Uint8Array;
    encode_utf8: (string) => Uint8Array;
    encode_latin1: (string) => Uint8Array;
    decode_utf8: (Uint8Array) => string;
    crypto_box: (ciphertextBin: Uint8Array,
        nonceBin: Uint8Array,
        senderPublicKeyBin: Uint8Array,
        recipientSecretKeyBin: Uint8Array,
    ) => Uint8Array;
    crypto_box_open: (ciphertextBin: Uint8Array,
        nonceBin: Uint8Array,
        senderPublicKeyBin: Uint8Array,
        recipientSecretKeyBin: Uint8Array,
    ) => Uint8Array;
    crypto_box_random_nonce: () => Uint8Array;
    crypto_hash_sha256: (Uint8Array) => string;
    crypto_sign_seed_keypair: (Uint8Array) => NaclKeyPair;
    crypto_sign_detached: (msgBin: Uint8Array, signerSecretKey: Uint8Array) => NaclKeyPair;
    crypto_sign_BYTES: number;
    crypto_sign_verify_detached: (detachedSignatureBin: Uint8Array,
        msgBin: Uint8Array, signerPublicKey: Uint8Array) => boolean;
}

interface NaclKeyPair {
    signPk: Uint8Array;
    signSk: Uint8Array;
}

declare var naclInstance: NaclInstance;

declare module "*.json" {
    const value: any;
    export default value;
}