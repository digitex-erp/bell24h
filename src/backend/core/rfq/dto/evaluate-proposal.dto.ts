import { IsNumber, IsObject, IsString, IsOptional } from 'class-validator';

export class EvaluateProposalDto {
  @IsNumber()
  score: number;

  @IsObject()
  criteria: {
    [key: string]: {
      @IsNumber()
      score: number;

      @IsString()
      comments: string;
    };
  };

  @IsOptional()
  @IsString()
  notes?: string;
} 