import { tinaField, useTina } from "tinacms/dist/react";
import type { PageQuery, PageQueryVariables } from "../__generated__/types";
import { TinaMarkdown } from "tinacms/dist/rich-text";

type Props = {
	variables: PageQueryVariables;
	data: PageQuery;
	query: string;
}

const TinaPage = (props: Props) => {
	const { data } = useTina({
		query: props.query,
		variables: props.variables,
		data: props.data,
	})

	const page = data.page;

	return (
		<main id="main" className="container">
			<section className="section">
				<header className="section__head">
					<p className="label">
						<span className="label__index">//</span>
						<span>{page.seoTitle?.toLowerCase()}</span>
					</p>
					<h1 className="page-title">{page.seoTitle}</h1>
				</header>

				<div className="prose" data-tina-field={tinaField(page, "body")}>
					<TinaMarkdown content={page.body} />
				</div>
			</section>
		</main>
	)
}

export default TinaPage;
