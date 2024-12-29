export interface CommentType {
  id: string;
  userName: string;
  date: string;
  comment: string;
  avatarUrl: string;
}

export interface RetroMethodType {
  category: string;
  title: string;
  description: string;
  link: string;
  comments: CommentType[];
}
