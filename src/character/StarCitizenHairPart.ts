import { BufferReader } from "../buffer-reader";

export type StarCitizenHairPart = NonNullable<unknown>;

export function readHairPart(reader: BufferReader): StarCitizenHairPart {
  reader.expectUint32(0xe7809d46);
  reader.expectGuid("12ce4ce5-e49a-4dab-9d31-ad262faaddf2");
  reader.expectUint32(0x0);
  const childCount = reader.readUint32();

  switch (childCount) {
    case 0:
      break;
    case 6:
      reader.expectUint32(5);
      break;
    default:
      throw new Error("Unknown hair part count");
  }

  return {};
}
