import { Expose } from 'class-transformer';
import { Model, FilterQuery, Types } from 'mongoose';
export class PaginatedResult<T> {
  constructor(partial: Partial<PaginatedResult<T>>) {
    Object.assign(this, partial);
  }

  @Expose()
  data: T[];

  @Expose()
  total: number;

  @Expose()
  limit: number;

  @Expose()
  page: number;
}

export class Paginator<T> {
  constructor(private readonly model: Model<T>) {}

  async paginate(
    filter: FilterQuery<T>,
    options: {
      limit?: number;
      page?: number;
      sort?: string;
      publish?: boolean;
      select?: string[];
      populate?: any;
    },
  ): Promise<PaginatedResult<T>> {
    // Function to filter keys with ObjectId values
    function filterObjectIdField(obj: FilterQuery<T>) {
      // Use Object.entries to get key-value pairs and filter them
      return Object.fromEntries(
        Object.entries(obj).filter(
          ([key, value]) => value instanceof Types.ObjectId,
        ),
      );
    }

    function filterNotObjectIdField(obj: FilterQuery<T>) {
      // Use Object.entries to get key-value pairs and filter them
      return Object.fromEntries(
        Object.entries(obj).filter(
          ([key, value]) => !(value instanceof Types.ObjectId),
        ),
      );
    }

    // Use the function to filter the object
    const filteredObjectIds = filterObjectIdField(filter);
    const filterFields = filterNotObjectIdField(filter);
    let queryStr = JSON.stringify(filterFields);

    // convert params to operator $
    queryStr = queryStr.replace(
      /\b(gte|gt|lt|lte|regex)\b/g,
      (match) => '$' + match,
    );

    queryStr = queryStr.replace(
      /"search":"([^"]+)"/,
      '"$text": { "$search": "$1" }',
    );

    const queryFilter = JSON.parse(queryStr);
    Object.entries(filteredObjectIds).forEach(([key, value]) => {
      queryFilter[key] = value;
    });
    // lte, gte = less/greater than or equal
    // lt, gt = less/greater than
    // regex = compare ~ string
    // console.log({ queryFilter });

    const { limit, page, sort, select, populate } = options;

    const skip = (page - 1) * limit;

    if (queryFilter.isPublished) {
      queryFilter.isPublished = true;
    }

    // Get total count of documents that match the filter
    const total = await this.model.countDocuments(queryFilter).exec();

    const sortQuery = {};

    if (sort) {
      if (sort[0] === '-') {
        const sortString = sort.substring(1);
        sortQuery[`${sortString}`] = -1;
      } else {
        sortQuery[`${sort}`] = 1;
      }
    }

    // sort by score full-text-search
    if (filter.search) {
      sortQuery['score'] = { $meta: 'textScore' };
    }

    // Get the data with pagination, sorting, and field selection
    const data = await this.model
      .find(queryFilter)
      .limit(limit)
      .skip(skip)
      .sort({ ...sortQuery })
      .select(select)
      .populate(populate)
      .exec();

    return new PaginatedResult<T>({
      data: data.map((item) => item.toObject()),
      total,
      limit,
      page,
    });
  }
}
