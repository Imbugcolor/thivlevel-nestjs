import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './review.schema';
import { Model, Types } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from 'src/user/user.schema';
import { Product } from 'src/products/products.schema';
import { Order } from 'src/order/order.schema';
import { OrderStatus } from 'src/order/enum/order-status.enum';
import { Paginator } from 'src/utils/Paginator';
import { ReviewQueryDto } from './dto/review-query.dto';

@Injectable()
export class ReviewService {
  private paginator: Paginator<Review>;

  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {
    this.paginator = new Paginator<Review>(this.reviewModel);
  }

  async createReview(
    createReviewDto: CreateReviewDto,
    user: User,
  ): Promise<Review> {
    const { rating, comment, productId } = createReviewDto;

    const isBought = await this.orderModel.find({
      user: user._id.toString(),
      status: OrderStatus.DELIVERED,
      items: {
        $elemMatch: { 'productId._id': new Types.ObjectId(productId) },
      },
    });

    if (!isBought.length) {
      throw new BadRequestException('Chưa thể đánh giá sản phẩm này');
    }

    const isReviewed = await this.reviewModel.findOne({
      user: user._id,
      productId,
    });

    if (isReviewed) {
      throw new BadRequestException('Sản phẩm đã được đánh giá');
    }

    const product = await this.productModel
      .findById(productId)
      .populate('reviews', 'rating');

    const review = new this.reviewModel({
      rating,
      comment,
      user,
      productId,
    });

    const reviews = await this.getReviews(productId);

    product.reviews.push(review);
    product.numReviews = reviews.length + 1;
    product.rating =
      (reviews.reduce((acc, item) => item.rating + acc, 0) + review.rating) /
      (reviews.length + 1);

    await product.save();

    const createdReview = await review.save();

    return new Review({
      _id: createdReview._id,
      rating,
      comment,
      user,
      productId,
    });
  }

  async getReviews(productId: string) {
    return this.reviewModel.find({ productId }).lean();
  }

  async getReviewsPaginated(productId: string, reviewQuery: ReviewQueryDto) {
    const { limit, page, sort, ...queryString } = reviewQuery;

    const filterQueryString = { ...queryString, productId };

    const populate = [
      {
        path: 'user',
        select: '_id username avatar',
      },
    ];

    return this.paginator.paginate(filterQueryString, {
      limit,
      page,
      sort,
      populate,
    });
  }
}
