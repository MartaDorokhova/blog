import { useMemo, useEffect, useState } from 'react';
import { useServerRequest } from '../../hooks';
import { PAGINATION_LIMIT } from '../../constants';
import { PostCard, Pagination, Search } from './components';
import { getLastPageFromLinks, debounce } from './utils';
import styled from 'styled-components';

const MainContainer = ({ className }) => {
	const [posts, setPosts] = useState([]);
	const [page, setPage] = useState(1);
	const [lastPage, setLastPage] = useState(1);
	const [shouldSearch, setShouldSearch] = useState(false);
	const [searchPhrase, setSearchPhrase] = useState('');

	const requestServer = useServerRequest();
	useEffect(() => {
		requestServer('fetchPosts', searchPhrase, page, PAGINATION_LIMIT).then(
			({ res: { posts, links } }) => {
				setPosts(posts);
				setLastPage(getLastPageFromLinks(links));
			},
		);
	}, [requestServer, page, shouldSearch, searchPhrase]);

	const startDelaySearch = useMemo(() => debounce(setShouldSearch, 2000), []);

	const onSearch = ({ target }) => {
		setSearchPhrase(target.value);
		startDelaySearch(!shouldSearch);
	};

	return (
		<div className={className}>
			<div className="post-and-search">
				<Search searchPhrase={searchPhrase} onChange={onSearch} />
				{posts.length > 0 ? (
					<div className="post-list">
						{posts.map(
							({ id, imageUrl, title, publishedAt, commentsCount }) => (
								<PostCard
									key={id}
									id={id}
									imageUrl={imageUrl}
									title={title}
									publishedAt={publishedAt}
									commentsCount={commentsCount}
								/>
							),
						)}
					</div>
				) : (
					<div className="no-post-found">Статьи не найдены</div>
				)}
			</div>
			{lastPage > 1 && posts.length > 0 && (
				<Pagination page={page} setPage={setPage} lastPage={lastPage} />
			)}
		</div>
	);
};

export const Main = styled(MainContainer)`
	& .post-list {
		display: flex;
		flex-wrap: wrap;
		padding: 20px 20px 80px;
	}

	& .no-post-found {
		text-align: center;
		font-size: 18px;
		margin-top: 40px;
	}

	& .post-and-search {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
`;
