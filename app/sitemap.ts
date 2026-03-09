import { prisma } from "../lib/prisma";

const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://thinkfats.com";

export default async function sitemap() {
	// Fetch posts so we can include dynamic post pages in the sitemap
	const posts = await prisma.post.findMany({ select: { id: true, updatedAt: true } });

	const urls = [
		{ url: `${SITE_URL}/`, lastModified: new Date() },
		...posts.map((p) => ({ url: `${SITE_URL}/post/${p.id}`, lastModified: p.updatedAt })),
	];

	return urls;
}
