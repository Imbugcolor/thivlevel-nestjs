import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { AccessTokenGuard } from 'src/user/auth/accessToken.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './review.schema';
import { GetUser } from 'src/user/auth/get-user.decorator';
import { User } from 'src/user/user.schema';

@Controller('review')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  createReview(
    @Body() createReviewDto: CreateReviewDto,
    @GetUser() user: User,
  ): Promise<Review> {
    return this.reviewService.createReview(createReviewDto, user);
  }
}
