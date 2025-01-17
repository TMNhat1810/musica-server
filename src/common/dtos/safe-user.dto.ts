import { User } from '@prisma/client';

export class SafeUserDto {
  id: string;
  username: string;
  display_name?: string;
  email: string;
  role: string;
  is_active: boolean;
  photo_url: string;
  created_at: Date;
  updated_at: Date;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.display_name = user.display_name;
    this.email = user.email;
    this.created_at = user.created_at;
    this.updated_at = user.updated_at;
    this.is_active = user.is_active;
    this.role = user.role;
    this.photo_url = user.photo_url;
  }
}
