// 完全独立的 AES-CBC 加密实现，不依赖外部库
// 使用与原 crypto-js 相同的算法，确保兼容性
// 支持异步加载，减少初始包体积

const AES_KEY_HEX = '4a2bdbd575d5397cae8e3f95e3121b248ff1b48e196b7026b9681ad497fecdc5'

// ==================== 工具函数 ====================

// 将 Hex 字符串转换为 WordArray
function hexToWords(hex: string): number[] {
  const words: number[] = []
  for (let i = 0; i < hex.length; i += 8) {
    words.push(parseInt(hex.substr(i, 8), 16))
  }
  return words
}

// 将 UTF8 字符串转换为 WordArray
function utf8ToWords(str: string): number[] {
  const words: number[] = []
  let n = 0
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    if (code < 128) {
      words[n >>> 2] |= code << (24 - (n % 4) * 8)
    } else if (code < 2048) {
      words[n >>> 2] |= (192 | (code >>> 6)) << (24 - (n % 4) * 8)
      n++
      words[n >>> 2] |= (128 | (code & 63)) << (24 - (n % 4) * 8)
    } else if (code < 55296 || code >= 57344) {
      words[n >>> 2] |= (224 | (code >>> 12)) << (24 - (n % 4) * 8)
      n++
      words[n >>> 2] |= (128 | ((code >>> 6) & 63)) << (24 - (n % 4) * 8)
      n++
      words[n >>> 2] |= (128 | (code & 63)) << (24 - (n % 4) * 8)
    } else {
      const nextCode = str.charCodeAt(i + 1)
      const combinedCode = ((code & 1023) << 10) | (nextCode & 1023) | 65536
      words[n >>> 2] |= (240 | (combinedCode >>> 18)) << (24 - (n % 4) * 8)
      n++
      words[n >>> 2] |= (128 | ((combinedCode >>> 12) & 63)) << (24 - (n % 4) * 8)
      n++
      words[n >>> 2] |= (128 | ((combinedCode >>> 6) & 63)) << (24 - (n % 4) * 8)
      n++
      words[n >>> 2] |= (128 | (combinedCode & 63)) << (24 - (n % 4) * 8)
      i++
    }
    n++
  }
  return words
}

// 将 WordArray 转换为 Base64 字符串
function wordsToBase64(words: number[], sigBytes: number): string {
  const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let base64 = ''
  for (let i = 0; i < sigBytes; i += 3) {
    const byte1 = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 255
    const byte2 = i + 1 < sigBytes ? (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 255 : NaN
    const byte3 = i + 2 < sigBytes ? (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 255 : NaN

    const triplet = (byte1 << 16) | (!isNaN(byte2) ? byte2 << 8 : 0) | (!isNaN(byte3) ? byte3 : 0)

    for (let j = 0; j < 4; j++) {
      if (i * 8 + j * 6 <= sigBytes * 8) {
        base64 += keyStr.charAt((triplet >>> (6 * (3 - j))) & 63)
      } else {
        base64 += '='
      }
    }
  }
  return base64
}

// 生成随机 IV (16字节)
function generateRandomIV(): { words: number[]; sigBytes: number } {
  const words: number[] = []
  for (let i = 0; i < 4; i++) {
    words.push((Math.random() * 0x100000000) | 0)
  }
  return { words, sigBytes: 16 }
}

// ==================== AES 核心算法 ====================

const SBOX = [
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9,
  0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f,
  0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15, 0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07,
  0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3,
  0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58,
  0xcf, 0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3,
  0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec, 0x5f,
  0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73, 0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88,
  0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac,
  0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a,
  0xae, 0x08, 0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a, 0x70,
  0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11,
  0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf, 0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42,
  0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
]

const RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36]

function subWord(word: number): number {
  return (
    (SBOX[(word >>> 24) & 0xff] << 24) |
    (SBOX[(word >>> 16) & 0xff] << 16) |
    (SBOX[(word >>> 8) & 0xff] << 8) |
    SBOX[word & 0xff]
  )
}

function rotWord(word: number): number {
  return (word << 8) | (word >>> 24)
}

function keyExpansion(keyWords: number[]): number[] {
  const keyLength = keyWords.length
  const rounds = keyLength + 6
  const expandedKey = [...keyWords]

  for (let i = keyLength; i < 4 * (rounds + 1); i++) {
    let temp = expandedKey[i - 1]
    if (i % keyLength === 0) {
      temp = subWord(rotWord(temp)) ^ (RCON[i / keyLength] << 24)
    } else if (keyLength > 6 && i % keyLength === 4) {
      temp = subWord(temp)
    }
    expandedKey[i] = expandedKey[i - keyLength] ^ temp
  }
  return expandedKey
}

function addRoundKey(state: number[], roundKey: number[], round: number): void {
  for (let i = 0; i < 16; i += 4) {
    const keyWord = roundKey[round * 4 + i / 4]
    state[i] ^= (keyWord >>> 24) & 0xff
    state[i + 1] ^= (keyWord >>> 16) & 0xff
    state[i + 2] ^= (keyWord >>> 8) & 0xff
    state[i + 3] ^= keyWord & 0xff
  }
}

function subBytes(state: number[]): void {
  for (let i = 0; i < 16; i++) {
    state[i] = SBOX[state[i]]
  }
}

function shiftRows(state: number[]): void {
  const temp = state[1]
  state[1] = state[5]
  state[5] = state[9]
  state[9] = state[13]
  state[13] = temp

  let temp1 = state[2]
  let temp2 = state[6]
  state[2] = state[10]
  state[6] = state[14]
  state[10] = temp1
  state[14] = temp2

  temp1 = state[3]
  state[3] = state[15]
  state[15] = state[11]
  state[11] = state[7]
  state[7] = temp1
}

function mul2(num: number): number {
  return ((num << 1) ^ (num & 0x80 ? 0x1b : 0)) & 0xff
}

function mul3(num: number): number {
  return (mul2(num) ^ num) & 0xff
}

function mixColumns(state: number[]): void {
  for (let i = 0; i < 16; i += 4) {
    const s0 = state[i]
    const s1 = state[i + 1]
    const s2 = state[i + 2]
    const s3 = state[i + 3]

    state[i] = mul2(s0) ^ mul3(s1) ^ s2 ^ s3
    state[i + 1] = s0 ^ mul2(s1) ^ mul3(s2) ^ s3
    state[i + 2] = s0 ^ s1 ^ mul2(s2) ^ mul3(s3)
    state[i + 3] = mul3(s0) ^ s1 ^ s2 ^ mul2(s3)
  }
}

function aesEncryptBlock(block: number[], expandedKey: number[], rounds: number): number[] {
  const state = [...block]

  addRoundKey(state, expandedKey, 0)

  for (let round = 1; round < rounds; round++) {
    subBytes(state)
    shiftRows(state)
    mixColumns(state)
    addRoundKey(state, expandedKey, round)
  }

  subBytes(state)
  shiftRows(state)
  addRoundKey(state, expandedKey, rounds)

  return state
}

function pkcs7Pad(words: number[], sigBytes: number): { words: number[]; sigBytes: number } {
  const pad = 16 - (sigBytes % 16)
  const newWords = [...words]
  let pos = sigBytes

  for (let i = 0; i < pad; i++) {
    newWords[pos >>> 2] |= pad << (24 - (pos % 4) * 8)
    pos++
  }

  return { words: newWords, sigBytes: sigBytes + pad }
}

function wordsToBytes(words: number[], sigBytes: number): number[] {
  const bytes: number[] = []
  for (let i = 0; i < sigBytes; i++) {
    bytes.push((words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff)
  }
  return bytes
}

function bytesToWords(bytes: number[]): number[] {
  const words: number[] = []
  for (let i = 0; i < bytes.length; i += 4) {
    let word = 0
    for (let j = 0; j < 4 && i + j < bytes.length; j++) {
      word |= bytes[i + j] << (24 - j * 8)
    }
    words.push(word)
  }
  return words
}

// 内部同步加密函数
export function encryptPhoneSync(plainPhone: string): string {
  if (!plainPhone) {
    return ''
  }

  try {
    // 准备密钥
    const keyWords = hexToWords(AES_KEY_HEX)
    const expandedKey = keyExpansion(keyWords)
    const rounds = keyWords.length + 6

    // 准备明文并进行 PKCS7 填充
    const plainWords = utf8ToWords(plainPhone)
    const padded = pkcs7Pad(plainWords, plainPhone.length)
    const plainBytes = wordsToBytes(padded.words, padded.sigBytes)

    // 生成随机 IV
    const iv = generateRandomIV()
    const ivBytes = wordsToBytes(iv.words, iv.sigBytes)

    // CBC 模式加密
    let prevBlock = [...ivBytes]
    const cipherBytes: number[] = []

    for (let i = 0; i < plainBytes.length; i += 16) {
      const block = plainBytes.slice(i, i + 16)

      // XOR 前一个密文块 (或 IV)
      const xorBlock = block.map((byte, index) => byte ^ prevBlock[index])

      // 加密
      const cipherBlock = aesEncryptBlock(xorBlock, expandedKey, rounds)

      // 添加到密文
      cipherBytes.push(...cipherBlock)

      // 更新前一个块
      prevBlock = cipherBlock
    }

    // 组合 IV 和密文
    const combinedBytes = [...ivBytes, ...cipherBytes]
    const combinedWords = bytesToWords(combinedBytes)

    // 转换为 Base64
    return wordsToBase64(combinedWords, combinedBytes.length)
  } catch (err) {
    console.error('encryptPhone error', err)
    return ''
  }
}
