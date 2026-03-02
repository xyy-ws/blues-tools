export interface BackingExtractRequest {
  url: string
}

export interface BackingExtractPreview {
  title: string
  sourceUrl: string
  suggestedStyle?: string
}

export interface BackingExtractorService {
  extractFromUrl: (request: BackingExtractRequest) => Promise<BackingExtractPreview>
}

export function createPlaceholderBackingExtractorService(): BackingExtractorService {
  return {
    async extractFromUrl() {
      throw new Error('链接提取素材功能即将支持，当前版本仅提供占位入口。')
    },
  }
}
