import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedConcert } from "@/lib/content";
import { formatConcertDate } from "@/lib/format";
import { youtubeEmbedUrl } from "@/lib/youtube";

export async function generateMetadata({ params }: PageProps<"/concerts/[id]">): Promise<Metadata> {
  const concert = await getPublishedConcert(Number((await params).id));
  return { title: concert?.title ?? "공연 일정" };
}

export default async function ConcertDetailPage({ params }: PageProps<"/concerts/[id]">) {
  const concert = await getPublishedConcert(Number((await params).id));
  if (!concert) notFound();

  const embed = youtubeEmbedUrl(concert.video_url);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/concerts" className="text-sm text-ink-soft hover:underline">
        ← 공연 일정
      </Link>
      <article className="card mt-4">
        <h1 className="text-2xl font-bold text-navy">{concert.title}</h1>
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex gap-3">
            <dt className="w-10 text-ink-soft">일시</dt>
            <dd>{formatConcertDate(concert.starts_at, concert.time_tbd)}</dd>
          </div>
          {concert.venue && (
            <div className="flex gap-3">
              <dt className="w-10 text-ink-soft">장소</dt>
              <dd>{concert.venue}</dd>
            </div>
          )}
        </dl>

        {concert.ticket_url && (
          <a
            href={concert.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-6"
          >
            예매 · 신청하기
          </a>
        )}

        {embed && (
          <div className="mt-6 aspect-video overflow-hidden rounded-sm bg-black">
            <iframe
              src={embed}
              title={`${concert.title} 영상`}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        {!embed && concert.video_url && (
          <a href={concert.video_url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-sm underline">
            공연 영상 보기
          </a>
        )}

        {concert.description && (
          <>
            <hr className="my-6 border-line" />
            <div className="whitespace-pre-wrap leading-relaxed">{concert.description}</div>
          </>
        )}
      </article>
    </div>
  );
}
