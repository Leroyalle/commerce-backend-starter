export type YandexUserinfoSex = 'male' | 'female' | null;

export interface YandexUserinfo {
  id: string;
  login: string;
  client_id: string;
  display_name: string;
  real_name: string;
  first_name: string;
  last_name: string;
  sex: YandexUserinfoSex;
  default_email: string;
  emails: string[];
  psuid: string;
}
