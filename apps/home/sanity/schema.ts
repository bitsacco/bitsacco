import type { SchemaTypeDefinition } from 'sanity'
import { authorType } from './types/author'
import { blockContentType } from './types/block-content'
import { categoryType } from './types/category'
import { faqType } from './types/faq'
import { guideType } from './types/guide'
import { guideCategoryType } from './types/guide-category'
import { guideTagType } from './types/guide-tag'
import { pageType } from './types/page'
import { partnerType } from './types/partner'
import { postType } from './types/post'
import { sectionType } from './types/section'
import { stepType } from './types/step'
import { tagType } from './types/tag'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    postType,
    authorType,
    tagType,
    pageType,
    partnerType,
    faqType,
    guideCategoryType,
    guideTagType,
    stepType,
    sectionType,
    guideType,
  ],
}
