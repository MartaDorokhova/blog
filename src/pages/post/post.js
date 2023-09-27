import { useEffect, useLayoutEffect, useState } from 'react';
import { useMatch, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadPostAsync, RESET_POST_DATA } from '../../actions';
import { PostContent, Comments, PostForm } from './components';
import { Error, PrivateContent } from '../../components';
import { selectPost } from '../../selectors';
import { useServerRequest } from '../../hooks';
import styled from 'styled-components';
import { ROLE } from '../../constants';

const PostContainer = ({ className }) => {
	const [error, setError] = useState(null);
	const post = useSelector(selectPost);
	const dispatch = useDispatch();
	const params = useParams();
	const [isLoading, setIsLoading] = useState(true);
	const isCreating = !!useMatch('/post');
	const isEditing = !!useMatch('/post/:id/edit');
	const requestServer = useServerRequest();

	useLayoutEffect(() => {
		dispatch(RESET_POST_DATA);
	}, [dispatch]);

	useEffect(() => {
		if (isCreating) {
			setIsLoading(false);
			return;
		}

		dispatch(loadPostAsync(requestServer, params.id)).then((postData) => {
			setError(postData.error);
			setIsLoading(false);
		});
	}, [dispatch, requestServer, params.id, isCreating]);

	if (isLoading) {
		return null;
	}

	const SpecificPostPage =
		isCreating || isEditing ? (
			<PrivateContent access={[ROLE.ADMIN]} serverError={error}>
				<div className={className}>
					<PostForm post={post} />
				</div>
			</PrivateContent>
		) : (
			<div className={className}>
				<PostContent post={post} />
				<Comments comments={post.comments} postId={post.id} />
			</div>
		);

	return error ? <Error error={error} /> : SpecificPostPage;
};

export const Post = styled(PostContainer)`
	margin: 40px 0;
	padding: 0 80px;
`;
