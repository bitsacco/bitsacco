import { Footer } from '@/components/footer'
import { HeroImage } from '@/components/hero-image'
import { Link } from '@/components/link'
import { Navbar } from '@/components/navbar'
import { portableTextComponents } from '@/components/portable-text'
import { ProseContent } from '@/components/prose-content'
import { Heading } from '@/components/text'
import {
  convertGoogleDriveUrl,
  extractVimeoId,
  extractYouTubeId,
  getVimeoEmbedUrl,
  getYouTubeEmbedUrl,
  isGoogleDriveUrl,
} from '@/lib/media-utils'
import { image } from '@/sanity/image'
import { getGuide } from '@/sanity/queries'
import { Button, Container } from '@bitsacco/ui'
import {
  ArrowRightIcon,
  BookOpenIcon,
  CaretLeftIcon,
  CheckIcon,
  ListBulletsIcon,
  PlayIcon,
  PlusIcon,
  StarIcon,
} from '@phosphor-icons/react/dist/ssr'
import dayjs from 'dayjs'
import type { Metadata } from 'next'
import { PortableText } from 'next-sanity'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const params = await props.params
  const guide = await getGuide(params.slug)

  if (!guide) {
    return {}
  }

  return {
    title: `${guide.title} | Bitsacco Guides`,
    description: guide.excerpt ?? undefined,
    openGraph: {
      title: guide.title ?? undefined,
      description: guide.excerpt ?? undefined,
      url: `/guides/${params.slug ?? undefined}`,
      type: 'article',
      publishedTime: guide.publishedAt ?? undefined,
      authors: guide.author ? [`${guide.author.name}`] : undefined,
      tags: [
        guide.category?.title,
        ...(guide.tags?.map((tag) => tag.title) || []),
      ].filter(Boolean),
      images:
        guide.media?.type === 'image' && guide.media.image
          ? [
              {
                url: image(guide.media.image).width(1200).height(630).url(),
                width: 1200,
                height: 630,
                alt: guide.media.image.alt || guide.title,
              },
            ]
          : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title ?? undefined,
      description: guide.excerpt ?? undefined,
      site: '@bitsacco',
      creator: '@bitsacco',
      images:
        guide.media?.type === 'image' && guide.media.image
          ? [image(guide.media.image).width(1200).height(630).url()]
          : undefined,
    },
  }
}

function StepContent({ step, index }: { step: any; index: number }) {
  return (
    <div className="group relative rounded-lg border border-gray-700 bg-gray-800 p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-900 text-sm font-bold text-teal-200">
          {index + 1}
        </div>
        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-semibold text-white">{step.title}</h3>

          {step.description && (
            <p className="text-gray-300">{step.description}</p>
          )}

          {step.content && (
            <ProseContent className="prose-sm max-w-none">
              <PortableText
                value={step.content}
                components={portableTextComponents}
              />
            </ProseContent>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionContent({
  section,
  sectionIndex,
}: {
  section: any
  sectionIndex: number
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-teal-700 bg-teal-900/20 p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">
            {sectionIndex + 1}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{section.title}</h2>
          </div>
        </div>
      </div>

      {section.media && (
        <div className="mb-6 overflow-hidden">
          {section.media.type === 'image' && section.media.image && (
            <div className="space-y-2">
              <Image
                src={image(section.media.image).width(400).height(300).url()}
                alt={section.media.image.alt || section.title}
                width={400}
                height={300}
                className="rounded-lg ring-1 ring-gray-600"
              />
              {section.media.image.caption && (
                <p className="text-xs text-gray-400">
                  {section.media.image.caption}
                </p>
              )}
            </div>
          )}
          {section.media.type === 'video' && section.media.video && (
            <div className="flex items-center gap-3 rounded-lg border border-gray-700 p-3">
              <PlayIcon className="size-5 text-orange-400" />
              <div>
                <p className="text-sm font-medium text-white">
                  Video: {section.media.video.caption || section.title}
                </p>
                {section.media.video.alt && (
                  <p className="text-xs text-gray-400">
                    {section.media.video.alt}
                  </p>
                )}
              </div>
            </div>
          )}
          {section.media.type === 'youtube' &&
            section.media.youtubeUrl &&
            (() => {
              const videoId = extractYouTubeId(section.media.youtubeUrl)
              if (!videoId) return null
              return (
                <div className="space-y-2">
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <iframe
                      src={getYouTubeEmbedUrl(videoId)}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="size-full"
                      title={section.media.title || section.title}
                    />
                  </div>
                  {(section.media.title || section.media.description) && (
                    <div className="text-xs">
                      {section.media.title && (
                        <p className="font-medium text-white">
                          {section.media.title}
                        </p>
                      )}
                      {section.media.description && (
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {section.media.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}
          {section.media.type === 'vimeo' &&
            section.media.vimeoUrl &&
            (() => {
              const videoId = extractVimeoId(section.media.vimeoUrl)
              if (!videoId) return null
              return (
                <div className="space-y-2">
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <iframe
                      src={getVimeoEmbedUrl(videoId)}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="size-full"
                      title={section.media.title || section.title}
                    />
                  </div>
                  {(section.media.title || section.media.description) && (
                    <div className="text-xs">
                      {section.media.title && (
                        <p className="font-medium text-white">
                          {section.media.title}
                        </p>
                      )}
                      {section.media.description && (
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {section.media.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}
          {section.media.type === 'external' && section.media.externalUrl && (
            <div className="space-y-2">
              <div className="aspect-video overflow-hidden rounded-lg">
                {isGoogleDriveUrl(section.media.externalUrl) ? (
                  <iframe
                    src={convertGoogleDriveUrl(section.media.externalUrl)}
                    allow="autoplay"
                    allowFullScreen
                    className="size-full"
                    title={section.media.title || section.title}
                  />
                ) : (
                  <video
                    src={section.media.externalUrl}
                    controls
                    className="size-full"
                    title={section.media.title || section.title}
                  />
                )}
              </div>
              {(section.media.title || section.media.description) && (
                <div className="text-xs">
                  {section.media.title && (
                    <p className="font-medium text-white">
                      {section.media.title}
                    </p>
                  )}
                  {section.media.description && (
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {section.media.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="ml-6 space-y-4 border-l-2 border-teal-200 pl-6 dark:border-teal-800">
        {section.steps
          ?.sort((a: any, b: any) => a.order - b.order)
          ?.map((step: any, stepIndex: number) => (
            <StepContent key={stepIndex} step={step} index={stepIndex} />
          ))}
      </div>
    </div>
  )
}

export default async function GuidePage(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  const guide = (await getGuide(params.slug)) || notFound()

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <Container className="py-16 sm:py-24">
          <article>
            {/* Guide metadata - optimized horizontal layout */}
            <div className="mb-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                {/* Left side: Author and core metadata */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  {guide.author && (
                    <div className="flex items-center gap-3">
                      {guide.author.image && (
                        <Image
                          alt=""
                          src={image(guide.author.image).size(32, 32).url()}
                          width={32}
                          height={32}
                          className="size-8 rounded-full object-cover ring-2 ring-gray-600"
                        />
                      )}
                      <div>
                        <p className="text-xs text-gray-400">Author</p>
                        <p className="text-sm font-medium text-white">
                          {guide.author.name}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="hidden h-8 w-px bg-neutral-200 sm:block dark:bg-neutral-700" />

                  <div>
                    <p className="text-xs text-gray-400">Published</p>
                    <time className="text-sm font-medium text-white">
                      {dayjs(guide.publishedAt).format('MMMM D, YYYY')}
                    </time>
                  </div>

                  <div className="hidden h-8 w-px bg-neutral-200 sm:block dark:bg-neutral-700" />

                  {guide.category && (
                    <div className="flex items-center gap-2">
                      <BookOpenIcon className="size-4 text-neutral-400 dark:text-neutral-500" />
                      <div>
                        <p className="text-xs text-gray-400">Category</p>
                        <Link
                          href={`/guides?category=${guide.category.slug}`}
                          className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                        >
                          {guide.category.title}
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="hidden h-8 w-px bg-neutral-200 sm:block dark:bg-neutral-700" />

                  <div className="flex items-center gap-2">
                    <ListBulletsIcon className="size-4 text-neutral-400 dark:text-neutral-500" />
                    <div>
                      <p className="text-xs text-gray-400">Structure</p>
                      <p className="text-sm font-medium text-white">
                        {guide.hasComplexStructure
                          ? `${guide.sections?.length || 0} sections`
                          : `${guide.steps?.length || 0} steps`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side: Featured badge */}
                {guide.isFeatured && (
                  <div className="flex justify-start sm:justify-end">
                    <div className="rounded-full border border-teal-200 bg-teal-900/20 px-3 py-1 dark:border-teal-800 dark:bg-teal-950">
                      <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300">
                        <StarIcon className="size-3.5" />
                        <span className="text-xs font-semibold">
                          Featured Guide
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Header */}
            <div className="mb-12">
              <Heading as="h1" className="text-white">
                {guide.title}
              </Heading>

              {guide.excerpt && (
                <p className="mt-4 text-lg text-gray-300">{guide.excerpt}</p>
              )}
            </div>

            {/* Featured Media */}
            {guide.media && (
              <div className="mb-12">
                {guide.media.type === 'image' && guide.media.image && (
                  <HeroImage
                    alt={guide.media.image.alt || guide.title}
                    src={image(guide.media.image).size(1600, 900).url()}
                    width={1600}
                    height={900}
                    className="ring-gray-600"
                  />
                )}
                {guide.media.type === 'video' && guide.media.video && (
                  <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <div className="flex items-center gap-4">
                      <PlayIcon className="size-8 text-orange-400" />
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          {guide.media.video.caption || guide.title}
                        </h3>
                        {guide.media.video.alt && (
                          <p className="text-sm text-gray-400">
                            {guide.media.video.alt}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {guide.media.type === 'youtube' &&
                  guide.media.youtubeUrl &&
                  (() => {
                    const videoId = extractYouTubeId(guide.media.youtubeUrl)
                    if (!videoId) return null
                    return (
                      <div className="space-y-4">
                        <div className="aspect-video overflow-hidden rounded-lg">
                          <iframe
                            src={getYouTubeEmbedUrl(videoId)}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="size-full"
                            title={guide.media.title || guide.title}
                          />
                        </div>
                        {(guide.media.title || guide.media.description) && (
                          <div className="text-sm">
                            {guide.media.title && (
                              <p className="font-medium text-white">
                                {guide.media.title}
                              </p>
                            )}
                            {guide.media.description && (
                              <p className="text-neutral-600 dark:text-neutral-400">
                                {guide.media.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                {guide.media.type === 'vimeo' &&
                  guide.media.vimeoUrl &&
                  (() => {
                    const videoId = extractVimeoId(guide.media.vimeoUrl)
                    if (!videoId) return null
                    return (
                      <div className="space-y-4">
                        <div className="aspect-video overflow-hidden rounded-lg">
                          <iframe
                            src={getVimeoEmbedUrl(videoId)}
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            className="size-full"
                            title={guide.media.title || guide.title}
                          />
                        </div>
                        {(guide.media.title || guide.media.description) && (
                          <div className="text-sm">
                            {guide.media.title && (
                              <p className="font-medium text-white">
                                {guide.media.title}
                              </p>
                            )}
                            {guide.media.description && (
                              <p className="text-neutral-600 dark:text-neutral-400">
                                {guide.media.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                {guide.media.type === 'external' && guide.media.externalUrl && (
                  <div className="space-y-4">
                    <div className="aspect-video overflow-hidden rounded-lg">
                      {isGoogleDriveUrl(guide.media.externalUrl) ? (
                        <iframe
                          src={convertGoogleDriveUrl(guide.media.externalUrl)}
                          allow="autoplay"
                          allowFullScreen
                          className="size-full"
                          title={guide.media.title || guide.title}
                        />
                      ) : (
                        <video
                          src={guide.media.externalUrl}
                          controls
                          className="size-full"
                          title={guide.media.title || guide.title}
                        />
                      )}
                    </div>
                    {(guide.media.title || guide.media.description) && (
                      <div className="text-sm">
                        {guide.media.title && (
                          <p className="font-medium text-white">
                            {guide.media.title}
                          </p>
                        )}
                        {guide.media.description && (
                          <p className="text-neutral-600 dark:text-neutral-400">
                            {guide.media.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Objectives and Outcomes side by side */}
            {((guide.objectives && guide.objectives.length > 0) ||
              (guide.outcomes && guide.outcomes.length > 0)) && (
              <div className="mb-12 grid gap-6 lg:grid-cols-2">
                {/* Objectives */}
                {guide.objectives && guide.objectives.length > 0 && (
                  <div className="rounded-lg border border-teal-500 p-6">
                    <h2 className="mb-4 text-lg font-semibold text-white">
                      What you&apos;ll learn
                    </h2>
                    <ul className="space-y-3">
                      {guide.objectives.map(
                        (objective: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 text-gray-300"
                          >
                            <PlusIcon className="mt-0.5 size-4 flex-shrink-0 text-teal-500 dark:text-teal-400" />
                            {objective}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

                {/* Expected Outcomes */}
                {guide.outcomes && guide.outcomes.length > 0 && (
                  <div className="rounded-lg border border-teal-500 bg-teal-900/20 p-6">
                    <h2 className="mb-4 text-lg font-semibold text-white">
                      Expected Outcomes
                    </h2>
                    <p className="mb-4 text-sm text-gray-300">
                      After completing this guide, you should be able to:
                    </p>
                    <ul className="space-y-3">
                      {guide.outcomes.map((outcome: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-gray-300"
                        >
                          <CheckIcon className="mt-0.5 size-4 flex-shrink-0 text-teal-500 dark:text-teal-400" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Prerequisites */}
            {guide.prerequisites && guide.prerequisites.length > 0 && (
              <div className="mb-12 rounded-lg border border-blue-500 bg-blue-900/20 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">
                  Prerequisites
                </h2>
                <p className="mb-4 text-sm text-gray-300">
                  Complete these guides first for the best experience:
                </p>
                <div className="flex flex-wrap gap-2">
                  {guide.prerequisites.map((prerequisite: any) => (
                    <Link
                      key={prerequisite.slug}
                      href={`/guides/${prerequisite.slug}`}
                      className="inline-flex items-center gap-1 rounded-full border border-blue-500 bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-200 hover:bg-blue-800"
                    >
                      {prerequisite.title}
                      <ArrowRightIcon className="size-3" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Guide Content */}
            <div className="space-y-8">
              {guide.hasComplexStructure ? (
                // Sections with steps
                guide.sections
                  ?.sort((a: any, b: any) => a.order - b.order)
                  ?.map((section: any, sectionIndex: number) => (
                    <SectionContent
                      key={sectionIndex}
                      section={section}
                      sectionIndex={sectionIndex}
                    />
                  ))
              ) : (
                // Simple steps
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">
                    Step-by-step instructions
                  </h2>
                  <div className="space-y-4">
                    {guide.steps
                      ?.sort((a: any, b: any) => a.order - b.order)
                      ?.map((step: any, index: number) => (
                        <StepContent key={index} step={step} index={index} />
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Related Guides */}
            {guide.relatedGuides && guide.relatedGuides.length > 0 && (
              <div className="mt-12 border-t border-gray-700 pt-8 dark:border-neutral-800">
                <h2 className="mb-6 text-xl font-semibold text-white">
                  Related Guides
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {guide.relatedGuides.map((relatedGuide: any) => (
                    <Link
                      key={relatedGuide.slug}
                      href={`/guides/${relatedGuide.slug}`}
                      className="group rounded-lg border border-gray-700 p-4 transition-colors hover:border-teal-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:border-teal-800 dark:hover:bg-neutral-900"
                    >
                      <div className="flex gap-4">
                        {relatedGuide.media?.type === 'image' &&
                          relatedGuide.media.image && (
                            <Image
                              src={image(relatedGuide.media.image)
                                .width(60)
                                .height(60)
                                .url()}
                              alt={
                                relatedGuide.media.image.alt ||
                                relatedGuide.title
                              }
                              width={60}
                              height={60}
                              className="size-15 rounded object-cover"
                            />
                          )}
                        <div className="flex-1">
                          <h3 className="font-medium text-neutral-950 group-hover:text-teal-600 dark:text-neutral-0 dark:group-hover:text-teal-400">
                            {relatedGuide.title}
                          </h3>
                          <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                            {relatedGuide.category && (
                              <span>{relatedGuide.category.title}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-12 border-t border-gray-700 pt-8 dark:border-neutral-800">
              <Button variant="outline" href="/guides">
                <CaretLeftIcon className="size-4" />
                Back to guides
              </Button>
            </div>
          </article>
        </Container>
      </main>
      <Footer />
    </>
  )
}
