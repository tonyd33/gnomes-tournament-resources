import * as crypto from 'crypto';
import { NotFoundException } from '@nestjs/common';

export function guardNotNullish<T>(
  message: string = 'Resource not found',
): (x: T | null | undefined) => T {
  return (x) => {
    if (x == null) {
      throw new NotFoundException(message);
    }
    return x;
  };
}

export function tap<ArgT>(fn: (arg: ArgT) => unknown): (arg: ArgT) => ArgT {
  return (arg) => {
    fn(arg);
    return arg;
  };
}

export function asyncTap<ArgT>(
  fn: (arg: ArgT) => Promise<unknown>,
): (arg: ArgT) => Promise<ArgT> {
  return async (arg) => {
    await fn(arg);
    return arg;
  };
}

export function randomBase64String(length: number) {
  return crypto.randomBytes(length).toString('base64url');
}

export function encodeBase64Url(input: string): string {
  return Buffer.from(input).toString('base64url');
}

export function decodeBase64Url(input: string): string {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding back
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString();
}
