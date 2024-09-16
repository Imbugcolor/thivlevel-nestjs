import { Model, FilterQuery } from 'mongoose';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  page: number;
}

export class Paginator<T> {
  constructor(private readonly model: Model<T>) {}

  async paginate(
    filter: FilterQuery<T>,
    options: {
      limit?: number;
      page?: number;
      sort?: any;
      publish?: boolean;
      select?: any;
      populate?: any;
    },
  ): Promise<PaginatedResult<T>> {
    let queryStr = JSON.stringify(filter);
    queryStr = queryStr.replace(
      /\b(gte|gt|lt|lte|regex)\b/g,
      (match) => '$' + match,
    );

    const queryFilter = JSON.parse(queryStr);
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

    // Get the data with pagination, sorting, and field selection
    const data = await this.model
      .find(queryFilter)
      .limit(limit)
      .skip(skip)
      .sort(sort ? sort : '-createdAt')
      .select(select)
      .populate(populate)
      .exec();

    return {
      data,
      total,
      limit,
      page,
    };
  }
}
