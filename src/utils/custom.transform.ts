import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export function ObjectIdToString() {
  return Transform(({ value }) => {
    if (value instanceof Types.ObjectId) {
      return value.toHexString();
    }
    return value;
  });
}
