import type { BufferReader } from '../Utils/BufferReader'
import type { BufferWriter } from '../Utils/BufferWriter'

export type Eyes = NonNullable<unknown>

export function readEyes(reader: BufferReader): Eyes {
  reader.expectUint32(0xC5BB5550)
  reader.expectGuid('6b4ca363-e160-4871-b709-e47467b40310')
  reader.expectUint64(0)

  return {}
}

export function writeEyes(writer: BufferWriter) {
  writer.writeUint32(0xC5BB5550)
  writer.writeGuid('6b4ca363-e160-4871-b709-e47467b40310')
  writer.writeUint64(0)
}
