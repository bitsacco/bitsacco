import { defineQuery } from 'next-sanity'
import { sanityFetch } from './client'

const TOTAL_POSTS_QUERY = defineQuery(/* groq */ `count(*[
  _type == "post"
  && defined(slug.current)
  && select(defined($category) => $category in categories[]->slug.current, true)
])`)

export async function getPostsCount(category?: string) {
  return await sanityFetch({
    query: TOTAL_POSTS_QUERY,
    params: { category: category ?? null },
  })
}

const POSTS_QUERY = defineQuery(/* groq */ `*[
  _type == "post"
  && defined(slug.current)
  && select(defined($category) => $category in categories[]->slug.current, true)
]|order(publishedAt desc)[$startIndex...$endIndex]{
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  author->{
    name,
    image,
  },
}`)

export async function getPosts(
  startIndex: number,
  endIndex: number,
  category?: string,
) {
  return await sanityFetch({
    query: POSTS_QUERY,
    params: {
      startIndex,
      endIndex,
      category: category ?? null,
    },
  })
}

const FEATURED_POSTS_QUERY = defineQuery(/* groq */ `*[
  _type == "post"
  && isFeatured == true
  && defined(slug.current)
]|order(publishedAt desc)[0...$quantity]{
  title,
  "slug": slug.current,
  publishedAt,
  featuredImage,
  excerpt,
  author->{
    name,
    image,
  },
}`)

export async function getFeaturedPosts(quantity: number) {
  return await sanityFetch({
    query: FEATURED_POSTS_QUERY,
    params: { quantity },
  })
}

const FEED_POSTS_QUERY = defineQuery(/* groq */ `*[
  _type == "post"
  && defined(slug.current)
]|order(isFeatured, publishedAt desc){
  title,
  "slug": slug.current,
  publishedAt,
  featuredImage,
  excerpt,
  author->{
    name,
  },
}`)

export async function getPostsForFeed() {
  return await sanityFetch({
    query: FEED_POSTS_QUERY,
  })
}

const POST_QUERY = defineQuery(/* groq */ `*[
  _type == "post"
  && slug.current == $slug
][0]{
  publishedAt,
  title,
  featuredImage,
  excerpt,
  body,
  author->{
    name,
    image,
  },
  categories[]->{
    title,
    "slug": slug.current,
  }
}
`)

export async function getPost(slug: string) {
  return await sanityFetch({
    query: POST_QUERY,
    params: { slug },
  })
}

const CATEGORIES_QUERY = defineQuery(/* groq */ `*[
  _type == "category"
  && count(*[_type == "post" && defined(slug.current) && ^._id in categories[]._ref]) > 0
]|order(title asc){
  title,
  "slug": slug.current,
}`)

const TAGS_QUERY = defineQuery(/* groq */ `*[
  _type == "tag"
  && count(*[defined(slug.current) && ^._id in tags[]._ref]) > 0
]|order(title asc){
  title,
  "slug": slug.current,
}`)

export async function getCategories() {
  return await sanityFetch({
    query: CATEGORIES_QUERY,
  })
}

export async function getTags() {
  return await sanityFetch({
    query: TAGS_QUERY,
  })
}

const PAGE_QUERY = defineQuery(/* groq */ `*[
  _type == "page"
  && slug.current == $slug
][0]{
  publishedAt,
  title,
  featuredImage,
  excerpt,
  body,
  tag->{
    title,
    "slug": slug.current,
  },
}
`)

export async function getPage(slug: string) {
  return await sanityFetch({
    query: PAGE_QUERY,
    params: { slug },
  })
}

const PAGES_BY_TAG_QUERY = defineQuery(/* groq */ `*[
  _type == "page"
  && tag->slug.current == $tagSlug
]|order(publishedAt desc){
  publishedAt,
  title,
  "slug": slug.current,
  featuredImage,
  excerpt,
  body,
  tag->{
    title,
    "slug": slug.current,
  },
}`)

export async function getPagesByTag(tagSlug: string) {
  return await sanityFetch({
    query: PAGES_BY_TAG_QUERY,
    params: { tagSlug },
  })
}

const PARTNERS_QUERY = defineQuery(/* groq */ `*[
  _type == "partner"
]|order(name asc){
  _id,
  name,
  logo,
  excerpt,
  website
}`)

export async function getPartners() {
  return await sanityFetch({
    query: PARTNERS_QUERY,
  })
}

const FAQS_QUERY = defineQuery(/* groq */ `*[
  _type == "faq"
  && isActive == true
]|order(order asc){
  _id,
  question,
  answer,
  category,
  order
}`)

export async function getFAQs() {
  return await sanityFetch({
    query: FAQS_QUERY,
  })
}

const TOTAL_GUIDES_QUERY = defineQuery(/* groq */ `count(*[
  _type == "guide"
  && defined(slug.current)
  && select(defined($category) => $category == category->slug.current, true)
])`)

export async function getGuidesCount(category?: string) {
  return await sanityFetch({
    query: TOTAL_GUIDES_QUERY,
    params: {
      category: category ?? null,
    },
  })
}

const GUIDES_QUERY = defineQuery(/* groq */ `*[
  _type == "guide"
  && defined(slug.current)
  && select(defined($category) => $category == category->slug.current, true)
]|order(isFeatured desc, publishedAt desc)[$startIndex...$endIndex]{
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  objectives,
  media {
    type,
    image {
      asset,
      alt,
      caption
    },
    video {
      asset,
      alt,
      caption
    },
    youtubeUrl,
    vimeoUrl,
    externalUrl,
    title,
    description
  },
  isFeatured,
  hasComplexStructure,
  "stepsCount": count(steps),
  "sectionsCount": count(sections),
  category->{
    title,
    "slug": slug.current,
  },
  author->{
    name,
    image,
  },
}`)

export async function getGuides(
  startIndex: number,
  endIndex: number,
  category?: string,
) {
  return await sanityFetch({
    query: GUIDES_QUERY,
    params: {
      startIndex,
      endIndex,
      category: category ?? null,
    },
  })
}

const FEATURED_GUIDES_QUERY = defineQuery(/* groq */ `*[
  _type == "guide"
  && isFeatured == true
  && defined(slug.current)
]|order(publishedAt desc)[0...$quantity]{
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  objectives,
  media {
    type,
    image {
      asset,
      alt,
      caption
    },
    video {
      asset,
      alt,
      caption
    },
    youtubeUrl,
    vimeoUrl,
    externalUrl,
    title,
    description
  },
  hasComplexStructure,
  "stepsCount": count(steps),
  "sectionsCount": count(sections),
  category->{
    title,
    "slug": slug.current,
  },
  author->{
    name,
    image,
  },
}`)

export async function getFeaturedGuides(quantity: number) {
  return await sanityFetch({
    query: FEATURED_GUIDES_QUERY,
    params: { quantity },
  })
}

const GUIDE_QUERY = defineQuery(/* groq */ `*[
  _type == "guide"
  && slug.current == $slug
][0]{
  publishedAt,
  title,
  excerpt,
  objectives,
  outcomes,
  media {
    type,
    image {
      asset,
      alt,
      caption
    },
    video {
      asset,
      alt,
      caption
    },
    youtubeUrl,
    vimeoUrl,
    externalUrl,
    title,
    description
  },
  isFeatured,
  hasComplexStructure,
  steps[]{
    title,
    excerpt,
    content,
    media {
      type,
      image {
        asset,
        alt,
        caption
      },
      video {
        asset,
        alt,
        caption
      },
      youtubeUrl,
      vimeoUrl,
      externalUrl,
      title,
      description
    },
    order
  },
  sections[]{
    title,
    excerpt,
    media {
      type,
      image {
        asset,
        alt,
        caption
      },
      video {
        asset,
        alt,
        caption
      },
      youtubeUrl,
      vimeoUrl,
      externalUrl,
      title,
      description
    },
    order,
    steps[]{
      title,
      excerpt,
      content,
      media {
        type,
        image {
          asset,
          alt,
          caption
        },
        video {
          asset,
          alt,
          caption
        },
        youtubeUrl,
        vimeoUrl,
        externalUrl,
        title,
        description
      },
      order
    }
  },
  category->{
    title,
    "slug": slug.current,
  },
  author->{
    name,
    image,
  },
  tags[]->{
    title,
    "slug": slug.current,
  },
  prerequisites[]->{
    title,
    "slug": slug.current,
  },
  relatedGuides[]->{
    title,
    "slug": slug.current,
    media,
    category->{
      title,
      "slug": slug.current,
    },
  },
  conclusion
}`)

export async function getGuide(slug: string) {
  return await sanityFetch({
    query: GUIDE_QUERY,
    params: { slug },
  })
}

const GUIDE_CATEGORIES_QUERY = defineQuery(/* groq */ `*[
  _type == "guideCategory"
  && count(*[_type == "guide" && defined(slug.current) && ^._id == category._ref]) > 0
]|order(title asc){
  title,
  "slug": slug.current,
}`)

export async function getGuideCategories() {
  return await sanityFetch({
    query: GUIDE_CATEGORIES_QUERY,
  })
}
