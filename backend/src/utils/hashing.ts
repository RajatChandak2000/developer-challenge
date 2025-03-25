export const hammingDistance = (hash1: string, hash2: string): number => {
    const b1 = BigInt("0x" + hash1);
    const b2 = BigInt("0x" + hash2);
    const xor = b1 ^ b2;
  
    // Count the number of 1s in the XOR (i.e., different bits)
    return xor.toString(2).split("1").length - 1;
  };