import questions from './questions.json';
import cheatsheet from './cheatsheet.json';
import { QuestionItem } from './questionsData';
import { FormulaCard } from './cheatsheetData';

export const LOCAL_QUESTIONS_JSON: QuestionItem[] = questions as QuestionItem[];
export const LOCAL_CHEATSHEET_JSON: FormulaCard[] = cheatsheet as FormulaCard[];
