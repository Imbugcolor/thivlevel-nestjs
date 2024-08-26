import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './review.schema';
import { Model } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from 'src/user/user.schema';
import { Product } from 'src/products/products.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel = Model<Review>,
    @InjectModel(Product.name) private productModel = Model<Product>,
  ) {}

  async addReview(id: string, review: Review): Promise<Product> {
    const product = await this.productModel
      .findById(id)
      .populate('reviews', 'rating');

    const ids = product.reviews;
    const reviews = await this.getReviews(ids);

    product.reviews.push(review);
    product.numReviews = reviews.length + 1;
    product.rating =
      (reviews.reduce((acc, item) => item.rating + acc, 0) + review.rating) /
      (reviews.length + 1);

    await product.save();

    return product;
  }

  async createReview(
    createReviewDto: CreateReviewDto,
    user: User,
  ): Promise<Review> {
    const { rating, comment, productId } = createReviewDto;

    const product = await this.productModel
      .findById(productId)
      .populate('reviews', 'rating');

    const review = new this.reviewModel({
      rating,
      comment,
      user,
      productId,
    });

    const ids = product.reviews;
    const reviews = await this.getReviews(ids);

    product.reviews.push(review);
    product.numReviews = reviews.length + 1;
    product.rating =
      (reviews.reduce((acc, item) => item.rating + acc, 0) + review.rating) /
      (reviews.length + 1);

    await product.save();

    const createdReview = await review.save();

    return new Review(createdReview);
  }

  async getReviews(ids: any[]) {
    return this.reviewModel.find({ _id: { $in: ids } }).lean();
  }
}
