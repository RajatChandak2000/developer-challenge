// utils/castBuffer.ts
export function castToNodeBuffer(input: unknown): Buffer {
    return input as unknown as Buffer;
  }
  