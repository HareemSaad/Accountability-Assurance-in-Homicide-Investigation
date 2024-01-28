import { ethers } from 'ethers';

export function decodeBytesString(bytesString) {
    const decodedString = ethers.utils.toUtf8String(ethers.utils.arrayify(bytesString));
    return decodedString;
}