import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './review.schema';
import { Model } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { ProductsService } from 'src/products/products.service';
import { User } from 'src/user/user.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel = Model<Review>,
    @Inject(forwardRef(() => ProductsService))
    private productService: ProductsService,
  ) {}

  async createReview(
    createReviewDto: CreateReviewDto,
    user: User,
  ): Promise<Review> {
    const { rating, comment, productId } = createReviewDto;

    await this.productService.getProduct(productId);

    const review = new this.reviewModel({
      rating,
      comment,
      user,
      productId,
    });

    await this.productService.addReview(productId, review);

    return review.save();
  }

  async getReviews(ids: any[]) {
    return this.reviewModel.find({ _id: { $in: ids } });
  }
}
