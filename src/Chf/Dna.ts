import { BufferReader } from '../Utils/BufferReader'
import { BufferWriter } from '../Utils/BufferWriter'
import { fromHexStr, toHexStr } from '../Utils/hexString'
import type { BodyType } from './BodyType'

const dnaSize = 0xD8
const partCount = 12 * 4
const idxPartRecord: Record<number, DnaFacePart> = {
  0: 'eyebrowLeft',
  1: 'eyebrowRight',
  2: 'eyeLeft',
  3: 'eyeRight',
  4: 'nose',
  5: 'earLeft',
  6: 'earRight',
  7: 'cheekLeft',
  8: 'cheekRight',
  9: 'mouth',
  10: 'jaw',
  11: 'crown',
}

export type DnaFacePart =
  'eyebrowLeft' |
  'eyebrowRight' |
  'eyeLeft' |
  'eyeRight' |
  'nose' |
  'earLeft' |
  'earRight' |
  'cheekLeft' |
  'cheekRight' |
  'mouth' |
  'jaw' |
  'crown'

export interface DnaBlend {
  headId: number
  value: number
}

export interface DnaBlends {
  eyebrowLeft: DnaBlend[]
  eyebrowRight: DnaBlend[]
  eyeLeft: DnaBlend[]
  eyeRight: DnaBlend[]
  nose: DnaBlend[]
  earLeft: DnaBlend[]
  earRight: DnaBlend[]
  cheekLeft: DnaBlend[]
  cheekRight: DnaBlend[]
  mouth: DnaBlend[]
  jaw: DnaBlend[]
  crown: DnaBlend[]
}

export interface Dna {
  childCount: number
  blends: DnaBlends
}

export function readDna(parentReader: BufferReader): Dna {
  parentReader.expectUint64(dnaSize)

  const bytes = parentReader.readBytes(dnaSize)
  const dnaString = toHexStr(bytes)

  return dnaFromString(dnaString)
}

export function writeDna(writer: BufferWriter, dna: Dna, bodyType: BodyType) {
  const isMale = bodyType === 'male'
  writer.writeUint64(dnaSize)

  writer.writeUint32(0xFCD09394)
  writer.writeUint32(isMale ? 0xDD6C67F6 : 0x9EF4EB54)
  writer.writeUint32(isMale ? 0x65E740D3 : 0x65D75204)
  writer.writeUint32(0)
  writer.writeByte(0x0C)
  writer.writeByte(0x0)
  writer.writeByte(0x04)
  writer.writeByte(0x0)
  writer.writeByte(0x4)
  writer.writeByte(0x0)
  writer.writeByte(dna.childCount)
  writer.writeByte(0x0)

  for (let i = 0; i < partCount; i++) {
    const blends = dna.blends[idxPartRecord[i % 12]]
    const blend = blends[Math.floor(i / 12)]

    writer.writeUint16(Math.floor(blend.value))
    writer.writeByte(blend.headId)
    writer.writeByte(0)
  }
}

export function dnaFromString(dnaString: string): Dna {
  const reader = new BufferReader(fromHexStr(dnaString).buffer)
  reader.expectUint32(0xFCD09394)
  reader.readUint32()// skip keys. bad idea?
  reader.readUint32()
  reader.expectUint32(0)
  reader.expectByte(0x0C)
  reader.expectByte(0x0)
  reader.expectByte(0x04)
  reader.expectByte(0x0)
  reader.expectByte(0x4)
  reader.expectByte(0x0)
  const childCount = reader.readByte()
  reader.readByte()// might be 0 or ff for some reason?

  const blends: DnaBlends = {
    eyebrowLeft: [],
    eyebrowRight: [],
    eyeLeft: [],
    eyeRight: [],
    nose: [],
    earLeft: [],
    earRight: [],
    cheekLeft: [],
    cheekRight: [],
    mouth: [],
    jaw: [],
    crown: [],
  }

  for (let i = 0; i < partCount; i++) {
    const part = i % 12
    const value = reader.readUint16()
    const headId = reader.readByte()
    reader.expectByte(0)

    // hacky but at least it won't break my shitty ui /shrug
    blends[idxPartRecord[part]].push({ headId, value: Math.max(value, 1) })
  }

  return {
    childCount,
    blends,
  }
}

export function dnaToString(dna: Dna, bodyType: BodyType): string {
  const buffer = new ArrayBuffer(dnaSize + 8)
  const writer = new BufferWriter(buffer)

  writeDna(writer, dna, bodyType)

  // slice skips dnaSize
  return toHexStr(new Uint8Array(buffer).slice(8))
}
