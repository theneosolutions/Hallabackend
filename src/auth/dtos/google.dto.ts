import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { NAME_REGEX } from '../../common/consts/regex.const';
import { PasswordsDto } from './passwords.dto';

export abstract class GoogleDto {
    @ApiProperty({
        description: 'idToken',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjI3NDA1MmEyYjY0NDg3NDU3NjRlNzJjMzU5MDk3MWQ5MGNmYjU4NWEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3NDI1NDAwMTQ0MDctOGYzZHRzc2wwYTQzcXM1YzBqMDNjY2M5OHEwY2d0ZmEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3NDI1NDAwMTQ0MDctNmVvY2NyaWljcXJtZGZubnRzMWJmdW1tOG9jaGg0ajMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTgwMjcxMDkxNDg3NDI1NjQwNjYiLCJoZCI6ImNvZGUtZnJlYWtzLmNvbSIsImVtYWlsIjoiZnpvdXFlQGNvZGUtZnJlYWtzLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiWm91cWUgS2h1ZGEiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUVkRlRwN00wajUxM2R1Q3VVT05xNURlR240dnliaXc0OGxJRWxmNzZLWEM9czk2LWMiLCJnaXZlbl9uYW1lIjoiWm91cWUiLCJmYW1pbHlfbmFtZSI6IktodWRhIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE2NzUzMjg3OTUsImV4cCI6MTY3NTMzMjM5NX0',
        type: String,
    })
    @IsString()
    public idToken!: string;
}