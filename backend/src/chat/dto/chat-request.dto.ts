import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class SendChatMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  conversationId?: string;

  @IsString()
  @IsOptional()
  applicationId?: string;

  @IsObject()
  @IsOptional()
  context?: {
    currentRoute?: string;
    appName?: string;
    moduleName?: string;
    [key: string]: any;
  };
}
