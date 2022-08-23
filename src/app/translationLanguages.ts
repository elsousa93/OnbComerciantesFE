export interface TranslationLanguage {
  abbreviation: string;
  fullName: string;
  imageUrl: string;
}

export const translationLanguages: TranslationLanguage[] = [
  { abbreviation: 'pt', fullName: 'Portuguese', imageUrl: 'assets/images/portuguese_flag.jpg' },
  { abbreviation: 'en', fullName: 'English', imageUrl: 'assets/images/uk_flag.jpg' }
]
