import { authorType } from './types/author'
import { blockContentType } from './types/block-content'
import { categoryType } from './types/category'
import { faqType } from './types/faq'
import { pageType } from './types/page'
import { partnerType } from './types/partner'
import { postType } from './types/post'
import { tagType } from './types/tag'
import type { SchemaTypeDefinition } from 'sanity'

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
  ],
}
