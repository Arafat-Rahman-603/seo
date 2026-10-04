import fs from 'fs';
import path from 'path';
import SeoOverride from '../models/SeoOverride';

const BASE_DATA_PATH = path.resolve(__dirname, '../../../../demo-data/sample-project');

export const getBaseSeo = (page: string) => {
  const filePath = path.join(BASE_DATA_PATH, `data/seo/${page}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

export const getBaseSettings = () => {
  const filePath = path.join(BASE_DATA_PATH, `settings.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

export const getResolvedSeo = async (projectId: string, page: string, overrideMode: 'DRAFT' | 'PUBLISHED' | 'VERSION' = 'DRAFT', versionData?: any) => {
  const baseData = getBaseSeo(page);
  if (!baseData) return null;

  const resolvedData = JSON.parse(JSON.stringify(baseData));

  let overrides: any[] = [];
  if (overrideMode === 'DRAFT') {
    overrides = await SeoOverride.find({ projectId, page });
  } else if (overrideMode === 'VERSION' || overrideMode === 'PUBLISHED') {
    if (versionData && versionData.seoOverrides && versionData.seoOverrides[page]) {
      overrides = versionData.seoOverrides[page];
    }
  }

  const activeOverrides: any = {};
  for (const override of overrides) {
    resolvedData[override.field] = override.value;
    activeOverrides[override.field] = override.value;
  }

  return {
    data: resolvedData,
    baseData,
    activeOverrides
  };
};

export const validateSeo = (data: any) => {
  const diagnostics = [];
  
  if (!data.title) diagnostics.push({ type: 'MISSING_TITLE', severity: 'ERROR' });
  else if (data.title.length < 10) diagnostics.push({ type: 'TITLE_TOO_SHORT', severity: 'WARNING' });
  else if (data.title.length > 60) diagnostics.push({ type: 'TITLE_TOO_LONG', severity: 'WARNING' });

  if (!data.description) diagnostics.push({ type: 'MISSING_DESCRIPTION', severity: 'ERROR' });
  else if (data.description.length < 50) diagnostics.push({ type: 'DESCRIPTION_TOO_SHORT', severity: 'WARNING' });
  else if (data.description.length > 160) diagnostics.push({ type: 'DESCRIPTION_TOO_LONG', severity: 'WARNING' });

  if (!data.canonical) diagnostics.push({ type: 'INVALID_CANONICAL', severity: 'ERROR' });

  // Add more simple diagnostics here as needed

  return diagnostics;
};
