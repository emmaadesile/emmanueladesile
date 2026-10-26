import { tinaField, useTina } from 'tinacms/dist/react';
import type { PageQuery, PageQueryVariables } from '../__generated__/types';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import type { CollectionEntry } from 'astro:content';
import { AssemblyArtwork, Contours, ProjectArtwork } from '../../src/components/react/PortfolioArt';

type Props = { variables: PageQueryVariables; data: PageQuery; query: string; posts: CollectionEntry<'blog'>[] };
type WorkItem = { name?: string | null; description?: string | null; url?: string | null; year?: string | null; tags?: (string | null)[] | null };
const Arrow = () => <span aria-hidden="true">↗</span>;
const Label = ({ index, children }: { index: string; children: string }) => <p className="eyebrow"><span>{index} /</span> {children}</p>;
/** Text that rolls up on hover. The copy in ::after is hidden from screen readers. */
const Roll = ({ children }: { children: string }) => <span className="roll"><span data-text={children}>{children}</span></span>;
const defaultPrinciples = [
  { title: 'Made to feel right.', text: 'Clear interactions. Considered details. Interfaces that feel natural from the very first click.', name: 'Interface craft' },
  { title: 'Built to move fast.', text: 'Performance is part of the experience. Quick to load, responsive to input, and stable as you explore.', name: 'Web performance' },
  { title: 'Ready for what’s next.', text: 'Reusable components and thoughtful architecture. A strong foundation that grows with the product.', name: 'Systems that scale' },
];
const defaultStatement = 'I care about the details people feel but rarely notice: an interface that answers at once, a page that is ready before you wait, and a system that stays simple as it grows.';

export default function HomePage(props: Props) {
  const { data } = useTina({ query: props.query, variables: props.variables, data: props.data });
  const page = data.page;
  const hero = page.hero;
  const work: WorkItem[] = (page.work ?? []).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const posts = props.posts.slice(0, 3);
  const principles = (page.approach ?? []).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const principleList = principles.length ? principles : defaultPrinciples;

  return (
    <main id="main" className="portfolio">
      <section className="intro" aria-labelledby="intro-title">
        <div className="container">
          {/* Stage: a large first name, the EA initials in front of it, and text on each side. */}
          <div className="stage">
            <p className="stage__name" aria-hidden="true">{(hero?.givenName || 'Emmanuel').toLowerCase()}<span className="stage__dot" /></p>
            <div className="stage__art">
              <span className="stage__arch" aria-hidden="true" />
              <AssemblyArtwork />
            </div>
            <div className="stage__lead">
              <p className="eyebrow" data-tina-field={hero ? tinaField(hero, 'role') : undefined}>{hero?.role || 'Senior Frontend Engineer'}</p>
              <h1 id="intro-title">Thoughtful interfaces. <em>Built to scale.</em></h1>
            </div>
            <div className="stage__about">
              <p className="intro__name">Hello, I’m <span data-tina-field={hero ? tinaField(hero, 'givenName') : undefined}>{hero?.givenName || 'Emmanuel'}</span> <span data-tina-field={hero ? tinaField(hero, 'familyName') : undefined}>{hero?.familyName || 'Adesile.'}</span></p>
              <p className="intro__description">I build sleek, intuitive websites and apps that bring ideas to life — and scale to thousands of users.</p>
              <div className="intro__actions">
                <a href="#work" className="pill pill--dark"><Roll>Explore my work</Roll> <Arrow /></a>
                <a href="#contact" className="text-link"><Roll>Let’s talk</Roll> <Arrow /></a>
              </div>
            </div>
          </div>
          <div className="intro__baseline">
            <p><strong>7+</strong> YEARS OF BUILDING FOR THE WEB</p>
            <a href="#work">A LITTLE SCROLL, A LOT TO DISCOVER <span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </section>

      <section id="work" className="portfolio-section work-section" aria-labelledby="work-title">
        <div className="container">
          <div className="section-heading" data-reveal>
            <div><Label index="01">SELECTED WORK</Label><h2 id="work-title">A little craft.<br /><em>A lot of intention.</em></h2></div>
            <p>Thoughtful experiences,<br />from the first idea to the final detail.</p>
          </div>
          {work.length > 0 ? <div className="project-grid">
            {work.map((item, index) => {
              const isPlaceholder = /^Project (One|Two)$/i.test(item.name ?? '');
              const Tag = item.url && !isPlaceholder ? 'a' : 'div';
              return <article className={`project-card project-card--${index % 2}`} key={`${item.name}-${index}`} data-reveal data-tina-field={tinaField(page, 'work', index)}>
                <Tag className="project-card__visual" {...(item.url && !isPlaceholder ? { href: item.url, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `View ${item.name}` } : {})}>
                  <div className="project-card__top"><span>EXPLORATION / {String(index + 1).padStart(2, '0')}</span><span className="project-card__icon" aria-hidden="true">{isPlaceholder ? '+' : '↗'}</span></div>
                  <ProjectArtwork variant={index} />
                  <span className="project-card__note">CONCEPTUAL INTERFACE STUDY</span>
                </Tag>
                <div className="project-card__details">
                  <div><p className="eyebrow">{isPlaceholder ? 'CASE STUDY COMING SOON' : item.year || 'SELECTED PROJECT'}</p><h3>{item.name}</h3></div>
                  <ul className="project-card__tags">{item.tags?.filter(Boolean).map(tag => <li key={tag}>{tag}</li>)}</ul>
                </div>
                <p className="project-card__description">{isPlaceholder ? 'A space for the story behind the build. Project details and outcomes will be added here soon.' : item.description}</p>
              </article>;
            })}
          </div> : <p className="work-empty">New work is taking shape. In the meantime, explore what I’m building on GitHub.</p>}
          <a className="text-link work-link" href="https://github.com/emmaadesile" target="_blank" rel="noopener noreferrer">More on GitHub <Arrow /></a>
        </div>
      </section>

      <section id="approach" className="approach portfolio-section" aria-labelledby="approach-title">
        <Contours />
        <div className="container crosshairs">
          <Label index="02">THE WAY I BUILD</Label>
          <div className="approach__intro" data-reveal><h2 id="approach-title">Good design makes it simple.<br /><em>Good engineering keeps it that way.</em></h2><span className="approach__asterisk" aria-hidden="true">✳</span></div>
          <div className="principles">{principleList.map((item, index) => <article className="principle" key={`${item.name}-${index}`} data-reveal data-tina-field={principles.length ? tinaField(page, 'approach', index) : undefined}>
            <div className="principle__diagram" aria-hidden="true">
              <svg viewBox="0 0 280 150" fill="none">
                {index === 0 ? <><rect x="64" y="26" width="145" height="98" rx="10" /><rect x="84" y="46" width="145" height="98" rx="10" /><circle cx="135" cy="90" r="17" /><path d="M166 80h39m-39 20h25" /></> : index === 1 ? <><path d="M54 117a88 88 0 0 1 176 0M74 117a68 68 0 0 1 136 0" /><path className="diagram-accent" d="m142 117 58-65" /><circle cx="142" cy="117" r="7" /><path d="M142 26v12M62 71l11 6m149-6-11 6" /></> : <><path d="m140 19 88 44-88 44-88-44Z" /><path d="m52 83 88 44 88-44M52 103l88 44 88-44" /><path className="diagram-accent" d="m140 44 39 19-39 19-39-19Z" /></>}
              </svg>
            </div>
            <p className="eyebrow">{String(index + 1).padStart(2, '0')} / {item.name}</p><h3>{item.title}</h3><p>{item.text}</p>
          </article>)}</div>
        </div>
      </section>

      {/* One inline element: its background is laid out as one long line, so the fill moves word by word across lines. */}
      <section className="statement portfolio-section" aria-label="Statement">
        <div className="container statement__grid">
          <svg className="statement__line" viewBox="0 0 60 400" fill="none" aria-hidden="true"><path pathLength={1} d="M30 0c0 40-22 60-22 100s44 50 44 100-44 60-44 100 22 60 22 100" /></svg>
          <p className="statement__text"><span data-tina-field={tinaField(page, 'statement')}>{page.statement || defaultStatement}</span></p>
        </div>
      </section>

      <section id="about" className="about portfolio-section" aria-labelledby="about-title">
        <div className="container about__grid">
          <div className="about__identity" data-reveal>
            <Label index="03">THE PERSON BEHIND THE PIXELS</Label>
            {hero?.portrait ? <img className="about__portrait" src={hero.portrait} width="400" height="480" loading="lazy" decoding="async" alt={`${hero.givenName || 'Emmanuel'} ${hero.familyName || 'Adesile'}`} data-tina-field={tinaField(hero, 'portrait')} /> : <div className="about__monogram" aria-hidden="true"><span>e</span><span>a.</span><svg viewBox="0 0 400 400" fill="none"><ellipse cx="200" cy="200" rx="185" ry="97" transform="rotate(-40 200 200)" /></svg><span className="about__monogram-label">ALWAYS CURIOUS. ALWAYS BUILDING.</span></div>}
          </div>
          <div className="about__copy" data-reveal>
            <h2 id="about-title">An engineer’s mind.<br /><em>A maker’s instinct.</em></h2>
            <div className="prose" data-tina-field={tinaField(page, 'body')}><TinaMarkdown content={page.body} /></div>
            <div className="about__facts"><div><strong>7+</strong><span>Years of experience</span></div><div><strong>One</strong><span>Detail at a time</span></div></div>
          </div>
        </div>
      </section>

      {posts.length > 0 && <section id="writing" className="writing portfolio-section" aria-labelledby="writing-title"><div className="container">
        <div className="section-heading" data-reveal><div><Label index="04">NOTES & PERSPECTIVES</Label><h2 id="writing-title">From my <em>notebook.</em></h2></div><a href="/blog" className="text-link">All writing <Arrow /></a></div>
        <div className="writing-list">{posts.map((post, index) => <a href={`/blog/${post.id}/`} className="writing-row" key={post.id} data-reveal><span className="writing-row__index">0{index + 1}</span><div><p className="eyebrow"><time dateTime={post.data.pubDate.toISOString()}>{new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(post.data.pubDate)}</time></p><h3>{post.data.title}</h3></div><span className="writing-row__arrow" aria-hidden="true">↗</span></a>)}</div>
      </div></section>}

      <section id="contact" className="contact-section portfolio-section" aria-labelledby="contact-title"><Contours className="contours--contact" /><div className="container">
        <Label index="05">HAVE SOMETHING IN MIND?</Label>
        <div className="contact-section__main" data-reveal><h2 id="contact-title">Let’s make<br /><em>something matter.</em></h2><a className="contact-orb" href="mailto:emma2adesile@gmail.com" aria-label="Email Emmanuel"><Arrow /></a></div>
        <div className="contact-section__bottom"><p>A thoughtful product starts with a conversation.</p><a href="mailto:emma2adesile@gmail.com" className="text-link">emma2adesile@gmail.com <Arrow /></a></div>
      </div></section>
    </main>
  );
}
