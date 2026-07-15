import Link from 'next/link'
import { getActiveMarqueesForPlacement } from '@/lib/marquees-store'

type MarqueeBannerRendererProps = {
  placement: string
  pagePath?: string
}

export function MarqueeBannerRenderer({ placement, pagePath = '/' }: MarqueeBannerRendererProps) {
  const banners = getActiveMarqueesForPlacement(placement, pagePath)
  if (banners.length === 0) return null

  return (
    <div className="w-full">
      {banners.map((banner) => {
        const content = (
          <div
            className="relative overflow-hidden border-y"
            style={{
              backgroundColor: banner.backgroundColor,
              borderColor: banner.borderColor,
              borderWidth: banner.borderWidth,
              color: banner.textColor,
              fontFamily: banner.fontFamily,
              fontSize: banner.fontSize,
              fontWeight: banner.fontWeight,
            }}
          >
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
              {banner.imageUrl && (
                <img src={banner.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
              )}
              <div className="min-w-0 text-center">
                {banner.title && <p className="text-xs uppercase tracking-widest opacity-80">{banner.title}</p>}
                <div
                  className="managed-page-content break-words [&_*]:m-0"
                  dangerouslySetInnerHTML={{ __html: banner.text }}
                />
              </div>
              {banner.buttonText && banner.buttonUrl && banner.linkUrl && (
                <span className="hidden shrink-0 rounded bg-accent px-4 py-2 text-xs font-black uppercase tracking-widest text-accent-foreground sm:inline-flex">
                  {banner.buttonText}
                </span>
              )}
              {banner.buttonText && banner.buttonUrl && !banner.linkUrl && (
                <Link href={banner.buttonUrl} className="hidden shrink-0 rounded bg-accent px-4 py-2 text-xs font-black uppercase tracking-widest text-accent-foreground sm:inline-flex">
                  {banner.buttonText}
                </Link>
              )}
            </div>
          </div>
        )

        return banner.linkUrl ? (
          <Link key={banner.id} href={banner.linkUrl} className="block">
            {content}
          </Link>
        ) : (
          <div key={banner.id}>{content}</div>
        )
      })}
    </div>
  )
}
