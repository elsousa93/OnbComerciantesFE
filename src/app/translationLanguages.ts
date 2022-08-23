export interface TranslationLanguage {
  abbreviation: string;
  fullName: string;
  imageUrl: string;
}

export const translationLanguages: TranslationLanguage[] = [
  { abbreviation: 'pt', fullName: 'Portuguese', imageUrl: 'assets/images/Flag_of_Portugal.svg.webp' },
  { abbreviation: 'en', fullName: 'English', imageUrl: 'assets/images/Flag_of_the_United_Kingdom.svg.webp' }
]
