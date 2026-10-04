import fs from 'fs';
import path from 'path';
import ContentOverride from '../models/ContentOverride';
const BASE_DATA_PATH = path.resolve(__dirname, '../../../northstar');
export const getBaseContent = (page: string) => {
  const filePath = path.join(BASE_DATA_PATH, `data/pages/${page}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const applyOverride = (obj: any, overridePath: string, value: any) => {
  const keys = overridePath.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
};

export const getResolvedContent = async (projectId: string, page: string, overrideMode: 'DRAFT' | 'PUBLISHED' | 'VERSION' = 'DRAFT', versionData?: any) => {
  const baseData = getBaseContent(page);
  if (!baseData) return null;

  // Clone base data
  const resolvedData = JSON.parse(JSON.stringify(baseData));
  
  let overrides: any[] = [];
  
  if (overrideMode === 'DRAFT') {
     overrides = await ContentOverride.find({ projectId, page });
  } else if (overrideMode === 'VERSION' || overrideMode === 'PUBLISHED') {
     // If published or specific version, we get the overrides from the version data
     // versionData is expected to be { contentOverrides: { "home": [ { path: '...', value: '...' } ] } }
     if (versionData && versionData.contentOverrides && versionData.contentOverrides[page]) {
        overrides = versionData.contentOverrides[page];
     }
  }

  const activeOverrides = {};
  for (const override of overrides) {
    applyOverride(resolvedData, override.path, override.value);
    // keep track of overridden fields
    (activeOverrides as any)[override.path] = override.value;
  }

  return {
    data: resolvedData,
    baseData,
    activeOverrides
  };
};
