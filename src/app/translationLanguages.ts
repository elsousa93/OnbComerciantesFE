export interface TranslationLanguage {
  abbreviation: string;
  fullName: string;
  imageUrl: string;
  name: string;
}

export const translationLanguages: TranslationLanguage[] = [
  { abbreviation: 'pt', fullName: 'Portuguese', imageUrl: 'assets/images/portuguese_flag.jpg', name: 'PT'},
  { abbreviation: 'en', fullName: 'English', imageUrl: 'assets/images/uk_flag.jpg', name: 'EN'}
]