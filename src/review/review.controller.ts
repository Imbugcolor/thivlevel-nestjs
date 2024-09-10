import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { AccessTokenGuard } from 'src/user/auth/accessToken.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './review.schema';
import { GetUser } from 'src/user/auth/get-user.decorator';
import { User } from 'src/user/user.schema';
import { ReviewQueryDto } from './dto/review-query.dto';

@Controller('review')
@SerializeOptions({
  strategy: 'excludeAll',
  excludeExtraneousValues: true,
  enableImplicitConversion: true,
})
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get(':productId')
  getReview(
    @Param('productId') productId: string,
    @Query() reviewQuery: ReviewQueryDto,
  ) {
    return this.reviewService.getReviewsPaginated(productId, reviewQuery);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  createReview(
    @Body() createReviewDto: CreateReviewDto,
    @GetUser() user: User,
  ): Promise<Review> {
    return this.reviewService.createReview(createReviewDto, user);
  }
}
