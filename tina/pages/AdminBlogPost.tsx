import { tinaField, useTina } from "tinacms/dist/react";
import type { BlogQuery, BlogQueryVariables } from '../__generated__/types';
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import FormattedDate from '../../src/components/react/FormattedDate.tsx';

type Props = {
	variables: BlogQueryVariables;
	data: BlogQuery;
	query: string;
}

export default function AdminBlogPost(props: Props) {

	const { data } = useTina({
		query: props.query,
		variables: props.variables,
		data: props.data,
	})

	const blog = data.blog;

	return (
		<article className="article">
			<header className="article__header">
				<p className="label">
					<span className="label__index">//</span>
					<span>post</span>
				</p>

				<h1 className="article__title" data-tina-field={tinaField(blog, "title")}>
					{blog.title}
				</h1>

				{blog.description && (
					<p className="article__lede" data-tina-field={tinaField(blog, "description")}>
						{blog.description}
					</p>
				)}

				<p className="article__meta" data-tina-field={tinaField(blog, "pubDate")}>
					{blog.pubDate && <FormattedDate date={blog.pubDate} />}
					{blog.updatedDate && (
						<span data-tina-field={tinaField(blog, "updatedDate")}>
							{" · updated "}
							<FormattedDate date={blog.updatedDate} />
						</span>
					)}
				</p>
			</header>

			{blog.heroImage && (
				<div className="article__hero" data-tina-field={tinaField(blog, "heroImage")}>
					<img width={1020} height={510} src={blog.heroImage} alt="" />
				</div>
			)}

			<div className="prose" data-tina-field={tinaField(blog, "body")}>
				<TinaMarkdown content={blog.body} />
			</div>

			<p className="article__back">
				<a href="/blog">
					<span className="row-arrow" aria-hidden="true">←</span> All posts
				</a>
			</p>
		</article>
	);
}
