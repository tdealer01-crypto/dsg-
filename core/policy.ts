import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { Rule } from './engine';

export function loadPolicy(filePath: string): Rule[] {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`Policy file not found: ${filePath}. Using empty rules.`);
      return [];
    }
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(fileContents) as { rules: Rule[] };
    return data.rules || [];
  } catch (e) {
    console.error('Failed to load policy:', e);
    return [];
  }
}
