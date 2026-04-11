"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { LostFoundPost } from "@/types/lost-and-found";
import { lostFoundDisplayTitle, lostFoundLocationLabel, lostFoundPrimaryImage } from "../lostFoundDisplay";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

export default function LostFoundCard({ post }: { post: LostFoundPost }) {
  const title = lostFoundDisplayTitle(post);
  const img = lostFoundPrimaryImage(post);
  const loc = lostFoundLocationLabel(post);
  const reward = post.rewardAmount != null && post.rewardAmount > 0 ? `৳${post.rewardAmount.toLocaleString()}` : null;

  return (
    <Link
      href={`/lost-found/${post._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-[#00A651]/30 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full bg-gray-100">
        {img ? (
          <Image
            src={img}
            alt={title}
            fill
            className="object-cover transition group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, 25vw"
            unoptimized={shouldUnoptimizeRemoteImage(img)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">No photo</div>
        )}
        <span
          className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-xs font-bold ${
            post.type === "Lost" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
          }`}
        >
          {post.type}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{title}</h3>
        <p className="line-clamp-1 text-xs text-gray-500">{loc}</p>
        {reward && post.type === "Lost" ? (
          <p className="text-xs font-semibold text-[#00A651]">Reward {reward}</p>
        ) : null}
      </div>
    </Link>
  );
}
